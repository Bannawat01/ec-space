import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import WeaponList from './pages/WeaponList';
import Admin from './pages/Admin';
import Cart from './pages/Cart';
import Navbar from './components/Navbar';
import Topup from './pages/Topup';
import OrderHistory from './pages/OrderHistory';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />; 
  return children;
};

function App() {
  return (
    <Router>
      <div className="relative min-h-screen w-full">
        {/* วิดีโอพื้นหลัง - ตรวจสอบชื่อไฟล์ space_bg.mp4 ในโฟลเดอร์ public */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="fixed top-0 left-0 w-full h-full object-cover -z-20"
        >
          <source src="/space_bg.mp4" type="video/mp4" />
        </video>

        {/* ฟิลเตอร์มืดเพื่อให้ตัวหนังสืออ่านง่าย */}
        <div className="fixed top-0 left-0 w-full h-full bg-black/40 -z-10" />

        <div className="relative z-10 pt-20">
          <Navbar />
          <Routes>
            <Route path="/" element={<WeaponList />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/topup" element={<ProtectedRoute><Topup /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;