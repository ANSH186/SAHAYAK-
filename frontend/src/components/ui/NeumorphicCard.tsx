import React from 'react';
import { cn } from '../../lib/utils';

interface NeumorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'flat' | 'interactive' | 'inset' | 'gold' | 'primary';
  children: React.ReactNode;
}

export const NeumorphicCard: React.FC<NeumorphicCardProps> = ({
  variant = 'flat',
  className,
  children,
  ...props
}) => {
  const variantStyles = {
    flat: 'neu-card',
    interactive: 'neu-card-interactive cursor-pointer',
    inset: 'neu-inset',
    gold: 'bg-gold-soft border border-gold-light/40 shadow-neu-gold rounded-2xl',
    primary: 'bg-gradient-to-br from-primary-dark via-primary to-primary-600 text-white rounded-2xl shadow-neu-blue border border-white/10'
  };

  return (
    <div className={cn(variantStyles[variant], 'p-5 sm:p-6', className)} {...props}>
      {children}
    </div>
  );
};
