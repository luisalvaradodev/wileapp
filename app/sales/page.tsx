import React from 'react';
import { SalesManagerClient } from '../../components/SalesManagerClient';
import { getProducts, getSalesHistory, fetchExchangeRate } from '../../lib/api';
import { getDefaultUserId } from '../../lib/supabase';

export default async function SalesPage() {
  try {
    const userId = getDefaultUserId();
    const [products, salesHistory, exchangeRateInfo] = await Promise.all([
      getProducts(),
      getSalesHistory(userId),
      fetchExchangeRate()
    ]);

    return (
      <SalesManagerClient 
        initialProducts={products}
        initialSalesHistory={salesHistory}
        initialExchangeRate={exchangeRateInfo.rate}
      />
    );
  } catch (error) {
    console.error('Error loading sales page:', error);
    
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-6xl">😿</div>
          <h2 className="text-2xl font-bold text-muted-foreground">
            Error al cargar ventas
          </h2>
          <p className="text-muted-foreground">
            Por favor, recarga la página o contacta al soporte.
          </p>
        </div>
      </div>
    );
  }
}