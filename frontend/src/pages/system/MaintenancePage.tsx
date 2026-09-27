import React from 'react';
import { Link } from 'react-router-dom';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { Wrench, Clock, ShieldCheck, Phone } from 'lucide-react';

export const MaintenancePage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-sahayak-cream">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-sahayak-gold-soft text-sahayak-blue-deep mx-auto flex items-center justify-center shadow-neumorph mb-2">
          <Wrench className="w-10 h-10 text-sahayak-gold" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-sahayak-blue-deep uppercase tracking-widest bg-sahayak-gold-soft px-3 py-1 rounded-full">
            Campus Network Maintenance
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-sahayak-blue-deep">
            System Synchronization
          </h1>
          <p className="text-xs sm:text-sm text-sahayak-text-secondary max-w-xs mx-auto">
            The SAHAYAK Neural Matching Registry is undergoing scheduled maintenance and database backup.
          </p>
        </div>

        <NeumorphicCard className="p-6 border border-sahayak-brown/15 shadow-neumorph space-y-3 text-xs text-sahayak-text-secondary">
          <div className="flex items-center justify-between pb-2 border-b border-sahayak-brown/10">
            <span>Estimated Uptime:</span>
            <strong className="text-sahayak-blue">06:00 AM IST</strong>
          </div>
          <p>
            For urgent physical handovers, please visit the NIE Main Security Desk in person.
          </p>
        </NeumorphicCard>
      </div>
    </div>
  );
};
