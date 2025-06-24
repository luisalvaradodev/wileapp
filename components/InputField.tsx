import React from 'react';

interface InputFieldProps {
    id: string;
    label: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    icon?: React.ReactNode;
    step?: string;
    compact?: boolean;
    highlight?: boolean;
    accent?: 'blue' | 'green' | 'amber' | 'purple';
}

export const InputField: React.FC<InputFieldProps> = ({
    id,
    label,
    type,
    value,
    onChange,
    placeholder,
    icon,
    step,
    compact = false,
    highlight = false,
    accent = 'blue'
}) => {
    const accentClasses = {
        blue: 'focus-within:border-blue-500 focus-within:ring-blue-200 dark:focus-within:ring-blue-800',
        green: 'focus-within:border-emerald-500 focus-within:ring-emerald-200 dark:focus-within:ring-emerald-800',
        amber: 'focus-within:border-amber-500 focus-within:ring-amber-200 dark:focus-within:ring-amber-800',
        purple: 'focus-within:border-purple-500 focus-within:ring-purple-200 dark:focus-within:ring-purple-800',
    };

    const selectedAccentClass = accentClasses[accent];

    return (
        <div className={`${compact ? 'space-y-1' : 'space-y-2'}`}>
            <label 
                htmlFor={id} 
                className={`block text-sm font-medium ${
                    compact 
                        ? 'text-slate-600 dark:text-slate-300' 
                        : 'text-slate-700 dark:text-slate-200'
                } flex items-center`}
            >
                {icon && <span className="mr-1.5 text-slate-500 dark:text-slate-400">{icon}</span>}
                {label}
            </label>
            
            <div className={`relative group ${
                highlight 
                    ? 'bg-blue-50 dark:bg-blue-900/20 rounded-md p-0.5' 
                    : ''
            }`}>
                <input
                    type={type}
                    id={id}
                    step={step}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={`w-full ${compact ? 'p-2' : 'p-3'} border ${
                        highlight 
                            ? 'border-blue-300 dark:border-blue-700' 
                            : 'border-slate-300 dark:border-slate-600'
                    } rounded-md bg-white dark:bg-slate-700 text-slate-800 dark:text-white
                      focus:outline-none focus:ring-2 ${selectedAccentClass}
                      transition-all duration-200
                      placeholder:text-slate-400 dark:placeholder:text-slate-500`}
                />
                {type === 'number' && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="flex flex-col">
                            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none\" tabIndex={-1}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none" tabIndex={-1}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};