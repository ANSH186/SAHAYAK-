import React from 'react';
import { ReportStatus, ReportType } from '../../types';
import { cn } from '../../lib/utils';
import { Clock, CheckCircle2, AlertCircle, HelpCircle, ArrowRightLeft, ShieldCheck } from 'lucide-react';

export interface StatusBadgeProps {
  status?: ReportStatus | string;
  type?: ReportType | string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type, className, size = 'md' }) => {
  if (type) {
    const isLost = type === 'LOST';
    return (
      <span className={cn(
        'inline-flex items-center gap-1.5 font-semibold rounded-full',
        size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-xs px-3 py-1',
        isLost ? 'bg-sahayak-error-soft text-sahayak-error border border-sahayak-error/20' : 'bg-sahayak-success-soft text-sahayak-success border border-sahayak-success/20',
        className
      )}>
        <span className={cn('w-1.5 h-1.5 rounded-full', isLost ? 'bg-sahayak-error' : 'bg-sahayak-success')} />
        {isLost ? 'LOST ITEM' : 'FOUND ITEM'}
      </span>
    );
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'SUBMITTED':
      case 'ACTIVE_SEARCHING':
        return { label: 'Searching Active', style: 'bg-sahayak-gold-soft text-sahayak-blue-deep border-sahayak-gold/30', icon: Clock };
      case 'MATCHED':
      case 'MATCH_SUGGESTED':
        return { label: 'Match Suggested', style: 'bg-sahayak-blue-ice text-sahayak-blue border-sahayak-blue-sky/40', icon: ArrowRightLeft };
      case 'VERIFICATION_PENDING':
      case 'UNDER_REVIEW':
      case 'AWAITING_CLAIMANT':
      case 'UNDER_AI_CHECK':
      case 'MANUAL_STAFF_REVIEW':
        return { label: 'Verification In Progress', style: 'bg-sahayak-blue-ice text-sahayak-blue border-sahayak-blue-sky/30', icon: HelpCircle };
      case 'VERIFIED':
      case 'VERIFIED_OWNER':
      case 'OWNERSHIP_CONFIRMED':
        return { label: 'Verified Ownership', style: 'bg-sahayak-success-soft text-sahayak-success border-sahayak-success/30', icon: ShieldCheck };
      case 'HANDOVER_SCHEDULED':
        return { label: 'Handover Scheduled', style: 'bg-sahayak-gold-soft text-sahayak-blue-deep border-sahayak-gold/30', icon: Clock };
      case 'RETURNED':
      case 'COMPLETED':
      case 'SAFELY_RETURNED':
        return { label: 'Safely Returned', style: 'bg-sahayak-success-soft text-sahayak-success border-sahayak-success/40', icon: CheckCircle2 };
      case 'VERIFICATION_INCONCLUSIVE':
      case 'CLAIM_DENIED':
        return { label: 'Manual Review Needed', style: 'bg-sahayak-error-soft text-sahayak-error border-sahayak-error/30', icon: AlertCircle };
      default:
        return { label: typeof status === 'string' ? status.replace(/_/g, ' ') : 'Active', style: 'bg-sahayak-cream border-sahayak-brown/20 text-sahayak-text-secondary', icon: Clock };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-semibold rounded-full border',
      size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-xs px-3 py-1',
      config.style,
      className
    )}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span className="capitalize">{config.label}</span>
    </span>
  );
};
