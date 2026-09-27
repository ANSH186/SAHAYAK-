import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { ItemReport, MatchItem } from '../../types';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ReportCard } from '../../components/cards/ReportCard';
import { MatchCard } from '../../components/cards/MatchCard';
import { 
  Search, 
  UploadCloud, 
  Sparkles, 
  Award, 
  ArrowRight, 
  Clock, 
  MapPin, 
  FileSearch,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  FolderOpen
} from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  const { studentUser, user } = useAuth();
  const [reports, setReports] = useState<ItemReport[]>([]);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = studentUser || user;
  const fullName = currentUser?.fullName || currentUser?.name || 'Student';
  const firstName = fullName.split(' ')[0] || 'Student';

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [rList, mList] = await Promise.all([
          currentUser?.id ? api.reports.list({ reporter_id: currentUser.id }) : api.reports.list(),
          api.matches.list()
        ]);
        const userReports = (rList || []).filter(r => 
          !currentUser?.id || 
          r.reporterId === currentUser.id || 
          (currentUser.usn && r.reporterUSN === currentUser.usn) || 
          (currentUser.email && r.reporterName === currentUser.email)
        );
        setReports(userReports);
        setMatches(mList || []);
      } catch (err) {
        console.warn('Live dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser?.id, currentUser?.usn, currentUser?.email]);

  const activeReports = (reports || []).filter(r => r.status !== 'RETURNED' && r.status !== 'SAFELY_RETURNED');
  const userMatches = (matches || []).slice(0, 3);
  const highSignalMatches = (matches || []).filter(m => (m.similarityScore || 0) >= 80);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sahayak-blue-deep via-sahayak-blue to-sahayak-blue-mid text-white p-6 sm:p-8 shadow-neumorph">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-sahayak-gold text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NIE North Campus Portal</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white">
              Welcome back, {firstName}!
            </h1>
            <p className="text-white/80 text-xs sm:text-sm">
              Logged in as <span className="font-bold text-sahayak-gold">{currentUser?.email}</span> ({currentUser?.usn || 'Institutional ID'}) • {currentUser?.department || currentUser?.branch || 'NIE Mysuru'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/student/report-lost"
              className="px-5 py-3 rounded-xl bg-sahayak-gold text-sahayak-blue-deep font-heading font-bold text-xs sm:text-sm shadow-neumorph hover:bg-sahayak-gold-light transition-all flex items-center gap-2"
            >
              <span>I Lost Something</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/student/report-found"
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-heading font-bold text-xs sm:text-sm backdrop-blur-md transition-all flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4 text-sahayak-gold" />
              <span>Report Found Item</span>
            </Link>
          </div>
        </div>

        {/* Subtle Bottom Accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-sahayak-gold via-sahayak-blue-sky to-white" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Reports"
          value={activeReports.length}
          subtitle="Under Neural Radar"
          icon={FileSearch}
          color="blue"
        />
        <StatCard
          title="High-Signal Matches"
          value={highSignalMatches.length}
          subtitle="Ready for Verification"
          icon={Sparkles}
          color="gold"
        />
        <StatCard
          title="Finder Points"
          value={currentUser?.points ?? currentUser?.finderPoints ?? 0}
          subtitle={currentUser?.badgeLevel || "Campus Member"}
          icon={Award}
          color="green"
        />
        <StatCard
          title="Verified Recoveries"
          value={currentUser?.recoveredCount ?? 0}
          subtitle="100% Handover Integrity"
          icon={ShieldCheck}
          color="blue"
        />
      </div>

      {/* Active AI Matches Radar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-sahayak-gold animate-ping" />
            <h2 className="font-heading font-bold text-lg sm:text-xl text-sahayak-blue-deep">
              Active AI Match Radar
            </h2>
          </div>
          <Link
            to="/student/matches"
            className="text-xs font-bold text-sahayak-blue hover:underline flex items-center gap-1"
          >
            <span>View All Matches ({matches.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {matches.length === 0 ? (
          <NeumorphicCard className="p-8 text-center border border-sahayak-brown/15 shadow-neumorph-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sahayak-blue-ice text-sahayak-blue mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-sm text-sahayak-blue-deep">
              No High-Confidence Matches Detected Yet
            </h3>
            <p className="text-xs text-sahayak-text-secondary max-w-md mx-auto">
              As soon as lost or found items are reported around NIE North campus, the neural matcher compares item attributes and visual signatures automatically.
            </p>
          </NeumorphicCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {userMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity & Campus Recovery Map Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Active Reports */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-lg text-sahayak-blue-deep">
              My Reported Items ({reports.length})
            </h2>
            <Link
              to="/student/reports"
              className="text-xs font-bold text-sahayak-blue hover:underline"
            >
              Manage Reports
            </Link>
          </div>

          {reports.length === 0 ? (
            <NeumorphicCard className="p-8 text-center border border-sahayak-brown/15 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sahayak-cream-soft text-sahayak-text-muted mx-auto flex items-center justify-center">
                <FolderOpen className="w-6 h-6" />
              </div>
              <p className="text-xs text-sahayak-text-secondary">
                No reports submitted yet. Report lost or found property to begin tracking.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Link
                  to="/student/report-lost"
                  className="px-4 py-2 rounded-xl bg-sahayak-blue text-white text-xs font-bold shadow-neumorph hover:bg-sahayak-blue-mid"
                >
                  Report Lost
                </Link>
                <Link
                  to="/student/report-found"
                  className="px-4 py-2 rounded-xl bg-sahayak-cream border border-sahayak-brown/20 text-sahayak-blue-deep text-xs font-bold"
                >
                  Report Found
                </Link>
              </div>
            </NeumorphicCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reports.slice(0, 4).map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Quick Campus Map & Help */}
        <div className="space-y-4">
          <h2 className="font-heading font-bold text-lg text-sahayak-blue-deep">
            Campus Activity Map
          </h2>
          <NeumorphicCard className="p-5 border border-sahayak-brown/15 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-sahayak-blue">
                <MapPin className="w-3.5 h-3.5" />
                <span>NIE North Campus Zones</span>
              </div>
              <p className="text-xs text-sahayak-text-secondary">
                View lost & found clusters around Sir MV Block, Library, and Canteen.
              </p>
            </div>

            <div className="h-32 rounded-xl bg-sahayak-blue-deep/5 border border-sahayak-brown/15 relative overflow-hidden flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1524813686514-a57563d77d66?w=600&auto=format&fit=crop&q=60"
                alt="Map Background"
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
              <Link
                to="/student/map"
                className="relative z-10 px-4 py-2 rounded-xl bg-sahayak-blue text-white text-xs font-bold shadow-neumorph hover:bg-sahayak-blue-mid transition-all"
              >
                Open Live Campus Map
              </Link>
            </div>

            <div className="pt-2 border-t border-sahayak-brown/10 flex items-center justify-between text-xs">
              <span className="text-sahayak-text-muted">Need assistant guidance?</span>
              <Link to="/student/assistant" className="text-sahayak-blue font-bold hover:underline">
                Ask SAHAYAK AI
              </Link>
            </div>
          </NeumorphicCard>
        </div>
      </div>
    </div>
  );
};
