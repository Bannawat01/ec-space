import { useCart } from '../contexts/CartContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  
  const totalPrice = cart.reduce((sum, item) => sum + (Number(item.price) * (Number(item.quantity) || 1)), 0);

 // ใน Cart.jsx
// ในไฟล์ Cart.jsx
const handleCheckout = async () => {
  if (cart.length === 0) return;

  try {
    // เตรียมข้อมูลให้ตรงกับ struct ใน Go
    const orderData = {
      total: totalPrice, // Go รับเป็น "total"
      items: cart.map(item => ({
        weapon_id: item.id, // Go รับเป็น "weapon_id"
        quantity: item.quantity
      }))
    };

    // ✅ เปลี่ยน URL จาก '/orders/checkout' เป็น '/orders' ให้ตรงกับ routes.go
    const response = await api.post('/orders', orderData);

    if (response.status === 200) {
      alert("✅ " + response.data.message);
      window.dispatchEvent(new Event('profileUpdated')); 
      clearCart();
      navigate('/history');
    }
  } catch (error) {
    alert("❌ สั่งซื้อไม่สำเร็จ: " + (error.response?.data?.error || "ระบบขัดข้อง"));
  }
};
  return (
    <div className="min-h-screen p-12 bg-transparent">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-black mt-20 mb-8 text-cyan-400 tracking-tighter italic flex items-center gap-3 uppercase">
          <span className="text-white">🛒</span> Your Cart
        </h2>

        {cart.length === 0 ? (
          <div className="text-center p-20 bg-black/40 border border-white/10 rounded-[2.5rem]">
            <p className="text-white text-xl font-bold uppercase tracking-widest">Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-8 pb-32">
            <div className="space-y-4">
              {cart.map((item) => {
                const currentQty = Number(item.quantity) || 1;
                
                return (
                  <div key={item.id} className="w-full bg-black/80 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-6 flex items-center gap-6 shadow-2xl">
                    <div className="w-40 h-28 rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0 border border-white/10">
                      <img src={`http://localhost:8080/${item.image_url}`} className="w-full h-full object-cover" alt={item.name} />
                    </div>

                    <div className="flex-1 text-left">
                      <h4 className="font-black text-2xl text-white uppercase tracking-tight">{item.name}</h4>
                      <p className="text-slate-300 mt-1 font-mono">Price: {Number(item.price).toLocaleString()} CR</p>
                    </div>

                   {/* ส่วนปรับจำนวนสินค้า - สไตล์เดียวกับปุ่ม Confirm Purchase */}
<div className="flex items-center gap-2 p-1">
  {/* ➖ ปุ่มลดจำนวน */}
  <button 
    onClick={() => {
      const targetQty = currentQty - 1;
      if (targetQty >= 1) updateQuantity(item.id, targetQty);
      else if(window.confirm("Remove this item?")) removeFromCart(item.id);
    }}
    style={{ 
      color: 'white',
      backgroundColor: 'transparent',
      border: '2px solid #06b6d4', // กรอบสีฟ้า
      fontWeight: '900',
      boxShadow: '0 0 10px #06b6d4' // แสงเรืองแสงขนาดเล็ก
    }}
    className="w-10 h-10 flex items-center justify-center rounded-xl text-2xl hover:bg-cyan-500/20 transition-all active:scale-90"
  >
    −
  </button>
  
  {/* ตัวเลขจำนวนสินค้า */}
  <div className="w-12 text-center font-mono font-black text-2xl text-white">
    {currentQty}
  </div>
  
  {/* ➕ ปุ่มเพิ่มจำนวน */}
  <button 
    onClick={() => updateQuantity(item.id, currentQty + 1)} 
    style={{ 
      color: 'white',
      backgroundColor: 'transparent',
      border: '2px solid #06b6d4', // กรอบสีฟ้า
      fontWeight: '900',
      boxShadow: '0 0 10px #06b6d4' // แสงเรืองแสงขนาดเล็ก
    }}
    className="w-10 h-10 flex items-center justify-center rounded-xl text-2xl hover:bg-cyan-500/20 transition-all active:scale-90"
  >
    +
  </button>
</div>

                    <div className="text-right w-44">
                      <p className="text-cyan-400 font-mono text-3xl font-black italic">{(Number(item.price) * currentQty).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>


          {/* ส่วนรวมยอดเงินและปุ่มสั่งซื้อ */}
<div className="mt-12 p-10 bg-black/80 border-2 border-cyan-500/50 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
  <div className="text-left">
    <p className="text-slate-300 uppercase font-bold tracking-widest text-xs mb-1 ml-1">Total Payment</p>
    <p className="text-6xl font-black text-white italic tracking-tighter">
      {totalPrice.toLocaleString()} <span className="text-cyan-400 text-2xl not-italic ml-1">CR</span>
    </p>
  </div>

  {/* ✅ ปุ่มเวอร์ชันเน้นขอบและข้อความสีขาวชัดเจน */}
  <button 
    onClick={handleCheckout}
    style={{ 
      color: 'white',               
      backgroundColor: 'transparent', 
      border: '4px solid #06b6d4',  
      fontWeight: '900',           
      boxShadow: '0 0 20px #06b6d4, inset 0 0 10px #06b6d4' 
    }}
    className="w-full md:w-96 py-6 rounded-2xl text-3xl uppercase italic tracking-tighter transition-all hover:bg-cyan-500/20 active:scale-95 flex items-center justify-center"
  >
    Confirm Purchase
  </button>

</div>
          
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;