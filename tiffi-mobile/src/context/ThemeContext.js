import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dark, light } from '../theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('theme_mode').then(v => {
      if (v !== null) setIsDark(v === 'dark');
    });
  }, []);

  const toggle = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem('theme_mode', next ? 'dark' : 'light');
  };

  const theme = isDark ? dark : light;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
