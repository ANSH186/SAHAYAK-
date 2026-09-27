import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { 
  ShieldAlert, 
  Bell, 
  Search, 
  LogOut, 
  UserCheck, 
  Layers,
  ChevronDown
} from 'lucide-react';

export const AdminHeader: React.FC = () => {
  const { adminUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-sahayak-cream/90 backdrop-blur-md border-b border-sahayak-brown/10 px-4 lg:px-8 py-3 transition-all">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Mobile Title or Search */}
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-md hidden sm:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sahayak-text-muted" />
            <input
              type="text"
              placeholder="Search case #, USN, item tag, keyword..."
              className="w-full bg-sahayak-cream-soft border border-sahayak-brown/15 rounded-xl pl-10 pr-4 py-2 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue focus:border-transparent placeholder:text-sahayak-text-muted/60 transition-all"
            />
          </div>
        </div>

        {/* Right: Security Badge & Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/admin/notifications"
            className="relative p-2.5 rounded-xl bg-sahayak-cream-soft border border-sahayak-brown/15 hover:border-sahayak-blue/30 text-sahayak-text-primary hover:text-sahayak-blue transition-all shadow-neumorph-sm"
            title="Admin Alerts"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-sahayak-error rounded-full ring-2 ring-sahayak-cream" />
          </Link>

          <div className="h-6 w-px bg-sahayak-brown/20 hidden sm:block" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sahayak-blue-deep text-white flex items-center justify-center font-bold font-heading shadow-neumorph-sm">
              <ShieldAlert className="w-5 h-5 text-sahayak-gold" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-bold text-sahayak-text-primary leading-tight">
                {adminUser?.fullName || 'Campus Security / Admin'}
              </p>
              <p className="text-xs text-sahayak-blue font-medium capitalize">
                {adminUser?.role ? adminUser.role.replace('_', ' ') : 'Proctor'} • {adminUser?.department || 'NIE North'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-sahayak-cream-soft border border-sahayak-brown/15 hover:bg-sahayak-error-soft hover:text-sahayak-error text-sahayak-text-muted transition-all shadow-neumorph-sm"
            title="Sign out of Security Console"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
