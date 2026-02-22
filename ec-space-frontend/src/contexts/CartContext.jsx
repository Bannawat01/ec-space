/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';
import api from "../services/api";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // 🔄 1. ฟังก์ชันดึงข้อมูลตะกร้าจาก Database
  const fetchCart = async () => {
    const token = localStorage.getItem('token'); // ดึง token ใหม่ทุกครั้งที่เรียก
    if (!token) {
      setCart([]); // ถ้าไม่มี token ให้ล้างตะกร้าหน้าบ้าน
      return;
    }
    
    try {
      const response = await api.get('/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // แปลงข้อมูลจาก CartItem Model (Backend) ให้เข้ากับโครงสร้าง Frontend
      const formattedCart = response.data.map(item => ({
        ...item.weapon,
        quantity: item.quantity
      }));
      setCart(formattedCart);
    } catch (error) {
      console.error("โหลดตะกร้าไม่สำเร็จ:", error);
      if (error.response?.status === 401) setCart([]); // ถ้า Token หมดอายุให้ล้างตะกร้า
    }
  };

  // ดึงข้อมูลครั้งแรกเมื่อโหลดแอปหรือมีการเปลี่ยนสถานะการ Login
  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🛒 2. เพิ่มสินค้าและบันทึกลง Database
  const addToCart = async (weapon, qty = 1) => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.dispatchEvent(new CustomEvent('appToast', { detail: { message: 'กรุณาล็อกอินก่อนเลือกสินค้า', type: 'error' } }));
      return { ok: false, error: 'no_token' };
    }
    
    try {
      // basic front-end stock check
      if (weapon.stock !== undefined && weapon.stock <= 0) {
        window.dispatchEvent(new CustomEvent('appToast', { detail: { message: 'ขออภัย สินค้าหมดสต็อก', type: 'error' } }));
        return;
      }
      console.debug('CartContext.addToCart request', { weapon_id: weapon.id, quantity: qty });
      // ส่งไปที่ POST /api/cart เพื่อบันทึกลงตาราง cart_items
      const res = await api.post('/cart', { weapon_id: weapon.id, quantity: qty }, { headers: { Authorization: `Bearer ${token}` } });
      console.debug('CartContext.addToCart response', res);
      await fetchCart(); // ดึงข้อมูลล่าสุดจาก DB มาอัปเดต UI
      window.dispatchEvent(new CustomEvent('appToast', { detail: { message: `เพิ่ม ${weapon.name} x${qty} ลงในตะกร้าสำเร็จ`, type: 'info' } }));
      return { ok: true, data: res.data };
    } catch (error) {
      console.error('CartContext.addToCart error', error);
      const msg = error.response?.data?.error || error.message || "เพิ่มสินค้าไม่สำเร็จ";
      const status = error.response?.status;
      window.dispatchEvent(new CustomEvent('appToast', { detail: { message: `${msg}${status ? ' (status:'+status+')' : ''}`, type: 'error', duration: 8000 } }));
      return { ok: false, error: msg, status };
    }
  };

  // ➕ 3. อัปเดตจำนวนสินค้า (บวก/ลบ) ใน Database
  const updateQuantity = async (id, newQty) => {
    const token = localStorage.getItem('token');
    if (newQty < 1) return;
    
    // หาจำนวนปัจจุบันในตะกร้าเพื่อคำนวณส่วนต่าง (Diff) ที่จะส่งไปให้ Backend
    const currentItem = cart.find(i => i.id === id);
    if (!currentItem) return;

    // เช็ค Stock เบื้องต้นที่หน้าบ้าน
    if (newQty > currentItem.stock) {
      alert(`ขออภัย! อาวุธชิ้นนี้มีจำกัดเพียง ${currentItem.stock} ชิ้นเท่านั้น`);
      return;
    }

    try {
      const diff = newQty - currentItem.quantity;
      await api.post('/cart', 
        { weapon_id: id, quantity: diff }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
    } catch (error) {
      alert(error.response?.data?.error || "อัปเดตจำนวนไม่สำเร็จ");
    }
  };

  // 🗑️ 4. ลบสินค้าออกจาก Database
  const removeFromCart = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await api.delete(`/cart/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchCart(); // อัปเดตรายการหลังลบสำเร็จ
    } catch {
      alert("ลบสินค้าไม่สำเร็จ");
    }
  };

  // ฟังก์ชันล้างตะกร้าในหน้าบ้าน (ใช้หลัง Checkout สำเร็จ)
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};