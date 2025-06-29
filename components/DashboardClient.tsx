"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Package, ShoppingCart, Calendar, Target, Zap, Star, Coffee, Sparkles, Crown, Award, Flame, Plus, Clock, Heart, PawPrint, Fish, Gem, Trophy, Rocket, CloudLightning as Lightning } from 'lucide-react';
import { formatCurrency, convertBsToUsd, getMotivationalMessage, getRandomCatFact } from '../lib/utils';
import { DashboardStats, SalesHistory } from '../lib/types';
import { Badge } from '@/components/ui/badge';
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
    if (hour < 12) return { 
      greeting: '¡Buenos días!', 
      emoji: '🌅', 
      catEmoji: '😸', 
      bgGradient: 'from-amber-400 via-orange-500 to-pink-500',
      darkBgGradient: 'dark:from-amber-600 dark:via-orange-700 dark:to-pink-700'
    };
    if (hour < 18) return { 
      greeting: '¡Buenas tardes!', 
      emoji: '☀️', 
      catEmoji: '😺', 
      bgGradient: 'from-blue-400 via-purple-500 to-pink-500',
      darkBgGradient: 'dark:from-blue-600 dark:via-purple-700 dark:to-pink-700'
    };
    return { 
      greeting: '¡Buenas noches!', 
      emoji: '🌙', 
      catEmoji: '😴', 
      bgGradient: 'from-indigo-500 via-purple-600 to-pink-600',
      darkBgGradient: 'dark:from-indigo-700 dark:via-purple-800 dark:to-pink-800'
    };
  };

  const { greeting, emoji, catEmoji, bgGradient, darkBgGradient } = getGreeting();

  const StatCard: React.FC<{
    title: string;
    value: string;
    valueUsd?: string;
    icon: React.ReactNode;
    gradient: string;
    darkGradient: string;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    percentage?: string;
    catIcon?: string;
    glowColor?: string;
  }> = ({ title, value, valueUsd, icon, gradient, darkGradient, subtitle, trend, percentage, catIcon, glowColor }) => (
    <div className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} ${darkGradient} p-1 shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-3xl ${glowColor ? `hover:shadow-${glowColor}-500/50` : ''}`}>
      {/* Animated border gradient */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-white/20 via-transparent to-white/20 dark:from-white/10 dark:via-transparent dark:to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute top-2 right-4 w-2 h-2 bg-white/40 dark:bg-white/60 rounded-full animate-ping"></div>
        <div className="absolute top-6 right-8 w-1 h-1 bg-white/60 dark:bg-white/80 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-white/50 dark:bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-8 left-8 w-1 h-1 bg-white/40 dark:bg-white/60 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 rounded-3xl bg-black/10 dark:bg-black/30 backdrop-blur-xl p-6 text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 dark:bg-white/30 rounded-2xl blur-xl"></div>
            <div className="relative p-3 bg-white/25 dark:bg-white/35 rounded-2xl backdrop-blur-sm border border-white/30 dark:border-white/40 shadow-xl">
              {icon}
            </div>
          </div>
          {percentage && (
            <div className="relative">
              <div className={`absolute inset-0 ${
                trend === 'up' ? 'bg-emerald-400/30 dark:bg-emerald-500/40' : 
                trend === 'down' ? 'bg-red-400/30 dark:bg-red-500/40' : 
                'bg-gray-400/30 dark:bg-gray-500/40'
              } rounded-full blur-lg`}></div>
              <Badge className={`relative ${
                trend === 'up' ? 'bg-emerald-500/90 dark:bg-emerald-600/90 border-emerald-400/50 dark:border-emerald-500/60' : 
                trend === 'down' ? 'bg-red-500/90 dark:bg-red-600/90 border-red-400/50 dark:border-red-500/60' : 
                'bg-gray-500/90 dark:bg-gray-600/90 border-gray-400/50 dark:border-gray-500/60'
              } text-white text-xs border backdrop-blur-sm shadow-xl font-bold px-3 py-1`}>
                {trend === 'up' ? '🚀' : trend === 'down' ? '📉' : '➡️'} {percentage}
              </Badge>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="space-y-3">
          <p className="text-white/90 dark:text-white/95 text-sm font-bold tracking-wider uppercase">{title}</p>
          <div className="space-y-2">
            <p className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-2xl text-white">{value}</p>
            {valueUsd && (
              <p className="text-white/80 dark:text-white/90 text-sm font-semibold bg-white/10 dark:bg-white/20 rounded-lg px-3 py-1 inline-block backdrop-blur-sm border border-white/20 dark:border-white/30">
                💰 {valueUsd}
              </p>
            )}
          </div>
          {subtitle && (
            <div className="flex items-center space-x-2 mt-4">
              <span className="text-2xl animate-bounce">{catIcon || '🐾'}</span>
              <p className="text-white/80 dark:text-white/90 text-sm font-medium italic">{subtitle}</p>
            </div>
          )}
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 text-4xl opacity-20 dark:opacity-30 animate-pulse">✨</div>
        <div className="absolute bottom-4 left-4 text-2xl opacity-30 dark:opacity-40 animate-bounce" style={{ animationDelay: '1s' }}>
          {catIcon || '🐾'}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 relative overflow-hidden transition-colors duration-500">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-200/30 via-pink-200/20 to-blue-200/30 dark:from-purple-500/10 dark:via-pink-500/5 dark:to-blue-500/10 animate-pulse"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300/40 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-300/40 dark:bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 space-y-8 p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Hero Section - Completely Redesigned */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${bgGradient} ${darkBgGradient} p-1 shadow-2xl`}>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 dark:from-white/5 dark:via-transparent dark:to-white/5 animate-pulse"></div>
          
          {/* Floating elements - Optimized for both modes */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <div className="absolute top-4 sm:top-8 right-4 sm:right-8 text-4xl sm:text-6xl animate-bounce opacity-30 dark:opacity-30">🐱</div>
            <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 text-2xl sm:text-4xl animate-pulse opacity-40 dark:opacity-40" style={{ animationDelay: '1s' }}>🐾</div>
            <div className="absolute top-1/4 left-1/4 text-2xl sm:text-3xl animate-bounce opacity-20 dark:opacity-20" style={{ animationDelay: '2s' }}>😸</div>
            <div className="absolute bottom-1/3 right-1/3 text-2xl sm:text-3xl animate-pulse opacity-30 dark:opacity-30" style={{ animationDelay: '3s' }}>🧊</div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl sm:text-9xl opacity-5 dark:opacity-5 animate-pulse">🍦</div>
          </div>
          
          <div className="relative z-10 rounded-3xl bg-white/20 dark:bg-black/40 backdrop-blur-xl p-6 sm:p-8 lg:p-12 text-gray-800 dark:text-white border border-white/30 dark:border-white/30">
            
            {/* MOBILE LAYOUT - Completely Vertical */}
            <div className="block lg:hidden space-y-8">
              {/* Main Greeting - Mobile */}
              <div className="text-center space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/30 dark:bg-white/30 rounded-full blur-xl animate-pulse"></div>
                    <div className="relative text-6xl animate-bounce">{emoji}</div>
                  </div>
                  <div className="space-y-3">
                    <h1 className="text-4xl font-black tracking-tight drop-shadow-2xl text-gray-800 dark:text-white">
                      {greeting} {catEmoji}
                    </h1>
                    <div className="flex flex-col items-center space-y-2">
                      <p className="text-xl text-gray-700 dark:text-white/95 font-bold">
                        ¡Bienvenido a Wile Emprendimientos!
                      </p>
                      <span className="text-3xl animate-spin" style={{ animationDuration: '3s' }}>🎉</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-lg text-gray-600 dark:text-white/90 leading-relaxed font-medium max-w-md mx-auto">
                  Gestiona tu negocio de helados con amor gatuno, dedicación felina y un toque de magia empresarial
                  <span className="inline-block ml-2 animate-pulse">🐱✨</span>
                </p>
              </div>

              {/* Feature Cards - Mobile Stack */}
              <div className="space-y-4">
                <div className="group relative overflow-hidden rounded-2xl bg-white/20 dark:bg-white/20 backdrop-blur-xl p-6 border border-white/30 dark:border-white/30 shadow-xl hover:bg-white/30 dark:hover:bg-white/30 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 dark:from-emerald-500/30 dark:to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 flex items-center space-x-4">
                    <div className="p-3 bg-emerald-500/40 dark:bg-emerald-600/40 rounded-xl backdrop-blur-sm border border-emerald-400/60 dark:border-emerald-500/60">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-800 dark:text-white font-bold text-lg">Sistema Completo 🐾</p>
                      <p className="text-gray-600 dark:text-white/80 text-sm">Productos, ventas y análisis</p>
                    </div>
                  </div>
                </div>
                
                <div className="group relative overflow-hidden rounded-2xl bg-white/20 dark:bg-white/20 backdrop-blur-xl p-6 border border-white/30 dark:border-white/30 shadow-xl hover:bg-white/30 dark:hover:bg-white/30 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 dark:from-purple-500/30 dark:to-pink-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 flex items-center space-x-4">
                    <div className="p-3 bg-purple-500/40 dark:bg-purple-600/40 rounded-xl backdrop-blur-sm border border-purple-400/60 dark:border-purple-500/60">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-800 dark:text-white font-bold text-lg">
                        {currentTime.toLocaleDateString('es-VE', { 
                          weekday: 'short', 
                          day: 'numeric', 
                          month: 'short' 
                        })} 😺
                      </p>
                      <p className="text-gray-600 dark:text-white/80 text-sm">
                        {currentTime.toLocaleTimeString('es-VE', { 
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Info - Mobile Stack */}
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl bg-white/20 dark:bg-white/20 backdrop-blur-xl p-6 border border-white/30 dark:border-white/30 shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-400/20 dark:from-emerald-500/20 dark:to-green-500/20 animate-pulse"></div>
                  <div className="relative z-10 text-center">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                      <div className="p-2 bg-emerald-500/40 dark:bg-emerald-600/40 rounded-xl backdrop-blur-sm border border-emerald-400/60 dark:border-emerald-500/60">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-gray-800 dark:text-white font-bold text-lg">Tasa BCV 💰</span>
                    </div>
                    <p className="text-3xl font-black text-gray-800 dark:text-white mb-2">{exchangeRate.toFixed(2)}</p>
                    <p className="text-emerald-700 dark:text-emerald-100 text-sm font-semibold bg-emerald-500/30 dark:bg-emerald-600/30 rounded-lg px-3 py-1 inline-block">Bs./USD</p>
                  </div>
                </div>
                
                <div className="relative overflow-hidden rounded-2xl bg-white/20 dark:bg-white/20 backdrop-blur-xl p-6 border border-white/30 dark:border-white/30 shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-pink-400/20 dark:from-orange-500/20 dark:to-pink-500/20 animate-pulse"></div>
                  <div className="relative z-10 text-center">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                      <div className="p-2 bg-orange-500/40 dark:bg-orange-600/40 rounded-xl backdrop-blur-sm border border-orange-400/60 dark:border-orange-500/60">
                        <Coffee className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-gray-800 dark:text-white font-bold text-lg">Dato Gatuno 🐱</span>
                    </div>
                    <p className="text-gray-700 dark:text-white text-sm leading-relaxed font-medium">{catFact}</p>
                  </div>
                </div>
              </div>

              {/* Motivational Message - Mobile */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-500/30 to-orange-500/30 dark:from-yellow-600/30 dark:to-orange-600/30 backdrop-blur-xl p-6 border border-yellow-400/40 dark:border-yellow-500/40 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 dark:from-yellow-500/20 dark:to-orange-500/20 animate-pulse"></div>
                <div className="relative z-10 text-center">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="p-2 bg-yellow-500/40 dark:bg-yellow-600/40 rounded-xl backdrop-blur-sm border border-yellow-400/60 dark:border-yellow-500/60">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-yellow-800 dark:text-yellow-50 font-bold text-lg">Sabiduría Felina del Día 🐱</span>
                  </div>
                  <p className="text-gray-800 dark:text-white text-base leading-relaxed font-medium">{motivationalMessage}</p>
                </div>
              </div>
            </div>

            {/* DESKTOP LAYOUT - Horizontal & Organized */}
            <div className="hidden lg:block space-y-8">
              {/* Main Greeting Section - Desktop */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/30 dark:bg-white/30 rounded-full blur-xl animate-pulse"></div>
                    <div className="relative text-7xl animate-bounce">{emoji}</div>
                  </div>
                  <div className="space-y-4">
                    <h1 className="text-6xl font-black tracking-tight drop-shadow-2xl text-gray-800 dark:text-white">
                      {greeting} {catEmoji}
                    </h1>
                    <div className="flex items-center space-x-4">
                      <p className="text-2xl text-gray-700 dark:text-white/95 font-bold">
                        ¡Bienvenido a Wile Emprendimientos!
                      </p>
                      <span className="text-4xl animate-spin" style={{ animationDuration: '3s' }}>🎉</span>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-white/90 leading-relaxed font-medium max-w-2xl">
                      Gestiona tu negocio de helados con amor gatuno, dedicación felina y un toque de magia empresarial
                      <span className="inline-block ml-2 animate-pulse">🐱✨</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Content Grid - Desktop */}
              <div className="grid grid-cols-3 gap-8">
                {/* Feature Cards - Desktop */}
                <div className="col-span-2 grid grid-cols-2 gap-6">
                  <div className="group relative overflow-hidden rounded-2xl bg-white/20 dark:bg-white/20 backdrop-blur-xl p-6 border border-white/30 dark:border-white/30 shadow-xl hover:bg-white/30 dark:hover:bg-white/30 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 dark:from-emerald-500/30 dark:to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 flex items-center space-x-4">
                      <div className="p-3 bg-emerald-500/40 dark:bg-emerald-600/40 rounded-xl backdrop-blur-sm border border-emerald-400/60 dark:border-emerald-500/60">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-gray-800 dark:text-white font-bold text-lg">Sistema Completo 🐾</p>
                        <p className="text-gray-600 dark:text-white/80 text-sm">Productos, ventas y análisis</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group relative overflow-hidden rounded-2xl bg-white/20 dark:bg-white/20 backdrop-blur-xl p-6 border border-white/30 dark:border-white/30 shadow-xl hover:bg-white/30 dark:hover:bg-white/30 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 dark:from-purple-500/30 dark:to-pink-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 flex items-center space-x-4">
                      <div className="p-3 bg-purple-500/40 dark:bg-purple-600/40 rounded-xl backdrop-blur-sm border border-purple-400/60 dark:border-purple-500/60">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-gray-800 dark:text-white font-bold text-lg">
                          {currentTime.toLocaleDateString('es-VE', { 
                            weekday: 'short', 
                            day: 'numeric', 
                            month: 'short' 
                          })} 😺
                        </p>
                        <p className="text-gray-600 dark:text-white/80 text-sm">
                          {currentTime.toLocaleTimeString('es-VE', { 
                            hour: '2-digit', 
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Side Info - Desktop */}
                <div className="space-y-6">
                  <div className="relative overflow-hidden rounded-2xl bg-white/20 dark:bg-white/20 backdrop-blur-xl p-6 border border-white/30 dark:border-white/30 shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-400/20 dark:from-emerald-500/20 dark:to-green-500/20 animate-pulse"></div>
                    <div className="relative z-10 text-center">
                      <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="p-2 bg-emerald-500/40 dark:bg-emerald-600/40 rounded-xl backdrop-blur-sm border border-emerald-400/60 dark:border-emerald-500/60">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-gray-800 dark:text-white font-bold text-lg">Tasa BCV 💰</span>
                      </div>
                      <p className="text-3xl font-black text-gray-800 dark:text-white mb-2">{exchangeRate.toFixed(2)}</p>
                      <p className="text-emerald-700 dark:text-emerald-100 text-sm font-semibold bg-emerald-500/30 dark:bg-emerald-600/30 rounded-lg px-3 py-1 inline-block">Bs./USD</p>
                    </div>
                  </div>
                  
                  <div className="relative overflow-hidden rounded-2xl bg-white/20 dark:bg-white/20 backdrop-blur-xl p-6 border border-white/30 dark:border-white/30 shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-pink-400/20 dark:from-orange-500/20 dark:to-pink-500/20 animate-pulse"></div>
                    <div className="relative z-10 text-center">
                      <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="p-2 bg-orange-500/40 dark:bg-orange-600/40 rounded-xl backdrop-blur-sm border border-orange-400/60 dark:border-orange-500/60">
                          <Coffee className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-gray-800 dark:text-white font-bold text-lg">Dato Gatuno 🐱</span>
                      </div>
                      <p className="text-gray-700 dark:text-white text-sm leading-relaxed font-medium">{catFact}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Motivational Message - Desktop */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-500/30 to-orange-500/30 dark:from-yellow-600/30 dark:to-orange-600/30 backdrop-blur-xl p-6 border border-yellow-400/40 dark:border-yellow-500/40 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 dark:from-yellow-500/20 dark:to-orange-500/20 animate-pulse"></div>
                <div className="relative z-10 text-center">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="p-2 bg-yellow-500/40 dark:bg-yellow-600/40 rounded-xl backdrop-blur-sm border border-yellow-400/60 dark:border-yellow-500/60">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-yellow-800 dark:text-yellow-50 font-bold text-lg">Sabiduría Felina del Día 🐱</span>
                  </div>
                  <p className="text-gray-800 dark:text-white text-base leading-relaxed font-medium">{motivationalMessage}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Ventas de Hoy 🐱"
            value={formatCurrency(stats?.todaySales || 0, 'VES')}
            valueUsd={formatCurrency(convertBsToUsd(stats?.todaySales || 0, exchangeRate), 'USD')}
            icon={<DollarSign className="w-6 h-6 text-white" />}
            gradient="from-emerald-400 via-green-500 to-teal-600"
            darkGradient="dark:from-emerald-600 dark:via-green-700 dark:to-teal-800"
            trend="up"
            percentage="+12%"
            subtitle="¡Ronroneo de alegría!"
            catIcon="😸"
            glowColor="emerald"
          />
          <StatCard
            title="Ganancia de Hoy 🐾"
            value={formatCurrency(stats?.todayProfit || 0, 'VES')}
            valueUsd={formatCurrency(convertBsToUsd(stats?.todayProfit || 0, exchangeRate), 'USD')}
            icon={<TrendingUp className="w-6 h-6 text-white" />}
            gradient="from-blue-400 via-indigo-500 to-purple-600"
            darkGradient="dark:from-blue-600 dark:via-indigo-700 dark:to-purple-800"
            trend="up"
            percentage="+8%"
            subtitle="¡Gatito feliz!"
            catIcon="😺"
            glowColor="blue"
          />
          <StatCard
            title="Ventas Semanales 🧊"
            value={formatCurrency(stats?.weekSales || 0, 'VES')}
            valueUsd={formatCurrency(convertBsToUsd(stats?.weekSales || 0, exchangeRate), 'USD')}
            icon={<ShoppingCart className="w-6 h-6 text-white" />}
            gradient="from-purple-400 via-pink-500 to-rose-600"
            darkGradient="dark:from-purple-600 dark:via-pink-700 dark:to-rose-800"
            trend="up"
            percentage="+15%"
            subtitle="¡Semana gatástica!"
            catIcon="🐾"
            glowColor="purple"
          />
          <StatCard
            title="Ventas Mensuales 🍦"
            value={formatCurrency(stats?.monthSales || 0, 'VES')}
            valueUsd={formatCurrency(convertBsToUsd(stats?.monthSales || 0, exchangeRate), 'USD')}
            icon={<Package className="w-6 h-6 text-white" />}
            gradient="from-orange-400 via-red-500 to-pink-600"
            darkGradient="dark:from-orange-600 dark:via-red-700 dark:to-pink-800"
            trend="up"
            percentage="+22%"
            subtitle="¡Mes purr-fecto!"
            catIcon="👑"
            glowColor="orange"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Products */}
          <div className="group relative overflow-hidden rounded-3xl bg-white/10 dark:bg-white/10 backdrop-blur-xl p-1 shadow-2xl border border-white/20 dark:border-white/20">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-orange-500/10 to-pink-500/20 dark:from-yellow-600/20 dark:via-orange-600/10 dark:to-pink-600/20 animate-pulse"></div>
            
            <div className="relative z-10 rounded-3xl bg-white/20 dark:bg-black/30 backdrop-blur-xl p-6 sm:p-8 border border-white/20 dark:border-white/20">
              <div className="flex items-center space-x-4 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-500/40 dark:bg-yellow-600/40 rounded-2xl blur-xl animate-pulse"></div>
                  <div className="relative p-3 bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-yellow-500 dark:to-orange-600 rounded-2xl shadow-xl">
                    <Crown className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-800 dark:text-white">🏆 Productos Estrella</h3>
                  <p className="text-gray-600 dark:text-white/80 text-sm font-medium">Los favoritos de nuestros gatitos clientes</p>
                </div>
              </div>

              {stats?.topProducts && stats.topProducts.length > 0 ? (
                <div className="space-y-6">
                  {stats.topProducts.map((product, index) => {
                    const isFirst = index === 0;
                    const isSecond = index === 1;
                    const isThird = index === 2;

                    return (
                      <div
                        key={product.name}
                        className={`group relative overflow-hidden rounded-2xl p-1 transition-all duration-500 hover:scale-[1.02] ${
                          isFirst
                            ? 'bg-gradient-to-r from-yellow-400/40 to-amber-500/40 dark:from-yellow-500/40 dark:to-amber-600/40 shadow-yellow-500/30 dark:shadow-yellow-600/30'
                            : isSecond
                            ? 'bg-gradient-to-r from-gray-400/40 to-slate-500/40 dark:from-gray-500/40 dark:to-slate-600/40 shadow-gray-500/30 dark:shadow-gray-600/30'
                            : isThird
                            ? 'bg-gradient-to-r from-orange-400/40 to-amber-500/40 dark:from-orange-500/40 dark:to-amber-600/40 shadow-orange-500/30 dark:shadow-orange-600/30'
                            : 'bg-gradient-to-r from-blue-400/30 to-indigo-500/30 dark:from-blue-500/30 dark:to-indigo-600/30 shadow-blue-500/30 dark:shadow-blue-600/30'
                        } shadow-2xl`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 dark:from-white/10 dark:via-transparent dark:to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <div className={`relative z-10 rounded-2xl backdrop-blur-xl p-4 sm:p-6 border ${
                          isFirst
                            ? 'bg-white/20 dark:bg-yellow-600/20 border-yellow-400/40 dark:border-yellow-500/40'
                            : isSecond
                            ? 'bg-white/20 dark:bg-gray-600/20 border-gray-400/40 dark:border-gray-500/40'
                            : isThird
                            ? 'bg-white/20 dark:bg-orange-600/20 border-orange-400/40 dark:border-orange-500/40'
                            : 'bg-white/20 dark:bg-blue-600/20 border-blue-400/40 dark:border-blue-500/40'
                        }`}>
                          {/* Mobile Layout */}
                          <div className="block sm:hidden space-y-4">
                            <div className="flex justify-center">
                              <div
                                className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold shadow-2xl transform transition-transform duration-300 hover:scale-110 ${
                                  isFirst
                                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 dark:from-yellow-500 dark:to-amber-600 animate-pulse shadow-yellow-500/50 dark:shadow-yellow-600/60'
                                    : isSecond
                                    ? 'bg-gradient-to-r from-gray-400 to-slate-500 dark:from-gray-500 dark:to-slate-600 shadow-gray-500/50 dark:shadow-gray-600/60'
                                    : isThird
                                    ? 'bg-gradient-to-r from-orange-400 to-amber-500 dark:from-orange-500 dark:to-amber-600 shadow-orange-500/50 dark:shadow-orange-600/60'
                                    : 'bg-gradient-to-r from-blue-400 to-indigo-500 dark:from-blue-500 dark:to-indigo-600 shadow-blue-500/50 dark:shadow-blue-600/60'
                                }`}
                              >
                                {isFirst ? (
                                  <span className="text-3xl">😻</span>
                                ) : isSecond ? (
                                  <span className="text-3xl">😸</span>
                                ) : isThird ? (
                                  <span className="text-3xl">😺</span>
                                ) : (
                                  <span className="text-xl font-black">{index + 1}</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-center space-y-3">
                              <p className="font-black text-lg sm:text-xl text-gray-800 dark:text-white">{product.name}</p>
                              <div className="flex items-center justify-center space-x-2">
                                {isFirst && (
                                  <Badge className="bg-yellow-500/90 dark:bg-yellow-600/90 text-white animate-bounce text-sm font-bold px-3 py-1 shadow-lg">👑 Rey</Badge>
                                )}
                                {isSecond && (
                                  <Badge className="bg-gray-500/90 dark:bg-gray-600/90 text-white text-sm font-bold px-3 py-1 shadow-lg">🥈 Noble</Badge>
                                )}
                                {isThird && (
                                  <Badge className="bg-orange-500/90 dark:bg-orange-600/90 text-white text-sm font-bold px-3 py-1 shadow-lg">🥉 Campeón</Badge>
                                )}
                              </div>
                              <p className="text-gray-700 dark:text-white/90 text-base flex items-center justify-center space-x-2 font-semibold">
                                <span>{product.quantity} unidades</span>
                                <PawPrint className="w-4 h-4" />
                                {isFirst && <span className="text-red-400 animate-pulse text-lg">🔥</span>}
                              </p>
                            </div>
                            
                            <div className="text-center space-y-2">
                              <p className="font-black text-xl sm:text-2xl text-emerald-600 dark:text-emerald-300">
                                {formatCurrency(product.revenue, 'VES')}
                              </p>
                              <p className="text-gray-600 dark:text-white/70 text-sm font-semibold bg-white/20 dark:bg-white/20 rounded-lg px-3 py-1 inline-block backdrop-blur-sm">
                                {formatCurrency(convertBsToUsd(product.revenue, exchangeRate), 'USD')}
                              </p>
                            </div>
                          </div>

                          {/* Desktop Layout */}
                          <div className="hidden sm:flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                              <div
                                className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold shadow-2xl transform transition-transform duration-300 hover:scale-110 ${
                                  isFirst
                                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 dark:from-yellow-500 dark:to-amber-600 animate-pulse shadow-yellow-500/50 dark:shadow-yellow-600/60'
                                    : isSecond
                                    ? 'bg-gradient-to-r from-gray-400 to-slate-500 dark:from-gray-500 dark:to-slate-600 shadow-gray-500/50 dark:shadow-gray-600/60'
                                    : isThird
                                    ? 'bg-gradient-to-r from-orange-400 to-amber-500 dark:from-orange-500 dark:to-amber-600 shadow-orange-500/50 dark:shadow-orange-600/60'
                                    : 'bg-gradient-to-r from-blue-400 to-indigo-500 dark:from-blue-500 dark:to-indigo-600 shadow-blue-500/50 dark:shadow-blue-600/60'
                                }`}
                              >
                                {isFirst ? (
                                  <span className="text-2xl">😻</span>
                                ) : isSecond ? (
                                  <span className="text-2xl">😸</span>
                                ) : isThird ? (
                                  <span className="text-2xl">😺</span>
                                ) : (
                                  <span className="text-lg font-black">{index + 1}</span>
                                )}
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-3">
                                  <p className="font-black text-lg text-gray-800 dark:text-white">{product.name}</p>
                                  {isFirst && (
                                    <Badge className="bg-yellow-500/90 dark:bg-yellow-600/90 text-white animate-bounce text-xs font-bold px-2 py-1 shadow-lg">👑 Rey</Badge>
                                  )}
                                  {isSecond && (
                                    <Badge className="bg-gray-500/90 dark:bg-gray-600/90 text-white text-xs font-bold px-2 py-1 shadow-lg">🥈 Noble</Badge>
                                  )}
                                  {isThird && (
                                    <Badge className="bg-orange-500/90 dark:bg-orange-600/90 text-white text-xs font-bold px-2 py-1 shadow-lg">🥉 Campeón</Badge>
                                  )}
                                </div>
                                <p className="text-gray-700 dark:text-white/90 text-sm flex items-center space-x-2 font-semibold">
                                  <span>{product.quantity} unidades</span>
                                  <PawPrint className="w-3 h-3" />
                                  {isFirst && <span className="text-red-400 animate-pulse">🔥</span>}
                                </p>
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <p className="font-black text-xl text-emerald-600 dark:text-emerald-300">
                                {formatCurrency(product.revenue, 'VES')}
                              </p>
                              <p className="text-gray-600 dark:text-white/70 text-sm font-semibold bg-white/20 dark:bg-white/20 rounded-lg px-3 py-1 backdrop-blur-sm">
                                {formatCurrency(convertBsToUsd(product.revenue, exchangeRate), 'USD')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl sm:text-8xl mb-6 animate-bounce">😿</div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-800 dark:text-white mb-4">
                    ¡Aún no hay ventas registradas!
                  </h3>
                  <p className="text-gray-600 dark:text-white/70 text-base mb-8 max-w-md mx-auto">
                    Comienza vendiendo tus deliciosos helados para hacer felices a los gatitos
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-emerald-500 to-green-600 dark:from-emerald-600 dark:to-green-700 hover:from-emerald-600 hover:to-green-700 dark:hover:from-emerald-700 dark:hover:to-green-800 text-white shadow-2xl transform transition-all duration-300 hover:scale-105 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-2xl"
                  >
                    <PawPrint className="w-5 h-5 mr-3" />
                    Registrar Primera Venta
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Sales History */}
          <div className="group relative overflow-hidden rounded-3xl bg-white/10 dark:bg-white/10 backdrop-blur-xl p-1 shadow-2xl border border-white/20 dark:border-white/20">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/10 to-blue-500/20 dark:from-purple-600/20 dark:via-pink-600/10 dark:to-blue-600/20 animate-pulse"></div>
            
            <div className="relative z-10 rounded-3xl bg-white/20 dark:bg-black/30 backdrop-blur-xl p-6 sm:p-8 border border-white/20 dark:border-white/20">
              <div className="flex items-center space-x-4 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/40 dark:bg-purple-600/40 rounded-2xl blur-xl animate-pulse"></div>
                  <div className="relative p-3 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 rounded-2xl shadow-xl">
                    <ShoppingCart className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-800 dark:text-white">📋 Historial Reciente</h3>
                  <p className="text-gray-600 dark:text-white/80 text-sm font-medium">Últimas aventuras de ventas</p>
                </div>
              </div>

              {salesHistory && salesHistory.length > 0 ? (
                <div className="space-y-6 max-h-96 overflow-y-auto custom-scrollbar">
                  {salesHistory.slice(0, 6).map((sale, index) => (
                    <div key={sale.id} className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-white/10 to-blue-500/20 dark:from-white/10 dark:to-blue-600/20 backdrop-blur-xl p-1 hover:from-white/20 hover:to-blue-500/30 dark:hover:from-white/15 dark:hover:to-blue-600/30 transition-all duration-300 shadow-xl">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 dark:from-white/10 dark:via-transparent dark:to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative z-10 rounded-2xl bg-white/20 dark:bg-black/30 backdrop-blur-xl p-4 sm:p-6 border border-white/20 dark:border-white/20">
                        {/* Mobile Layout */}
                        <div className="block sm:hidden space-y-4">
                          <div className="flex justify-center">
                            <div className="w-16 sm:w-18 h-16 sm:h-18 bg-gradient-to-r from-emerald-400 to-teal-500 dark:from-emerald-500 dark:to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/30 dark:shadow-emerald-600/40">
                              <span className="text-2xl sm:text-3xl">{index % 2 === 0 ? '😸' : '🐾'}</span>
                            </div>
                          </div>
                          
                          <div className="text-center space-y-3">
                            <p className="font-black text-lg sm:text-xl text-gray-800 dark:text-white">
                              Venta #{sale.id.slice(0, 8)}
                            </p>
                            <div className="space-y-1">
                              <p className="text-gray-700 dark:text-white/90 text-base flex items-center justify-center space-x-2 font-semibold">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {new Date(sale.created_at).toLocaleDateString('es-VE')}
                                </span>
                              </p>
                              <p className="text-gray-600 dark:text-white/80 text-sm">
                                {new Date(sale.created_at).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-center space-y-2">
                            <p className="font-black text-xl sm:text-2xl text-emerald-600 dark:text-emerald-300">
                              {formatCurrency(sale.total_amount_bs, 'VES')}
                            </p>
                            <p className="text-gray-600 dark:text-white/70 text-sm flex items-center justify-center space-x-2 font-semibold bg-white/20 dark:bg-white/20 rounded-lg px-3 py-1 inline-block backdrop-blur-sm">
                              <Heart className="w-3 h-3 text-red-400" />
                              <span>+{formatCurrency(sale.profit_bs, 'VES')}</span>
                            </p>
                          </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden sm:flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-r from-emerald-400 to-teal-500 dark:from-emerald-500 dark:to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/30 dark:shadow-emerald-600/40">
                              <span className="text-2xl">{index % 2 === 0 ? '😸' : '🐾'}</span>
                            </div>
                            <div className="space-y-1">
                              <p className="font-black text-lg text-gray-800 dark:text-white">Venta #{sale.id.slice(0, 8)}</p>
                              <p className="text-gray-700 dark:text-white/90 text-sm flex items-center space-x-2 font-semibold">
                                <Calendar className="w-3 h-3" />
                                <span>
                                  {new Date(sale.created_at).toLocaleDateString('es-VE')} • 
                                  {new Date(sale.created_at).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="font-black text-lg text-emerald-600 dark:text-emerald-300">
                              {formatCurrency(sale.total_amount_bs, 'VES')}
                            </p>
                            <p className="text-gray-600 dark:text-white/70 text-sm flex items-center justify-end space-x-2 font-semibold bg-white/20 dark:bg-white/20 rounded-lg px-3 py-1 backdrop-blur-sm">
                              <Heart className="w-3 h-3 text-red-400" />
                              <span>+{formatCurrency(sale.profit_bs, 'VES')}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl sm:text-8xl mb-6 animate-bounce">😴</div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-800 dark:text-white mb-4">
                    Sin historial aún
                  </h3>
                  <p className="text-gray-600 dark:text-white/70 text-base mb-8 max-w-md mx-auto">
                    Las ventas aparecerán aquí una vez que los gatitos comiencen a comprar
                  </p>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 hover:from-purple-600 hover:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700 text-white shadow-2xl transform transition-all duration-300 hover:scale-105 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-2xl">
                    <Plus className="w-5 h-5 mr-3" />
                    Ir a Ventas
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="group relative overflow-hidden rounded-3xl bg-white/10 dark:bg-white/10 backdrop-blur-xl p-1 shadow-2xl border border-white/20 dark:border-white/20">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/10 to-pink-500/20 dark:from-indigo-600/20 dark:via-purple-600/10 dark:to-pink-600/20 animate-pulse"></div>
          
          <div className="relative z-10 rounded-3xl bg-white/20 dark:bg-black/30 backdrop-blur-xl p-6 sm:p-8 border border-white/20 dark:border-white/20">
            <div className="flex items-center space-x-4 mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/40 dark:bg-indigo-600/40 rounded-2xl blur-xl animate-pulse"></div>
                <div className="relative p-3 bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-600 dark:to-purple-600 rounded-2xl shadow-xl">
                  <Zap className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-800 dark:text-white">⚡ Acciones Rápidas</h3>
                <p className="text-gray-600 dark:text-white/80 text-sm font-medium">Gestiona tu negocio con superpoderes gatunos</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Button 
                className="group relative h-20 sm:h-24 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 dark:from-emerald-500 dark:via-green-600 dark:to-teal-700 hover:from-emerald-500 hover:to-teal-700 dark:hover:from-emerald-600 dark:hover:to-teal-800 text-white shadow-2xl hover:shadow-emerald-500/50 dark:hover:shadow-emerald-600/60 transition-all duration-500 transform hover:scale-105 overflow-hidden border border-emerald-300/30 dark:border-emerald-400/40 rounded-2xl"
                size="lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="flex flex-col items-center space-y-2 sm:space-y-3 relative z-10">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="w-6 sm:w-7 h-6 sm:h-7" />
                    <span className="text-xl sm:text-2xl animate-bounce">😸</span>
                  </div>
                  <div className="text-center">
                    <p className="font-black text-base sm:text-lg">Nueva Venta</p>
                    <p className="text-emerald-100 dark:text-emerald-50 text-xs sm:text-sm font-semibold">Registrar venta gatuna</p>
                  </div>
                </div>
              </Button>
              
              <Button 
                className="group relative h-20 sm:h-24 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 dark:from-blue-500 dark:via-indigo-600 dark:to-purple-700 hover:from-blue-500 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-800 text-white shadow-2xl hover:shadow-blue-500/50 dark:hover:shadow-blue-600/60 transition-all duration-500 transform hover:scale-105 overflow-hidden border border-blue-300/30 dark:border-blue-400/40 rounded-2xl"
                size="lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="flex flex-col items-center space-y-2 sm:space-y-3 relative z-10">
                  <div className="flex items-center space-x-2">
                    <Package className="w-6 sm:w-7 h-6 sm:h-7" />
                    <span className="text-xl sm:text-2xl animate-pulse">🐾</span>
                  </div>
                  <div className="text-center">
                    <p className="font-black text-base sm:text-lg">Productos</p>
                    <p className="text-blue-100 dark:text-blue-50 text-xs sm:text-sm font-semibold">Gestionar inventario</p>
                  </div>
                </div>
              </Button>
              
              <Button 
                className="group relative h-20 sm:h-24 bg-gradient-to-r from-purple-400 via-pink-500 to-rose-600 dark:from-purple-500 dark:via-pink-600 dark:to-rose-700 hover:from-purple-500 hover:to-rose-700 dark:hover:from-purple-600 dark:hover:to-rose-800 text-white shadow-2xl hover:shadow-purple-500/50 dark:hover:shadow-purple-600/60 transition-all duration-500 transform hover:scale-105 overflow-hidden border border-purple-300/30 dark:border-purple-400/40 rounded-2xl"
                size="lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="flex flex-col items-center space-y-2 sm:space-y-3 relative z-10">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-6 sm:w-7 h-6 sm:h-7" />
                    <span className="text-xl sm:text-2xl animate-spin" style={{ animationDuration: '3s' }}>📊</span>
                  </div>
                  <div className="text-center">
                    <p className="font-black text-base sm:text-lg">Análisis</p>
                    <p className="text-purple-100 dark:text-purple-50 text-xs sm:text-sm font-semibold">Ver reportes</p>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};