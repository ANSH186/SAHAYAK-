import React from 'react';
import { NeumorphicCard } from './NeumorphicCard';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface StatCardProps {
  label?: string;
  title?: string;
  value: string | number;
  subtext?: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorScheme?: 'blue' | 'sky' | 'gold' | 'emerald' | 'green';
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  title,
  value,
  subtext,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'blue',
  color
}) => {
  const chosenColor = color || colorScheme;
  
  const iconColorStyles: Record<string, string> = {
    blue: 'bg-sahayak-blue/10 text-sahayak-blue border-sahayak-blue/20',
    sky: 'bg-sahayak-blue-sky/15 text-sahayak-blue border-sahayak-blue-sky/30',
    gold: 'bg-sahayak-gold/20 text-sahayak-gold-dark border-sahayak-gold/30',
    emerald: 'bg-sahayak-success-soft text-sahayak-success border-sahayak-success/30',
    green: 'bg-sahayak-success-soft text-sahayak-success border-sahayak-success/30'
  };

  const displayText = label || title || 'Metric';
  const displaySubtext = subtitle || subtext;

  return (
    <NeumorphicCard className="flex flex-col justify-between p-5 border border-sahayak-brown/15 shadow-neumorph-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-sahayak-text-muted uppercase tracking-wider">{displayText}</p>
          <h3 className="text-2xl sm:text-3xl font-bold font-heading text-sahayak-text-primary mt-1">{value}</h3>
        </div>
        <div className={cn('p-3 rounded-xl border shadow-inner', iconColorStyles[chosenColor] || iconColorStyles.blue)}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>
      {(displaySubtext || trend) && (
        <div className="mt-4 pt-3 border-t border-sahayak-brown/10 flex items-center justify-between text-xs text-sahayak-text-secondary">
          {displaySubtext && <span>{displaySubtext}</span>}
          {trend && (
            <span className={cn('font-semibold', trend.isPositive ? 'text-sahayak-success' : 'text-sahayak-error')}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
      )}
    </NeumorphicCard>
  );
};
