import { useEffect, useState } from 'react';
import { ChevronDown, Hash, RefreshCw, Trash2 } from 'lucide-react';
import api from '../services/api';
import categories from '../constants/categories';

// ── Category badge color map ──────────────────────────────────────────────────
const BADGE_CLS = {
  Rifle:    'bg-amber-500/15  text-amber-400  border-amber-500/30',
  Pistol:   'bg-blue-500/15   text-blue-400   border-blue-500/30',
  Sniper:   'bg-purple-500/15 text-purple-400 border-purple-500/30',
  Shotgun:  'bg-red-500/15    text-red-400    border-red-500/30',
  SMG:      'bg-green-500/15  text-green-400  border-green-500/30',
  Melee:    'bg-cyan-500/15   text-cyan-400   border-cyan-500/30',
  Standard: 'bg-slate-500/15  text-slate-400  border-slate-500/30',
};

function CategoryBadge({ type }) {
  const cls = BADGE_CLS[type] ?? 'bg-white/10 text-white/50 border-white/20';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[9px] font-black tracking-widest uppercase ${cls}`}>
      {type}
    </span>
  );
}

// ── Status pill ───────────────────────────────────────────────────────────────
const PILL_CLS = {
  cyan:  'bg-cyan-950/60  border-cyan-500/20  text-cyan-400',
  green: 'bg-green-950/60 border-green-500/20 text-green-400',
  amber: 'bg-amber-950/60 border-amber-500/20 text-amber-400',
};

function StatusPill({ label, value, color = 'cyan' }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-[11px] ${PILL_CLS[color]}`}>
      <span className="text-white/30 uppercase tracking-widest">{label}</span>
      <span className="font-black">{value}</span>
    </div>
  );
}

// ── Labelled form field ───────────────────────────────────────────────────────
function FormField({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-600">
        {label}
      </label>
      {children}
    </div>
  );
}

const INPUT =
  'bg-white/5 border border-white/10 focus:border-cyan-500/50 rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors w-full placeholder:text-white/20';

