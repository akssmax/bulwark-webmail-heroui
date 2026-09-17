"use client";

import { useEffect } from 'react';
import { useThemeStore } from '@/stores/theme-store';
import { useCustomThemeStore } from '@/lib/theme/custom-theme-store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);
  const initializeCustomTheme = useCustomThemeStore((state) => state.initialize);

  useEffect(() => {
    initializeTheme();
    initializeCustomTheme();
  }, [initializeTheme, initializeCustomTheme]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        const { resolvedTheme, setTheme } = useThemeStore.getState();
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return <>{children}</>;
}