import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
theme: Theme;
setTheme: (theme: Theme) => void;
isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
const [theme, setThemeState] = useState<Theme>(() => {
const saved = localStorage.getItem('theme');
return (saved as Theme) || 'system';
});

const [isDark, setIsDark] = useState(false);

useEffect(() => {
    localStorage.setItem('theme', theme);

    const applyTheme = () => {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        setIsDark(true);
      } else if (theme === 'light') {
        root.classList.remove('dark');
        setIsDark(false);
      } else {
        // System preference
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (systemPrefersDark) {
          root.classList.add('dark');
          setIsDark(true);
        } else {
          root.classList.remove('dark');
          setIsDark(false);
        }
      }
    };

    applyTheme();

    // Listen for system theme changes if theme is 'system'
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }

}, [theme]);

const setTheme = (newTheme: Theme) => {
setThemeState(newTheme);
};

return (
<ThemeContext.Provider value={{ theme, setTheme, isDark }}>
{children}
</ThemeContext.Provider>
);
};

export const useTheme = () => {
const context = useContext(ThemeContext);
if (!context) {
throw new Error('useTheme must be used within ThemeProvider');
}
return context;
};