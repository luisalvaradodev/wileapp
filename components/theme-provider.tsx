"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  // 1. INICIALIZACIÓN SEGURA:
  // Se inicializa el estado con el valor por defecto, sin llamar a localStorage.
  // Esto evita el error en el servidor.
  const [theme, setTheme] = useState<Theme>(() => {
    // En el primer render del cliente, intentamos leer de localStorage.
    // Si estamos en el servidor, typeof window será 'undefined'.
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem(storageKey) as Theme;
      if (storedTheme) {
        return storedTheme;
      }
    }
    // Si no, usamos el tema por defecto.
    return defaultTheme;
  });

  // 2. EFECTO PARA ACTUALIZAR EL HTML:
  // Este useEffect que ya tenías es correcto y se encarga de aplicar la clase al <html>.
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    let effectiveTheme = theme;
    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }

    root.classList.add(effectiveTheme);

    // Guardamos el tema actual en localStorage cada vez que cambia.
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  const value = {
    theme,
    // La función setTheme simplemente actualiza el estado.
    // El useEffect de arriba se encargará de guardar en localStorage.
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};