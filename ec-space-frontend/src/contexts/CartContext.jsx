/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';
import api from "../services/api";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // 🔄 1. ดึงข้อมูลตะกร้า
 const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      const data = Array.isArray(response.data) ? response.data : (response.data.items || []);
      
      const formattedCart = data
        .filter(item => item && item.weapon)
        .map(item => ({
          ...item.weapon,
          quantity: item.quantity,
          cart_item_id: item.id
        }))
        // 🌟 เพิ่มจุดนี้: เรียงลำดับตาม ID เสมอ เพื่อไม่ให้รายการเด้งไปมา
        .sort((a, b) => a.id - b.id); 

      setCart(formattedCart);
    } catch (error) {
      console.error("โหลดตะกร้าไม่สำเร็จ:", error);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🛒 2. เพิ่มสินค้า (ส่งค่าบวกปกติ)
 const addToCart = async (weapon, customQuantity = 1) => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert("กรุณาล็อกอินก่อนเลือกสินค้า");
    return;
  }

  try {
    const qtyToAdd = Number(customQuantity);
    const weaponId = Number(weapon.id);

    console.log(`กำลังเพิ่มสินค้า ID: ${weaponId} จำนวน: ${qtyToAdd}`);

    const response = await api.post('/cart', {
      weapon_id: weaponId,
      quantity: qtyToAdd
    });

    if (response.status === 200 || response.status === 201) {
      await fetchCart(); // อัปเดตตะกร้าให้เป็นปัจจุบัน
      alert(`✅ เพิ่ม ${weapon.name} ลงตะกร้าเรียบร้อย!`);
    }
  } catch (error) {
    // 🔍 ดึง Error จริงๆ จาก Backend ออกมาโชว์
    const errorMsg = error.response?.data?.error || error.response?.data?.message || "เกิดข้อผิดพลาดไม่ทราบสาเหตุ";
    
    console.error('Add to cart failed:', errorMsg);
    
    // แจ้งเตือนผู้ใช้ว่าทำไมถึงเพิ่มไม่ได้ เช่น "สต็อกไม่พอ" หรือ "ข้อมูลไม่ถูกต้อง"
    alert(`❌ เพิ่มสินค้าไม่ได้: ${errorMsg}`);
  }
};

  const updateQuantity = async (weaponId, newQuantity) => {
    const targetQty = Number(newQuantity);
    if (targetQty < 1) return removeFromCart(weaponId);

    try {
      const token = localStorage.getItem('token');
      
      // 1. ค้นหาไอเทมเฉพาะตัวที่เราจะกดเท่านั้น
      const itemInCart = cart.find(item => Number(item.id) === Number(weaponId));
      if (!itemInCart) return;

      // 2. ดำเนินการลบและเพิ่มใหม่ตามกลยุทธ์ Re-sync (ป้องกัน Stock Error)
      await api.delete(`/cart/${weaponId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }); 

      await api.post('/cart', {
        weapon_id: Number(weaponId),
        quantity: targetQty 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 🌟 3. จุดสำคัญ: ต้องโหลดตะกร้าใหม่ทั้งหมดจาก Server 
      // เพื่อให้แน่ใจว่าสินค้าตัวอื่นยังคงค่าเดิมไว้ ไม่โดนเขียนทับใน State
      await fetchCart(); 
      
      console.log(`✅ Updated only item ${weaponId} to ${targetQty}`);
    } catch (error) {
      console.error("Update failed:", error.message);
    }
  };

  // 🗑️ 4. ลบสินค้า
  const removeFromCart = async (weaponId) => {
    try {
      // Backend ของคุณใช้ Delete โดยอ้างอิง Weapon ID
      await api.delete(`/cart/${weaponId}`);
      await fetchCart();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("ลบสินค้าไม่สำเร็จ");
    }
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};