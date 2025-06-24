import React from 'react';
import { ArrowDownUp } from 'lucide-react';
import { formatCurrency } from '../../lib/actions';

interface ExchangeRateInfo {
  rate: number;
  lastUpdate: string;
  isError: boolean;
}

interface ExchangeRateCardProps {
  exchangeRateInfo: ExchangeRateInfo;
}

export const ExchangeRateCard: React.FC<ExchangeRateCardProps> = ({ exchangeRateInfo }) => {
  return (
    <section className="mb-6 p-4 bg-sky-50 dark:bg-sky-900/30 rounded-lg shadow transition-colors duration-200">
      <h2 className="text-lg font-semibold text-sky-700 dark:text-sky-300 flex items-center mb-2">
        <ArrowDownUp size={20} className="mr-2 text-sky-600 dark:text-sky-400" /> Tasa del Día (BCV)
      </h2>
      <p className={`text-2xl font-bold ${exchangeRateInfo.isError ? 'text-red-500 dark:text-red-400' : 'text-sky-600 dark:text-sky-300'}`}>
        {formatCurrency(exchangeRateInfo.rate, 'VES').replace(' Bs.', '')} Bs. / USD
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Última actualización: {exchangeRateInfo.lastUpdate}
      </p>
    </section>
  );
};