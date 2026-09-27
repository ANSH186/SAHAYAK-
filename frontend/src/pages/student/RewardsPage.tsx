import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { CertificateModal } from '../../components/feedback/CertificateModal';
import { 
  Award, 
  Sparkles, 
  Gift, 
  CheckCircle2, 
  TrendingUp, 
  FileText, 
  Clock,
  ArrowRight,
  ShieldCheck,
  Star,
  Coins
} from 'lucide-react';

export const RewardsPage: React.FC = () => {
  const { studentUser } = useAuth();
  const [showCertificate, setShowCertificate] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [balance, setBalance] = useState<{ points: number; recoveredCount: number; badgeLevel: string }>({
    points: studentUser?.points ?? studentUser?.finderPoints ?? 0,
    recoveredCount: studentUser?.recoveredCount ?? 0,
    badgeLevel: studentUser?.badgeLevel || 'Campus Guardian Lv. 1'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRewards() {
      try {
        const [balData, txData] = await Promise.all([
          api.rewards.getBalance(),
          api.rewards.getTransactions()
        ]);
        if (balData) {
          setBalance(balData);
        }
        if (txData) {
          setTransactions(txData);
        }
      } catch (err) {
        console.warn('Live rewards fetch notice:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRewards();
  }, []);

  const points = balance.points ?? studentUser?.points ?? studentUser?.finderPoints ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sahayak-gold-soft text-sahayak-blue-deep font-semibold text-xs mb-1">
            <Award className="w-3.5 h-3.5 text-sahayak-gold" />
            <span>Good Samaritan Honor Program</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
            Finder Points & Rewards
          </h1>
          <p className="text-xs sm:text-sm text-sahayak-text-secondary">
            Earn official recognition and university privileges for helping recover lost items across NIE North.
          </p>
        </div>

        <Link
          to="/student/leaderboard"
          className="px-4 py-2.5 rounded-xl bg-sahayak-blue text-white text-xs font-heading font-bold shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-sahayak-gold" />
          <span>Campus Leaderboard</span>
        </Link>
      </div>

      {/* Hero Points Card */}
      <NeumorphicCard className="p-6 sm:p-8 border border-sahayak-brown/15 shadow-neumorph relative overflow-hidden bg-gradient-to-r from-sahayak-cream-soft via-sahayak-cream to-sahayak-gold-soft/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Star className="w-5 h-5 text-sahayak-gold fill-sahayak-gold" />
              <span className="text-xs font-bold uppercase tracking-wider text-sahayak-text-muted">
                Available Good Samaritan Balance
              </span>
            </div>
            <div className="flex items-baseline justify-center md:justify-start gap-3">
              <span className="font-heading font-black text-5xl sm:text-6xl text-sahayak-blue-deep">
                {points}
              </span>
              <span className="text-sm font-bold text-sahayak-blue uppercase tracking-wider">
                Points
              </span>
            </div>
            <p className="text-xs text-sahayak-text-secondary max-w-md">
              Badge: <strong className="text-sahayak-text-primary">{balance.badgeLevel || studentUser?.badgeLevel || 'Campus Member'}</strong> • {balance.recoveredCount || studentUser?.recoveredCount || 0} Verified Recoveries
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => setShowCertificate(true)}
              className="px-5 py-3 rounded-xl bg-sahayak-blue text-white font-heading font-bold text-xs shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-sahayak-gold" />
              <span>View Latest Certificate</span>
            </button>
          </div>
        </div>
      </NeumorphicCard>

      {/* Rewards Redeem Catalog */}
      <div className="space-y-4">
        <h2 className="font-heading font-bold text-lg text-sahayak-blue-deep">
          Campus Privileges & Perks
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <NeumorphicCard className="p-5 border border-sahayak-brown/15 space-y-4">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-sahayak-blue-ice text-sahayak-blue flex items-center justify-center font-bold">
                <Gift className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sahayak-gold-soft text-sahayak-blue-deep">
                50 Points
              </span>
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-sahayak-text-primary">
                NIE North Cafeteria Voucher
              </h3>
              <p className="text-xs text-sahayak-text-secondary mt-1">
                ₹100 coupon redeemable at the main North Canteen snack counter.
              </p>
            </div>
            <button className="w-full py-2 rounded-xl bg-sahayak-cream border border-sahayak-brown/20 text-sahayak-blue text-xs font-bold hover:border-sahayak-blue transition-all">
              Redeem Voucher
            </button>
          </NeumorphicCard>

          <NeumorphicCard className="p-5 border border-sahayak-brown/15 space-y-4">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-sahayak-gold-soft text-sahayak-blue-deep flex items-center justify-center font-bold">
                <Award className="w-5 h-5 text-sahayak-gold" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sahayak-gold-soft text-sahayak-blue-deep">
                100 Points
              </span>
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-sahayak-text-primary">
                Library Extended Book Limit
              </h3>
              <p className="text-xs text-sahayak-text-secondary mt-1">
                Borrow +2 additional reference books per semester at Central Library.
              </p>
            </div>
            <button className="w-full py-2 rounded-xl bg-sahayak-cream border border-sahayak-brown/20 text-sahayak-blue text-xs font-bold hover:border-sahayak-blue transition-all">
              Apply Privilege
            </button>
          </NeumorphicCard>

          <NeumorphicCard className="p-5 border border-sahayak-brown/15 space-y-4">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-sahayak-success-soft text-sahayak-success flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sahayak-gold-soft text-sahayak-blue-deep">
                150 Points
              </span>
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-sahayak-text-primary">
                Proctor Honor Letter
              </h3>
              <p className="text-xs text-sahayak-text-secondary mt-1">
                Official Dean of Student Affairs commendation certificate for integrity.
              </p>
            </div>
            <button className="w-full py-2 rounded-xl bg-sahayak-cream border border-sahayak-brown/20 text-sahayak-blue text-xs font-bold hover:border-sahayak-blue transition-all">
              Claim Honor Letter
            </button>
          </NeumorphicCard>
        </div>
      </div>

      {/* Points History Log */}
      <div className="space-y-3">
        <h2 className="font-heading font-bold text-lg text-sahayak-blue-deep">
          Points Activity History
        </h2>

        <NeumorphicCard className="p-0 border border-sahayak-brown/15 overflow-hidden shadow-neumorph">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-sahayak-text-muted space-y-2">
              <Coins className="w-8 h-8 text-sahayak-gold mx-auto" />
              <p>No transactions yet. Report found items or complete handovers to earn Good Samaritan points.</p>
            </div>
          ) : (
            <div className="divide-y divide-sahayak-brown/10">
              {transactions.map((t) => (
                <div key={t.id} className="p-4 flex items-center justify-between hover:bg-sahayak-cream-soft/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-sahayak-success-soft text-sahayak-success flex items-center justify-center font-bold text-xs">
                      +{t.points}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-sahayak-text-primary">{t.reason}</h4>
                      <p className="text-[11px] text-sahayak-text-muted">Case #{t.caseId || 'reg'} • {t.date}</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-sahayak-success">
                    +{t.points} PTS
                  </span>
                </div>
              ))}
            </div>
          )}
        </NeumorphicCard>
      </div>

      <CertificateModal
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
        recipientName={studentUser?.fullName || studentUser?.name || 'NIE Student'}
        itemTitle="Verified Good Samaritan Recovery"
        date={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        pointsAwarded={points}
      />
    </div>
  );
};
