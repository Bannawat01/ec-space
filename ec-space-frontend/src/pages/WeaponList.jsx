import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import categories from '../constants/categories';

function WeaponList() {
  const [weapons, setWeapons] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

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
  // ใช้วิธีเจาะจงความสูงและล้างสีพื้นหลัง
  <div className="relative min-h-screen w-full bg-transparent p-10 pt-24">
    <h1 className="text-4xl font-black mb-6 text-white italic drop-shadow-2xl">
       XENO ARMORY <span className="text-cyan-400">INVENTORY</span>
    </h1>
    <div className="mb-6">
      <div className="mb-4 max-w-xl">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search weapons by name..."
          className="search-input"
        />
      </div>
      <div className="flex gap-3 items-center overflow-x-auto py-2">
        {categories.map(cat => (
          <button key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`btn-pill transition-all ${selectedCategory===cat ? 'btn-pill--active' : 'btn-pill--muted'}`}>
            {cat}
          </button>
        ))}
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {weapons
        .filter(w => selectedCategory==='All' ? true : (w.type || 'Uncategorized')===selectedCategory)
        .filter(w => searchQuery.trim() === '' ? true : (w.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
        .map((weapon) => (
        <Link to={`/weapon/${weapon.id}`} key={weapon.id} className="group relative z-50 pointer-events-auto" onClick={() => console.debug('Weapon card clicked', weapon.id)}>
          {/* ใช้พื้นหลังดำโปร่งแสง (bg-black/40) และ Blur (backdrop-blur) */}
          <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-cyan-500/50 transition-all shadow-2xl pointer-events-auto">
            <img src={`http://localhost:8080/${weapon.image_url}`} className="w-full h-64 object-cover" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-block bg-white/5 text-slate-200 text-[12px] font-bold px-3 py-1 rounded-full border border-white/5">{weapon.type || 'Uncategorized'}</span>
              </div>
               <h3 className="text-xl font-bold uppercase text-white">{weapon.name}</h3>
               <div className="mt-4 bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                  <span className="text-cyan-400 font-mono text-xl">{weapon.price.toLocaleString()} CR</span>
               </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  </div>
);
}

export default WeaponList;