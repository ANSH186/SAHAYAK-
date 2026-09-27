import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  UploadCloud, 
  ShieldCheck, 
  Award, 
  ArrowRight, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  Users,
  Compass,
  FileSearch,
  Lock,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { SAHAYAKThread } from '../../components/ui/SAHAYAKThread';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { useAuth } from '../../lib/authContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAction = (path: string, message: string) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      navigate('/login', { state: { from: path, message } });
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-sahayak-brown/10">
        <div className="absolute inset-0 bg-gradient-to-b from-sahayak-cream-soft/60 to-sahayak-cream pointer-events-none -z-10" />
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Column - Copy & CTA */}
          <div className="flex-1 text-center lg:text-left space-y-6 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sahayak-blue-ice/50 border border-sahayak-blue-sky/30 text-sahayak-blue font-semibold text-xs tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-sahayak-gold" />
              <span>National Institute of Engineering (NIE), Mysuru</span>
            </div>

            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-sahayak-blue-deep tracking-tight leading-[1.15]">
              Campus Lost & Found <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sahayak-blue to-sahayak-blue-sky">
                Powered by AI & Trust.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-sahayak-text-secondary leading-relaxed">
              Misplaced your calculator in Sir MV Block or left your earbuds at the Canteen? 
              SAHAYAK matches lost items instantly using visual similarity, verified ownership, and secure campus handovers.
            </p>

            {/* SAHAYAK Thread Motif */}
            <div className="py-2">
              <SAHAYAKThread activeStep={2} />
              <div className="flex justify-between text-[11px] font-semibold text-sahayak-text-muted mt-2">
                <span>1. Report</span>
                <span>2. AI Match</span>
                <span>3. Verify</span>
                <span>4. Handover</span>
                <span>5. Returned</span>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 justify-center lg:justify-start">
              <button
                onClick={() => handleAction('/student/report-lost', 'Please sign in with your NIE institutional credentials to report a lost item.')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-sahayak-blue text-white font-heading font-bold text-sm shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>I Lost Something</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => handleAction('/student/report-found', 'Please sign in with your NIE institutional credentials to report a found item.')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-sahayak-cream-soft border border-sahayak-brown/20 text-sahayak-blue-deep font-heading font-bold text-sm shadow-neumorph hover:border-sahayak-blue transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-sahayak-blue" />
                <span>I Found Something</span>
              </button>

              <Link
                to="/vision-lab"
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-sahayak-gold-soft border border-sahayak-gold/40 text-sahayak-blue-deep font-heading font-bold text-sm shadow-neumorph hover:bg-sahayak-gold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-sahayak-blue-deep" />
                <span>AI Vision Lab</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-sahayak-text-muted">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sahayak-success" />
                <span>NIE Student ID Verified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-sahayak-blue" />
                <span>Private Handover Protection</span>
              </div>
            </div>
          </div>

          {/* Right Column - Interactive Preview Card */}
          <div className="flex-1 w-full max-w-md lg:max-w-lg">
            <NeumorphicCard className="p-6 relative overflow-hidden border border-sahayak-brown/15">
              <div className="flex items-center justify-between pb-4 border-b border-sahayak-brown/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sahayak-blue text-white flex items-center justify-center">
                    <FileSearch className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-sahayak-text-primary">Live Match Radar</h3>
                    <p className="text-xs text-sahayak-text-muted">NIE North Campus Core</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sahayak-success-soft text-sahayak-success animate-pulse">
                  Active
                </span>
              </div>

              {/* Live Matching Engine Overview */}
              <div className="mt-4 p-4 rounded-xl bg-sahayak-cream border border-sahayak-brown/10 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-sahayak-blue-ice text-sahayak-blue flex items-center justify-center font-bold shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading font-bold text-sm text-sahayak-text-primary">Multi-Signal Cross-Match</h4>
                      <span className="text-xs font-bold text-sahayak-blue bg-sahayak-blue-ice px-2 py-0.5 rounded">Real-Time</span>
                    </div>
                    <p className="text-xs text-sahayak-text-secondary mt-0.5">
                      Visual embedding, time proximity, geo-location, and item attributes computed instantly across all NIE North zones.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs border-t border-sahayak-brown/10">
                  <span className="text-sahayak-text-muted">Proctor-Verified Custody Lockers</span>
                  <Link to="/login" className="text-sahayak-blue font-bold hover:underline flex items-center gap-1">
                    Student Login <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Campus Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                <div className="p-2.5 rounded-xl bg-sahayak-cream-soft border border-sahayak-brown/10">
                  <p className="text-lg font-heading font-black text-sahayak-blue-deep">340+</p>
                  <p className="text-[11px] font-medium text-sahayak-text-muted">Recovered Items</p>
                </div>
                <div className="p-2.5 rounded-xl bg-sahayak-cream-soft border border-sahayak-brown/10">
                  <p className="text-lg font-heading font-black text-sahayak-blue">96.8%</p>
                  <p className="text-[11px] font-medium text-sahayak-text-muted">Verification Rate</p>
                </div>
                <div className="p-2.5 rounded-xl bg-sahayak-cream-soft border border-sahayak-brown/10">
                  <p className="text-lg font-heading font-black text-sahayak-gold">15 min</p>
                  <p className="text-[11px] font-medium text-sahayak-text-muted">Avg Match Time</p>
                </div>
              </div>
            </NeumorphicCard>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <h2 className="font-heading font-bold text-3xl text-sahayak-blue-deep">
            Engineered for Campus Integrity
          </h2>
          <p className="text-sahayak-text-secondary text-sm sm:text-base">
            SAHAYAK combines computer vision matching with multi-party verification so lost items return only to their rightful owners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NeumorphicCard className="p-6 space-y-3 border border-sahayak-brown/10">
            <div className="w-12 h-12 rounded-xl bg-sahayak-blue-ice text-sahayak-blue flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6 text-sahayak-blue" />
            </div>
            <h3 className="font-heading font-bold text-lg text-sahayak-text-primary">Multi-Signal AI Matching</h3>
            <p className="text-sm text-sahayak-text-secondary leading-relaxed">
              We analyze item photos, category, exact campus coordinates, timestamps, and physical traits to generate transparent match signals.
            </p>
          </NeumorphicCard>

          <NeumorphicCard className="p-6 space-y-3 border border-sahayak-brown/10">
            <div className="w-12 h-12 rounded-xl bg-sahayak-gold-soft text-sahayak-gold flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6 text-sahayak-blue-deep" />
            </div>
            <h3 className="font-heading font-bold text-lg text-sahayak-text-primary">Ownership Verification</h3>
            <p className="text-sm text-sahayak-text-secondary leading-relaxed">
              Claimants verify ownership with private distinguishing details and receive cryptographic handover OTPs verified by NIE Security.
            </p>
          </NeumorphicCard>

          <NeumorphicCard className="p-6 space-y-3 border border-sahayak-brown/10">
            <div className="w-12 h-12 rounded-xl bg-sahayak-success-soft text-sahayak-success flex items-center justify-center font-bold">
              <Award className="w-6 h-6 text-sahayak-success" />
            </div>
            <h3 className="font-heading font-bold text-lg text-sahayak-text-primary">Finder Recognition & Badges</h3>
            <p className="text-sm text-sahayak-text-secondary leading-relaxed">
              Earn official NIE Good Samaritan points, leaderboard recognition, and verified certificates for returning items to peers.
            </p>
          </NeumorphicCard>
        </div>
      </section>

      {/* Campus Map & Locations Overview */}
      <section className="py-12 bg-sahayak-cream-soft border-t border-b border-sahayak-brown/10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="font-heading font-bold text-2xl text-sahayak-blue-deep">
              Covering All NIE North Campus Zones
            </h3>
            <p className="text-sahayak-text-secondary text-sm mt-1">
              Live collection points at Sir MV Block, Administrative Block, Central Library, and North Cafeteria.
            </p>
          </div>
          <button
            onClick={() => handleAction('/student/map', 'Please sign in with your NIE credentials to explore the campus map.')}
            className="px-6 py-3 rounded-xl bg-sahayak-blue text-white text-sm font-bold shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Compass className="w-4 h-4 text-sahayak-gold" />
            <span>Explore Campus Map</span>
          </button>
        </div>
      </section>
    </div>
  );
};
