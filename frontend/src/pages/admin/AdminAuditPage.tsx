import React, { useState, useEffect } from 'react';
import { auditService } from '../../lib/services';
import { AuditEvent } from '../../types';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { LoadingState } from '../../components/feedback/LoadingState';
import { 
  ScrollText, 
  Search, 
  Filter, 
  ShieldCheck, 
  Lock, 
  UserCheck,
  Calendar
} from 'lucide-react';

export const AdminAuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await auditService.getRecentLogs();
        setLogs(data);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  if (loading) {
    return <LoadingState message="Loading security audit records..." />;
  }

  const filteredLogs = logs.filter(l =>
    l.description.toLowerCase().includes(search.toLowerCase()) ||
    l.actor.toLowerCase().includes(search.toLowerCase()) ||
    (l.caseId && l.caseId.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sahayak-blue-ice text-sahayak-blue font-semibold text-xs mb-1">
          <ScrollText className="w-3.5 h-3.5 text-sahayak-gold" />
          <span>Immutable System Ledger</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
          Security & Custody Audit Trail
        </h1>
        <p className="text-xs sm:text-sm text-sahayak-text-secondary">
          Cryptographically timestamped log of report creations, verification approvals, locker handovers, and proctor signoffs.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sahayak-text-muted" />
        <input
          type="text"
          placeholder="Filter by actor, case #, event keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-sahayak-cream-soft border border-sahayak-brown/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
        />
      </div>

      {/* Logs Table */}
      <NeumorphicCard className="p-0 border border-sahayak-brown/15 overflow-hidden shadow-neumorph">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sahayak-cream border-b border-sahayak-brown/10 text-sahayak-text-muted uppercase tracking-wider font-bold">
              <tr>
                <th className="p-4">Log ID</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Event Type</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Target Case</th>
                <th className="p-4">Audit Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sahayak-brown/10">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-sahayak-cream-soft/60 transition-colors">
                  <td className="p-4 font-mono font-bold text-sahayak-text-muted">
                    #{log.id}
                  </td>
                  <td className="p-4 font-mono text-[11px] text-sahayak-text-secondary">
                    {log.timestamp}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sahayak-blue-ice text-sahayak-blue">
                      {log.eventType}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-sahayak-text-primary">
                    {log.actor}
                  </td>
                  <td className="p-4 font-mono text-sahayak-blue">
                    {log.caseId ? `#${log.caseId}` : '—'}
                  </td>
                  <td className="p-4 text-sahayak-text-secondary">
                    {log.description}
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
