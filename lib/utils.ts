import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { SaleItem, SearchableSelectOption } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'USD', locale = 'es-VE'): string {
  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) return currency === 'USD' ? '$ 0.00' : '0,00 Bs.';
  
  if (currency === 'USD') {
    return new Intl.NumberFormat(locale, { 
      style: 'currency', 
      currency: 'USD', 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(numericAmount);
  } else {
    return new Intl.NumberFormat(locale, { 
      style: 'decimal', 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(numericAmount) + ' Bs.';
  }
}

export function convertBsToUsd(amountBs: number, exchangeRate: number): number {
  return amountBs / exchangeRate;
}

export function convertUsdToBs(amountUsd: number, exchangeRate: number): number {
  return amountUsd * exchangeRate;
}

export function formatDate(dateStringOrObject: string | Date | null | undefined, format = 'dd/mm/yy'): string {
  if (!dateStringOrObject) return '';
  
  let dateObj: Date;
  if (typeof dateStringOrObject === 'string') {
    dateObj = new Date(dateStringOrObject.includes('T') ? dateStringOrObject : dateStringOrObject + 'T00:00:00');
  } else if (dateStringOrObject instanceof Date) {
    dateObj = dateStringOrObject;
  } else {
    return 'Fecha inválida';
  }

  if (isNaN(dateObj.getTime())) return 'Fecha inválida';

  const day = String(dateObj.getUTCDate()).padStart(2, '0');
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const year = dateObj.getUTCFullYear().toString();

  if (format === 'dd/mm/yy') return `${day}/${month}/${year.slice(-2)}`;
  if (format === 'yyyy-mm-dd') return `${year}-${month}-${day}`;
  return dateObj.toLocaleDateString(navigator.language || 'es-VE', { timeZone: 'UTC' });
}

export function calculateProfit(saleItems: SaleItem[]): number {
  return saleItems.reduce((total, item) => {
    const itemProfit = (item.unit_price - item.cost_price) * item.quantity;
    return total + itemProfit;
  }, 0);
}

export function getRandomCatImage(): string {
  const catImages = [
    'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/2071882/pexels-photo-2071882.jpeg?auto=compress&cs=tinysrgb&w=400'
  ];
  return catImages[Math.floor(Math.random() * catImages.length)];
}

// Animation utilities
export function getRandomAnimation(): string {
  const animations = [
    'animate-bounce',
    'animate-pulse',
    'animate-ping',
    'animate-spin'
  ];
  return animations[Math.floor(Math.random() * animations.length)];
}

export function getCategoryColor(categoryName?: string): string {
  // Un fondo sólido y seguro como opción por defecto si no hay nombre.
  if (!categoryName) return 'bg-card';

  // Paleta de colores sutiles y neutros con soporte para modo oscuro.
  const colors: Record<string, string> = {
    'helados': 'from-slate-50 to-slate-200 dark:from-slate-800 dark:to-slate-700',
    'bebidas': 'from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-700',
    'snacks': 'from-zinc-50 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700',
    'lacteos': 'from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700',
    'endulzantes': 'from-stone-50 to-stone-200 dark:from-stone-800 dark:to-stone-700',
    'chocolates': 'from-stone-100 to-stone-300 dark:from-stone-800 dark:to-stone-900',
    'frutas': 'from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700',
    'frutos_secos': 'from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700',
    'esencias': 'from-neutral-50 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700',
    'otros': 'from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700'
  };

  // Busca el color para la categoría y, si no lo encuentra, usa el fondo de tarjeta por defecto.
  return colors[categoryName.toLowerCase()] || 'bg-card';
}

export function getCategoryEmoji(categoryName?: string): string {
  if (!categoryName) return '📦';
  
  const emojis: Record<string, string> = {
    'helados': '🍦',
    'bebidas': '🥤',
    'snacks': '🍿',
    'lacteos': '🥛',
    'endulzantes': '🍯',
    'chocolates': '🍫',
    'frutas': '🍓',
    'frutos_secos': '🥜',
    'esencias': '🌸',
    'otros': '📦'
  };
  
  return emojis[categoryName.toLowerCase()] || '📦';
}

// Search and filter utilities
export function filterOptions<T>(
  items: T[],
  searchTerm: string,
  searchKeys: (keyof T)[]
): T[] {
  if (!searchTerm.trim()) return items;
  
  const term = searchTerm.toLowerCase();
  return items.filter(item =>
    searchKeys.some(key => {
      const value = item[key];
      return typeof value === 'string' && value.toLowerCase().includes(term);
    })
  );
}

export function createSearchableOptions<T>(
  items: T[],
  valueKey: keyof T,
  labelKey: keyof T,
  descriptionKey?: keyof T,
  categoryKey?: keyof T
): SearchableSelectOption[] {
  return items.map(item => ({
    value: String(item[valueKey]),
    label: String(item[labelKey]),
    description: descriptionKey ? String(item[descriptionKey]) : undefined,
    category: categoryKey ? String(item[categoryKey]) : undefined,
    extra: item
  }));
}

// Number formatting utilities
export function formatNumber(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
}

export function parseNumber(str: string): number {
  const parsed = parseFloat(str.replace(/[^\d.-]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}

// Validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Date utilities
export function getDateRange(days: number): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
}

export function isToday(date: string | Date): boolean {
  const today = new Date().toISOString().split('T')[0];
  const checkDate = typeof date === 'string' ? date.split('T')[0] : date.toISOString().split('T')[0];
  return today === checkDate;
}

// Storage utilities
export function setLocalStorage(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

export function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Failed to read from localStorage:', error);
    return defaultValue;
  }
}

// Random utilities for fun elements
export function getRandomCatFact(): string {
  const facts = [
    "Los gatos tienen 32 músculos en cada oído 🐱",
    "Un gato puede saltar hasta 6 veces su longitud 🦘",
    "Los gatos duermen entre 12-16 horas al día 😴",
    "Los bigotes de un gato son tan anchos como su cuerpo 📏",
    "Los gatos pueden hacer más de 100 sonidos diferentes 🎵"
  ];
  return facts[Math.floor(Math.random() * facts.length)];
}

export function getMotivationalMessage(): string {
  const messages = [
    "¡Sigue así! Tus helados son los mejores 🍦",
    "Cada venta es un paso hacia el éxito 📈",
    "Con dedicación y amor, todo es posible ❤️",
    "Los gatitos creen en ti 🐱",
    "¡Hoy es un gran día para hacer helados! ☀️"
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}