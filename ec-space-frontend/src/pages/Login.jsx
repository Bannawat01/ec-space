import { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/login', { username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role); // เก็บ Role ไว้เช็คสิทธิ์ Admin
      alert('ยินดีต้อนรับกลับสู่ฐานทัพ!');
      navigate('/');
      window.location.reload();
    } catch {
      alert('รหัสผ่านไม่ถูกต้อง หรือไม่พบผู้ใช้ในระบบอวกาศ');
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-6">
      <div className="bg-slate-900 border border-slate-800 p-10 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden group">
        {/* แสงนีออนตกแต่งพื้นหลัง */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 blur-3xl rounded-full group-hover:bg-cyan-500/20 transition-all"></div>
        
        <h2 className="text-4xl font-black text-white mb-2 text-center tracking-tighter">
          ACCESS <span className="text-cyan-500">DEN</span>
        </h2>
        <p className="text-slate-400 text-center mb-8 text-sm uppercase tracking-widest">ยืนยันตัวตนเพื่อเข้าสู่คลังแสง</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase mb-2 ml-1">Username</label>
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
              placeholder="ผู้บัญชาการ..."
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase mb-2 ml-1">Password</label>
            <input
              type="password"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 rounded-xl shadow-lg shadow-cyan-900/20 transition-all active:scale-95 uppercase tracking-widest">
            Authorize Now
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 text-sm">
          ยังไม่ได้ลงทะเบียน? <Link to="/register" className="text-cyan-500 hover:underline font-bold">สมัครสมาชิกใหม่</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;