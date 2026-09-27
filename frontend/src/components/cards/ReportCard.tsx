import React from 'react';
import { ItemReport } from '../../types';
import { NeumorphicCard } from '../ui/NeumorphicCard';
import { StatusBadge } from '../ui/StatusBadge';
import { MapPin, Calendar, Clock, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../lib/utils';

export interface ReportCardProps {
  report: ItemReport;
  showActions?: boolean;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, showActions = true }) => {
  const isLost = report.type === 'LOST';
  const primaryImg = report.images?.[0]?.url || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500';
  const dateDisplay = report.incidentDate || report.dateLostOrFound;
  const timeDisplay = report.incidentTime || report.timeLostOrFound || 'Daytime';

  return (
    <NeumorphicCard variant="interactive" className="flex flex-col h-full group p-0 overflow-hidden border border-sahayak-brown/15 shadow-neumorph-sm">
      {/* Image Thumbnail */}
      <div className="relative h-48 w-full overflow-hidden bg-sahayak-cream">
        <img
          src={primaryImg}
          alt={report.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        <div className="absolute top-3 left-3 flex gap-2">
          <StatusBadge type={report.type} size="sm" />
        </div>

        <div className="absolute top-3 right-3">
          <StatusBadge status={report.status} size="sm" />
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <span className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 font-medium">
            {typeof report.category === 'string' ? report.category.replace('_', ' ') : 'Belongings'}
          </span>
          {(report.rewardPointsEligible || 30) > 0 && (
            <span className="bg-sahayak-gold text-sahayak-blue-deep font-bold px-2 py-0.5 rounded-md shadow-sm">
              +{report.rewardPointsEligible || 30} Pts
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold font-heading text-sahayak-text-primary group-hover:text-sahayak-blue transition-colors line-clamp-1">
            {report.title}
          </h3>
          <p className="text-xs text-sahayak-text-secondary mt-1.5 line-clamp-2 leading-relaxed">
            {report.description}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-sahayak-brown/10 space-y-2 text-xs text-sahayak-text-secondary">
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-sahayak-blue mt-0.5 shrink-0" />
            <span className="line-clamp-1 font-medium text-sahayak-text-primary">{report.incidentPlace}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-sahayak-text-muted">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(dateDisplay)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeDisplay}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {showActions && (
          <div className="mt-4 pt-3 flex items-center justify-between">
            <span className="text-[11px] text-sahayak-text-muted font-mono">
              ID: #{report.id?.slice(-6).toUpperCase() || 'REP-01'}
            </span>
            <Link
              to={`/student/reports/${report.id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-sahayak-blue hover:text-sahayak-blue-deep transition-colors"
            >
              <span>View Case Detail</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </NeumorphicCard>
  );
};
