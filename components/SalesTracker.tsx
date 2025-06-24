import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './ThemeContext'; // Asegúrate que la ruta sea correcta
import { Header } from './Header'; // Asegúrate que la ruta sea correcta
import { ExchangeRateCard } from './ExchangeRateCard'; // Asegúrate que la ruta sea correcta
import { SalesForm } from './SalesForm'; // Asegúrate que la ruta sea correcta
import { BalanceCard } from './BalanceCard'; // Asegúrate que la ruta sea correcta
import { SalesHistory } from './SalesHistory'; // Asegúrate que la ruta sea correcta
import { MessageDisplay } from './MessageDisplay'; // Asegúrate que la ruta sea correcta
import { LoadingScreen } from './LoadingScreen'; // Asegúrate que laruta sea correcta
import { getDefaultUserId } from '../../lib/supabaseClient'; // Asegúrate que la ruta sea correcta
import { 
  fetchBCVRateAction, 
  ensureBalanceRecordAction,
  getSalesDatesAction, 
  getRecordsForDateAction, 
  saveSaleRecordAction,
  deleteSaleRecordAction,
  updateSaleRecordAction,
  formatCurrency,
  formatDate,
  type SaleRecordWithId,
  type SaleRecordInput
} from '../../lib/actions'; // Asegúrate que la ruta sea correcta
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'; // Para el modal

interface ExchangeRateInfo {
  rate: number;
  lastUpdate: string;
  isError: boolean;
  errorMessage?: string; // Añadido en la mejora de ExchangeRateCard
}

// Asumimos que este es el ID de usuario para la demo o una app de un solo usuario
const FIXED_USER_ID = getDefaultUserId(); 

