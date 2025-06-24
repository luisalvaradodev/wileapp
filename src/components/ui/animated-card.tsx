"use client";

import React from 'react';
import { cn } from '../../lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

interface AnimatedCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerContent?: React.ReactNode;
  gradient?: string;
  hoverEffect?: boolean;
  glowEffect?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  title,
  description,
  children,
  className,
  headerContent,
  gradient = "", 
  hoverEffect = true,
  glowEffect = false 
}) => {
  return (
    <Card 
      className={cn(
        gradient && "bg-gradient-to-br",
        "shadow-lg",
        "border border-border/40",
        "transition-all duration-300 ease-out",
        gradient,
        hoverEffect && "hover:-translate-y-1.5 hover:shadow-xl",
        glowEffect && "hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-white/10",
        className
      )}
    >
      {(title || description || headerContent) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {title && <CardTitle>{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            {headerContent}
          </div>
        </CardHeader>
      )}
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};