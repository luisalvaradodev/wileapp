"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Plus, Minus, DollarSign, Search, 
  TrendingUp, Package, History, BarChart3, Calendar,
  Banknote, CreditCard, Smartphone, Coffee, Gift,
  Target, Zap, Star, Filter, ShoppingBag, Box,
  Edit, Trash2, ChevronDown, ChevronUp, X, Sparkles,
  Crown, Award, Flame, Heart, PawPrint, Fish, Gem,
  Trophy, Rocket, CloudLightning as Lightning
} from 'lucide-react';
import { Product, Sale, SaleItem, SalesHistory, SalesAnalytics, Combo } from '../lib/types';
import { createSale, getSalesAnalytics, getCombos, deleteSale, updateSale, getSalesHistory } from '../lib/api';
import { formatCurrency, convertBsToUsd, getCategoryEmoji, formatDate } from '../lib/utils';
import { getDefaultUserId } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatedCard } from '@/components/ui/animated-card';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { toast } from "sonner";

interface SalesManagerClientProps {
  initialProducts: Product[];
  initialSalesHistory: SalesHistory[];
  initialExchangeRate: number;
}

interface CartItem {
  type: 'product' | 'combo';
  id: string;
  name: string;
  price: number;
  cost: number;
  quantity: number;
  data: Product | Combo;
}

