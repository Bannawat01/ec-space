import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import WeaponList from './pages/WeaponList'; 
import Admin from './pages/Admin';
import WeaponDetail from './pages/WeaponDetail'; 
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Topup from './pages/Topup';
import OrderHistory from './pages/OrderHistory';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <div className="relative min-h-screen w-full bg-transparent">
        {/* วิดีโอต้องอยู่ที่ -z-50 และ fixed */}
        <video 
          autoPlay loop muted 
          className="fixed top-0 left-0 w-full h-full object-cover -z-50"
        >
          <source src="/space03.mp4" type="video/mp4" />
        </video>

        <div className="relative z-10">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<WeaponList />} />
              <Route path="/inventory" element={<WeaponList />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/weapon/:id" element={<WeaponDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/topup" element={<Topup />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/history" element={<OrderHistory />} />
            </Routes>
          </main>
          <Footer />
          <Toast />
        </div>

      </div>
    </Router>
  );
}

export default App;