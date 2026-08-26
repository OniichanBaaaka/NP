import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('xiv_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  const applyTheme = (currentTheme) => {
    localStorage.setItem('xiv_theme', currentTheme);
    const root = document.documentElement;
    const body = document.body;

    if (currentTheme === 'dark') {
      root.className = 'dark';
      root.setAttribute('data-theme', 'dark');
      if (body) {
        body.className = 'dark';
        body.setAttribute('data-theme', 'dark');
      }
    } else {
      root.className = 'light';
      root.setAttribute('data-theme', 'light');
      if (body) {
        body.className = 'light';
        body.setAttribute('data-theme', 'light');
      }
    }
  };

  useEffect(() => {
    applyTheme(theme);
    window.__xiv_theme = theme;
    window.setTheme = (t) => setTheme(t);
    window.toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      return nextTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
