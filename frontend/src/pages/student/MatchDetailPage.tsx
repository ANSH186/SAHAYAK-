import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { matchingService } from '../../lib/services';
import { MatchItem } from '../../types';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SAHAYAKThread } from '../../components/ui/SAHAYAKThread';
import { LoadingState } from '../../components/feedback/LoadingState';
import { 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Clock, 
  ArrowRight, 
  ArrowLeft,
  ChevronRight,
  HelpCircle,
  MessageSquare,
  Building,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const MatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [match, setMatch] = useState<MatchItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatch() {
      if (!id) return;
      try {
        const data = await matchingService.getMatchById(id);
        setMatch(data || null);
      } finally {
        setLoading(false);
      }
    }
    loadMatch();
  }, [id]);

  if (loading) {
    return <LoadingState message="Analyzing neural match signals..." />;
  }

  if (!match) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-xl font-heading font-bold text-sahayak-text-primary">Match Record Not Found</h2>
        <Link to="/student/matches" className="text-sahayak-blue font-bold hover:underline">
          Back to Match Radar
        </Link>
      </div>
    );
  }

  const { lostReport, foundReport, signals, similarityScore } = match;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/student/matches"
            className="inline-flex items-center gap-1.5 text-xs text-sahayak-text-muted hover:text-sahayak-blue mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Matches</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
              Match Analysis #{match.id}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-sahayak-blue-ice text-sahayak-blue border border-sahayak-blue-sky/30">
              {similarityScore}% Match Signal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/student/verification/${match.id}`}
            className="px-5 py-2.5 rounded-xl bg-sahayak-blue text-white text-xs font-heading font-bold shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-sahayak-gold" />
            <span>Start Verification</span>
          </Link>
        </div>
      </div>

      {/* SAHAYAK Pipeline Progress */}
      <div className="p-4 rounded-2xl bg-sahayak-cream-soft border border-sahayak-brown/15 shadow-neumorph-sm space-y-2">
        <SAHAYAKThread activeStep={2} height={3} />
        <div className="flex justify-between text-[11px] font-semibold text-sahayak-text-muted">
          <span>Report Submitted</span>
          <span className="text-sahayak-blue font-bold">Multi-Signal Matched (Current)</span>
          <span>Ownership Verification</span>
          <span>Handover Authorization</span>
          <span>Item Returned</span>
        </div>
      </div>

      {/* Side-by-side Comparative Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Lost Item */}
        <NeumorphicCard className="p-6 border border-sahayak-brown/15 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sahayak-brown/10">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sahayak-error-soft text-sahayak-error">
              LOST ITEM REPORT
            </span>
            <span className="text-xs font-mono text-sahayak-text-muted">#{lostReport.id}</span>
          </div>

          <div className="aspect-video w-full rounded-xl overflow-hidden bg-sahayak-cream border border-sahayak-brown/15 relative">
            <img
              src={lostReport.images[0]?.url || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400'}
              alt={lostReport.title}
              className="w-full h-full object-cover"
            />
            {lostReport.images[0]?.isReference && (
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-sahayak-blue-deep/80 text-sahayak-gold backdrop-blur-sm">
                Reference Photo
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-heading font-bold text-lg text-sahayak-text-primary">
              {lostReport.title}
            </h3>
            <p className="text-xs text-sahayak-text-secondary leading-relaxed">
              {lostReport.description}
            </p>
          </div>

          {signals?.descriptionA && (
            <div className="p-3 bg-sahayak-blue-ice/60 rounded-xl border border-sahayak-blue/20 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-sahayak-blue">
                <Sparkles className="w-3.5 h-3.5 text-sahayak-gold" />
                <span>AI Vision Auto-Generated Description</span>
              </div>
              <p className="text-xs text-sahayak-text-primary italic">
                "{signals.descriptionA}"
              </p>
            </div>
          )}

          <div className="space-y-1.5 pt-2 border-t border-sahayak-brown/10 text-xs">
            <div className="flex items-center gap-2 text-sahayak-text-secondary">
              <MapPin className="w-3.5 h-3.5 text-sahayak-blue" />
              <span>Lost at: <strong className="text-sahayak-text-primary">{lostReport.incidentPlace}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sahayak-text-secondary">
              <Calendar className="w-3.5 h-3.5 text-sahayak-blue" />
              <span>Date: {lostReport.incidentDate} at {lostReport.incidentTime}</span>
            </div>
          </div>
        </NeumorphicCard>

        {/* Right: Found Item */}
        <NeumorphicCard className="p-6 border border-sahayak-brown/15 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sahayak-brown/10">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sahayak-success-soft text-sahayak-success">
              FOUND ITEM RECOVERED
            </span>
            <span className="text-xs font-mono text-sahayak-text-muted">#{foundReport.id}</span>
          </div>

          <div className="aspect-video w-full rounded-xl overflow-hidden bg-sahayak-cream border border-sahayak-brown/15 relative">
            <img
              src={foundReport.images[0]?.url || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400'}
              alt={foundReport.title}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-sahayak-success text-white">
              Captured Photo
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="font-heading font-bold text-lg text-sahayak-text-primary">
              {foundReport.title}
            </h3>
            <p className="text-xs text-sahayak-text-secondary leading-relaxed">
              {foundReport.description}
            </p>
          </div>

          {signals?.descriptionB && (
            <div className="p-3 bg-sahayak-success-soft/60 rounded-xl border border-sahayak-success/20 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-sahayak-success">
                <Sparkles className="w-3.5 h-3.5 text-sahayak-gold" />
                <span>AI Vision Auto-Generated Description</span>
              </div>
              <p className="text-xs text-sahayak-text-primary italic">
                "{signals.descriptionB}"
              </p>
            </div>
          )}

          <div className="space-y-1.5 pt-2 border-t border-sahayak-brown/10 text-xs">
            <div className="flex items-center gap-2 text-sahayak-text-secondary">
              <MapPin className="w-3.5 h-3.5 text-sahayak-success" />
              <span>Found at: <strong className="text-sahayak-text-primary">{foundReport.incidentPlace}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sahayak-text-secondary">
              <Building className="w-3.5 h-3.5 text-sahayak-gold" />
              <span>Current Stash: <strong className="text-sahayak-blue">{foundReport.currentLocation}</strong></span>
            </div>
          </div>
        </NeumorphicCard>
      </div>

      {/* Signal Breakdown Section */}
      <NeumorphicCard className="p-6 border border-sahayak-brown/15 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sahayak-gold" />
            <h3 className="font-heading font-bold text-base text-sahayak-text-primary">
              Multi-Vector Match Signal Breakdown
            </h3>
          </div>
          <span className="text-xs text-sahayak-text-muted">
            Neural weights calculated via edge AI inference
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-sahayak-text-secondary">Visual / Contour Similarity</span>
              <span className="text-sahayak-blue font-bold">{signals.imageSimilarity}%</span>
            </div>
            <div className="w-full h-2 bg-sahayak-cream rounded-full overflow-hidden border border-sahayak-brown/10">
              <div
                className="h-full bg-sahayak-blue rounded-full transition-all"
                style={{ width: `${signals.imageSimilarity}%` }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-sahayak-text-secondary">AI Description Agreement</span>
              <span className="text-sahayak-blue font-bold">{signals.descriptionSimilarity ?? signals.imageSimilarity}%</span>
            </div>
            <div className="w-full h-2 bg-sahayak-cream rounded-full overflow-hidden border border-sahayak-brown/10">
              <div
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${signals.descriptionSimilarity ?? signals.imageSimilarity}%` }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-sahayak-text-secondary">Description & Brand Match</span>
              <span className="text-sahayak-blue font-bold">{signals.textSimilarity}%</span>
            </div>
            <div className="w-full h-2 bg-sahayak-cream rounded-full overflow-hidden border border-sahayak-brown/10">
              <div
                className="h-full bg-sahayak-blue-mid rounded-full transition-all"
                style={{ width: `${signals.textSimilarity}%` }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-sahayak-text-secondary">Campus Location Proximity</span>
              <span className="text-sahayak-blue font-bold">{signals.locationScore}%</span>
            </div>
            <div className="w-full h-2 bg-sahayak-cream rounded-full overflow-hidden border border-sahayak-brown/10">
              <div
                className="h-full bg-sahayak-gold rounded-full transition-all"
                style={{ width: `${signals.locationScore}%` }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-sahayak-text-secondary">Timestamp Correlation</span>
              <span className="text-sahayak-blue font-bold">{signals.timeScore}%</span>
            </div>
            <div className="w-full h-2 bg-sahayak-cream rounded-full overflow-hidden border border-sahayak-brown/10">
              <div
                className="h-full bg-sahayak-success rounded-full transition-all"
                style={{ width: `${signals.timeScore}%` }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-sahayak-text-secondary">Class Compatibility Check</span>
              <span className="text-sahayak-success font-bold">Passed (No Penalty)</span>
            </div>
            <div className="w-full h-2 bg-sahayak-cream rounded-full overflow-hidden border border-sahayak-brown/10">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `100%` }}
              />
            </div>
          </div>
        </div>

        {/* Explainability Details */}
        <div className="p-4 rounded-xl bg-sahayak-cream border border-sahayak-brown/10 space-y-2">
          <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-sahayak-blue-deep">
            Why this match was flagged:
          </h4>
          <ul className="space-y-1 text-xs text-sahayak-text-secondary">
            {signals.reasons.map((reason, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sahayak-success shrink-0" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Footer */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-sahayak-text-muted">
            <AlertTriangle className="w-4 h-4 text-sahayak-gold" />
            <span>Claiming an item triggers official ownership verification.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              to={`/student/messages?matchId=${match.id}`}
              className="px-4 py-2.5 rounded-xl bg-sahayak-cream border border-sahayak-brown/20 text-sahayak-text-primary text-xs font-bold hover:border-sahayak-blue transition-all flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Message Finder / Claimant</span>
            </Link>
            <Link
              to={`/student/verification/${match.id}`}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-sahayak-blue text-white text-xs font-heading font-bold shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center justify-center gap-2"
            >
              <span>Verify My Ownership</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </NeumorphicCard>
    </div>
  );
};
