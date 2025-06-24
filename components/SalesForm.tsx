import React from 'react';
import { 
  CalendarDays, 
  DollarSign, 
  Landmark, 
  CreditCard, 
  Smartphone, 
  ShoppingCart, 
  BarChart3, 
  CheckCircle, 
  X} from 'lucide-react';
import { InputField } from './InputField';
import { SummaryCard } from './SummaryCard';

interface SalesFormProps {
    date: string;
    setDate: (date: string) => void;
    usdReceived: string;
    setUsdReceived: (value: string) => void;
    efectivoBs: string;
    setEfectivoBs: (value: string) => void;
    tarjetaBs: string;
    setTarjetaBs: (value: string) => void;
    pagoMovilBs: string;
    setPagoMovilBs: (value: string) => void;
    gastoBs: string;
    setGastoBs: (value: string) => void;
    divisasInBs: number;
    totalVentasBs: number;
    isSaving: boolean;
    isEditing: boolean;
    userId: string | null;
    handleSaveRecord: () => void;
    cancelEdit: () => void;
}

export const SalesForm: React.FC<SalesFormProps> = ({
    date,
    setDate,
    usdReceived,
    setUsdReceived,
    efectivoBs,
    setEfectivoBs,
    tarjetaBs,
    setTarjetaBs,
    pagoMovilBs,
    setPagoMovilBs,
    gastoBs,
    setGastoBs,
    divisasInBs,
    totalVentasBs,
    isSaving,
    isEditing,
    userId,
    handleSaveRecord,
    cancelEdit
}) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 max-w-3xl mx-auto transition-all duration-300 hover:shadow-xl">
            <header className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
                    {isEditing ? (
                        <>
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 p-1 rounded mr-2">
                                <CheckCircle size={20} />
                            </span>
                            Editar Registro de Ventas
                        </>
                    ) : (
                        <>
                            <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 p-1 rounded mr-2">
                                <BarChart3 size={20} />
                            </span>
                            Registro Diario de Ventas
                        </>
                    )}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Ingrese los datos de ventas del día para mantener un registro preciso
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <InputField
                        id="date"
                        label="Fecha"
                        type="date"
                        icon={<CalendarDays size={18} />}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                    
                    <InputField
                        id="usdReceived"
                        label="Divisas Recibidas ($)"
                        type="number"
                        step="0.01"
                        placeholder="Ingrese el monto en dólares"
                        icon={<DollarSign size={18} />}
                        value={usdReceived}
                        onChange={(e) => setUsdReceived(e.target.value)}
                        highlight
                    />
                    
                    <InputField
                        id="gastoBs"
                        label="Gasto (Bs.)"
                        type="number"
                        step="0.01"
                        placeholder="Ingrese el monto de gastos"
                        icon={<ShoppingCart size={18} />}
                        value={gastoBs}
                        onChange={(e) => setGastoBs(e.target.value)}
                        accent="amber"
                    />
                </div>
                
                <div className="space-y-6">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg mb-2">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                            Métodos de Pago en Bolívares
                        </h3>
                        
                        <div className="space-y-4">
                            <InputField
                                id="efectivoBs"
                                label="Efectivo (Bs.)"
                                type="number"
                                step="0.01"
                                placeholder="Ingrese el monto"
                                icon={<Landmark size={18} />}
                                value={efectivoBs}
                                onChange={(e) => setEfectivoBs(e.target.value)}
                                compact
                            />
                            
                            <InputField
                                id="tarjetaBs"
                                label="Tarjeta (Bs.)"
                                type="number"
                                step="0.01"
                                placeholder="Ingrese el monto"
                                icon={<CreditCard size={18} />}
                                value={tarjetaBs}
                                onChange={(e) => setTarjetaBs(e.target.value)}
                                compact
                            />
                            
                            <InputField
                                id="pagoMovilBs"
                                label="Pago Móvil (Bs.)"
                                type="number"
                                step="0.01"
                                placeholder="Ingrese el monto"
                                icon={<Smartphone size={18} />}
                                value={pagoMovilBs}
                                onChange={(e) => setPagoMovilBs(e.target.value)}
                                compact
                            />
                        </div>
                    </div>
                </div>
            </div>

            <SummaryCard divisasInBs={divisasInBs} totalVentasBs={totalVentasBs} />

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                    onClick={handleSaveRecord}
                    disabled={isSaving || !userId}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
                              disabled:from-blue-400 disabled:to-blue-500 dark:disabled:from-blue-800 dark:disabled:to-blue-900 
                              text-white font-bold py-3 px-6 rounded-lg shadow-md disabled:opacity-60 
                              flex items-center justify-center transition-all duration-300 transform hover:translate-y-[-1px]"
                >
                    {isSaving ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-r-2 border-white mr-2"></div>
                    ) : (
                        <CheckCircle size={20} className="mr-2 transition-transform duration-300 group-hover:scale-110" />
                    )}
                    {isSaving ? 'Guardando...' : isEditing ? 'Actualizar Registro' : 'Guardar Registro'}
                </button>

                {isEditing && (
                    <button
                        onClick={cancelEdit}
                        className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 
                                  text-slate-800 dark:text-white font-medium py-3 px-6 rounded-lg shadow 
                                  flex items-center justify-center transition-all duration-300"
                    >
                        <X size={18} className="mr-2" /> Cancelar
                    </button>
                )}
            </div>

            {!userId && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                        <X size={16} className="mr-2" /> ID de tienda no configurado. No se pueden guardar los datos.
                    </p>
                </div>
            )}
        </div>
    );
};