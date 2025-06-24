"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Package, ShoppingCart, Calendar, Target, Zap, Star, Coffee, Sparkles, Crown, Award, Flame, Plus, Clock } from 'lucide-react';
import { formatCurrency, convertBsToUsd, getMotivationalMessage, getRandomCatFact } from '../lib/utils';
import { DashboardStats, SalesHistory } from '../lib/types';
import { Badge } from '@/components//ui/badge';
import { Button } from '@/components/ui/button';
import { AnimatedCard } from '@/components/ui/animated-card';

interface DashboardClientProps {
  initialStats: DashboardStats;
  initialSalesHistory: SalesHistory[];
  initialExchangeRate: number;
}

export const DashboardClient: React.FC<DashboardClientProps> = ({ 
  initialStats, 
  initialSalesHistory,
  initialExchangeRate 
}) => {
  const [stats] = useState<DashboardStats>(initialStats);
  const [salesHistory] = useState<SalesHistory[]>(initialSalesHistory);
  const [exchangeRate] = useState(initialExchangeRate);
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [catFact, setCatFact] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setMotivationalMessage(getMotivationalMessage());
    setCatFact(getRandomCatFact());
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return { greeting: '¡Buenos días!', emoji: '🌅' };
    if (hour < 18) return { greeting: '¡Buenas tardes!', emoji: '☀️' };
    return { greeting: '¡Buenas noches!', emoji: '🌙' };
  };

  const { greeting, emoji } = getGreeting();

  const StatCard: React.FC<{
    title: string;
    value: string;
    valueUsd?: string;
    icon: React.ReactNode;
    gradient: string;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    percentage?: string;
  }> = ({ title, value, valueUsd, icon, gradient, subtitle, trend, percentage }) => (
    <AnimatedCard 
      className={`bg-gradient-to-br ${gradient} text-white shadow-lg overflow-hidden relative`}
      hoverEffect
      glowEffect
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-2 right-2 text-2xl sm:text-3xl animate-pulse">✨</div>
        <div className="absolute bottom-2 left-2 text-lg sm:text-xl animate-bounce" style={{ animationDelay: '1s' }}>⭐</div>
      </div>
      
      <div className="relative z-10 p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            {icon}
          </div>
          {percentage && (
            <Badge className={`${
              trend === 'up' ? 'bg-green-500' : trend === 'down' ? 'bg-red-500' : 'bg-gray-500'
            } text-white text-xs`}>
              {trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '➡️'} {percentage}
            </Badge>
          )}
        </div>
        
        <div>
          <p className="text-white/80 text-xs font-medium mb-1">{title}</p>
          <p className="text-lg sm:text-xl font-bold mb-1">{value}</p>
          {valueUsd && (
            <p className="text-white/70 text-xs">{valueUsd}</p>
          )}
          {subtitle && (
            <p className="text-white/60 text-xs mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </AnimatedCard>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Hero Section */}
      <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white rounded-xl p-4 sm:p-6 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-2 right-2 text-3xl sm:text-4xl animate-pulse">🎊</div>
          <div className="absolute bottom-2 left-2 text-2xl sm:text-3xl animate-pulse" style={{ animationDelay: '1s' }}>🎈</div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl sm:text-8xl opacity-10">✨</div>
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row items-start justify-between space-y-4 lg:space-y-0">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-2xl sm:text-3xl animate-bounce">{emoji}</div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">{greeting}</h1>
                  <p className="text-sm sm:text-base lg:text-lg text-pink-100">
                    ¡Bienvenido a Wile Emprendimientos! 
                    <span className="ml-2 animate-pulse">🎉</span>
                  </p>
                </div>
              </div>
              
              <p className="text-pink-100 text-sm sm:text-base mb-4 leading-relaxed">
                Gestiona tu negocio de helados con amor, dedicación y un toque de magia
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="flex items-center space-x-2 p-2 sm:p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Package className="w-4 h-4 text-pink-200" />
                  <div>
                    <p className="text-white font-medium text-xs sm:text-sm">Sistema Completo</p>
                    <p className="text-pink-200 text-xs">Productos, ventas y análisis</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 p-2 sm:p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Clock className="w-4 h-4 text-purple-200" />
                  <div>
                    <p className="text-white font-medium text-xs sm:text-sm">
                      {currentTime.toLocaleDateString('es-VE', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </p>
                    <p className="text-purple-200 text-xs">
                      {currentTime.toLocaleTimeString('es-VE', { 
                        hour: '2-digit', 
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-lg backdrop-blur-sm border border-yellow-300/30">
                <div className="flex items-center space-x-2 mb-1">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300" />
                  <span className="text-yellow-100 font-medium text-xs sm:text-sm">Mensaje del día</span>
                </div>
                <p className="text-white text-xs sm:text-sm">{motivationalMessage}</p>
              </div>
            </div>
            
            <div className="w-full lg:w-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 p-2 sm:p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 min-w-[160px]">
                  <div className="flex items-center space-x-2 mb-1">
                    <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-300" />
                    <span className="text-white/80 text-xs">Tasa BCV</span>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-white">{exchangeRate.toFixed(2)}</p>
                  <p className="text-green-200 text-xs">Bs./USD</p>
                </div>
                
                <div className="flex-1 p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 min-w-[160px]">
                  <div className="flex items-center space-x-2 mb-1">
                    <Coffee className="w-3 h-3 text-orange-300" />
                    <span className="text-white/80 text-xs">Dato curioso</span>
                  </div>
                  <p className="text-white text-xs">{catFact}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Ventas de Hoy"
          value={formatCurrency(stats?.todaySales || 0, 'VES')}
          valueUsd={formatCurrency(convertBsToUsd(stats?.todaySales || 0, exchangeRate), 'USD')}
          icon={<DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
          gradient="from-green-400 via-emerald-500 to-teal-600"
          trend="up"
          percentage="+12%"
          subtitle="Comparado con ayer"
        />
        <StatCard
          title="Ganancia de Hoy"
          value={formatCurrency(stats?.todayProfit || 0, 'VES')}
          valueUsd={formatCurrency(convertBsToUsd(stats?.todayProfit || 0, exchangeRate), 'USD')}
          icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
          gradient="from-blue-400 via-indigo-500 to-purple-600"
          trend="up"
          percentage="+8%"
          subtitle="Margen excelente"
        />
        <StatCard
          title="Ventas Semanales"
          value={formatCurrency(stats?.weekSales || 0, 'VES')}
          valueUsd={formatCurrency(convertBsToUsd(stats?.weekSales || 0, exchangeRate), 'USD')}
          icon={<ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
          gradient="from-purple-400 via-pink-500 to-rose-600"
          trend="up"
          percentage="+15%"
          subtitle="¡Semana increíble!"
        />
        <StatCard
          title="Ventas Mensuales"
          value={formatCurrency(stats?.monthSales || 0, 'VES')}
          valueUsd={formatCurrency(convertBsToUsd(stats?.monthSales || 0, exchangeRate), 'USD')}
          icon={<Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
          gradient="from-orange-400 via-red-500 to-pink-600"
          trend="up"
          percentage="+22%"
          subtitle="Mes espectacular"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Products */}
        <AnimatedCard 
          title="🏆 Productos Estrella"
          description="Los más vendidos de los últimos 30 días"
          hoverEffect
        >
          {stats?.topProducts && stats.topProducts.length > 0 ? (
            <div className="space-y-3">
              {stats.topProducts.map((product, index) => {
                const isFirst = index === 0;
                const isSecond = index === 1;
                const isThird = index === 2;

                return (
                  <div
                    key={product.name}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 hover:scale-[1.02] ${
                      isFirst
                        ? 'bg-gradient-to-r from-yellow-100 via-amber-100 to-orange-100 dark:from-yellow-700 dark:via-amber-800 dark:to-orange-900 border-2 border-yellow-300 dark:border-yellow-600'
                        : isSecond
                        ? 'bg-gradient-to-r from-gray-100 via-slate-100 to-zinc-100 dark:from-gray-700 dark:via-slate-800 dark:to-zinc-900 border border-gray-300 dark:border-gray-600'
                        : isThird
                        ? 'bg-gradient-to-r from-orange-100 via-amber-100 to-yellow-100 dark:from-orange-700 dark:via-amber-800 dark:to-yellow-900 border border-orange-300 dark:border-orange-600'
                        : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                          isFirst
                            ? 'bg-gradient-to-r from-yellow-400 to-amber-500 dark:from-yellow-500 dark:to-amber-600'
                            : isSecond
                            ? 'bg-gradient-to-r from-gray-400 to-slate-500 dark:from-gray-500 dark:to-slate-600'
                            : isThird
                            ? 'bg-gradient-to-r from-orange-400 to-amber-500 dark:from-orange-500 dark:to-amber-600'
                            : 'bg-gradient-to-r from-blue-400 to-indigo-500 dark:from-blue-600 dark:to-indigo-700'
                        }`}
                      >
                        {isFirst ? (
                          <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                        ) : isSecond ? (
                          <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                        ) : isThird ? (
                          <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <p className="font-bold text-sm sm:text-base">{product.name}</p>
                          {isFirst && (
                            <Badge className="bg-yellow-500 dark:bg-yellow-600 text-white animate-pulse text-xs">👑</Badge>
                          )}
                          {isSecond && (
                            <Badge className="bg-gray-500 dark:bg-gray-400 text-white text-xs">🥈</Badge>
                          )}
                          {isThird && (
                            <Badge className="bg-orange-500 dark:bg-orange-600 text-white text-xs">🥉</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center space-x-1">
                          <span>{product.quantity} unidades</span>
                          {isFirst && <Flame className="w-3 h-3 text-red-500 animate-pulse" />}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm sm:text-base text-green-600 dark:text-green-400">
                        {formatCurrency(product.revenue, 'VES')}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {formatCurrency(convertBsToUsd(product.revenue, exchangeRate), 'USD')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <div className="text-4xl sm:text-5xl mb-3 animate-bounce">😸</div>
              <h3 className="text-base sm:text-lg font-bold text-gray-600 dark:text-gray-400 mb-2">
                ¡Aún no hay ventas registradas!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Comienza vendiendo tus deliciosos helados
              </p>
              <Button 
                asChild
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-sm"
                size="sm"
              >
                <a href="/sales">
                  <Zap className="w-3 h-3 mr-2" />
                  Registrar Primera Venta
                </a>
              </Button>
            </div>
          )}
        </AnimatedCard>

        {/* Recent Sales History */}
        <AnimatedCard 
          title="📋 Historial Reciente"
          description="Últimas ventas realizadas"
          hoverEffect
        >
          {salesHistory && salesHistory.length > 0 ? (
            <div className="space-y-2 max-h-64 sm:max-h-80 overflow-y-auto">
              {salesHistory.slice(0, 5).map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-xs sm:text-sm">Venta #{sale.id.slice(0, 8)}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(sale.created_at).toLocaleDateString('es-VE')} • 
                        {new Date(sale.created_at).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xs sm:text-sm text-green-600 dark:text-green-400">
                      {formatCurrency(sale.total_amount_bs, 'VES')}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      +{formatCurrency(sale.profit_bs, 'VES')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-4xl mb-3 animate-bounce">📋</div>
              <h3 className="text-base font-bold text-gray-600 dark:text-gray-400 mb-2">
                Sin historial aún
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Las ventas aparecerán aquí una vez que comiences
              </p>
              <Button asChild variant="outline" size="sm">
                <a href="/sales">
                  <Plus className="w-3 h-3 mr-2" />
                  Ir a Ventas
                </a>
              </Button>
            </div>
          )}
        </AnimatedCard>
      </div>

      {/* Quick Actions */}
    <AnimatedCard 
      title="⚡ Acciones Rápidas"
      description="Gestiona tu negocio con superpoderes"
      hoverEffect
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Button 
        className="h-14 sm:h-16 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 dark:from-green-700 dark:via-emerald-800 dark:to-teal-900 hover:from-green-500 hover:to-teal-700 dark:hover:from-green-800 dark:hover:to-teal-950 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
        size="lg"
        >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 dark:from-white/0 dark:via-white/10 dark:to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        <div className="flex flex-col items-center space-y-1 relative z-10">
          <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
          <div className="text-center">
            <p className="font-bold text-sm">Nueva Venta</p>
            <p className="text-green-100 dark:text-green-200 text-xs">Registrar venta</p>
          </div>
        </div>
        </Button>
        
        <Button 
        className="h-14 sm:h-16 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 dark:from-blue-700 dark:via-indigo-800 dark:to-purple-900 hover:from-blue-500 hover:to-purple-700 dark:hover:from-blue-800 dark:hover:to-purple-950 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
        size="lg"
        >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 dark:from-white/0 dark:via-white/10 dark:to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        <div className="flex flex-col items-center space-y-1 relative z-10">
          <Package className="w-5 h-5 sm:w-6 sm:h-6" />
          <div className="text-center">
            <p className="font-bold text-sm">Productos</p>
            <p className="text-blue-100 dark:text-blue-200 text-xs">Gestionar inventario</p>
          </div>
        </div>
        </Button>
        
        <Button 
        className="h-14 sm:h-16 bg-gradient-to-r from-purple-400 via-pink-500 to-rose-600 dark:from-purple-700 dark:via-pink-800 dark:to-rose-900 hover:from-purple-500 hover:to-rose-700 dark:hover:from-purple-800 dark:hover:to-rose-950 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
        size="lg"
        >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 dark:from-white/0 dark:via-white/10 dark:to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        <div className="flex flex-col items-center space-y-1 relative z-10">
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          <div className="text-center">
            <p className="font-bold text-sm">Análisis</p>
            <p className="text-purple-100 dark:text-purple-200 text-xs">Ver reportes</p>
          </div>
        </div>
        </Button>
      </div>

      {/* Goal Card */}
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-yellow-100/80 via-amber-100/80 to-orange-100/80 dark:from-yellow-900/40 dark:via-amber-900/40 dark:to-orange-900/40 rounded-lg border-2 border-yellow-300/50 dark:border-yellow-600/50">
        <div className="flex items-center space-x-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 dark:from-yellow-600 dark:via-amber-700 dark:to-orange-700 rounded-full flex items-center justify-center shadow-lg">
          <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-sm sm:text-base text-yellow-800 dark:text-yellow-200">
            Meta del Día
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300 text-xs sm:text-sm">
            ¡Sigue así! Estás haciendo un trabajo increíble 🎯
          </p>
          <div className="mt-2 flex items-center space-x-2">
            <div className="flex-1 bg-yellow-200 dark:bg-yellow-800 rounded-full h-2">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-yellow-500 dark:to-orange-600 h-2 rounded-full w-3/4"></div>
            </div>
            <span className="text-xs font-medium text-yellow-800 dark:text-yellow-200">75%</span>
          </div>
        </div>
        </div>
      </div>
    </AnimatedCard>
    </div>
  );
};