export const SalesManagerClient: React.FC<SalesManagerClientProps> = ({
  initialProducts,
  initialSalesHistory,
  initialExchangeRate
}) => {
  const [products] = useState<Product[]>(initialProducts);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [salesHistory, setSalesHistory] = useState<SalesHistory[]>(initialSalesHistory);
  const [analytics, setAnalytics] = useState<SalesAnalytics | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [exchangeRate] = useState(initialExchangeRate);
  const [paymentMethod, setPaymentMethod] = useState({
    cash_bs: '',
    card_bs: '',
    mobile_bs: '',
    usd: ''
  });
  const [expenses, setExpenses] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('sale');
  const [historyFilter, setHistoryFilter] = useState('all');
  const [itemType, setItemType] = useState<'products' | 'combos'>('products');
  const [editingSale, setEditingSale] = useState<SalesHistory | null>(null);
  const [deletingSale, setDeletingSale] = useState<SalesHistory | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);

  // Load combos and analytics
  useEffect(() => {
    const loadData = async () => {
      try {
        const combosData = await getCombos();
        setCombos(combosData);
      } catch (error) {
        console.error('Error loading combos:', error);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const userId = getDefaultUserId();
        const analyticsData = await getSalesAnalytics(userId, 30);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error loading analytics:', error);
      }
    };
    
    if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeTab, salesHistory]);

  const calculateComboPrice = (combo: Combo) => {
    const basePrice = combo.combo_items?.reduce((total, item) => {
      const product = products.find(p => p.id === item.product_id);
      return total + (product ? product.sale_price * item.quantity : 0);
    }, 0) || 0;
    
    return basePrice * (1 - combo.discount_percentage / 100);
  };

  const calculateComboCost = (combo: Combo) => {
    return combo.combo_items?.reduce((total, item) => {
      const product = products.find(p => p.id === item.product_id);
      return total + (product ? product.cost_price * item.quantity : 0);
    }, 0) || 0;
  };

  const addProductToCart = (product: Product) => {
    const existingItem = cart.find(item => item.type === 'product' && item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.type === 'product' && item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: CartItem = {
        type: 'product',
        id: product.id,
        name: product.name,
        price: product.sale_price,
        cost: product.cost_price,
        quantity: 1,
        data: product
      };
      setCart([...cart, newItem]);
    }
  };

  const addComboToCart = (combo: Combo) => {
    const existingItem = cart.find(item => item.type === 'combo' && item.id === combo.id);
    const comboPrice = calculateComboPrice(combo);
    const comboCost = calculateComboCost(combo);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.type === 'combo' && item.id === combo.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: CartItem = {
        type: 'combo',
        id: combo.id,
        name: combo.name,
        price: comboPrice,
        cost: comboCost,
        quantity: 1,
        data: combo
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (id: string, type: 'product' | 'combo', quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => !(item.id === id && item.type === type)));
    } else {
      setCart(cart.map(item =>
        item.id === id && item.type === type
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const profit = cart.reduce((sum, item) => sum + ((item.price - item.cost) * item.quantity), 0);
    
    const cashBs = parseFloat(paymentMethod.cash_bs) || 0;
    const cardBs = parseFloat(paymentMethod.card_bs) || 0;
    const mobileBs = parseFloat(paymentMethod.mobile_bs) || 0;
    const usd = parseFloat(paymentMethod.usd) || 0;
    const usdInBs = usd * exchangeRate;
    
    const totalPayments = cashBs + cardBs + mobileBs + usdInBs;
    const expensesAmount = parseFloat(expenses) || 0;
    const netProfit = profit - expensesAmount;

    return {
      subtotal,
      profit,
      totalPayments,
      usdInBs,
      expensesAmount,
      netProfit,
      usd
    };
  };

  const handleSale = async () => {
    if (cart.length === 0) return;

    setLoading(true);
    try {
      const totals = calculateTotals();
      const userId = getDefaultUserId();
      
      const saleData: Omit<Sale, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        date: editingSale?.date || new Date().toISOString().split('T')[0],
        total_amount_bs: totals.subtotal,
        total_amount_usd: totals.usd,
        exchange_rate: exchangeRate,
        payment_method_cash_bs: parseFloat(paymentMethod.cash_bs) || 0,
        payment_method_card_bs: parseFloat(paymentMethod.card_bs) || 0,
        payment_method_mobile_bs: parseFloat(paymentMethod.mobile_bs) || 0,
        payment_method_usd: parseFloat(paymentMethod.usd) || 0,
        expenses_bs: totals.expensesAmount,
        profit_bs: totals.netProfit,
        profit_usd: totals.netProfit / exchangeRate,
        notes
      };

      const saleItems: Omit<SaleItem, 'id' | 'sale_id'>[] = cart.map(item => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        cost_price: item.cost
      }));

      if (editingSale) {
        const originalItems = (editingSale.sale_items ?? []).map(item => ({
          product_id: (item as any).product_id ?? item.product_name,
          quantity: item.quantity
        }));

        await updateSale(
          editingSale.id,
          saleData,
          saleItems,
          originalItems
        );

        toast(
          <div>
            <div className="font-bold">Venta actualizada</div>
            <div>¡La venta se ha actualizado exitosamente!</div>
          </div>,
          { className: "bg-green-500 text-white border-0" }
        );
      } else {
        await createSale(saleData, saleItems);
        
        toast(
          <div>
            <div className="font-bold">Venta registrada</div>
            <div>¡La venta se ha registrado exitosamente!</div>
          </div>,
          { className: "bg-green-500 text-white border-0" }
        );
      }
      
      // Reset form
      setCart([]);
      setPaymentMethod({ cash_bs: '', card_bs: '', mobile_bs: '', usd: '' });
      setExpenses('');
      setNotes('');
      setEditingSale(null);
      
      // Refresh sales history
      const refreshedUserId = getDefaultUserId();
      const updatedHistory = await getSalesHistory(refreshedUserId, 50);
      setSalesHistory(updatedHistory);
    } catch (error: any) {
      console.error('Error saving sale:', error);
      toast.error(error.message || "No se pudo guardar la venta");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSale = async () => {
    if (!deletingSale) return;
    
    if (verificationCode !== '1234') {
      toast.error("El código de verificación es incorrecto");
      return;
    }
    
    try {
      await deleteSale(deletingSale.id);
      
      toast(
        <div>
          <div className="font-bold">Venta eliminada</div>
          <div>La venta ha sido eliminada exitosamente</div>
        </div>,
        { className: "bg-green-500 text-white border-0" }
      );
      
      // Refresh sales history
      const userId = getDefaultUserId();
      const updatedHistory = await getSalesHistory(userId, 50);
      setSalesHistory(updatedHistory);
      
      setDeletingSale(null);
      setVerificationCode('');
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast(
        <div>
          <div className="font-bold text-red-600">Error</div>
          <div>No se pudo eliminar la venta</div>
        </div>,
        { className: "bg-red-500 text-white border-0" }
      );
    }
  };

  const toggleSaleDetails = (saleId: string) => {
    if (expandedSaleId === saleId) {
      setExpandedSaleId(null);
    } else {
      setExpandedSaleId(saleId);
    }
  };

  const handleEditSale = (sale: SalesHistory) => {
    const cartItems: CartItem[] = (sale.sale_items ?? []).map(item => {
      const productId = (item as any).product_id ?? item.product_name;
      const costPrice = (item as any).cost_price ?? 0;
      const product = products.find(p => p.id === productId);
      if (product) {
        return {
          type: 'product' as const,
          id: product.id,
          name: product.name,
          price: item.unit_price,
          cost: costPrice,
          quantity: item.quantity,
          data: product
        };
      } else {
        return {
          type: 'product' as const,
          id: item.product_name,
          name: item.product_name,
          price: item.unit_price,
          cost: costPrice,
          quantity: item.quantity,
          data: {} as Product
        };
      }
    });

    setCart(cartItems);
    setPaymentMethod({
      cash_bs: sale.payment_method_cash_bs.toString(),
      card_bs: sale.payment_method_card_bs.toString(),
      mobile_bs: sale.payment_method_mobile_bs.toString(),
      usd: sale.payment_method_usd.toString()
    });
    setExpenses(sale.expenses_bs.toString());
    setNotes((sale as any).notes || '');
    setEditingSale(sale);
    setActiveTab('sale');
  };

  const cancelEdit = () => {
    setEditingSale(null);
    setCart([]);
    setPaymentMethod({ cash_bs: '', card_bs: '', mobile_bs: '', usd: '' });
    setExpenses('');
    setNotes('');
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    product.stock_quantity > 0 &&
    product.is_active
  );

  const filteredCombos = combos.filter(combo =>
    combo.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    combo.is_active
  );

  const filteredHistory = salesHistory.filter(sale => {
    if (historyFilter === 'all') return true;
    if (historyFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return sale.date === today;
    }
    if (historyFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(sale.date) >= weekAgo;
    }
    return true;
  });

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 dark:from-slate-900 dark:via-green-950 dark:to-slate-900 relative overflow-hidden transition-colors duration-500">
      {/* Delete Sale Modal */}
      {deletingSale && (
        <div className="fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-white/20 dark:border-gray-700/50">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-black text-xl text-gray-900 dark:text-white mb-2">Confirmar Eliminación</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                ¿Estás seguro de que deseas eliminar la venta #{deletingSale.id.slice(0, 8)}?
                Esta acción no se puede deshacer.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Código de verificación (1234):
                </Label>
                <Input
                  type="password"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="mt-2 h-12 text-center text-lg font-mono bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-red-400 dark:focus:border-red-500"
                  placeholder="••••"
                  maxLength={4}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setDeletingSale(null);
                    setVerificationCode('');
                  }}
                  className="flex-1 h-12 bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/80"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  disabled={verificationCode !== '1234'}
                  onClick={handleDeleteSale}
                  className="flex-1 h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-20 text-4xl opacity-5 dark:opacity-10 animate-pulse" style={{ animationDelay: '0s' }}>💰</div>
        <div className="absolute top-40 right-32 text-5xl opacity-5 dark:opacity-10 animate-pulse" style={{ animationDelay: '2s' }}>🛒</div>
        <div className="absolute bottom-32 left-1/3 text-3xl opacity-5 dark:opacity-10 animate-pulse" style={{ animationDelay: '1s' }}>📊</div>
        <div className="absolute top-1/3 right-20 text-4xl opacity-5 dark:opacity-10 animate-pulse" style={{ animationDelay: '3s' }}>💳</div>
        <div className="absolute bottom-20 right-1/4 text-3xl opacity-5 dark:opacity-10 animate-pulse" style={{ animationDelay: '4s' }}>🎯</div>
        <div className="absolute top-1/2 left-20 text-4xl opacity-5 dark:opacity-10 animate-pulse" style={{ animationDelay: '5s' }}>⚡</div>
      </div>

      <div className="relative z-10 space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header - Redesigned */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 dark:from-emerald-600 dark:via-green-700 dark:to-teal-700 text-white shadow-2xl">
          {/* Animated background patterns */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-4 right-8 text-6xl opacity-20 animate-bounce">🛒</div>
            <div className="absolute bottom-4 left-8 text-4xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}>💰</div>
            <div className="absolute top-1/2 left-1/4 text-3xl opacity-20 animate-bounce" style={{ animationDelay: '2s' }}>📊</div>
            <div className="absolute bottom-1/3 right-1/3 text-3xl opacity-25 animate-pulse" style={{ animationDelay: '3s' }}>⚡</div>
          </div>
          
          <div className="relative z-10 p-6 sm:p-8">
            {/* Mobile Layout */}
            <div className="block lg:hidden space-y-6">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-white/20 dark:bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 dark:border-white/40 shadow-xl">
                    <ShoppingCart className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black mb-2">Centro de Ventas 🛒</h1>
                <p className="text-emerald-100 dark:text-emerald-50 text-sm font-medium">
                  Registra ventas y analiza tu negocio gatuno
                </p>
              </div>
              
              <div className="bg-white/10 dark:bg-white/20 backdrop-blur-sm p-4 rounded-2xl border border-white/20 dark:border-white/30 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <DollarSign className="w-4 h-4 text-emerald-200 dark:text-emerald-100" />
                  <span className="text-sm text-emerald-200 dark:text-emerald-100 font-semibold">Tasa BCV</span>
                </div>
                <p className="text-2xl font-black text-white">{exchangeRate.toFixed(2)}</p>
                <p className="text-xs text-emerald-100 dark:text-emerald-50">Bs./USD</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 dark:bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/20 dark:border-white/30 text-center">
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <Package className="w-4 h-4 text-green-200 dark:text-green-100" />
                    <span className="text-xs text-green-200 dark:text-green-100 font-semibold">Productos</span>
                  </div>
                  <p className="text-lg font-black text-white">{products.length}</p>
                </div>
                <div className="bg-white/10 dark:bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/20 dark:border-white/30 text-center">
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <ShoppingBag className="w-4 h-4 text-blue-200 dark:text-blue-100" />
                    <span className="text-xs text-blue-200 dark:text-blue-100 font-semibold">Combos</span>
                  </div>
                  <p className="text-lg font-black text-white">{combos.length}</p>
                </div>
                <div className="bg-white/10 dark:bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/20 dark:border-white/30 text-center">
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <ShoppingCart className="w-4 h-4 text-emerald-200 dark:text-emerald-100" />
                    <span className="text-xs text-emerald-200 dark:text-emerald-100 font-semibold">En Carrito</span>
                  </div>
                  <p className="text-lg font-black text-white">{cart.length}</p>
                </div>
                <div className="bg-white/10 dark:bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/20 dark:border-white/30 text-center">
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <TrendingUp className="w-4 h-4 text-teal-200 dark:text-teal-100" />
                    <span className="text-xs text-teal-200 dark:text-teal-100 font-semibold">Total</span>
                  </div>
                  <p className="text-sm font-black text-white">{formatCurrency(totals.subtotal, 'VES')}</p>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-white/20 dark:bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 dark:border-white/40 shadow-xl">
                    <ShoppingCart className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black mb-1">Centro de Ventas 🛒</h1>
                    <p className="text-emerald-100 dark:text-emerald-50 text-base font-medium">
                      Registra ventas y analiza tu negocio gatuno
                    </p>
                  </div>
                </div>
                
                <div className="bg-white/10 dark:bg-white/20 backdrop-blur-sm p-4 rounded-2xl border border-white/20 dark:border-white/30">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <DollarSign className="w-5 h-5 text-emerald-200 dark:text-emerald-100" />
                      <span className="text-sm text-emerald-200 dark:text-emerald-100 font-semibold">Tasa BCV</span>
                    </div>
                    <p className="text-2xl font-black text-white">{exchangeRate.toFixed(2)}</p>
                    <p className="text-xs text-emerald-100 dark:text-emerald-50">Bs./USD</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white/10 dark:bg-white/20 backdrop-blur-sm p-4 rounded-xl border border-white/20 dark:border-white/30">
                  <div className="flex items-center space-x-3 mb-2">
                    <Package className="w-5 h-5 text-green-200 dark:text-green-100" />
                    <span className="text-sm text-green-200 dark:text-green-100 font-semibold">Productos</span>
                  </div>
                  <p className="text-2xl font-black text-white">{products.length}</p>
                </div>
                <div className="bg-white/10 dark:bg-white/20 backdrop-blur-sm p-4 rounded-xl border border-white/20 dark:border-white/30">
                  <div className="flex items-center space-x-3 mb-2">
                    <ShoppingBag className="w-5 h-5 text-blue-200 dark:text-blue-100" />
                    <span className="text-sm text-blue-200 dark:text-blue-100 font-semibold">Combos</span>
                  </div>
                  <p className="text-2xl font-black text-white">{combos.length}</p>
                </div>
                <div className="bg-white/10 dark:bg-white/20 backdrop-blur-sm p-4 rounded-xl border border-white/20 dark:border-white/30">
                  <div className="flex items-center space-x-3 mb-2">
                    <ShoppingCart className="w-5 h-5 text-emerald-200 dark:text-emerald-100" />
                    <span className="text-sm text-emerald-200 dark:text-emerald-100 font-semibold">En Carrito</span>
                  </div>
                  <p className="text-2xl font-black text-white">{cart.length}</p>
                </div>
                <div className="bg-white/10 dark:bg-white/20 backdrop-blur-sm p-4 rounded-xl border border-white/20 dark:border-white/30">
                  <div className="flex items-center space-x-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-teal-200 dark:text-teal-100" />
                    <span className="text-sm text-teal-200 dark:text-teal-100 font-semibold">Total</span>
                  </div>
                  <p className="text-xl font-black text-white">{formatCurrency(totals.subtotal, 'VES')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Mode Banner */}
        {editingSale && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-white p-4 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 animate-pulse"></div>
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Edit className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-black text-lg">Modo Edición Activo</p>
                  <p className="text-blue-100 dark:text-blue-50 text-sm">
                    Editando venta #{editingSale.id.slice(0, 8)}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={cancelEdit}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar edición
              </Button>
            </div>
          </div>
        )}

        {/* Tabs - Redesigned */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-14 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-2 border-green-200/50 dark:border-green-800/50 rounded-2xl shadow-xl">
            <TabsTrigger 
              value="sale" 
              className="flex items-center space-x-2 text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Venta</span>
              <span className="sm:hidden">Venta</span>
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="flex items-center space-x-2 text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Historial</span>
              <span className="sm:hidden">Historia</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center space-x-2 text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Análisis</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sale" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Products/Combos Section */}
              <div className="xl:col-span-2 space-y-6">
                {/* Search and Type Toggle */}
                <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-1 shadow-xl border border-white/20 dark:border-gray-700/50">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-teal-500/10 dark:from-green-600/20 dark:via-emerald-600/10 dark:to-teal-600/20 animate-pulse"></div>
                  
                  <div className="relative z-10 rounded-3xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-6 border border-white/30 dark:border-gray-700/60">
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                        <Input
                          placeholder={itemType === 'products' ? "Buscar productos mágicos..." : "Buscar combos especiales..."}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-12 h-12 text-base bg-white/80 dark:bg-gray-800/80 backdrop-blur border-2 border-green-200/60 dark:border-green-700/60 focus:border-green-400 dark:focus:border-green-500 rounded-xl shadow-lg"
                        />
                      </div>
                      
                      <Select value={itemType} onValueChange={(value: any) => setItemType(value)}>
                        <SelectTrigger className="w-full h-12 text-base bg-white/80 dark:bg-gray-800/80 backdrop-blur border-2 border-green-200/60 dark:border-green-700/60 rounded-xl shadow-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl">
                          <SelectItem value="products" className="text-base">
                            <div className="flex items-center space-x-3">
                              <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
                              <span>Productos Individuales</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="combos" className="text-base">
                            <div className="flex items-center space-x-3">
                              <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              <span>Combos Especiales</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                {itemType === 'products' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => {
                      const isLowStock = product.stock_quantity <= 5;
                      const profitMargin = ((product.sale_price - product.cost_price) / product.cost_price * 100);
                      
                      return (
                        <div 
                          key={product.id}
                          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-white to-green-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-green-900/20 p-1 shadow-xl border border-green-200/60 dark:border-green-700/60 hover:border-green-400 dark:hover:border-green-500 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 dark:from-white/5 dark:via-transparent dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          <div className="relative z-10 rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-4 border border-white/30 dark:border-gray-700/50">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex flex-wrap gap-2">
                                {isLowStock && (
                                  <Badge className="text-xs bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse">
                                    ⚠️ Stock Bajo
                                  </Badge>
                                )}
                                {profitMargin > 50 && (
                                  <Badge className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                                    💎 Alto Margen
                                  </Badge>
                                )}
                              </div>
                              <div className="text-2xl animate-bounce">{getCategoryEmoji(product.categories?.name)}</div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <h3 className="font-black text-base leading-tight mb-2 text-gray-900 dark:text-white">{product.name}</h3>
                                <Badge variant="outline" className="text-xs bg-white/60 dark:bg-gray-800/60 border-green-200 dark:border-green-700">
                                  {product.categories?.name || 'Sin categoría'}
                                </Badge>
                              </div>

                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-black text-lg text-green-600 dark:text-green-400">
                                    {formatCurrency(product.sale_price, 'VES')}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatCurrency(convertBsToUsd(product.sale_price, exchangeRate), 'USD')}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Stock:</p>
                                  <p className={`font-black text-base ${isLowStock ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                    {product.stock_quantity}
                                  </p>
                                </div>
                              </div>

                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addProductToCart(product);
                                }}
                                disabled={product.stock_quantity <= 0}
                                className="w-full h-10 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Agregar al Carrito
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Combos Grid */}
                {itemType === 'combos' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCombos.map((combo) => {
                      const comboPrice = calculateComboPrice(combo);
                      const comboCost = calculateComboCost(combo);
                      const profitMargin = ((comboPrice - comboCost) / comboCost * 100);
                      
                      return (
                        <div 
                          key={combo.id}
                          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-white to-blue-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20 p-1 shadow-xl border border-blue-200/60 dark:border-blue-700/60 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 dark:from-white/5 dark:via-transparent dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          <div className="relative z-10 rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-4 border border-white/30 dark:border-gray-700/50">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex flex-wrap gap-2">
                                <Badge className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white animate-pulse">
                                  🎁 Combo {combo.discount_percentage}% OFF
                                </Badge>
                                {profitMargin > 30 && (
                                  <Badge className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                                    <Star className="w-3 h-3 mr-1" />
                                    Alto Margen
                                  </Badge>
                                )}
                              </div>
                              <div className="text-2xl animate-bounce">🎁</div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <h3 className="font-black text-base leading-tight mb-2 text-gray-900 dark:text-white">{combo.name}</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  Combo especial con descuento
                                </p>
                              </div>

                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-black text-lg text-blue-600 dark:text-blue-400">
                                    {formatCurrency(comboPrice, 'VES')}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatCurrency(convertBsToUsd(comboPrice, exchangeRate), 'USD')}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Margen:</p>
                                  <p className={`font-black text-sm ${profitMargin > 30 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                    {profitMargin.toFixed(1)}%
                                  </p>
                                </div>
                              </div>

                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addComboToCart(combo);
                                }}
                                className="w-full h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Agregar Combo
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Empty States */}
                {itemType === 'products' && filteredProducts.length === 0 && (
                  <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-8 text-center shadow-xl border border-white/20 dark:border-gray-700/50">
                    <div className="text-6xl mb-4 animate-bounce">🔍</div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                      {searchTerm ? 'No se encontraron productos' : 'No hay productos disponibles'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {searchTerm ? 'Intenta con otro término de búsqueda' : 'Agrega productos para comenzar a vender'}
                    </p>
                  </div>
                )}

                {itemType === 'combos' && filteredCombos.length === 0 && (
                  <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-8 text-center shadow-xl border border-white/20 dark:border-gray-700/50">
                    <div className="text-6xl mb-4 animate-bounce">🎁</div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                      {searchTerm ? 'No se encontraron combos' : 'No hay combos disponibles'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {searchTerm ? 'Intenta con otro término de búsqueda' : 'Crea combos especiales para aumentar las ventas'}
                    </p>
                  </div>
                )}
              </div>

              {/* Cart and Payment Section */}
              <div className="space-y-6">
                {/* Cart */}
                <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-1 shadow-xl border border-white/20 dark:border-gray-700/50">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-pink-500/5 to-purple-500/10 dark:from-orange-600/20 dark:via-pink-600/10 dark:to-purple-600/20 animate-pulse"></div>
                  
                  <div className="relative z-10 rounded-3xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-6 border border-white/30 dark:border-gray-700/60">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                        <ShoppingCart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-black text-lg text-gray-900 dark:text-white">Carrito de Compras</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{cart.length} productos</p>
                      </div>
                    </div>

                    {cart.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-5xl mb-4 animate-bounce">🛒</div>
                        <p className="text-gray-600 dark:text-gray-400 font-medium">Carrito vacío</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">Agrega productos para comenzar</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                        {cart.map((item, index) => (
                          <div key={`${item.type}-${item.id}-${index}`} className="group relative overflow-hidden rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 border border-white/30 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0 mr-4">
                                <div className="flex items-center space-x-2 mb-2">
                                  <p className="font-bold text-sm truncate text-gray-900 dark:text-white">{item.name}</p>
                                  <Badge variant="outline" className="text-[10px] bg-white/60 dark:bg-gray-700/60">
                                    {item.type === 'combo' ? '🎁 Combo' : '📦 Producto'}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                  {formatCurrency(item.price, 'VES')} c/u
                                </p>
                                <p className="text-sm font-black text-green-600 dark:text-green-400">
                                  {formatCurrency(item.price * item.quantity, 'VES')}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
                                  className="h-8 w-8 bg-white/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-8 text-center text-sm font-black text-gray-900 dark:text-white">
                                  {item.quantity}
                                </span>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                                  className="h-8 w-8 bg-white/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                  disabled={item.type === 'product' && item.quantity >= (item.data as Product).stock_quantity}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Methods */}
                {cart.length > 0 && (
                  <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-1 shadow-xl border border-white/20 dark:border-gray-700/50">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-purple-500/10 dark:from-blue-600/20 dark:via-indigo-600/10 dark:to-purple-600/20 animate-pulse"></div>
                    
                    <div className="relative z-10 rounded-3xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-6 border border-white/30 dark:border-gray-700/60">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                          <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-black text-lg text-gray-900 dark:text-white">Métodos de Pago</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Especifica cómo se pagará</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                              <Banknote className="w-4 h-4 mr-2 text-green-500" />
                              Efectivo (Bs.)
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={paymentMethod.cash_bs}
                              onChange={(e) => setPaymentMethod({ ...paymentMethod, cash_bs: e.target.value })}
                              className="h-12 text-base bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-green-400 dark:focus:border-green-500 rounded-xl"
                              placeholder="0.00"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                              <CreditCard className="w-4 h-4 mr-2 text-blue-500" />
                              Tarjeta (Bs.)
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={paymentMethod.card_bs}
                              onChange={(e) => setPaymentMethod({ ...paymentMethod, card_bs: e.target.value })}
                              className="h-12 text-base bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-500 rounded-xl"
                              placeholder="0.00"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                              <Smartphone className="w-4 h-4 mr-2 text-purple-500" />
                              Pago Móvil (Bs.)
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={paymentMethod.mobile_bs}
                              onChange={(e) => setPaymentMethod({ ...paymentMethod, mobile_bs: e.target.value })}
                              className="h-12 text-base bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-purple-400 dark:focus:border-purple-500 rounded-xl"
                              placeholder="0.00"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                              <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                              Dólares (USD)
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={paymentMethod.usd}
                              onChange={(e) => setPaymentMethod({ ...paymentMethod, usd: e.target.value })}
                              className="h-12 text-base bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-green-400 dark:focus:border-green-500 rounded-xl"
                              placeholder="0.00"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                              <Coffee className="w-4 h-4 mr-2 text-orange-500" />
                              Gastos (Bs.)
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={expenses}
                              onChange={(e) => setExpenses(e.target.value)}
                              className="h-12 text-base bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-orange-400 dark:focus:border-orange-500 rounded-xl"
                              placeholder="0.00"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">Notas (opcional)</Label>
                            <Textarea
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Notas adicionales de la venta..."
                              className="h-20 text-base bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 focus:border-gray-400 dark:focus:border-gray-500 rounded-xl resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary */}
                {cart.length > 0 && (
                  <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-1 shadow-xl border border-white/20 dark:border-gray-700/50">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-teal-500/10 dark:from-green-600/20 dark:via-emerald-600/10 dark:to-teal-600/20 animate-pulse"></div>
                    
                    <div className="relative z-10 rounded-3xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-6 border border-white/30 dark:border-gray-700/60">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                          <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-black text-lg text-gray-900 dark:text-white">Resumen de Venta</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Detalles financieros</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-3 text-base">
                          <div className="flex justify-between items-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Subtotal:</span>
                            <span className="font-black text-gray-900 dark:text-white">{formatCurrency(totals.subtotal, 'VES')}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Total pagado:</span>
                            <span className="font-black text-gray-900 dark:text-white">{formatCurrency(totals.totalPayments, 'VES')}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Gastos:</span>
                            <span className="font-black text-red-600 dark:text-red-400">{formatCurrency(totals.expensesAmount, 'VES')}</span>
                          </div>
                          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border-2 border-green-200 dark:border-green-700">
                            <span className="font-black text-gray-900 dark:text-white">Ganancia neta:</span>
                            <span className="font-black text-xl text-green-600 dark:text-green-400">{formatCurrency(totals.netProfit, 'VES')}</span>
                          </div>
                        </div>
                        
                        <Button
                          onClick={handleSale}
                          disabled={loading || totals.totalPayments < totals.subtotal}
                          className="w-full h-14 text-lg font-black bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
                        >
                          {loading ? (
                            <div className="flex items-center space-x-3">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              <span>{editingSale ? 'Actualizando venta...' : 'Procesando venta...'}</span>
                            </div>
                          ) : editingSale ? (
                            <div className="flex items-center space-x-3">
                              <Edit className="w-5 h-5" />
                              <span>Actualizar Venta</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-3">
                              <Gift className="w-5 h-5" />
                              <span>Completar Venta</span>
                              <Sparkles className="w-5 h-5 animate-pulse" />
                            </div>
                          )}
                        </Button>
                        
                        {totals.totalPayments < totals.subtotal && (
                          <div className="text-center p-3 bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-xl border border-red-200 dark:border-red-700">
                            <p className="text-red-700 dark:text-red-300 font-bold">
                              ⚠️ Falta: {formatCurrency(totals.subtotal - totals.totalPayments, 'VES')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {/* History Filters */}
            <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-1 shadow-xl border border-white/20 dark:border-gray-700/50">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-pink-500/10 dark:from-blue-600/20 dark:via-purple-600/10 dark:to-pink-600/20 animate-pulse"></div>
              
              <div className="relative z-10 rounded-3xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-6 border border-white/30 dark:border-gray-700/60">
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                      <History className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-gray-900 dark:text-white">Historial de Ventas</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Mostrando {filteredHistory.length} de {salesHistory.length} ventas
                      </p>
                    </div>
                  </div>
                  
                  <Select value={historyFilter} onValueChange={setHistoryFilter}>
                    <SelectTrigger className="w-full sm:w-auto h-12 text-base bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl">
                      <SelectItem value="all" className="text-base">Todas las ventas</SelectItem>
                      <SelectItem value="today" className="text-base">Hoy</SelectItem>
                      <SelectItem value="week" className="text-base">Esta semana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Sales History */}
            <div className="space-y-4">
              {filteredHistory.map((sale) => (
                <div 
                  key={sale.id}
                  className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-1 shadow-xl border border-white/20 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-purple-500/5 dark:from-green-600/10 dark:via-blue-600/10 dark:to-purple-600/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10 rounded-3xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-6 border border-white/30 dark:border-gray-700/60">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleSaleDetails(sale.id)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <ShoppingCart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-black text-base text-gray-900 dark:text-white">
                            Venta #{sale.id.slice(0, 8)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(sale.date)}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-black text-lg text-green-600 dark:text-green-400">
                          {formatCurrency(sale.total_amount_bs, 'VES')}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-end space-x-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>+{formatCurrency(sale.profit_bs, 'VES')}</span>
                        </p>
                      </div>
                    </div>

                    {expandedSaleId === sale.id && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                        {/* Payment Methods */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-6">
                          {sale.payment_method_cash_bs > 0 && (
                            <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                              <Banknote className="w-4 h-4 text-green-500" />
                              <span className="font-semibold">Efectivo: {formatCurrency(sale.payment_method_cash_bs, 'VES')}</span>
                            </div>
                          )}
                          {sale.payment_method_card_bs > 0 && (
                            <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                              <CreditCard className="w-4 h-4 text-blue-500" />
                              <span className="font-semibold">Tarjeta: {formatCurrency(sale.payment_method_card_bs, 'VES')}</span>
                            </div>
                          )}
                          {sale.payment_method_mobile_bs > 0 && (
                            <div className="flex items-center space-x-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                              <Smartphone className="w-4 h-4 text-purple-500" />
                              <span className="font-semibold">P.Móvil: {formatCurrency(sale.payment_method_mobile_bs, 'VES')}</span>
                            </div>
                          )}
                          {sale.payment_method_usd > 0 && (
                            <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="font-semibold">USD: {formatCurrency(sale.payment_method_usd, 'USD')}</span>
                            </div>
                          )}
                        </div>

                        {/* Products Sold */}
                        {sale.sale_items && sale.sale_items.length > 0 && (
                          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                            <p className="text-sm font-bold mb-3 text-gray-900 dark:text-white">Productos vendidos:</p>
                            <div className="space-y-2">
                              {sale.sale_items.map((item, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                  <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                    {item.quantity}x {item.product_name}
                                  </span>
                                  <span className="font-bold text-sm text-green-600 dark:text-green-400">
                                    {formatCurrency(item.total_price, 'VES')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                          <Button 
                            variant="outline" 
                            onClick={() => handleEditSale(sale)}
                            className="h-10 bg-white/80 dark:bg-gray-800/80 border-2 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar Venta
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={() => setDeletingSale(sale)}
                            className="h-10 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 font-semibold"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar Venta
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredHistory.length === 0 && (
              <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-12 text-center shadow-xl border border-white/20 dark:border-gray-700/50">
                <div className="text-8xl mb-6 animate-bounce">📋</div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">No hay ventas registradas</h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-md mx-auto">
                  {historyFilter === 'all' 
                    ? 'Aún no has realizado ninguna venta. ¡Es hora de comenzar!'
                    : 'No hay ventas en el período seleccionado'
                  }
                </p>
                <Button 
                  onClick={() => setActiveTab('sale')} 
                  className="h-12 px-8 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="w-5 h-5 mr-3" />
                  Realizar Primera Venta
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {analytics ? (
              <>
                {/* Analytics Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-1 shadow-xl border border-white/20 dark:border-gray-700/50">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-teal-500/10 dark:from-green-600/20 dark:via-emerald-600/10 dark:to-teal-600/20 animate-pulse"></div>
                    
                    <div className="relative z-10 rounded-3xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-6 border border-white/30 dark:border-gray-700/60">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-black text-base text-gray-900 dark:text-white">Ventas Totales</h3>
                      </div>
                      <div className="space-y-2">
                        <p className="text-2xl font-black text-green-600 dark:text-green-400">
                          {formatCurrency(analytics.totalSales, 'VES')}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Últimos 30 días
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-1 shadow-xl border border-white/20 dark:border-gray-700/50">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-purple-500/10 dark:from-blue-600/20 dark:via-indigo-600/10 dark:to-purple-600/20 animate-pulse"></div>
                    
                    <div className="relative z-10 rounded-3xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-6 border border-white/30 dark:border-gray-700/60">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-black text-base text-gray-900 dark:text-white">Ganancia Total</h3>
                      </div>
                      <div className="space-y-2">
                        <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                          {formatCurrency(analytics.totalProfit, 'VES')}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Margen: {analytics.profitMargin.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-1 shadow-xl border border-white/20 dark:border-gray-700/50">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-rose-500/10 dark:from-purple-600/20 dark:via-pink-600/10 dark:to-rose-600/20 animate-pulse"></div>
                    
                    <div className="relative z-10 rounded-3xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-6 border border-white/30 dark:border-gray-700/60">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                          <ShoppingCart className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-black text-base text-gray-900 dark:text-white">Transacciones</h3>
                      </div>
                      <div className="space-y-2">
                        <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                          {analytics.totalTransactions}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Ventas realizadas
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-1 shadow-xl border border-white/20 dark:border-gray-700/50">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-yellow-500/5 to-red-500/10 dark:from-orange-600/20 dark:via-yellow-600/10 dark:to-red-600/20 animate-pulse"></div>
                    
                    <div className="relative z-10 rounded-3xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-6 border border-white/30 dark:border-gray-700/60">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-black text-base text-gray-900 dark:text-white">Venta Promedio</h3>
                      </div>
                      <div className="space-y-2">
                        <p className="text-2xl font-black text-orange-600 dark:text-orange-400">
                          {formatCurrency(analytics.avgSaleValue, 'VES')}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Por transacción
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Daily Sales Chart */}
                <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-1 shadow-xl border border-white/20 dark:border-gray-700/50">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-pink-500/10 dark:from-indigo-600/20 dark:via-purple-600/10 dark:to-pink-600/20 animate-pulse"></div>
                  
                  <div className="relative z-10 rounded-3xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-8 border border-white/30 dark:border-gray-700/60">
                    <div className="flex items-center space-x-3 mb-8">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-black text-xl text-gray-900 dark:text-white">Ventas Diarias</h3>
                        <p className="text-gray-600 dark:text-gray-400">Últimos 5 días de actividad</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {analytics.dailySalesData.slice(-5).map((day) => (
                        <div key={day.date} className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-base text-gray-900 dark:text-white">{formatDate(day.date)}</span>
                            <div className="text-right">
                              <span className="font-black text-lg text-green-600 dark:text-green-400">{formatCurrency(day.sales, 'VES')}</span>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{day.transactions} ventas</p>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                              style={{ 
                                width: `${Math.max((day.sales / Math.max(...analytics.dailySalesData.map(d => d.sales))) * 100, 5)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-12 text-center shadow-xl border border-white/20 dark:border-gray-700/50">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-6"></div>
                <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">Cargando análisis detallado...</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Sale Floating Button */}
        {activeTab === 'sale' && cart.length > 0 && (
          <FloatingActionButton
            onClick={handleSale}
            icon={<ShoppingCart className="w-6 h-6" />}
            tooltip="Venta rápida"
            variant="success"
            position="bottom-right"
          />
        )}
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