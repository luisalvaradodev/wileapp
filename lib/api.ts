import { supabase } from './supabase';
import { 
  Product, 
  Sale, 
  SaleItem, 
  Balance, 
  ExchangeRateInfo, 
  Category, 
  DashboardStats,
  Combo,
  SalesAnalytics,
  SalesHistory
} from './types';

const FALLBACK_RATE = 36.42;
const EXCHANGE_API_URL = "https://pydolarve.org/api/v1/dollar?page=alcambio&format_date=default&rounded_price=false";

// Exchange Rate Functions
export async function fetchExchangeRate(): Promise<ExchangeRateInfo> {
  try {
    const response = await fetch(EXCHANGE_API_URL);
    if (!response.ok) {
      throw new Error(`Error al obtener tasa: ${response.status}`);
    }
    
    const data = await response.json();
    if (data?.monitors?.bcv?.price) {
      return {
        rate: parseFloat(data.monitors.bcv.price),
        lastUpdate: data.monitors.bcv.last_update || new Date().toISOString(),
        isError: false
      };
    } else {
      throw new Error('Estructura de respuesta inesperada');
    }
  } catch (error) {
    return {
      rate: FALLBACK_RATE,
      lastUpdate: 'No disponible',
      isError: true,
      errorMessage: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

export async function updateCombo(
  id: string, 
  updates: Partial<Combo>, 
  items: Array<{product_id: string, quantity: number}>
): Promise<Combo> {
  // Actualizar datos del combo
  const { data: comboData, error: comboError } = await supabase
    .from('combos')
    .update({ 
      ...updates, 
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (comboError) throw comboError;

  // Eliminar items existentes
  const { error: deleteError } = await supabase
    .from('combo_items')
    .delete()
    .eq('combo_id', id);
  
  if (deleteError) throw deleteError;

  // Insertar nuevos items
  const comboItems = items.map(item => ({
    ...item,
    combo_id: id
  }));

  const { error: itemsError } = await supabase
    .from('combo_items')
    .insert(comboItems);
  
  if (itemsError) throw itemsError;

  // Obtener combo actualizado con items
  const { data: updatedCombo, error: fetchError } = await supabase
    .from('combos')
    .select(`
      *,
      combo_items (
        id,
        product_id,
        quantity,
        products (id, name, sale_price)
      )
    `)
    .eq('id', id)
    .single();
  
  if (fetchError) throw fetchError;

  return updatedCombo;
}

// Nueva función para eliminar combos (borrado lógico)
export async function deleteCombo(id: string): Promise<void> {
  const { error } = await supabase
    .from('combos')
    .update({ 
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);
  
  if (error) throw error;
}

// Category Functions
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
}

export async function createCategory(name: string): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert({ name })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Product Functions
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (id, name)
    `)
    .eq('is_active', true)
    .order('name');
  
  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
  
  return data || [];
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert({
      ...product,
      category_id: product.category_id || null
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update({ 
      ...updates, 
      updated_at: new Date().toISOString(),
      category_id: updates.category_id || null
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', id);
  
  if (error) throw error;
}

// Combo Functions
export async function getCombos(): Promise<Combo[]> {
  const { data, error } = await supabase
    .from('combos')
    .select(`
      *,
      combo_items (
        id,
        product_id,
        quantity,
        products (id, name, sale_price, cost_price)
      )
    `)
    .eq('is_active', true)
    .order('name');
  
  if (error) throw error;
  return data || [];
}

export async function createCombo(combo: Omit<Combo, 'id' | 'created_at' | 'updated_at'>, items: Array<{product_id: string, quantity: number}>): Promise<Combo> {
  const { data: comboData, error: comboError } = await supabase
    .from('combos')
    .insert(combo)
    .select()
    .single();
  
  if (comboError) throw comboError;

  const comboItems = items.map(item => ({
    ...item,
    combo_id: comboData.id
  }));

  const { error: itemsError } = await supabase
    .from('combo_items')
    .insert(comboItems);
  
  if (itemsError) throw itemsError;

  return comboData;
}

// Sale Functions
export async function getSales(userId: string, startDate?: string, endDate?: string): Promise<Sale[]> {
  let query = supabase
    .from('sales')
    .select(`
      *,
      sale_items (
        id,
        product_id,
        product_name,
        quantity,
        unit_price,
        total_price,
        cost_price
      )
    `)
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (startDate) query = query.gte('date', startDate);
  if (endDate) query = query.lte('date', endDate);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getSalesHistory(userId: string, limit: number = 50): Promise<SalesHistory[]> {
  const { data, error } = await supabase
    .from('sales')
    .select(`
      id,
      date,
      total_amount_bs,
      total_amount_usd,
      profit_bs,
      profit_usd,
      payment_method_cash_bs,
      payment_method_card_bs,
      payment_method_mobile_bs,
      payment_method_usd,
      expenses_bs,
      created_at,
      sale_items (
        product_name,
        quantity,
        unit_price,
        total_price
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getSalesAnalytics(userId: string, days: number = 30): Promise<SalesAnalytics> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data: salesData, error } = await supabase
    .from('sales')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0]);

  if (error) throw error;

  const sales = salesData || [];
  
  // Calcular métricas
  const totalSales = sales.reduce((sum, sale) => sum + sale.total_amount_bs, 0);
  const totalProfit = sales.reduce((sum, sale) => sum + sale.profit_bs, 0);
  const avgSaleValue = sales.length > 0 ? totalSales / sales.length : 0;
  
  // Ventas por día
  const dailySales = sales.reduce((acc: any, sale) => {
    const date = sale.date;
    if (!acc[date]) {
      acc[date] = { date, sales: 0, profit: 0, transactions: 0 };
    }
    acc[date].sales += sale.total_amount_bs;
    acc[date].profit += sale.profit_bs;
    acc[date].transactions += 1;
    return acc;
  }, {});

  // Métodos de pago más utilizados
  const paymentMethods = sales.reduce((acc: any, sale) => {
    if (sale.payment_method_cash_bs > 0) acc.cash = (acc.cash || 0) + sale.payment_method_cash_bs;
    if (sale.payment_method_card_bs > 0) acc.card = (acc.card || 0) + sale.payment_method_card_bs;
    if (sale.payment_method_mobile_bs > 0) acc.mobile = (acc.mobile || 0) + sale.payment_method_mobile_bs;
    if (sale.payment_method_usd > 0) acc.usd = (acc.usd || 0) + sale.payment_method_usd;
    return acc;
  }, {});

  return {
    totalSales,
    totalProfit,
    totalTransactions: sales.length,
    avgSaleValue,
    profitMargin: totalSales > 0 ? (totalProfit / totalSales) * 100 : 0,
    dailySalesData: Object.values(dailySales),
    paymentMethodsData: Object.entries(paymentMethods).map(([method, amount]) => ({
      method,
      amount: amount as number
    })),
    topSellingPeriods: [], // Se puede implementar análisis más detallado
    conversionRate: 100 // Se puede calcular si hay datos de visitas
  };
}

export async function createSale(sale: Omit<Sale, 'id' | 'created_at' | 'updated_at'>, items: Omit<SaleItem, 'id' | 'sale_id'>[]): Promise<Sale> {
  const { data: saleData, error: saleError } = await supabase
    .from('sales')
    .insert(sale)
    .select()
    .single();
  
  if (saleError) throw saleError;

  const saleItems = items.map(item => ({
    ...item,
    sale_id: saleData.id
  }));

  const { error: itemsError } = await supabase
    .from('sale_items')
    .insert(saleItems);
  
  if (itemsError) throw itemsError;

  // Update product stock
  for (const item of items) {
    await supabase.rpc('update_product_stock', {
      product_id: item.product_id,
      quantity_sold: item.quantity
    });
  }

  return saleData;
}

// Balance Functions
export async function getBalance(userId: string): Promise<Balance | null> {
  const { data, error } = await supabase
    .from('balances')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateBalance(userId: string, updates: Partial<Balance>): Promise<Balance> {
  const { data, error } = await supabase
    .from('balances')
    .upsert({
      user_id: userId,
      ...updates,
      last_updated: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Analytics Functions
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Today's sales and profit
  const { data: todayData } = await supabase
    .from('sales')
    .select('total_amount_bs, profit_bs')
    .eq('user_id', userId)
    .eq('date', today);

  // Week sales
  const { data: weekData } = await supabase
    .from('sales')
    .select('total_amount_bs')
    .eq('user_id', userId)
    .gte('date', weekAgo);

  // Month sales
  const { data: monthData } = await supabase
    .from('sales')
    .select('total_amount_bs')
    .eq('user_id', userId)
    .gte('date', monthAgo);

  // Top products (last month)
  const { data: topProductsData } = await supabase
    .from('sale_items')
    .select(`
      product_name,
      quantity,
      total_price,
      sales!inner(
        user_id,
        date
      )
    `)
    .eq('sales.user_id', userId)
    .gte('sales.date', monthAgo);

  const productStats = (topProductsData || []).reduce((acc: any, item: any) => {
    if (!acc[item.product_name]) {
      acc[item.product_name] = { name: item.product_name, quantity: 0, revenue: 0 };
    }
    acc[item.product_name].quantity += item.quantity;
    acc[item.product_name].revenue += item.total_price;
    return acc;
  }, {});

  const topProducts = Object.values(productStats)
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 5);

  const todayProfit = (todayData || []).reduce((sum: number, sale: any) => {
    return sum + (parseFloat(sale.profit_bs) || 0);
  }, 0);

  return {
    todaySales: (todayData || []).reduce((sum: number, sale: any) => sum + (parseFloat(sale.total_amount_bs) || 0), 0),
    todayProfit: todayProfit,
    weekSales: (weekData || []).reduce((sum: number, sale: any) => sum + (parseFloat(sale.total_amount_bs) || 0), 0),
    monthSales: (monthData || []).reduce((sum: number, sale: any) => sum + (parseFloat(sale.total_amount_bs) || 0), 0),
    topProducts: topProducts as Array<{ name: string; quantity: number; revenue: number }>
  };
}