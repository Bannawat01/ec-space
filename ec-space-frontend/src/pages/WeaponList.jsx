import { useEffect, useState } from 'react';
import api from '../api';
import { useCart } from '../CartContext'; 

function WeaponList() {
  const { addToCart } = useCart(); 
  const [weapons, setWeapons] = useState([]);

  useEffect(() => {
    const fetchWeapons = async () => {
      try {
        const response = await api.get('/weapons');
        setWeapons(response.data);
      } catch (error) {
        console.error("ดึงข้อมูลไม่สำเร็จ:", error);
      }
    };
    fetchWeapons();
  }, []);

  return (
    <div className="bg-slate-950 min-h-screen p-10"> 
      <h1 className="text-4xl font-black text-white mb-10 flex items-center gap-3 tracking-tighter">
        <span className="text-cyan-500">🚀</span> XENO ARMORY INVENTORY
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {weapons.map((w) => (
          <div key={w.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl hover:border-cyan-500/50 transition-all group">
            <div className="relative overflow-hidden">
              <img 
                src={`http://localhost:8080/${w.image_url}`}
                className={`w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500 ${w.stock <= 0 ? 'grayscale opacity-50' : ''}`} 
                alt={w.name}
              />
              <div className="absolute top-4 right-4 bg-cyan-500 text-black text-xs font-black px-3 py-1 rounded-full uppercase">
                {w.type}
              </div>
              
              {/* 🛑 ป้ายแจ้งเตือนสินค้าหมด */}
              {w.stock <= 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <span className="text-red-500 border-2 border-red-500 px-4 py-2 font-black uppercase tracking-tighter rotate-[-10deg]">Out of Stock</span>
                </div>
              )}
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {w.name}
                </h3>
                {/* 📦 แสดงจำนวนคงเหลือ */}
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${w.stock > 0 ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                  Stock: {w.stock}
                </span>
              </div>
              
              <p className="text-slate-400 text-sm leading-relaxed mb-6 h-12 overflow-hidden">
                {w.description}
              </p>
              
              <div className="flex justify-between items-center mb-6 bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                <span className="text-slate-500 text-xs uppercase font-bold tracking-widest">Price</span>
                <div className="text-right">
                  <span className="text-2xl font-mono font-black text-cyan-400">
                    {Number(w.price).toLocaleString()}
                  </span>
                  <span className="ml-1 text-xs text-cyan-600 font-bold uppercase">Cr</span>
                </div>
              </div>

              {/* 🛠️ ปุ่มสั่งซื้อที่มีการเช็ค Stock */}
              <button 
                onClick={() => {
                  addToCart(w); 
                  alert(`เพิ่ม ${w.name} ลงในตะกร้าแล้ว!`);
                }}
                disabled={w.stock <= 0}
                className={`w-full font-black py-4 rounded-xl shadow-lg transition-all uppercase tracking-widest text-sm
                  ${w.stock > 0 
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-900/20 active:scale-95' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'}`}
              >
                {w.stock > 0 ? 'สั่งซื้ออาวุธชิ้นนี้' : 'สินค้าหมดชั่วคราว'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeaponList;