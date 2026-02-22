import { useEffect, useState } from 'react';
import api from '../services/api';

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // ตรวจสอบว่า res.data เป็น Array ก่อนเซตค่า
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("ดึงข้อมูลประวัติไม่สำเร็จ:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-slate-950">
      <div className="p-10 text-cyan-500 animate-pulse font-mono tracking-widest uppercase">
        📡 Connecting to Galactic Archive...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-12 bg-transparent text-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-black mt-20 mb-8 text-cyan-400 tracking-tighter italic uppercase text-left">
          <span className="text-white mr-3">📜</span> Order History
        </h2>

        {orders.length === 0 ? (
          <div className="text-center p-20 bg-black/40 border border-white/10 rounded-[2.5rem]">
            <p className="text-slate-400 font-bold uppercase tracking-[0.3em]">No orders found</p>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order.id} className="w-full bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="p-8 flex flex-col gap-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-1">Transaction</p>
                      <p className="font-mono text-cyan-300 text-sm">#XN-{order.id}-{new Date(order.created_at).getTime()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Status</p>
                      <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-green-500/10">
                        {order.status || order.Status || "Confirmed"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-6 p-4 bg-black/40 rounded-2xl border border-white/5">
                        <div className="w-36 h-20 rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700">
                          {item.weapon?.image_url ? (
                            <img src={`http://localhost:8080/${item.weapon.image_url}`} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full bg-slate-700 flex items-center justify-center text-[10px] text-slate-500">N/A</div>
                          )}
                        </div>

                        <div className="flex-1">
                          <p className="font-black text-lg text-white">{item.weapon?.name || "Unknown"}</p>
                          <p className="text-sm text-slate-400 mt-1">{item.weapon?.type || "Standard"} • {item.quantity} pcs</p>
                          <p className="text-sm text-slate-500 mt-2">Unit: {(item.weapon?.price || 0).toLocaleString()} Cr • Subtotal: {((item.weapon?.price || 0) * item.quantity).toLocaleString()} Cr</p>
                        </div>

                        <div className="text-right w-40">
                          <p className="font-mono text-cyan-400 text-lg font-black">{((item.weapon?.price || 0) * item.quantity).toLocaleString()}</p>
                          <span className="text-[10px] text-slate-400">Cr</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest">Order Date</p>
                      <p className="text-sm text-slate-400 font-bold">{new Date(order.created_at || order.CreatedAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-black mb-1 tracking-widest">Order Total</p>
                      <p className="text-3xl font-mono font-black text-cyan-400 italic">{(order.total || order.Total || 0).toLocaleString()} <span className="text-xs">CR</span></p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderHistory;