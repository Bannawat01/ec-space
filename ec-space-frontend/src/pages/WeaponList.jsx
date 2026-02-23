import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
// นำเข้า categories ที่คุณเพิ่งแก้ไข
import categories from '../constants/categories'; 

function WeaponList() {
  const [weapons, setWeapons] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All'); // เก็บหมวดหมู่ที่เลือก

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

  // กรองอาวุธตามหมวดหมู่ที่เลือก
  const filteredWeapons = weapons.filter(weapon => 
    selectedCategory === 'All' ? true : weapon.type === selectedCategory
  );

  return (
    <div className="p-10 pt-24 min-h-screen bg-transparent">
      <h1 className="text-4xl font-black mb-6 text-white italic uppercase tracking-tighter">
        XENO ARMORY <span className="text-cyan-400">INVENTORY</span>
      </h1>

      {/* --- ส่วนแสดงหมวดหมู่ (Category Bar) --- */}
      <div className="flex flex-wrap gap-3 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2 rounded-full font-white text-xs uppercase tracking-widest transition-all
              ${selectedCategory === cat 
                ? 'bg-cyan-500 !text-white shadow-[0_0_20px_rgba(6,182,212,0.6)] border-2 border-cyan-300' 
                : 'bg-white/5 !text-white/50 border border-white/10 hover:bg-white/10 hover:!text-white'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* --- ส่วนแสดงรายการอาวุธที่ถูกกรองแล้ว --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredWeapons.length > 0 ? (
          filteredWeapons.map((weapon) => {
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
                  className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-cyan-500/50 flex flex-col h-full shadow-2xl"
                >
                  {isOutOfStock && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-full bg-red-600/90 text-white text-center py-2 font-black uppercase italic rotate-[-15deg] border-y-2 border-white shadow-[0_0_20px_rgba(255,0,0,0.5)]">
                      OUT OF STOCK
                    </div>
                  )}

                  <img src={`http://localhost:8080/${weapon.image_url}`} className="w-full h-56 object-cover" alt={weapon.name} />
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-[10px] text-cyan-400 font-black uppercase mb-1">{weapon.type}</p>
                        <h3 className="text-xl font-bold text-white uppercase">{weapon.name}</h3>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-1 rounded ${isOutOfStock ? 'bg-red-500/20 text-red-500' : 'bg-cyan-500/20 text-cyan-400'}`}>
                        {isOutOfStock ? 'SOLD OUT' : `STOCK: ${weapon.stock}`}
                      </span>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                      <span className="font-mono text-xl font-black text-cyan-400 italic">
                        {Number(weapon.price).toLocaleString()} <span className="text-[10px] not-italic text-white/50">CR</span>
                      </span>
                      <span className="text-white/20 group-hover:text-cyan-400 transition-colors">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
         
          <div className="col-span-full py-20 text-center">
            <p className="!text-white/30 font-black uppercase tracking-widest text-xl">No weapons found in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WeaponList;