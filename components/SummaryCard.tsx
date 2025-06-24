import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../lib/actions';

interface SummaryCardProps {
    divisasInBs: number;
    totalVentasBs: number;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ divisasInBs, totalVentasBs }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [animateValues, setAnimateValues] = useState(false);
    
    const [displayDivisas, setDisplayDivisas] = useState(0);
    const [displayTotal, setDisplayTotal] = useState(0);
    
    useEffect(() => {
        setIsVisible(true);
        
        const timer = setTimeout(() => {
            setAnimateValues(true);
        }, 300);
        
        return () => clearTimeout(timer);
    }, []);
    
    useEffect(() => {
        if (!animateValues) return;
        
        let startDivisas = 0;
        const divisasInterval = setInterval(() => {
            startDivisas += divisasInBs / 20;
            if (startDivisas >= divisasInBs) {
                setDisplayDivisas(divisasInBs);
                clearInterval(divisasInterval);
            } else {
                setDisplayDivisas(startDivisas);
            }
        }, 25);
        
        let startTotal = 0;
        const totalInterval = setInterval(() => {
            startTotal += totalVentasBs / 20;
            if (startTotal >= totalVentasBs) {
                setDisplayTotal(totalVentasBs);
                clearInterval(totalInterval);
            } else {
                setDisplayTotal(startTotal);
            }
        }, 25);
        
        return () => {
            clearInterval(divisasInterval);
            clearInterval(totalInterval);
        };
    }, [divisasInBs, totalVentasBs, animateValues]);

    return (
        <div className={`mt-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/20 
                         rounded-lg p-5 border border-indigo-100 dark:border-indigo-800/50 shadow-sm
                         transform transition-all duration-500 ease-out
                         ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
            <div className="flex items-center mb-3">
                <div className="bg-indigo-100 dark:bg-indigo-800 p-2 rounded-md mr-3">
                    <BarChart3 size={20} className="text-indigo-700 dark:text-indigo-300" />
                </div>
                <h3 className="text-lg font-bold text-indigo-800 dark:text-indigo-200">
                    Resumen Financiero
                </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                <div className="bg-white/60 dark:bg-slate-800/50 rounded-lg p-4 border border-indigo-100 dark:border-indigo-800/30">
                    <p className="text-sm text-indigo-600 dark:text-indigo-300 flex items-center">
                        <DollarSign size={16} className="mr-1.5" /> Divisas (Bs.)
                    </p>
                    <p className="text-xl font-semibold text-slate-800 dark:text-white mt-1">
                        {formatCurrency(animateValues ? displayDivisas : 0, 'VES')}
                    </p>
                </div>
                
                <div className="bg-white/60 dark:bg-slate-800/50 rounded-lg p-4 border border-indigo-100 dark:border-indigo-800/30">
                    <p className="text-sm text-indigo-600 dark:text-indigo-300 flex items-center">
                        <TrendingUp size={16} className="mr-1.5" /> Total Ventas (Bs.)
                    </p>
                    <p className="text-xl font-semibold text-slate-800 dark:text-white mt-1">
                        {formatCurrency(animateValues ? displayTotal : 0, 'VES')}
                    </p>
                </div>
            </div>
            
            <div className={`flex justify-end mt-3 transition-opacity duration-500 ${animateValues ? 'opacity-100' : 'opacity-0'}`}>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                    Actualizado en tiempo real <ArrowRight size={12} className="ml-1" />
                </div>
            </div>
        </div>
    );
};

const DollarSign: React.FC<{ size: number, className?: string }> = ({ size, className = '' }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
);