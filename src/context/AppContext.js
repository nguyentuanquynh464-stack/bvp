import React, { createContext, useContext, useState } from 'react';
import { TV, TE } from '../constants/translations';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [lang, setLang] = useState('vi');
  const [isDark, setIsDark] = useState(false);
  const T = lang === 'vi' ? TV : TE;
  return (
    <AppContext.Provider value={{ lang, setLang, isDark, setIsDark, T }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

export function useTheme() {
  const { isDark } = useApp();
  return {
    bg:   isDark ? '#121827' : '#f0f2f7',
    cBg:  isDark ? '#1e2230' : '#fff',
    bdr:  isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    tx:   isDark ? '#e8ecf4' : '#1a2030',
    ts:   isDark ? '#8899aa' : '#6b7a8d',
    ac:   '#2563eb',
    acL:  isDark ? 'rgba(37,99,235,0.15)' : '#e8f0fe',
    hBg:  isDark ? '#1a2540' : '#1e2d4a',
    iBg:  isDark ? '#252b3b' : '#f7f8fb',
  };
}
