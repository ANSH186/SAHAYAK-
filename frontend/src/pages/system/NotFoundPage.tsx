import React from 'react';
import { Link } from 'react-router-dom';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { SAHAYAKThread } from '../../components/ui/SAHAYAKThread';
import { Compass, ArrowLeft, Home, Sparkles } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-sahayak-cream">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-sahayak-blue-ice text-sahayak-blue mx-auto flex items-center justify-center shadow-neumorph mb-2">
          <Compass className="w-10 h-10 text-sahayak-blue animate-spin" style={{ animationDuration: '10s' }} />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-sahayak-blue uppercase tracking-widest bg-sahayak-blue-ice px-3 py-1 rounded-full">
            Error 404
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-sahayak-blue-deep">
            Campus Route Lost
          </h1>
          <p className="text-xs sm:text-sm text-sahayak-text-secondary max-w-xs mx-auto">
            The page or case dossier you are trying to reach has either been archived or moved to another campus zone.
          </p>
        </div>

        <NeumorphicCard className="p-6 border border-sahayak-brown/15 shadow-neumorph space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="px-6 py-3 rounded-xl bg-sahayak-blue text-white font-heading font-bold text-xs shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Back to SAHAYAK Home</span>
            </Link>
            <Link
              to="/student"
              className="px-6 py-3 rounded-xl bg-sahayak-cream border border-sahayak-brown/20 text-sahayak-text-primary font-bold text-xs shadow-neumorph hover:border-sahayak-blue transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Student Portal</span>
            </Link>
          </div>
        </NeumorphicCard>

        <div className="max-w-xs mx-auto">
          <SAHAYAKThread height={2} activeStep={1} />
        </div>
      </div>
    </div>
  );
};
