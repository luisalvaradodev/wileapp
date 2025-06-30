"use client";

import React, { useState, useEffect } from 'react';
import {
  Plus, Edit2, Package, Search, Filter, ChefHat, X, Sparkles,
  DollarSign, TrendingUp, Archive, Zap, ShoppingBag, Trash2, Box,
  Grid3X3, List, LayoutGrid, Eye, EyeOff, Star, AlertTriangle,
  PawPrint, Heart, Crown, Gem, Fish, Coffee
} from 'lucide-react';
import {
  Product, Category, Combo, ComboItem, ProductFormData,
  SearchableSelectOption, ComboFormData
} from '@/../lib/types';
import {
  createProduct, updateProduct, createCategory,
  deleteProduct, getCombos, createCombo,
  updateCombo, deleteCombo
} from '@/../lib/api';
import { formatCurrency, convertBsToUsd, getCategoryColor, getCategoryEmoji, createSearchableOptions } from '../lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { AnimatedCard } from '@/components/ui/animated-card';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { ViewToggle, ViewMode } from '@/components/ui/view-toggle';

interface ProductManagerClientProps {
  initialProducts: Product[];
  initialCategories: Category[];
  initialExchangeRate: number;
}

export const ProductManagerClient: React.FC<ProductManagerClientProps> = ({
  initialProducts,
  initialCategories,
  initialExchangeRate
}) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showComboForm, setShowComboForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'profit'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [exchangeRate, setExchangeRate] = useState(initialExchangeRate);
  const [activeTab, setActiveTab] = useState('products');
  const [comboItems, setComboItems] = useState<{product_id: string, quantity: number}[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [showInactive, setShowInactive] = useState(false);

  const [productFormData, setProductFormData] = useState<ProductFormData>({
    name: '',
    category_id: '',
    cost_price: '',
    sale_price: '',
    stock_quantity: '',
    unit: 'unidad',
    description: '',
    is_active: true,
    product_type: 'final'
  });

  const [comboFormData, setComboFormData] = useState<ComboFormData>({
    name: '',
    description: '',
    discount_percentage: '0',
    is_active: true
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: ''
  });

  useEffect(() => {
    const loadCombos = async () => {
      try {
        const combosData = await getCombos();
        setCombos(combosData);
      } catch (error) {
        console.error('Error loading combos:', error);
      }
    };

    loadCombos();
  }, []);

  const calculateProfitMargin = (salePrice: number, costPrice: number) => {
    if (costPrice === 0) return 0;
    return ((salePrice - costPrice) / costPrice * 100);
  };

  const handleProductSubmit = async () => {
    try {
      setLoading(true);
      const productData = {
        name: productFormData.name,
        category_id: productFormData.category_id || undefined,
        cost_price: parseFloat(productFormData.cost_price) || 0,
        sale_price: parseFloat(productFormData.sale_price),
        stock_quantity: parseInt(productFormData.stock_quantity),
        unit: productFormData.unit,
        description: productFormData.description,
        is_active: productFormData.is_active,
        product_type: productFormData.product_type
      };

      if (editingProduct) {
        const updatedProduct = await updateProduct(editingProduct.id, productData);
        setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
      } else {
        const newProduct = await createProduct(productData);
        setProducts([...products, newProduct]);
      }

      resetProductForm();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error al guardar el producto. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleComboSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const comboData = {
        name: comboFormData.name,
        description: comboFormData.description,
        discount_percentage: parseFloat(comboFormData.discount_percentage),
        is_active: comboFormData.is_active,
        sale_price: (() => {
          const basePrice = comboItems.reduce((total, item) => {
            const product = products.find(p => p.id === item.product_id);
            return total + (product ? product.sale_price * item.quantity : 0);
          }, 0);
          return basePrice * (1 - parseFloat(comboFormData.discount_percentage) / 100);
        })(),
        total_cost: (() => {
          return comboItems.reduce((total, item) => {
            const product = products.find(p => p.id === item.product_id);
            return total + (product ? product.cost_price * item.quantity : 0);
          }, 0);
        })()
      };

      if (editingCombo) {
        const updatedCombo = await updateCombo(editingCombo.id, comboData, comboItems);
        setCombos(combos.map(c => c.id === editingCombo.id ? updatedCombo : c));
      } else {
        const newCombo = await createCombo(comboData, comboItems);
        setCombos([...combos, newCombo]);
      }

      resetComboForm();
    } catch (error) {
      console.error('Error saving combo:', error);
      alert('Error al guardar el combo. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const newCategory = await createCategory(categoryFormData.name);
      setCategories([...categories, newCategory]);
      resetCategoryForm();
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        setLoading(true);
        await deleteProduct(id);
        setProducts(products.filter(product => product.id !== id));
      } catch (error) {
        console.error('Error deleting product:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteCombo = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este combo?')) {
      try {
        setLoading(true);
        await deleteCombo(id);
        setCombos(combos.filter(combo => combo.id !== id));
      } catch (error) {
        console.error('Error deleting combo:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const resetProductForm = () => {
    setProductFormData({
      name: '',
      category_id: '',
      cost_price: '',
      sale_price: '',
      stock_quantity: '',
      unit: 'unidad',
      description: '',
      is_active: true,
      product_type: 'final'
    });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const resetComboForm = () => {
    setComboFormData({
      name: '',
      description: '',
      discount_percentage: '0',
      is_active: true
    });
    setComboItems([]);
    setEditingCombo(null);
    setShowComboForm(false);
  };

  const resetCategoryForm = () => {
    setCategoryFormData({ name: '' });
    setShowCategoryForm(false);
  };

  const handleEditProduct = (product: Product) => {
    setProductFormData({
      name: product.name,
      category_id: product.category_id || '',
      cost_price: product.cost_price.toString(),
      sale_price: product.sale_price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      unit: product.unit,
      description: product.description || '',
      is_active: product.is_active,
      product_type: product.product_type
    });
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleEditCombo = (combo: Combo) => {
    setComboFormData({
      name: combo.name,
      description: combo.description || '',
      discount_percentage: combo.discount_percentage.toString(),
      is_active: combo.is_active
    });

    const items = combo.combo_items?.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity
    })) || [];

    setComboItems(items);
    setEditingCombo(combo);
    setShowComboForm(true);
  };

  const addComboItem = () => {
    setComboItems([...comboItems, { product_id: '', quantity: 1 }]);
  };

  const updateComboItem = (index: number, field: keyof ComboItem, value: string | number) => {
    const updated = [...comboItems];
    updated[index] = { ...updated[index], [field]: value };
    setComboItems(updated);
  };

  const removeComboItem = (index: number) => {
    setComboItems(comboItems.filter((_, i) => i !== index));
  };

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

  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter;
      const matchesActiveFilter = showInactive || product.is_active;
      return matchesSearch && matchesCategory && matchesActiveFilter;
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'price':
          aValue = a.sale_price;
          bValue = b.sale_price;
          break;
        case 'stock':
          aValue = a.stock_quantity;
          bValue = b.stock_quantity;
          break;
        case 'profit':
          aValue = calculateProfitMargin(a.sale_price, a.cost_price);
          bValue = calculateProfitMargin(b.sale_price, b.cost_price);
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const filteredCombos = combos.filter(combo =>
    combo.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (categoryFilter === 'all' || true)
  );

  const categoryOptions = createSearchableOptions(
    categories,
    'id',
    'name',
    undefined,
    undefined
  );

  const productOptions = createSearchableOptions(
    products,
    'id',
    'name',
    'description',
    'unit'
  );

  const renderProductCard = (product: Product) => {
    const profitMargin = calculateProfitMargin(product.sale_price, product.cost_price);
    const isLowStock = product.stock_quantity <= 5;

    return (
      <div
        key={product.id}
        className="group relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-purple-50/80 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-purple-950/80 backdrop-blur-xl border-2 lg:border-3 border-purple-200/60 dark:border-purple-700/60 hover:border-purple-400 dark:hover:border-purple-500 shadow-lg lg:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-[1.02]"
      >
        {/* Magical glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl lg:rounded-3xl"></div>
        
        {/* Status badges */}
        <div className="absolute top-2 lg:top-4 right-2 lg:right-4 z-20 flex flex-col space-y-1 lg:space-y-2">
          {!product.is_active && (
            <Badge className="text-xs animate-pulse bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg border-0">
              <span className="hidden lg:inline">😴 Inactivo</span>
              <span className="lg:hidden">😴</span>
            </Badge>
          )}
          {isLowStock && product.is_active && (
            <Badge className="text-xs bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg border-0">
              <span className="hidden lg:inline">⚠️ Stock Bajo</span>
              <span className="lg:hidden">⚠️</span>
            </Badge>
          )}
          {profitMargin > 50 && (
            <Badge className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg border-0">
              <span className="hidden lg:inline">💎 Alto Margen</span>
              <span className="lg:hidden">💎</span>
            </Badge>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="absolute top-2 lg:top-4 left-2 lg:left-4 z-20 flex space-x-1 lg:space-x-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditProduct(product)}
            className="h-8 w-8 lg:h-10 lg:w-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow hover:bg-blue-50 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-700 hover:scale-110 transition-all duration-300"
          >
            <Edit2 className="w-3 h-3 lg:w-4 lg:h-4 text-blue-600 dark:text-blue-400" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteProduct(product.id)}
            className="h-8 w-8 lg:h-10 lg:w-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow hover:bg-red-50 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-700 hover:scale-110 transition-all duration-300"
          >
            <Trash2 className="w-3 h-3 lg:w-4 lg:h-4 text-red-500 dark:text-red-400" />
          </Button>
        </div>

        <div className="relative z-10 p-4 lg:p-6">
          {/* Category icon and ID */}
          <div className="flex items-start justify-between mb-4 lg:mb-6">
            <div className={`w-12 h-12 lg:w-20 lg:h-20 bg-gradient-to-br ${getCategoryColor(product.categories?.name)} rounded-xl lg:rounded-3xl flex items-center justify-center text-2xl lg:text-4xl shadow-lg lg:shadow-2xl border-2 lg:border-3 border-white/30 dark:border-white/20 group-hover:scale-110 group-hover:rotate-6 lg:group-hover:rotate-12 transition-all duration-500`}>
              {getCategoryEmoji(product.categories?.name)}
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 lg:mb-2 font-semibold">ID Producto</div>
              <div className="text-xs font-mono bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 px-2 py-1 lg:px-3 lg:py-2 rounded-lg lg:rounded-xl border border-purple-200 dark:border-purple-700">
                {product.id.slice(0, 6)}
              </div>
            </div>
          </div>

          {/* Product info */}
          <div className="space-y-3 lg:space-y-4">
            <div>
              <h3 className="font-bold lg:font-black text-base lg:text-xl leading-tight mb-2 lg:mb-3 text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                {product.name}
              </h3>
              
              <div className="flex flex-wrap gap-1 lg:gap-2 mb-3 lg:mb-4">
                <Badge className="text-xs bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-600">
                  {product.categories?.name || 'Sin categoría'}
                </Badge>
                <Badge className="text-xs bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600">
                  {product.product_type === 'final' ? '✨ Final' : '🧪 Ingrediente'}
                </Badge>
              </div>
            </div>

            {product.description && (
              <div className="bg-gradient-to-r from-gray-50/80 to-white/80 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-sm p-2 lg:p-4 rounded-xl lg:rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Pricing section */}
            <div className="bg-gradient-to-br from-white/80 via-purple-50/50 to-pink-50/50 dark:from-gray-800/80 dark:via-purple-950/30 dark:to-pink-950/30 backdrop-blur-sm p-3 lg:p-5 rounded-xl lg:rounded-2xl border border-purple-200/50 dark:border-purple-700/50 space-y-2 lg:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs lg:text-sm font-semibold lg:font-bold text-gray-700 dark:text-gray-300 flex items-center">
                  💰 Precio:
                </span>
                <div className="text-right">
                  <span className="font-bold lg:font-black text-sm lg:text-xl text-green-600 dark:text-green-400">
                    {formatCurrency(product.sale_price, 'VES')}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium hidden lg:block">
                    ≈ {formatCurrency(convertBsToUsd(product.sale_price, exchangeRate), 'USD')}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs lg:text-sm font-semibold lg:font-bold text-gray-700 dark:text-gray-300 flex items-center">
                  🏷️ Costo:
                </span>
                <div className="text-right">
                  <span className="font-bold text-sm lg:text-lg text-gray-800 dark:text-gray-200">
                    {formatCurrency(product.cost_price, 'VES')}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium hidden lg:block">
                    ≈ {formatCurrency(convertBsToUsd(product.cost_price, exchangeRate), 'USD')}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs lg:text-sm font-semibold lg:font-bold text-gray-700 dark:text-gray-300 flex items-center">
                  📦 Stock:
                </span>
                <span className={`font-bold lg:font-black text-sm lg:text-lg ${isLowStock ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  {product.stock_quantity} {product.unit}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 lg:pt-3 border-t border-purple-200/50 dark:border-purple-700/50">
                <span className="text-xs lg:text-sm font-semibold lg:font-bold text-gray-700 dark:text-gray-300 flex items-center">
                  📈 Margen:
                </span>
                <div className="flex items-center space-x-2">
                  <span className={`font-bold lg:font-black text-sm lg:text-xl ${profitMargin > 30 ? 'text-green-600 dark:text-green-400' : profitMargin > 15 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                    {profitMargin.toFixed(1)}%
                  </span>
                  <div className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full ${profitMargin > 30 ? 'bg-green-500' : profitMargin > 15 ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse shadow-lg`}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProductList = (product: Product) => {
    const profitMargin = calculateProfitMargin(product.sale_price, product.cost_price);
    const isLowStock = product.stock_quantity <= 5;

    return (
      <div
        key={product.id}
        className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-white/95 via-white/90 to-purple-50/80 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-purple-950/80 backdrop-blur-xl border border-purple-200/60 dark:border-purple-700/60 hover:border-purple-400 dark:hover:border-purple-500 shadow hover:shadow-purple-500/10 transition-all duration-300"
      >
        <div className="flex items-center justify-between p-3 lg:p-4 gap-2">
          <div className="flex items-center space-x-2 lg:space-x-4 flex-1 min-w-0">
            <div className={`w-10 h-10 lg:w-16 lg:h-16 bg-gradient-to-br ${getCategoryColor(product.categories?.name)} rounded-xl flex items-center justify-center text-xl lg:text-3xl shadow flex-shrink-0 border border-white/30 dark:border-white/20`}>
              {getCategoryEmoji(product.categories?.name)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mb-1">
                <h3 className="font-bold text-sm lg:text-base text-gray-900 dark:text-gray-100 truncate">
                  {product.name}
                </h3>
                <div className="flex space-x-1">
                  {!product.is_active && (
                    <Badge className="text-xs bg-gradient-to-r from-gray-500 to-gray-600 text-white">😴</Badge>
                  )}
                  {isLowStock && product.is_active && (
                    <Badge className="text-xs bg-gradient-to-r from-red-500 to-red-600 text-white">⚠️</Badge>
                  )}
                  {profitMargin > 50 && (
                    <Badge className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white">💎</Badge>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                <span className="truncate">
                  {product.categories?.name || 'Sin categoría'}
                </span>
                <span className="hidden sm:inline">•</span>
                <span>
                  {product.stock_quantity} {product.unit}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className={`font-semibold ${profitMargin > 30 ? 'text-green-600 dark:text-green-400' : profitMargin > 15 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                  {profitMargin.toFixed(1)}% margen
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 lg:space-x-4">
            <div className="text-right min-w-[70px] lg:min-w-[100px]">
              <p className="font-bold text-sm lg:text-base text-green-600 dark:text-green-400">
                {formatCurrency(product.sale_price, 'VES')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium hidden lg:block">
                ≈ {formatCurrency(convertBsToUsd(product.sale_price, exchangeRate), 'USD')}
              </p>
            </div>
            
            <div className="flex items-center space-x-1 lg:space-x-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditProduct(product)}
                className="h-7 w-7 lg:h-10 lg:w-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-700 hover:scale-110 transition-all duration-300"
              >
                <Edit2 className="w-3 h-3 lg:w-4 lg:h-4 text-blue-600 dark:text-blue-400" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteProduct(product.id)}
                className="h-7 w-7 lg:h-10 lg:w-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-sm hover:bg-red-50 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-700 hover:scale-110 transition-all duration-300"
              >
                <Trash2 className="w-3 h-3 lg:w-4 lg:h-4 text-red-500 dark:text-red-400" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProductGrid = (product: Product) => {
    const profitMargin = calculateProfitMargin(product.sale_price, product.cost_price);
    const isLowStock = product.stock_quantity <= 5;

    return (
      <div
        key={product.id}
        className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white/95 via-white/90 to-purple-50/80 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-purple-950/80 backdrop-blur-xl border border-purple-200/60 dark:border-purple-700/60 hover:border-purple-400 dark:hover:border-purple-500 shadow hover:shadow-purple-500/10 transition-all duration-300 p-2"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 via-pink-400/5 to-orange-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-1">
            <div className={`w-8 h-8 lg:w-12 lg:h-12 bg-gradient-to-br ${getCategoryColor(product.categories?.name)} rounded-lg flex items-center justify-center text-lg lg:text-2xl shadow border border-white/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
              {getCategoryEmoji(product.categories?.name)}
            </div>
            <div className="flex space-x-1">
              {!product.is_active && (
                <Badge className="text-xs bg-gradient-to-r from-gray-500 to-gray-600 text-white">😴</Badge>
              )}
              {isLowStock && product.is_active && (
                <Badge className="text-xs bg-gradient-to-r from-red-500 to-red-600 text-white">⚠️</Badge>
              )}
            </div>
          </div>

          <div className="space-y-1 lg:space-y-2">
            <h3 className="font-bold text-xs lg:text-sm leading-tight text-gray-900 dark:text-gray-100 line-clamp-2">
              {product.name}
            </h3>

            <div className="pt-1 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">💰:</span>
                <span className="font-bold text-xs lg:text-sm text-green-600 dark:text-green-400">
                  {formatCurrency(product.sale_price, 'VES')}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">📦:</span>
                <span className={`text-xs lg:text-sm font-bold ${isLowStock ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  {product.stock_quantity}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950 dark:via-pink-950 dark:to-orange-950 relative overflow-hidden">
      {/* Magical floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-10 text-4xl lg:text-6xl opacity-10 dark:opacity-20 animate-bounce" style={{ animationDelay: '0s', animationDuration: '4s' }}>🐱</div>
        <div className="absolute top-32 right-20 text-3xl lg:text-5xl opacity-10 dark:opacity-20 animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}>🍦</div>
        <div className="absolute bottom-20 left-1/4 text-2xl lg:text-4xl opacity-10 dark:opacity-20 animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}>🎁</div>
        <div className="absolute top-1/2 right-10 text-xl lg:text-3xl opacity-10 dark:opacity-20 animate-bounce" style={{ animationDelay: '3s', animationDuration: '4s' }}>✨</div>
      </div>

      <div className="relative z-10 space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6 xl:p-8">
        {/* Epic Header */}
        <div className="relative overflow-hidden rounded-xl lg:rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white shadow-xl lg:shadow-2xl">
          {/* Animated background patterns */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-6 right-10 text-4xl lg:text-6xl opacity-20 animate-pulse">🐱</div>
            <div className="absolute bottom-6 left-10 text-3xl lg:text-5xl opacity-30 animate-bounce" style={{ animationDelay: '1s' }}>🐾</div>
          </div>
          
          <div className="relative z-10 p-4 lg:p-6 xl:p-8">
            {/* Mobile Layout */}
            <div className="block lg:hidden space-y-4">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-14 h-14 bg-white/20 dark:bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center border-2 border-white/40 shadow-lg">
                    <PawPrint className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h1 className="text-xl font-bold mb-2 bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                  🐱 Gestión de Productos
                </h1>
                <p className="text-purple-100 text-sm font-semibold flex items-center justify-center">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Administra tu inventario con precisión
                </p>
              </div>
              
              <div className="bg-white/15 dark:bg-white/25 backdrop-blur-sm p-3 rounded-xl border-2 border-white/30 text-center">
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <DollarSign className="w-4 h-4 text-yellow-200" />
                  <span className="text-xs text-yellow-200 font-semibold">Tasa BCV</span>
                </div>
                <p className="text-xl font-bold text-white">{exchangeRate.toFixed(2)}</p>
                <p className="text-xs text-purple-100 font-semibold">Bs./USD</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/15 dark:bg-white/25 backdrop-blur-sm p-2 rounded-xl border-2 border-white/30 text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Package className="w-4 h-4 text-green-200" />
                    <span className="text-xs text-green-200 font-semibold">Productos</span>
                  </div>
                  <p className="text-lg font-bold text-white">{products.length}</p>
                </div>
                <div className="bg-white/15 dark:bg-white/25 backdrop-blur-sm p-2 rounded-xl border-2 border-white/30 text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <ShoppingBag className="w-4 h-4 text-blue-200" />
                    <span className="text-xs text-blue-200 font-semibold">Combos</span>
                  </div>
                  <p className="text-lg font-bold text-white">{combos.length}</p>
                </div>
                <div className="bg-white/15 dark:bg-white/25 backdrop-blur-sm p-2 rounded-xl border-2 border-white/30 text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Box className="w-4 h-4 text-purple-200" />
                    <span className="text-xs text-purple-200 font-semibold">Categorías</span>
                  </div>
                  <p className="text-lg font-bold text-white">{categories.length}</p>
                </div>
                <div className="bg-white/15 dark:bg-white/25 backdrop-blur-sm p-2 rounded-xl border-2 border-white/30 text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <TrendingUp className="w-4 h-4 text-orange-200" />
                    <span className="text-xs text-orange-200 font-semibold">Total</span>
                  </div>
                  <p className="text-md font-bold text-white">{products.length + combos.length}</p>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block">
              <div className="flex items-center justify-between mb-6 lg:mb-8">
                <div className="flex items-center space-x-4 lg:space-x-6">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 bg-white/20 dark:bg-white/30 backdrop-blur-sm rounded-2xl lg:rounded-3xl flex items-center justify-center border-2 lg:border-3 border-white/40 shadow-xl lg:shadow-2xl">
                    <PawPrint className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold lg:font-black mb-2 bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                      🐱 Gestión Gatuna de Productos 🐾
                    </h1>
                    <p className="text-purple-100 text-lg lg:text-xl font-semibold lg:font-bold flex items-center">
                      <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 mr-2 lg:mr-3" />
                      Administra tu inventario felino con magia y precisión
                      <Heart className="w-5 h-5 lg:w-6 lg:h-6 ml-2 lg:ml-3" />
                    </p>
                  </div>
                </div>
                
                <div className="bg-white/15 dark:bg-white/25 backdrop-blur-sm p-4 lg:p-6 rounded-2xl lg:rounded-3xl border-2 lg:border-3 border-white/30">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 lg:space-x-3 mb-2 lg:mb-3">
                      <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-200" />
                      <span className="text-base lg:text-lg text-yellow-200 font-semibold lg:font-bold">Tasa BCV Mágica</span>
                      <Crown className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-200" />
                    </div>
                    <p className="text-2xl lg:text-3xl font-bold lg:font-black text-white">{exchangeRate.toFixed(2)}</p>
                    <p className="text-sm text-purple-100 font-semibold lg:font-bold">Bs./USD</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="bg-white/15 dark:bg-white/25 backdrop-blur-sm p-4 lg:p-6 rounded-xl lg:rounded-2xl border-2 lg:border-3 border-white/30">
                  <div className="flex items-center space-x-2 lg:space-x-3 mb-2 lg:mb-3">
                    <Package className="w-5 h-5 lg:w-6 lg:h-6 text-green-200" />
                    <span className="text-sm lg:text-base text-green-200 font-semibold lg:font-bold">Productos Felinos</span>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold lg:font-black text-white">{products.length}</p>
                </div>
                <div className="bg-white/15 dark:bg-white/25 backdrop-blur-sm p-4 lg:p-6 rounded-xl lg:rounded-2xl border-2 lg:border-3 border-white/30">
                  <div className="flex items-center space-x-2 lg:space-x-3 mb-2 lg:mb-3">
                    <ShoppingBag className="w-5 h-5 lg:w-6 lg:h-6 text-blue-200" />
                    <span className="text-sm lg:text-base text-blue-200 font-semibold lg:font-bold">Combos Mágicos</span>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold lg:font-black text-white">{combos.length}</p>
                </div>
                <div className="bg-white/15 dark:bg-white/25 backdrop-blur-sm p-4 lg:p-6 rounded-xl lg:rounded-2xl border-2 lg:border-3 border-white/30">
                  <div className="flex items-center space-x-2 lg:space-x-3 mb-2 lg:mb-3">
                    <Box className="w-5 h-5 lg:w-6 lg:h-6 text-purple-200" />
                    <span className="text-sm lg:text-base text-purple-200 font-semibold lg:font-bold">Categorías</span>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold lg:font-black text-white">{categories.length}</p>
                </div>
                <div className="bg-white/15 dark:bg-white/25 backdrop-blur-sm p-4 lg:p-6 rounded-xl lg:rounded-2xl border-2 lg:border-3 border-white/30">
                  <div className="flex items-center space-x-2 lg:space-x-3 mb-2 lg:mb-3">
                    <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-orange-200" />
                    <span className="text-sm lg:text-base text-orange-200 font-semibold lg:font-bold">Total Items</span>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold lg:font-black text-white">{products.length + combos.length}</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 lg:gap-4 mt-4 lg:mt-6 justify-center lg:justify-end">
              <Button
                onClick={() => setShowCategoryForm(true)}
                className="bg-white/20 border-2 lg:border-3 border-white/40 text-white hover:bg-white/30 backdrop-blur-sm hover:scale-105 transition-all duration-300 font-semibold text-xs lg:text-sm px-3 py-2 rounded-xl lg:rounded-2xl"
              >
                <Box className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                🏷️ Nueva Categoría
              </Button>
              <Button
                onClick={() => { setActiveTab('combos'); setShowComboForm(true); }}
                className="bg-white/20 border-2 lg:border-3 border-white/40 text-white hover:bg-white/30 backdrop-blur-sm hover:scale-105 transition-all duration-300 font-semibold text-xs lg:text-sm px-3 py-2 rounded-xl lg:rounded-2xl"
              >
                <ShoppingBag className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                🎁 Nuevo Combo
              </Button>
              <Button
                onClick={() => { setActiveTab('products'); setShowProductForm(true); }}
                className="bg-white/20 border-2 lg:border-3 border-white/40 text-white hover:bg-white/30 backdrop-blur-sm hover:scale-105 transition-all duration-300 font-semibold text-xs lg:text-sm px-3 py-2 rounded-xl lg:rounded-2xl"
              >
                <Package className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                ✨ Nuevo Producto
              </Button>
            </div>
          </div>
        </div>

        {/* Magical Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 lg:h-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-2 lg:border-3 border-purple-300/60 dark:border-purple-700/60 rounded-xl lg:rounded-3xl shadow-lg lg:shadow-2xl">
            <TabsTrigger 
              value="products" 
              className="flex items-center space-x-1 lg:space-x-3 text-sm lg:text-base font-semibold lg:font-black data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg lg:data-[state=active]:shadow-xl rounded-lg lg:rounded-2xl transition-all duration-300 hover:scale-105"
            >
              <Package className="w-4 h-4 lg:w-5 lg:h-5" />
              <span>🐱 Productos</span>
            </TabsTrigger>
            <TabsTrigger 
              value="combos" 
              className="flex items-center space-x-1 lg:space-x-3 text-sm lg:text-base font-semibold lg:font-black data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg lg:data-[state=active]:shadow-xl rounded-lg lg:rounded-2xl transition-all duration-300 hover:scale-105"
            >
              <ShoppingBag className="w-4 h-4 lg:w-5 lg:h-5" />
              <span>🎁 Combos</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="space-y-6 lg:space-y-8 mt-4 lg:mt-6">
            {/* Filtros */}
            <div className="relative overflow-hidden rounded-xl lg:rounded-3xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-2 lg:border-3 border-purple-300/60 dark:border-purple-700/60 shadow-lg lg:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-orange-500/5 animate-pulse"></div>
              
              <div className="relative z-10 p-4 lg:p-6">
                <div className="space-y-6">
                  {/* Barra de búsqueda */}
                  <div className="relative">
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl lg:rounded-2xl border-2 lg:border-3 border-purple-300 dark:border-purple-700 shadow-lg">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-500 w-4 h-4 lg:w-5 lg:h-5 z-10" />
                      <Input
                        placeholder="🔍 Buscar productos mágicos... ✨"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 lg:pl-12 pr-4 h-12 text-base bg-transparent border-0 focus:ring-0 focus:outline-none font-medium placeholder:text-purple-400 dark:placeholder:text-purple-300"
                      />
                    </div>
                  </div>
                  
                  {/* Controles */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                    {/* Vista y estado */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm lg:text-base font-semibold text-purple-700 dark:text-purple-300">
                          👁️ Vista:
                        </span>
                        <ViewToggle
                          view={viewMode}
                          onViewChange={setViewMode}
                        />
                      </div>
                      <Button
                        variant={showInactive ? "default" : "outline"}
                        onClick={() => setShowInactive(!showInactive)}
                        className="h-10 px-4 text-sm font-semibold border-2 border-gray-300 dark:border-gray-700 rounded-xl"
                      >
                        {showInactive ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                        {showInactive ? 'Ocultar Inactivos' : 'Mostrar Inactivos'}
                      </Button>
                    </div>
                    
                    {/* Filtros */}
                    <div className="space-y-3">
                      <Label className="text-sm lg:text-base font-semibold text-purple-700 dark:text-purple-300">
                        🏷️ Categoría:
                      </Label>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="h-12 text-base bg-white/80 dark:bg-gray-800/80 backdrop-blur border-2 border-purple-300 dark:border-purple-700 rounded-xl font-medium">
                          <Filter className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent className="text-base bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-2 border-purple-300 dark:border-purple-700 rounded-xl">
                          <SelectItem value="all" className="font-medium">🌟 Todas las categorías</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id} className="font-medium">
                              <div className="flex items-center space-x-2">
                                <span>{getCategoryEmoji(category.name)}</span>
                                <span className="truncate">{category.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Contador */}
                    <div className="flex items-center justify-center">
                      <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-xl border-2 border-purple-300 dark:border-purple-700 p-4 text-center w-full">
                        <div className="flex items-center justify-center space-x-2">
                          <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          <span className="text-sm lg:text-base font-semibold text-purple-700 dark:text-purple-300">
                            🐾 {filteredAndSortedProducts.length} productos
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products display */}
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {filteredAndSortedProducts.map(renderProductCard)}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="space-y-3 lg:space-y-4">
                {filteredAndSortedProducts.map(renderProductList)}
              </div>
            )}

            {viewMode === 'grid' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
                {filteredAndSortedProducts.map(renderProductGrid)}
              </div>
            )}

            {/* Empty state */}
            {filteredAndSortedProducts.length === 0 && (
              <div className="relative overflow-hidden rounded-xl lg:rounded-3xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-2 lg:border-3 border-purple-300/60 dark:border-purple-700/60 shadow-lg lg:shadow-2xl">
                <div className="text-center py-8 lg:py-12 px-4">
                  <div className="text-7xl lg:text-8xl mb-4 lg:mb-6">😿</div>
                  <h3 className="text-xl lg:text-2xl font-bold lg:font-black text-gray-700 dark:text-gray-300 mb-3 lg:mb-4">
                    ¡No se encontraron productos felinos!
                  </h3>
                  <p className="text-base lg:text-lg text-gray-600 dark:text-gray-400 mb-6 lg:mb-8 max-w-md mx-auto">
                    {searchTerm || categoryFilter !== 'all'
                      ? '🔍 Prueba ajustando los filtros de búsqueda mágicos'
                      : '✨ Comienza creando tu primer producto gatuno'
                    }
                  </p>
                  {!searchTerm && categoryFilter === 'all' && (
                    <Button
                      onClick={() => setShowProductForm(true)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold lg:font-bold text-sm lg:text-base px-5 py-3 rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl"
                    >
                      <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                      🐱 Crear Primer Producto
                    </Button>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="combos" className="space-y-6 lg:space-y-8 mt-4 lg:mt-6">
            {/* Combo search */}
            <div className="relative overflow-hidden rounded-xl lg:rounded-3xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-2 lg:border-3 border-blue-300/60 dark:border-blue-700/60 shadow-lg lg:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-pulse"></div>
              
              <div className="relative z-10 p-4 lg:p-6">
                <div className="space-y-4 lg:space-y-6">
                  {/* Barra de búsqueda */}
                  <div className="relative">
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl lg:rounded-2xl border-2 lg:border-3 border-blue-300 dark:border-blue-700 shadow-lg">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 w-4 h-4 lg:w-5 lg:h-5 z-10" />
                      <Input
                        placeholder="🔍 Buscar combos mágicos... 🎁"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 lg:pl-12 pr-4 h-12 text-base bg-transparent border-0 focus:ring-0 focus:outline-none font-medium placeholder:text-blue-400 dark:placeholder:text-blue-300"
                      />
                    </div>
                  </div>
                  
                  {/* Contador */}
                  <div className="flex justify-center">
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-xl lg:rounded-2xl border-2 lg:border-3 border-blue-300 dark:border-blue-700 px-6 py-4 w-full max-w-md">
                      <div className="flex items-center justify-center space-x-3">
                        <ShoppingBag className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
                        <span className="text-base lg:text-lg font-semibold text-blue-700 dark:text-blue-300">
                          🎁 {filteredCombos.length} combos encontrados
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Combos grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {filteredCombos.map((combo) => {
                const comboPrice = calculateComboPrice(combo);
                const comboCost = calculateComboCost(combo);
                const profitMargin = calculateProfitMargin(comboPrice, comboCost);

                return (
                  <div
                    key={combo.id}
                    className="group relative overflow-hidden rounded-xl lg:rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-blue-50/80 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-blue-950/80 backdrop-blur-xl border-2 lg:border-3 border-blue-200/60 dark:border-blue-700/60 hover:border-blue-400 dark:hover:border-blue-500 shadow-lg lg:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02]"
                  >
                    {/* Magical glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl lg:rounded-3xl"></div>
                    
                    {/* Action buttons */}
                    <div className="absolute top-3 lg:top-4 left-3 lg:left-4 z-20 flex space-x-1 lg:space-x-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditCombo(combo)}
                        className="h-8 w-8 lg:h-10 lg:w-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow hover:bg-blue-50 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-700 hover:scale-110 transition-all duration-300"
                      >
                        <Edit2 className="w-3 h-3 lg:w-4 lg:h-4 text-blue-600 dark:text-blue-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCombo(combo.id)}
                        className="h-8 w-8 lg:h-10 lg:w-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow hover:bg-red-50 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-700 hover:scale-110 transition-all duration-300"
                      >
                        <Trash2 className="w-3 h-3 lg:w-4 lg:h-4 text-red-500 dark:text-red-400" />
                      </Button>
                    </div>

                    <div className="relative z-10 p-4 lg:p-6">
                      {/* Combo icon and ID */}
                      <div className="flex items-start justify-between mb-4 lg:mb-6">
                        <div className="w-14 h-14 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl lg:rounded-3xl flex items-center justify-center text-2xl lg:text-4xl shadow-lg lg:shadow-2xl border-2 lg:border-3 border-white/30">
                          🎁
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 lg:mb-2 font-semibold">ID Combo</div>
                          <div className="text-xs font-mono bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 px-2 py-1 lg:px-3 lg:py-2 rounded-lg lg:rounded-xl border border-blue-200 dark:border-blue-700">
                            {combo.id.slice(0, 6)}
                          </div>
                        </div>
                      </div>

                      {/* Combo info */}
                      <div className="space-y-3 lg:space-y-4">
                        <div>
                          <h3 className="font-bold lg:font-black text-base lg:text-xl leading-tight mb-2 lg:mb-3 text-gray-900 dark:text-gray-100">
                            {combo.name}
                          </h3>
                          
                          <Badge className="text-xs lg:text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 mb-2 lg:mb-4">
                            🎁 Combo {combo.discount_percentage}% OFF
                          </Badge>
                        </div>

                        {/* Pricing section */}
                        <div className="bg-gradient-to-br from-white/80 via-blue-50/50 to-purple-50/50 dark:from-gray-800/80 dark:via-blue-950/30 dark:to-purple-950/30 backdrop-blur-sm p-3 lg:p-5 rounded-xl lg:rounded-2xl border border-blue-200/50 dark:border-blue-700/50 space-y-2 lg:space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xs lg:text-sm font-semibold lg:font-bold text-gray-700 dark:text-gray-300 flex items-center">
                              💰 Precio Final:
                            </span>
                            <div className="text-right">
                              <span className="font-bold lg:font-black text-sm lg:text-xl text-green-600 dark:text-green-400">
                                {formatCurrency(comboPrice, 'VES')}
                              </span>
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium hidden lg:block">
                                ≈ {formatCurrency(convertBsToUsd(comboPrice, exchangeRate), 'USD')}
                              </p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-xs lg:text-sm font-semibold lg:font-bold text-gray-700 dark:text-gray-300 flex items-center">
                              🏷️ Costo Total:
                            </span>
                            <div className="text-right">
                              <span className="font-bold text-sm lg:text-lg text-gray-800 dark:text-gray-200">
                                {formatCurrency(comboCost, 'VES')}
                              </span>
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium hidden lg:block">
                                ≈ {formatCurrency(convertBsToUsd(comboCost, exchangeRate), 'USD')}
                              </p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-xs lg:text-sm font-semibold lg:font-bold text-gray-700 dark:text-gray-300 flex items-center">
                              🎯 Descuento:
                            </span>
                            <span className="font-bold lg:font-black text-sm lg:text-lg text-purple-600 dark:text-purple-400">
                              {combo.discount_percentage}%
                            </span>
                          </div>

                          <div className="flex justify-between items-center pt-2 lg:pt-3 border-t border-blue-200/50 dark:border-blue-700/50">
                            <span className="text-xs lg:text-sm font-semibold lg:font-bold text-gray-700 dark:text-gray-300 flex items-center">
                              📈 Margen:
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className={`font-bold lg:font-black text-sm lg:text-xl ${profitMargin > 30 ? 'text-green-600 dark:text-green-400' : profitMargin > 15 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                                {profitMargin.toFixed(1)}%
                              </span>
                              <div className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full ${profitMargin > 30 ? 'bg-green-500' : profitMargin > 15 ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse shadow-lg`}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty state for combos */}
            {filteredCombos.length === 0 && (
              <div className="relative overflow-hidden rounded-xl lg:rounded-3xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-2 lg:border-3 border-blue-300/60 dark:border-blue-700/60 shadow-lg lg:shadow-2xl">
                <div className="text-center py-8 lg:py-12 px-4">
                  <div className="text-7xl lg:text-8xl mb-4 lg:mb-6">🎁</div>
                  <h3 className="text-xl lg:text-2xl font-bold lg:font-black text-gray-700 dark:text-gray-300 mb-3 lg:mb-4">
                    ¡No se encontraron combos mágicos!
                  </h3>
                  <p className="text-base lg:text-lg text-gray-600 dark:text-gray-400 mb-6 lg:mb-8 max-w-md mx-auto">
                    {searchTerm
                      ? '🔍 Prueba ajustando los filtros de búsqueda'
                      : '✨ Comienza creando tu primer combo gatuno'
                    }
                  </p>
                  {!searchTerm && (
                    <Button
                      onClick={() => setShowComboForm(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold lg:font-bold text-sm lg:text-base px-5 py-3 rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl"
                    >
                      <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                      🎁 Crear Primer Combo
                    </Button>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Magical Floating Action Button */}
        <FloatingActionButton
          onClick={() => activeTab === 'products' ? setShowProductForm(true) : setShowComboForm(true)}
          icon={<Plus className="w-5 h-5 lg:w-6 lg:h-6" />}
          tooltip={activeTab === 'products' ? "✨ Crear nuevo producto felino" : "🎁 Crear nuevo combo mágico"}
          variant="primary"
        />

        {/* Product Form Dialog */}
        <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
          <DialogContent className="max-w-md lg:max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white/95 via-purple-50/80 to-pink-50/80 dark:from-gray-900/95 dark:via-purple-950/80 dark:to-pink-950/80 backdrop-blur-xl border-2 lg:border-3 border-purple-300 dark:border-purple-700 rounded-xl lg:rounded-3xl">
            <DialogHeader className="text-center pb-4 lg:pb-6">
              <DialogTitle className="flex items-center justify-center text-xl lg:text-2xl font-bold lg:font-black text-purple-700 dark:text-purple-300">
                <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 mr-2 lg:mr-3 text-purple-500" />
                {editingProduct ? '✏️ Editar Producto Felino' : '✨ Crear Nuevo Producto Gatuno'}
                <PawPrint className="w-5 h-5 lg:w-6 lg:h-6 ml-2 lg:ml-3 text-purple-500" />
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600 dark:text-gray-400 font-medium hidden lg:block">
                {editingProduct ? '🐱 Modifica los datos de tu producto felino' : '🌟 Crea un nuevo producto para tu inventario gatuno'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4 lg:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-2 lg:space-y-3">
                  <Label htmlFor="name" className="text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300">
                    🏷️ Nombre del producto
                  </Label>
                  <Input
                    id="name"
                    required
                    value={productFormData.name}
                    onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                    className="h-12 text-base bg-white/80 dark:bg-gray-800/80 border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl font-medium"
                    placeholder="Ej: Helado de Pescado Supremo 🍦"
                  />
                </div>
                
                <div className="space-y-2 lg:space-y-3">
                  <Label htmlFor="category" className="text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300">
                    📂 Categoría
                  </Label>
                  <SearchableSelect
                    options={categoryOptions}
                    value={productFormData.category_id}
                    onValueChange={(value) => {
                      setProductFormData({ ...productFormData, category_id: value });
                    }}
                    placeholder="🔍 Seleccionar categoría"
                    allowClear
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-2 lg:space-y-3">
                  <Label htmlFor="cost_price" className="text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300">
                    🏷️ Precio de costo (Bs.)
                  </Label>
                  <Input
                    id="cost_price"
                    type="number"
                    step="0.01"
                    required
                    value={productFormData.cost_price}
                    onChange={(e) => setProductFormData({ ...productFormData, cost_price: e.target.value })}
                    className="h-12 text-base bg-white/80 dark:bg-gray-800/80 border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl font-medium"
                  />
                  {productFormData.cost_price && (
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                      💵 ≈ {formatCurrency(convertBsToUsd(parseFloat(productFormData.cost_price), exchangeRate), 'USD')}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2 lg:space-y-3">
                  <Label htmlFor="sale_price" className="text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300">
                    💰 Precio de venta (Bs.)
                  </Label>
                  <Input
                    id="sale_price"
                    type="number"
                    step="0.01"
                    required
                    value={productFormData.sale_price}
                    onChange={(e) => setProductFormData({ ...productFormData, sale_price: e.target.value })}
                    className="h-12 text-base bg-white/80 dark:bg-gray-800/80 border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl font-medium"
                  />
                  {productFormData.sale_price && (
                    <div className="space-y-1">
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                        💵 ≈ {formatCurrency(convertBsToUsd(parseFloat(productFormData.sale_price), exchangeRate), 'USD')}
                      </p>
                      {productFormData.cost_price && (
                        <p className="text-sm lg:text-base font-semibold text-green-600 dark:text-green-400">
                          📈 Margen: {calculateProfitMargin(parseFloat(productFormData.sale_price), parseFloat(productFormData.cost_price)).toFixed(1)}%
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-2 lg:space-y-3">
                  <Label htmlFor="stock_quantity" className="text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300">
                    📦 Stock inicial
                  </Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    required
                    value={productFormData.stock_quantity}
                    onChange={(e) => setProductFormData({ ...productFormData, stock_quantity: e.target.value })}
                    className="h-12 text-base bg-white/80 dark:bg-gray-800/80 border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl font-medium"
                  />
                </div>
                
                <div className="space-y-2 lg:space-y-3">
                  <Label htmlFor="unit" className="text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300">
                    📏 Unidad de medida
                  </Label>
                  <Select value={productFormData.unit} onValueChange={(value) => setProductFormData({ ...productFormData, unit: value })}>
                    <SelectTrigger className="h-12 text-base bg-white/80 dark:bg-gray-800/80 border-2 border-purple-300 dark:border-purple-700 rounded-xl font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="text-base bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-2 border-purple-300 dark:border-purple-700 rounded-xl">
                      <SelectItem value="unidad" className="font-medium">🔢 Unidad</SelectItem>
                      <SelectItem value="gramo" className="font-medium">⚖️ Gramo</SelectItem>
                      <SelectItem value="kilogramo" className="font-medium">📦 Kilogramo</SelectItem>
                      <SelectItem value="litro" className="font-medium">🪣 Litro</SelectItem>
                      <SelectItem value="mililitro" className="font-medium">🥤 Mililitro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 lg:space-y-3">
                <Label htmlFor="description" className="text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300">
                  📝 Descripción (opcional)
                </Label>
                <Textarea
                  id="description"
                  value={productFormData.description}
                  onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                  className="min-h-[100px] text-base bg-white/80 dark:bg-gray-800/80 border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl font-medium resize-none"
                  placeholder="Describe tu producto increíble... 🌟"
                />
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 lg:pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetProductForm} 
                  className="h-12 text-base font-semibold border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                >
                  ❌ Cancelar
                </Button>
                <Button
                  type="button" 
                  onClick={handleProductSubmit}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                >
                  {loading ? (
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>🔄 Guardando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Zap className="w-5 h-5" />
                      <span>{editingProduct ? '✏️ Actualizar Producto' : '✨ Crear Producto'}</span>
                    </div>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Combo Form Dialog */}
        <Dialog open={showComboForm} onOpenChange={setShowComboForm}>
          <DialogContent className="max-w-md lg:max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white/95 via-blue-50/80 to-purple-50/80 dark:from-gray-900/95 dark:via-blue-950/80 dark:to-purple-950/80 backdrop-blur-xl border-2 lg:border-3 border-blue-300 dark:border-blue-700 rounded-xl lg:rounded-3xl">
            <DialogHeader className="text-center pb-4 lg:pb-6">
              <DialogTitle className="flex items-center justify-center text-xl lg:text-2xl font-bold lg:font-black text-blue-700 dark:text-blue-300">
                <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 mr-2 lg:mr-3 text-blue-500" />
                {editingCombo ? '✏️ Editar Combo Mágico' : '🎁 Crear Nuevo Combo Gatuno'}
                <ShoppingBag className="w-5 h-5 lg:w-6 lg:h-6 ml-2 lg:ml-3 text-blue-500" />
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600 dark:text-gray-400 font-medium hidden lg:block">
                {editingCombo ? '🎁 Modifica los datos de tu combo mágico' : '✨ Crea un nuevo combo con múltiples productos felinos'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleComboSubmit} className="space-y-4 lg:space-y-6">
              <div className="grid grid-cols-1 gap-4 lg:gap-6">
                <div className="space-y-2 lg:space-y-3">
                  <Label htmlFor="combo_name" className="text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300">
                    🎁 Nombre del combo
                  </Label>
                  <Input
                    id="combo_name"
                    required
                    value={comboFormData.name}
                    onChange={(e) => setComboFormData({ ...comboFormData, name: e.target.value })}
                    className="h-12 text-base bg-white/80 dark:bg-gray-800/80 border-2 border-blue-300 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl font-medium"
                    placeholder="Ej: Combo Especial Gatuno de Verano 🌟"
                  />
                </div>
                
                <div className="space-y-2 lg:space-y-3">
                  <Label htmlFor="combo_description" className="text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300">
                    📝 Descripción (opcional)
                  </Label>
                  <Textarea
                    id="combo_description"
                    value={comboFormData.description}
                    onChange={(e) => setComboFormData({ ...comboFormData, description: e.target.value })}
                    className="min-h-[100px] text-base bg-white/80 dark:bg-gray-800/80 border-2 border-blue-300 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl font-medium resize-none"
                    placeholder="Describe tu combo increíble... 🎁"
                  />
                </div>
              </div>

              <div className="space-y-2 lg:space-y-3">
                <Label htmlFor="discount_percentage" className="text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300">
                  🎯 Descuento mágico (%)
                </Label>
                <Input
                  id="discount_percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={comboFormData.discount_percentage}
                  onChange={(e) => setComboFormData({ ...comboFormData, discount_percentage: e.target.value })}
                  className="h-12 text-base bg-white/80 dark:bg-gray-800/80 border-2 border-blue-300 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl font-medium"
                />
              </div>

              <div className="space-y-4 lg:space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 lg:gap-4">
                  <Label className="flex items-center text-base font-semibold lg:font-bold text-gray-700 dark:text-gray-300">
                    <Box className="w-5 h-5 lg:w-6 lg:h-6 mr-2 lg:mr-3 text-blue-500" />
                    🐾 Productos del combo
                  </Label>
                  <Button 
                    type="button" 
                    onClick={addComboItem} 
                    variant="outline" 
                    className="h-10 lg:h-12 px-4 text-sm lg:text-base font-semibold border-2 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:scale-105 transition-all duration-300 rounded-xl"
                  >
                    <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2" />
                    ➕ Agregar Producto
                  </Button>
                </div>
                
                <div className="space-y-3 max-h-60 lg:max-h-80 overflow-y-auto">
                  {comboItems.map((item, index) => (
                    <div key={index} className="flex flex-col lg:flex-row items-center gap-3 p-3 lg:p-4 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50 backdrop-blur">
                      <div className="flex-1 w-full">
                        <SearchableSelect
                          options={productOptions}
                          value={item.product_id}
                          onValueChange={(value) => updateComboItem(index, 'product_id', value)}
                          placeholder="🔍 Seleccionar producto felino"
                        />
                      </div>
                      <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="w-full lg:w-32">
                          <Input
                            type="number"
                            min="1"
                            placeholder="Cantidad"
                            value={item.quantity}
                            onChange={(e) => updateComboItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="h-10 lg:h-12 text-center text-base bg-white/80 dark:bg-gray-800/80 border-2 border-blue-300 dark:border-blue-700 rounded-lg lg:rounded-xl font-medium"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeComboItem(index)}
                          className="h-10 lg:h-12 w-10 lg:w-12 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 flex-shrink-0 border-2 border-red-200 dark:border-red-700 hover:scale-110 transition-all duration-300 rounded-lg lg:rounded-xl"
                        >
                          <X className="w-4 h-4 lg:w-5 lg:h-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 lg:pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetComboForm} 
                  className="h-12 text-base font-semibold border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                >
                  ❌ Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                >
                  {loading ? (
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>🔄 Guardando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Zap className="w-5 h-5" />
                      <span>{editingCombo ? '✏️ Actualizar Combo' : '🎁 Crear Combo'}</span>
                    </div>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Category Form Dialog */}
        <Dialog open={showCategoryForm} onOpenChange={setShowCategoryForm}>
          <DialogContent className="max-w-md bg-gradient-to-br from-white/95 via-purple-50/80 to-pink-50/80 dark:from-gray-900/95 dark:via-purple-950/80 dark:to-pink-950/80 backdrop-blur-xl border-2 lg:border-3 border-purple-300 dark:border-purple-700 rounded-xl lg:rounded-3xl">
            <DialogHeader className="text-center pb-4 lg:pb-6">
              <DialogTitle className="flex items-center justify-center text-xl lg:text-2xl font-bold lg:font-black text-purple-700 dark:text-purple-300">
                <Box className="w-5 h-5 lg:w-6 lg:h-6 mr-2 lg:mr-3 text-purple-500" />
                🏷️ Nueva Categoría Gatuna
                <Crown className="w-5 h-5 lg:w-6 lg:h-6 ml-2 lg:ml-3 text-purple-500" />
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleCategorySubmit} className="space-y-4 lg:space-y-6">
              <div className="space-y-2 lg:space-y-3">
                <Label htmlFor="category_name" className="text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300">
                  🏷️ Nombre de la categoría
                </Label>
                <Input
                  id="category_name"
                  required
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  placeholder="Ej: Helados Felinos, Bebidas Gatunas, Postres Mágicos... 🐱"
                  className="h-12 text-base bg-white/80 dark:bg-gray-800/80 border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl font-medium"
                />
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetCategoryForm}
                  className="h-12 text-base font-semibold border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                >
                  ❌ Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                >
                  {loading ? (
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>🔄 Creando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Crown className="w-5 h-5" />
                      <span>🏷️ Crear Categoría</span>
                    </div>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};