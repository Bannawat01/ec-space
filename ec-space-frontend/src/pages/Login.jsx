import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/login', { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('username', username);
      navigate('/');
      window.location.reload();
    } catch (error) {
      alert('ACCESS DENIED: Credentials Invalid');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-black/40 backdrop-blur-2xl border border-white/10 p-10 rounded-[40px] shadow-2xl">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-white italic tracking-tighter">WELCOME <span className="text-cyan-400">BACK</span></h2>
          <p className="text-white/30 text-[9px] uppercase tracking-[0.3em] font-bold mt-2">Identity Verification Required</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-cyan-500 uppercase tracking-widest ml-1">Commander Name</label>
            <input
              type="text"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/10 outline-none focus:border-cyan-500/50 transition-all"
              placeholder="ENTER USERNAME"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-cyan-500 uppercase tracking-widest ml-1">Access Code</label>
            <input
              type="password"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/10 outline-none focus:border-cyan-500/50 transition-all"
              placeholder="ENTER PASSWORD"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-400 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-cyan-900/40 uppercase tracking-widest text-xs mt-4">
            Authorize Access
          </button>
        </form>
        <p className="text-center mt-8 text-white/20 text-[10px] font-bold uppercase tracking-widest">
          No Account? <Link to="/register" className="text-cyan-400 hover:text-white transition-all">Register Recruit</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;