export const SalesTracker: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false); // Para renderizado condicional de componentes de cliente

  // Estados del formulario de ventas
  const [date, setDate] = useState(formatDate(new Date(), 'yyyy-mm-dd'));
  const [usdReceived, setUsdReceived] = useState('');
  const [efectivoBs, setEfectivoBs] = useState('');
  const [tarjetaBs, setTarjetaBs] = useState('');
  const [pagoMovilBs, setPagoMovilBs] = useState('');
  const [gastoBs, setGastoBs] = useState('');

  // Estados calculados para el formulario
  const [divisasInBs, setDivisasInBs] = useState(0);
  const [totalVentasBs, setTotalVentasBs] = useState(0);

  // Estados de información global y saldos
  const [exchangeRateInfo, setExchangeRateInfo] = useState<ExchangeRateInfo>({ 
    rate: 36.50, // Tasa de respaldo inicial
    lastUpdate: 'Inicializando...', 
    isError: false,
    errorMessage: ''
  });
  const [currentUsdBalance, setCurrentUsdBalance] = useState(0);
  const [currentBsBalance, setCurrentBsBalance] = useState(0);

  // Estados del historial de ventas
  const [salesHistoryDates, setSalesHistoryDates] = useState<string[]>([]);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState('');
  const [recordsForSelectedDate, setRecordsForSelectedDate] = useState<SaleRecordWithId[]>([]);
  
  // Estados de Carga y Mensajes
  const [isAppLoading, setIsAppLoading] = useState(true); // Para la pantalla de carga inicial
  const [isHistoryLoading, setIsHistoryLoading] = useState(false); // Para carga de registros del historial
  const [isSaving, setIsSaving] = useState(false); // Para guardado/actualización de registros
  const [message, setMessage] = useState<{type: string, text: string, title?: string} | null>(null);

  // Estado para modo edición
  const [editingRecord, setEditingRecord] = useState<SaleRecordWithId | null>(null);

  // Estado para confirmación de eliminación
  const [recordToDelete, setRecordToDelete] = useState<SaleRecordWithId | null>(null);

  // --- INICIALIZACIÓN DE LA APP ---
  useEffect(() => {
    setIsClient(true); // Marcar que estamos en el cliente para componentes como PDFDownloadLink
    setUserId(FIXED_USER_ID);

    const initializeApp = async () => {
      if (!FIXED_USER_ID) {
        setMessage({type: 'error', title: 'Error de Configuración', text: 'User ID por defecto no configurado. La aplicación no puede iniciarse.'});
        setIsAppLoading(false);
        return;
      }
      
      // No es necesario setIsLoading(true) aquí si usamos isAppLoading
      // fetchBCVRateAction().then(rateInfo => { ... }); // Esta promesa se resolverá, pero no bloquearemos el resto
      
      try {
        // Obtener tasa BCV en paralelo sin bloquear
        fetchBCVRateAction().then(rateInfo => {
          setExchangeRateInfo(rateInfo);
          if (rateInfo.isError) {
            setMessage({type: 'warning', title:'Aviso Tasa BCV', text: rateInfo.errorMessage || 'No se pudo obtener la tasa BCV actualizada. Se usará una tasa de respaldo.'});
          }
        });

        const balances = await ensureBalanceRecordAction(FIXED_USER_ID);
        setCurrentUsdBalance(balances.usd_balance);
        setCurrentBsBalance(balances.bs_balance);

        const dates = await getSalesDatesAction(FIXED_USER_ID);
        setSalesHistoryDates(dates);
        if (dates.length > 0 && !selectedHistoryDate) {
          setSelectedHistoryDate(dates[0]); // Seleccionar la fecha más reciente por defecto
        }
      } catch (error: any) {
        console.error("Error initializing app data:", error);
        setMessage({type: 'error', title: 'Error de Inicialización', text: `No se pudieron cargar los datos iniciales: ${error.message}`});
      } finally {
        setIsAppLoading(false);
      }
    };
    initializeApp();
  }, []); // Solo se ejecuta una vez al montar

  // --- CARGAR REGISTROS CUANDO CAMBIA LA FECHA SELECCIONADA EN EL HISTORIAL ---
  useEffect(() => {
    if (userId && selectedHistoryDate && !isAppLoading) { // Evitar cargar si la app aún está inicializando
      setIsHistoryLoading(true);
      getRecordsForDateAction(userId, selectedHistoryDate)
        .then(data => {
          setRecordsForSelectedDate(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        })
        .catch(error => {
          console.error("Error fetching records for date:", error);
          setMessage({type: 'error', title: 'Error de Carga', text: 'No se pudieron cargar los registros para la fecha seleccionada.'});
        })
        .finally(() => setIsHistoryLoading(false));
    } else if (!selectedHistoryDate) {
        setRecordsForSelectedDate([]); // Limpiar registros si no hay fecha seleccionada
    }
  }, [userId, selectedHistoryDate, isAppLoading]);

  // --- RELLENAR FORMULARIO CUANDO SE ENTRA EN MODO EDICIÓN ---
  useEffect(() => {
    if (editingRecord) {
      setUsdReceived(String(editingRecord.usd_received));
      setEfectivoBs(String(editingRecord.efectivo_bs));
      setTarjetaBs(String(editingRecord.tarjeta_bs));
      setPagoMovilBs(String(editingRecord.pago_movil_bs));
      setGastoBs(String(editingRecord.gasto_bs));
      setDate(editingRecord.date); // La fecha del registro que se está editando
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll al inicio para ver el form
    }
  }, [editingRecord]);

  // --- CÁLCULOS AUTOMÁTICOS DEL FORMULARIO ---
  useEffect(() => {
    const usd = parseFloat(usdReceived) || 0;
    const rate = parseFloat(String(exchangeRateInfo.rate)) || 0;
    const currentDivisasInBs = usd * rate;
    setDivisasInBs(currentDivisasInBs);

    const efectivo = parseFloat(efectivoBs) || 0;
    const tarjeta = parseFloat(tarjetaBs) || 0;
    const pagoMovil = parseFloat(pagoMovilBs) || 0;
    setTotalVentasBs(efectivo + tarjeta + pagoMovil + currentDivisasInBs);
  }, [usdReceived, efectivoBs, tarjetaBs, pagoMovilBs, exchangeRateInfo.rate]);

  // --- FUNCIONES HELPER ---
  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);
  
  const showTempMessage = useCallback((type: string, text: string, title?: string, duration = 5000) => {
    setMessage({ type, text, title });
    setTimeout(clearMessage, duration);
  }, [clearMessage]);

  const resetForm = useCallback(() => {
    setUsdReceived('');
    setEfectivoBs('');
    setTarjetaBs('');
    setPagoMovilBs('');
    setGastoBs('');
    setDate(formatDate(new Date(), 'yyyy-mm-dd')); // Resetear a fecha actual
    setEditingRecord(null);
  }, []);

  // --- MANEJADORES DE EVENTOS (GUARDAR, EDITAR, ELIMINAR) ---
  const handleSaveRecord = async () => {
    if (!userId) {
      showTempMessage('error', 'User ID no disponible. No se puede guardar.', 'Error de Usuario');
      return;
    }
    if (isSaving) return;
    setIsSaving(true);
    clearMessage();

    const recordDate = date;
    if (!recordDate || !new Date(recordDate+'T00:00:00').getTime()) { // Asegurar que la fecha sea parseable
      showTempMessage('error', 'La fecha proporcionada no es válida.', 'Fecha Inválida');
      setIsSaving(false);
      return;
    }
    
    const recordData: SaleRecordInput = { /* ... (igual que antes, asegúrate que los parseFloat estén bien) ... */ 
        user_id: userId,
        date: recordDate,
        exchange_rate: exchangeRateInfo.rate,
        usd_received: parseFloat(usdReceived) || 0,
        efectivo_bs: parseFloat(efectivoBs) || 0,
        tarjeta_bs: parseFloat(tarjetaBs) || 0,
        pago_movil_bs: parseFloat(pagoMovilBs) || 0,
        gasto_bs: parseFloat(gastoBs) || 0,
        calculated_divisas_bs: divisasInBs, // Ya calculado en useEffect
        total_ventas_bs: totalVentasBs, // Ya calculado en useEffect
    };

    try {
      if (editingRecord) {
        const { updatedRecord, newBalances } = await updateSaleRecordAction(
          editingRecord.id, recordData,
          { usd_balance: currentUsdBalance, bs_balance: currentBsBalance },
          { oldUsdReceived: editingRecord.usd_received, oldTotalVentasBs: editingRecord.total_ventas_bs, oldGastoBs: editingRecord.gasto_bs }
        );
        setCurrentUsdBalance(newBalances.usd_balance);
        setCurrentBsBalance(newBalances.bs_balance);
        showTempMessage('success', 'El registro ha sido actualizado exitosamente.', 'Registro Actualizado');
        
        if (selectedHistoryDate === recordDate) {
          setRecordsForSelectedDate(prev => 
            prev.map(rec => rec.id === updatedRecord.id ? updatedRecord : rec)
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          );
        } else {
          const dates = await getSalesDatesAction(userId);
          setSalesHistoryDates(dates.sort((a,b) => new Date(b).getTime() - new Date(a).getTime()));
          setSelectedHistoryDate(recordDate); // Cambiar a la nueva fecha del registro editado
        }
      } else {
        const { newRecord, newBalances } = await saveSaleRecordAction(
          recordData, { usd_balance: currentUsdBalance, bs_balance: currentBsBalance }
        );
        setCurrentUsdBalance(newBalances.usd_balance);
        setCurrentBsBalance(newBalances.bs_balance);
        showTempMessage('success', 'El registro ha sido guardado exitosamente.', 'Registro Guardado');
        
        const newSortedDates = Array.from(new Set([recordDate, ...salesHistoryDates]))
                                 .sort((a,b) => new Date(b).getTime() - new Date(a).getTime());
        setSalesHistoryDates(newSortedDates);
        
        if (selectedHistoryDate === recordDate) {
            setRecordsForSelectedDate(prev => [newRecord, ...prev].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        } else {
            setSelectedHistoryDate(recordDate); // Cambiar a la fecha del nuevo registro
        }
      }
      resetForm();
    } catch (error: any) {
      console.error("Error saving/updating record:", error);
      showTempMessage('error', `Error al procesar el registro: ${error.message}`, 'Error de Guardado');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditRecord = (record: SaleRecordWithId) => {
    setEditingRecord(record);
  };

  const handleDeleteConfirm = (record: SaleRecordWithId) => {
    setRecordToDelete(record);
  };

  const handleDeleteRecord = async () => {
    if (!recordToDelete || !userId) return;
    
    // Usar isSaving para el botón de eliminar también, o un nuevo estado si se prefiere
    setIsSaving(true); 
    clearMessage();
    
    try {
      const { newBalances } = await deleteSaleRecordAction(
        recordToDelete.id, userId,
        { usd_balance: currentUsdBalance, bs_balance: currentBsBalance },
        { usdReceived: recordToDelete.usd_received, totalVentasBs: recordToDelete.total_ventas_bs, gastoBs: recordToDelete.gasto_bs }
      );
      setCurrentUsdBalance(newBalances.usd_balance);
      setCurrentBsBalance(newBalances.bs_balance);
      
      const updatedRecords = recordsForSelectedDate.filter(rec => rec.id !== recordToDelete.id);
      setRecordsForSelectedDate(updatedRecords);
      
      if (updatedRecords.length === 0 && selectedHistoryDate === recordToDelete.date) {
        const dates = await getSalesDatesAction(userId);
        const newSortedDates = dates.sort((a,b) => new Date(b).getTime() - new Date(a).getTime());
        setSalesHistoryDates(newSortedDates);
        setSelectedHistoryDate(newSortedDates.length > 0 ? newSortedDates[0] : '');
      }
      showTempMessage('success', 'El registro ha sido eliminado.', 'Registro Eliminado');
    } catch (error: any) {
      console.error("Error deleting record:", error);
      showTempMessage('error', `Error al eliminar el registro: ${error.message}`, 'Error de Eliminación');
    } finally {
      setRecordToDelete(null);
      setIsSaving(false);
    }
  };

  const cancelDelete = () => setRecordToDelete(null);
  const cancelEdit = () => resetForm();

  // --- RENDERIZADO DEL COMPONENTE ---
  if (isAppLoading) { 
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider> {/* Asegúrate que ThemeProvider envuelva tu app */}
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-2 sm:p-4 lg:p-6 font-sans transition-colors duration-300">
        <div className="container mx-auto max-w-7xl"> {/* Ancho máximo aumentado */}
          
          <Header userId={userId} storeName="Anaco Cachatina" mainTitle="Gestor de Ventas"/> {/* Usando props opcionales */}
          
          {/* Contenedor para mensajes, posicionado para que no empuje el layout o como toast */}
          <div className="my-4 h-20"> {/* Espacio reservado para el mensaje o usar posicionamiento fixed para MessageDisplay */}
            {message && <MessageDisplay message={message} onClose={clearMessage} />}
          </div>

          {/* Sección de Tarjetas de Información Superior */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <ExchangeRateCard exchangeRateInfo={exchangeRateInfo} />
            <BalanceCard 
              currentUsdBalance={currentUsdBalance}
              currentBsBalance={currentBsBalance}
              className="h-full"
            />
          </div>
          
          {/* Layout Principal de Dos Columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
            {/* Columna Izquierda: Formulario (ocupa más espacio) */}
            <div className="lg:col-span-3">
              <SalesForm 
                date={date} setDate={setDate}
                usdReceived={usdReceived} setUsdReceived={setUsdReceived}
                efectivoBs={efectivoBs} setEfectivoBs={setEfectivoBs}
                tarjetaBs={tarjetaBs} setTarjetaBs={setTarjetaBs}
                pagoMovilBs={pagoMovilBs} setPagoMovilBs={setPagoMovilBs}
                gastoBs={gastoBs} setGastoBs={setGastoBs}
                divisasInBs={divisasInBs} totalVentasBs={totalVentasBs}
                isSaving={isSaving}
                isEditing={!!editingRecord}
                userId={userId}
                handleSaveRecord={handleSaveRecord}
                cancelEdit={cancelEdit}
              />
            </div>

            {/* Columna Derecha: Historial (ocupa menos espacio) */}
            <div className="lg:col-span-2">
              <SalesHistory 
                userId={userId}
                isClient={isClient}
                // isLoading={isHistoryLoading} // Pasar el estado de carga específico del historial
                // Los props de SalesHistory fueron modificados para tener isLoadingInitialDates e isLoadingRecords
                // Adaptar esto o el SalesHistory. Por ahora, usaré un solo 'isLoading' para ambos para simplicidad del ejemplo.
                isLoadingInitialDates={isAppLoading} // Podría ser un estado diferente si las fechas se cargan después
                isLoadingRecords={isHistoryLoading}
                salesHistoryDates={salesHistoryDates}
                selectedHistoryDate={selectedHistoryDate}
                setSelectedHistoryDate={setSelectedHistoryDate}
                recordsForSelectedDate={recordsForSelectedDate}
                exchangeRateInfo={exchangeRateInfo} // SalesHistory necesita esto para el PDF
                onEditRecord={handleEditRecord}
                onDeleteRecord={handleDeleteConfirm} // Pasa la función que abre el modal
                storeName="Anaco Cachatina" // Pasa el nombre de la tienda para el PDF
              />
            </div>
          </div>
        </div>
        
        {/* Modal de Confirmación de Eliminación (Mejorado) */}
        {recordToDelete && (
          <div className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <div 
                className="bg-white dark:bg-slate-800 rounded-xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-700 transform transition-all duration-300 scale-95 opacity-0 animate-modalEnter"
                style={{animationFillMode: 'forwards'}} // Mantener estado final de la animación
            >
              <div className="flex items-start">
                <div className="mr-4 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 sm:h-10 sm:w-10">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1" id="modal-title">
                    Confirmar Eliminación
                  </h3>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    <p>
                      ¿Estás seguro que deseas eliminar este registro de venta del día <span className="font-semibold">{formatDate(recordToDelete.date)}</span>?
                    </p>
                    <p className="mt-2">
                      Monto Total: <span className="font-semibold">{formatCurrency(recordToDelete.total_ventas_bs, 'VES')}</span>.
                    </p>
                    <p className="mt-3 text-xs text-red-500 dark:text-red-400">
                      Esta acción es irreversible y no se podrá deshacer.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-2 sm:space-y-0 space-y-reverse">
                <button
                  type="button"
                  onClick={cancelDelete}
                  disabled={isSaving}
                  className="w-full sm:w-auto inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 px-4 py-2 bg-white dark:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 disabled:opacity-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteRecord}
                  disabled={isSaving}
                  className="w-full sm:w-auto inline-flex justify-center items-center rounded-md border border-transparent px-4 py-2 bg-red-600 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-slate-800 disabled:bg-red-300 dark:disabled:bg-red-800 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  Eliminar Definitivamente
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Estilos para la animación del modal (pueden ir en un CSS global) */}
        <style jsx global>{`
            @keyframes modalEnter {
                0% { transform: scale(0.95); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
            .animate-modalEnter {
                animation: modalEnter 0.3s ease-out forwards;
            }
        `}</style>
      </div>
    </ThemeProvider>
  );
};