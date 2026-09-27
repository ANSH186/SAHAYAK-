import React, { useState } from 'react';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { 
  BellRing, 
  ShieldAlert, 
  CheckCheck, 
  AlertTriangle, 
  Lock,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminAlert {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'CRITICAL' | 'VERIFICATION' | 'SYSTEM';
  read: boolean;
  caseId?: string;
}

const initialAdminAlerts: AdminAlert[] = [
  {
    id: 'alt-1',
    title: 'Claim Verification Pending Proctor Review',
    message: 'Rahul Sharma submitted ownership clues for Noise ColorFit Pro 4 located at Main Security Desk.',
    timestamp: '10 minutes ago',
    type: 'VERIFICATION',
    read: false,
    caseId: 'c-101'
  },
  {
    id: 'alt-2',
    title: 'High-Value Electronics Deposited',
    message: 'Casio Scientific fx-991CW turned in by Ananya at Central Library Helpdesk.',
    timestamp: '25 minutes ago',
    type: 'SYSTEM',
    read: false,
    caseId: 'rep-found-1'
  },
  {
    id: 'alt-3',
    title: 'Custody Locker Inventory Check',
    message: 'Sir MV Block locker count synchronized with central database.',
    timestamp: '2 hours ago',
    type: 'SYSTEM',
    read: true
  }
];

export const AdminNotificationsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AdminAlert[]>(initialAdminAlerts);

  const markAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sahayak-error-soft text-sahayak-error font-semibold text-xs mb-1">
            <BellRing className="w-3.5 h-3.5" />
            <span>Security Dispatch</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
            System & Security Alerts
          </h1>
          <p className="text-xs sm:text-sm text-sahayak-text-secondary">
            Proctor action requests, high-value deposit notices, and custody locker alerts.
          </p>
        </div>

        <button
          onClick={markAllRead}
          className="px-3.5 py-2 rounded-xl bg-sahayak-cream-soft border border-sahayak-brown/15 text-xs font-semibold text-sahayak-text-primary hover:border-sahayak-blue flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <CheckCheck className="w-3.5 h-3.5 text-sahayak-blue" />
          <span>Mark all read</span>
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.map((alt) => (
          <NeumorphicCard
            key={alt.id}
            className={`p-4 sm:p-5 border transition-all ${
              !alt.read ? 'border-sahayak-blue/40 bg-sahayak-cream-soft shadow-neumorph-sm' : 'border-sahayak-brown/10'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  alt.type === 'VERIFICATION'
                    ? 'bg-sahayak-gold-soft text-sahayak-blue-deep'
                    : 'bg-sahayak-blue-ice text-sahayak-blue'
                }`}>
                  <ShieldAlert className="w-5 h-5 text-sahayak-gold" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-sm text-sahayak-text-primary">
                      {alt.title}
                    </h3>
                    {!alt.read && (
                      <span className="w-2 h-2 rounded-full bg-sahayak-error" />
                    )}
                  </div>
                  <p className="text-xs text-sahayak-text-secondary leading-relaxed">
                    {alt.message}
                  </p>
                  <span className="text-[10px] font-mono text-sahayak-text-muted block mt-1">
                    {alt.timestamp}
                  </span>
                </div>
              </div>

              {alt.caseId && (
                <Link
                  to={`/admin/reports/${alt.caseId}`}
                  className="px-3 py-1.5 rounded-lg bg-sahayak-blue text-white text-xs font-bold hover:bg-sahayak-blue-mid shrink-0 flex items-center gap-1"
                >
                  <span>Review</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </NeumorphicCard>
        ))}
      </div>
    </div>
  );
};
