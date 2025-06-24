import React from 'react';
import { DashboardClient } from '../../components/DashboardClient';
import { getDashboardStats, getSalesHistory, fetchExchangeRate } from '../../lib/api';
import { getDefaultUserId } from '../../lib/supabase';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  try {
    const userId = getDefaultUserId();
    const [stats, salesHistory, exchangeRateInfo] = await Promise.all([
      getDashboardStats(userId),
      getSalesHistory(userId),
      fetchExchangeRate()
    ]);

    return (
      <DashboardClient 
        initialStats={stats}
        initialSalesHistory={salesHistory}
        initialExchangeRate={exchangeRateInfo.rate}
      />
    );
  } catch (error) {
    console.error('Error loading dashboard:', error);
    
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-6xl">😿</div>
          <h2 className="text-2xl font-bold text-muted-foreground">
            Error al cargar el dashboard
          </h2>
          <p className="text-muted-foreground">
            Por favor, recarga la página o contacta al soporte.
          </p>
        </div>
      </div>
    );
  }
}