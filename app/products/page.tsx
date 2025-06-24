import React from 'react';
import { ProductManagerClient } from '../../components/ProductManagerClient';
import { getProducts, getCategories, fetchExchangeRate } from '../../lib/api';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  try {
    const [products, categories, exchangeRateInfo] = await Promise.all([
      getProducts(),
      getCategories(),
      fetchExchangeRate()
    ]);

    return (
      <ProductManagerClient 
        initialProducts={products}
        initialCategories={categories}
        initialExchangeRate={exchangeRateInfo.rate}
      />
    );
  } catch (error) {
    console.error('Error loading products page:', error);
    
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-6xl">😿</div>
          <h2 className="text-2xl font-bold text-muted-foreground">
            Error al cargar productos
          </h2>
          <p className="text-muted-foreground">
            Por favor, recarga la página o contacta al soporte.
          </p>
        </div>
      </div>
    );
  }
}