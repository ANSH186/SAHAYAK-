import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Sparkles, 
  MessageSquare, 
  Map, 
  FileText, 
  Award, 
  Trophy, 
  Bot, 
  User, 
  Settings, 
  HelpCircle, 
  Shield, 
  Compass,
  UploadCloud,
  Scan
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { SAHAYAKThread } from '../ui/SAHAYAKThread';

interface StudentSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({ isOpen, onClose }) => {
  const mainNavItems = [
    { name: 'Dashboard', path: '/student', icon: LayoutDashboard, exact: true },
    { name: 'Report Lost', path: '/student/report-lost', icon: PlusCircle },
    { name: 'Report Found', path: '/student/report-found', icon: UploadCloud },
    { name: 'Match Radar', path: '/student/matches', icon: Sparkles, badge: 'Active' },
    { name: 'AI Vision Lab', path: '/student/vision-lab', icon: Scan, badge: 'YOLO Live' },
    { name: 'Messages & Recovery', path: '/student/messages', icon: MessageSquare },
    { name: 'Campus Map', path: '/student/map', icon: Map },
    { name: 'My Reports', path: '/student/reports', icon: FileText },
    { name: 'Rewards & Points', path: '/student/rewards', icon: Award },
    { name: 'Honor Leaderboard', path: '/student/leaderboard', icon: Trophy },
    { name: 'AI Assistant', path: '/student/assistant', icon: Bot },
  ];

  const secondaryNavItems = [
    { name: 'My Profile', path: '/student/profile', icon: User },
    { name: 'Settings', path: '/student/settings', icon: Settings },
    { name: 'FAQ & Help', path: '/student/help', icon: HelpCircle },
    { name: 'Privacy Shield', path: '/student/privacy', icon: Shield },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-fadeIn"
        />
      )}

      {/* Sidebar Container */}
      <aside className={cn(
        'fixed top-0 left-0 bottom-0 z-40 w-64 bg-sahayak-cream-soft border-r border-sahayak-brown/10 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen md:z-0 select-none',
        isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      )}>
        {/* Top Branding Area */}
        <div>
          <div className="h-20 flex items-center px-6 border-b border-sahayak-brown/10">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-sahayak-blue-deep flex items-center justify-center text-sahayak-gold shadow-neumorph-sm group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-lg tracking-tight text-sahayak-blue-deep">
                  SAHAYAK
                </span>
                <span className="text-[10px] font-semibold text-sahayak-text-muted">
                  NIE North Campus
                </span>
              </div>
            </Link>
          </div>

          <div className="px-4 py-2">
            <SAHAYAKThread height={2} activeStep={2} />
          </div>

          {/* Primary Navigation List */}
          <div className="px-3 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)]">
            <span className="px-3 text-[10px] font-bold text-sahayak-text-muted uppercase tracking-wider block mb-1.5">
              Campus Workflows
            </span>
            {mainNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.exact}
                onClick={onClose}
                className={({ isActive }) => cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group',
                  isActive
                    ? 'bg-sahayak-blue text-white shadow-neumorph-sm font-bold'
                    : 'text-sahayak-text-secondary hover:text-sahayak-blue-deep hover:bg-sahayak-cream'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-sahayak-gold-soft text-sahayak-blue-deep border border-sahayak-gold/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Bottom Secondary Nav */}
        <div className="p-3 border-t border-sahayak-brown/10 bg-sahayak-cream/40 space-y-1">
          <span className="px-3 text-[10px] font-bold text-sahayak-text-muted uppercase tracking-wider block mb-1">
            Account & Support
          </span>
          {secondaryNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => cn(
                'flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all',
                isActive
                  ? 'bg-sahayak-cream text-sahayak-blue-deep font-semibold shadow-neumorph-sm'
                  : 'text-sahayak-text-muted hover:text-sahayak-text-primary hover:bg-sahayak-cream'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
      </aside>
    </>
  );
};
