"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, DollarSign, Calculator, CreditCard, Smartphone, Banknote, Search } from 'lucide-react';
import { Product, Sale, SaleItem } from '../lib/types';
import { getProducts, createSale, fetchExchangeRate } from '../lib/api';
import { formatCurrency, convertBsToUsd } from '../lib/utils';
import { getDefaultUserId } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const SalesManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [exchangeRate, setExchangeRate] = useState(36.42);
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

  useEffect(() => {
    loadProducts();
    loadExchangeRate();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data.filter(p => p.product_type === 'final')); // Only show final products for sale
    } catch (error) {
      console.error('Error loading products:', error);
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

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.product.id !== productId));
    } else {
      setCart(cart.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.product.sale_price * item.quantity), 0);
    const profit = cart.reduce((sum, item) => sum + ((item.product.sale_price - item.product.cost_price) * item.quantity), 0);
    
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
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.sale_price,
        total_price: item.product.sale_price * item.quantity,
        cost_price: item.product.cost_price
      }));

      await createSale(saleData, saleItems);
      
      // Reset form
      setCart([]);
      setPaymentMethod({ cash_bs: '', card_bs: '', mobile_bs: '', usd: '' });
      setExpenses('');
      setNotes('');
      
      alert('¡Venta registrada exitosamente! 🎉');
    } catch (error) {
      console.error('Error creating sale:', error);
      alert('Error al registrar la venta');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totals = calculateTotals();

  const getCategoryColor = (categoryName?: string) => {
    if (!categoryName) return 'from-gray-400 to-gray-500';
    switch (categoryName.toLowerCase()) {
      case 'helados': return 'from-pink-400 to-purple-500';
      case 'bebidas': return 'from-blue-400 to-cyan-500';
      case 'snacks': return 'from-yellow-400 to-orange-500';
      default: return 'from-green-400 to-emerald-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center">
            <ShoppingCart className="w-8 h-8 mr-3 text-green-500" />
            Nueva Venta
          </h1>
          <p className="text-muted-foreground mt-1">
            Registra una nueva venta de productos
          </p>
        </div>
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Tasa BCV</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {exchangeRate.toFixed(2)} Bs./USD
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Products */}
        <div className="xl:col-span-2 space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar productos... 🔍"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-800/40 backdrop-blur-lg border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getCategoryColor(product.categories?.name)} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                      🍦
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(product.sale_price, 'VES')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(convertBsToUsd(product.sale_price, exchangeRate), 'USD')}
                      </p>
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription>
                      {product.category}
                    </CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Stock disponible:</span>
                    <span className={`font-medium ${product.stock_quantity > 10 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {product.stock_quantity} {product.unit}
                    </span>
                  </div>

                  <Button
                    onClick={() => addToCart(product)}
                    disabled={product.stock_quantity <= 0}
                    className="w-full"
                    variant="gradient"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar al Carrito
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-6xl mb-4">😸</div>
                <p className="text-muted-foreground text-lg">
                  No se encontraron productos
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Cart and Payment */}
        <div className="space-y-6">
          {/* Cart */}
          <Card className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-blue-500" />
                Carrito ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🛒</div>
                  <p className="text-muted-foreground">
                    Carrito vacío
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg backdrop-blur-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.product.sale_price, 'VES')} c/u
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total: {formatCurrency(item.product.sale_price * item.quantity, 'VES')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="h-8 w-8"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="h-8 w-8"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          {cart.length > 0 && (
            <Card className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-purple-500" />
                  Métodos de Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="cash_bs" className="flex items-center">
                      <Banknote className="w-4 h-4 mr-2 text-green-500" />
                      Efectivo (Bs.)
                    </Label>
                    <Input
                      id="cash_bs"
                      type="number"
                      step="0.01"
                      value={paymentMethod.cash_bs}
                      onChange={(e) => setPaymentMethod({ ...paymentMethod, cash_bs: e.target.value })}
                      className="mt-1"
                    />
                    {paymentMethod.cash_bs && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ≈ {formatCurrency(convertBsToUsd(parseFloat(paymentMethod.cash_bs), exchangeRate), 'USD')}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="card_bs" className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-2 text-blue-500" />
                      Tarjeta (Bs.)
                    </Label>
                    <Input
                      id="card_bs"
                      type="number"
                      step="0.01"
                      value={paymentMethod.card_bs}
                      onChange={(e) => setPaymentMethod({ ...paymentMethod, card_bs: e.target.value })}
                      className="mt-1"
                    />
                    {paymentMethod.card_bs && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ≈ {formatCurrency(convertBsToUsd(parseFloat(paymentMethod.card_bs), exchangeRate), 'USD')}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="mobile_bs" className="flex items-center">
                      <Smartphone className="w-4 h-4 mr-2 text-purple-500" />
                      Pago Móvil (Bs.)
                    </Label>
                    <Input
                      id="mobile_bs"
                      type="number"
                      step="0.01"
                      value={paymentMethod.mobile_bs}
                      onChange={(e) => setPaymentMethod({ ...paymentMethod, mobile_bs: e.target.value })}
                      className="mt-1"
                    />
                    {paymentMethod.mobile_bs && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ≈ {formatCurrency(convertBsToUsd(parseFloat(paymentMethod.mobile_bs), exchangeRate), 'USD')}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="usd" className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                      Dólares (USD)
                    </Label>
                    <Input
                      id="usd"
                      type="number"
                      step="0.01"
                      value={paymentMethod.usd}
                      onChange={(e) => setPaymentMethod({ ...paymentMethod, usd: e.target.value })}
                      className="mt-1"
                    />
                    {paymentMethod.usd && (
                      <p className="text-xs text-muted-foreground mt-1">
                        = {formatCurrency(parseFloat(paymentMethod.usd) * exchangeRate, 'VES')}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="expenses">Gastos (Bs.)</Label>
                    <Input
                      id="expenses"
                      type="number"
                      step="0.01"
                      value={expenses}
                      onChange={(e) => setExpenses(e.target.value)}
                      className="mt-1"
                    />
                    {expenses && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ≈ {formatCurrency(convertBsToUsd(parseFloat(expenses), exchangeRate), 'USD')}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notas (opcional)</Label>
                    <Input
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Agregar notas sobre la venta..."
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          {cart.length > 0 && (
            <Card className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-green-500" />
                  Resumen de Venta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <div className="text-right">
                      <span className="font-medium">
                        {formatCurrency(totals.subtotal, 'VES')}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        ≈ {formatCurrency(convertBsToUsd(totals.subtotal, exchangeRate), 'USD')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total pagado:</span>
                    <div className="text-right">
                      <span className="font-medium">
                        {formatCurrency(totals.totalPayments, 'VES')}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        ≈ {formatCurrency(convertBsToUsd(totals.totalPayments, exchangeRate), 'USD')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Gastos:</span>
                    <div className="text-right">
                      <span className="font-medium text-red-600 dark:text-red-400">
                        {formatCurrency(totals.expensesAmount, 'VES')}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        ≈ {formatCurrency(convertBsToUsd(totals.expensesAmount, exchangeRate), 'USD')}
                      </p>
                    </div>
                  </div>
                  
                  <hr className="border-muted" />
                  
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Ganancia neta:</span>
                    <div className="text-right">
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(totals.netProfit, 'VES')}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        ≈ {formatCurrency(convertBsToUsd(totals.netProfit, exchangeRate), 'USD')}
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={handleSale}
                  disabled={loading || totals.totalPayments < totals.subtotal}
                  className="w-full mt-4"
                  variant="gradient"
                  size="lg"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <span className="mr-2">💰</span>
                      Completar Venta
                    </>
                  )}
                </Button>
                
                {totals.totalPayments < totals.subtotal && (
                  <p className="text-xs text-red-500 dark:text-red-400 text-center">
                    Falta: {formatCurrency(totals.subtotal - totals.totalPayments, 'VES')}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};