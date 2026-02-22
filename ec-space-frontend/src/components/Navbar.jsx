import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';

function Navbar() {
  const [credits, setCredits] = useState(0);
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

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

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/10 border-b border-white/10 px-8 py-4">
      <div className="flex justify-between items-center max-w-full mx-auto">
        <Link to="/" className="text-2xl font-black italic tracking-tighter hover:text-cyan-400 transition-all">
          XENO <span className="text-cyan-400">ARMORY</span>
        </Link>
        
        <div className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em]">
          <Link to="/" className="hover:text-cyan-400">Inventory</Link>
          
          {username && (
            <>
              <Link to="/topup" className="text-cyan-400 hover:text-white border border-cyan-400/30 px-3 py-1 rounded">Top Up</Link>
              <Link to="/history" className="hover:text-cyan-400">History</Link>
              
              {/* ตรวจสอบถ้าชื่อเป็น admin ให้โชว์เมนู Admin */}
              {username.toLowerCase() === 'admin' && (
                <Link to="/admin" className="text-red-500 border border-red-500/30 px-3 py-1 rounded hover:bg-red-500 hover:text-white transition-all">
                  Admin Panel
                </Link>
              )}

              <div className="flex flex-col items-end border-l border-white/20 pl-6">
                <span className="text-[8px] text-white/40 tracking-widest">Credits</span>
                <span className="text-sm text-cyan-400 italic font-black">{credits.toLocaleString()} PTS</span>
              </div>
            </>
          )}

          <Link to="/cart" className="hover:text-cyan-400">Cart</Link>

          {username ? (
            <div className="flex items-center gap-4 border-l border-white/20 pl-6">
              <Link to="/profile" className="text-white italic hover:text-cyan-400">{username}</Link>
              <button onClick={() => { localStorage.clear(); navigate('/login'); window.location.reload(); }} className="text-white/40 hover:text-red-500 font-black">EXIT</button>
            </div>
          ) : (
            <Link to="/login" className="bg-cyan-500 px-6 py-2 rounded-full font-black hover:bg-cyan-400">Authorize</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;