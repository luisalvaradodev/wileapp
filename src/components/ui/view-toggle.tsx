import React from 'react';
import { Grid3X3, List, LayoutGrid } from 'lucide-react';
import { Button } from './button';

export type ViewMode = 'grid' | 'list' | 'cards';

interface ViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  view,
  onViewChange,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <Button
        variant={view === 'cards' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewChange('cards')}
        className="h-10 w-10 p-0"
      >
        <LayoutGrid className="w-4 h-4" />
      </Button>
      <Button
        variant={view === 'grid' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewChange('grid')}
        className="h-10 w-10 p-0"
      >
        <Grid3X3 className="w-4 h-4" />
      </Button>
      <Button
        variant={view === 'list' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewChange('list')}
        className="h-10 w-10 p-0"
      >
        <List className="w-4 h-4" />
      </Button>
    </div>
  );
};