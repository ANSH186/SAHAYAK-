import React, { useState } from 'react';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  PieChart, 
  Award, 
  ShieldCheck,
  Calendar,
  Building,
  Sparkles,
  BarChart3,
  Layers,
  Zap,
  ArrowUpRight
} from 'lucide-react';

export const AdminResolutionPage: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState('ALL');

  const hourlyDistribution = [
    { range: '< 2 hrs', count: 18, pct: 24 },
    { range: '2-6 hrs', count: 28, pct: 37 },
    { range: '6-12 hrs', count: 16, pct: 21 },
    { range: '12-24 hrs', count: 10, pct: 13 },
    { range: '> 24 hrs', count: 4, pct: 5 }
  ];

  const handoverChannels = [
    { name: 'NIE Main Security Desk Lockers', count: 42, successRate: '99.2%', avgMin: '8 min' },
    { name: 'Proctor Office Administrative Desk', count: 21, successRate: '100%', avgMin: '12 min' },
    { name: 'Central Library Custody Locker', count: 14, successRate: '98.5%', avgMin: '6 min' },
    { name: 'Sports Complex Desk', count: 8, successRate: '97.0%', avgMin: '15 min' }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sahayak-success-soft text-sahayak-success font-semibold text-xs mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Campus Integrity & Handover Velocity</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
            Resolution & Recovery Analytics
          </h1>
          <p className="text-xs sm:text-sm text-sahayak-text-secondary">
            Tracking time-to-handover, false claim prevention rates, and student satisfaction metrics across NIE North.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-sahayak-blue-ice text-sahayak-blue font-bold text-xs">
            Overall Health: 99.4%
          </span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <NeumorphicCard className="p-5 border border-sahayak-brown/15 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sahayak-text-muted uppercase">Avg Turnaround Time</span>
            <Clock className="w-4 h-4 text-sahayak-blue" />
          </div>
          <p className="font-heading font-black text-3xl text-sahayak-blue-deep">14.8 hrs</p>
          <div className="flex items-center gap-1 text-[11px] text-sahayak-success font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>45% faster than physical notice boards</span>
          </div>
        </NeumorphicCard>

        <NeumorphicCard className="p-5 border border-sahayak-brown/15 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sahayak-text-muted uppercase">Verification Accuracy</span>
            <ShieldCheck className="w-4 h-4 text-sahayak-success" />
          </div>
          <p className="font-heading font-black text-3xl text-sahayak-success">100%</p>
          <p className="text-[11px] text-sahayak-text-muted">Zero unauthorized or fraudulent handovers</p>
        </NeumorphicCard>

        <NeumorphicCard className="p-5 border border-sahayak-brown/15 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sahayak-text-muted uppercase">OTP Passcode Checkouts</span>
            <Sparkles className="w-4 h-4 text-sahayak-gold" />
          </div>
          <p className="font-heading font-black text-3xl text-sahayak-gold">342</p>
          <p className="text-[11px] text-sahayak-text-muted">Completed via cryptographically signed OTPs</p>
        </NeumorphicCard>
      </div>

      {/* GRAPHICAL SECTION 1: Time-to-Resolution Histogram & Handover Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Turnaround Velocity Histogram */}
        <NeumorphicCard className="p-6 border border-sahayak-brown/15 shadow-neumorph space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-sahayak-brown/10">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sahayak-blue" />
              <h3 className="font-heading font-bold text-base text-sahayak-blue-deep">
                Time-to-Recovery Distribution
              </h3>
            </div>
            <span className="text-xs font-semibold text-sahayak-text-muted">61% resolved &lt; 6 hrs</span>
          </div>

          <div className="space-y-3 pt-1">
            {hourlyDistribution.map((h, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-sahayak-text-primary">{h.range}</span>
                  <span className="font-mono text-sahayak-blue-deep font-bold">{h.count} cases ({h.pct}%)</span>
                </div>
                <div className="w-full h-3 bg-sahayak-cream rounded-full overflow-hidden border border-sahayak-brown/10 flex">
                  <div
                    className="h-full bg-gradient-to-r from-sahayak-blue to-sahayak-blue-mid rounded-full transition-all duration-700"
                    style={{ width: `${h.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-sahayak-text-muted pt-2 border-t border-sahayak-brown/10">
            ⚡ Automated AI notifications and SMS dispatch accelerated claimant verification pickup by 4.2x.
          </p>
        </NeumorphicCard>

        {/* Handover Channels & Desks Performance */}
        <NeumorphicCard className="p-6 border border-sahayak-brown/15 shadow-neumorph space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-sahayak-brown/10">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-sahayak-gold" />
              <h3 className="font-heading font-bold text-base text-sahayak-blue-deep">
                Custody Handover Channels
              </h3>
            </div>
            <span className="text-xs font-bold text-sahayak-success">100% Signed-off</span>
          </div>

          <div className="space-y-3">
            {handoverChannels.map((c, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-sahayak-cream border border-sahayak-brown/10 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-sahayak-text-primary truncate">{c.name}</h4>
                  <p className="text-[11px] text-sahayak-text-muted">
                    {c.count} Handovers • Avg Desk Wait: {c.avgMin}
                  </p>
                </div>

                <span className="px-2.5 py-1 rounded-lg bg-sahayak-success-soft text-sahayak-success text-xs font-bold shrink-0">
                  {c.successRate}
                </span>
              </div>
            ))}
          </div>
        </NeumorphicCard>
      </div>

      {/* GRAPHICAL SECTION 2: Category Resolution Rate */}
      <NeumorphicCard className="p-6 border border-sahayak-brown/15 shadow-neumorph space-y-4">
        <h3 className="font-heading font-bold text-base text-sahayak-text-primary">
          Resolution Rate by Belonging Category
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>Calculators & Lab Hardware (Casio fx-991CW, Multimeters, Breadboards)</span>
              <span className="text-sahayak-blue font-bold">98% Recovered</span>
            </div>
            <div className="w-full h-2.5 bg-sahayak-cream rounded-full overflow-hidden border border-sahayak-brown/10">
              <div className="h-full bg-sahayak-blue rounded-full w-[98%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>Smart Watches, Wireless Earbuds & Laptops</span>
              <span className="text-sahayak-blue font-bold">94% Recovered</span>
            </div>
            <div className="w-full h-2.5 bg-sahayak-cream rounded-full overflow-hidden border border-sahayak-brown/10">
              <div className="h-full bg-sahayak-blue-sky rounded-full w-[94%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>Student ID Cards, Driving Licenses & Wallets</span>
              <span className="text-sahayak-success font-bold">100% Recovered</span>
            </div>
            <div className="w-full h-2.5 bg-sahayak-cream rounded-full overflow-hidden border border-sahayak-brown/10">
              <div className="h-full bg-sahayak-success rounded-full w-[100%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>Keys, Badges & Notebooks</span>
              <span className="text-sahayak-gold-dark font-bold">91% Recovered</span>
            </div>
            <div className="w-full h-2.5 bg-sahayak-cream rounded-full overflow-hidden border border-sahayak-brown/10">
              <div className="h-full bg-sahayak-gold rounded-full w-[91%]" />
            </div>
          </div>
        </div>
      </NeumorphicCard>
    </div>
  );
};
