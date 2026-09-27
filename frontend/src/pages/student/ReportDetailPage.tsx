import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { reportsService } from '../../lib/services';
import { ItemReport } from '../../types';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SAHAYAKThread } from '../../components/ui/SAHAYAKThread';
import { LoadingState } from '../../components/feedback/LoadingState';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Tag, 
  Building, 
  Sparkles, 
  User, 
  ShieldCheck, 
  Eye, 
  ArrowRight,
  KeyRound,
  Copy
} from 'lucide-react';

export const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<ItemReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      if (!id) return;
      try {
        const data = await reportsService.getById(id);
        setReport(data || null);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [id]);

  if (loading) {
    return <LoadingState message="Fetching report metadata..." />;
  }

  if (!report) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-xl font-heading font-bold text-sahayak-text-primary">Report Not Found</h2>
        <Link to="/student/reports" className="text-sahayak-blue font-bold hover:underline">
          Back to Reports
        </Link>
      </div>
    );
  }

  const isLost = report.type === 'LOST';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/student/reports"
            className="inline-flex items-center gap-1.5 text-xs text-sahayak-text-muted hover:text-sahayak-blue mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Reports</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
              {report.title}
            </h1>
            <StatusBadge status={report.status} />
          </div>
        </div>

        <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-sahayak-cream-soft border border-sahayak-brown/15 text-sahayak-text-muted">
          Report ID: #{report.id}
        </span>
      </div>

      {/* Main Card */}
      <NeumorphicCard className="p-6 sm:p-8 border border-sahayak-brown/15 shadow-neumorph space-y-6">
        {/* Photo Gallery & Source Badge */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="aspect-square rounded-2xl overflow-hidden bg-sahayak-cream border border-sahayak-brown/15 relative">
            <img
              src={report.images[0]?.url || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500'}
              alt={report.title}
              className="w-full h-full object-cover"
            />
            {report.images[0]?.isReference && (
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-sahayak-blue-deep text-sahayak-gold">
                Reference Image
              </span>
            )}
          </div>

          <div className="md:col-span-2 space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sahayak-blue">
                {report.category.replace('_', ' ')}
              </span>
              <h2 className="font-heading font-bold text-xl text-sahayak-text-primary mt-0.5">
                {report.title}
              </h2>
              <p className="text-xs sm:text-sm text-sahayak-text-secondary mt-2 leading-relaxed">
                {report.description}
              </p>
            </div>

            {/* Separated Location Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-sahayak-cream border border-sahayak-brown/10 space-y-1">
                <span className="text-[11px] font-bold text-sahayak-text-muted flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sahayak-blue" />
                  <span>{isLost ? 'Estimated Place Lost' : 'Place Found'}</span>
                </span>
                <p className="text-xs font-bold text-sahayak-text-primary">{report.incidentPlace}</p>
              </div>

              <div className="p-3 rounded-xl bg-sahayak-cream border border-sahayak-brown/10 space-y-1">
                <span className="text-[11px] font-bold text-sahayak-text-muted flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-sahayak-gold" />
                  <span>Current Physical Custody</span>
                </span>
                <p className="text-xs font-bold text-sahayak-blue">
                  {report.currentLocation || 'NIE Main Security Desk Locker'}
                </p>
              </div>
            </div>

            {/* Distinguishing Details */}
            <div className="flex flex-wrap gap-4 text-xs pt-2">
              {report.brand && (
                <div className="px-3 py-1.5 rounded-xl bg-sahayak-cream border border-sahayak-brown/10">
                  <span className="text-sahayak-text-muted">Brand:</span> <strong>{report.brand}</strong>
                </div>
              )}
              {report.color && (
                <div className="px-3 py-1.5 rounded-xl bg-sahayak-cream border border-sahayak-brown/10">
                  <span className="text-sahayak-text-muted">Color:</span> <strong>{report.color}</strong>
                </div>
              )}
            </div>

            {/* Anti-Fraud Case Tracking & Security Verification Pass */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-sahayak-blue-deep to-sahayak-blue text-white space-y-3 shadow-neumorph-sm">
              <div className="flex items-center justify-between border-b border-white/20 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sahayak-gold" />
                  <span className="font-heading font-bold text-xs uppercase tracking-wider text-sahayak-gold">
                    Anti-Fraud Identity & Claim Pass
                  </span>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">OFFICIAL RECORD</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white/10 p-2.5 rounded-lg space-y-1">
                  <span className="text-[10px] text-white/70">Unique Tracking Number:</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-white">
                      {report.trackingNumber || `NIE-TRK-${report.id.substring(0, 8).toUpperCase()}`}
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(report.trackingNumber || report.id)}
                      className="text-white/70 hover:text-white p-0.5"
                      title="Copy Tracking Number"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="bg-white/10 p-2.5 rounded-lg space-y-1 border border-sahayak-gold/30">
                  <span className="text-[10px] text-sahayak-gold font-semibold flex items-center gap-1">
                    <KeyRound className="w-3 h-3" /> Security Claim PIN:
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-sm text-sahayak-gold">
                      {report.antiFraudCode || 'SEC-VERIFY'}
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(report.antiFraudCode || '')}
                      className="text-sahayak-gold/80 hover:text-sahayak-gold p-0.5"
                      title="Copy Security Claim PIN"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-white/75 leading-tight">
                🔒 Present this Unique Tracking Number & Secret PIN at the NIE Proctor Office or Security Desk to authenticate your claim and prevent imposter fraud.
              </p>
            </div>
          </div>
        </div>

        {/* Timeline & Active Status */}
        <div className="pt-4 border-t border-sahayak-brown/10 space-y-3">
          <h3 className="font-heading font-bold text-sm text-sahayak-blue-deep uppercase tracking-wider">
            Verification & Match Status
          </h3>
          <div className="p-4 rounded-xl bg-sahayak-cream border border-sahayak-brown/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sahayak-blue-ice text-sahayak-blue flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5 text-sahayak-gold" />
              </div>
              <div>
                <p className="text-xs font-bold text-sahayak-text-primary">
                  {report.status === 'RETURNED' ? 'Resolved & Handover Complete' : report.status === 'MATCHED' ? 'High-Confidence Neural Match Found' : 'Radar Scanning Campus Activity'}
                </p>
                <p className="text-[11px] text-sahayak-text-muted">
                  {report.status === 'RETURNED' ? 'This item has been safely resolved and returned to its owner.' : 'Cross-referencing newly registered inventory on NIE North.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {report.status !== 'RETURNED' && report.status !== 'CLOSED' && (
                <button
                  onClick={async () => {
                    try {
                      await reportsService.updateStatus(report.id, 'RETURNED');
                      setReport(prev => prev ? { ...prev, status: 'RETURNED' } : null);
                    } catch (err: any) {
                      alert(err?.message || 'Failed to resolve report.');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-sahayak-success text-white text-xs font-bold shadow-neumorph hover:bg-sahayak-success/90 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Mark as Resolved</span>
                </button>
              )}

              <Link
                to="/student/matches"
                className="px-4 py-2 rounded-xl bg-sahayak-blue text-white text-xs font-bold shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center gap-1.5"
              >
                <span>Open Match Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </NeumorphicCard>
    </div>
  );
};
