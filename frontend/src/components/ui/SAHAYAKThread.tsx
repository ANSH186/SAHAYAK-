import React from 'react';
import { cn } from '../../lib/utils';
import { Sparkles } from 'lucide-react';

export interface SAHAYAKThreadProps {
  className?: string;
  showIcon?: boolean;
  text?: string;
  height?: number;
  activeStep?: number;
  currentStep?: number;
}

export const SAHAYAKThread: React.FC<SAHAYAKThreadProps> = ({ 
  className, 
  showIcon = false, 
  text,
  height = 3,
  activeStep,
  currentStep
}) => {
  const step = activeStep || currentStep || 1;

  return (
    <div className={cn('relative py-2 flex flex-col items-center justify-center w-full', className)}>
      <div 
        className="w-full bg-gradient-to-r from-sahayak-blue-deep via-sahayak-blue-sky via-sahayak-gold to-sahayak-success rounded-full opacity-85 shadow-sm"
        style={{ height: `${height}px` }}
      />
      {showIcon && (
        <div className="absolute -top-1.5 flex items-center gap-1.5 px-3 py-0.5 bg-sahayak-cream-soft border border-sahayak-gold/40 rounded-full shadow-sm text-[10px] font-bold text-sahayak-blue-deep uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-sahayak-gold" />
          <span>{text || 'The SAHAYAK Recovery Thread'}</span>
        </div>
      )}
    </div>
  );
};
