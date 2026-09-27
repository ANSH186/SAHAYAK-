import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Compass, Sparkles, HelpCircle, Shield, Menu, X, ArrowRight, LogOut } from 'lucide-react';
import { useAuth } from '../../lib/authContext';

export const PublicNavbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, role, logout, user } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'AI Vision Lab (YOLO)', path: '/vision-lab' },
    { name: 'FAQ & Help', path: '/help' },
    { name: 'Privacy Policy', path: '/privacy' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-sahayak-cream/90 backdrop-blur-md border-b border-sahayak-brown/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo with SAHAYAK Emblem */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sahayak-blue-deep via-sahayak-blue to-sahayak-blue-sky flex items-center justify-center text-white shadow-neumorph-sm border border-white/20 group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-extrabold text-xl tracking-tight text-sahayak-blue-deep">
                SAHAYAK
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sahayak-gold-soft text-sahayak-blue-deep border border-sahayak-gold/40">
                NIE MYSURU
              </span>
            </div>
            <span className="text-[11px] font-medium text-sahayak-text-muted tracking-wide">
              Campus Recovery & Lost and Found
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-semibold transition-colors hover:text-sahayak-blue ${
                location.pathname === link.path ? 'text-sahayak-blue-deep font-bold border-b-2 border-sahayak-blue pb-1' : 'text-sahayak-text-secondary'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-sahayak-blue-ice/60 border border-sahayak-blue/20 flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-sahayak-success animate-pulse" />
                <span className="font-semibold text-sahayak-blue-deep max-w-[120px] truncate">
                  {user?.fullName || user?.email || 'Logged In'}
                </span>
                <span className="text-[10px] uppercase font-bold text-sahayak-blue px-1.5 py-0.5 bg-sahayak-cream rounded">
                  {role}
                </span>
              </div>
              <Link
                to={role === 'admin' ? '/admin' : '/student'}
                className="px-4 py-2.5 rounded-xl bg-sahayak-blue text-white font-bold text-xs shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center gap-1.5"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/login"
                onClick={() => logout()}
                className="px-3 py-2.5 rounded-xl bg-sahayak-cream-soft border border-sahayak-brown/20 text-sahayak-blue text-xs font-bold shadow-neumorph hover:border-sahayak-blue transition-all"
                title="Switch to another student account"
              >
                Switch User
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-2.5 rounded-xl bg-sahayak-cream-soft border border-sahayak-brown/20 text-sahayak-text-secondary hover:text-sahayak-error transition-all cursor-pointer shadow-neumorph"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2.5 rounded-xl bg-sahayak-blue text-white text-xs font-bold shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center gap-1.5"
              >
                <span>Student Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/register/identity"
                className="px-4 py-2.5 rounded-xl bg-sahayak-cream-soft border border-sahayak-brown/20 text-sahayak-blue-deep text-xs font-bold shadow-neumorph hover:border-sahayak-blue transition-all"
              >
                Register
              </Link>
              <Link
                to="/admin/login"
                className="px-3 py-2.5 rounded-xl text-xs font-medium text-sahayak-text-muted hover:text-sahayak-blue-deep transition-all"
                title="Proctor / Admin Console"
              >
                Admin
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-sahayak-cream-soft border border-sahayak-brown/20 text-sahayak-text-primary"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-sahayak-cream-soft border-b border-sahayak-brown/10 px-4 pt-3 pb-6 space-y-3 shadow-xl">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-sahayak-text-primary hover:text-sahayak-blue"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-sahayak-brown/10 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 text-xs font-semibold text-sahayak-blue-deep bg-sahayak-blue-ice/40 rounded-lg">
                  Logged in as: {user?.fullName || user?.email} ({role})
                </div>
                <Link
                  to={role === 'admin' ? '/admin' : '/student'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-sahayak-blue text-white text-xs text-center font-bold"
                >
                  Open Dashboard
                </Link>
                <Link
                  to="/login"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-sahayak-cream border border-sahayak-brown/20 text-sahayak-blue text-xs text-center font-bold"
                >
                  Switch User / Sign In
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="px-4 py-2 rounded-xl bg-sahayak-cream border border-sahayak-brown/20 text-sahayak-error text-xs text-center font-bold"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-sahayak-blue text-white text-xs text-center font-bold shadow-neumorph"
                >
                  Student Sign In
                </Link>
                <Link
                  to="/register/identity"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-sahayak-cream border border-sahayak-brown/20 text-sahayak-blue-deep text-xs text-center font-bold"
                >
                  Register (USN)
                </Link>
                <Link
                  to="/admin/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xs text-center text-sahayak-text-muted pt-1 font-medium"
                >
                  Proctor / Campus Security Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