// ── Weapon row ────────────────────────────────────────────────────────────────
function WeaponRow({ weapon, onEdit, onUpdate, onDelete }) {
  const [localType, setLocalType] = useState(weapon.type);
  const [dirty, setDirty] = useState(false);

  const field = (key, value) => {
    if (key === 'type') setLocalType(value);
    onEdit(weapon.id, key, value);
    setDirty(true);
  };

  return (
    <div
      className={`group grid grid-cols-[88px_minmax(260px,1.8fr)_minmax(170px,0.95fr)_minmax(180px,0.95fr)_minmax(120px,0.6fr)_160px] items-start gap-5 px-5 py-4 rounded-xl border transition-all duration-200 ${
        dirty
          ? 'border-cyan-400/55 bg-cyan-950/20 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.3),0_0_18px_rgba(34,211,238,0.12)]'
          : 'border-white/10 bg-black/35 hover:border-cyan-500/40 hover:bg-cyan-950/15 hover:backdrop-blur-md'
      }`}
    >

      {/* Visual */}
      <div className="pt-0.5">
        <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-white/5 group-hover:border-cyan-500/25 transition-all duration-300">
          <img
            src={`http://localhost:8080/${weapon.image_url}`}
            className="w-full h-full object-cover"
            alt={weapon.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      </div>

      {/* Designation + description */}
      <div className="min-w-0">
        <input
          defaultValue={weapon.name}
          onChange={e => field('name', e.target.value)}
          className="bg-transparent border-b border-white/10 focus:border-cyan-500/60 py-0.5 w-full mb-2 outline-none text-white font-black text-[18px] tracking-wide transition-colors"
        />
        <textarea
          defaultValue={weapon.description}
          onChange={e => field('description', e.target.value)}
          rows={2}
          className="bg-black/20 border border-white/10 focus:border-cyan-500/35 rounded px-2 py-1 w-full text-[11px] text-slate-400 outline-none resize-none transition-colors"
        />
      </div>

      {/* Category */}
      <div className="flex flex-col gap-2 pt-0.5">
        <CategoryBadge type={localType} />
        <div className="relative w-full max-w-[150px]">
          <select
            defaultValue={weapon.type}
            onChange={e => field('type', e.target.value)}
            className="tactical-select appearance-none !bg-slate-900 !text-cyan-100 border !border-cyan-500/50 focus:!border-cyan-300 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.25),0_0_14px_rgba(34,211,238,0.25)] rounded px-2 pr-8 py-1.5 text-[11px] outline-none w-full transition-all"
          >
            {categories.filter(c => c !== 'All').map(c => (
              <option
                key={c}
                value={c}
                className="tactical-option !bg-slate-950 !text-cyan-100"
                style={{ backgroundColor: '#0f172a', color: '#cffafe' }}
              >
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cyan-300/80" />
        </div>
      </div>

      {/* Inventory */}
      <div className="pt-0.5">
        <p className="font-mono text-[10px] text-cyan-300/80 mb-1 uppercase tracking-wider">
          Cur Qty: <span className={`font-black ${weapon.stock < 5 ? 'text-red-400' : 'text-white'}`}>{weapon.stock}</span>
        </p>
        <label className="font-mono text-[9px] uppercase tracking-[0.15em] text-cyan-300/70 mb-1.5 block">
          New Qty
        </label>
        <div className="relative w-28">
          <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cyan-300/80 pointer-events-none" />
          <input
            type="number"
            placeholder="0"
            onChange={e => field('stock', e.target.value)}
            className="bg-black/60 border border-white/15 focus:border-cyan-500/55 rounded px-2 py-1.5 pl-8 w-full text-xs outline-none text-white placeholder:text-cyan-200/40 tabular-nums transition-colors"
          />
        </div>
      </div>

      {/* Price */}
      <div className="pt-1">
        <p className="font-mono font-black text-cyan-300 text-lg leading-none tabular-nums">
          {Number(weapon.price).toLocaleString()}
        </p>
        <p className="font-mono text-[10px] text-cyan-400/80 tracking-[0.22em] mt-1">CR</p>
      </div>

      {/* Actions */}
      <div className="w-full min-w-[160px] pt-0.5">
        <div className="flex flex-col gap-2 items-stretch">
          <button
            onClick={() => onUpdate(weapon.id)}
            disabled={!dirty}
            className={`inline-flex items-center justify-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg border transition-all ${
              dirty
                ? '!bg-cyan-500/20 !text-cyan-100 !border-cyan-300/70 hover:!bg-cyan-400/35 hover:!text-white hover:shadow-[0_0_18px_rgba(34,211,238,0.55)] cursor-pointer'
                : '!bg-slate-800/75 !text-slate-300/70 !border-slate-600/70 cursor-not-allowed'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync Unit
          </button>
          <button
            onClick={() => onDelete(weapon.id, weapon.name)}
            className="inline-flex items-center justify-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg border !border-red-400/60 !bg-red-500/20 !text-red-100 hover:!bg-red-500/85 hover:!text-white hover:!border-red-300 transition-all shadow-[0_0_0_1px_rgba(248,113,113,0.25)] hover:shadow-[0_0_16px_rgba(248,113,113,0.45)]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Danger Purge
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function Admin() {
  const [weapons, setWeapons]   = useState([]);
  const [editData, setEditData] = useState({});
  const [panelOpen, setPanelOpen] = useState(false);
  const [ping]  = useState(() => Math.floor(Math.random() * 28) + 8);
  const [newWeapon, setNewWeapon] = useState({
    name: '', type: 'Standard', price: '', stock: '', description: '', image: null,
  });

  const username = localStorage.getItem('username');

  const fetchWeapons = async () => {
    try {
      const res = await api.get('/weapons');
      setWeapons(res.data);
    } catch (err) {
      console.error('ดึงข้อมูลไม่สำเร็จ:', err);
    }
  };

  useEffect(() => { fetchWeapons(); }, []);

  const handleAddWeapon = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(newWeapon).forEach(([k, v]) => v && fd.append(k, v));
    try {
      const token = localStorage.getItem('token');
      await api.post('/admin/weapons', fd, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      alert('เพิ่มสำเร็จ!');
      setNewWeapon({ name: '', type: 'Standard', price: '', stock: '', description: '', image: null });
      fetchWeapons();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || 'Error'));
    }
  };

  const handleUpdateWeapon = async (id) => {
    const data = editData[id];
    if (!data || !Object.keys(data).length) return alert('ไม่มีข้อมูลการเปลี่ยนแปลง');
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v));
    try {
      const token = localStorage.getItem('token');
      await api.patch(`/admin/weapons/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      alert('อัปเดตสำเร็จ!');
      fetchWeapons();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || 'Error'));
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`PURGE: ${name}?`)) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/admin/weapons/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchWeapons();
    } catch (err) {
      alert('ลบไม่สำเร็จ: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEditField = (id, field, value) => {
    setEditData(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  // ── Access denied ─────────────────────────────────────────────────────────
  if (username?.toLowerCase() !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[80vh] text-white">
        <div className="p-10 bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl text-center">
          <h1 className="text-3xl font-black mb-2 tracking-tight">⚠ ACCESS DENIED</h1>
          <p className="text-white/40 font-mono text-xs tracking-widest">
            COMMANDER "admin" CREDENTIALS REQUIRED
          </p>
        </div>
      </div>
    );
  }

  const totalStock = weapons.reduce((s, w) => s + (w.stock || 0), 0);

  return (
    <div
      className="min-h-screen text-white pt-16"
      style={{
        backgroundImage:
          'linear-gradient(rgba(6,182,212,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.025) 1px, transparent 1px)',
        backgroundSize: '44px 44px',
      }}
    >
      <style>{`
        .tactical-select {
          background-color: #0f172a !important;
          color: #cffafe !important;
        }
        .tactical-select option,
        .tactical-option {
          background-color: #0f172a !important;
          color: #cffafe !important;
        }
      `}</style>
      {/* ══ Top Command Bar ════════════════════════════════════════════════════ */}
      <div className="sticky top-16 z-40 flex items-center justify-between px-8 py-3 bg-black/80 backdrop-blur-xl border-b border-cyan-500/15 shadow-[0_6px_20px_rgba(0,0,0,0.35)]">

        {/* Left: branding */}
        <div className="flex items-center gap-5">
          <div>
            <p className="font-mono text-[8px] text-cyan-500/40 tracking-[0.25em] uppercase">
              // Tactical Command
            </p>
            <h1 className="text-lg font-black tracking-tighter leading-none mt-0.5">
              SYSTEM <span className="text-cyan-400">CORE</span>
            </h1>
          </div>

          <div className="w-px h-8 bg-white/8" />

          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono text-[10px] text-slate-500 tracking-widest">UPLINK ACTIVE</span>
          </div>
        </div>

        {/* Right: status pills + deploy toggle */}
        <div className="flex items-center gap-2">
          <StatusPill label="Units"  value={weapons.length}             color="cyan"  />
          <StatusPill label="Stock"  value={totalStock.toLocaleString()} color="green" />
          <StatusPill label="Ping"   value={`${ping}ms`}                color="amber" />

          <div className="w-px h-6 bg-white/8 mx-1" />

          <button
            onClick={() => setPanelOpen(p => !p)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-[11px] font-black uppercase tracking-wider transition-all duration-200 ${
              panelOpen
                ? '!bg-cyan-500/25 !border-cyan-400/70 !text-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.35)]'
                : '!bg-slate-800/80 !border-slate-500/70 !text-slate-100 hover:!border-cyan-400/50 hover:!text-cyan-200 hover:!bg-slate-700/80'
            }`}
          >
            <span className="text-sm leading-none">{panelOpen ? '✕' : '+'}</span>
            Deploy New
          </button>
        </div>
      </div>

      {/* ══ Layout: Grid + Side Panel ══════════════════════════════════════════ */}
      <div className="flex">

        {/* ── Weapon Data Grid ──────────────────────────────────────────────── */}
        <div
          className="flex-1 px-8 pb-8 pt-14 transition-all duration-500 min-w-0"
          style={{ marginRight: panelOpen ? 360 : 0 }}
        >
          <p className="font-mono text-[9px] text-slate-500 uppercase tracking-[0.22em] mb-5">
            // ARMAMENT_REGISTRY — {weapons.length} UNIT{weapons.length !== 1 ? 'S' : ''} ON RECORD
          </p>

          <div className="rounded-2xl border border-cyan-500/15 bg-black/35 backdrop-blur-md overflow-hidden shadow-[0_10px_28px_rgba(0,0,0,0.35)]">
            <div className="overflow-x-auto">
              <div className="min-w-[1080px]">
                <div className="grid grid-cols-[88px_minmax(260px,1.8fr)_minmax(170px,0.95fr)_minmax(180px,0.95fr)_minmax(120px,0.6fr)_160px] gap-5 px-5 py-3 bg-cyan-500/[0.03] border-b border-cyan-500/15">
                  {['Visual', 'Designation', 'Category', 'Inventory', 'Price', 'Actions'].map(h => (
                    <p
                      key={h}
                      className="font-mono text-[9px] uppercase tracking-[0.22em] text-slate-400"
                    >
                      {h}
                    </p>
                  ))}
                </div>

                <div className="p-3 space-y-2">
                  {weapons.map(w => (
                    <WeaponRow
                      key={w.id}
                      weapon={w}
                      onEdit={handleEditField}
                      onUpdate={handleUpdateWeapon}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            </div>

            {weapons.length === 0 && (
              <div className="py-20 text-center">
                <p className="font-mono text-xs text-slate-700 uppercase tracking-widest">
                  [ NO UNITS IN REGISTRY ]
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Collapsible Deploy Panel ───────────────────────────────────────── */}
        <div
          className="fixed top-0 right-0 h-full w-[360px] z-30 transition-transform duration-500 ease-in-out"
          style={{ transform: panelOpen ? 'translateX(0)' : 'translateX(100%)' }}
        >
          {/* Glassmorphism panel */}
          <div className="h-full bg-black/75 backdrop-blur-2xl border-l border-white/5 flex flex-col overflow-y-auto">

            {/* Panel header */}
            <div className="px-6 pt-[72px] pb-5 border-b border-white/5 flex-shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[8px] text-cyan-500/40 tracking-[0.2em] uppercase mb-1">
                    // new_unit_deployment
                  </p>
                  <h2 className="text-base font-black tracking-tight">
                    DEPLOY <span className="text-cyan-400">ARMAMENT</span>
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  className="!bg-slate-800/80 !border !border-slate-500/60 !text-slate-100 hover:!bg-slate-700/80 hover:!border-cyan-400/50 hover:!text-cyan-200 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAddWeapon} className="p-6 flex flex-col gap-5 flex-1">
              <FormField label="Designation (Name)">
                <input
                  type="text"
                  className={INPUT}
                  placeholder="e.g. Plasma Rifle MkIV"
                  value={newWeapon.name}
                  onChange={e => setNewWeapon({ ...newWeapon, name: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Category">
                <div className="flex flex-col gap-2">
                  <CategoryBadge type={newWeapon.type} />
                  <div className="relative">
                    <select
                      className={`${INPUT} tactical-select appearance-none h-11 text-sm pr-9 !bg-slate-900 !text-cyan-100 !border-cyan-500/50 focus:!border-cyan-300 focus:shadow-[0_0_0_2px_rgba(34,211,238,0.25),0_0_16px_rgba(34,211,238,0.3)]`}
                      value={newWeapon.type}
                      onChange={e => setNewWeapon({ ...newWeapon, type: e.target.value })}
                    >
                      {categories.filter(c => c !== 'All').map(c => (
                        <option
                          key={c}
                          value={c}
                          className="tactical-option !bg-slate-950 !text-cyan-100"
                          style={{ backgroundColor: '#0f172a', color: '#cffafe' }}
                        >
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-300/85" />
                  </div>
                </div>
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Price (CR)">
                  <input
                    type="number"
                    className={INPUT}
                    placeholder="0"
                    value={newWeapon.price}
                    onChange={e => setNewWeapon({ ...newWeapon, price: e.target.value })}
                    required
                  />
                </FormField>
                <FormField label="Stock Units">
                  <input
                    type="number"
                    className={INPUT}
                    placeholder="0"
                    value={newWeapon.stock}
                    onChange={e => setNewWeapon({ ...newWeapon, stock: e.target.value })}
                    required
                  />
                </FormField>
              </div>

              <FormField label="Tactical Description">
                <textarea
                  className={`${INPUT} h-20 resize-none`}
                  placeholder="Field notes, combat specs..."
                  value={newWeapon.description}
                  onChange={e => setNewWeapon({ ...newWeapon, description: e.target.value })}
                />
              </FormField>

              <FormField label="Weapon Visual">
                <label className="flex items-center gap-3 px-3 py-2.5 bg-white/5 border border-white/10 hover:border-cyan-500/40 rounded-lg cursor-pointer transition-colors">
                  <span className="text-cyan-500 text-base leading-none">⬆</span>
                  <span className="text-xs text-slate-500 truncate flex-1">
                    {newWeapon.image ? newWeapon.image.name : 'Select image file...'}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={e => setNewWeapon({ ...newWeapon, image: e.target.files[0] })}
                    required
                  />
                </label>
              </FormField>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/5" />
                <span className="font-mono text-[8px] text-slate-700 tracking-widest uppercase">
                  confirm deploy
                </span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              <button
                type="submit"
                className="py-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-black text-sm uppercase tracking-widest hover:bg-cyan-500/25 hover:border-cyan-500/60 transition-all active:scale-95"
              >
                Deploy Armament
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Admin;
