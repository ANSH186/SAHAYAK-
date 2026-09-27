import React from 'react';
import { Link } from 'react-router-dom';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

export const SystemErrorPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-sahayak-cream">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-sahayak-error-soft text-sahayak-error mx-auto flex items-center justify-center shadow-neumorph mb-2">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-sahayak-error uppercase tracking-widest bg-sahayak-error-soft px-3 py-1 rounded-full">
            System Fault 500
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-sahayak-blue-deep">
            Unexpected Disruption
          </h1>
          <p className="text-xs sm:text-sm text-sahayak-text-secondary max-w-xs mx-auto">
            An internal server exception occurred while processing telemetry. The NIE IT Helpdesk has been notified.
          </p>
        </div>

        <NeumorphicCard className="p-6 border border-sahayak-brown/15 shadow-neumorph space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl bg-sahayak-blue text-white font-heading font-bold text-xs shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Request</span>
            </button>
            <Link
              to="/"
              className="px-6 py-3 rounded-xl bg-sahayak-cream border border-sahayak-brown/20 text-sahayak-text-primary font-bold text-xs shadow-neumorph hover:border-sahayak-blue transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Link>
          </div>
        </NeumorphicCard>
      </div>
    </div>
  );
};
