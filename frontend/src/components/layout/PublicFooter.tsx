import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Heart, MapPin } from 'lucide-react';
import { SAHAYAKThread } from '../ui/SAHAYAKThread';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-sahayak-cream-soft border-t border-sahayak-brown/10 pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sahayak-blue-deep flex items-center justify-center text-white shadow-neumorph-sm">
                <Compass className="w-5 h-5 text-sahayak-gold" />
              </div>
              <span className="font-heading font-bold text-lg text-sahayak-blue-deep">SAHAYAK</span>
            </div>
            <p className="text-xs text-sahayak-text-secondary leading-relaxed">
              Official AI-assisted recovery network & campus lost-and-found system for The National Institute of Engineering, Mysuru.
            </p>
            <div className="flex items-center gap-2 text-xs text-sahayak-text-muted">
              <MapPin className="w-3.5 h-3.5 text-sahayak-blue" />
              <span>NIE North Campus, Koorgalli, Mysuru</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-sahayak-text-primary font-heading mb-4">
              Campus Workflows
            </h4>
            <ul className="space-y-2.5 text-xs text-sahayak-text-secondary">
              <li><Link to="/login" className="hover:text-sahayak-blue">Report Lost Item</Link></li>
              <li><Link to="/login" className="hover:text-sahayak-blue">Report Found Belonging</Link></li>
              <li><Link to="/login" className="hover:text-sahayak-blue">Active Match Center</Link></li>
              <li><Link to="/help" className="hover:text-sahayak-blue">Campus Collection Points</Link></li>
            </ul>
          </div>

          {/* Recognition & Trust */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-sahayak-text-primary font-heading mb-4">
              Support & Institutional
            </h4>
            <ul className="space-y-2.5 text-xs text-sahayak-text-secondary">
              <li><Link to="/help" className="hover:text-sahayak-blue font-semibold text-sahayak-blue">FAQ & Help Center</Link></li>
              <li><Link to="/privacy" className="hover:text-sahayak-blue font-semibold text-sahayak-blue">Privacy & Safety Policy</Link></li>
              <li><Link to="/login" className="hover:text-sahayak-blue">Student Portal Sign In</Link></li>
              <li><Link to="/register" className="hover:text-sahayak-blue">Student Registration (USN)</Link></li>
              <li><Link to="/admin/login" className="hover:text-sahayak-blue font-semibold text-sahayak-blue-deep">Proctor & Admin Login</Link></li>
            </ul>
          </div>

          {/* Institutional Note */}
          <div className="space-y-3 bg-sahayak-cream p-4 rounded-2xl border border-sahayak-brown/10">
            <div className="flex items-center gap-2 text-sahayak-blue-deep">
              <ShieldCheck className="w-4 h-4 text-sahayak-success" />
              <span className="text-xs font-bold font-heading">NIE Student Welfare</span>
            </div>
            <p className="text-[11px] text-sahayak-text-secondary leading-relaxed">
              Maintained with NIE Campus Security & Student Council. Dedicated to integrity, honesty, and seamless campus recovery.
            </p>
            <div className="text-[11px] font-semibold text-sahayak-blue">
              Security Desk: 0821-2480475
            </div>
          </div>

        </div>

        <div className="my-8">
          <SAHAYAKThread height={2} activeStep={1} />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-sahayak-text-muted">
          <p>© {new Date().getFullYear()} SAHAYAK — The National Institute of Engineering, Mysuru. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with care for NIE North Campus</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
