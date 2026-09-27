import React from 'react';
import { SAHAYAKThread } from '../ui/SAHAYAKThread';

export interface LoadingStateProps {
  title?: string;
  message?: string;
  subtitle?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title,
  message,
  subtitle = 'Connecting to multi-signal matching index & NIE campus directory'
}) => {
  const displayTitle = message || title || 'Scanning Campus Recovery Network...';

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-sahayak-brown/15 animate-ping opacity-30" />
        <div className="w-16 h-16 rounded-full border-4 border-t-sahayak-blue-deep border-r-sahayak-blue-sky border-b-sahayak-gold border-l-transparent animate-spin shadow-neumorph-sm" />
      </div>
      <h4 className="text-lg font-bold font-heading text-sahayak-text-primary mb-2">{displayTitle}</h4>
      <p className="text-sm text-sahayak-text-secondary max-w-md mb-6">{subtitle}</p>
      <div className="w-48">
        <SAHAYAKThread />
      </div>
    </div>
  );
};
