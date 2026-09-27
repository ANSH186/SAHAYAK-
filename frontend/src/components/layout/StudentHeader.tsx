import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { Bell, Search, Award, Bot, Menu, LogOut, PlusCircle, Sparkles } from 'lucide-react';

interface StudentHeaderProps {
  onToggleSidebar?: () => void;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function loadNotifs() {
      try {
        const notifs = await api.notifications.list();
        if (Array.isArray(notifs)) {
          setUnreadCount(notifs.filter((n: any) => !n.isRead && !n.read).length);
        }
      } catch (err) {
        // silent
      }
    }
    loadNotifs();
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur-md border-b border-cream-warm h-16 sm:h-20 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Left: Mobile Toggle & Page Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl bg-cream-soft border border-cream-warm text-sahayak-text"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden md:flex items-center gap-2 bg-cream-soft border border-cream-warm rounded-xl px-3 py-1.5 shadow-neu-inset w-64">
          <Search className="w-4 h-4 text-sahayak-muted" />
          <input
            type="text"
            placeholder="Search items, places, USN..."
            className="bg-transparent border-none outline-none text-xs w-full text-sahayak-text placeholder:text-sahayak-muted"
          />
        </div>
      </div>

      {/* Center: Quick Action CTA */}
      <div className="flex items-center gap-2">
        <Link
          to="/student/report-lost"
          className="neu-btn-secondary text-xs py-2 px-3 sm:px-4 flex items-center gap-1.5 border-sahayak-error/30 text-sahayak-error hover:bg-sahayak-errorSoft/30"
        >
          <PlusCircle className="w-4 h-4" />
          <span>I Lost Something</span>
        </Link>
        <Link
          to="/student/report-found"
          className="neu-btn-primary text-xs py-2 px-3 sm:px-4 flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>I Found Something</span>
        </Link>
      </div>

      {/* Right: Points, AI Assistant, Notifications & Profile Avatar */}
      <div className="flex items-center gap-3">
        {/* Finder Points Chip */}
        <Link
          to="/student/rewards"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gold-soft border border-gold/40 rounded-xl text-xs font-bold text-primary-dark shadow-sm hover:scale-105 transition-transform"
        >
          <Award className="w-4 h-4 text-gold-dark" />
          <span>{user?.points ?? user?.finderPoints ?? 0} Pts</span>
        </Link>

        {/* AI Assistant Pill */}
        <Link
          to="/student/assistant"
          className="p-2.5 rounded-xl bg-sky-ice border border-sky-soft text-sky hover:bg-sky-soft/40 transition-colors relative"
          title="SAHAYAK AI Assistant"
        >
          <Bot className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky"></span>
          </span>
        </Link>

        {/* Notifications Icon */}
        <Link
          to="/student/notifications"
          className="p-2.5 rounded-xl bg-cream-soft border border-cream-warm text-sahayak-text hover:bg-cream transition-colors relative"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-sahayak-error text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* User Avatar & Menu */}
        <div className="flex items-center gap-2 pl-2 border-l border-cream-warm">
          <Link to="/student/profile" className="flex items-center gap-2 group">
            <img
              src={user?.avatar || user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={user?.fullName || user?.name || 'User'}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border border-primary-dark/20 group-hover:scale-105 transition-transform shadow-sm"
            />
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-bold text-sahayak-text leading-tight group-hover:text-primary">
                {(user?.fullName || user?.name || 'Student').split(' ')[0]}
              </span>
              <span className="text-[10px] text-sahayak-muted">{user?.usn || '4NI21CS089'}</span>
            </div>
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            title="Log Out"
            className="hidden sm:flex p-2 text-sahayak-muted hover:text-sahayak-error rounded-lg"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
