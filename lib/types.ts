/**
 * ========================================================================
 * TIPOS DE DATOS DE LA BASE DE DATOS (Representan tus tablas)
 * ========================================================================
 */

export type ProductType = 'final' | 'ingredient';

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category_id?: string;
  cost_price: number;
  sale_price: number;
  stock_quantity: number;
  unit: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  product_type: ProductType;
  created_at: string;
  updated_at: string;
  // Para consultas con JOIN
  categories?: Category;
}

export interface Combo {
  id: string;
  name: string;
  description?: string;
  total_cost: number;
  sale_price: number;
  discount_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Para consultas con JOIN
  combo_items?: ComboItem[];
}

export interface ComboItem {
  id: string;
  combo_id: string;
  product_id: string;
  quantity: number;
  // Para consultas con JOIN
  products?: Product;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  cost_price: number;
}

export interface Sale {
  id: string;
  user_id: string;
  date: string;
  total_amount_bs: number;
  total_amount_usd: number;
  exchange_rate: number;
  payment_method_cash_bs: number;
  payment_method_card_bs: number;
  payment_method_mobile_bs: number;
  payment_method_usd: number;
  expenses_bs: number;
  profit_bs: number;
  profit_usd: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  sale_items?: SaleItem[];
}

export interface Balance {
  user_id: string;
  usd_balance: number;
  bs_balance: number;
  total_profit_bs: number;
  total_profit_usd: number;
  last_updated: string;
}

/**
 * ========================================================================
 * TIPOS PARA FORMULARIOS Y LÓGICA DEL CLIENTE
 * ========================================================================
 */

export interface ProductFormData {
  name: string;
  category_id: string;
  cost_price: string;
  sale_price: string;
  stock_quantity: string;
  unit: string;
  description: string;
  is_active: boolean;
  product_type: ProductType;
}

export interface ComboFormData {
  name: string;
  description: string;
  discount_percentage: string;
  is_active: boolean;
}

/**
 * ========================================================================
 * TIPOS AUXILIARES
 * ========================================================================
 */

export interface ExchangeRateInfo {
  rate: number;
  lastUpdate: string;
  isError: boolean;
  errorMessage?: string;
}

export interface DashboardStats {
  todaySales: number;
  todayProfit: number;
  weekSales: number;
  monthSales: number;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

export interface SalesHistory {
  id: string;
  date: string;
  total_amount_bs: number;
  total_amount_usd: number;
  profit_bs: number;
  profit_usd: number;
  payment_method_cash_bs: number;
  payment_method_card_bs: number;
  payment_method_mobile_bs: number;
  payment_method_usd: number;
  expenses_bs: number;
  created_at: string;
  sale_items?: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export interface SalesAnalytics {
  totalSales: number;
  totalProfit: number;
  totalTransactions: number;
  avgSaleValue: number;
  profitMargin: number;
  dailySalesData: Array<{
    date: string;
    sales: number;
    profit: number;
    transactions: number;
  }>;
  paymentMethodsData: Array<{
    method: string;
    amount: number;
  }>;
  topSellingPeriods: Array<{
    period: string;
    sales: number;
  }>;
  conversionRate: number;
}

export interface SearchableSelectOption {
  value: string;
  label: string;
  description?: string;
  category?: string;
  extra?: any;
}

export interface FilterOptions {
  searchTerm: string;
  category: string;
  sortBy: 'name' | 'price' | 'stock' | 'profit';
  sortOrder: 'asc' | 'desc';
}