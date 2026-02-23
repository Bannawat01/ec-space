import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';

function Navbar() {
  const [credits, setCredits] = useState(0);
  const [units, setUnits] = useState(0);
  const username = localStorage.getItem('username');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (username) {
      api.get('/profile')
        .then(res => setCredits(res.data.credits || 0))
        .catch(() => setCredits(0));
    }
    // Listen for profile updates from other parts of the app (topup / checkout)
    const fetchProfile = () => {
      if (!username) return;
      api.get('/profile')
        .then(res => setCredits(res.data.credits || 0))
        .catch(() => setCredits(0));
    };

    window.addEventListener('profileUpdated', fetchProfile);

    return () => {
      window.removeEventListener('profileUpdated', fetchProfile);
    };
  }, [username]);

  useEffect(() => {
    const syncUnits = () => {
      try {
        const raw = localStorage.getItem('cart');
        const parsed = raw ? JSON.parse(raw) : [];
        const list = Array.isArray(parsed) ? parsed : [];
        const total = list.reduce((sum, item) => sum + (Number(item.quantity || 1) || 0), 0);
        setUnits(total);
      } catch {
        setUnits(0);
      }
    };

    syncUnits();
    window.addEventListener('storage', syncUnits);
    window.addEventListener('cartUpdated', syncUnits);

    return () => {
      window.removeEventListener('storage', syncUnits);
      window.removeEventListener('cartUpdated', syncUnits);
    };
  }, []);

  const linkCls = (active) =>
    `whitespace-nowrap px-3 py-1.5 rounded-md border text-[11px] font-bold uppercase tracking-[0.2em] transition-all ${active
      ? 'text-cyan-300 border-cyan-400/40 bg-cyan-500/10 shadow-[0_0_10px_rgba(34,211,238,0.35)]'
      : 'text-white/80 border-transparent hover:text-cyan-300 hover:border-cyan-500/30 hover:bg-cyan-500/5'}`;

  const adminCls = (active) =>
    `whitespace-nowrap px-3 py-1.5 rounded-md border text-[11px] font-black uppercase tracking-[0.2em] transition-all ${active
      ? 'text-red-300 border-red-400/60 bg-red-500/15 shadow-[0_0_12px_rgba(248,113,113,0.45)]'
      : 'text-red-400/90 border-red-500/35 hover:bg-red-500/15 hover:text-red-300'}`;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-6 lg:px-8 py-3">
      <div className="flex justify-between items-center gap-x-8 max-w-full mx-auto">
        <div className="flex items-center gap-x-4 min-w-0">
          <Link to="/" className="text-2xl font-black italic tracking-tighter hover:text-cyan-400 transition-all whitespace-nowrap flex-shrink-0">
            XENO <span className="text-cyan-400">ARMORY</span>
          </Link>
          <div className="hidden md:flex items-center gap-2 whitespace-nowrap flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Uplink Active</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-x-4 min-w-0">
          <Link to="/inventory" className={linkCls(location.pathname === '/' || location.pathname === '/inventory')}>Inventory</Link>
          {username && (
            <>
              <Link to="/topup" className={linkCls(location.pathname === '/topup')}>Credits</Link>
              <Link to="/history" className={linkCls(location.pathname === '/history')}>History</Link>
              {username.toLowerCase() === 'admin' && (
                <Link to="/admin" className={adminCls(location.pathname === '/admin')}>Admin Panel</Link>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-x-4 min-w-0">
          {username ? (
            <>
              <div className="hidden lg:flex items-center gap-x-2 whitespace-nowrap rounded-md border border-cyan-500/25 bg-cyan-500/10 px-3 py-1.5">
                <span className="text-[9px] uppercase tracking-[0.2em] text-slate-300">Units</span>
                <span className="text-xs font-black text-cyan-300">{units}</span>
              </div>
              <div className="hidden lg:flex items-center gap-x-2 whitespace-nowrap rounded-md border border-cyan-500/25 bg-cyan-500/10 px-3 py-1.5">
                <span className="text-[9px] uppercase tracking-[0.2em] text-slate-300">Credits</span>
                <span className="text-xs font-black text-cyan-300">{credits.toLocaleString()} PTS</span>
              </div>

              <Link to="/cart" className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.2em] text-white/85 hover:text-cyan-300 transition-colors">Cart</Link>
              <Link to="/profile" className="hidden sm:block whitespace-nowrap text-[11px] font-black uppercase tracking-[0.2em] text-white/85 hover:text-cyan-300 transition-colors">{username}</Link>

              <button
                onClick={() => {
                  localStorage.clear();
                  navigate('/login');
                  window.location.reload();
                }}
                className="!bg-transparent !text-red-300 !border-2 !border-red-400/80 px-4 py-1.5 rounded-lg font-black uppercase tracking-[0.22em] transition-all hover:!bg-red-500/20 hover:shadow-[0_0_14px_rgba(248,113,113,0.45)] active:scale-95 text-[11px] whitespace-nowrap flex-shrink-0"
              >
                Exit
              </button>
            </>
          ) : (
            <Link to="/login" className="!bg-cyan-500 px-6 py-2 rounded-full font-black hover:!bg-cyan-400 whitespace-nowrap flex-shrink-0 text-black">Authorize</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;