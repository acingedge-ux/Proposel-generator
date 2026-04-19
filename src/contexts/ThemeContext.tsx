import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'brutalist' | 'minimalist' | 'zine';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('proposal-theme');
    return (saved as Theme) || 'brutalist';
  });

  useEffect(() => {
    localStorage.setItem('proposal-theme', theme);
    const root = window.document.documentElement;
    root.classList.remove('theme-brutalist', 'theme-minimalist', 'theme-zine');
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
