import React from 'react';
import { TrendingUp, DollarSign, Banknote } from 'lucide-react'; // Banknote para Bolívares
import { formatCurrency } from '../../lib/actions';

interface BalanceCardProps {
  currentUsdBalance: number;
  currentBsBalance: number;
  title?: string; // Título personalizable
  className?: string; // Para clases adicionales
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  currentUsdBalance,
  currentBsBalance,
  title = "Saldos Actuales", // Título por defecto, más genérico que "acumulado"
  className = "",
}) => {
  // Componente interno para mostrar cada saldo individualmente
  const SingleBalanceDisplay: React.FC<{
    label: string;
    amount: number;
    currencyCode: 'USD' | 'VES';
    Icon: React.ElementType; // Para pasar DollarSign o Banknote
    iconColorClass: string;
  }> = ({ label, amount, currencyCode, Icon, iconColorClass }) => (
    <div className="bg-slate-100/70 dark:bg-slate-800/50 p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">
        <Icon size={16} className={`mr-2 flex-shrink-0 ${iconColorClass}`} />
        {label}
      </div>
      <p className="font-bold text-xl sm:text-2xl text-slate-800 dark:text-slate-50 text-right truncate">
        {formatCurrency(amount, currencyCode)}
      </p>
    </div>
  );

  return (
    <section
      className={`p-4 sm:p-5 rounded-xl shadow-xl 
                  bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 
                  dark:from-slate-800 dark:via-emerald-900/30 dark:to-slate-800 
                  border border-green-200/80 dark:border-emerald-700/50 
                  transition-colors duration-300 ${className}`}
    >
      {/* Encabezado de la Tarjeta */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2.5 border-b border-green-200 dark:border-emerald-700/60">
        <h2 className="text-base sm:text-lg font-semibold text-green-700 dark:text-emerald-400 flex items-center">
          <TrendingUp size={20} className="mr-2.5 flex-shrink-0" /> {/* Icono un poco más grande */}
          {title}
        </h2>
        {/* Podrías añadir un timestamp de "Actualizado a las X" aquí si es relevante */}
      </div>

      {/* Contenedor de los Saldos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <SingleBalanceDisplay
          label="Divisas Disponibles ($)"
          amount={currentUsdBalance}
          currencyCode="USD"
          Icon={DollarSign}
          iconColorClass="text-green-600 dark:text-green-500"
        />
        <SingleBalanceDisplay
          label="Bolívares Disponibles (Bs.)"
          amount={currentBsBalance}
          currencyCode="VES"
          Icon={Banknote}
          iconColorClass="text-sky-600 dark:text-sky-500" // Color diferente para Bs.
        />
      </div>
    </section>
  );
};