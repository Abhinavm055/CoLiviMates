import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const THEME_KEY = 'colivemates-theme';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
    const initialTheme = storedTheme === 'dark' ? 'dark' : 'light';
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const nextTheme: Theme = prevTheme === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', nextTheme === 'dark');
      localStorage.setItem(THEME_KEY, nextTheme);
      return nextTheme;
    });
  };

  return { theme, toggleTheme };
}
