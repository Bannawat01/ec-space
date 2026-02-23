import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// ── Constants ─────────────────────────────────────────────────────────────────

const PRESETS = [
  { label: 'PKG-01', value: 100 },
  { label: 'PKG-02', value: 500 },
  { label: 'PKG-03', value: 1_000 },
  { label: 'PKG-04', value: 2_500 },
  { label: 'PKG-05', value: 5_000 },
  { label: 'PKG-06', value: 10_000 },
];

const SESSION_SECS = 300; // 5 minutes

// Stable pseudo-random QR pattern seeded by txId.
const buildQRPattern = (txId, size = 14) =>
  Array.from({ length: size * size }, (_, i) => {
    const c = txId.charCodeAt(i % txId.length);
    return (c * 31 + i * 17) % 5 !== 0;
  });

const genTxID = () =>
  'TX-' +
  Array.from({ length: 12 }, () => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('');

// ── Sub-components ────────────────────────────────────────────────────────────

function CornerBrackets({ size = 'w-4 h-4', color = 'border-cyan-400/50' }) {
  return (
    <>
      <span className={`absolute top-0 left-0 ${size} border-t-2 border-l-2 ${color} pointer-events-none`} />
      <span className={`absolute top-0 right-0 ${size} border-t-2 border-r-2 ${color} pointer-events-none`} />
      <span className={`absolute bottom-0 left-0 ${size} border-b-2 border-l-2 ${color} pointer-events-none`} />
      <span className={`absolute bottom-0 right-0 ${size} border-b-2 border-r-2 ${color} pointer-events-none`} />
    </>
  );
}

function BlinkDot({ color = 'bg-green-400' }) {
  return <span className={`blink w-1.5 h-1.5 rounded-full inline-block flex-shrink-0 ${color}`} />;
}

// Simulated (non-scannable) QR visual
function QRVisual({ txId }) {
  const SIZE = 14;
  const pattern = buildQRPattern(txId, SIZE);

  // Overlay fixed corner finder patterns (top-left, top-right, bottom-left)
  const isFinderCell = (row, col) => {
    const inBlock = (r, c, or, oc) =>
      r >= or && r < or + 7 && c >= oc && c < oc + 7;
    return (
      inBlock(row, col, 0, 0) ||
      inBlock(row, col, 0, SIZE - 7) ||
      inBlock(row, col, SIZE - 7, 0)
    );
  };

  const finderFilled = (row, col) => {
    const inRing = (r, c, or, oc) => {
      const dr = r - or, dc = c - oc;
      const outer = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
      const inner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
      return outer && (dr === 0 || dr === 6 || dc === 0 || dc === 6 || inner);
    };
    return (
      inRing(row, col, 0, 0) ||
      inRing(row, col, 0, SIZE - 7) ||
      inRing(row, col, SIZE - 7, 0)
    );
  };

  return (
    <div
      className="grid gap-[2.5px] p-3 bg-white rounded-lg"
      style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)`, width: 164, height: 164 }}
    >
      {pattern.map((filled, i) => {
        const row = Math.floor(i / SIZE);
        const col = i % SIZE;
        const isFinder = isFinderCell(row, col);
        const show = isFinder ? finderFilled(row, col) : filled;
        return (
          <div
            key={i}
            className="rounded-[1px]"
            style={{ background: show ? '#0e7490' : 'transparent' }}
          />
        );
      })}
    </div>
  );
}

// Stage step indicator
function StepBar({ stage }) {
  const steps = [
    { key: 'SELECT',  label: 'AMOUNT' },
    { key: 'PAYMENT', label: 'AUTHORIZE' },
  ];
  const idx = steps.findIndex(s => s.key === stage);

  return (
    <div className="flex items-center gap-3 justify-center mb-8">
      {steps.map((s, i) => {
        const done    = i < idx;
        const current = i === idx;
        return (
          <div key={s.key} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center text-[10px] font-black transition-all ${
                  current ? 'bg-cyan-500/30 border-cyan-400/70 text-cyan-300' :
                  done    ? 'bg-cyan-500/15 border-cyan-600/40 text-cyan-600' :
                            'bg-white/5 border-white/10 text-slate-700'
                }`}
              >
                {done ? '✓' : i + 1}
              </div>
              <span
                className={`font-mono text-[10px] tracking-widest uppercase ${
                  current ? 'text-cyan-400' : done ? 'text-cyan-700' : 'text-slate-700'
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-10 h-px ${done ? 'bg-cyan-700' : 'bg-white/10'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

function Topup() {
  const navigate = useNavigate();

  const [stage,     setStage]     = useState('SELECT');   // SELECT | PAYMENT
  const [selected,  setSelected]  = useState(null);       // preset value or null
  const [custom,    setCustom]    = useState('');
  const [timeLeft,  setTimeLeft]  = useState(SESSION_SECS);
  const [txStatus,  setTxStatus]  = useState('idle');     // idle | loading | success | error
  const [statusMsg, setStatusMsg] = useState('');
  const [txId]                    = useState(genTxID);

  const timerRef = useRef(null);

  const amount = selected ?? (Number(custom) || 0);

  // ── Countdown ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== 'PAYMENT') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setStage('SELECT');
          setTimeLeft(SESSION_SECS);
          return SESSION_SECS;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [stage]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // Colour shifts red as timer runs down
  const timerColor =
    timeLeft > 180 ? '#06b6d4' : timeLeft > 60 ? '#f59e0b' : '#ef4444';

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleProceed = () => {
    if (amount <= 0) return;
    setTxStatus('idle');
    setStatusMsg('');
    setTimeLeft(SESSION_SECS);
    setStage('PAYMENT');
  };

  const handleBack = () => {
    clearInterval(timerRef.current);
    setTxStatus('idle');
    setStatusMsg('');
    setStage('SELECT');
  };

  const handleConfirm = async () => {
    setTxStatus('loading');
    setStatusMsg('PROCESSING TRANSFER — AWAITING CONFIRMATION...');
    try {
      const token = localStorage.getItem('token');
      await api.post('/topup', { amount }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      clearInterval(timerRef.current);
      setTxStatus('success');
      setStatusMsg(`+${amount.toLocaleString()} CR DEPOSITED SUCCESSFULLY`);
      window.dispatchEvent(new Event('profileUpdated'));
      setTimeout(() => navigate('/profile'), 2200);
    } catch (err) {
      setTxStatus('error');
      setStatusMsg(err.response?.data?.error || 'TRANSFER FAILED — UPLINK ERROR');
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 text-white"
      style={{
        backgroundImage:
          'linear-gradient(rgba(6,182,212,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.025) 1px, transparent 1px)',
        backgroundSize: '44px 44px',
      }}
    >

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(6,182,212,0.35), inset 0 0 8px rgba(6,182,212,0.08); }
          50%       { box-shadow: 0 0 26px rgba(6,182,212,0.65), inset 0 0 14px rgba(6,182,212,0.18); }
        }
        @keyframes scan-down {
          0%   { transform: translateY(-120%); opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translateY(320%);  opacity: 0; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.1; }
        }
        @keyframes btn-charge {
          0%   { width: 0%;   opacity: 0.6; }
          60%  { width: 75%;  opacity: 1;   }
          100% { width: 100%; opacity: 0;   }
        }
        .pulse-glow { animation: pulse-glow 2.5s ease-in-out infinite; }
        .blink      { animation: blink 1.3s step-end infinite; }
        .scan-down  {
          position: absolute; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, transparent, rgba(6,182,212,0.7) 40%, rgba(34,211,238,0.9) 50%, rgba(6,182,212,0.7) 60%, transparent);
          animation: scan-down 3.5s ease-in-out infinite;
          pointer-events: none; z-index: 10;
        }
        .btn-bar::after {
          content: '';
          position: absolute; bottom: 0; left: 0; height: 2px;
          background: linear-gradient(90deg, #06b6d4, #3b82f6, #06b6d4);
          animation: btn-charge 1.8s ease-in-out infinite;
          border-radius: 0 0 12px 12px;
        }
      `}</style>

      <div className="w-full max-w-md">

        {/* Page title */}
        <div className="mb-6 text-center">
          <p className="font-mono text-[10px] text-cyan-500/45 tracking-widest mb-1">
            // MODULE: CREDIT_ACQUISITION_TERMINAL
          </p>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
            Replenish <span className="text-cyan-400">Credits</span>
          </h1>
        </div>

        {/* Step bar */}
        <StepBar stage={stage} />

        {/* Card */}
        <div className="relative bg-black/60 backdrop-blur-3xl border border-cyan-500/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.55),0_0_0_1px_rgba(6,182,212,0.06)] overflow-hidden">
          <CornerBrackets />

          {/* Meta row */}
          <div className="flex items-center justify-between px-5 pt-4 pb-0">
            <span className="font-mono text-[8px] text-slate-700 tracking-widest">{txId}</span>
            <div className="flex items-center gap-1.5">
              <BlinkDot />
              <span className="font-mono text-[8px] text-slate-700 tracking-widest uppercase">UPLINK SECURE</span>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              STAGE: SELECT AMOUNT
          ════════════════════════════════════════════════════════════════ */}
          {stage === 'SELECT' && (
            <div className="p-5 space-y-5">

              {/* Bento preset grid */}
              <div>
                <p className="font-mono text-[9px] text-slate-600 uppercase tracking-[0.2em] mb-2.5">
                  // SELECT CREDIT PACKAGE
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {PRESETS.map(({ label, value }) => {
                    const active = selected === value;
                    return (
                      <button
                        key={value}
                        onClick={() => { setSelected(value); setCustom(''); }}
                        className={`relative px-2 py-4 rounded-xl border font-mono text-center transition-all duration-150 ${
                          active
                            ? 'bg-cyan-500/20 border-cyan-400/55 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                            : 'bg-white/[0.03] border-white/8 hover:border-cyan-500/30 hover:bg-cyan-950/20'
                        }`}
                      >
                        {active && (
                          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        )}
                        <span className={`block text-[8px] tracking-widest mb-1 ${active ? 'text-cyan-600' : 'text-slate-700'}`}>
                          {label}
                        </span>
                        <span className={`font-black text-sm tabular-nums ${active ? 'text-cyan-300' : 'text-slate-400'}`}>
                          {value.toLocaleString()}
                        </span>
                        <span className={`text-[9px] ml-0.5 ${active ? 'text-cyan-600' : 'text-slate-700'}`}>CR</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom input */}
              <div>
                <p className="font-mono text-[9px] text-slate-600 uppercase tracking-[0.2em] mb-2">
                  // CUSTOM AMOUNT
                </p>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter amount..."
                    value={custom}
                    onChange={e => { setCustom(e.target.value); setSelected(null); }}
                    className="w-full bg-white/5 border border-white/10 focus:border-cyan-500/50 rounded-xl px-4 py-3 font-mono text-lg text-cyan-300 outline-none transition-colors placeholder:text-white/15 tabular-nums"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10px] text-cyan-700 tracking-widest">CR</span>
                </div>
              </div>

              {/* Amount readout */}
              <div
                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                  amount > 0
                    ? 'bg-cyan-950/25 border-cyan-500/20'
                    : 'bg-white/[0.02] border-white/5'
                }`}
              >
                <span className="font-mono text-[9px] text-slate-600 uppercase tracking-widest">TRANSFER AMOUNT</span>
                <span className={`font-mono font-black text-xl tabular-nums ${amount > 0 ? 'text-cyan-300' : 'text-slate-700'}`}>
                  {amount > 0 ? `${amount.toLocaleString()} CR` : '—'}
                </span>
              </div>

              {/* Proceed button */}
              <button
                onClick={handleProceed}
                disabled={amount <= 0}
                className={`relative overflow-hidden btn-bar w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] ${
                  amount > 0
                    ? 'pulse-glow bg-cyan-500/20 border border-cyan-500/45 text-cyan-300 hover:bg-cyan-500/30 cursor-pointer'
                    : 'bg-white/5 border border-white/8 text-white/20 cursor-not-allowed'
                }`}
              >
                {amount > 0 ? 'PROCEED TO PAYMENT →' : 'SELECT AMOUNT TO CONTINUE'}
              </button>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              STAGE: PAYMENT / AUTHORIZE
          ════════════════════════════════════════════════════════════════ */}
          {stage === 'PAYMENT' && (
            <div className="p-5 space-y-4">

              {/* Session timer */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[9px] text-slate-600 uppercase tracking-widest">SESSION EXPIRES</span>
                  <span
                    className="font-mono text-xs font-black tabular-nums transition-colors"
                    style={{ color: timerColor }}
                  >
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${(timeLeft / SESSION_SECS) * 100}%`, backgroundColor: timerColor }}
                  />
                </div>
              </div>

              {/* QR panel */}
              <div className="relative overflow-hidden rounded-xl border border-cyan-500/20 bg-black/40">
                <div className="scan-down" />
                <CornerBrackets color="border-cyan-400/40" />

                <div className="px-4 pt-4 pb-1">
                  <p className="font-mono text-[8px] text-cyan-500/40 tracking-widest uppercase">
                    // PROMPTPAY ACQUISITION NODE
                  </p>
                </div>

                {/* QR + meta */}
                <div className="flex items-center gap-4 px-4 pb-4 pt-3">
                  <QRVisual txId={txId} />

                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="space-y-1.5">
                      {[
                        { label: 'AMOUNT',   value: `${amount.toLocaleString()} CR`, highlight: true },
                        { label: 'REF',      value: txId.slice(3, 11) + '...', highlight: false },
                        { label: 'NETWORK',  value: null, dot: true },
                        { label: 'ENC',      value: 'AES-256', highlight: false },
                      ].map(({ label, value, highlight, dot }) => (
                        <div key={label} className="flex justify-between items-center px-2.5 py-1.5 bg-white/[0.03] rounded-lg">
                          <span className="font-mono text-[8px] text-slate-600 uppercase tracking-widest">{label}</span>
                          {dot ? (
                            <div className="flex items-center gap-1">
                              <BlinkDot />
                              <span className="font-mono text-[9px] text-green-400">SECURE</span>
                            </div>
                          ) : (
                            <span className={`font-mono text-[10px] font-bold tabular-nums truncate ${highlight ? 'text-cyan-300' : 'text-slate-400'}`}>
                              {value}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status area */}
              {txStatus !== 'idle' && (
                <div
                  className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border font-mono text-xs tracking-wide transition-all ${
                    txStatus === 'loading' ? 'bg-cyan-950/40 border-cyan-500/25 text-cyan-300' :
                    txStatus === 'success' ? 'bg-green-950/40 border-green-500/25 text-green-400' :
                                            'bg-red-950/40  border-red-500/25  text-red-400'
                  }`}
                >
                  <span className={`text-base leading-none flex-shrink-0 ${txStatus === 'loading' ? 'blink' : ''}`}>
                    {txStatus === 'loading' ? '◉' : txStatus === 'success' ? '✓' : '✗'}
                  </span>
                  <span className="leading-relaxed">{statusMsg}</span>
                </div>
              )}

              {/* Action row */}
              <div className="flex gap-2.5">
                <button
                  onClick={handleBack}
                  disabled={txStatus === 'loading' || txStatus === 'success'}
                  className="flex-none px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-black text-xs uppercase tracking-wider hover:border-white/20 hover:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                >
                  ← Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={txStatus === 'loading' || txStatus === 'success'}
                  className={`relative overflow-hidden btn-bar flex-1 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] ${
                    txStatus === 'loading' || txStatus === 'success'
                      ? 'bg-white/5 border border-white/8 text-white/25 cursor-not-allowed'
                      : 'pulse-glow bg-cyan-500/20 border border-cyan-500/45 text-cyan-300 hover:bg-cyan-500/30 cursor-pointer'
                  }`}
                >
                  {txStatus === 'loading' ? 'PROCESSING...' : 'CONFIRM TRANSFER'}
                </button>
              </div>

              {/* History link */}
              <p className="text-center pt-1">
                <a
                  href="/history"
                  className="font-mono text-[9px] text-slate-700 hover:text-cyan-600 transition-colors tracking-widest uppercase"
                >
                  View Transaction History →
                </a>
              </p>
            </div>
          )}

          {/* Footer meta */}
          <div className="flex items-center justify-between px-5 pb-3 pt-0">
            <span className="font-mono text-[8px] text-slate-800 tracking-widest">XENO ARMORY FINANCIAL SYSTEM v2.0</span>
            <span className="font-mono text-[8px] text-slate-800 tracking-widest">256-BIT SECURED</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Topup;
