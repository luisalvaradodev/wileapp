import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

interface Option {
  id: string;
  name: string;
  [key: string]: any;
}

interface SearchableSelectProps {
  options: Option[];
  value?: string;
  onSelect: (option: Option | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onSelect,
  placeholder = "Seleccionar...",
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      const option = options.find(opt => opt.id === value);
      setSelectedOption(option || null);
    } else {
      setSelectedOption(null);
    }
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option: Option) => {
    setSelectedOption(option);
    onSelect(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOption(null);
    onSelect(null);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-4 py-3 text-left bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 
          rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent
          transition-all duration-200 flex items-center justify-between
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-pink-300 cursor-pointer'}
          ${isOpen ? 'ring-2 ring-pink-500 border-transparent' : ''}
        `}
      >
        <span className={`text-gray-900 dark:text-white ${!selectedOption ? 'text-gray-500 dark:text-gray-400' : ''}`}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <div className="flex items-center space-x-2">
          {selectedOption && !disabled && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
            >
              ×
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-lg max-h-60 overflow-hidden">
          <div className="p-3 border-b border-gray-100 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center">
                No se encontraron resultados
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option)}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-700 
                    transition-colors flex items-center justify-between
                    ${selectedOption?.id === option.id ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400' : 'text-gray-900 dark:text-white'}
                  `}
                >
                  <span>{option.name}</span>
                  {selectedOption?.id === option.id && (
                    <Check className="w-4 h-4 text-pink-500" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};