// ไฟล์ Topup.jsx เบื้องต้น
import { useState } from 'react';
import api from '../services/api';

function Topup() {
  const [amount, setAmount] = useState(0);

  const handleTopup = async () => {
    try {
      await api.post('/topup', { amount: Number(amount) });
      alert('เติม Point สำเร็จ!');
      window.location.reload();
    } catch (err) { alert('ผิดพลาด'); }
  };

  return (
    <div className="max-w-xl mx-auto bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 mt-10">
      <h2 className="text-3xl font-black italic mb-6">REPLENISH CREDITS</h2>
      <input 
        type="number" 
        className="w-full bg-black/40 border border-white/10 p-4 rounded-xl mb-4 text-white" 
        placeholder="ระบุจำนวน..." 
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleTopup} className="w-full bg-cyan-600 p-4 rounded-xl font-black uppercase">Confirm</button>
    </div>
  );
}
export default Topup;