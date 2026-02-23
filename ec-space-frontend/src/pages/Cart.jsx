import { useCart } from '../contexts/CartContext';
import api from '../services/api';

function Cart() {
  const { cart, clearCart, updateQuantity, removeFromCart } = useCart();
  
  const totalPrice = cart.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("ตะกร้าว่างเปล่า!");

    try {
      const payload = {
        total: totalPrice,
        items: cart.map(item => ({
          weapon_id: item.id,
          quantity: item.quantity || 1
        }))
      };

      await api.post('/orders', payload);

      // Notify other parts of the UI (Navbar) to refresh profile / credits
      window.dispatchEvent(new Event('profileUpdated'));

      alert("🚀 สั่งซื้อสำเร็จ! ระบบตัดเครดิตและเตรียมการจัดส่งแล้ว");
      clearCart();
    } catch (error) {
      alert("การสั่งซื้อล้มเหลว: " + (error.response?.data?.error || "Error"));
    }
  };

  return (
    <div className="min-h-screen p-12 bg-transparent text-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-black mt-20 mb-8 text-cyan-400 tracking-tighter italic flex items-center gap-3 text-left">
          <span className="text-white">🛒</span> Your Cart
        </h2>

        {cart.length === 0 ? (
          <div className="text-center p-20 bg-black/40 border border-white/10 rounded-[2.5rem]">
            <p className="text-slate-400 text-xl font-bold uppercase tracking-widest">ไม่มีอาวุธในตะกร้า</p>
          </div>
        ) : (
          <div className="space-y-8">
            {cart.map((item, index) => {
              // Add null/undefined checks for safety
              if (!item || !item.id || !item.price || !item.stock) {
                return null;
              }
              const isMaxStock = item.quantity >= item.stock;
              return (
                <div key={index} className="w-full bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 flex items-center gap-6">
                  <div className="w-40 h-28 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
                    <img src={`http://localhost:8080/${item.image_url || ''}`} className="w-full h-full object-cover" alt={item.name || 'weapon'} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-2xl text-white truncate">{item.name}</h4>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[11px] text-cyan-400 font-black uppercase bg-cyan-400/8 px-2 rounded">{item.type || 'N/A'}</span>
                      <span className="text-[12px] text-slate-400">In Stock: {item.stock}</span>
                    </div>
                    <p className="text-slate-400 mt-3">Unit: <span className="font-mono text-cyan-300">{Number(item.price).toLocaleString()} Cr</span></p>
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center bg-black/40 rounded-xl border border-white/5 p-1">
                      <button onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                        className="w-10 h-10 flex items-center justify-center text-cyan-400 font-bold hover:bg-white/5 rounded-lg">-</button>
                      <div className="w-12 text-center font-mono font-black text-lg text-white">{item.quantity || 1}</div>
                      <button onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)} disabled={isMaxStock}
                        className={`w-10 h-10 flex items-center justify-center font-bold rounded-lg ${isMaxStock ? 'text-slate-600' : 'text-cyan-400 hover:bg-white/5'}`}>+</button>
                    </div>
                    <button onClick={() => { if(window.confirm(`นำ ${item.name} ออกจากตะกร้า?`)) removeFromCart(item.id); }}
                      className="text-sm text-red-500 hover:text-red-400 font-black uppercase">Remove</button>
                  </div>

                  <div className="text-right w-40">
                    <p className="text-cyan-400 font-mono text-2xl font-black">{(Number(item.price) * (item.quantity || 1)).toLocaleString()}</p>
                    <p className="text-[11px] text-slate-400">CR</p>
                  </div>
                </div>
              );
            })}

            <div className="mt-6 p-6 bg-black/50 border border-white/10 rounded-3xl flex justify-between items-center">
              <div>
                <p className="text-slate-400 uppercase tracking-widest text-xs">Total Credits Required</p>
                <p className="text-3xl font-mono font-black text-cyan-400">{totalPrice.toLocaleString()} <span className="text-sm">CR</span></p>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={handleCheckout}
                  className="bg-cyan-600 hover:bg-cyan-500 text-black font-black py-3 px-6 rounded-2xl uppercase tracking-widest">Confirm Purchase</button>
                <button onClick={() => { if(window.confirm('ล้างตะกร้าทั้งหมด?')) clearCart(); }}
                  className="text-sm text-slate-300 border border-white/5 px-4 py-2 rounded-lg">Clear Cart</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
}

export default Cart;