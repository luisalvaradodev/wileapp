"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Input } from './input';
import { SearchableSelectOption } from '@/../lib/types';

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
  allowClear?: boolean;
  groupByCategory?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onValueChange,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  className,
  disabled = false,
  allowClear = false,
  groupByCategory = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (option.description && option.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const groupedOptions = groupByCategory ? 
    filteredOptions.reduce((groups, option) => {
      const category = option.category || 'Otros';
      if (!groups[category]) groups[category] = [];
      groups[category].push(option);
      return groups;
    }, {} as Record<string, SearchableSelectOption[]>) : {};

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

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (selectedValue: string) => {
    onValueChange?.(selectedValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange?.('');
  };

  const renderOption = (option: SearchableSelectOption) => (
    <div
      key={option.value}
      className={cn(
        "flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors",
        value === option.value && "bg-accent text-accent-foreground"
      )}
      onClick={() => handleSelect(option.value)}
    >
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{option.label}</div>
        {option.description && (
          <div className="text-sm text-muted-foreground truncate">
            {option.description}
          </div>
        )}
      </div>
      {value === option.value && (
        <Check className="w-4 h-4 text-primary ml-2 flex-shrink-0" />
      )}
    </div>
  );

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        className={cn(
          "w-full justify-between",
          !selectedOption && "text-muted-foreground"
        )}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
          {allowClear && selectedOption && (
            <X
              className="w-4 h-4 text-muted-foreground hover:text-foreground"
              onClick={handleClear}
            />
          )}
          <ChevronDown className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )} />
        </div>
      </Button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-hidden">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8"
              />
            </div>
          </div>

          <div className="overflow-y-auto max-h-48">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-center text-muted-foreground">
                No se encontraron opciones
              </div>
            ) : groupByCategory ? (
              Object.entries(groupedOptions).map(([category, categoryOptions]) => (
                <div key={category}>
                  <div className="px-3 py-1 text-xs font-medium text-muted-foreground bg-muted/50">
                    {category}
                  </div>
                  {categoryOptions.map(renderOption)}
                </div>
              ))
            ) : (
              filteredOptions.map(renderOption)
            )}
          </div>
        </div>
      )}
    </div>
  );
};