"use client";

import React, { useState, useEffect } from 'react';
import { Cat, Menu, X, Home, Package, ShoppingCart, BarChart3, Settings } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CatLoader } from './CatLoader'; // Importa el CatLoader

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar la carga
  const pathname = usePathname();
  const router = useRouter();

  // Simular carga inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'products', label: 'Productos', icon: Package, path: '/products' },
    { id: 'sales', label: 'Ventas', icon: ShoppingCart, path: '/sales' },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    setSidebarOpen(false);
  };

  // Mostrar CatLoader mientras carga
  if (isLoading) {
    return <CatLoader onLoadComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>🐱</div>
        <div className="absolute top-32 right-20 text-4xl animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}>😸</div>
        <div className="absolute bottom-20 left-1/4 text-5xl animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}>🐾</div>
        <div className="absolute top-1/2 right-10 text-3xl animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4.5s' }}>😺</div>
        <div className="absolute bottom-32 right-1/3 text-4xl animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3s' }}>🐈</div>
        <div className="absolute top-20 left-1/2 text-3xl animate-bounce" style={{ animationDelay: '2.5s', animationDuration: '4s' }}>😻</div>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border-r border-pink-200/50 dark:border-slate-700/50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between p-6 border-b border-pink-200/50 dark:border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Cat className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Wile</h1>
              <p className="text-xs text-muted-foreground">Emprendimientos</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="mt-8 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start mb-2 h-12 ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg hover:from-pink-600 hover:to-purple-700'
                    : 'hover:bg-pink-50 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          <Card className="bg-gradient-to-r from-pink-100/80 to-purple-100/80 dark:from-pink-900/20 dark:to-purple-900/20 border-pink-200/50 dark:border-pink-800/50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">🍦</span>
                <div>
                  <p className="text-sm font-medium">¡Helados deliciosos!</p>
                  <p className="text-xs text-muted-foreground">Con amor y dedicación</p>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Cat className="w-3 h-3" />
                <span>Powered by cats</span>
                <span className="text-pink-500">♥</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-sm border-b border-pink-200/50 dark:border-slate-700/50 sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center space-x-4 ml-auto">
              <ThemeToggle />
              
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">
                  {new Date().toLocaleDateString('es-VE', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date().toLocaleTimeString('es-VE', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 via-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">W</span>
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
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};