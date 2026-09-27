import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { verificationService, reportsService } from '../../lib/services';
import { VerificationCase } from '../../types';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { SAHAYAKThread } from '../../components/ui/SAHAYAKThread';
import { CertificateModal } from '../../components/feedback/CertificateModal';
import { LoadingState } from '../../components/feedback/LoadingState';
import { 
  ShieldCheck, 
  QrCode, 
  Building, 
  CheckCircle2, 
  ArrowLeft, 
  Award, 
  MapPin, 
  Clock,
  UserCheck,
  Sparkles,
  CheckCheck
} from 'lucide-react';

export const RecoveryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { studentUser, refreshProfile } = useAuth();
  const [activeCase, setActiveCase] = useState<VerificationCase | any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    async function loadCase() {
      try {
        const cases = await verificationService.getAllCases();
        const found = cases.find(c => c.id === id || c.matchId === id || c.reportId === id) || cases[0];
        setActiveCase(found || null);
        if (found?.handoverStatus === 'COMPLETED' || found?.status === 'COMPLETED' || found?.status === 'RESOLVED') {
          setIsCompleted(true);
        }
      } finally {
        setLoading(false);
      }
    }
    loadCase();
  }, [id]);

  if (loading) {
    return <LoadingState message="Loading handover coordinates..." />;
  }

  const handleSimulateHandover = async () => {
    if (!activeCase) return;
    setIsConfirming(true);
    try {
      // 1. Mark verification case as COMPLETED & RESOLVED locally
      verificationService.completeHandover(activeCase.id);

      // 2. Mark related reports as RESOLVED / SAFELY_RETURNED in local services
      if (activeCase.reportId) {
        reportsService.updateStatus(activeCase.reportId, 'RESOLVED');
      }
      if (activeCase.lostReportId) {
        reportsService.updateStatus(activeCase.lostReportId, 'RETURNED');
      }
      if (activeCase.foundReportId) {
        reportsService.updateStatus(activeCase.foundReportId, 'SAFELY_RETURNED');
      }

      // 3. Confirm via backend API
      try {
        await api.handover.confirm(activeCase.id, 'RECIPIENT_RETURN_CONFIRM', activeCase.handoverOtp || 'NIE-8842');
      } catch (err) {
        console.warn('Backend handover confirm note:', err);
      }

      // 4. Refresh user profile to credit reward points to finder and sync leaderboard
      await refreshProfile();

      setIsCompleted(true);
      setShowCertificate(true);
    } finally {
      setIsConfirming(false);
    }
  };

  const recipientName = studentUser?.fullName || studentUser?.name || activeCase?.finderName || 'Shaik Zayan Ahmed';
  const itemName = activeCase?.lostReport?.title || activeCase?.foundReport?.title || 'Verified Campus Recovery';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Link
          to="/student/matches"
          className="inline-flex items-center gap-1.5 text-xs text-sahayak-text-muted hover:text-sahayak-blue mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Matches</span>
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sahayak-success-soft text-sahayak-success font-semibold text-xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Authorized Handover Protocol</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
          Item Recovery & Handover
        </h1>
        <p className="text-xs sm:text-sm text-sahayak-text-secondary max-w-md mx-auto">
          Case #{activeCase?.id || 'c-101'} • Present your authorization OTP at the designated NIE collection locker.
        </p>

        <div className="pt-2 max-w-xs mx-auto">
          <SAHAYAKThread activeStep={isCompleted ? 5 : 4} height={3} />
        </div>
      </div>

      {/* Handover Details Card */}
      <NeumorphicCard className="p-6 sm:p-8 border border-sahayak-brown/15 shadow-neumorph space-y-6">
        {/* Collection Kiosk & OTP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="p-6 rounded-2xl bg-sahayak-cream border border-sahayak-brown/15 text-center space-y-3 shadow-neumorph-sm">
            <div className="w-16 h-16 rounded-2xl bg-white border border-sahayak-brown/20 flex items-center justify-center mx-auto shadow-sm">
              <QrCode className="w-10 h-10 text-sahayak-blue-deep" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-sahayak-text-muted">
                Authorized Handover Passcode
              </p>
              <p className="font-mono font-black text-2xl text-sahayak-blue tracking-widest mt-1">
                {activeCase?.handoverOtp || 'NIE-8842'}
              </p>
            </div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sahayak-success-soft text-sahayak-success">
              {isCompleted ? 'RESOLVED & RETURNED TO OWNER' : 'VALID FOR 24 HOURS'}
            </span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-base text-sahayak-text-primary flex items-center gap-2">
                <Building className="w-4 h-4 text-sahayak-gold" />
                <span>Physical Custody Station</span>
              </h3>
              <p className="text-xs font-semibold text-sahayak-blue">
                {activeCase?.handoverLocation || 'NIE Main Security Desk (Ground Floor, Main Gate Locker #3)'}
              </p>
            </div>

            <div className="space-y-2 text-xs text-sahayak-text-secondary leading-relaxed">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sahayak-success shrink-0 mt-0.5" />
                <span>Show your NIE Student ID Card along with the OTP above.</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sahayak-success shrink-0 mt-0.5" />
                <span>The proctor or security officer verifies and signs off the handover.</span>
              </p>
              {isCompleted && (
                <p className="flex items-start gap-2 font-semibold text-sahayak-success">
                  <CheckCheck className="w-3.5 h-3.5 text-sahayak-success shrink-0 mt-0.5" />
                  <span>Handover complete. Query marked as RESOLVED & +75 points credited.</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-sahayak-brown/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-sahayak-text-muted">
            Status: <strong className="text-sahayak-text-primary">{isCompleted ? 'RESOLVED (Safely Returned)' : 'Ready for Pickup'}</strong>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            {!isCompleted ? (
              <button
                onClick={handleSimulateHandover}
                disabled={isConfirming}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-sahayak-success text-white font-bold text-xs shadow-neumorph hover:bg-sahayak-success/90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isConfirming ? 'Processing Handover...' : 'Confirm Handover & Resolve Query'}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowCertificate(true)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-sahayak-gold text-sahayak-blue-deep font-bold text-xs shadow-neumorph hover:bg-sahayak-gold-light transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Award className="w-4 h-4 text-sahayak-blue-deep" />
                <span>View Finder Recognition Certificate</span>
              </button>
            )}
          </div>
        </div>
      </NeumorphicCard>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
        recipientName={recipientName}
        usn={studentUser?.usn}
        department={studentUser?.department || (studentUser as any)?.branch}
        itemTitle={itemName}
        caseId={activeCase?.id || id || 'NIE-8842'}
        date={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        pointsAwarded={75}
      />
    </div>
  );
};

