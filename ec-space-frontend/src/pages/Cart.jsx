import { useCart } from '../contexts/CartContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

// ── Clip-path constants ────────────────────────────────────────────────────────
const CLIP_XL = 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 100%)';
const CLIP_LG = 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)';
const CLIP_SM = 'polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 0 100%)';

// ── Decorative corner brackets ─────────────────────────────────────────────────
function CornerBrackets({ color = 'rgba(6,182,212,0.5)' }) {
  const s = { borderColor: color };
  return (
    <>
      <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 pointer-events-none" style={s} />
      <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 pointer-events-none" style={s} />
      <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 pointer-events-none" style={s} />
      <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 pointer-events-none" style={s} />
    </>
  );
}

// ── Gradient-border wrapper ────────────────────────────────────────────────────
function GradientBorder({ children, clip = CLIP_LG, pad = '1px', className = '' }) {
  return (
    <div
      className={`hud-breathe ${className}`}
      style={{
        background: 'rgba(2, 10, 18, 0.78)',
        padding: pad,
        clipPath: clip,
        border: '1px solid rgba(34, 211, 238, 0.28)',
        boxShadow: '0 0 0 1px rgba(34,211,238,0.08), 0 10px 24px rgba(0,0,0,0.35)',
      }}
    >
      {children}
    </div>
  );
}

// ── Qty button ─────────────────────────────────────────────────────────────────
function QtyBtn({ onClick, children }) {
  return (
    <GradientBorder clip={CLIP_SM} pad="1px">
      <button
        onClick={onClick}
        className="hud-btn w-9 h-9 flex items-center justify-center !text-cyan-200 text-xl font-black !bg-[#060a12] transition-all hover:!bg-cyan-500/20 active:scale-90"
        style={{ clipPath: CLIP_SM }}
      >
        {children}
      </button>
    </GradientBorder>
  );
}

// ── Blinking dot ───────────────────────────────────────────────────────────────
function BlinkDot({ color = 'bg-green-400' }) {
  return <span className={`blink w-1.5 h-1.5 rounded-full inline-block ${color}`} />;
}

