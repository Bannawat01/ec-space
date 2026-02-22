import { useState } from 'react';
import api from '../services/api';

function Topup() {
  const [amount, setAmount] = useState(0);

  const handleTopup = async () => {
    try {
      const token = localStorage.getItem('token'); // ดึง token ถ้ามี
      await api.post('/topup', { amount: Number(amount) }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('เติม Point สำเร็จ!');
      window.location.reload();
    } catch (err) { 
      alert('การเติมเงินล้มเหลว กรุณาลองใหม่'); 
    }
  };

  return (
  <div className="min-h-screen w-full bg-transparent flex items-center justify-center p-6">
    {/* ปรับกล่องเติมเงินให้ใสเห็นวิดีโอ */}
    <div className="max-w-xl w-full bg-black/50 backdrop-blur-2xl p-12 rounded-[3.5rem] border border-white/10 shadow-2xl">
      <h2 className="text-4xl font-black italic mb-2 text-white uppercase text-center">
        Replenish <span className="text-cyan-400">Credits</span>
      </h2>
      <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] mb-10 text-center">Secure Terminal</p>
      
      <div className="space-y-6">
        <input 
          type="number" 
          className="w-full bg-black/40 border border-white/10 p-6 rounded-2xl text-3xl font-mono text-cyan-400 text-center outline-none" 
          placeholder="0" 
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={handleTopup} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white p-6 rounded-2xl font-black uppercase shadow-lg">
          Confirm Transfer
        </button>
      </div>
    </div>
  </div>
);
}

export default Topup;