import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportsService } from '../../lib/services';
import { ItemReport, ReportType } from '../../types';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingState } from '../../components/feedback/LoadingState';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  MapPin, 
  Building, 
  ArrowRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ItemReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'ALL' | ReportType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadReports() {
      try {
        const data = await reportsService.getAll();
        setReports(data);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  if (loading) {
    return <LoadingState message="Loading campus master case registry..." />;
  }

  const filtered = reports.filter(r => {
    const matchesType = typeFilter === 'ALL' || r.type === typeFilter;
    const title = r.title || '';
    const reporterName = r.reporterName || '';
    const reporterUSN = r.reporterUSN || '';
    const incidentPlace = r.incidentPlace || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          reporterUSN.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          incidentPlace.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleQuickResolve = async (reportId: string) => {
    try {
      await reportsService.updateStatus(reportId, 'RETURNED');
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'RETURNED' } : r));
    } catch (err: any) {
      alert(err?.message || 'Failed to update report status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sahayak-blue-ice text-sahayak-blue font-semibold text-xs mb-1">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Master Custody & Cases</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
            Campus Case Management
          </h1>
          <p className="text-xs sm:text-sm text-sahayak-text-secondary">
            Full repository of reported losses, physical deposits, and verification cases across NIE North.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-sahayak-cream-soft border border-sahayak-brown/15 shadow-neumorph-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sahayak-text-muted" />
          <input
            type="text"
            placeholder="Search by student USN, item title, custody desk..."
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
              {t === 'ALL' ? 'All Registry' : t === 'LOST' ? 'Lost Reports' : 'Found Items'}
            </button>
          ))}
        </div>
      </div>

      {/* Case Management Table */}
      <NeumorphicCard className="p-0 border border-sahayak-brown/15 overflow-hidden shadow-neumorph">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sahayak-cream border-b border-sahayak-brown/10 text-sahayak-text-muted uppercase tracking-wider font-bold">
              <tr>
                <th className="p-4">Case #</th>
                <th className="p-4">Item Details</th>
                <th className="p-4">Type</th>
                <th className="p-4">Incident Zone</th>
                <th className="p-4">Physical Custody</th>
                <th className="p-4">Reporter / USN</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sahayak-brown/10">
              {filtered.map((report) => (
                <tr key={report.id} className="hover:bg-sahayak-cream-soft/60 transition-colors">
                  <td className="p-4 font-mono font-bold text-sahayak-blue">
                    #{report.id}
                  </td>
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={report.images[0]?.url || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=100'}
                      alt={report.title}
                      className="w-10 h-10 rounded-lg object-cover border border-sahayak-brown/15"
                    />
                    <div>
                      <span className="font-bold text-sahayak-text-primary block">{report.title}</span>
                      <span className="text-[11px] text-sahayak-text-muted capitalize">{report.category.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      report.type === 'LOST' ? 'bg-sahayak-error-soft text-sahayak-error' : 'bg-sahayak-success-soft text-sahayak-success'
                    }`}>
                      {report.type}
                    </span>
                  </td>
                  <td className="p-4 text-sahayak-text-secondary">
                    {report.incidentPlace}
                  </td>
                  <td className="p-4 font-semibold text-sahayak-blue">
                    {report.currentLocation || 'NIE Main Security Desk'}
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-sahayak-text-primary block">{report.reporterName}</span>
                    <span className="font-mono text-[11px] text-sahayak-text-muted">{report.reporterUSN}</span>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {report.status !== 'RETURNED' && report.status !== 'CLOSED' && (
                        <button
                          onClick={() => handleQuickResolve(report.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-sahayak-success text-white text-[11px] font-bold hover:bg-sahayak-success/90 shadow-sm transition-all"
                          title="Mark as Resolved & Returned"
                        >
                          Resolve
                        </button>
                      )}
                      <Link
                        to={`/admin/reports/${report.id}`}
                        className="px-3 py-1.5 rounded-lg bg-sahayak-blue text-white text-xs font-bold hover:bg-sahayak-blue-mid inline-flex items-center gap-1"
                      >
                        <span>Manage</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </NeumorphicCard>
    </div>
  );
};
