"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Package, ShoppingCart, Cat, Heart, Calendar, Users, Target, Zap } from 'lucide-react';
import { formatCurrency, convertBsToUsd } from '../lib/utils';
import { getDashboardStats, fetchExchangeRate } from '../lib/api';
import { getDefaultUserId } from '../lib/supabase';
import { DashboardStats } from '../lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [exchangeRate, setExchangeRate] = useState(36.42);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    loadExchangeRate();
  }, []);

  const loadStats = async () => {
    try {
      const userId = getDefaultUserId();
      const data = await getDashboardStats(userId);
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExchangeRate = async () => {
    try {
      const rateInfo = await fetchExchangeRate();
      setExchangeRate(rateInfo.rate);
    } catch (error) {
      console.error('Error loading exchange rate:', error);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string;
    valueUsd?: string;
    icon: React.ReactNode;
    gradient: string;
    subtitle?: string;
  }> = ({ title, value, valueUsd, icon, gradient, subtitle }) => (
    <Card className={`bg-gradient-to-br ${gradient} border-0 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-white/80 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {valueUsd && (
              <p className="text-white/70 text-sm mt-1">{valueUsd}</p>
            )}
            {subtitle && (
              <p className="text-white/60 text-xs mt-1">{subtitle}</p>
            )}
          </div>
          <div className="ml-4 p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Hero Section */}
      <Card className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 border-0 text-white shadow-2xl overflow-hidden relative">
        <div className="absolute top-4 right-4 text-6xl opacity-20 animate-pulse">🐱</div>
        <div className="absolute bottom-4 left-4 text-4xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}>🍦</div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl opacity-10">✨</div>
        
        <CardContent className="p-8 relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3">¡Bienvenido a Wile Emprendimientos! 🎉</h1>
              <p className="text-pink-100 text-lg mb-4">
                Gestiona tu negocio de helados con amor y dedicación
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Cat className="w-5 h-5" />
                  <span className="text-sm">Con el poder de los gatitos</span>
                  <Heart className="w-4 h-4 text-pink-200" />
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{new Date().toLocaleDateString('es-VE')}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">Tasa BCV</p>
              <p className="text-2xl font-bold">{exchangeRate.toFixed(2)} Bs./USD</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ventas de Hoy"
          value={formatCurrency(stats?.todaySales || 0, 'VES')}
          valueUsd={formatCurrency(convertBsToUsd(stats?.todaySales || 0, exchangeRate), 'USD')}
          icon={<DollarSign className="w-6 h-6 text-white" />}
          gradient="from-green-400 to-emerald-600"
        />
        <StatCard
          title="Ganancia de Hoy"
          value={formatCurrency(stats?.todayProfit || 0, 'VES')}
          valueUsd={formatCurrency(convertBsToUsd(stats?.todayProfit || 0, exchangeRate), 'USD')}
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          gradient="from-blue-400 to-blue-600"
        />
        <StatCard
          title="Ventas Semanales"
          value={formatCurrency(stats?.weekSales || 0, 'VES')}
          valueUsd={formatCurrency(convertBsToUsd(stats?.weekSales || 0, exchangeRate), 'USD')}
          icon={<ShoppingCart className="w-6 h-6 text-white" />}
          gradient="from-purple-400 to-purple-600"
        />
        <StatCard
          title="Ventas Mensuales"
          value={formatCurrency(stats?.monthSales || 0, 'VES')}
          valueUsd={formatCurrency(convertBsToUsd(stats?.monthSales || 0, exchangeRate), 'USD')}
          icon={<Package className="w-6 h-6 text-white" />}
          gradient="from-pink-400 to-pink-600"
        />
      </div>

      {/* Top Products and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-800/40 backdrop-blur-lg border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">🏆</span>
              Productos Más Vendidos
            </CardTitle>
            <CardDescription>Últimos 30 días</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.topProducts && stats.topProducts.length > 0 ? (
              <div className="space-y-4">
                {stats.topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50/80 to-purple-50/80 dark:from-slate-700/50 dark:to-slate-600/50 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' : 
                        index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' : 'bg-gradient-to-r from-blue-400 to-blue-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.quantity} unidades vendidas
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(product.revenue, 'VES')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(convertBsToUsd(product.revenue, exchangeRate), 'USD')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">😸</div>
                <p className="text-muted-foreground">
                  ¡Aún no hay ventas registradas! Comienza vendiendo tus deliciosos helados.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-800/40 backdrop-blur-lg border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-500" />
              Acciones Rápidas
            </CardTitle>
            <CardDescription>Gestiona tu negocio eficientemente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full h-16 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              size="lg"
            >
              <div className="flex items-center justify-between w-full">
                <div className="text-left">
                  <p className="font-bold">Nueva Venta</p>
                  <p className="text-green-100 text-sm">Registrar venta rápida</p>
                </div>
                <ShoppingCart className="w-8 h-8" />
              </div>
            </Button>
            
            <Button 
              className="w-full h-16 bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              size="lg"
            >
              <div className="flex items-center justify-between w-full">
                <div className="text-left">
                  <p className="font-bold">Gestionar Productos</p>
                  <p className="text-blue-100 text-sm">Inventario y recetas</p>
                </div>
                <Package className="w-8 h-8" />
              </div>
            </Button>
            
            <Button 
              className="w-full h-16 bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              size="lg"
            >
              <div className="flex items-center justify-between w-full">
                <div className="text-left">
                  <p className="font-bold">Ver Reportes</p>
                  <p className="text-purple-100 text-sm">Análisis detallado</p>
                </div>
                <TrendingUp className="w-8 h-8" />
              </div>
            </Button>

            <div className="mt-6 p-4 bg-gradient-to-r from-pink-100/80 to-purple-100/80 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-medium">Meta del Día</p>
                  <p className="text-sm text-muted-foreground">¡Sigue así! 🎯</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Insights */}
      <Card className="bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200/50 dark:border-indigo-800/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-indigo-500" />
            Insights del Negocio
          </CardTitle>
          <CardDescription>Datos importantes para tu crecimiento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl backdrop-blur-sm">
              <div className="text-3xl mb-2">📈</div>
              <p className="font-medium">Crecimiento</p>
              <p className="text-sm text-muted-foreground">Ventas en aumento</p>
            </div>
            <div className="text-center p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl backdrop-blur-sm">
              <div className="text-3xl mb-2">🎯</div>
              <p className="font-medium">Objetivos</p>
              <p className="text-sm text-muted-foreground">En buen camino</p>
            </div>
            <div className="text-center p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl backdrop-blur-sm">
              <div className="text-3xl mb-2">⭐</div>
              <p className="font-medium">Calidad</p>
              <p className="text-sm text-muted-foreground">Productos excelentes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};