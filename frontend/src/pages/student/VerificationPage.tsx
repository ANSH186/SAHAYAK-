import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { verificationService, matchingService } from '../../lib/services';
import { VerificationCase, MatchItem } from '../../types';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SAHAYAKThread } from '../../components/ui/SAHAYAKThread';
import { LoadingState } from '../../components/feedback/LoadingState';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  QrCode,
  Building,
  UserCheck,
  Sparkles,
  Award,
  Loader2
} from 'lucide-react';

export const VerificationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { studentUser, refreshProfile } = useAuth();
  const [match, setMatch] = useState<MatchItem | null>(null);
  const [activeCase, setActiveCase] = useState<VerificationCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [approvalNotice, setApprovalNotice] = useState<string | null>(null);

  // Verification Form State
  const [answers, setAnswers] = useState({
    clue1: '',
    clue2: '',
    clue3: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const m = await matchingService.getMatchById(id);
        setMatch(m || null);

        // Check if there is an existing verification case for this match
        const cases = await verificationService.getAllCases();
        const foundCase = cases.find(c => c.id === id || c.matchId === id || c.reportId === id);
        if (foundCase) {
          setActiveCase(foundCase);
          setSubmitted(true);
        } else {
          // Check backend for case
          try {
            const liveCase = await api.verification.getCase(id);
            if (liveCase && liveCase.id) {
              setActiveCase(liveCase);
              setSubmitted(true);
            }
          } catch (e) {
            // Case not yet created
          }
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return <LoadingState message="Fetching verification protocols..." />;
  }

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      const clueList = [answers.clue1, answers.clue2, answers.clue3].filter(Boolean);
      if (activeCase && activeCase.id) {
        try {
          const res = await api.verification.submitAnswers(activeCase.id, clueList);
          if (res) {
            setActiveCase(res);
            setSubmitted(true);
            await refreshProfile();
            return;
          }
        } catch (liveErr) {
          console.warn('Live submit fallback:', liveErr);
        }
      }

      const newCase = await verificationService.submitVerification(
        id || 'm-1',
        clueList
      );
      setActiveCase(newCase);
      setSubmitted(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSimulateProctorApproval = async () => {
    if (!activeCase) return;
    setIsSimulating(true);
    try {
      // 1. Call Backend Proctor Approval endpoint
      try {
        await api.verification.manualReview(
          activeCase.id,
          'APPROVE',
          'Proctor verified physical possession and matched claimant answers.'
        );
      } catch (e) {
        console.warn('Backend proctor approval notice:', e);
      }

      // 2. Update local state & case
      const updated = verificationService.verifyCase(activeCase.id, 'SEC-01', 'NIE-8842');
      if (updated) {
        setActiveCase(updated);
      } else {
        setActiveCase({
          ...activeCase,
          status: 'VERIFIED',
          handoverOtp: 'NIE-8842',
          handoverStatus: 'SCHEDULED',
          assignedStaff: 'NIE Campus Proctor Desk'
        });
      }

      // 3. Refresh logged in user profile so reward points and leaderboard sync immediately
      await refreshProfile();
      setApprovalNotice('Proctor Approved! +75 Good Samaritan points successfully awarded to the finder.');
    } finally {
      setIsSimulating(false);
    }
  };


  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button & Header */}
      <div className="text-center space-y-2">
        <Link
          to="/student/matches"
          className="inline-flex items-center gap-1.5 text-xs text-sahayak-text-muted hover:text-sahayak-blue mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Matches</span>
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sahayak-gold-soft text-sahayak-blue-deep font-semibold text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-sahayak-gold" />
          <span>Confidential Claim Verification</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
          Ownership Verification Protocol
        </h1>
        <p className="text-xs sm:text-sm text-sahayak-text-secondary max-w-lg mx-auto">
          To prevent unauthorized claims, state distinct hidden details only the true owner would know.
        </p>

        <div className="pt-2 max-w-xs mx-auto">
          <SAHAYAKThread activeStep={submitted && activeCase?.status === 'VERIFIED' ? 4 : 3} height={3} />
        </div>
      </div>

      {/* VERIFIED STATE: Show Secure Handover Token & OTP */}
      {submitted && activeCase && activeCase.status === 'VERIFIED' && (
        <NeumorphicCard className="p-8 border-2 border-sahayak-success/30 shadow-neumorph-lg text-center space-y-6 bg-gradient-to-b from-sahayak-cream-soft to-sahayak-cream">
          <div className="w-16 h-16 rounded-full bg-sahayak-success-soft text-sahayak-success mx-auto flex items-center justify-center shadow-neumorph-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-sahayak-success text-white">
              OWNERSHIP CONFIRMED
            </span>
            <h2 className="font-heading font-bold text-2xl text-sahayak-blue-deep mt-2">
              Ready for Secure Handover
            </h2>
            <p className="text-xs sm:text-sm text-sahayak-text-secondary max-w-md mx-auto">
              Your claim has been verified by the NIE Proctor Office. Present this cryptographic OTP to the authorized desk to retrieve your property.
            </p>
          </div>

          {/* Secure Token Display */}
          <div className="p-6 rounded-2xl bg-sahayak-cream border border-sahayak-brown/20 max-w-sm mx-auto shadow-neumorph space-y-4">
            <div className="flex items-center justify-center gap-3">
              <QrCode className="w-16 h-16 text-sahayak-blue-deep" />
            </div>
            
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wider text-sahayak-text-muted font-bold">
                Single-Use Handover OTP
              </p>
              <p className="font-mono font-black text-3xl text-sahayak-blue tracking-widest bg-sahayak-blue-ice/50 py-2 rounded-xl border border-sahayak-blue-sky/40">
                {activeCase.handoverOtp || 'NIE-8842'}
              </p>
            </div>

            <div className="pt-2 text-[11px] text-sahayak-text-muted flex items-center justify-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-sahayak-gold" />
              <span>Collection: Main Security Desk Locker #3</span>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-2">
            <Link
              to={`/student/recovery/${activeCase.id}`}
              className="px-6 py-3 rounded-xl bg-sahayak-blue text-white text-xs font-heading font-bold shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center gap-2"
            >
              <span>View Full Handover Status</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </NeumorphicCard>
      )}

      {/* PENDING / MANUAL REVIEW STATE */}
      {submitted && activeCase && activeCase.status !== 'VERIFIED' && (
        <NeumorphicCard className="p-8 border border-sahayak-brown/15 shadow-neumorph text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-sahayak-gold-soft text-sahayak-blue-deep mx-auto flex items-center justify-center shadow-neumorph-sm">
            <Lock className="w-8 h-8 text-sahayak-gold" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-sahayak-gold-soft text-sahayak-blue-deep">
              UNDER PROCTOR REVIEW
            </span>
            <h2 className="font-heading font-bold text-xl text-sahayak-blue-deep">
              Verification Answers Submitted
            </h2>
            <p className="text-xs sm:text-sm text-sahayak-text-secondary max-w-md mx-auto">
              Case <span className="font-mono font-bold text-sahayak-blue">#{activeCase.id}</span> is currently being cross-referenced against the physical item deposited with Campus Security.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-sahayak-cream border border-sahayak-brown/10 max-w-md mx-auto text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-sahayak-text-secondary">Expected Review Time:</span>
              <span className="font-bold text-sahayak-text-primary">Under 30 Minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sahayak-text-secondary">Assigned Desk:</span>
              <span className="font-bold text-sahayak-text-primary">NIE North Main Security Desk</span>
            </div>
          </div>

          {approvalNotice && (
            <div className="p-3 bg-sahayak-success-soft border border-sahayak-success/30 rounded-xl text-xs text-sahayak-success font-bold flex items-center justify-center gap-2 animate-fadeIn">
              <Award className="w-4 h-4 text-sahayak-gold" />
              <span>{approvalNotice}</span>
            </div>
          )}

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={handleSimulateProctorApproval}
              disabled={isSimulating}
              className="px-5 py-3 rounded-xl bg-sahayak-gold text-sahayak-blue-deep text-xs font-bold shadow-neumorph hover:bg-sahayak-gold-light transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-sahayak-blue-deep" />
                  <span>Approving & Crediting Finder Points...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simulate Proctor Instant Approval (+75 Pts to Finder)</span>
                </>
              )}
            </button>
          </div>
        </NeumorphicCard>
      )}

      {/* INITIAL VERIFICATION QUESTIONNAIRE FORM */}
      {!submitted && (
        <NeumorphicCard className="p-6 sm:p-8 border border-sahayak-brown/15 shadow-neumorph space-y-6">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-sahayak-blue-ice/50 border border-sahayak-blue-sky/30">
            <Lock className="w-5 h-5 text-sahayak-blue shrink-0 mt-0.5" />
            <div className="text-xs text-sahayak-text-primary space-y-1">
              <p className="font-bold">Confidentiality Guarantee</p>
              <p className="text-sahayak-text-secondary">
                Your answers will ONLY be seen by authorized NIE Campus Security and Faculty Proctors. They will never be revealed to the finder or other students.
              </p>
            </div>
          </div>

          <form onSubmit={handleVerificationSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                1. Secret Distinguishing Mark / Unique Identifier *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Small scratch near bottom right bezel, custom vinyl sticker on back"
                value={answers.clue1}
                onChange={(e) => setAnswers({ ...answers, clue1: e.target.value })}
                className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-4 py-2.5 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                2. Internal Contents / Lock Screen Wallpaper / Attachments
              </label>
              <input
                type="text"
                placeholder="e.g. Wallpaper is an anime landscape, attached brown leather strap"
                value={answers.clue2}
                onChange={(e) => setAnswers({ ...answers, clue2: e.target.value })}
                className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-4 py-2.5 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                3. Approximate Time & Scenario of Loss
              </label>
              <input
                type="text"
                placeholder="e.g. Left behind right after the 2:30 PM Compiler Design Lab"
                value={answers.clue3}
                onChange={(e) => setAnswers({ ...answers, clue3: e.target.value })}
                className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-4 py-2.5 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
              />
            </div>

            <div className="pt-4 border-t border-sahayak-brown/10 flex gap-4">
              <Link
                to="/student/matches"
                className="px-5 py-3 rounded-xl bg-sahayak-cream border border-sahayak-brown/20 text-sahayak-text-primary text-sm font-semibold"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isVerifying}
                className="flex-1 py-3 rounded-xl bg-sahayak-blue text-white font-heading font-bold text-sm shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isVerifying ? (
                  <span>Evaluating Verification Answers...</span>
                ) : (
                  <>
                    <span>Submit Claim for Proctor Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </NeumorphicCard>
      )}
    </div>
  );
};
