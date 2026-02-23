import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';

function WeaponDetail() {
  const { id } = useParams();
  const [weapon, setWeapon] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/weapons`)
      .then(res => {
        const found = res.data.find(w => String(w.id) === String(id));
        if (found) setWeapon(found);
        else navigate(-1);
      })
      .catch(err => console.error("Error fetching weapons:", err));
  }, [id, navigate]);

  if (!weapon) return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="text-cyan-400 font-mono text-2xl animate-pulse tracking-tighter">
        SCANNING SCHEMATIC...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent p-10 flex items-center justify-center">
      <div className="max-w-6xl w-full bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[3rem] overflow-hidden flex flex-col md:flex-row gap-12 p-12 shadow-2xl">
        <div className="md:w-1/2">
          <img 
            src={`http://localhost:8080/${weapon.image_url}`} 
            className="w-full h-auto rounded-[2.5rem] object-cover shadow-2xl border border-white/5" 
            alt={weapon.name}
          />
        </div>
        <div className="md:w-1/2 flex flex-col justify-center text-left">
          {/* ปรับสีปุ่ม Return ให้สว่างขึ้น */}
          <button onClick={() => navigate(-1)} className="text-cyan-400 text-xs font-bold mb-4 uppercase tracking-widest hover:text-cyan-200 transition-colors">← Return to Armory</button>
          <h1 className="text-6xl font-black italic text-white mb-4 uppercase tracking-tighter leading-none">{weapon.name}</h1>
          
          {/* ✅ เปลี่ยนจาก slate-400 เป็น slate-300 เพื่อให้อ่านออกบนพื้นหลังดำ */}
          <p className="text-slate-300 text-lg mb-8 leading-relaxed">{weapon.description}</p>
          
          <div className="bg-white/5 p-8 rounded-3xl border border-white/5 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-5xl font-mono text-cyan-400 font-black tracking-tighter">
                {weapon.price?.toLocaleString()} <span className="text-xl">CR</span>
              </span>
              {/* ✅ เปลี่ยนจาก slate-500 เป็น slate-300 ให้เห็นสต็อกชัดๆ */}
              <div className="text-sm text-slate-300 mt-2 font-bold uppercase tracking-widest">Available Stock: {weapon.stock ?? 'N/A'}</div>
            </div>
            
            <div className="flex items-center gap-4 bg-black/40 p-2 rounded-2xl border border-white/5">
  {/* ➖ ปุ่มลดจำนวน (Minus) */}
  <button
    onClick={() => setQuantity(q => Math.max(1, q - 1))}
    disabled={quantity <= 1}
    style={{ 
      color: 'white',
      backgroundColor: 'transparent',
      border: '2px solid #06b6d4',
      fontWeight: '900',
      boxShadow: quantity <= 1 ? 'none' : '0 0 10px #06b6d4', // ปิดไฟถ้ากดไม่ได้
      opacity: quantity <= 1 ? 0.3 : 1, // จางลงถ้ากดไม่ได้
      cursor: quantity <= 1 ? 'not-allowed' : 'pointer'
    }}
    className="w-12 h-12 flex items-center justify-center rounded-xl text-3xl transition-all hover:bg-cyan-500/20"
  >
    −
  </button>

  <div className="text-2xl font-mono text-white w-8 text-center">{quantity}</div>

  {/* ➕ ปุ่มเพิ่มจำนวน (Plus) */}
  <button
    onClick={() => setQuantity(q => Math.min(weapon.stock || 99, q + 1))}
    style={{ 
      color: 'white',
      backgroundColor: 'transparent',
      border: '2px solid #06b6d4',
      fontWeight: '900',
      boxShadow: '0 0 10px #06b6d4',
      cursor: 'pointer'
    }}
    className="w-12 h-12 flex items-center justify-center rounded-xl text-3xl transition-all hover:bg-cyan-500/20"
  >
    +
  </button>
</div>
          </div>

         <button
  onClick={async (e) => {
    e.preventDefault(); 
    if (!weapon || !weapon.id) return;
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    try {
      await addToCart({ ...weapon, id: Number(weapon.id) }, Number(quantity));
      alert("Added to cart!"); // เพิ่มแจ้งเตือนให้ผู้ใช้รู้ว่าสำเร็จ
    } catch (err) {
      alert(err.message);
    }
  }}
  /* ✅ ใช้ Inline Style เพื่อความสว่างชัดเจนและกรอบเรืองแสงแบบ Sci-fi */
  style={{ 
    color: 'white',               
    backgroundColor: 'transparent', 
    border: '4px solid #06b6d4',  
    fontWeight: '900',            
    boxShadow: '0 0 25px #06b6d4, inset 0 0 10px #06b6d4', 
    cursor: 'pointer'
  }}
  className="w-full py-6 rounded-2xl text-3xl uppercase italic tracking-tighter transition-all hover:bg-cyan-500/20 active:scale-95 relative z-50 pointer-events-auto"
>
  Add to Cart
</button>
        </div>
      </div>
    </div>
  );
}
export default WeaponDetail;