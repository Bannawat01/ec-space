import { useCart } from '../contexts/CartContext';
import api from '../services/api';

function Cart() {
  const { cart, clearCart, updateQuantity, removeFromCart } = useCart();
  
  const totalPrice = cart.reduce((sum, item) => sum + (Number(item.price) * (Number(item.quantity) || 1)), 0);

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
            {cart.map((item) => {
              const currentQty = Number(item.quantity) || 1;
              
              return (
                <div key={item.id} className="w-full bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 flex items-center gap-6">
                  <div className="w-40 h-28 rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0">
                    <img src={`http://localhost:8080/${item.image_url}`} className="w-full h-full object-cover" alt={item.name} />
                  </div>

                  <div className="flex-1 text-left">
                    <h4 className="font-black text-2xl text-white uppercase">{item.name}</h4>
                    <p className="text-slate-400 mt-2 font-mono">Price: {Number(item.price).toLocaleString()} CR</p>
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center bg-black/40 rounded-xl border border-white/5 p-1">
                      {/* ปุ่มลบที่ดัก Error 400 อย่างเข้มงวด */}
                      <button 
                        onClick={() => {
                          const targetQty = currentQty - 1;
                          console.log(`Attempting to update ${item.name} to quantity: ${targetQty}`);
                          
                          if (targetQty >= 1) {
                            updateQuantity(item.id, targetQty);
                          } else {
                            if(window.confirm("Remove this item?")) removeFromCart(item.id);
                          }
                        }}
                        className="w-12 h-12 flex items-center justify-center text-cyan-400 font-black text-2xl hover:bg-white/10 rounded-lg"
                      >-</button>
                      
                      <div className="w-12 text-center font-mono font-black text-xl text-white">{currentQty}</div>
                      
                      <button 
                        onClick={() => updateQuantity(item.id, currentQty + 1)} 
                        className="w-12 h-12 flex items-center justify-center text-cyan-400 font-black text-2xl hover:bg-white/10 rounded-lg"
                      >+</button>
                    </div>
                  </div>

                  <div className="text-right w-44">
                    <p className="text-cyan-400 font-mono text-3xl font-black">{(Number(item.price) * currentQty).toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
export default Cart;