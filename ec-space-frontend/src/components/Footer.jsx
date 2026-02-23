import React from 'react';
import { useEffect, useState, useRef } from 'react';

function Footer() {
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef(null);

  useEffect(() => {
    const threshold = 80;

    const onMove = (e) => {
      const y = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0;
      const fromBottom = window.innerHeight - y;
      if (fromBottom <= threshold) {
        setVisible(true);
        if (hideTimer.current) {
          clearTimeout(hideTimer.current);
          hideTimer.current = null;
        }
        hideTimer.current = setTimeout(() => setVisible(false), 2000);
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchstart', onMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchstart', onMove);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  useEffect(() => {
    const pad = visible ? '180px' : '';
    const prev = document.body.style.paddingBottom;
    if (visible) document.body.style.paddingBottom = pad;
    else document.body.style.paddingBottom = '';
    return () => { document.body.style.paddingBottom = prev; };
  }, [visible]);

  return (
    // 1. ใส่ pointer-events-none ครอบทั้งหมด เพื่อให้คลิกทะลุไปข้างหลังได้
    <footer className="fixed bottom-0 left-0 w-full z-40 pointer-events-none">
      {/* 2. เอา py-6 ออกจาก div นี้เพื่อไม่ให้พื้นที่ล่องหนแผ่กว้างเกินไป */}
      <div className="max-w-6xl mx-auto px-8">
        <div className={`
          w-full bg-black/60 backdrop-blur-2xl border border-white/10 rounded-t-2xl px-6 py-6 
          transform transition-transform duration-300 mb-0
          ${visible ? 'translate-y-0 pointer-events-auto' : 'translate-y-full pointer-events-none'}
        `}>
          {/* ⬆️ 3. ใส่ pointer-events-auto เฉพาะตอนที่ Footer แสดงผลเท่านั้น (visible) */}
          
          <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-6">
            <div className="w-full md:w-1/4">
              <h3 className="text-2xl font-black text-white">XENO ARMORY</h3>
              <p className="text-slate-500 mt-2 text-sm hidden md:block">Premium gear &amp; expert consultation</p>
            </div>

            <div className="w-full md:w-1/3">
              <p className="font-black text-white">About Us</p>
              <p className="text-slate-400 mt-2 text-xs">The ultimate destination for shooters of all levels. We are dedicated to providing expert consultation and high-performance gear.</p>
            </div>

            <div className="w-full md:w-1/3">
              <p className="font-black text-white text-sm">Contact</p>
              <ul className="mt-2 space-y-1 text-slate-300 text-xs">
                <li><a className="hover:text-cyan-300" href="mailto:support@xenoarmory.example">support@xenoarmory.example</a></li>
                <li><a className="hover:text-cyan-300" href="tel:+15550199">+1 555-0199</a></li>
              </ul>
            </div>

            <div className="w-full md:w-auto mt-4 md:mt-0 text-[10px] text-slate-600 md:ml-4 uppercase font-bold tracking-widest">
              © {new Date().getFullYear()} Xeno Armory
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;