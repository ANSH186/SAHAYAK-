import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { 
  Award, 
  Gift, 
  CheckCircle2, 
  TrendingUp, 
  FileText, 
  UserCheck,
  ShieldCheck,
  Loader2
} from 'lucide-react';

export const AdminRewardsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadRewards() {
      try {
        const data = await api.rewards.getTransactions();
        if (Array.isArray(data)) {
          setTransactions(data);
        }
      } catch (err) {
        console.warn('Failed to load rewards:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRewards();
  }, []);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sahayak-gold-soft text-sahayak-blue-deep font-semibold text-xs mb-1">
          <Award className="w-3.5 h-3.5 text-sahayak-gold" />
          <span>Incentive & Points Governance</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
          Reward & Points Auditing
        </h1>
        <p className="text-xs sm:text-sm text-sahayak-text-secondary">
          Monitor Good Samaritan point issuances, prevent point gaming, and audit perks redeemed by students.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <NeumorphicCard className="p-5 border border-sahayak-brown/15 space-y-2">
          <span className="text-xs font-bold text-sahayak-text-muted uppercase">Total Points Distributed</span>
          <p className="font-heading font-black text-3xl text-sahayak-blue-deep">4,850 PTS</p>
          <p className="text-[11px] text-sahayak-text-muted">Strictly tied to verified handovers</p>
        </NeumorphicCard>

        <NeumorphicCard className="p-5 border border-sahayak-brown/15 space-y-2">
          <span className="text-xs font-bold text-sahayak-text-muted uppercase">Active Point Holders</span>
          <p className="font-heading font-black text-3xl text-sahayak-blue">128 Students</p>
          <p className="text-[11px] text-sahayak-text-muted">Across all 6 engineering departments</p>
        </NeumorphicCard>

        <NeumorphicCard className="p-5 border border-sahayak-brown/15 space-y-2">
          <span className="text-xs font-bold text-sahayak-text-muted uppercase">Certificates Issued</span>
          <p className="font-heading font-black text-3xl text-sahayak-gold">86 Verified</p>
          <p className="text-[11px] text-sahayak-text-muted">Signed by Dean of Student Affairs</p>
        </NeumorphicCard>
      </div>

      {/* Recent Points Allocation Ledger */}
      <div className="space-y-3">
        <h3 className="font-heading font-bold text-sm text-sahayak-blue-deep uppercase tracking-wider">
          Recent Reward Transactions Ledger
        </h3>

        <NeumorphicCard className="p-0 border border-sahayak-brown/15 overflow-hidden shadow-neumorph">
          <div className="divide-y divide-sahayak-brown/10 text-xs">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-sahayak-text-secondary text-xs">
                No reward transactions recorded yet.
              </div>
            ) : (
              transactions.map((t) => (
                <div key={t.id} className="p-4 flex items-center justify-between hover:bg-sahayak-cream-soft/60 transition-colors">
                  <div>
                    <p className="font-bold text-sahayak-text-primary">{t.reason}</p>
                    <p className="text-[11px] text-sahayak-text-muted">Transaction #{t.id} • Case #{t.caseId || 'n/a'} • {t.date || t.timestamp}</p>
                  </div>
                  <span className="font-mono font-bold text-sahayak-success">
                    +{t.points} PTS
                  </span>
                </div>
              ))
            )}
          </div>
        </NeumorphicCard>
      </div>
    </div>
  );
};
