import { useEffect, useState } from 'react';
import api from '../services/api';

const CLIP_XL = 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 100%)';
const CLIP_LG = 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)';
const CLIP_SM = 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)';

function CornerBrackets({ color = 'rgba(34,211,238,0.55)' }) {
  const style = { borderColor: color };
  return (
    <>
      <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 pointer-events-none" style={style} />
      <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 pointer-events-none" style={style} />
      <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 pointer-events-none" style={style} />
      <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 pointer-events-none" style={style} />
    </>
  );
}

function TacticalShell({ children, clip = CLIP_LG, className = '' }) {
  return (
    <div
      className={className}
      style={{
        clipPath: clip,
        border: '1px solid rgba(34, 211, 238, 0.28)',
        background: 'rgba(2, 10, 18, 0.78)',
        boxShadow: '0 0 0 1px rgba(34,211,238,0.08), 0 10px 24px rgba(0,0,0,0.35)',
      }}
    >
      {children}
    </div>
  );
}

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
    <div className="flex justify-center items-center min-h-screen bg-black text-cyan-400">
      <div className="p-10 text-cyan-400/90 animate-pulse font-mono tracking-widest uppercase">
        📡 Connecting to Galactic Archive...
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen px-6 md:px-10 lg:px-12 pt-28 pb-14 text-white"
      style={{
        backgroundImage:
          'linear-gradient(rgba(6,182,212,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.025) 1px, transparent 1px)',
        backgroundSize: '44px 44px',
      }}
    >
      <style>{`
        @keyframes history-scan {
          0% { background-position: 0 -200%; }
          100% { background-position: 0 400%; }
        }
        .history-scan {
          background: linear-gradient(180deg, transparent 0%, rgba(6,182,212,.05) 50%, transparent 100%);
          background-size: 100% 38%;
          animation: history-scan 6s linear infinite;
          pointer-events: none;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <p className="font-mono text-[10px] text-cyan-500/50 tracking-widest mb-1">
          
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase leading-none">
            <span className="text-white">XENO</span>{' '}
            <span className="text-cyan-400">ARMORY</span>{' '}
            <span className="text-white/30">HISTORY</span>
          </h2>
        </div>

        {orders.length === 0 ? (
          <TacticalShell clip={CLIP_XL}>
            <div className="relative p-20 text-center !bg-black/50 backdrop-blur-xl overflow-hidden" style={{ clipPath: CLIP_XL }}>
              <div className="history-scan absolute inset-0" />
              <CornerBrackets color="rgba(34,211,238,0.7)" />
              <p className="relative z-10 font-mono text-[15px] text-cyan-200 uppercase tracking-widest font-black">
                [ ARCHIVE: EMPTY ]
              </p>
              <p className="relative z-10 mt-3 font-mono text-[11px] text-slate-300/85 uppercase tracking-widest">
                NO ORDER RECORDS DETECTED
              </p>
            </div>
          </TacticalShell>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <TacticalShell key={order.id} clip={CLIP_XL} className="w-full">
                <div className="relative p-8 flex flex-col gap-6 !bg-black/60 backdrop-blur-xl overflow-hidden" style={{ clipPath: CLIP_XL }}>
                  <div className="history-scan absolute inset-0" />
                  <CornerBrackets />

                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-1">Transaction</p>
                      <p className="font-mono text-cyan-300 text-sm">#XN-{order.id}-{new Date(order.created_at).getTime()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Status</p>
                      <span
                        className="!bg-green-500/15 text-green-300 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-green-500/30"
                        style={{ clipPath: CLIP_SM }}
                      >
                        {order.status || order.Status || "Confirmed"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-6 p-4 !bg-black/45 border border-cyan-500/20"
                        style={{ clipPath: CLIP_LG }}
                      >
                        <div className="w-36 h-20 overflow-hidden !bg-slate-800/60 flex-shrink-0 border border-cyan-500/25" style={{ clipPath: CLIP_SM }}>
                          {item.weapon?.image_url ? (
                            <img src={`http://localhost:8080/${item.weapon.image_url}`} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full bg-slate-700 flex items-center justify-center text-[10px] text-slate-500">N/A</div>
                          )}
                        </div>

                        <div className="flex-1">
                          <p className="font-black text-lg text-white uppercase tracking-wide">{item.weapon?.name || "Unknown"}</p>
                          <p className="text-sm text-slate-300/85 mt-1">{item.weapon?.type || "Standard"} • {item.quantity} pcs</p>
                          <p className="text-sm text-slate-500 mt-2">Unit: {(item.weapon?.price || 0).toLocaleString()} Cr • Subtotal: {((item.weapon?.price || 0) * item.quantity).toLocaleString()} Cr</p>
                        </div>

                        <div className="text-right w-40">
                          <p className="font-mono text-cyan-300 text-lg font-black">{((item.weapon?.price || 0) * item.quantity).toLocaleString()}</p>
                          <span className="text-[10px] text-slate-400">Cr</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-cyan-500/15 flex justify-between items-center">
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest">Order Date</p>
                      <p className="text-sm text-slate-400 font-bold">{new Date(order.created_at || order.CreatedAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-black mb-1 tracking-widest">Order Total</p>
                      <p className="text-3xl font-mono font-black text-cyan-300 italic">{(order.total || order.Total || 0).toLocaleString()} <span className="text-xs">CR</span></p>
                    </div>
                  </div>
                </div>
              </TacticalShell>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderHistory;