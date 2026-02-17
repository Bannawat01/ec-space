import { useCart } from '../CartContext';
import api from '../api';

function Cart() {
  const { cart, clearCart, updateQuantity, removeFromCart } = useCart();
  
  const totalPrice = cart.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("ตะกร้าว่างเปล่า!");

    try {
      const token = localStorage.getItem('token');
      const payload = {
        total: totalPrice,
        items: cart.map(item => ({ 
          weapon_id: item.id, 
          quantity: item.quantity || 1 
        }))
      };

      await api.post('/orders', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("🚀 สั่งซื้อสำเร็จ! ระบบตัดเครดิตและเตรียมการจัดส่งแล้ว");
      clearCart();
    } catch (error) {
      alert("การสั่งซื้อล้มเหลว: " + (error.response?.data?.error || "Error"));
    }
  };

  return (
    <div className="p-10 bg-slate-950 min-h-screen text-white">
      <h2 className="text-4xl font-black mb-10 text-cyan-400 tracking-tighter italic flex items-center gap-3">
        <span className="text-white">🛒</span> YOUR ARMAMENT ORDER
      </h2>

      {cart.length === 0 ? (
        <div className="text-center p-20 bg-slate-900/50 border border-slate-800 rounded-3xl">
          <p className="text-slate-500 text-xl font-bold uppercase tracking-widest">ไม่มีอาวุธในตะกร้า</p>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="space-y-4">
            {cart.map((item, index) => {
              const isMaxStock = item.quantity >= item.stock;

              return (
                <div key={index} className="grid grid-cols-12 items-center bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all gap-4">
                  
                  {/* 1. ส่วนรูปภาพและชื่ออาวุธ (6/12 columns) */}
                  <div className="col-span-12 md:col-span-5 flex items-center gap-5">
                    <div className="w-20 h-20 bg-slate-800 rounded-xl overflow-hidden border border-slate-700 flex-shrink-0">
                      <img src={`http://localhost:8080/${item.image_url}`} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-xl text-white truncate">{item.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-cyan-600 font-black uppercase bg-cyan-600/10 px-2 rounded">{item.type}</span>
                        <span className="text-[10px] text-slate-500 uppercase italic">In Stock: {item.stock}</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. ส่วนจัดการจำนวน (4/12 columns) - จัดให้อยู่กึ่งกลางเสมอ */}
                  <div className="col-span-7 md:col-span-4 flex items-center justify-center gap-6">
                    <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                        className="w-9 h-9 flex items-center justify-center text-cyan-500 font-bold hover:bg-slate-800 rounded-lg transition-colors"
                      >-</button>
                      
                      <span className="w-12 text-center font-mono font-black text-lg text-white">{item.quantity || 1}</span>
                      
                      <button 
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                        disabled={isMaxStock}
                        className={`w-9 h-9 flex items-center justify-center font-bold rounded-lg transition-all
                          ${isMaxStock 
                            ? 'text-slate-700 cursor-not-allowed bg-slate-900/40' 
                            : 'text-cyan-400 hover:bg-slate-800 hover:text-cyan-300'}`}
                      >+</button>
                    </div>

                    <button 
                      onClick={() => {
                        if(window.confirm(`นำ ${item.name} ออกจากตะกร้า?`)) {
                          removeFromCart(item.id);
                        }
                      }}
                      className="text-red-500 hover:text-red-400 text-[10px] font-black uppercase transition-colors tracking-tighter"
                    >
                      ลบรายการ
                    </button>
                  </div>

                  {/* 3. ส่วนราคาสุทธิ (3/12 columns) - จัดชิดขวาเสมอ */}
                  <div className="col-span-5 md:col-span-3 text-right">
                    <p className="text-cyan-400 font-mono text-2xl font-black">
                      {(Number(item.price) * (item.quantity || 1)).toLocaleString()}
                      <span className="text-xs ml-1 font-sans">Cr</span>
                    </p>
                    <p className="text-[10px] text-slate-600 font-bold uppercase italic">Subtotal</p>
                  </div>

                </div>
              );
            })}
          </div>

          {/* สรุปยอดเงินส่วนท้าย */}
          <div className="mt-12 p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs block mb-1">Authorization Status</span>
                <span className="text-green-500 font-black uppercase text-sm">Credit Check Passed</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 font-bold uppercase tracking-widest text-xs block">Total Credits Required</span>
                <span className="text-5xl font-mono font-black text-cyan-400 italic">
                  {totalPrice.toLocaleString()} <span className="text-base">CR</span>
                </span>
              </div>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-black py-5 rounded-2xl transition-all shadow-xl shadow-cyan-900/20 active:scale-[0.98] uppercase tracking-[0.4em] text-xl"
            >
              Confirm Purchase
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;