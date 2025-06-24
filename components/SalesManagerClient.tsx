"use client";

import React, { useState } from 'react';
import { 
  ShoppingCart, Plus, Minus, DollarSign, Search, 
  TrendingUp, Package, History, BarChart3, Calendar,
  Banknote, CreditCard, Smartphone, Coffee, Gift,
  Target, Zap, Star, Filter, ShoppingBag, Box
} from 'lucide-react';
import { Product, Sale, SaleItem, SalesHistory, SalesAnalytics, Combo } from '../lib/types';
import { createSale, getSalesAnalytics, getCombos } from '../lib/api';
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
  const [salesHistory] = useState<SalesHistory[]>(initialSalesHistory);
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

  // Load combos and analytics
  React.useEffect(() => {
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

  React.useEffect(() => {
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
  }, [activeTab]);

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
        date: new Date().toISOString().split('T')[0],
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

      await createSale(saleData, saleItems);
      
      // Reset form
      setCart([]);
      setPaymentMethod({ cash_bs: '', card_bs: '', mobile_bs: '', usd: '' });
      setExpenses('');
      setNotes('');
      
      // Show success message
      alert('¡Venta registrada exitosamente! 🎉');
      window.location.reload(); // Refresh to update history
    } catch (error) {
      console.error('Error creating sale:', error);
      alert('Error al registrar la venta');
    } finally {
      setLoading(false);
    }
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
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-20 text-4xl opacity-5 dark:opacity-10 animate-pulse" style={{ animationDelay: '0s' }}>💰</div>
        <div className="absolute top-40 right-32 text-5xl opacity-5 dark:opacity-10 animate-pulse" style={{ animationDelay: '2s' }}>🛒</div>
        <div className="absolute bottom-32 left-1/3 text-3xl opacity-5 dark:opacity-10 animate-pulse" style={{ animationDelay: '1s' }}>📊</div>
        <div className="absolute top-1/3 right-20 text-4xl opacity-5 dark:opacity-10 animate-pulse" style={{ animationDelay: '3s' }}>💳</div>
      </div>

      <div className="relative z-10 space-y-6 p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white rounded-2xl p-6 md:p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <ShoppingCart className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold">Centro de Ventas</h1>
                <p className="text-green-100 text-sm md:text-base">Registra ventas y analiza tu negocio</p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-3 md:p-4 rounded-lg border border-white/20">
              <div className="text-center">
                <div className="flex items-center space-x-2 mb-1">
                  <DollarSign className="w-4 h-4 text-green-200" />
                  <span className="text-xs md:text-sm text-green-200">Tasa BCV</span>
                </div>
                <p className="text-xl md:text-2xl font-bold">{exchangeRate.toFixed(2)}</p>
                <p className="text-xs text-green-200">Bs./USD</p>
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-green-200" />
                <span className="text-xs text-green-200">Productos</span>
              </div>
              <p className="text-lg font-bold">{products.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4 text-blue-200" />
                <span className="text-xs text-blue-200">Combos</span>
              </div>
              <p className="text-lg font-bold">{combos.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-4 h-4 text-emerald-200" />
                <span className="text-xs text-emerald-200">En Carrito</span>
              </div>
              <p className="text-lg font-bold">{cart.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-teal-200" />
                <span className="text-xs text-teal-200">Total</span>
              </div>
              <p className="text-sm font-bold">{formatCurrency(totals.subtotal, 'VES')}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-14 bg-white dark:bg-gray-900 border-2 border-green-200 dark:border-green-800">
            <TabsTrigger value="sale" className="flex items-center space-x-2 text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Venta</span>
              <span className="sm:hidden">Venta</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2 text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Historial</span>
              <span className="sm:hidden">Historia</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2 text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Análisis</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sale" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Products/Combos Section */}
              <div className="xl:col-span-2 space-y-4">
                {/* Search and Type Toggle */}
                <AnimatedCard className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-green-200/50 dark:border-green-800/50">
                  <div className="space-y-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          placeholder={itemType === 'products' ? "Buscar productos..." : "Buscar combos..."}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-12 h-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur border-2 border-green-200 dark:border-green-700 focus:border-green-400 dark:focus:border-green-500"
                        />
                      </div>
                      
                      <Select value={itemType} onValueChange={(value: any) => setItemType(value)}>
                        <SelectTrigger className="w-full lg:w-48 h-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur border-2 border-green-200 dark:border-green-700">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredProducts.map((product) => {
                      const isLowStock = product.stock_quantity <= 5;
                      const profitMargin = ((product.sale_price - product.cost_price) / product.cost_price * 100);
                      
                      return (
                        <AnimatedCard 
                          key={product.id}
                          className="group cursor-pointer bg-gradient-to-br from-white via-white to-green-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-green-900/20 border-2 border-green-200/60 dark:border-green-700/60 hover:border-green-400 dark:hover:border-green-500"
                          hoverEffect
                          onClick={() => addProductToCart(product)}
                        >
                          {/* Status Badges */}
                          <div className="flex justify-between items-start mb-3">
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
                            <div className="text-2xl">{getCategoryEmoji(product.categories?.name)}</div>
                          </div>

                          {/* Product Info */}
                          <div className="space-y-3">
                            <div>
                              <h3 className="font-bold text-base leading-tight mb-1">{product.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                {product.categories?.name || 'Sin categoría'}
                              </Badge>
                            </div>

                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-bold text-lg text-green-600 dark:text-green-400">
                                  {formatCurrency(product.sale_price, 'VES')}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatCurrency(convertBsToUsd(product.sale_price, exchangeRate), 'USD')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Stock:</p>
                                <p className={`font-bold ${isLowStock ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
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
                              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                              size="sm"
                            >
                              <Plus className="w-4 h-4 mr-2" />
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCombos.map((combo) => {
                      const comboPrice = calculateComboPrice(combo);
                      const comboCost = calculateComboCost(combo);
                      const profitMargin = ((comboPrice - comboCost) / comboCost * 100);
                      
                      return (
                        <AnimatedCard 
                          key={combo.id}
                          className="group cursor-pointer bg-gradient-to-br from-white via-white to-blue-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20 border-2 border-blue-200/60 dark:border-blue-700/60 hover:border-blue-400 dark:hover:border-blue-500"
                          hoverEffect
                          onClick={() => addComboToCart(combo)}
                        >
                          {/* Combo Header */}
                          <div className="flex justify-between items-start mb-3">
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
                            <div className="text-2xl">🎁</div>
                          </div>

                          {/* Combo Info */}
                          <div className="space-y-3">
                            <div>
                              <h3 className="font-bold text-base leading-tight mb-1">{combo.name}</h3>
                              {combo.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {combo.description}
                                </p>
                              )}
                            </div>

                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-bold text-lg text-blue-600 dark:text-blue-400">
                                  {formatCurrency(comboPrice, 'VES')}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatCurrency(convertBsToUsd(comboPrice, exchangeRate), 'USD')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Margen:</p>
                                <p className={`font-bold text-sm ${profitMargin > 30 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                  {profitMargin.toFixed(1)}%
                                </p>
                              </div>
                            </div>

                            {/* Combo Items Preview */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Incluye:</p>
                              <div className="space-y-1 max-h-16 overflow-y-auto">
                                {combo.combo_items?.slice(0, 3).map((item, index) => {
                                  const product = products.find(p => p.id === item.product_id);
                                  return (
                                    <div key={index} className="flex justify-between text-xs">
                                      <span className="truncate">{product?.name || 'Producto'}</span>
                                      <span className="ml-2">x{item.quantity}</span>
                                    </div>
                                  );
                                })}
                                {combo.combo_items && combo.combo_items.length > 3 && (
                                  <p className="text-xs text-muted-foreground">
                                    +{combo.combo_items.length - 3} más...
                                  </p>
                                )}
                              </div>
                            </div>

                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                addComboToCart(combo);
                              }}
                              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                              size="sm"
                            >
                              <Plus className="w-4 h-4 mr-2" />
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
                  <AnimatedCard className="text-center py-8">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-bold text-muted-foreground mb-2">
                      {searchTerm ? 'No se encontraron productos' : 'No hay productos disponibles'}
                    </h3>
                    <p className="text-muted-foreground">
                      {searchTerm 
                        ? 'Prueba con otro término de búsqueda' 
                        : 'Agrega productos a tu inventario'
                      }
                    </p>
                  </AnimatedCard>
                )}

                {itemType === 'combos' && filteredCombos.length === 0 && (
                  <AnimatedCard className="text-center py-8">
                    <div className="text-6xl mb-4">🎁</div>
                    <h3 className="text-lg font-bold text-muted-foreground mb-2">
                      {searchTerm ? 'No se encontraron combos' : 'No hay combos disponibles'}
                    </h3>
                    <p className="text-muted-foreground">
                      {searchTerm 
                        ? 'Prueba con otro término de búsqueda' 
                        : 'Crea combos para ofrecer descuentos especiales'
                      }
                    </p>
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
                    <div className="text-center py-6">
                      <div className="text-4xl mb-2">🛒</div>
                      <p className="text-muted-foreground">Carrito vacío</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {cart.map((item, index) => (
                        <div key={`${item.type}-${item.id}-${index}`} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-bold text-sm truncate">{item.name}</p>
                              <Badge variant="outline" className="text-xs">
                                {item.type === 'combo' ? '🎁 Combo' : '📦 Producto'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(item.price, 'VES')} c/u
                            </p>
                            <p className="text-sm font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(item.price * item.quantity, 'VES')}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
                              className="h-8 w-8"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-bold">
                              {item.quantity}
                            </span>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                              className="h-8 w-8"
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
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-3">
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
                            className="h-9"
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
                            className="h-9"
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
                            className="h-9"
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
                            className="h-9"
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
                            className="h-9"
                            placeholder="0.00"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-xs">Notas (opcional)</Label>
                          <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Notas de la venta..."
                            className="h-16 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                )}

                {/* Summary */}
                {cart.length > 0 && (
                  <AnimatedCard title="📊 Resumen" hoverEffect className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                    <div className="space-y-3">
                      <div className="space-y-2 text-sm">
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
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-bold">Ganancia neta:</span>
                          <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(totals.netProfit, 'VES')}</span>
                        </div>
                      </div>
                      
                      <Button
                        onClick={handleSale}
                        disabled={loading || totals.totalPayments < totals.subtotal}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        {loading ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Procesando...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Gift className="w-4 h-4" />
                            <span>Completar Venta</span>
                          </div>
                        )}
                      </Button>
                      
                      {totals.totalPayments < totals.subtotal && (
                        <div className="text-center p-2 bg-red-50 dark:bg-red-950/20 rounded text-red-600 text-xs">
                          Falta: {formatCurrency(totals.subtotal - totals.totalPayments, 'VES')}
                        </div>
                      )}
                    </div>
                  </AnimatedCard>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {/* History Filters */}
            <AnimatedCard className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row gap-4">
                <Select value={historyFilter} onValueChange={setHistoryFilter}>
                  <SelectTrigger className="w-full md:w-auto">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las ventas</SelectItem>
                    <SelectItem value="today">Hoy</SelectItem>
                    <SelectItem value="week">Esta semana</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {filteredHistory.length} de {salesHistory.length} ventas
                  </p>
                </div>
              </div>
            </AnimatedCard>

            {/* Sales History */}
            <div className="space-y-4">
              {filteredHistory.map((sale) => (
                <AnimatedCard key={sale.id} hoverEffect className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                  <div className="space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-bold">Venta #{sale.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(sale.date)} • {new Date(sale.created_at).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-lg text-green-600 dark:text-green-400">
                          {formatCurrency(sale.total_amount_bs, 'VES')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Ganancia: {formatCurrency(sale.profit_bs, 'VES')}
                        </p>
                      </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
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
                      <div className="border-t pt-3">
                        <p className="text-sm font-medium mb-2">Productos vendidos:</p>
                        <div className="space-y-1">
                          {sale.sale_items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.product_name}</span>
                              <span>{formatCurrency(item.total_price, 'VES')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AnimatedCard>
              ))}
            </div>

            {filteredHistory.length === 0 && (
              <AnimatedCard className="text-center py-12 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-bold text-muted-foreground mb-2">No hay ventas registradas</h3>
                <p className="text-muted-foreground mb-4">
                  {historyFilter === 'all' 
                    ? 'Aún no has realizado ninguna venta'
                    : 'No hay ventas en el período seleccionado'
                  }
                </p>
                <Button onClick={() => setActiveTab('sale')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Realizar Primera Venta
                </Button>
              </AnimatedCard>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {analytics ? (
              <>
                {/* Analytics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <AnimatedCard title="💰 Ventas Totales" hoverEffect className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(analytics.totalSales, 'VES')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Últimos 30 días
                      </p>
                    </div>
                  </AnimatedCard>

                  <AnimatedCard title="📈 Ganancia Total" hoverEffect className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(analytics.totalProfit, 'VES')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Margen: {analytics.profitMargin.toFixed(1)}%
                      </p>
                    </div>
                  </AnimatedCard>

                  <AnimatedCard title="🛒 Transacciones" hoverEffect className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {analytics.totalTransactions}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Ventas realizadas
                      </p>
                    </div>
                  </AnimatedCard>

                  <AnimatedCard title="💡 Venta Promedio" hoverEffect className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {formatCurrency(analytics.avgSaleValue, 'VES')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Por transacción
                      </p>
                    </div>
                  </AnimatedCard>
                </div>

                {/* Payment Methods Analysis */}
                <AnimatedCard title="💳 Métodos de Pago Más Utilizados" hoverEffect className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                  <div className="space-y-4">
                    {analytics.paymentMethodsData.map((method) => {
                      const percentage = (method.amount / analytics.totalSales) * 100;
                      return (
                        <div key={method.method} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="capitalize font-medium">{method.method}</span>
                            <span>{formatCurrency(method.amount, method.method === 'usd' ? 'USD' : 'VES')}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}% del total</p>
                        </div>
                      );
                    })}
                  </div>
                </AnimatedCard>

                {/* Daily Sales Chart */}
                <AnimatedCard title="📊 Ventas Diarias" hoverEffect className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                  <div className="space-y-4">
                    {analytics.dailySalesData.slice(-7).map((day) => (
                      <div key={day.date} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{formatDate(day.date)}</span>
                          <div className="text-right">
                            <span className="font-bold">{formatCurrency(day.sales, 'VES')}</span>
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

                {/* Insights */}
                <AnimatedCard title="💡 Insights Inteligentes" hoverEffect className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="w-5 h-5 text-blue-500" />
                        <span className="font-medium">Rendimiento</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Tu margen de ganancia promedio es del {analytics.profitMargin.toFixed(1)}%. 
                        {analytics.profitMargin > 30 
                          ? " ¡Excelente rentabilidad!" 
                          : " Considera revisar tus precios para mejorar la rentabilidad."
                        }
                      </p>
                    </div>
                    
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Zap className="w-5 h-5 text-green-500" />
                        <span className="font-medium">Oportunidad</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Tu venta promedio es de {formatCurrency(analytics.avgSaleValue, 'VES')}. 
                        Considera crear más combos para aumentar el ticket promedio.
                      </p>
                    </div>
                  </div>
                </AnimatedCard>
              </>
            ) : (
              <AnimatedCard className="text-center py-12 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando análisis...</p>
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
            position="bottom-left"
          />
        )}
      </div>
    </div>
  );
};