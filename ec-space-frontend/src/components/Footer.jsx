import React from 'react';

import { useEffect, useState, useRef } from 'react';

function Footer() {
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef(null);

  useEffect(() => {
    const threshold = 80; // px from bottom to trigger

    const onMove = (e) => {
      const y = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0;
      const fromBottom = window.innerHeight - y;
      if (fromBottom <= threshold) {
        setVisible(true);
        if (hideTimer.current) {
          clearTimeout(hideTimer.current);
          hideTimer.current = null;
        }
        // auto-hide after 2s of inactivity
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

  // When footer is visible, add bottom padding to body so page content isn't covered
  useEffect(() => {
    const pad = visible ? '180px' : '';
    const prev = document.body.style.paddingBottom;
    if (visible) document.body.style.paddingBottom = pad;
    else document.body.style.paddingBottom = '';
    return () => { document.body.style.paddingBottom = prev; };
  }, [visible]);

  return (
    <footer className="fixed bottom-0 left-0 w-full z-40 pointer-events-none">
      <div className="max-w-6xl mx-auto px-8 py-6 pointer-events-auto">
        <div className={`w-full bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl px-6 py-6 transform transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-6">
            <div className="w-full md:w-1/4">
              <h3 className="text-2xl font-black text-white">XENO ARMORY</h3>
              <p className="text-slate-500 mt-2 text-sm hidden md:block">Premium gear &amp; expert consultation</p>
            </div>

            <div className="w-full md:w-1/3">
              <p className="font-black text-white">About Us</p>
              <p className="text-slate-400 mt-2">The ultimate destination for shooters of all levels. We are dedicated to providing expert consultation and high-performance gear at competitive prices. Driven by excellence, committed to your safety.</p>
            </div>

            <div className="w-full md:w-1/3">
              <p className="font-black text-white">Contact</p>
              <ul className="mt-2 space-y-2 text-slate-300">
                <li><a className="hover:text-cyan-300" href="mailto:support@xenoarmory.example">support@xenoarmory.example</a></li>
                <li><a className="hover:text-cyan-300" href="tel:+15550199">+1 555-0199</a></li>
                <li className="text-slate-400 text-sm">123 Nebula Way, Sector 7</li>
              </ul>
            </div>

            <div className="w-full md:w-auto mt-4 md:mt-0 text-xs text-slate-600 md:ml-4">© {new Date().getFullYear()} Xeno Armory</div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
