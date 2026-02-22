import { useEffect, useState } from 'react';

export default function Toast() {
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  useEffect(() => {
    let timer = null;
    const handler = (e) => {
      const detail = e.detail || { message: String(e), type: 'info' };
      setToast({ visible: true, message: detail.message || 'Notification', type: detail.type || 'info' });
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setToast(t => ({ ...t, visible: false })), detail.duration || 4000);
    };

    window.addEventListener('appToast', handler);
    return () => {
      window.removeEventListener('appToast', handler);
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!toast.visible) return null;

  const color = toast.type === 'error' ? 'bg-red-600/60' : 'bg-cyan-600/60';

  return (
    <div className="fixed left-1/2 transform -translate-x-1/2 bottom-8 z-60 pointer-events-none">
      <div className={`glass-panel ${color} text-white px-6 py-3 rounded-2xl shadow-xl backdrop-blur-sm max-w-xl pointer-events-auto`}> 
        <div className="text-sm font-medium">{toast.message}</div>
      </div>
    </div>
  );
}
