import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/register', { username, email, password });
      alert('REGISTRATION SUCCESSFUL');
      navigate('/login');
    } catch (error) {
      alert('REGISTRATION FAILED');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4">
      <div className="w-full max-w-md bg-black/30 backdrop-blur-md border border-white/20 p-10 rounded-[40px] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        <div className="text-center mb-10">
          <h2 className="text-5xl font-black text-white italic tracking-tighter mb-2 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
            NEW <span className="text-cyan-400">RECRUIT</span>
          </h2>
          <p className="text-cyan-500/70 text-[10px] uppercase tracking-[0.3em] font-bold">Enlist in the Galactic Army</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="group">
            <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 mb-1.5 block group-focus-within:text-cyan-400 transition-colors">Username</label>
            <input
              type="text"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder:text-white/10 outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
              placeholder="CHOOSE USERNAME"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="group">
            <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 mb-1.5 block group-focus-within:text-cyan-400 transition-colors">Email Address</label>
            <input
              type="email"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder:text-white/10 outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
              placeholder="COMMANDER@GALAXY.COM"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="group">
            <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1 mb-1.5 block group-focus-within:text-cyan-400 transition-colors">Password</label>
            <input
              type="password"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder:text-white/10 outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
              placeholder="SECURE PASSWORD"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-white/10 hover:bg-cyan-500 text-white hover:text-black border border-white/20 hover:border-cyan-500 font-black py-4 rounded-2xl transition-all shadow-xl active:scale-[0.97] uppercase tracking-widest text-sm mt-6"
          >
            Enlist Now
          </button>
        </form>

        <p className="text-center mt-10 text-white/30 text-[11px] font-bold uppercase tracking-widest">
          Already Enlisted? <Link to="/login" className="text-cyan-400 hover:text-white transition-all">Return to Base</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;