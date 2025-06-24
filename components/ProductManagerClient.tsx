"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Package, Search, Filter, ChefHat, X, Sparkles, 
  DollarSign, TrendingUp, Archive, Zap, ShoppingBag, Trash2, Box,
  Grid3X3, List, LayoutGrid, Eye, EyeOff, Star, AlertTriangle
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

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          // Calculate sale price for the combo
          const basePrice = comboItems.reduce((total, item) => {
            const product = products.find(p => p.id === item.product_id);
            return total + (product ? product.sale_price * item.quantity : 0);
          }, 0);
          return basePrice * (1 - parseFloat(comboFormData.discount_percentage) / 100);
        })(),
        total_cost: (() => {
          // Calculate total cost for the combo
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

  // Filter and sort products
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

  // Filter combos
  const filteredCombos = combos.filter(combo => 
    combo.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (categoryFilter === 'all' || true) // Ajustar si los combos tienen categoría
  );

  // Create searchable options
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
      <AnimatedCard 
        key={product.id}
        className="relative group overflow-hidden bg-gradient-to-br from-white via-white to-gray-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/50 border-2 border-gray-200/60 dark:border-gray-700/60 hover:border-purple-300 dark:hover:border-purple-600 shadow-lg hover:shadow-xl transition-all duration-300"
        hoverEffect
        glowEffect
      >
        {/* Status Badges */}
        <div className="absolute top-3 right-3 z-20 flex flex-col space-y-1">
          {!product.is_active && (
            <Badge variant="secondary" className="text-xs animate-pulse bg-gray-500 text-white">
              Inactivo
            </Badge>
          )}
          {isLowStock && product.is_active && (
            <Badge variant="destructive" className="text-xs animate-pulse shadow-lg">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Stock Bajo
            </Badge>
          )}
          {profitMargin > 50 && (
            <Badge className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
              <Star className="w-3 h-3 mr-1" />
              Alto Margen
            </Badge>
          )}
        </div>

        {/* Product Actions */}
        <div className="absolute top-3 left-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditProduct(product)}
            className="h-8 w-8 hover:scale-110 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:bg-blue-50 dark:hover:bg-blue-900/50"
          >
            <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteProduct(product.id)}
            className="h-8 w-8 hover:scale-110 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:bg-red-50 dark:hover:bg-red-900/50"
          >
            <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
          </Button>
        </div>

        {/* Product Icon/Avatar */}
        <div className="flex items-center justify-between mb-4">
          <div className={`w-16 h-16 bg-gradient-to-br ${getCategoryColor(product.categories?.name)} rounded-2xl flex items-center justify-center text-3xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border-2 border-white/20`}>
            {getCategoryEmoji(product.categories?.name)}
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">ID</div>
            <div className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              {product.id.slice(0, 8)}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-3">
          <div>
            <h3 className="font-bold text-lg leading-tight mb-2 text-gray-900 dark:text-gray-100">{product.name}</h3>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700">
                {product.categories?.name || 'Sin categoría'}
              </Badge>
              <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                {product.product_type === 'final' ? 'Final' : 'Ingrediente'}
              </Badge>
            </div>
          </div>

          {product.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
              {product.description}
            </p>
          )}

          {/* Price Information */}
          <div className="space-y-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Precio:</span>
              <div className="text-right">
                <span className="font-bold text-lg text-green-600 dark:text-green-400">
                  {formatCurrency(product.sale_price, 'VES')}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatCurrency(convertBsToUsd(product.sale_price, exchangeRate), 'USD')}
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Costo:</span>
              <div className="text-right">
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {formatCurrency(product.cost_price, 'VES')}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatCurrency(convertBsToUsd(product.cost_price, exchangeRate), 'USD')}
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Stock:</span>
              <span className={`font-bold ${isLowStock ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-blue-600 dark:text-blue-400'}`}>
                {product.stock_quantity} {product.unit}
              </span>
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Margen:</span>
              <div className="flex items-center space-x-2">
                <span className={`font-bold text-lg ${profitMargin > 30 ? 'text-green-600 dark:text-green-400' : profitMargin > 15 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                  {profitMargin.toFixed(1)}%
                </span>
                <div className={`w-2 h-2 rounded-full ${profitMargin > 30 ? 'bg-green-500' : profitMargin > 15 ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`}></div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedCard>
    );
  };

  const renderProductList = (product: Product) => {
    const profitMargin = calculateProfitMargin(product.sale_price, product.cost_price);
    const isLowStock = product.stock_quantity <= 5;
    
    return (
      <AnimatedCard 
        key={product.id}
        className="group hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 transition-all duration-300"
        hoverEffect
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className={`w-12 h-12 bg-gradient-to-br ${getCategoryColor(product.categories?.name)} rounded-xl flex items-center justify-center text-2xl shadow-md`}>
              {getCategoryEmoji(product.categories?.name)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-1">
                <h3 className="font-bold text-gray-900 dark:text-gray-100">{product.name}</h3>
                {!product.is_active && (
                  <Badge variant="secondary" className="text-xs">Inactivo</Badge>
                )}
                {isLowStock && product.is_active && (
                  <Badge variant="destructive" className="text-xs">Stock Bajo</Badge>
                )}
                {profitMargin > 50 && (
                  <Badge className="text-xs bg-green-500">Alto Margen</Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>{product.categories?.name || 'Sin categoría'}</span>
                <span>•</span>
                <span>{product.stock_quantity} {product.unit}</span>
                <span>•</span>
                <span className={`font-medium ${profitMargin > 30 ? 'text-green-600 dark:text-green-400' : profitMargin > 15 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                  {profitMargin.toFixed(1)}% margen
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="font-bold text-lg text-green-600 dark:text-green-400">
                {formatCurrency(product.sale_price, 'VES')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatCurrency(convertBsToUsd(product.sale_price, exchangeRate), 'USD')}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditProduct(product)}
                className="h-8 w-8 hover:bg-blue-100 dark:hover:bg-blue-900/50"
              >
                <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteProduct(product.id)}
                className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900/50"
              >
                <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
              </Button>
            </div>
          </div>
        </div>
      </AnimatedCard>
    );
  };

  const renderProductGrid = (product: Product) => {
    const profitMargin = calculateProfitMargin(product.sale_price, product.cost_price);
    const isLowStock = product.stock_quantity <= 5;
    
    return (
      <div 
        key={product.id}
        className="group p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 bg-white dark:bg-gray-900 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
      >
        {/* Background gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/0 to-blue-50/0 group-hover:from-purple-50/50 group-hover:to-blue-50/50 dark:group-hover:from-purple-900/20 dark:group-hover:to-blue-900/20 transition-all duration-300"></div>
        
        <div className="relative z-10">
          {/* Header with actions */}
          <div className="flex items-start justify-between mb-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${getCategoryColor(product.categories?.name)} rounded-lg flex items-center justify-center text-xl shadow-md`}>
              {getCategoryEmoji(product.categories?.name)}
            </div>
            
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditProduct(product)}
                className="h-7 w-7 hover:bg-blue-100 dark:hover:bg-blue-900/50"
              >
                <Edit2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteProduct(product.id)}
                className="h-7 w-7 hover:bg-red-100 dark:hover:bg-red-900/50"
              >
                <Trash2 className="w-3 h-3 text-red-500 dark:text-red-400" />
              </Button>
            </div>
          </div>
          
          {/* Product info */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm leading-tight text-gray-900 dark:text-gray-100 line-clamp-2">
              {product.name}
            </h3>
            
            <div className="flex flex-wrap gap-1">
              {!product.is_active && (
                <Badge variant="secondary" className="text-xs">Inactivo</Badge>
              )}
              {isLowStock && product.is_active && (
                <Badge variant="destructive" className="text-xs">Stock Bajo</Badge>
              )}
            </div>
            
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600 dark:text-gray-400">Precio:</span>
                <span className="font-bold text-sm text-green-600 dark:text-green-400">
                  {formatCurrency(product.sale_price, 'VES')}
                </span>
              </div>
              
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">Stock:</span>
                <span className={`text-xs font-medium ${isLowStock ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  {product.stock_quantity}
                </span>
              </div>
              
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">Margen:</span>
                <span className={`text-xs font-bold ${profitMargin > 30 ? 'text-green-600 dark:text-green-400' : profitMargin > 15 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                  {profitMargin.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950/30 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-10 text-6xl opacity-5 dark:opacity-10 animate-bounce" style={{ animationDelay: '0s', animationDuration: '4s' }}>🍦</div>
        <div className="absolute top-32 right-20 text-4xl opacity-5 dark:opacity-10 animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}>🧁</div>
        <div className="absolute bottom-20 left-1/4 text-5xl opacity-5 dark:opacity-10 animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}>🍰</div>
        <div className="absolute top-1/2 right-10 text-3xl opacity-5 dark:opacity-10 animate-bounce" style={{ animationDelay: '3s', animationDuration: '4s' }}>🎂</div>
        <div className="absolute bottom-32 right-1/3 text-4xl opacity-5 dark:opacity-10 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}>🧪</div>
      </div>

      <div className="relative z-10 space-y-8 p-6">
        {/* Header Section */}
        <AnimatedCard 
          className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white shadow-2xl"
          glowEffect
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl border border-white/30">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                  Gestión de Productos y Combos
                </h1>
                <p className="text-purple-100 text-lg mt-1 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Administra tu inventario con estilo y precisión
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => setShowCategoryForm(true)} 
                variant="outline" 
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm hover:scale-105 transition-transform"
              >
                <Box className="w-4 h-4 mr-2" />
                Nueva Categoría
              </Button>
              <Button 
                onClick={() => { setActiveTab('combos'); setShowComboForm(true); }} 
                variant="outline" 
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm hover:scale-105 transition-transform"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Nuevo Combo
              </Button>
              <Button 
                onClick={() => { setActiveTab('products'); setShowProductForm(true); }} 
                variant="outline" 
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm hover:scale-105 transition-transform"
              >
                <Package className="w-4 h-4 mr-2" />
                Nuevo Producto
              </Button>
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-green-300" />
                <span className="text-sm text-purple-100">Productos</span>
              </div>
              <p className="text-2xl font-bold text-white">{products.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-blue-300" />
                <span className="text-sm text-purple-100">Combos</span>
              </div>
              <p className="text-2xl font-bold text-white">{combos.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <div className="flex items-center space-x-2">
                <Box className="w-5 h-5 text-purple-300" />
                <span className="text-sm text-purple-100">Categorías</span>
              </div>
              <p className="text-2xl font-bold text-white">{categories.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-yellow-300" />
                <span className="text-sm text-purple-100">Tasa USD</span>
              </div>
              <p className="text-xl font-bold text-white">{exchangeRate.toFixed(2)}</p>
            </div>
          </div>
        </AnimatedCard>

        {/* Tabs for Products and Combos */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-14 bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-800">
            <TabsTrigger value="products" className="flex items-center space-x-2 text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Package className="w-5 h-5" />
              <span>Productos</span>
            </TabsTrigger>
            <TabsTrigger value="combos" className="flex items-center space-x-2 text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <ShoppingBag className="w-5 h-5" />
              <span>Combos</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="space-y-6 mt-6">
            {/* Enhanced Filters Section for Products */}
            <AnimatedCard className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-purple-200/50 dark:border-purple-800/50">
              <div className="space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Buscar productos mágicos... ✨"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur border-2 border-purple-200 dark:border-purple-700 focus:border-purple-400 dark:focus:border-purple-500 text-base"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <ViewToggle 
                      view={viewMode} 
                      onViewChange={setViewMode}
                      className="flex-shrink-0"
                    />
                    
                    <Button
                      variant={showInactive ? "default" : "outline"}
                      onClick={() => setShowInactive(!showInactive)}
                      className="flex items-center space-x-2 h-10"
                    >
                      {showInactive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      <span className="hidden sm:inline">
                        {showInactive ? 'Ocultar Inactivos' : 'Mostrar Inactivos'}
                      </span>
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur border-2 border-purple-200 dark:border-purple-700">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center space-x-2">
                            <span>{getCategoryEmoji(category.name)}</span>
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="h-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur border-2 border-purple-200 dark:border-purple-700">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">📝 Nombre</SelectItem>
                      <SelectItem value="price">💰 Precio</SelectItem>
                      <SelectItem value="stock">📦 Stock</SelectItem>
                      <SelectItem value="profit">📈 Margen</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                    <SelectTrigger className="h-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur border-2 border-purple-200 dark:border-purple-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">⬆️ Ascendente</SelectItem>
                      <SelectItem value="desc">⬇️ Descendente</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {filteredAndSortedProducts.length} productos
                    </span>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Products Display */}
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filteredAndSortedProducts.map(renderProductCard)}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="space-y-3">
                {filteredAndSortedProducts.map(renderProductList)}
              </div>
            )}

            {viewMode === 'grid' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                {filteredAndSortedProducts.map(renderProductGrid)}
              </div>
            )}

            {/* Empty State for Products */}
            {filteredAndSortedProducts.length === 0 && (
              <AnimatedCard className="text-center py-12 bg-gradient-to-br from-gray-50 to-purple-50/30 dark:from-gray-900 dark:to-purple-900/30">
                <div className="space-y-4">
                  <div className="text-8xl animate-bounce">😿</div>
                  <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400">No se encontraron productos</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm || categoryFilter !== 'all' 
                      ? 'Prueba ajustando los filtros de búsqueda' 
                      : 'Comienza creando tu primer producto'
                    }
                  </p>
                  {!searchTerm && categoryFilter === 'all' && (
                    <Button 
                      onClick={() => setShowProductForm(true)}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 mt-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Primer Producto
                    </Button>
                  )}
                </div>
              </AnimatedCard>
            )}
          </TabsContent>
          
          <TabsContent value="combos" className="space-y-6 mt-6">
            {/* Filters Section for Combos */}
            <AnimatedCard className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-blue-200/50 dark:border-blue-800/50">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Buscar combos mágicos... ✨"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur border-2 border-blue-200 dark:border-blue-700 focus:border-blue-400 dark:focus:border-blue-500 text-base"
                  />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  {filteredCombos.length} combos encontrados
                </div>
              </div>
            </AnimatedCard>

            {/* Combos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {filteredCombos.map((combo) => {
                const comboPrice = calculateComboPrice(combo);
                const comboCost = calculateComboCost(combo);
                const profitMargin = calculateProfitMargin(comboPrice, comboCost);
                
                return (
                  <AnimatedCard 
                    key={combo.id}
                    className="relative group overflow-hidden bg-gradient-to-br from-white via-white to-blue-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20 border-2 border-blue-200/60 dark:border-blue-700/60 hover:border-blue-400 dark:hover:border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300"
                    hoverEffect
                    glowEffect
                  >
                    {/* Combo Actions */}
                    <div className="absolute top-3 left-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditCombo(combo)}
                        className="h-8 w-8 hover:scale-110 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:bg-blue-50 dark:hover:bg-blue-900/50"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCombo(combo.id)}
                        className="h-8 w-8 hover:scale-110 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:bg-red-50 dark:hover:bg-red-900/50"
                      >
                        <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                      </Button>
                    </div>

                    {/* Combo Icon/Avatar */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border-2 border-white/20">
                        🎁
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">ID</div>
                        <div className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {combo.id.slice(0, 8)}
                        </div>
                      </div>
                    </div>

                    {/* Combo Info */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-bold text-lg leading-tight mb-2 text-gray-900 dark:text-gray-100">{combo.name}</h3>
                        {combo.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                            {combo.description}
                          </p>
                        )}
                      </div>

                      {/* Price Information */}
                      <div className="space-y-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Precio:</span>
                          <div className="text-right">
                            <span className="font-bold text-lg text-green-600 dark:text-green-400">
                              {formatCurrency(comboPrice, 'VES')}
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatCurrency(convertBsToUsd(comboPrice, exchangeRate), 'USD')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Costo:</span>
                          <div className="text-right">
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {formatCurrency(comboCost, 'VES')}
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatCurrency(convertBsToUsd(comboCost, exchangeRate), 'USD')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Descuento:</span>
                          <span className="font-bold text-purple-600 dark:text-purple-400">
                            {combo.discount_percentage}%
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Margen:</span>
                          <div className="flex items-center space-x-2">
                            <span className={`font-bold text-lg ${profitMargin > 30 ? 'text-green-600 dark:text-green-400' : profitMargin > 15 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                              {profitMargin.toFixed(1)}%
                            </span>
                            <div className={`w-2 h-2 rounded-full ${profitMargin > 30 ? 'bg-green-500' : profitMargin > 15 ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`}></div>
                          </div>
                        </div>
                      </div>

                      {/* Combo Items */}
                      <div className="pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex items-center space-x-2 text-sm mb-2">
                          <Box className="w-4 h-4 text-blue-500" />
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Productos incluidos:
                          </span>
                        </div>
                        <div className="space-y-1 max-h-24 overflow-y-auto">
                          {combo.combo_items?.map((item, index) => {
                            const product = products.find(p => p.id === item.product_id);
                            return (
                              <div key={index} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
                                <span className="truncate text-gray-700 dark:text-gray-300">{product?.name || 'Producto'}</span>
                                <span className="ml-2 font-medium text-blue-600 dark:text-blue-400">x{item.quantity}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                );
              })}
            </div>

            {/* Empty State for Combos */}
            {filteredCombos.length === 0 && (
              <AnimatedCard className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-900/30">
                <div className="space-y-4">
                  <div className="text-8xl animate-bounce">🎁</div>
                  <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400">No se encontraron combos</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm 
                      ? 'Prueba ajustando los filtros de búsqueda' 
                      : 'Comienza creando tu primer combo'
                    }
                  </p>
                  {!searchTerm && (
                    <Button 
                      onClick={() => setShowComboForm(true)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 mt-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Primer Combo
                    </Button>
                  )}
                </div>
              </AnimatedCard>
            )}
          </TabsContent>
        </Tabs>

        {/* Floating Action Button */}
        <FloatingActionButton
          onClick={() => activeTab === 'products' ? setShowProductForm(true) : setShowComboForm(true)}
          icon={<Plus className="w-6 h-6" />}
          tooltip={activeTab === 'products' ? "Crear nuevo producto" : "Crear nuevo combo"}
          variant="primary"
        />

        {/* Product Form Dialog */}
        <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center text-2xl">
                <Sparkles className="w-6 h-6 mr-2 text-purple-500" />
                {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
              </DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Modifica los datos del producto' : 'Crea un nuevo producto para tu inventario'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleProductSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del producto</Label>
                  <Input
                    id="name"
                    required
                    value={productFormData.name}
                    onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                    className="h-12"
                    placeholder="Ej: Helado de Fresa Supremo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <SearchableSelect
                    options={categoryOptions}
                    value={productFormData.category_id}
                    // Prevent form submit on category change
                    onValueChange={(value) => {
                      setProductFormData({ ...productFormData, category_id: value });
                    }}
                    placeholder="Seleccionar categoría"
                    allowClear
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cost_price">Precio de costo (Bs.)</Label>
                  <Input
                    id="cost_price"
                    type="number"
                    step="0.01"
                    required
                    value={productFormData.cost_price}
                    onChange={(e) => setProductFormData({ ...productFormData, cost_price: e.target.value })}
                    className="h-12"
                  />
                  {productFormData.cost_price && (
                    <p className="text-xs text-muted-foreground">
                      ≈ {formatCurrency(convertBsToUsd(parseFloat(productFormData.cost_price), exchangeRate), 'USD')}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sale_price">Precio de venta (Bs.)</Label>
                  <Input
                    id="sale_price"
                    type="number"
                    step="0.01"
                    required
                    value={productFormData.sale_price}
                    onChange={(e) => setProductFormData({ ...productFormData, sale_price: e.target.value })}
                    className="h-12"
                  />
                  {productFormData.sale_price && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        ≈ {formatCurrency(convertBsToUsd(parseFloat(productFormData.sale_price), exchangeRate), 'USD')}
                      </p>
                      {productFormData.cost_price && (
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          Margen: {calculateProfitMargin(parseFloat(productFormData.sale_price), parseFloat(productFormData.cost_price)).toFixed(1)}%
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Stock inicial</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    required
                    value={productFormData.stock_quantity}
                    onChange={(e) => setProductFormData({ ...productFormData, stock_quantity: e.target.value })}
                    className="h-12"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="unit">Unidad de medida</Label>
                  <Select value={productFormData.unit} onValueChange={(value) => setProductFormData({ ...productFormData, unit: value })}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unidad">🔢 Unidad</SelectItem>
                      <SelectItem value="gramo">⚖️ Gramo</SelectItem>
                      <SelectItem value="kilogramo">📦 Kilogramo</SelectItem>
                      <SelectItem value="litro">🪣 Litro</SelectItem>
                      <SelectItem value="mililitro">🥤 Mililitro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  value={productFormData.description}
                  onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                  className="min-h-[80px]"
                  placeholder="Describe tu producto increíble..."
                />
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-3">
                <Button type="button" variant="outline" onClick={resetProductForm} className="w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full sm:w-auto"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Guardando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4" />
                      <span>{editingProduct ? 'Actualizar Producto' : 'Crear Producto'}</span>
                    </div>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Combo Form Dialog */}
        <Dialog open={showComboForm} onOpenChange={setShowComboForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center text-2xl">
                <Sparkles className="w-6 h-6 mr-2 text-blue-500" />
                {editingCombo ? 'Editar Combo' : 'Crear Nuevo Combo'}
              </DialogTitle>
              <DialogDescription>
                {editingCombo ? 'Modifica los datos del combo' : 'Crea un nuevo combo con múltiples productos'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleComboSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="combo_name">Nombre del combo</Label>
                  <Input
                    id="combo_name"
                    required
                    value={comboFormData.name}
                    onChange={(e) => setComboFormData({ ...comboFormData, name: e.target.value })}
                    className="h-12"
                    placeholder="Ej: Combo Especial de Verano"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="combo_description">Descripción (opcional)</Label>
                  <Textarea
                    id="combo_description"
                    value={comboFormData.description}
                    onChange={(e) => setComboFormData({ ...comboFormData, description: e.target.value })}
                    className="min-h-[80px]"
                    placeholder="Describe tu combo increíble..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_percentage">Descuento (%)</Label>
                <Input
                  id="discount_percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={comboFormData.discount_percentage}
                  onChange={(e) => setComboFormData({ ...comboFormData, discount_percentage: e.target.value })}
                  className="h-12"
                />
              </div>

              {/* Combo Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center text-lg">
                    <Box className="w-5 h-5 mr-2 text-blue-500" />
                    Productos incluidos en el combo
                  </Label>
                  <Button type="button" onClick={addComboItem} variant="outline" size="sm" className="hover:scale-105 transition-transform">
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar Producto
                  </Button>
                </div>
                
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {comboItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border backdrop-blur">
                      <div className="flex-1">
                        <SearchableSelect
                          options={productOptions}
                          value={item.product_id}
                          onValueChange={(value) => updateComboItem(index, 'product_id', value)}
                          placeholder="Seleccionar producto"
                        />
                      </div>
                      <div className="w-28">
                        <Input
                          type="number"
                          min="1"
                          placeholder="Cantidad"
                          value={item.quantity}
                          onChange={(e) => updateComboItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="h-10"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeComboItem(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-3">
                <Button type="button" variant="outline" onClick={resetComboForm} className="w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Guardando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4" />
                      <span>{editingCombo ? 'Actualizar Combo' : 'Crear Combo'}</span>
                    </div>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Category Form Dialog */}
        <Dialog open={showCategoryForm} onOpenChange={setShowCategoryForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center text-2xl">
                <Box className="w-6 h-6 mr-2 text-purple-500" />
                Nueva Categoría
              </DialogTitle>
              <DialogDescription>
                Agrega una nueva categoría para organizar tus productos
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCategorySubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="category_name">Nombre de la categoría</Label>
                <Input
                  id="category_name"
                  required
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  placeholder="Ej: Helados, Bebidas, Postres..."
                  className="h-12"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetCategoryForm}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {loading ? 'Creando...' : 'Crear Categoría'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};