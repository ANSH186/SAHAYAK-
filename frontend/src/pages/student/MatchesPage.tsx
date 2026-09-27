import React, { useState, useEffect } from 'react';
import { matchingService } from '../../lib/services';
import { api } from '../../lib/api';
import { MatchItem } from '../../types';
import { MatchCard } from '../../components/cards/MatchCard';
import { LoadingState } from '../../components/feedback/LoadingState';
import { EmptyState } from '../../components/feedback/EmptyState';
import { SAHAYAKThread } from '../../components/ui/SAHAYAKThread';
import { Sparkles, Filter, Search, RefreshCw, Zap, ShieldAlert, Cpu } from 'lucide-react';

export const MatchesPage: React.FC = () => {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [filterScore, setFilterScore] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const fetchMatches = async () => {
    try {
      const data = await matchingService.getAll();
      if (Array.isArray(data)) {
        setMatches(data);
      }
    } catch (err) {
      console.warn('Live matches fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleTriggerScan = async () => {
    setScanning(true);
    setScanMessage(null);
    try {
      const res = await matchingService.rescanMatches();
      if (Array.isArray(res)) {
        setMatches(res);
        setScanMessage(`Neural AI Scan evaluated all database items! Found ${res.length} potential matches.`);
      }
    } catch (err) {
      console.warn('Scan trigger error:', err);
    } finally {
      setScanning(false);
      setTimeout(() => setScanMessage(null), 5000);
    }
  };

  if (loading) {
    return <LoadingState message="Scanning NIE North neural match radar..." />;
  }

  const filteredMatches = matches.filter(m => {
    const lostTitle = m.lostReport?.title || '';
    const foundTitle = m.foundReport?.title || '';
    const lostPlace = m.lostReport?.incidentPlace || '';
    const matchesQuery = lostTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         foundTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lostPlace.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesQuery && m.similarityScore >= filterScore;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sahayak-blue-ice text-sahayak-blue font-semibold text-xs">
            <Sparkles className="w-3.5 h-3.5 text-sahayak-gold" />
            <span>Multi-Signal Neural Match Center</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
            AI Match Radar
          </h1>
          <p className="text-xs sm:text-sm text-sahayak-text-secondary">
            Cross-referenced lost reports and recovered campus items using AI visual description generation, semantic text similarity, and category penalty filtering.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerScan}
            disabled={scanning}
            className={`px-4 py-2.5 rounded-xl font-heading font-bold text-xs shadow-neumorph transition-all flex items-center gap-2 ${
              scanning 
                ? 'bg-sahayak-blue-deep text-sahayak-gold animate-pulse' 
                : 'bg-sahayak-blue text-white hover:bg-sahayak-blue-mid'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
            <span>{scanning ? 'Analyzing Radar Vectors...' : '⚡ Run Neural Radar AI Scan'}</span>
          </button>
        </div>
      </div>

      {scanMessage && (
        <div className="p-3 bg-sahayak-blue-ice/80 border border-sahayak-blue/30 rounded-xl text-xs text-sahayak-blue flex items-center gap-2 animate-fadeIn">
          <Cpu className="w-4 h-4 text-sahayak-blue shrink-0" />
          <span className="font-semibold">{scanMessage}</span>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-sahayak-cream-soft border border-sahayak-brown/15 shadow-neumorph-sm flex items-center gap-3">
          <div className="p-2 bg-sahayak-blue-ice text-sahayak-blue rounded-lg">
            <Zap className="w-4 h-4 text-sahayak-gold" />
          </div>
          <div>
            <div className="text-lg font-bold text-sahayak-blue-deep">{matches.length}</div>
            <div className="text-[11px] text-sahayak-text-muted">Active Radar Matches</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-sahayak-cream-soft border border-sahayak-brown/15 shadow-neumorph-sm flex items-center gap-3">
          <div className="p-2 bg-sahayak-success-soft text-sahayak-success rounded-lg">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-sahayak-text-primary">
              {matches.filter(m => m.similarityScore >= 80).length}
            </div>
            <div className="text-[11px] text-sahayak-text-muted">High Confidence Pairs (&ge;80%)</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-sahayak-cream-soft border border-sahayak-brown/15 shadow-neumorph-sm flex items-center gap-3">
          <div className="p-2 bg-sahayak-gold/20 text-sahayak-gold rounded-lg">
            <ShieldAlert className="w-4 h-4 text-sahayak-gold" />
          </div>
          <div>
            <div className="text-lg font-bold text-sahayak-text-primary">Strict Rejection</div>
            <div className="text-[11px] text-sahayak-text-muted">Cross-Class Mismatch Gating (-1.0)</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-sahayak-cream-soft border border-sahayak-brown/15 shadow-neumorph-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sahayak-text-muted" />
          <input
            type="text"
            placeholder="Search matching items, locations, descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl pl-10 pr-4 py-2 text-xs text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 text-xs text-sahayak-text-muted">
            <Filter className="w-3.5 h-3.5" />
            <span>Signal Threshold:</span>
          </div>
          <select
            value={filterScore}
            onChange={(e) => setFilterScore(Number(e.target.value))}
            className="bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-3 py-2 text-xs font-semibold text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
          >
            <option value={0}>All Matches</option>
            <option value={70}>Moderate Signal (&ge; 70%)</option>
            <option value={80}>High Signal (&ge; 80%)</option>
            <option value={90}>Very High (&ge; 90%)</option>
          </select>
        </div>
      </div>

      {/* Matches Grid */}
      {filteredMatches.length === 0 ? (
        <EmptyState
          title="No Matching Pairs Found"
          description="There are currently no items matching your threshold. As new items are found on campus, our neural radar updates in real-time."
          actionText="Report a Lost Item"
          actionLink="/student/report-lost"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
};
