/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';
import api from "../services/api";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // 🔄 1. ฟังก์ชันดึงข้อมูลตะกร้าจาก Database
  const fetchCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCart([]);
      return;
    }

    try {
      const response = await api.get('/cart');
      const formattedCart = response.data
        .filter(item => item.weapon)
        .map(item => ({
          ...item.weapon,
          quantity: item.quantity
        }));
      setCart(formattedCart);
    } catch (error) {
      console.error("โหลดตะกร้าไม่สำเร็จ:", error);
      if (error.response?.status === 401) setCart([]);
    }
  };

  // ดึงข้อมูลครั้งแรกเมื่อโหลดแอปหรือมีการเปลี่ยนสถานะการ Login
  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🛒 2. เพิ่มสินค้าและบันทึกลง Database
  const addToCart = async (weapon, customQuantity = 1) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("กรุณาล็อกอินก่อนเลือกสินค้า");
      throw new Error("No token");
    }

    try {
      const response = await api.post('/cart', {
        weapon_id: weapon.id,
        quantity: customQuantity
      });
      console.log('Successfully added to cart:', response.data);
      await fetchCart();
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || "ไม่สามารถเพิ่มสินค้า";
      console.error('Cart error:', errorMsg, error);
      throw new Error(errorMsg);
    }
  };

  // ➕ 3. อัปเดตจำนวนสินค้า (บวก/ลบ) ใน Database
  const updateQuantity = async (id, newQty) => {
    if (newQty < 1) return;

    const currentItem = cart.find(i => i.id === id);
    if (!currentItem) return;

    if (newQty > currentItem.stock) {
      alert(`ขออภัย! อาวุธชิ้นนี้มีจำกัดเพียง ${currentItem.stock} ชิ้นเท่านั้น`);
      return;
    }

    try {
      const diff = newQty - currentItem.quantity;
      await api.post('/cart', { weapon_id: id, quantity: diff });
      await fetchCart();
    } catch (error) {
      alert(error.response?.data?.error || "อัปเดตจำนวนไม่สำเร็จ");
    }
  };

  // 🗑️ 4. ลบสินค้าออกจาก Database
  const removeFromCart = async (id) => {
    try {
      await api.delete(`/cart/${id}`);
      await fetchCart();
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