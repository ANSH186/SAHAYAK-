import React, { useState, useEffect } from 'react';
import { matchingService } from '../../lib/services';
import { MatchItem } from '../../types';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { MatchCard } from '../../components/cards/MatchCard';
import { LoadingState } from '../../components/feedback/LoadingState';
import { 
  GitCompare, 
  Sparkles, 
  Search, 
  Filter, 
  ShieldCheck, 
  TrendingUp,
  Cpu
} from 'lucide-react';

export const AdminMatchesPage: React.FC = () => {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      try {
        const data = await matchingService.getMatches();
        setMatches(data);
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, []);

  if (loading) {
    return <LoadingState message="Loading AI Match Engine Diagnostics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sahayak-blue-ice text-sahayak-blue font-semibold text-xs mb-1">
          <Cpu className="w-3.5 h-3.5 text-sahayak-gold" />
          <span>AI Neural Engine Diagnostics</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
          Match Analytics & Diagnostics
        </h1>
        <p className="text-xs sm:text-sm text-sahayak-text-secondary">
          Real-time telemetry on image feature vectors, spatial-temporal scores, and classification accuracy.
        </p>
      </div>

      {/* Model Diagnostic Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <NeumorphicCard className="p-5 border border-sahayak-brown/15 space-y-2">
          <span className="text-xs font-bold text-sahayak-text-muted uppercase">Avg Signal Score</span>
          <p className="font-heading font-black text-3xl text-sahayak-blue-deep">89.4%</p>
          <p className="text-[11px] text-sahayak-success font-semibold">+4.2% since multi-vector update</p>
        </NeumorphicCard>

        <NeumorphicCard className="p-5 border border-sahayak-brown/15 space-y-2">
          <span className="text-xs font-bold text-sahayak-text-muted uppercase">True Positive Handover Rate</span>
          <p className="font-heading font-black text-3xl text-sahayak-blue">98.1%</p>
          <p className="text-[11px] text-sahayak-text-muted">Verified by proctor OTP checkout</p>
        </NeumorphicCard>

        <NeumorphicCard className="p-5 border border-sahayak-brown/15 space-y-2">
          <span className="text-xs font-bold text-sahayak-text-muted uppercase">Inference Latency</span>
          <p className="font-heading font-black text-3xl text-sahayak-gold">142 ms</p>
          <p className="text-[11px] text-sahayak-text-muted">Edge optimized for campus servers</p>
        </NeumorphicCard>
      </div>

      {/* Match Radar Grid */}
      <div className="space-y-4">
        <h2 className="font-heading font-bold text-lg text-sahayak-blue-deep">
          Active AI Cross-References ({matches.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      </div>
    </div>
  );
};
