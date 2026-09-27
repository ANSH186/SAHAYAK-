import React from 'react';
import { LucideIcon, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
  onActionClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = SearchX,
  title,
  description,
  actionText,
  actionLink,
  onActionClick
}) => {
  return (
    <div className="neu-card p-10 flex flex-col items-center justify-center text-center max-w-lg mx-auto my-6">
      <div className="w-16 h-16 rounded-2xl bg-cream-warm flex items-center justify-center text-primary-dark shadow-neu-inset mb-5">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold font-heading text-sahayak-text mb-2">{title}</h3>
      <p className="text-sm text-sahayak-secondary mb-6 leading-relaxed">{description}</p>
      {actionText && (
        actionLink ? (
          <Link to={actionLink} className="neu-btn-primary">
            {actionText}
          </Link>
        ) : (
          <button onClick={onActionClick} className="neu-btn-primary">
            {actionText}
          </button>
        )
      )}
    </div>
  );
};
