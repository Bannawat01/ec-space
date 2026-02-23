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
    // ดึงข้อมูลอาวุธทั้งหมดแล้วมาหาตัวที่ตรงกับ ID
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
          <button onClick={() => navigate(-1)} className="text-cyan-500 text-xs font-bold mb-4 uppercase tracking-widest hover:text-cyan-300 transition-colors">← Return to Armory</button>
          <h1 className="text-6xl font-black italic text-white mb-4 uppercase tracking-tighter leading-none">{weapon.name}</h1>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">{weapon.description}</p>
          
          <div className="bg-white/5 p-8 rounded-3xl border border-white/5 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-5xl font-mono text-cyan-400 font-black tracking-tighter">
                {weapon.price?.toLocaleString()} <span className="text-xl">CR</span>
              </span>
              <div className="text-sm text-slate-500 mt-2 font-bold uppercase tracking-widest">Available Stock: {weapon.stock ?? 'N/A'}</div>
            </div>
            
            {/* ตัวปรับจำนวนในหน้า Detail */}
            <div className="flex items-center gap-4 bg-black/40 p-2 rounded-2xl border border-white/5">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="bg-white/5 hover:bg-white/10 text-white w-12 h-12 rounded-xl font-bold transition-all"
                disabled={quantity <= 1}
              >−</button>
              <div className="text-2xl font-mono text-white w-8 text-center">{quantity}</div>
              <button
                onClick={() => setQuantity(q => Math.min(weapon.stock || 99, q + 1))}
                className="bg-white/5 hover:bg-white/10 text-white w-12 h-12 rounded-xl font-bold transition-all"
              >+</button>
            </div>
          </div>

         
<button
  onClick={async (e) => {
    // 🛡️ ป้องกันการกดซ้ำหรือเหตุการณ์ซ้อน
    e.preventDefault(); 
    
    console.log("Button Clicked for weapon:", weapon); // ตรวจสอบว่ากดโดนปุ่มไหม

    if (!weapon || !weapon.id) {
      alert("ไม่พบข้อมูลสินค้า (Missing ID)");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('กรุณาเข้าสู่ระบบก่อน');
      return navigate('/login');
    }

    try {
      // 🚀 บังคับส่งค่าที่เป็นตัวเลขแน่นอน
      const finalId = Number(weapon.id);
      const finalQty = Number(quantity) || 1;

      console.log(`Sending to Cart -> ID: ${finalId}, Qty: ${finalQty}`);

      await addToCart({ ...weapon, id: finalId }, finalQty);
      
      // ถ้ามาถึงตรงนี้แสดงว่า CartContext ทำงานสำเร็จแล้ว
      console.log("Add to cart process finished"); 
    } catch (err) {
      // ดัก Error ที่อาจเกิดขึ้นก่อนถึง API
      console.error("Click Error:", err.message);
      alert(err.message);
    }
  }}
  // 🎨 เพิ่ม Cursor Pointer และ Pointer Events เพื่อความมั่นใจว่ากดได้
  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-6 rounded-2xl font-black uppercase shadow-lg transition-all active:scale-95 cursor-pointer relative z-50 pointer-events-auto"
>
  Add to Cart
</button>
        </div>
      </div>
    </div>
  );
}
export default WeaponDetail;