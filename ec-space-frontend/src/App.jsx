import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import WeaponList from './pages/WeaponList';
import Admin from './pages/Admin';
import Cart from './pages/Cart'; 
import Navbar from './Navbar'; 
import Topup from './pages/Topup';
import OrderHistory from './pages/OrderHistory'; // 🆕 นำเข้าหน้าประวัติการสั่งซื้อ

// Component เช็คสิทธิ์เข้าถึงหน้าต่างๆ (ต้องล็อกอินก่อน)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />; 
  return children;
};

function App() {
  return (
    <Router>
      {/* Navbar แสดงผลคงที่ทุกหน้า เพื่อโชว์ Credits และ Badge ตะกร้า */}
      <Navbar />

      {/* พื้นหลังธีม Dark Mode ของทั้งระบบ */}
      <div className="min-h-screen bg-slate-950">
        <Routes>
          {/* 🌎 หน้าที่เข้าถึงได้ทั่วไป */}
          <Route path="/" element={<WeaponList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          
          {/* 🔐 หน้าที่ต้องล็อกอินก่อนเข้าใช้งาน (Protected Routes) */}
          <Route path="/topup" element={
            <ProtectedRoute>
              <Topup />
            </ProtectedRoute>
          } />

          {/* 🆕 เพิ่มเส้นทางสำหรับดูประวัติการสั่งซื้อ */}
          <Route path="/history" element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;