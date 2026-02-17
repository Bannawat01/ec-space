import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from './CartContext';
import api from './api';

function Navbar() {
  const { cart } = useCart();
  const [credits, setCredits] = useState(0);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const location = useLocation();

  const fetchProfile = async () => {
    if (!token) return;
    try {
      const res = await api.get('/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCredits(res.data.credits);
    } catch (error) {
      console.error("ดึงข้อมูล Profile ไม่สำเร็จ", error);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchProfile();
    })();
  }, [token, location.pathname]);

  return (
    <nav className="flex justify-between items-center p-6 bg-slate-950/90 border-b border-slate-900 sticky top-0 z-50 backdrop-blur-md">
      {/* โลโก้ฝั่งซ้าย */}
      <Link to="/" className="text-2xl font-black text-cyan-400 italic tracking-tighter group">
        XENO <span className="text-white group-hover:text-cyan-400 transition-all duration-300">ARMORY</span>
      </Link>

      <div className="flex items-center gap-6">
        {token && (
          <>
            {/* 💰 แสดงยอดเงินเครดิต */}
            <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-xl border border-cyan-500/20 shadow-[0_0_15px_rgba(8,145,178,0.05)]">
              <div className="flex flex-col items-end leading-none">
                <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Universal Credit</span>
                <span className="text-cyan-400 font-mono font-bold text-sm">
                  {credits.toLocaleString()} <span className="text-[10px] text-cyan-800">CR</span>
                </span>
              </div>
              <button onClick={fetchProfile} className="text-slate-600 hover:text-cyan-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h5M20 20v-5h-5" />
                  <path d="M20.488 9A9 9 0 1015.512 20.488" />
                </svg>
              </button>
            </div>

            {/* 🆕 ปุ่ม RECHARGE (เติมเงิน) */}
            <Link 
              to="/topup" 
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-[10px] font-black tracking-widest uppercase
                ${location.pathname === '/topup' 
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                  : 'text-cyan-500 border-cyan-500/30 hover:bg-cyan-500/10'}`}
            >
              <span className="text-lg leading-none">+</span> Recharge
            </Link>

            {/* 🆕 ปุ่ม HISTORY (ประวัติ) */}
            <Link 
              to="/history" 
              className="text-slate-400 hover:text-white text-[10px] font-black tracking-widest uppercase transition-colors"
            >
              History
            </Link>
          </>
        )}

        {/* 🛒 ตะกร้าสินค้า */}
        <Link to="/cart" className="relative group p-2">
          <span className={`text-xs font-black uppercase tracking-widest transition-colors ${location.pathname === '/cart' ? 'text-cyan-400' : 'text-white group-hover:text-cyan-400'}`}>
            Inventory
          </span>
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg shadow-red-900/50 animate-bounce">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </Link>

        {role === 'admin' && (
          <Link to="/admin" className="text-slate-400 hover:text-white text-[10px] font-black tracking-widest uppercase border-l border-slate-800 pl-6">
            Admin Core
          </Link>
        )}
        
        {token ? (
          <button 
            onClick={() => { localStorage.clear(); window.location.href = '/login'; }} 
            className="text-red-500 hover:text-red-400 font-black uppercase text-[10px] tracking-widest bg-red-500/5 px-4 py-2 rounded-lg border border-red-500/20 transition-all"
          >
            Disconnect
          </button>
        ) : (
          <Link to="/login" className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-lg font-black text-xs tracking-widest transition-all">
            Authorize
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;