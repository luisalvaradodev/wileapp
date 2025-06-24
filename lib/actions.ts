import { supabase } from './supabaseClient'; 

// --- Tipos ---
export interface SaleRecordInput {
  date: string;
  exchange_rate: number;
  usd_received: number;
  efectivo_bs: number;
  tarjeta_bs: number;
  pago_movil_bs: number;
  gasto_bs: number;
  calculated_divisas_bs: number;
  total_ventas_bs: number;
  user_id: string;
}

export interface SaleRecordWithId extends SaleRecordInput {
  id: string;
  created_at: string;
}

export interface BalanceData {
  user_id: string;
  usd_balance: number;
  bs_balance: number;
  last_updated?: string;
}

// --- Constantes ---
const FALLBACK_RATE = 36.42;
const PYDOLARVE_API_URL = "https://pydolarve.org/api/v1/dollar?page=alcambio&format_date=default&rounded_price=false";

// --- Funciones Auxiliares (Formato, etc.) ---
export function formatCurrency(amount: number, currency = 'USD', locale = 'es-VE'): string {
  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) return currency === 'USD' ? '$ 0.00' : '0,00 Bs.';
  if (currency === 'USD') {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numericAmount);
  } else {
    return new Intl.NumberFormat(locale, { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numericAmount) + ' Bs.';
  }
}

export function formatDate(dateStringOrObject: string | Date | null | undefined, format = 'dd/mm/yy'): string {
  if (!dateStringOrObject) return '';
  let dateObj: Date;
  if (typeof dateStringOrObject === 'string') {
    dateObj = new Date(dateStringOrObject.includes('T') ? dateStringOrObject : dateStringOrObject + 'T00:00:00');
  } else if (dateStringOrObject instanceof Date) {
    dateObj = dateStringOrObject;
  } else {
    return 'Fecha inválida';
  }

  if (isNaN(dateObj.getTime())) return 'Fecha inválida';

  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear().toString();

  if (format === 'dd/mm/yy') return `${day}/${month}/${year.slice(-2)}`;
  if (format === 'yyyy-mm-dd') return `${year}-${month}-${day}`;
  return dateObj.toLocaleDateString(navigator.language || 'es-VE');
}


// --- Acciones de la Aplicación ---

export async function fetchBCVRateAction(): Promise<{
    errorMessage: string; rate: number; lastUpdate: string; isError: boolean 
}> {
  try {
    console.log("Fetching BCV exchange rate from pydolarve.org (action)...");
    const response = await fetch(PYDOLARVE_API_URL);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API response not OK (action):", response.status, errorText);
      throw new Error(`Failed to fetch BCV rate from pydolarve.org. Status: ${response.status}`);
    }
    const data = await response.json();
    
    if (data && data.monitors && data.monitors.bcv && data.monitors.bcv.price) {
      const bcvRate = parseFloat(data.monitors.bcv.price);
      const lastUpdate = data.monitors.bcv.last_update || new Date().toISOString();
      return { errorMessage: '', rate: bcvRate, lastUpdate: lastUpdate, isError: false };
    } else {
      console.error("Unexpected API response structure from pydolarve.org (action):", data);
      throw new Error("Unexpected API response structure from pydolarve.org.");
    }
  } catch (error) {
    console.error("Error fetching BCV rate from pydolarve.org (action):", error);
    return { errorMessage: (error instanceof Error ? error.message : "Error desconocido al obtener la tasa BCV"), rate: FALLBACK_RATE, lastUpdate: "No disponible (usando tasa de respaldo)", isError: true };
  }
}

export async function getBalancesAction(userId: string): Promise<{ usd_balance: number; bs_balance: number } | null> {
  if (!userId) {
    console.error("User ID is required to fetch balances.");
    return null;
  }
  const { data, error } = await supabase
    .from('balances')
    .select('usd_balance, bs_balance')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching balances (action):', error);
    throw error;
  }
  return data ? { usd_balance: data.usd_balance || 0, bs_balance: data.bs_balance || 0 } : null;
}

export async function ensureBalanceRecordAction(userId: string): Promise<{ usd_balance: number; bs_balance: number }> {
    let balanceData = await getBalancesAction(userId);
    if (balanceData === null) {
        console.log("No balance record found for user, creating initial one (action).");
        const { data: newBalance, error: insertError } = await supabase
            .from('balances')
            .insert({ user_id: userId, usd_balance: 0, bs_balance: 0 })
            .select('usd_balance, bs_balance')
            .single();
        if (insertError) {
            console.error("Error creating initial balance (action):", insertError);
            throw insertError;
        }
        if (!newBalance) throw new Error("Failed to create or retrieve new balance.");
        balanceData = { usd_balance: newBalance.usd_balance, bs_balance: newBalance.bs_balance };
    }
    return balanceData;
}


export async function getSalesDatesAction(userId: string): Promise<string[]> {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('sales_records')
    .select('date')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching sales dates (action):', error);
    return [];
  }
  if (!data) return [];
  const uniqueDates = [...new Set(data.map(item => item.date as string))].sort((a,b) => new Date(b).getTime() - new Date(a).getTime());
  return uniqueDates;
}

