import { Link } from 'react-router-dom';

function Navbar() {
  const username = localStorage.getItem('username');

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/5 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-black text-white italic tracking-tighter">
          XENO <span className="text-cyan-400">ARMORY</span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link to="/" className="text-white/70 hover:text-cyan-400 text-xs font-bold uppercase tracking-widest transition-all">Inventory</Link>
          <Link to="/cart" className="text-white/70 hover:text-cyan-400 text-xs font-bold uppercase tracking-widest transition-all">Cart</Link>
          
          {username ? (
            <div className="flex items-center gap-4">
              <span className="text-cyan-400 font-bold text-xs uppercase italic">{username}</span>
              <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="text-red-400 text-[10px] font-black uppercase">Exit</button>
            </div>
          ) : (
            <Link to="/login" className="bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-white border border-cyan-500/50 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all">
              Authorize
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;