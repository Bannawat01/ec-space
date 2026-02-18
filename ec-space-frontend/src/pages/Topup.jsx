import { useState } from 'react';
import api from '../services/api';

function Topup() {
  const [loading, setLoading] = useState(false);

  const handleTopup = async (amount) => {
    const confirm = window.confirm(`ยืนยันการเติมเงินจำนวน ${amount.toLocaleString()} CR หรือไม่?`);
    if (!confirm) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await api.post('/topup', { amount }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`🚀 เติมเครดิต ${amount.toLocaleString()} CR เรียบร้อย!`);
      // กลับไปหน้าหลักเพื่อให้ Navbar อัปเดตยอดเงินอัตโนมัติ
      window.location.href = "/"; 
    } catch (error) {
      alert("การเติมเงินล้มเหลว: " + (error.response?.data?.error || "Error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 text-white bg-slate-950 min-h-screen flex flex-col items-center">
      <div className="max-w-4xl w-full text-center mb-16">
        <h2 className="text-5xl font-black text-cyan-400 italic tracking-tighter mb-4">
          CREDIT RECHARGE CENTER
        </h2>
        <p className="text-slate-500 uppercase tracking-[0.3em] text-sm">Central Galactic Bank Security System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {[1000, 5000, 10000].map((amount) => (
          <div key={amount} className="bg-slate-900/50 border-2 border-slate-800 p-10 rounded-[2rem] text-center hover:border-cyan-500 transition-all hover:-translate-y-2 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-64px font-black group-hover:text-cyan-400 transition-colors">UC</div>
            <p className="text-slate-400 font-bold mb-2 uppercase text-xs tracking-widest">Amount</p>
            <p className="text-5xl font-mono font-black mb-8 group-hover:text-cyan-400 transition-colors">
              {amount.toLocaleString()}
            </p>
            <button 
              disabled={loading}
              onClick={() => handleTopup(amount)}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:from-cyan-500 hover:to-blue-500 shadow-xl shadow-cyan-900/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "Processing..." : "Authorize Purchase"}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-20 p-6 border border-slate-800 rounded-2xl bg-slate-900/20 max-w-2xl text-center">
        <p className="text-[10px] text-slate-600 leading-relaxed uppercase">
          Warning: Authorized personnel only. All transactions are logged in the blockchain for galactic security purposes.
        </p>
      </div>
    </div>
  );
}

export default Topup;