// ── Main component ─────────────────────────────────────────────────────────────
function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const totalPrice = cart.reduce(
    (sum, item) => sum + Number(item.price) * (Number(item.quantity) || 1),
    0
  );

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const orderData = {
        total: totalPrice,
        items: cart.map(item => ({ weapon_id: item.id, quantity: item.quantity })),
      };
      const response = await api.post('/orders', orderData);
      if (response.status === 200) {
        alert('✅ ' + response.data.message);
        window.dispatchEvent(new Event('profileUpdated'));
        clearCart();
        navigate('/history');
      }
    } catch (error) {
      alert('❌ สั่งซื้อไม่สำเร็จ: ' + (error.response?.data?.error || 'ระบบขัดข้อง'));
    }
  };

  return (
    <div
      className="min-h-screen px-6 md:px-10 lg:px-12 pt-28 pb-14 text-white"
      style={{
        backgroundImage:
          'linear-gradient(rgba(6,182,212,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.025) 1px, transparent 1px)',
        backgroundSize: '44px 44px',
      }}
    >

      {/* ── Keyframes & HUD utilities ── */}
      <style>{`
        @keyframes hud-breathe {
          0%, 100% { filter: drop-shadow(0 0 4px #06b6d4aa) drop-shadow(0 0 10px #3b82f688); }
          50%       { filter: drop-shadow(0 0 14px #06b6d4) drop-shadow(0 0 28px #3b82f6aa); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.1; }
        }
        @keyframes scan {
          0%   { background-position: 0 -200%; }
          100% { background-position: 0 400%; }
        }
        @keyframes scan-vertical {
          0%   { transform: translateY(-120%); opacity: 0; }
          10%  { opacity: 0.35; }
          90%  { opacity: 0.35; }
          100% { transform: translateY(120%); opacity: 0; }
        }
        .hud-breathe  { animation: hud-breathe 3s ease-in-out infinite; }
        .blink        { animation: blink 1.5s step-end infinite; }
        .chromatic    { transition: text-shadow .15s; }
        .chromatic:hover { text-shadow: -2px 0 2px #ff004077, 2px 0 2px #00ffff77; }
        .hud-btn:hover   { filter: drop-shadow(0 0 6px #06b6d4); }
        .hud-scan {
          background: linear-gradient(180deg,
            transparent 0%, rgba(6,182,212,.04) 50%, transparent 100%);
          background-size: 100% 40%;
          animation: scan 5s linear infinite;
          pointer-events: none;
        }
        .queue-scan-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 46px;
          background: linear-gradient(180deg,
            transparent 0%, rgba(6,182,212,0.08) 45%, rgba(6,182,212,0.2) 50%, rgba(6,182,212,0.08) 55%, transparent 100%);
          animation: scan-vertical 6.5s linear infinite;
          pointer-events: none;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">

        {/* ── Page header ── */}
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] text-cyan-500/50 tracking-widest mb-1">
              // MODULE: ACQUISITION_QUEUE
            </p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase leading-none">
              <span className="text-white">XENO</span>{' '}
              <span className="text-cyan-400">ARMORY</span>{' '}
              <span className="text-white/30">CART</span>
            </h2>
          </div>

          {/* Mini status panel */}
          <div
            className="px-4 py-2 !bg-black/55 backdrop-blur-md text-right font-mono text-[9px] text-slate-500 leading-relaxed"
            style={{ border: '1px solid rgba(6,182,212,0.25)', clipPath: CLIP_SM }}
          >
            <p>COORD X:447.23 / Y:882.10</p>
            <p className="flex items-center gap-1.5 justify-end mt-0.5">
              <BlinkDot />
              SYS.STATUS: ONLINE
            </p>
          </div>
        </div>

        {/* ── Empty state ── */}
        {cart.length === 0 ? (
          <GradientBorder clip={CLIP_XL} className="shadow-[0_0_20px_rgba(6,182,212,0.16)]">
            <div
              className="relative p-20 text-center !bg-black/50 backdrop-blur-xl border border-cyan-500/30 overflow-hidden"
              style={{ clipPath: CLIP_XL }}
            >
              <div className="queue-scan-line" />
              <CornerBrackets color="rgba(34,211,238,0.7)" />

              <span className="absolute top-3 left-4 font-mono text-[9px] tracking-widest text-slate-500/70 uppercase">
                Scan_Freq: 144Hz
              </span>
              <span className="absolute top-3 right-4 font-mono text-[9px] tracking-widest text-slate-500/70 uppercase">
                Buffer_ID: Null
              </span>
              <span className="absolute bottom-3 left-4 font-mono text-[9px] tracking-widest text-slate-500/70 uppercase">
                Sweep_Mode: Passive
              </span>
              <span className="absolute bottom-3 right-4 font-mono text-[9px] tracking-widest text-slate-500/70 uppercase">
                Noise: -62dB
              </span>

              <p className="relative z-10 font-mono text-[15px] text-cyan-200 uppercase tracking-widest font-black drop-shadow-[0_0_8px_rgba(34,211,238,0.25)]">
                [ STATUS: QUEUE EMPTY ]
              </p>
              <p className="relative z-10 mt-3 font-mono text-[11px] text-slate-300/85 uppercase tracking-widest">
                NO ARMAMENTS DETECTED IN ACQUISITION BUFFER
              </p>
            </div>
          </GradientBorder>

        ) : (
          <div className="space-y-8 pb-24">

            {/* ── Cart items ── */}
            <div className="space-y-3">
              {cart.map((item, index) => {
                const currentQty = Number(item.quantity) || 1;
                return (
                  <GradientBorder key={item.id} clip={CLIP_LG}>
                    {/* Inner card */}
                    <div
                      className="relative flex items-center gap-6 p-5 !bg-black/55 backdrop-blur-md border border-cyan-500/20 overflow-hidden"
                      style={{ clipPath: CLIP_LG }}
                    >
                      {/* Scan-line overlay */}
                      <div className="hud-scan absolute inset-0" />

                      <CornerBrackets />

                      {/* UID tag */}
                      <span className="absolute top-2 right-3 font-mono text-[9px] text-slate-500 tracking-wider">
                        UID:{String(item.id).padStart(4, '0')} // SLOT_{String(index + 1).padStart(2, '0')}
                      </span>

                      {/* Weapon image */}
                      <div
                        className="flex-shrink-0 overflow-hidden"
                        style={{
                          width: 144, height: 96,
                          clipPath: CLIP_SM,
                          border: '1px solid rgba(6,182,212,0.25)',
                        }}
                      >
                        <img
                          src={`http://localhost:8080/${item.image_url}`}
                          className="w-full h-full object-cover"
                          alt={item.name}
                        />
                      </div>

                      {/* Name + unit price */}
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-[9px] text-cyan-400/55 tracking-widest mb-0.5">
                          DESIGNATION
                        </p>
                        <h4 className="font-black text-xl text-white uppercase tracking-tight truncate">
                          {item.name}
                        </h4>
                        <p className="font-mono text-xs text-slate-300/85 mt-1">
                          UNIT:{' '}
                          <span className="chromatic text-cyan-300 font-bold">
                            {Number(item.price).toLocaleString()} CR
                          </span>
                        </p>
                      </div>

                      {/* Qty controls */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <QtyBtn
                          onClick={() => {
                            if (currentQty - 1 >= 1) updateQuantity(item.id, currentQty - 1);
                            else if (window.confirm('Remove this item?')) removeFromCart(item.id);
                          }}
                        >
                          −
                        </QtyBtn>
                        <div className="w-10 text-center font-mono font-black text-xl text-cyan-100 tabular-nums">
                          {currentQty}
                        </div>
                        <QtyBtn onClick={() => updateQuantity(item.id, currentQty + 1)}>
                          +
                        </QtyBtn>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right w-36 flex-shrink-0">
                        <p className="font-mono text-[9px] text-slate-500 tracking-widest">SUBTOTAL</p>
                        <p className="chromatic font-mono text-2xl font-black text-cyan-300 italic tabular-nums">
                          {(Number(item.price) * currentQty).toLocaleString()}
                        </p>
                        <p className="font-mono text-[9px] text-cyan-500/70">CR</p>
                      </div>
                    </div>
                  </GradientBorder>
                );
              })}
            </div>

            {/* ── Checkout panel ── */}
            <GradientBorder clip={CLIP_XL} className="mt-10">
              <div
                className="relative p-8 !bg-black/60 backdrop-blur-md border border-cyan-500/25 overflow-hidden"
                style={{ clipPath: CLIP_XL }}
              >
                <div className="hud-scan absolute inset-0" />
                <CornerBrackets color="rgba(6,182,212,0.7)" />

                <p className="font-mono text-[9px] text-cyan-500/30 tracking-widest mb-6">
                  // TRANSACTION_SUMMARY :: AWAITING_AUTHORIZATION :: {cart.length} ITEM(S) QUEUED
                </p>

                <div className="flex flex-col md:flex-row items-center justify-between gap-8">

                  {/* Total readout */}
                  <div>
                    <p className="font-mono text-xs text-slate-500 uppercase tracking-widest mb-1">
                      Total Payment
                    </p>
                    <p className="chromatic text-5xl md:text-6xl font-black text-white italic tracking-tighter tabular-nums">
                      {totalPrice.toLocaleString()}
                      <span className="text-cyan-400 text-2xl not-italic ml-2 font-bold">CR</span>
                    </p>
                    <p className="font-mono text-[10px] text-slate-700 mt-2">
                      TAX: 0.00 // NET: {totalPrice.toLocaleString()} CR
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                    <p className="font-mono text-[9px] text-slate-500 flex items-center gap-1.5">
                      <BlinkDot />
                      SYSTEM: READY
                    </p>

                    {/* Gradient-border confirm button */}
                    <div
                      className="w-full md:w-80 shadow-[0_0_18px_rgba(34,211,238,0.22)]"
                      style={{
                        background: 'linear-gradient(90deg, #06b6d4, #3b82f6)',
                        padding: '2px',
                        clipPath:
                          'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 100%)',
                      }}
                    >
                      <button
                        onClick={handleCheckout}
                        className="hud-btn w-full py-5 font-black text-xl uppercase italic tracking-tighter !text-cyan-100 transition-all hover:!bg-cyan-500/20 active:scale-95 !bg-[#04080f]"
                        style={{
                          clipPath:
                            'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 100%)',
                        }}
                      >
                        Confirm Purchase
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </GradientBorder>

          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
