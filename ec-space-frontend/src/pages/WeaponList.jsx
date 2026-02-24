import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import categories from '../constants/categories';
import { useLanguage } from '../contexts/LanguageContext';

function WeaponList() {
  const [weapons, setWeapons] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { t } = useLanguage();

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
    <div className="min-h-screen bg-transparent">

      {/* ===== HERO BANNER ===== */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: '420px' }}>
        {/* Background glow effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-black/60 to-black/80 z-0" />
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px] z-0" />
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[100px] z-0" />

        {/* Content */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-10 md:px-20 pt-28 pb-12 gap-8">

          {/* Left: Text */}
          <div className="flex flex-col items-start text-left max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">{t('Live Inventory Active')}</span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white mb-4 leading-none">
              {t('XENO')} <span className="text-cyan-400" style={{ textShadow: '0 0 40px rgba(6,182,212,0.6)' }}>{t('ARMORY')}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-white/40 text-sm md:text-base font-medium tracking-widest uppercase mb-8 max-w-xl">
              {t('Advanced Weapons & Equipment for the Modern Operative')}
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6 md:gap-12 mb-8">
              {[
                { label: t('Weapons'), value: weapons.length > 0 ? weapons.length : '—' },
                { label: t('Categories'), value: '7' },
                { label: t('In Stock'), value: weapons.length > 0 ? weapons.filter(w => w.stock > 0).length : '—' },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span className="text-2xl font-black text-cyan-400 font-mono italic">{stat.value}</span>
                  <span className="text-[10px] text-white/30 uppercase tracking-[0.2em]">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* CTA button */}
            <a
              href="#inventory"
              className="px-8 py-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white font-black uppercase tracking-widest text-xs transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_50px_rgba(6,182,212,0.7)]"
            >
              {t('Browse Arsenal')} →
            </a>
          </div>

          {/* Right: Banner Image */}
          <div className="relative flex-shrink-0 w-full md:w-auto">
            <div className="absolute inset-0 rounded-2xl bg-cyan-500/10 blur-2xl scale-110" />
            <img
              src="/banner.png"
              alt="Xeno Armory Banner"
              className="relative z-10 w-full md:w-[420px] lg:w-[500px] object-contain drop-shadow-[0_0_40px_rgba(6,182,212,0.5)]"
            />
          </div>

        </div>

        {/* Bottom divider */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
      </div>

      {/* ===== INVENTORY SECTION ===== */}
      <div id="inventory" className="p-10 pt-10">
      <h1 className="text-4xl font-black mb-6 text-white italic uppercase tracking-tighter">
        {t('XENO ARMORY')} <span className="text-cyan-400">{t('INVENTORY')}</span>
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
            {t(cat)}
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
                      {t('OUT OF STOCK')}
                    </div>
                  )}

                  <img src={`http://localhost:8080/${weapon.image_url}`} className="w-full h-56 object-cover" alt={weapon.name} />
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-[10px] text-cyan-400 font-black uppercase mb-1">{t(weapon.type)}</p>
                        <h3 className="text-xl font-bold text-white uppercase">{t(weapon.name)}</h3>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-1 rounded ${isOutOfStock ? 'bg-red-500/20 text-red-500' : 'bg-cyan-500/20 text-cyan-400'}`}>
                        {isOutOfStock ? t('SOLD OUT') : `${t('STOCK')}: ${weapon.stock}`}
                      </span>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                      <span className="font-mono text-xl font-black text-cyan-400 italic">
                        {Number(weapon.price).toLocaleString()} <span className="text-[10px] not-italic text-white/50">{t('CR')}</span>
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
            <p className="!text-white/30 font-black uppercase tracking-widest text-xl">{t('No weapons found in this category')}</p>
          </div>
        )}
      </div>
      </div> {/* end #inventory */}
    </div>
  );
}

export default WeaponList;