import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function WeaponList() {
  const [weapons, setWeapons] = useState([]);

  useEffect(() => {
    const fetchWeapons = async () => {
      try {
        const response = await api.get('/weapons'); //
        setWeapons(response.data);
      } catch (error) {
        console.error("ดึงข้อมูลไม่สำเร็จ:", error);
      }
    };
    fetchWeapons();
  }, []);

  return (
    <div className="p-10 pt-24 min-h-screen bg-transparent">
      <h1 className="text-4xl font-black mb-10 text-white italic uppercase tracking-tighter">
        XENO ARMORY <span className="text-cyan-400">INVENTORY</span>
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {weapons.map((weapon) => {
          // ✅ เช็คสต็อกที่ถูกหักจาก Backend จริงๆ
          const isOutOfStock = weapon.stock <= 0; 

          return (
            <Link 
              to={isOutOfStock ? "#" : `/weapon/${weapon.id}`} 
              key={weapon.id} 
              className={`relative group ${isOutOfStock ? 'cursor-not-allowed' : ''}`}
              onClick={(e) => isOutOfStock && e.preventDefault()}
            >
              <div 
                style={{
                  filter: isOutOfStock ? 'grayscale(1) brightness(0.5)' : 'none',
                  transition: 'all 0.4s ease'
                }}
                className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-cyan-500/50 flex flex-col h-full"
              >
                {/* ป้าย Sold Out */}
                {isOutOfStock && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-full bg-red-600/90 text-white text-center py-2 font-black uppercase italic rotate-[-15deg] border-y-2 border-white shadow-[0_0_20px_rgba(255,0,0,0.5)]">
                    OUT OF STOCK
                  </div>
                )}

                <img src={`http://localhost:8080/${weapon.image_url}`} className="w-full h-56 object-cover" alt={weapon.name} />
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white uppercase">{weapon.name}</h3>
                    <span className={`text-[10px] font-black px-2 py-1 rounded ${isOutOfStock ? 'bg-red-500/20 text-red-500' : 'bg-cyan-500/20 text-cyan-400'}`}>
                      {isOutOfStock ? 'SOLD OUT' : `STOCK: ${weapon.stock}`}
                    </span>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="font-mono text-xl font-black text-cyan-400 italic">
                      {Number(weapon.price).toLocaleString()} <span className="text-[10px] not-italic">CR</span>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default WeaponList;