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
    <div className="p-10 bg-slate-950 min-h-screen text-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-black mb-10 text-cyan-400 tracking-tighter italic uppercase">
          <span className="text-white mr-3">📜</span> Deployment History
        </h2>

        {orders.length === 0 ? (
          <div className="text-center p-20 bg-slate-900/50 border border-slate-800 rounded-[2rem]">
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em]">No mission logs found</p>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order.ID} className="bg-slate-900/50 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-sm">
                {/* Order Header */}
                <div className="bg-slate-800/40 p-6 flex justify-between items-center border-b border-slate-800">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-1">Transaction ID</p>
                    <p className="font-mono text-cyan-500 text-sm">#XN-{order.ID}-{new Date(order.CreatedAt).getTime()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Status</p>
                    <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-green-500/20">
                      {order.Status || "Confirmed"}
                    </span>
                  </div>
                </div>

                {/* Items List - ป้องกัน Error ด้วย Optional Chaining (?.) */}
                <div className="p-6 space-y-4">
                  {order.Items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50 hover:border-cyan-500/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                          {/* ตรวจสอบว่ามี image_url หรือไม่ ถ้าไม่มีให้โชว์สีพื้นหลัง */}
                          {item.weapon?.image_url ? (
                             <img src={`http://localhost:8080/${item.weapon.image_url}`} className="w-full h-full object-cover" alt="" />
                          ) : (
                             <div className="w-full h-full bg-slate-700 flex items-center justify-center text-[8px] text-slate-500">N/A</div>
                          )}
                        </div>
                        <div>
                          <p className="font-black text-sm text-white">{item.weapon?.name || "Unknown Armament"}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-bold italic">
                            {item.weapon?.type || "Standard"} x {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-cyan-400 text-sm">
                          {/* ✅ แก้ไขจุดที่ทำให้หน้าจอขาว: เช็ค item.weapon ก่อนคำนวณ */}
                          {( (item.weapon?.price || 0) * item.quantity ).toLocaleString()} <span className="text-[10px]">Cr</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Footer */}
                <div className="p-6 bg-slate-900/60 border-t border-slate-800 flex justify-between items-end">
                  <div className="flex flex-col">
                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1">Deployment Date</p>
                    <p className="text-[11px] text-slate-400 font-bold uppercase italic">
                      {new Date(order.CreatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase font-black mb-1 tracking-widest">Total Investment</p>
                    <p className="text-3xl font-mono font-black text-cyan-400 italic">
                      {(order.Total || 0).toLocaleString()} <span className="text-xs">CR</span>
                    </p>
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