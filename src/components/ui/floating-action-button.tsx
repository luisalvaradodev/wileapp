"use client";

import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from './button';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  tooltip?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon,
  tooltip,
  variant = 'primary',
  position = 'bottom-right',
  size = 'md'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white';
      case 'secondary':
        return 'bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white';
      case 'success':
        return 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white';
      case 'danger':
        return 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white';
      default:
        return 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'bottom-6 right-6';
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-6 right-6';
      case 'top-left':
        return 'top-6 left-6';
      default:
        return 'bottom-6 right-6';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-12 h-12';
      case 'md':
        return 'w-14 h-14';
      case 'lg':
        return 'w-16 h-16';
      default:
        return 'w-14 h-14';
    }
  };

  return (
    <div className="relative group">
      <Button
        onClick={onClick}
        className={cn(
          'fixed z-50 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95',
          getVariantClasses(),
          getPositionClasses(),
          getSizeClasses()
        )}
        size="icon"
      >
        {icon}
      </Button>
      
      {tooltip && (
        <div className={cn(
          'fixed z-40 px-3 py-2 bg-black/80 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap',
          position.includes('right') ? 'right-20' : 'left-20',
          position.includes('bottom') ? 'bottom-8' : 'top-8'
        )}>
          {tooltip}
        </div>
      )}
    </div>
  );
};