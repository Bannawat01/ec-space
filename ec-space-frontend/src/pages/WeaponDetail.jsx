// src/pages/WeaponDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';

function WeaponDetail() {
  const { id } = useParams();
  const [weapon, setWeapon] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, fetchCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    // 🔍 แก้ไข URL ตรงนี้ให้ถูกต้องตาม Backend ของคุณ
    // ถ้า backend รับที่ /weapons/1 ให้ใช้แบบนี้ครับ
  // Backend currently exposes only list endpoint (/api/weapons).
  // เพื่อไม่ให้กระทบหลังบ้านที่มีอยู่แล้ว ให้ดึงรายการทั้งหมดแล้วค้นหาไอเท็ม
  api.get(`/weapons`)
    .then(res => {
      const found = res.data.find(w => String(w.id) === String(id));
      if (found) setWeapon(found);
      else {
        console.warn('Weapon not found:', id);
        // ถ้าไม่พบ ให้ย้อนกลับไปหน้า list
        navigate(-1);
      }
    })
    .catch(err => {
      console.error("Error fetching weapons:", err);
    });
}, [id]);

  // หน้าจอระหว่างโหลด (ทำให้โปร่งใสเพื่อให้เห็นวิดีโอพื้นหลัง)
  if (!weapon) return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="text-cyan-400 font-mono text-2xl animate-pulse">
        SCANNING SCHEMATIC...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent p-10 flex items-center justify-center">
      {/* Container แบบกระจกใส (Glassmorphism) */}
      <div className="max-w-6xl w-full bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[3rem] overflow-hidden flex flex-col md:flex-row gap-12 p-12 shadow-2xl">
        <div className="md:w-1/2">
          <img 
            src={`http://localhost:8080/${weapon.image_url}`} 
            className="w-full h-auto rounded-[2.5rem] object-cover shadow-2xl" 
            alt={weapon.name}
          />
        </div>
        <div className="md:w-1/2 flex flex-col justify-center text-left">
          <button onClick={() => navigate(-1)} className="text-cyan-500 text-xs font-bold mb-4 uppercase tracking-widest">← Return to Armory</button>
          <h1 className="text-6xl font-black italic text-white mb-4 uppercase tracking-tighter">{weapon.name}</h1>
          <p className="text-slate-400 text-lg mb-8">{weapon.description}</p>
          <div className="bg-white/5 p-8 rounded-3xl border border-white/5 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-5xl font-mono text-cyan-400 font-black">
                {weapon.price?.toLocaleString()} <span className="text-xl">CR</span>
              </span>
              <div className="text-sm text-slate-400 mt-2">Stock: {weapon.stock ?? 'N/A'}</div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-xl font-bold"
                disabled={quantity <= 1}
              >
                −
              </button>
              <div className="text-2xl font-mono text-white">{quantity}</div>
              <button
                onClick={() => setQuantity(q => {
                  const max = weapon.stock ?? Number.MAX_SAFE_INTEGER;
                  return Math.min(max, q + 1);
                })}
                className="bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-xl font-bold"
                disabled={weapon.stock !== undefined && quantity >= weapon.stock}
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={async (e) => {
              e.preventDefault();
              const btn = e.currentTarget;
              // check if button is covered by another element at its center
              const rect = btn.getBoundingClientRect();
              const cx = rect.left + rect.width / 2;
              const cy = rect.top + rect.height / 2;
              const topEl = document.elementFromPoint(cx, cy);
              if (topEl && !btn.contains(topEl) && topEl !== btn) {
                console.warn('Add to Cart button is covered by element:', topEl);
                window.dispatchEvent(new CustomEvent('appToast', { detail: { message: 'ปุ่มถูกบังโดยองค์ประกอบอื่นบนหน้า กรุณาเลื่อนหน้าจอแล้วลองอีกครั้ง', type: 'error', duration: 6000 } }));
                return;
              }
              console.log('Add to Cart clicked', weapon.id, quantity);
              const token = localStorage.getItem('token');
              if (!token) {
                window.dispatchEvent(new CustomEvent('appToast', { detail: { message: 'กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า', type: 'error' } }));
                navigate('/login');
                return;
              }

              try {
                // Use context helper to ensure UI cart state refreshes and respect quantity
                await addToCart(weapon, quantity);
              } catch (err) {
                console.error('Add to cart failed:', err);
                const msg = err?.response?.data?.error || 'ไม่สามารถเพิ่มสินค้าลงตะกร้าได้';
                window.dispatchEvent(new CustomEvent('appToast', { detail: { message: msg, type: 'error', duration: 6000 } }));
              }
            }}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-6 rounded-2xl font-black uppercase relative z-[1000] cursor-pointer outline-2 outline-cyan-300/30"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
export default WeaponDetail;