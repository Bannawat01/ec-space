import { useEffect, useState } from 'react';
import api from '../services/api';
import categories from '../constants/categories';

function Admin() {
  const [weapons, setWeapons] = useState([]);
  const [editData, setEditData] = useState({});
  const [newWeapon, setNewWeapon] = useState({ name: '', type: 'Standard', price: '', stock: '', description: '', image: null });
  
  const username = localStorage.getItem('username');

  const fetchWeapons = async () => {
    try {
      const response = await api.get('/weapons');
      setWeapons(response.data);
    } catch (error) {
      console.error("ดึงข้อมูลไม่สำเร็จ:", error);
    }
  };

  useEffect(() => {
    fetchWeapons();
  }, []);

  // --- ฟังก์ชันจัดการข้อมูล ---
  const handleAddWeapon = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newWeapon.name);
    formData.append('type', newWeapon.type);
    formData.append('price', newWeapon.price);
    formData.append('stock', newWeapon.stock);
    formData.append('description', newWeapon.description);
    formData.append('image', newWeapon.image);

    try {
      const token = localStorage.getItem('token');
      await api.post('/admin/weapons', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      alert("เพิ่มสำเร็จ!");
      setNewWeapon({ name: '', type: '', price: '', stock: '', description: '', image: null });
      fetchWeapons();
    } catch (error) {
      alert("Error: " + (error.response?.data?.error || "Error"));
    }
  };

  const handleUpdateWeapon = async (id) => {
    const data = editData[id];
    if (!data) return alert("ไม่มีข้อมูลการเปลี่ยนแปลง");
    const formData = new FormData();
    Object.keys(data).forEach(key => formData.append(key, data[key]));

    try {
      const token = localStorage.getItem('token');
      await api.patch(`/admin/weapons/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      alert("อัปเดตสำเร็จ!");
      fetchWeapons();
    } catch (error) {
      alert("Error: " + (error.response?.data?.error || "Error"));
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`ลบ ${name}?`)) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/admin/weapons/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchWeapons();
      } catch (error) {
        alert("ลบไม่สำเร็จ");
      }
    }
  };

  const handleChange = (id, field, value) => {
    setEditData(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  // 🛡️ เช็คสิทธิ์ (ถ้าไม่ใช่ admin ให้โชว์หน้า Denied แบบใส)
  if (username?.toLowerCase() !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-transparent text-white">
        <div className="p-10 bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-[3rem] text-center">
          <h1 className="text-3xl font-black mb-2">⚠️ ACCESS DENIED</h1>
          <p className="text-white/60">Commander "admin" login required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 bg-transparent min-h-screen text-white">
      <h1 className="text-4xl font-black mb-8 text-cyan-400 italic tracking-tighter">
        SYSTEM <span className="text-white">CORE</span>
      </h1>

      {/* ฟอร์มเพิ่มอาวุธ - กระจกใส */}
      <div className="mb-12 bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
        <form onSubmit={handleAddWeapon} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input type="text" placeholder="Name" className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none" value={newWeapon.name} onChange={(e) => setNewWeapon({...newWeapon, name: e.target.value})} required />
          <select value={newWeapon.type} onChange={(e) => setNewWeapon({...newWeapon, type: e.target.value})} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none text-black">
            {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="number" placeholder="Price" className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none" value={newWeapon.price} onChange={(e) => setNewWeapon({...newWeapon, price: e.target.value})} required />
          <input type="number" placeholder="Stock" className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none" value={newWeapon.stock} onChange={(e) => setNewWeapon({...newWeapon, stock: e.target.value})} required />
          <input type="file" className="text-xs self-center" onChange={(e) => setNewWeapon({...newWeapon, image: e.target.files[0]})} required />
          <button type="submit" className="md:col-span-4 bg-cyan-600 hover:bg-cyan-500 py-4 rounded-2xl font-black uppercase">Deploy Armament</button>
        </form>
      </div>

      {/* ตารางจัดการ - โปร่งใสเห็นวิดีโอ */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-slate-400">
            <tr>
              <th className="p-6">Visual</th>
              <th className="p-6">Details</th>
              <th className="p-6">Inventory</th>
              <th className="p-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {weapons.map((weapon) => (
              <tr key={weapon.id} className="hover:bg-white/5 transition-all">
                <td className="p-6">
                  <img src={`http://localhost:8080/${weapon.image_url}`} className="w-20 h-20 object-cover rounded-xl border border-white/10" alt="" />
                </td>
                <td className="p-6">
                  <input defaultValue={weapon.name} onChange={(e) => handleChange(weapon.id, 'name', e.target.value)} className="bg-black/20 border border-white/10 rounded px-2 py-1 w-full mb-2 outline-none text-cyan-400 font-bold" />
                  <textarea defaultValue={weapon.description} onChange={(e) => handleChange(weapon.id, 'description', e.target.value)} className="bg-black/20 border border-white/10 rounded px-2 py-1 w-full h-16 text-xs text-slate-400 outline-none" />
                  <div className="mt-2">
                    <label className="text-xs text-slate-400">Category</label>
                    <select defaultValue={weapon.type} onChange={(e) => handleChange(weapon.id, 'type', e.target.value)} className="bg-black/20 border border-white/10 rounded px-3 py-1 w-44 ml-0 outline-none text-black">
                      {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-slate-500">Stock: {weapon.stock}</span>
                    <input type="number" placeholder="Update" onChange={(e) => handleChange(weapon.id, 'stock', e.target.value)} className="bg-black/20 border border-white/10 rounded px-2 py-1 w-20 outline-none" />
                  </div>
                </td>
                <td className="p-6 text-center">
                  <button onClick={() => handleUpdateWeapon(weapon.id)} className="bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 px-4 py-1 rounded-lg text-xs font-bold hover:bg-cyan-600 hover:text-white transition-all">Sync</button>
                  <button onClick={() => handleDelete(weapon.id, weapon.name)} className="block w-full mt-2 text-[10px] text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Admin;