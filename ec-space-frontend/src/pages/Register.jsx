import { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/register', formData);
      alert('ลงทะเบียนสำเร็จ! พร้อมรับอาวุธแล้ว');
      navigate('/login');
    } catch (error) {
      alert('ลงทะเบียนไม่สำเร็จ: ' + (error.response?.data?.error || 'เซิร์ฟเวอร์ขัดข้อง'));
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-6">
      <div className="bg-slate-900 border border-slate-800 p-10 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden">
        <h2 className="text-4xl font-black text-white mb-2 text-center tracking-tighter italic">
          NEW <span className="text-cyan-500">RECRUIT</span>
        </h2>
        <p className="text-slate-400 text-center mb-8 text-sm uppercase tracking-widest">สร้างบัญชีผู้ใช้งานใหม่</p>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase mb-2 ml-1">Username</label>
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none transition-all"
              placeholder="ชื่อผู้ใช้"
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase mb-2 ml-1">Email Address</label>
            <input
              type="email"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none transition-all"
              placeholder="alien@galaxy.com"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase mb-2 ml-1">Password</label>
            <input
              type="password"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none transition-all"
              placeholder="••••••••"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-widest mt-4">
            Join the Army
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 text-sm">
          มีบัญชีอยู่แล้ว? <Link to="/login" className="text-cyan-500 hover:underline font-bold">กลับไปล็อกอิน</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;