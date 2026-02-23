import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const CLIP_XL = 'polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 100%)';
const CLIP_SM = 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)';

function CornerBrackets({ color = 'rgba(34,211,238,0.6)' }) {
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

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ username: '', email: '', address: '', credits: 0, avatar: '' });
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile');
        const avatarPath = res.data.avatar || '';
        setProfile({
          username: res.data.username,
          email: res.data.email || '',
          address: res.data.address || '',
          credits: res.data.credits || 0,
          avatar: avatarPath,
        });
        if (avatarPath) setAvatarPreview(`http://localhost:8080/${avatarPath}`);
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (avatarFile) {
        const form = new FormData();
        form.append('email', profile.email);
        form.append('address', profile.address);
        form.append('avatar', avatarFile);
        // Let axios set the multipart Content-Type (including boundary)
        await api.patch('/profile', form);
      } else {
        await api.patch('/profile', { email: profile.email, address: profile.address });
      }
      window.dispatchEvent(new Event('profileUpdated'));
      // show success toast
      window.dispatchEvent(new CustomEvent('appToast', { detail: { message: 'บันทึกโปรไฟล์เรียบร้อย', type: 'info' } }));
      navigate('/');
    } catch (err) {
      console.error('Save failed', err);
      const msg = err?.response?.data?.error || err?.message || 'บันทึกไม่สำเร็จ';
      window.dispatchEvent(new CustomEvent('appToast', { detail: { message: msg, type: 'error', duration: 6000 } }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-cyan-300 font-mono tracking-widest uppercase">
        Loading Profile Matrix...
      </div>
    );
  }

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
        @keyframes profile-scan {
          0% { background-position: 0 -180%; }
          100% { background-position: 0 360%; }
        }
        .profile-scan {
          background: linear-gradient(180deg, transparent 0%, rgba(6,182,212,.05) 50%, transparent 100%);
          background-size: 100% 38%;
          animation: profile-scan 6s linear infinite;
          pointer-events: none;
        }
      `}</style>

      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="font-mono text-[10px] text-cyan-500/50 tracking-widest mb-1">
            // MODULE: PROFILE_MATRIX
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase leading-none">
            <span className="text-white">XENO</span>{' '}
            <span className="text-cyan-400">ARMORY</span>{' '}
            <span className="text-white/30">PROFILE</span>
          </h2>
        </div>

        <div
          className="relative p-6 md:p-8 !bg-black/60 backdrop-blur-xl border border-cyan-500/25 overflow-hidden"
          style={{
            clipPath: CLIP_XL,
            boxShadow: '0 0 0 1px rgba(34,211,238,0.08), 0 10px 26px rgba(0,0,0,0.35)',
          }}
        >
          <div className="profile-scan absolute inset-0" />
          <CornerBrackets />

          <div className="mb-6 flex items-center gap-6 relative z-10">
            <div
              className="w-28 h-28 overflow-hidden !bg-white/5 border border-cyan-500/25 flex items-center justify-center"
              style={{ clipPath: CLIP_SM }}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm text-white/40">No Avatar</span>
              )}
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-cyan-400/70">Change Avatar</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-2 text-sm text-white file:!bg-cyan-500/20 file:!text-cyan-100 file:!border file:!border-cyan-400/50 file:rounded-md file:px-3 file:py-1.5 file:mr-3"
              />
            </div>
          </div>

          <div className="mb-4 relative z-10">
            <label className="block font-mono text-[10px] uppercase tracking-widest text-cyan-400/65">Username</label>
            <input
              value={profile.username}
              readOnly
              className="w-full mt-2 !bg-black/55 text-white p-3 border border-cyan-500/20 rounded-lg"
            />
          </div>

          <div className="mb-4 relative z-10">
            <label className="block font-mono text-[10px] uppercase tracking-widest text-cyan-400/65">Email</label>
            <input
              value={profile.email}
              onChange={e => setProfile({ ...profile, email: e.target.value })}
              className="w-full mt-2 !bg-black/55 text-white p-3 border border-cyan-500/20 focus:border-cyan-400/45 rounded-lg outline-none"
            />
          </div>

          <div className="mb-7 relative z-10">
            <label className="block font-mono text-[10px] uppercase tracking-widest text-cyan-400/65">Address</label>
            <textarea
              value={profile.address}
              onChange={e => setProfile({ ...profile, address: e.target.value })}
              className="w-full mt-2 !bg-black/55 text-white p-3 border border-cyan-500/20 focus:border-cyan-400/45 rounded-lg outline-none h-28"
            />
          </div>

          <div className="flex gap-4 relative z-10">
            <button
              onClick={handleSave}
              disabled={saving}
              className="!bg-cyan-500/25 !text-cyan-100 !border !border-cyan-300/70 hover:!bg-cyan-500/40 hover:shadow-[0_0_14px_rgba(34,211,238,0.45)] px-6 py-2 rounded-lg font-black uppercase tracking-wider transition-all"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="!bg-slate-800/85 !text-slate-100 !border !border-slate-500/70 hover:!border-cyan-400/50 hover:!text-cyan-200 px-6 py-2 rounded-lg font-black uppercase tracking-wider transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
