import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { reportsService } from '../../lib/services';
import { ItemReport, ReportType } from '../../types';
import { ReportCard } from '../../components/cards/ReportCard';
import { LoadingState } from '../../components/feedback/LoadingState';
import { EmptyState } from '../../components/feedback/EmptyState';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  UploadCloud, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const MyReportsPage: React.FC = () => {
  const { studentUser, user } = useAuth();
  const currentUser = studentUser || user;

  const [reports, setReports] = useState<ItemReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'ALL' | ReportType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadReports() {
      try {
        const data = await reportsService.getMyReports(currentUser?.id, currentUser?.usn);
        setReports(data);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, [currentUser?.id, currentUser?.usn]);

  if (loading) {
    return <LoadingState message="Loading your campus reports..." />;
  }

  const filteredReports = reports.filter(r => {
    // Strict isolation: only reports created by current student
    const isOwner = !currentUser?.id || 
                    r.reporterId === currentUser.id || 
                    (currentUser.usn && r.reporterUSN === currentUser.usn) || 
                    (currentUser.email && r.reporterName === currentUser.email);
    if (!isOwner) return false;

    const matchesType = typeFilter === 'ALL' || r.type === typeFilter;
    const matchesSearch = (r.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (r.incidentPlace || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (r.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (r.trackingNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sahayak-blue-ice text-sahayak-blue font-semibold text-xs mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>Campus Registry Logs</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
            My Campus Reports
          </h1>
          <p className="text-xs sm:text-sm text-sahayak-text-secondary">
            Manage all lost item cases and found property reported by your account.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/student/report-lost"
            className="px-4 py-2.5 rounded-xl bg-sahayak-blue text-white text-xs font-bold shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center gap-2"
          >
            <span>+ Report Lost</span>
          </Link>
          <Link
            to="/student/report-found"
            className="px-4 py-2.5 rounded-xl bg-sahayak-cream-soft border border-sahayak-brown/20 text-sahayak-blue text-xs font-bold shadow-neumorph hover:border-sahayak-blue transition-all flex items-center gap-2"
          >
            <span>+ Report Found</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-sahayak-cream-soft border border-sahayak-brown/15 shadow-neumorph-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sahayak-text-muted" />
          <input
            type="text"
            placeholder="Search report title, location, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl pl-10 pr-4 py-2 text-xs text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(['ALL', 'LOST', 'FOUND'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                typeFilter === t
                  ? 'bg-sahayak-blue text-white shadow-neumorph-sm'
                  : 'bg-sahayak-cream border border-sahayak-brown/15 text-sahayak-text-secondary hover:border-sahayak-blue'
              }`}
            >
              {t === 'ALL' ? 'All Reports' : t === 'LOST' ? 'Lost Items' : 'Found Items'}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <EmptyState
          title="No Reports Found"
          description="You haven't submitted any reports matching this filter."
          actionText="Submit New Report"
          actionLink="/student/report-lost"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
};
