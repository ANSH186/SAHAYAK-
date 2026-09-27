import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  GitCompare,
  MapPin,
  CheckCircle2,
  Award,
  ScrollText,
  BellRing,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { SAHAYAKThread } from '../ui/SAHAYAKThread';

const adminNavItems = [
  { name: 'Console Overview', path: '/admin', icon: LayoutDashboard, exact: true },
  { name: 'Case Management', path: '/admin/reports', icon: ClipboardList },
  { name: 'Match Analytics', path: '/admin/matches', icon: GitCompare },
  { name: 'AI Vision Lab', path: '/admin/vision-lab', icon: Sparkles },
  { name: 'Location Heatmap', path: '/admin/locations', icon: MapPin },
  { name: 'Resolution Metrics', path: '/admin/resolution', icon: CheckCircle2 },
  { name: 'Reward Auditing', path: '/admin/rewards', icon: Award },
  { name: 'Security Audit Log', path: '/admin/audit', icon: ScrollText },
  { name: 'System Alerts', path: '/admin/notifications', icon: BellRing },
];

export const AdminSidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-sahayak-cream-soft border-r border-sahayak-brown/10 flex flex-col h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-sahayak-brown/10">
        <Link to="/admin" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-sahayak-blue-deep flex items-center justify-center text-sahayak-gold shadow-neumorph-sm group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-black text-xl text-sahayak-blue-deep tracking-wider">SAHAYAK</span>
              <span className="text-[10px] bg-sahayak-blue-deep text-sahayak-gold px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">SEC</span>
            </div>
            <p className="text-[11px] font-medium text-sahayak-text-muted">Proctor & Security Portal</p>
          </div>
        </Link>
        <div className="mt-3">
          <SAHAYAKThread height={2} activeStep={4} />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-sahayak-text-muted">
          Security Controls
        </div>
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-sahayak-blue text-white shadow-neumorph-sm font-semibold'
                    : 'text-sahayak-text-secondary hover:bg-sahayak-cream hover:text-sahayak-blue-deep'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sahayak-gold' : 'text-sahayak-text-muted'}`} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-white/70" />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Switch to Student Mode / NIE Info Footer */}
      <div className="p-4 border-t border-sahayak-brown/10 bg-sahayak-cream/40">
        <Link
          to="/student"
          className="flex items-center justify-between p-2.5 rounded-xl bg-sahayak-cream border border-sahayak-brown/15 hover:border-sahayak-blue/30 text-xs font-semibold text-sahayak-text-primary hover:text-sahayak-blue transition-all"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sahayak-gold" />
            <span>Switch to Student View</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-sahayak-text-muted" />
        </Link>
        <p className="text-[10px] text-sahayak-text-muted text-center mt-2.5">
          NIE North Campus Security v2.4
        </p>
      </div>
    </aside>
  );
};
