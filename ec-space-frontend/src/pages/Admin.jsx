import { useEffect, useState, useRef } from 'react';
import { ChevronDown, Hash, RefreshCw, Trash2, Check, DollarSign, Upload, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';
import categories from '../constants/categories';

// ── Category badge color map ──────────────────────────────────
const BADGE_CLS = {
  Plasma: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  'Kinetic / Railgun': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Laser: 'bg-red-500/15 text-red-400 border-red-500/30',
  Sonic: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Sniper: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  Melee: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  Standard: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

function CategoryBadge({ type }) {
  const cls = BADGE_CLS[type] ?? 'bg-white/10 text-white/50 border-white/20';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[9px] font-black tracking-widest uppercase ${cls}`}>
      {type}
    </span>
  );
}

function TacticalDropdown({ value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef} style={{ zIndex: isOpen ? 1000 : 1 }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: '#000000', color: '#ffffff', opacity: 1 }}
        className="flex items-center justify-between w-full border-2 border-cyan-500 rounded-lg px-3 py-2.5 text-[11px] outline-none transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] font-black"
      >
        <span className="truncate uppercase tracking-[0.12em]">{value || "SELECT"}</span>
        <ChevronDown className={`w-4 h-4 text-cyan-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          style={{ backgroundColor: '#000000', opacity: 1, border: '2px solid #22d3ee' }} 
          className="absolute z-[1001] top-full mt-2 w-full shadow-[0_20px_50px_rgba(0,0,0,1)] rounded-xl overflow-hidden"
        >
          <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
            {options.filter(c => c !== 'All').map(opt => (
              <div
                key={opt}
                onClick={() => { onChange(opt); setIsOpen(false); }}
                style={{ color: '#ffffff', backgroundColor: '#000000' }}
                className={`px-4 py-3 text-[11px] cursor-pointer flex items-center justify-between border-b border-white/5 last:border-0 hover:bg-cyan-500/30 ${value === opt ? 'bg-cyan-500/40 font-black' : ''}`}
              >
                <span className="uppercase tracking-[0.15em] font-bold">{opt}</span>
                {value === opt && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const INPUT_STYLE = 'bg-[#000000] border-2 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)] focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.6)] rounded-lg px-3 py-2 text-sm text-white outline-none transition-all w-full font-bold placeholder:text-white/40';

function FormField({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-black">{label}</label>
      {children}
    </div>
  );
}

function WeaponRow({ weapon, onEdit, onUpdate, onDelete }) {
  const [localType, setLocalType] = useState(weapon.type);
  const [dirty, setDirty] = useState(false);

  const field = (key, value) => {
    if (key === 'type') setLocalType(value);
    onEdit(weapon.id, key, value);
    setDirty(true);
  };

  return (
    <div className={`group grid grid-cols-[88px_minmax(260px,1.8fr)_minmax(170px,0.95fr)_minmax(180px,0.95fr)_minmax(150px,0.7fr)_160px] items-start gap-5 px-5 py-4 rounded-xl border-2 transition-all duration-300 ${dirty ? 'border-cyan-400 bg-black shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'border-white/10 bg-[#080808] hover:border-cyan-500/40'}`}>
      <div className="pt-0.5">
        <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-white/10">
          <img src={`http://localhost:8080/${weapon.image_url}`} className="w-full h-full object-cover" alt={weapon.name} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      </div>

      <div className="min-w-0">
        <input defaultValue={weapon.name} onChange={e => field('name', e.target.value)} className="bg-transparent border-b-2 border-white/10 focus:border-cyan-400 py-0.5 w-full mb-2 outline-none text-white font-black text-[18px] tracking-wide" />
        <textarea defaultValue={weapon.description} onChange={e => field('description', e.target.value)} rows={2} className="bg-black/40 border border-white/10 rounded px-2 py-1 w-full text-[11px] text-white outline-none resize-none" />
      </div>

      <div className="flex flex-col gap-2 pt-0.5">
        <CategoryBadge type={localType} />
        <TacticalDropdown value={localType} onChange={(val) => field('type', val)} options={categories} />
      </div>

      <div className="pt-0.5">
        <p className="font-mono text-[9px] text-cyan-400 mb-1 uppercase tracking-widest font-black">Quantity</p>
        <div className="relative">
          <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cyan-400" />
          <input type="number" placeholder={weapon.stock} onChange={e => field('stock', e.target.value)} className="bg-black border-2 border-cyan-500/50 focus:border-cyan-400 rounded-lg px-2 py-2 pl-8 w-full text-xs text-white font-black shadow-[0_0_5px_rgba(6,182,212,0.2)]" />
        </div>
      </div>

      <div className="pt-0.5">
        <p className="font-mono text-[9px] text-cyan-400 mb-1 uppercase tracking-widest font-black">Price (CR)</p>
        <div className="relative">
          <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cyan-400" />
          <input type="number" defaultValue={weapon.price} onChange={e => field('price', e.target.value)} className="bg-black border-2 border-cyan-500/50 focus:border-cyan-400 rounded-lg px-2 py-2 pl-7 w-full text-sm font-black text-white tabular-nums outline-none shadow-[0_0_5px_rgba(6,182,212,0.2)]" />
        </div>
      </div>

      <div className="w-full pt-0.5 space-y-2">
        <button 
          onClick={() => onUpdate(weapon.id)} 
          disabled={!dirty} 
          style={dirty ? { backgroundColor: '#06b6d4', color: '#ffffff', opacity: 1 } : { backgroundColor: 'transparent', color: 'rgba(255,255,255,0.2)', opacity: 0.4 }}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase rounded-lg border-2 border-cyan-300 shadow-[0_0_20px_#06b6d4] transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> SYNC DATA
        </button>
        <button 
          onClick={() => onDelete(weapon.id, weapon.name)} 
          style={{ backgroundColor: '#ef4444', color: '#ffffff', opacity: 1 }}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase rounded-lg border-2 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" /> PURGE
        </button>
      </div>
    </div>
  );
}

function Admin() {
  const [tab, setTab] = useState('weapons');
  const [weapons, setWeapons] = useState([]);
  const [editData, setEditData] = useState({});
  const [panelOpen, setPanelOpen] = useState(false);
  const [newWeapon, setNewWeapon] = useState({ name: '', type: 'Standard', price: '', stock: '', description: '', image: null });
  const [orders, setOrders] = useState([]);

  const username = localStorage.getItem('username');

  const fetchWeapons = async () => {
    try {
      const res = await api.get('/weapons');
      setWeapons(res.data);
    } catch (err) { console.error('Fetch error:', err); }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/admin/orders', { headers: { Authorization: `Bearer ${token}` } });
      setOrders(res.data);
    } catch (err) { console.error('Orders fetch error:', err); }
  };

  useEffect(() => { fetchWeapons(); }, []);
  useEffect(() => { if (tab === 'orders') fetchOrders(); }, [tab]);

  const handleUpdateWeapon = async (id) => {
    const data = editData[id];
    if (!data) return;
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v));
    try {
      const token = localStorage.getItem('token');
      await api.patch(`/admin/weapons/${id}`, fd, { headers: { Authorization: `Bearer ${token}` } });
      alert('SYSTEM UPDATED');
      setEditData(prev => { const n = {...prev}; delete n[id]; return n; });
      fetchWeapons();
    } catch (err) { alert('Update failed'); }
  };

  const handleAddWeapon = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    // เพิ่มข้อมูลลงใน FormData รวมถึงไฟล์รูปภาพ
    Object.entries(newWeapon).forEach(([k, v]) => {
      if (v !== null) fd.append(k, v);
    });

    try {
      const token = localStorage.getItem('token');
      await api.post('/admin/weapons', fd, { 
        headers: { 
          'Content-Type': 'multipart/form-data', 
          Authorization: `Bearer ${token}` 
        } 
      });
      alert('DEPLOYMENT COMPLETE');
      setNewWeapon({ name: '', type: 'Standard', price: '', stock: '', description: '', image: null });
      setPanelOpen(false);
      fetchWeapons();
    } catch (err) { alert('Deployment failed'); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`PURGE ${name}?`)) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/admin/weapons/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchWeapons();
    } catch (err) { alert('Purge failed'); }
  };

  if (username?.toLowerCase() !== 'admin') return <div className="text-white text-center pt-40 font-black tracking-tighter text-4xl">ACCESS DENIED</div>;

  return (
    <div className="min-h-screen text-white pt-24 bg-transparent overflow-x-hidden">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #06b6d4; border-radius: 10px; }
      `}</style>

      <div className="fixed top-16 left-0 w-full z-[60] flex items-center justify-between px-10 py-4 bg-black border-b-2 border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.5)]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4]"></div>
            <h1 className="text-xl font-black tracking-[0.2em] text-white uppercase">ADMIN CENTER</h1>
          </div>
          <div className="flex gap-1">
            {[{ key: 'weapons', label: 'Weapons' }, { key: 'orders', label: 'Orders' }].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={tab === t.key
                  ? { backgroundColor: '#06b6d4', color: '#ffffff', opacity: 1 }
                  : { backgroundColor: 'transparent', color: 'rgba(255,255,255,0.4)', opacity: 1 }}
                className="px-5 py-2 rounded-lg border border-cyan-500/30 text-xs font-black uppercase tracking-widest transition-all"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'weapons' && (
          <button
            onClick={() => setPanelOpen(true)}
            style={{ backgroundColor: '#06b6d4', color: '#ffffff', opacity: 1 }}
            className="px-6 py-2.5 rounded-lg border-2 border-cyan-300 text-xs font-black uppercase tracking-widest shadow-[0_0_25px_rgba(34,211,238,0.7)] transition-all active:scale-95"
          >
            + Deploy New Armament
          </button>
        )}
        {tab === 'orders' && (
          <button
            onClick={fetchOrders}
            style={{ backgroundColor: 'transparent', color: '#06b6d4', opacity: 1 }}
            className="px-6 py-2.5 rounded-lg border-2 border-cyan-500/50 text-xs font-black uppercase tracking-widest transition-all active:scale-95 hover:border-cyan-400"
          >
            ↻ Refresh
          </button>
        )}
      </div>

      {tab === 'weapons' && (
      <div className="px-10 pb-20 mt-10">
        <div className="rounded-2xl border-2 border-cyan-500/20 bg-black overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <div className="min-w-[1100px] p-6 space-y-4">
              {weapons.map(w => (
                <WeaponRow key={w.id} weapon={w} onEdit={(id, f, v) => setEditData(p => ({...p, [id]: {...p[id], [f]: v}}))} onUpdate={handleUpdateWeapon} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        </div>
      </div>
      )}

      {tab === 'orders' && (
      <div className="px-10 pb-20 mt-10">
        <div className="rounded-2xl border-2 border-cyan-500/20 bg-black overflow-hidden shadow-2xl">
          {orders.length === 0 ? (
            <div className="py-20 text-center text-white/30 font-black uppercase tracking-widest">No orders found</div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-cyan-500/20">
                    {['Order ID', 'User', 'Items', 'Total', 'Address', 'Status', 'Date'].map(h => (
                      <th key={h} className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-b border-white/5 hover:bg-cyan-500/5 transition-colors">
                      <td className="px-5 py-4 font-mono text-cyan-400 font-black">#{order.id}</td>
                      <td className="px-5 py-4">
                        <p className="text-white font-bold">{order.username}</p>
                        <p className="text-white/30 text-[10px] font-mono">UID:{order.user_id}</p>
                      </td>
                      <td className="px-5 py-4 max-w-[200px]">
                        {order.items?.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 mb-1">
                            <span className="text-white/70 text-xs">{item.weapon?.name ?? `Weapon #${item.weapon_id}`}</span>
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400">×{item.quantity}</span>
                          </div>
                        ))}
                      </td>
                      <td className="px-5 py-4 font-mono font-black text-white">
                        {Number(order.total).toLocaleString()} <span className="text-[10px] text-white/30">CR</span>
                      </td>
                      <td className="px-5 py-4 text-white/50 text-xs max-w-[160px]">
                        {order.address || <span className="text-white/20 italic">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-1 rounded text-[10px] font-black uppercase bg-green-500/20 text-green-400 border border-green-500/30">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-white/30 text-[11px] font-mono">
                        {new Date(order.created_at).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
                        <br />
                        <span className="text-white/20">{new Date(order.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      )}

      <div className={`fixed top-0 right-0 h-full w-[450px] z-[200] transition-all duration-500 ease-in-out ${panelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {panelOpen && <div className="fixed inset-0 bg-black/90 -z-10" onClick={() => setPanelOpen(false)}></div>}
        
        <div 
          style={{ backgroundColor: '#000000', opacity: 1 }} 
          className="h-full border-l-2 border-cyan-400 flex flex-col p-8 shadow-[-20px_0_100px_rgba(0,0,0,1)] overflow-y-auto custom-scrollbar"
        >
          
          <div className="flex justify-between items-center mb-10 pt-10 border-b-2 border-cyan-500/30 pb-6">
            <h2 className="text-2xl font-black text-white tracking-[0.1em] uppercase">
              NEW <span className="text-cyan-400">DEPLOYMENT</span>
            </h2>
            <button onClick={() => setPanelOpen(false)} className="text-white hover:text-cyan-400 text-3xl font-black transition-colors">✕</button>
          </div>
          
          <form onSubmit={handleAddWeapon} className="flex flex-col gap-6">
            <FormField label="Designation">
              <input type="text" className={INPUT_STYLE} value={newWeapon.name} onChange={e => setNewWeapon({...newWeapon, name: e.target.value})} placeholder="UNIT NAME..." required />
            </FormField>
            
            <FormField label="Weapon Class">
              <TacticalDropdown value={newWeapon.type} onChange={(val) => setNewWeapon({...newWeapon, type: val})} options={categories} />
            </FormField>
            
            <div className="grid grid-cols-2 gap-6">
              <FormField label="Price (CR)">
                <input type="number" className={INPUT_STYLE} value={newWeapon.price} onChange={e => setNewWeapon({...newWeapon, price: e.target.value})} placeholder="0.00" required />
              </FormField>
              <FormField label="Initial Stock">
                <input type="number" className={INPUT_STYLE} value={newWeapon.stock} onChange={e => setNewWeapon({...newWeapon, stock: e.target.value})} placeholder="0" required />
              </FormField>
            </div>
            
            <FormField label="System Specs">
              <textarea className={`${INPUT_STYLE} h-32 resize-none`} value={newWeapon.description} onChange={e => setNewWeapon({...newWeapon, description: e.target.value})} placeholder="TECHNICAL DETAILS..." />
            </FormField>

            {/* 📸 ส่วนของการอัปโหลดรูปภาพอาวุธ */}
            <FormField label="Visual Data (Blueprint)">
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setNewWeapon({...newWeapon, image: e.target.files[0]})}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`flex items-center justify-center gap-3 w-full border-2 border-dashed rounded-lg p-4 transition-all ${newWeapon.image ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/20 group-hover:border-cyan-500 group-hover:bg-white/5'}`}>
                  {newWeapon.image ? (
                    <>
                      <Check className="w-5 h-5 text-cyan-400" />
                      <span className="text-xs text-white font-bold truncate">{newWeapon.image.name}</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5 text-white/40 group-hover:text-cyan-400" />
                      <span className="text-xs text-white/40 group-hover:text-white font-black uppercase tracking-widest">Select Image Asset</span>
                    </>
                  )}
                </div>
              </div>
            </FormField>
            
            <button 
              type="submit" 
              style={{ backgroundColor: '#06b6d4', color: '#ffffff', opacity: 1 }}
              className="py-5 mt-4 rounded-xl border-2 border-cyan-300 font-black uppercase tracking-[0.25em] text-sm shadow-[0_0_40px_rgba(34,211,238,0.8)] transition-all active:scale-95 hover:shadow-[0_0_60px_rgba(34,211,238,1)]"
            >
              Confirm Initial Deployment
            </button>
          </form>
          
          <div className="mt-10 pt-6 border-t border-white/5">
            <p className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-[0.3em] text-center">Awaiting command input...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;