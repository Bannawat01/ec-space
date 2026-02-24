import { createContext, useContext, useState } from 'react';

const ALIEN = {
  a:'ᗩ', b:'ᗷ', c:'ᑕ', d:'ᗞ', e:'ᗴ', f:'ᖴ', g:'ᘜ', h:'ᕼ', i:'ᓰ', j:'ᒍ',
  k:'ᛕ', l:'ᒪ', m:'ᗰ', n:'ᑎ', o:'ᗝ', p:'ᑭ', q:'ᑫ', r:'ᖇ', s:'ᔕ', t:'ᖶ',
  u:'ᑌ', v:'ᐯ', w:'ᗯ', x:'᙭', y:'ᖻ', z:'ᘔ',
};

function toAlien(text) {
  return String(text).split('').map(ch => ALIEN[ch.toLowerCase()] ?? ch).join('');
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [isAlien, setIsAlien] = useState(false);

  const t = (text) => isAlien ? toAlien(text) : text;
  const toggle = () => setIsAlien(prev => !prev);

  return (
    <LanguageContext.Provider value={{ isAlien, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
