import { useEffect, useState } from 'react';
import api from '../api';

function Admin() {
  const [weapons, setWeapons] = useState([]);
  const [editData, setEditData] = useState({});
  // 🆕 เพิ่มฟิลด์ stock ใน state ของอาวุธใหม่
  const [newWeapon, setNewWeapon] = useState({ name: '', type: '', price: '', stock: '', description: '', image: null });
  const userRole = localStorage.getItem('role');

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddWeapon = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newWeapon.name);
    formData.append('type', newWeapon.type);
    formData.append('price', newWeapon.price);
    formData.append('stock', newWeapon.stock); // 🆕 ส่งจำนวน stock
    formData.append('description', newWeapon.description);
    formData.append('image', newWeapon.image);

    try {
      const token = localStorage.getItem('token');
      await api.post('/admin/weapons', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data', 
          Authorization: `Bearer ${token}` 
        }
      });
      alert("เพิ่มอาวุธชิ้นใหม่เข้าสู่คลังแสงสำเร็จ!");
      setNewWeapon({ name: '', type: '', price: '', stock: '', description: '', image: null });
      fetchWeapons();
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการเพิ่มอาวุธ: " + (error.response?.data?.error || "Error"));
    }
  };

  const handleUpdateWeapon = async (id) => {
    const data = editData[id];
    if (!data || Object.keys(data).length === 0) {
      return alert("กรุณาแก้ไขข้อมูลก่อนกดบันทึก");
    }

    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== "") {
        formData.append(key, data[key]);
      }
    });

    try {
      const token = localStorage.getItem('token');
      await api.patch(`/admin/weapons/${id}`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });
      
      alert("อัปเดตข้อมูลอาวุธสำเร็จ!");
      const updatedEditData = { ...editData };
      delete updatedEditData[id];
      setEditData(updatedEditData);
      
      fetchWeapons();
    } catch (error) {
      const errorMsg = error.response?.data?.error || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์";
      alert("เกิดข้อผิดพลาด: " + errorMsg);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`⚠️ ยืนยันการทำลายอาวุธ: ${name} ? \nข้อมูลนี้จะหายไปจากคลังแสงถาวร`)) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/admin/weapons/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("ลบข้อมูลสำเร็จ!");
        fetchWeapons(); 
      } catch (error) {
        alert("ไม่สามารถลบได้: " + (error.response?.data?.error || "Error"));
      }
    }
  };

  const handleChange = (id, field, value) => {
    setEditData(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  if (userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        <div className="p-8 bg-red-900/20 border border-red-500 rounded-2xl text-center">
          <h1 className="text-2xl font-bold mb-2">⚠️ ปฏิเสธการเข้าถึง</h1>
          <p>เฉพาะผู้บัญชาการ (Admin) เท่านั้นที่เข้าถึงฐานข้อมูลนี้ได้</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 bg-slate-950 min-h-screen text-white">
      <h1 className="text-3xl font-black mb-8 text-cyan-400 tracking-tighter italic">
        SYSTEM <span className="text-white">CORE:</span> INVENTORY CONTROL
      </h1>

      {/* 🆕 ฟอร์มเพิ่มอาวุธใหม่ (เพิ่มฟิลด์ Stock) */}
      <div className="mb-12 bg-slate-900/50 border border-cyan-500/30 p-8 rounded-3xl shadow-[0_0_30px_rgba(8,145,178,0.1)]">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
          <span className="text-cyan-500 text-2xl">+</span> REGISTER NEW ARMAMENT
        </h2>
        <form onSubmit={handleAddWeapon} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <input 
            type="text" placeholder="Armament Name" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-cyan-500 outline-none"
            value={newWeapon.name} onChange={(e) => setNewWeapon({...newWeapon, name: e.target.value})} required 
          />
          <select 
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-cyan-500 outline-none text-slate-400"
            value={newWeapon.type} onChange={(e) => setNewWeapon({...newWeapon, type: e.target.value})} required
          >
            <option value="">Select Type</option>
            <option value="Melee">Melee</option>
            <option value="Plasma">Plasma</option>
            <option value="Ballistic">Ballistic</option>
          </select>
          <input 
            type="number" placeholder="Credit Price" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-cyan-500 outline-none"
            value={newWeapon.price} onChange={(e) => setNewWeapon({...newWeapon, price: e.target.value})} required 
          />
          {/* 🆕 Input จำนวนสินค้าใหม่ */}
          <input 
            type="number" placeholder="Initial Stock" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-cyan-500 outline-none"
            value={newWeapon.stock} onChange={(e) => setNewWeapon({...newWeapon, stock: e.target.value})} required 
          />
          <textarea 
            placeholder="Technical Specifications" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-cyan-500 outline-none lg:col-span-3"
            value={newWeapon.description} onChange={(e) => setNewWeapon({...newWeapon, description: e.target.value})} required 
          />
          <div className="flex flex-col gap-2 lg:col-span-1">
            <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">Weapon Schematic</label>
            <input 
              type="file" accept="image/*"
              className="text-xs text-slate-500 file:bg-slate-800 file:border-none file:px-3 file:py-2 file:rounded-lg file:text-cyan-400 file:font-bold cursor-pointer"
              onChange={(e) => setNewWeapon({...newWeapon, image: e.target.files[0]})} required 
            />
          </div>
          <button type="submit" className="lg:col-span-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 uppercase tracking-widest mt-2">
            Deploy New Weapon to Inventory
          </button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-2xl">
        <table className="min-w-full bg-slate-900 overflow-hidden">
          <thead>
            <tr className="bg-slate-800/50 text-slate-400 uppercase text-xs tracking-[0.2em]">
              <th className="px-6 py-5 text-left">Visual Profile</th>
              <th className="px-6 py-5 text-left">Specifications</th>
              <th className="px-6 py-5 text-left">Inventory & Value</th>
              <th className="px-6 py-5 text-center">Command</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {weapons.map((weapon) => (
              <tr key={weapon.id} className="hover:bg-cyan-500/[0.02] transition-colors">
                <td className="px-6 py-6">
                  <div className="flex flex-col gap-3">
                    <div className="relative w-24 h-24">
                      <img 
                        src={`http://localhost:8080/${weapon.image_url}`} 
                        className="w-full h-full object-cover rounded-xl border-2 border-slate-700 hover:border-cyan-500 transition-all" 
                        alt="" 
                      />
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-slate-800 file:text-cyan-400 cursor-pointer"
                      onChange={(e) => handleChange(weapon.id, 'image', e.target.files[0])}
                    />
                  </div>
                </td>

                <td className="px-6 py-6">
                  <div className="flex flex-col gap-3 max-w-xs">
                    <input
                      type="text"
                      className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-cyan-400 font-bold focus:border-cyan-500 outline-none"
                      defaultValue={weapon.name}
                      onChange={(e) => handleChange(weapon.id, 'name', e.target.value)}
                    />
                    <textarea
                      className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-400 text-sm h-20 focus:border-cyan-500 outline-none resize-none"
                      defaultValue={weapon.description}
                      onChange={(e) => handleChange(weapon.id, 'description', e.target.value)}
                    />
                  </div>
                </td>

                <td className="px-6 py-6 text-sm">
                  <div className="flex flex-col gap-4">
                    {/* ส่วนจัดการ Stock */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-500 uppercase font-bold italic">Stock Status: {weapon.stock} Units</span>
                      <input
                        type="number"
                        className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 w-32 text-blue-400 font-mono focus:border-blue-500 outline-none"
                        placeholder="Update Stock"
                        onChange={(e) => handleChange(weapon.id, 'stock', e.target.value)}
                      />
                    </div>
                    {/* ส่วนจัดการราคา */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="text-[10px] uppercase font-bold italic">Current Value:</span>
                        <span className="font-mono text-cyan-400">{weapon.price.toLocaleString()} Cr</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          className="bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-8 py-2 w-32 text-green-400 font-mono focus:border-green-500 outline-none"
                          placeholder="Update Price"
                          onChange={(e) => handleChange(weapon.id, 'price', e.target.value)}
                        />
                        <span className="absolute right-3 top-2 text-xs text-slate-600 font-bold uppercase">Cr</span>
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-6 text-center">
                  <div className="flex flex-col gap-3 items-center">
                    <button
                      onClick={() => handleUpdateWeapon(weapon.id)}
                      className="w-32 bg-cyan-600 hover:bg-cyan-500 text-white font-black py-2 rounded-xl transition-all active:scale-95 shadow-lg shadow-cyan-900/20 uppercase tracking-widest text-[10px]"
                    >
                      Sync Data
                    </button>
                    <button
                      onClick={() => handleDelete(weapon.id, weapon.name)}
                      className="text-red-500 hover:text-red-400 text-[10px] font-bold transition-all uppercase tracking-tighter hover:underline"
                    >
                      🗑️ Remove Weapon
                    </button>
                  </div>
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