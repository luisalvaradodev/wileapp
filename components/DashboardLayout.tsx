"use client";

import React, { useState, useEffect } from 'react';
import { Cat, Menu, X, Home, Package, ShoppingCart, BarChart3, Settings, Sparkles, Heart, PawPrint, Crown, Star, Coffee, Gift, Zap, Bell, User, LogOut, ChevronRight, Calendar, Clock, TrendingUp } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CatLoader } from './CatLoader';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simular carga inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: Home, 
      path: '/dashboard',
      gradient: 'from-emerald-500 to-teal-600',
      darkGradient: 'dark:from-emerald-600 dark:to-teal-700',
      emoji: '🏠',
      description: 'Vista general'
    },
    { 
      id: 'products', 
      label: 'Productos', 
      icon: Package, 
      path: '/products',
      gradient: 'from-blue-500 to-indigo-600',
      darkGradient: 'dark:from-blue-600 dark:to-indigo-700',
      emoji: '📦',
      description: 'Gestionar inventario'
    },
    { 
      id: 'sales', 
      label: 'Ventas', 
      icon: ShoppingCart, 
      path: '/sales',
      gradient: 'from-purple-500 to-pink-600',
      darkGradient: 'dark:from-purple-600 dark:to-pink-700',
      emoji: '🛒',
      description: 'Centro de ventas'
    },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    setSidebarOpen(false);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return { greeting: '¡Buenos días!', emoji: '🌅', catEmoji: '😸' };
    if (hour < 18) return { greeting: '¡Buenas tardes!', emoji: '☀️', catEmoji: '😺' };
    return { greeting: '¡Buenas noches!', emoji: '🌙', catEmoji: '😴' };
  };

  const { greeting, emoji, catEmoji } = getGreeting();

  // Mostrar CatLoader mientras carga
  if (isLoading) {
    return <CatLoader onLoadComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-200/10 via-pink-200/5 to-blue-200/10 dark:from-purple-500/5 dark:via-pink-500/3 dark:to-blue-500/5 animate-pulse"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-300/20 dark:bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Floating Cat Elements */}
        <div className="absolute top-10 left-10 text-4xl opacity-5 dark:opacity-10 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>🐱</div>
        <div className="absolute top-32 right-20 text-3xl opacity-5 dark:opacity-10 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}>😸</div>
        <div className="absolute bottom-20 left-1/4 text-4xl opacity-5 dark:opacity-10 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}>🐾</div>
        <div className="absolute top-1/2 right-10 text-2xl opacity-5 dark:opacity-10 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4.5s' }}>😺</div>
        <div className="absolute bottom-32 right-1/3 text-3xl opacity-5 dark:opacity-10 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3s' }}>🐈</div>
        <div className="absolute top-20 left-1/2 text-2xl opacity-5 dark:opacity-10 animate-bounce" style={{ animationDelay: '2.5s', animationDuration: '4s' }}>😻</div>
      </div>

      {/* Sidebar */}
      {/* CAMBIO: Se añade flex y flex-col para crear un layout de columna flexible */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl border-r border-white/20 dark:border-slate-700/50 transform transition-all duration-500 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col`}>
        {/* Sidebar Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-pink-500/3 to-blue-500/5 dark:from-purple-600/10 dark:via-pink-600/5 dark:to-blue-600/10"></div>
        
        {/* CAMBIO: Se envuelve el contenido principal en un div que crece y permite scroll */}
        <div className="flex-1 overflow-y-auto">
            {/* Header Section */}
            <div className="relative z-10 p-6 border-b border-white/10 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
                {/* Logo and Brand */}
                <div className="flex items-center space-x-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                    <div className="relative w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 dark:from-purple-600 dark:via-pink-600 dark:to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl border border-white/20 dark:border-white/30">
                    <Cat className="w-8 h-8 text-white animate-pulse" />
                    </div>
                </div>
                <div>
                    <h1 className="text-2xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
                    Wile
                    </h1>
                    <p className="text-sm text-muted-foreground font-semibold">Emprendimientos</p>
                    <div className="flex items-center space-x-1 mt-1">
                    <PawPrint className="w-3 h-3 text-purple-500 dark:text-purple-400" />
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Con amor gatuno</span>
                    </div>
                </div>
                </div>
                
                {/* Close Button */}
                <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden h-10 w-10 rounded-xl hover:bg-white/20 dark:hover:bg-slate-700/50 transition-all duration-300"
                >
                <X className="w-5 h-5" />
                </Button>
            </div>

            {/* Greeting Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 dark:from-purple-600/20 dark:via-pink-600/20 dark:to-blue-600/20 backdrop-blur-xl p-4 border border-white/20 dark:border-slate-700/50">
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 dark:from-white/10 dark:via-transparent dark:to-white/10 animate-pulse"></div>
                <div className="relative z-10 flex items-center space-x-3">
                <div className="text-2xl animate-bounce">{emoji}</div>
                <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">{greeting}</p>
                    <p className="text-xs text-muted-foreground flex items-center space-x-1">
                    <span>{catEmoji}</span>
                    <span>¡Listo para vender!</span>
                    </p>
                </div>
                </div>
            </div>
            </div>

            {/* Navigation Menu */}
            <nav className="relative z-10 p-4 space-y-2">
            <div className="mb-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-3 mb-3 flex items-center space-x-2">
                <Sparkles className="w-3 h-3" />
                <span>Navegación</span>
                </p>
            </div>
            
            {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                const isHovered = hoveredItem === item.id;
                
                return (
                <div
                    key={item.id}
                    className="relative group"
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                >
                    {/* Active/Hover Background */}
                    <div className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
                    isActive 
                        ? `bg-gradient-to-r ${item.gradient} ${item.darkGradient} opacity-100 shadow-2xl` 
                        : isHovered
                        ? 'bg-white/50 dark:bg-slate-700/50 opacity-100 shadow-lg'
                        : 'opacity-0'
                    }`}></div>
                    
                    {/* Animated Border */}
                    {(isActive || isHovered) && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 via-transparent to-white/20 dark:from-white/10 dark:via-transparent dark:to-white/10 animate-pulse"></div>
                    )}
                    
                    <Button
                    onClick={() => handleNavigation(item.path)}
                    variant="ghost"
                    className={`relative z-10 w-full justify-start h-16 px-4 rounded-2xl transition-all duration-500 hover:bg-transparent ${
                        isActive
                        ? 'text-white shadow-2xl'
                        : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    >
                    <div className="flex items-center space-x-4 w-full">
                        {/* Icon Container */}
                        <div className={`relative p-2 rounded-xl transition-all duration-300 ${
                        isActive 
                            ? 'bg-white/20 dark:bg-white/30 shadow-lg' 
                            : isHovered
                            ? 'bg-white/30 dark:bg-slate-600/50'
                            : 'bg-white/10 dark:bg-slate-700/30'
                        }`}>
                        <Icon className="w-5 h-5" />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 text-left">
                        <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm">{item.label}</span>
                            <span className="text-lg">{item.emoji}</span>
                            {isActive && (
                            <Badge className="bg-white/20 dark:bg-white/30 text-white text-xs border-0 animate-pulse">
                                Activo
                            </Badge>
                            )}
                        </div>
                        <p className={`text-xs transition-all duration-300 ${
                            isActive 
                            ? 'text-white/80 dark:text-white/90' 
                            : 'text-muted-foreground'
                        }`}>
                            {item.description}
                        </p>
                        </div>
                        
                        {/* Arrow Indicator */}
                        <ChevronRight className={`w-4 h-4 transition-all duration-300 ${
                        isActive || isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                        }`} />
                    </div>
                    </Button>
                </div>
                );
            })}
            </nav>

            {/* Stats Section */}
            <div className="relative z-10 p-4 pt-0 mt-6">
                <div className="mb-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-3 mb-3 flex items-center space-x-2">
                    <TrendingUp className="w-3 h-3" />
                    <span>Estado</span>
                    </p>
                </div>
                
                <div className="flex flex-col gap-3 px-2">
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 dark:from-emerald-600/20 dark:to-green-600/20 backdrop-blur-xl p-3 border border-white/20 dark:border-slate-700/50">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 dark:from-white/10 dark:via-transparent dark:to-white/10 animate-pulse"></div>
                        <div className="relative z-10 flex items-center space-x-3">
                            <div className="text-lg">💰</div>
                            <div>
                                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Ventas Hoy</p>
                                <p className="text-xs text-muted-foreground">En progreso</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-600/20 dark:to-indigo-600/20 backdrop-blur-xl p-3 border border-white/20 dark:border-slate-700/50">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 dark:from-white/10 dark:via-transparent dark:to-white/10 animate-pulse"></div>
                        <div className="relative z-10 flex items-center space-x-3">
                            <div className="text-lg">📦</div>
                            <div>
                                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">Productos</p>
                                <p className="text-xs text-muted-foreground">Disponibles</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* CAMBIO: Se elimina el posicionamiento absoluto y se añade un borde superior */}
        <div className="relative z-10 p-4 border-t border-white/10 dark:border-slate-700/50">
            <div className="space-y-4">
                {/* Time Display */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 dark:from-purple-600/20 dark:via-pink-600/20 dark:to-blue-600/20 backdrop-blur-xl p-4 border border-white/20 dark:border-slate-700/50">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 dark:from-white/10 dark:via-transparent dark:to-white/10 animate-pulse"></div>
                    <div className="relative z-10 flex items-center space-x-3">
                    <div className="p-2 bg-white/20 dark:bg-white/30 rounded-xl">
                        <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {currentTime.toLocaleTimeString('es-VE', { 
                            hour: '2-digit', 
                            minute: '2-digit'
                        })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                        {currentTime.toLocaleDateString('es-VE', { 
                            weekday: 'short', 
                            day: 'numeric', 
                            month: 'short' 
                        })}
                        </p>
                    </div>
                    </div>
                </div>

                {/* Brand Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 dark:from-pink-600/20 dark:via-purple-600/20 dark:to-blue-600/20 backdrop-blur-xl p-4 border border-white/20 dark:border-slate-700/50">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 dark:from-white/10 dark:via-transparent dark:to-white/10 animate-pulse"></div>
                    <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="text-2xl animate-bounce">🍦</div>
                        <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">¡Helados deliciosos!</p>
                        <p className="text-xs text-muted-foreground">Con amor y dedicación gatuna</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Cat className="w-3 h-3 text-pink-500 dark:text-pink-400" />
                        <span>Powered by cats</span>
                        </div>
                        <div className="flex items-center space-x-1">
                        <Heart className="w-3 h-3 text-red-500 animate-pulse" />
                        <Star className="w-3 h-3 text-yellow-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
                        <Sparkles className="w-3 h-3 text-purple-500 animate-pulse" style={{ animationDelay: '1s' }} />
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-80 relative z-10">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-lg border-b border-white/20 dark:border-slate-700/50">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden h-12 w-12 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-600/20 dark:to-pink-600/20 hover:from-purple-500/20 hover:to-pink-500/20 dark:hover:from-purple-600/30 dark:hover:to-pink-600/30 border border-white/20 dark:border-slate-700/50 transition-all duration-300"
            >
              <Menu className="w-6 h-6" />
            </Button>
            
            {/* Right Section */}
            <div className="flex items-center space-x-4 ml-auto">
              {/* Theme Toggle */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 dark:from-purple-600/30 dark:to-pink-600/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <ThemeToggle />
              </div>
              
              {/* Date/Time Display */}
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {currentTime.toLocaleDateString('es-VE', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-xs text-muted-foreground flex items-center justify-end space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {currentTime.toLocaleTimeString('es-VE', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                </p>
              </div>
              
              {/* User Avatar */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 dark:from-purple-600 dark:via-pink-600 dark:to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl border border-white/20 dark:border-white/30 cursor-pointer transition-all duration-300 hover:scale-105">
                  <span className="text-white font-black text-lg">W</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};