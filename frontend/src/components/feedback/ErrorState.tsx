import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something unexpected occurred',
  message = 'We could not complete your request at this moment. The campus recovery network remains secure.',
  onRetry
}) => {
  return (
    <div className="neu-card p-10 flex flex-col items-center justify-center text-center max-w-lg mx-auto my-8 border-sahayak-error/30 bg-sahayak-errorSoft/20">
      <div className="w-16 h-16 rounded-2xl bg-sahayak-errorSoft flex items-center justify-center text-sahayak-error shadow-neu-inset mb-5">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold font-heading text-sahayak-text mb-2">{title}</h3>
      <p className="text-sm text-sahayak-secondary mb-6 leading-relaxed">{message}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button onClick={onRetry} className="neu-btn-secondary">
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Try Again
          </button>
        )}
        <Link to="/" className="neu-btn-primary">
          <Home className="w-4 h-4 mr-1.5" />
          Back to Campus Home
        </Link>
      </div>
    </div>
  );
};
