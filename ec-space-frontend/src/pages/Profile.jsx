import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

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

  if (loading) return <div className="p-8">Loading profile...</div>;

  return (
    <div className="p-10 pt-28 max-w-3xl mx-auto">
      <h2 className="text-3xl font-black mb-6">Edit Profile</h2>

      <div className="glass-panel p-6 rounded-2xl">
        <div className="mb-4 flex items-center gap-6">
          <div className="w-28 h-28 rounded-full overflow-hidden bg-white/5 flex items-center justify-center">
            {avatarPreview ? (
              // eslint-disable-next-line jsx-a11y/img-redundant-alt
              <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm text-white/40">No Avatar</span>
            )}
          </div>
          <div>
            <label className="block text-sm text-white/60">Change Avatar</label>
            <input type="file" accept="image/*" onChange={handleFileChange} className="mt-2 text-sm text-white" />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-white/60">Username</label>
          <input value={profile.username} readOnly className="w-full mt-2 bg-black/20 text-white p-3 rounded" />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-white/60">Email</label>
          <input value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} className="w-full mt-2 bg-black/20 text-white p-3 rounded" />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-white/60">Address</label>
          <textarea value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} className="w-full mt-2 bg-black/20 text-white p-3 rounded h-28" />
        </div>

        <div className="flex gap-4">
          <button onClick={handleSave} disabled={saving} className="bg-cyan-500 text-black px-6 py-2 rounded-lg font-bold">{saving ? 'Saving...' : 'Save'}</button>
          <button onClick={() => navigate(-1)} className="bg-black/30 text-white px-6 py-2 rounded-lg">Cancel</button>
        </div>
      </div>
    </div>
  );
}
