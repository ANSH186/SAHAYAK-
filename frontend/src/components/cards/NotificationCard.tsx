import React from 'react';
import { AppNotification } from '../../types';
import { NeumorphicCard } from '../ui/NeumorphicCard';
import { Sparkles, CheckCircle2, Award, MessageSquare, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatRelativeTime } from '../../lib/utils';

export interface NotificationCardProps {
  notification: AppNotification;
  onMarkRead?: (id: string) => void;
  onMarkAsRead?: (id: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({ 
  notification, 
  onMarkRead, 
  onMarkAsRead 
}) => {
  const handleMark = onMarkAsRead || onMarkRead;
  const isRead = notification.read ?? notification.isRead ?? false;

  const getIcon = () => {
    switch (notification.type) {
      case 'MATCH':
      case 'MATCH_FOUND':
        return <Sparkles className="w-5 h-5 text-sahayak-blue-sky" />;
      case 'VERIFICATION':
      case 'VERIFICATION_UPDATE':
        return <CheckCircle2 className="w-5 h-5 text-sahayak-success" />;
      case 'REWARD':
      case 'REWARD_EARNED':
        return <Award className="w-5 h-5 text-sahayak-gold" />;
      case 'MESSAGE_RECEIVED':
        return <MessageSquare className="w-5 h-5 text-sahayak-blue" />;
      default:
        return <AlertCircle className="w-5 h-5 text-sahayak-blue-deep" />;
    }
  };

  const targetLink = notification.linkUrl || notification.link || '/student';

  return (
    <NeumorphicCard className={`p-4 sm:p-5 transition-all border ${isRead ? 'opacity-85 border-sahayak-brown/10' : 'border-l-4 border-l-sahayak-blue-deep bg-sahayak-cream-soft'}`}>
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 bg-sahayak-cream rounded-xl shadow-inner shrink-0 border border-sahayak-brown/10">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-sahayak-text-primary font-heading">{notification.title}</h4>
            <span className="text-[11px] text-sahayak-text-muted shrink-0">{formatRelativeTime(notification.timestamp)}</span>
          </div>
          <p className="text-xs text-sahayak-text-secondary mt-1 leading-relaxed">{notification.message}</p>
          
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-sahayak-brown/10">
            {targetLink ? (
              <Link
                to={targetLink}
                onClick={() => handleMark?.(notification.id)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-sahayak-blue hover:text-sahayak-blue-deep"
              >
                <span>Take Action</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : <div />}

            {!isRead && handleMark && (
              <button
                onClick={() => handleMark(notification.id)}
                className="text-[11px] text-sahayak-text-muted hover:text-sahayak-text-primary font-medium"
              >
                Mark as read
              </button>
            )}
          </div>
        </div>
      </div>
    </NeumorphicCard>
  );
};
