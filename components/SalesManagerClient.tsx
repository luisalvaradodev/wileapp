"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Plus, Minus, DollarSign, Search, 
  TrendingUp, Package, History, BarChart3, Calendar,
  Banknote, CreditCard, Smartphone, Coffee, Gift,
  Target, Zap, Star, Filter, ShoppingBag, Box,
  Edit, Trash2, ChevronDown, ChevronUp, X
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
  // Using toast from sonner (already imported above)

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
        // Convert original sale items to the format expected by updateSale
        const originalItems = editingSale.sale_items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }));

        await updateSale(
          editingSale.id,
          saleData,
          saleItems,
          originalItems
        );

        toast({
          title: "Venta actualizada",
          description: "¡La venta se ha actualizado exitosamente!",
          className: "bg-green-500 text-white border-0"
        });
      } else {
        await createSale(saleData, saleItems);
        
        toast({
          title: "Venta registrada",
          description: "¡La venta se ha registrado exitosamente!",
          className: "bg-green-500 text-white border-0"
        });
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
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la venta",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSale = async () => {
    if (!deletingSale) return;
    
    if (verificationCode !== '1234') {
      toast({
        title: "Código incorrecto",
        description: "El código de verificación es incorrecto",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await deleteSale(deletingSale.id);
      
      toast({
        title: "Venta eliminada",
        description: "La venta ha sido eliminada exitosamente",
        className: "bg-green-500 text-white border-0"
      });
      
      // Refresh sales history
      const userId = getDefaultUserId();
      const updatedHistory = await getSalesHistory(userId, 50);
      setSalesHistory(updatedHistory);
      
      setDeletingSale(null);
      setVerificationCode('');
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la venta",
        variant: "destructive"
      });
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
    // Convert sale items to cart items
    const cartItems: CartItem[] = sale.sale_items.map(item => {
      const product = products.find(p => p.id === item.product_id);
      if (product) {
        return {
          type: 'product' as const,
          id: product.id,
          name: product.name,
          price: item.unit_price,
          cost: item.cost_price,
          quantity: item.quantity,
          data: product
        };
      } else {
        // If product not found, create a placeholder
        return {
          type: 'product' as const,
          id: item.product_id,
          name: item.product_name,
          price: item.unit_price,
          cost: item.cost_price,
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
    setNotes(sale.notes || '');
    setEditingSale(sale);
    setActiveTab('sale'); // Switch to sale tab
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-green-950/30 relative overflow-hidden">
      {/* Delete Sale Modal */}
      {deletingSale && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-xl mb-4">Confirmar Eliminación</h3>
            <p className="mb-4">
              ¿Estás seguro de que deseas eliminar la venta #{deletingSale.id.slice(0, 8)}?
              Esta acción no se puede deshacer.
            </p>
            <p className="mb-2">Ingresa el código de verificación (1234) para continuar:</p>
            <Input
              type="password"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="mb-4"
              placeholder="Código"
            />
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setDeletingSale(null);
                  setVerificationCode('');
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                disabled={verificationCode !== '1234'}
                onClick={handleDeleteSale}
              >
                Eliminar
              </Button>
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
      </div>

      <div className="relative z-10 space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white rounded-2xl p-4 md:p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Centro de Ventas</h1>
                <p className="text-green-100 text-xs md:text-sm">Registra ventas y analiza tu negocio</p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-2 md:p-3 rounded-lg border border-white/20">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <DollarSign className="w-3 h-3 text-green-200" />
                  <span className="text-xs text-green-200">Tasa BCV</span>
                </div>
                <p className="text-lg md:text-xl font-bold">{exchangeRate.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 mt-4 md:mt-6">
            <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg border border-white/20">
              <div className="flex items-center space-x-1">
                <Package className="w-3 h-3 text-green-200" />
                <span className="text-xs text-green-200">Productos</span>
              </div>
              <p className="text-base font-bold">{products.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg border border-white/20">
              <div className="flex items-center space-x-1">
                <ShoppingBag className="w-3 h-3 text-blue-200" />
                <span className="text-xs text-blue-200">Combos</span>
              </div>
              <p className="text-base font-bold">{combos.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg border border-white/20">
              <div className="flex items-center space-x-1">
                <ShoppingCart className="w-3 h-3 text-emerald-200" />
                <span className="text-xs text-emerald-200">En Carrito</span>
              </div>
              <p className="text-base font-bold">{cart.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg border border-white/20">
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3 text-teal-200" />
                <span className="text-xs text-teal-200">Total</span>
              </div>
              <p className="text-sm font-bold">{formatCurrency(totals.subtotal, 'VES')}</p>
            </div>
          </div>
        </div>

        {/* Edit Mode Banner */}
        {editingSale && (
          <div className="bg-blue-500 text-white p-3 rounded-xl flex justify-between items-center">
            <div className="flex items-center">
              <Edit className="w-4 h-4 mr-2" />
              <span>Estás editando la venta #{editingSale.id.slice(0, 8)}</span>
            </div>
            <Button variant="outline" size="sm" className="text-blue-500" onClick={cancelEdit}>
              <X className="w-4 h-4 mr-1" />
              Cancelar edición
            </Button>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-white dark:bg-gray-900 border-2 border-green-200 dark:border-green-800">
            <TabsTrigger value="sale" className="flex items-center space-x-1 md:space-x-2 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Venta</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-1 md:space-x-2 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Historial</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-1 md:space-x-2 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Análisis</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sale" className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {/* Products/Combos Section */}
              <div className="xl:col-span-2 space-y-4">
                {/* Search and Type Toggle */}
                <AnimatedCard className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-green-200/50 dark:border-green-800/50">
                  <div className="space-y-3">
                    <div className="flex flex-col gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder={itemType === 'products' ? "Buscar productos..." : "Buscar combos..."}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 h-10 bg-white/60 dark:bg-gray-800/60 backdrop-blur border-2 border-green-200 dark:border-green-700 focus:border-green-400 dark:focus:border-green-500"
                        />
                      </div>
                      
                      <Select value={itemType} onValueChange={(value: any) => setItemType(value)}>
                        <SelectTrigger className="w-full h-10 bg-white/60 dark:bg-gray-800/60 backdrop-blur border-2 border-green-200 dark:border-green-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="products">
                            <div className="flex items-center space-x-2">
                              <Package className="w-4 h-4" />
                              <span>Productos</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="combos">
                            <div className="flex items-center space-x-2">
                              <ShoppingBag className="w-4 h-4" />
                              <span>Combos</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </AnimatedCard>

                {/* Products Grid */}
                {itemType === 'products' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredProducts.map((product) => {
                      const isLowStock = product.stock_quantity <= 5;
                      const profitMargin = ((product.sale_price - product.cost_price) / product.cost_price * 100);
                      
                      return (
                        <AnimatedCard 
                          key={product.id}
                          className="group cursor-pointer bg-gradient-to-br from-white via-white to-green-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-green-900/20 border-2 border-green-200/60 dark:border-green-700/60 hover:border-green-400 dark:hover:border-green-500"
                          hoverEffect
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-wrap gap-1">
                              {isLowStock && (
                                <Badge variant="destructive" className="text-xs">
                                  Stock Bajo
                                </Badge>
                              )}
                              {profitMargin > 50 && (
                                <Badge className="text-xs bg-green-500">
                                  Alto Margen
                                </Badge>
                              )}
                            </div>
                            <div className="text-xl">{getCategoryEmoji(product.categories?.name)}</div>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <h3 className="font-bold text-sm leading-tight mb-1">{product.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                {product.categories?.name || 'Sin categoría'}
                              </Badge>
                            </div>

                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-bold text-base text-green-600 dark:text-green-400">
                                  {formatCurrency(product.sale_price, 'VES')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">Stock:</p>
                                <p className={`font-bold text-sm ${isLowStock ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
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
                              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-xs h-8"
                              size="sm"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Agregar
                            </Button>
                          </div>
                        </AnimatedCard>
                      );
                    })}
                  </div>
                )}

                {/* Combos Grid */}
                {itemType === 'combos' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredCombos.map((combo) => {
                      const comboPrice = calculateComboPrice(combo);
                      const comboCost = calculateComboCost(combo);
                      const profitMargin = ((comboPrice - comboCost) / comboCost * 100);
                      
                      return (
                        <AnimatedCard 
                          key={combo.id}
                          className="group cursor-pointer bg-gradient-to-br from-white via-white to-blue-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20 border-2 border-blue-200/60 dark:border-blue-700/60 hover:border-blue-400 dark:hover:border-blue-500"
                          hoverEffect
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-wrap gap-1">
                              <Badge className="text-xs bg-gradient-to-r from-blue-500 to-purple-500">
                                Combo {combo.discount_percentage}% OFF
                              </Badge>
                              {profitMargin > 30 && (
                                <Badge className="text-xs bg-green-500">
                                  <Star className="w-3 h-3 mr-1" />
                                  Alto Margen
                                </Badge>
                              )}
                            </div>
                            <div className="text-xl">🎁</div>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <h3 className="font-bold text-sm leading-tight mb-1">{combo.name}</h3>
                            </div>

                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-bold text-base text-blue-600 dark:text-blue-400">
                                  {formatCurrency(comboPrice, 'VES')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">Margen:</p>
                                <p className={`font-bold text-xs ${profitMargin > 30 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                  {profitMargin.toFixed(1)}%
                                </p>
                              </div>
                            </div>

                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                addComboToCart(combo);
                              }}
                              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xs h-8"
                              size="sm"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Agregar Combo
                            </Button>
                          </div>
                        </AnimatedCard>
                      );
                    })}
                  </div>
                )}

                {/* Empty States */}
                {itemType === 'products' && filteredProducts.length === 0 && (
                  <AnimatedCard className="text-center py-6">
                    <div className="text-5xl mb-3">🔍</div>
                    <h3 className="text-base font-bold text-muted-foreground mb-1">
                      {searchTerm ? 'No se encontraron productos' : 'No hay productos disponibles'}
                    </h3>
                  </AnimatedCard>
                )}

                {itemType === 'combos' && filteredCombos.length === 0 && (
                  <AnimatedCard className="text-center py-6">
                    <div className="text-5xl mb-3">🎁</div>
                    <h3 className="text-base font-bold text-muted-foreground mb-1">
                      {searchTerm ? 'No se encontraron combos' : 'No hay combos disponibles'}
                    </h3>
                  </AnimatedCard>
                )}
              </div>

              {/* Cart and Payment Section */}
              <div className="space-y-4">
                {/* Cart */}
                <AnimatedCard 
                  title={`🛒 Carrito (${cart.length})`}
                  hoverEffect
                  className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm"
                >
                  {cart.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="text-3xl mb-1">🛒</div>
                      <p className="text-muted-foreground text-sm">Carrito vacío</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {cart.map((item, index) => (
                        <div key={`${item.type}-${item.id}-${index}`} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1 mb-1">
                              <p className="font-bold text-xs truncate">{item.name}</p>
                              <Badge variant="outline" className="text-[10px]">
                                {item.type === 'combo' ? '🎁 Combo' : '📦 Producto'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(item.price, 'VES')} c/u
                            </p>
                            <p className="text-xs font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(item.price * item.quantity, 'VES')}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
                              className="h-7 w-7"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-6 text-center text-xs font-bold">
                              {item.quantity}
                            </span>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                              className="h-7 w-7"
                              disabled={item.type === 'product' && item.quantity >= (item.data as Product).stock_quantity}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </AnimatedCard>

                {/* Payment Methods */}
                {cart.length > 0 && (
                  <AnimatedCard title="💳 Métodos de Pago" hoverEffect className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs flex items-center">
                            <Banknote className="w-3 h-3 mr-1 text-green-500" />
                            Efectivo (Bs.)
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={paymentMethod.cash_bs}
                            onChange={(e) => setPaymentMethod({ ...paymentMethod, cash_bs: e.target.value })}
                            className="h-9 text-sm"
                            placeholder="0.00"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-xs flex items-center">
                            <CreditCard className="w-3 h-3 mr-1 text-blue-500" />
                            Tarjeta (Bs.)
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={paymentMethod.card_bs}
                            onChange={(e) => setPaymentMethod({ ...paymentMethod, card_bs: e.target.value })}
                            className="h-9 text-sm"
                            placeholder="0.00"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-xs flex items-center">
                            <Smartphone className="w-3 h-3 mr-1 text-purple-500" />
                            Pago Móvil (Bs.)
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={paymentMethod.mobile_bs}
                            onChange={(e) => setPaymentMethod({ ...paymentMethod, mobile_bs: e.target.value })}
                            className="h-9 text-sm"
                            placeholder="0.00"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-xs flex items-center">
                            <DollarSign className="w-3 h-3 mr-1 text-green-600" />
                            Dólares (USD)
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={paymentMethod.usd}
                            onChange={(e) => setPaymentMethod({ ...paymentMethod, usd: e.target.value })}
                            className="h-9 text-sm"
                            placeholder="0.00"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-xs flex items-center">
                            <Coffee className="w-3 h-3 mr-1 text-orange-500" />
                            Gastos (Bs.)
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={expenses}
                            onChange={(e) => setExpenses(e.target.value)}
                            className="h-9 text-sm"
                            placeholder="0.00"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-xs">Notas (opcional)</Label>
                          <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Notas de la venta..."
                            className="h-14 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                )}

                {/* Summary */}
                {cart.length > 0 && (
                  <AnimatedCard title="📊 Resumen" hoverEffect className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                    <div className="space-y-2">
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span className="font-bold">{formatCurrency(totals.subtotal, 'VES')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total pagado:</span>
                          <span className="font-bold">{formatCurrency(totals.totalPayments, 'VES')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gastos:</span>
                          <span className="font-bold text-red-600 dark:text-red-400">{formatCurrency(totals.expensesAmount, 'VES')}</span>
                        </div>
                        <div className="flex justify-between border-t pt-1">
                          <span className="font-bold">Ganancia neta:</span>
                          <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(totals.netProfit, 'VES')}</span>
                        </div>
                      </div>
                      
                      <Button
                        onClick={handleSale}
                        disabled={loading || totals.totalPayments < totals.subtotal}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-sm"
                      >
                        {loading ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>{editingSale ? 'Actualizando...' : 'Procesando...'}</span>
                          </div>
                        ) : editingSale ? (
                          <div className="flex items-center space-x-2">
                            <Edit className="w-4 h-4" />
                            <span>Actualizar Venta</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Gift className="w-4 h-4" />
                            <span>Completar Venta</span>
                          </div>
                        )}
                      </Button>
                      
                      {totals.totalPayments < totals.subtotal && (
                        <div className="text-center p-1 bg-red-50 dark:bg-red-950/20 rounded text-red-600 text-xs">
                          Falta: {formatCurrency(totals.subtotal - totals.totalPayments, 'VES')}
                        </div>
                      )}
                    </div>
                  </AnimatedCard>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {/* History Filters */}
            <AnimatedCard className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row gap-2">
                <Select value={historyFilter} onValueChange={setHistoryFilter}>
                  <SelectTrigger className="w-full md:w-auto text-xs h-10">
                    <Filter className="w-3 h-3 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">Todas las ventas</SelectItem>
                    <SelectItem value="today" className="text-xs">Hoy</SelectItem>
                    <SelectItem value="week" className="text-xs">Esta semana</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">
                    Mostrando {filteredHistory.length} de {salesHistory.length} ventas
                  </p>
                </div>
              </div>
            </AnimatedCard>

            {/* Sales History */}
            <div className="space-y-3">
              {filteredHistory.map((sale) => (
                <AnimatedCard 
                  key={sale.id} 
                  hoverEffect 
                  className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm"
                >
                  <div 
                    className="flex items-center justify-between cursor-pointer py-2"
                    onClick={() => toggleSaleDetails(sale.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Venta #{sale.id.slice(0, 6)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(sale.date)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-sm text-green-600 dark:text-green-400">
                        {formatCurrency(sale.total_amount_bs, 'VES')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        +{formatCurrency(sale.profit_bs, 'VES')}
                      </p>
                    </div>
                  </div>

                  {expandedSaleId === sale.id && (
                    <div className="border-t pt-3 mt-2">
                      {/* Payment Methods */}
                      <div className="grid grid-cols-2 gap-1 text-xs mb-3">
                        {sale.payment_method_cash_bs > 0 && (
                          <div className="flex items-center space-x-1">
                            <Banknote className="w-3 h-3 text-green-500" />
                            <span>Efectivo: {formatCurrency(sale.payment_method_cash_bs, 'VES')}</span>
                          </div>
                        )}
                        {sale.payment_method_card_bs > 0 && (
                          <div className="flex items-center space-x-1">
                            <CreditCard className="w-3 h-3 text-blue-500" />
                            <span>Tarjeta: {formatCurrency(sale.payment_method_card_bs, 'VES')}</span>
                          </div>
                        )}
                        {sale.payment_method_mobile_bs > 0 && (
                          <div className="flex items-center space-x-1">
                            <Smartphone className="w-3 h-3 text-purple-500" />
                            <span>P.Móvil: {formatCurrency(sale.payment_method_mobile_bs, 'VES')}</span>
                          </div>
                        )}
                        {sale.payment_method_usd > 0 && (
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-3 h-3 text-green-600" />
                            <span>USD: {formatCurrency(sale.payment_method_usd, 'USD')}</span>
                          </div>
                        )}
                      </div>

                      {/* Products Sold */}
                      {sale.sale_items && sale.sale_items.length > 0 && (
                        <div className="border-t pt-2">
                          <p className="text-xs font-medium mb-1">Productos vendidos:</p>
                          <div className="space-y-1">
                            {sale.sale_items.map((item, index) => (
                              <div key={index} className="flex justify-between text-xs">
                                <span>{item.quantity}x {item.product_name}</span>
                                <span>{formatCurrency(item.total_price, 'VES')}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex justify-end mt-3 space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => handleEditSale(sale)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => setDeletingSale(sale)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  )}
                </AnimatedCard>
              ))}
            </div>

            {filteredHistory.length === 0 && (
              <AnimatedCard className="text-center py-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                <div className="text-5xl mb-3">📋</div>
                <h3 className="text-base font-bold text-muted-foreground mb-1">No hay ventas registradas</h3>
                <p className="text-muted-foreground text-xs mb-3">
                  {historyFilter === 'all' 
                    ? 'Aún no has realizado ninguna venta'
                    : 'No hay ventas en el período seleccionado'
                  }
                </p>
                <Button onClick={() => setActiveTab('sale')} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Realizar Primera Venta
                </Button>
              </AnimatedCard>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {analytics ? (
              <>
                {/* Analytics Overview */}
                <div className="grid grid-cols-2 gap-3">
                  <AnimatedCard title="💰 Ventas Totales" hoverEffect className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(analytics.totalSales, 'VES')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Últimos 30 días
                      </p>
                    </div>
                  </AnimatedCard>

                  <AnimatedCard title="📈 Ganancia Total" hoverEffect className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(analytics.totalProfit, 'VES')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Margen: {analytics.profitMargin.toFixed(1)}%
                      </p>
                    </div>
                  </AnimatedCard>

                  <AnimatedCard title="🛒 Transacciones" hoverEffect className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {analytics.totalTransactions}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ventas realizadas
                      </p>
                    </div>
                  </AnimatedCard>

                  <AnimatedCard title="💡 Venta Promedio" hoverEffect className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        {formatCurrency(analytics.avgSaleValue, 'VES')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Por transacción
                      </p>
                    </div>
                  </AnimatedCard>
                </div>

                {/* Daily Sales Chart */}
                <AnimatedCard title="📊 Ventas Diarias" hoverEffect className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                  <div className="space-y-3">
                    {analytics.dailySalesData.slice(-5).map((day) => (
                      <div key={day.date} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="font-medium text-xs">{formatDate(day.date)}</span>
                          <div className="text-right">
                            <span className="font-bold text-xs">{formatCurrency(day.sales, 'VES')}</span>
                            <p className="text-xs text-muted-foreground">{day.transactions} ventas</p>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.max((day.sales / Math.max(...analytics.dailySalesData.map(d => d.sales))) * 100, 5)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AnimatedCard>
              </>
            ) : (
              <AnimatedCard className="text-center py-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground text-sm">Cargando análisis...</p>
              </AnimatedCard>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Sale Floating Button */}
        {activeTab === 'sale' && cart.length > 0 && (
          <FloatingActionButton
            onClick={handleSale}
            icon={<ShoppingCart className="w-5 h-5" />}
            tooltip="Venta rápida"
            variant="success"
            position="bottom-right"
          />
        )}
      </div>
    </div>
  );
};