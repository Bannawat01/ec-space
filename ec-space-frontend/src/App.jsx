import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import WeaponList from './pages/WeaponList';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Topup from './pages/Topup';
import OrderHistory from './pages/OrderHistory';
import Admin from './pages/Admin';

// ระบบเช็คสิทธิ์: ถ้าจะเข้าหน้า Admin ต้องมีชื่อ admin เท่านั้น
const AdminRoute = ({ children }) => {
  const username = localStorage.getItem('username');
  if (username?.toLowerCase() !== 'admin') {
    return <Navigate to="/" />; // ถ้าไม่ใช่แอดมิน ให้ดีดไปหน้าแรก
  }
  return children;
};

function App() {
  return (
    <Router>
      <div className="relative min-h-screen w-full text-white">
        {/* วิดีโออวกาศชัดแจ๋ว (ไม่มีฟิล์มบัง) */}
        <video autoPlay loop muted playsInline className="fixed top-0 left-0 w-full h-full object-cover -z-20">
          <source src="/space_bg.mp4" type="video/mp4" />
        </video>

        <Navbar />

        <main className="relative z-10 pt-20 min-h-screen">
          <div className="container mx-auto px-4 pb-12">
            <Routes>
              <Route path="/" element={<WeaponList />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/topup" element={<Topup />} />
              <Route path="/history" element={<OrderHistory />} />
              
              {/* ปกป้องหน้า Admin ไว้ให้เฉพาะชื่อ admin */}
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;