export async function getRecordsForDateAction(userId: string, date: string): Promise<SaleRecordWithId[]> {
  if (!userId || !date) return [];
  const { data, error } = await supabase
    .from('sales_records')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching records for date ${date} (action):`, error);
    return [];
  }
  return (data as SaleRecordWithId[]) || [];
}

export async function saveSaleRecordAction(
  record: SaleRecordInput,
  currentBalances: { usd_balance: number; bs_balance: number }
): Promise<{newRecord: SaleRecordWithId, newBalances: {usd_balance: number, bs_balance: number}}> {
  const { data: insertedRecord, error: recordError } = await supabase
    .from('sales_records')
    .insert(record)
    .select()
    .single();

  if (recordError) {
    console.error("Error inserting sale record (action):", recordError);
    throw recordError;
  }
  if (!insertedRecord) throw new Error("Failed to insert sale record or retrieve it.");

  const newUsdBalance = currentBalances.usd_balance + record.usd_received;
  const newBsBalance = currentBalances.bs_balance + record.total_ventas_bs - record.gasto_bs;

  const { error: balanceError } = await supabase
    .from('balances')
    .update({ usd_balance: newUsdBalance, bs_balance: newBsBalance, last_updated: new Date().toISOString() })
    .eq('user_id', record.user_id);

  if (balanceError) {
    console.error("Error updating balances (action):", balanceError);
    throw balanceError;
  }

  return { 
    newRecord: insertedRecord as SaleRecordWithId, 
    newBalances: { usd_balance: newUsdBalance, bs_balance: newBsBalance }
  };
}

// Función para actualizar un registro existente
export async function updateSaleRecordAction(
  recordId: string,
  newData: SaleRecordInput,
  currentBalances: { usd_balance: number; bs_balance: number },
  oldValues: {
    oldUsdReceived: number;
    oldTotalVentasBs: number;
    oldGastoBs: number;
  }
): Promise<{updatedRecord: SaleRecordWithId, newBalances: {usd_balance: number, bs_balance: number}}> {
  // Actualizar el registro
  const { data: updatedRecord, error: updateError } = await supabase
    .from('sales_records')
    .update(newData)
    .eq('id', recordId)
    .select()
    .single();

  if (updateError) {
    console.error("Error updating sale record:", updateError);
    throw updateError;
  }
  
  if (!updatedRecord) {
    throw new Error("Failed to update sale record or retrieve it.");
  }

  // Calcular los nuevos saldos
  // Primero revertimos el efecto del registro anterior
  let adjustedUsdBalance = currentBalances.usd_balance - oldValues.oldUsdReceived;
  let adjustedBsBalance = currentBalances.bs_balance - oldValues.oldTotalVentasBs + oldValues.oldGastoBs;
  
  // Luego agregamos el efecto del registro actualizado
  const newUsdBalance = adjustedUsdBalance + newData.usd_received;
  const newBsBalance = adjustedBsBalance + newData.total_ventas_bs - newData.gasto_bs;

  // Actualizar los saldos
  const { error: balanceError } = await supabase
    .from('balances')
    .update({ 
      usd_balance: newUsdBalance, 
      bs_balance: newBsBalance, 
      last_updated: new Date().toISOString() 
    })
    .eq('user_id', newData.user_id);

  if (balanceError) {
    console.error("Error updating balances after record update:", balanceError);
    throw balanceError;
  }

  return {
    updatedRecord: updatedRecord as SaleRecordWithId,
    newBalances: { usd_balance: newUsdBalance, bs_balance: newBsBalance }
  };
}

// Función para eliminar un registro
export async function deleteSaleRecordAction(
  recordId: string,
  userId: string,
  currentBalances: { usd_balance: number; bs_balance: number },
  recordValues: {
    usdReceived: number;
    totalVentasBs: number;
    gastoBs: number;
  }
): Promise<{ newBalances: {usd_balance: number, bs_balance: number} }> {
  // Eliminar el registro
  const { error: deleteError } = await supabase
    .from('sales_records')
    .delete()
    .eq('id', recordId);

  if (deleteError) {
    console.error("Error deleting sale record:", deleteError);
    throw deleteError;
  }

  // Actualizar los saldos (restar el efecto del registro eliminado)
  const newUsdBalance = currentBalances.usd_balance - recordValues.usdReceived;
  const newBsBalance = currentBalances.bs_balance - recordValues.totalVentasBs + recordValues.gastoBs;

  const { error: balanceError } = await supabase
    .from('balances')
    .update({ 
      usd_balance: newUsdBalance, 
      bs_balance: newBsBalance, 
      last_updated: new Date().toISOString() 
    })
    .eq('user_id', userId);

  if (balanceError) {
    console.error("Error updating balances after record deletion:", balanceError);
    throw balanceError;
  }

  return {
    newBalances: { usd_balance: newUsdBalance, bs_balance: newBsBalance }
  };
}