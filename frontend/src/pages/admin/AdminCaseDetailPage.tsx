import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { reportsService, verificationService, auditService } from '../../lib/services';
import { ItemReport, VerificationCase } from '../../types';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SAHAYAKThread } from '../../components/ui/SAHAYAKThread';
import { LoadingState } from '../../components/feedback/LoadingState';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  Lock, 
  MapPin, 
  Building, 
  Calendar, 
  Clock, 
  User, 
  FileText,
  KeyRound,
  Award
} from 'lucide-react';

export const AdminCaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<ItemReport | null>(null);
  const [vCase, setVCase] = useState<VerificationCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const [rData, cList] = await Promise.all([
          reportsService.getById(id),
          verificationService.getAllCases()
        ]);
        setReport(rData || null);
        const matchCase = cList.find(c => c.reportId === id || c.id === id);
        setVCase(matchCase || null);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return <LoadingState message="Loading proctor case dossier..." />;
  }

  if (!report) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-xl font-heading font-bold text-sahayak-text-primary">Case Dossier Not Found</h2>
        <Link to="/admin/reports" className="text-sahayak-blue font-bold hover:underline">
          Back to Case Management
        </Link>
      </div>
    );
  }

  const handleApproveClaim = async () => {
    try {
      if (vCase) {
        await verificationService.verifyCase(vCase.id, 'SEC-01', 'NIE-8842');
        setVCase(prev => prev ? { ...prev, status: 'VERIFIED', handoverOtp: 'NIE-8842' } : null);
        setActionSuccess('Ownership verified and Handover Passcode NIE-8842 issued to student claimant.');
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to approve claim.');
    }
  };

  const handleCompleteHandover = async () => {
    try {
      if (vCase) {
        await verificationService.completeHandover(vCase.id);
      }
      await reportsService.updateStatus(report.id, 'RETURNED');
      setReport(prev => prev ? { ...prev, status: 'RETURNED' } : null);
      if (vCase) {
        setVCase(prev => prev ? { ...prev, status: 'RESOLVED' } : null);
      }
      setActionSuccess('Physical handover marked complete. Item safely resolved and returned to owner.');
    } catch (err: any) {
      alert(err?.message || 'Failed to complete handover.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/reports"
            className="inline-flex items-center gap-1.5 text-xs text-sahayak-text-muted hover:text-sahayak-blue mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Case Management</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
              Proctor Case Dossier #{report.id}
            </h1>
            <StatusBadge status={report.status} />
          </div>
        </div>

        <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-sahayak-cream-soft border border-sahayak-brown/15 text-sahayak-text-muted">
          Type: {report.type}
        </span>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-sahayak-success-soft text-sahayak-success flex items-center gap-2 text-xs font-bold border border-sahayak-success/20">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Dossier Card */}
      <NeumorphicCard className="p-6 sm:p-8 border border-sahayak-brown/15 shadow-neumorph space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="aspect-square rounded-2xl overflow-hidden bg-sahayak-cream border border-sahayak-brown/15 relative">
            <img
              src={report.images[0]?.url || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500'}
              alt={report.title}
              className="w-full h-full object-cover"
            />
            {report.images[0]?.isReference && (
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-sahayak-blue-deep text-sahayak-gold">
                Reference Image
              </span>
            )}
          </div>

          <div className="md:col-span-2 space-y-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sahayak-blue">
                {report.category.replace('_', ' ')}
              </span>
              <h2 className="font-heading font-bold text-xl text-sahayak-text-primary">
                {report.title}
              </h2>
              <p className="text-xs text-sahayak-text-secondary mt-1 leading-relaxed">
                {report.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-3 rounded-xl bg-sahayak-cream border border-sahayak-brown/10">
                <span className="text-sahayak-text-muted font-bold block">Incident Location:</span>
                <span className="text-sahayak-text-primary font-semibold">{report.incidentPlace}</span>
              </div>

              <div className="p-3 rounded-xl bg-sahayak-cream border border-sahayak-brown/10">
                <span className="text-sahayak-text-muted font-bold block">Physical Storage Desk:</span>
                <span className="text-sahayak-blue font-bold">{report.currentLocation || 'Main Security Desk'}</span>
              </div>

              <div className="p-3 rounded-xl bg-sahayak-cream border border-sahayak-brown/10">
                <span className="text-sahayak-text-muted font-bold block">Reporter Identity:</span>
                <span className="text-sahayak-text-primary font-semibold">{report.reporterName} ({report.reporterUSN})</span>
              </div>

              <div className="p-3 rounded-xl bg-sahayak-cream border border-sahayak-brown/10">
                <span className="text-sahayak-text-muted font-bold block">Date & Time:</span>
                <span className="text-sahayak-text-primary font-semibold">{report.incidentDate} at {report.incidentTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Confidential Verification Clues (Proctor Access Only) */}
        {vCase && (
          <div className="p-5 rounded-2xl bg-sahayak-blue-ice/30 border border-sahayak-blue-sky/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-sahayak-blue" />
                <h3 className="font-heading font-bold text-sm text-sahayak-blue-deep">
                  Confidential Claimant Clues (Case #{vCase.id})
                </h3>
              </div>
              <StatusBadge status={vCase.status} />
            </div>

            <div className="space-y-2 text-xs text-sahayak-text-primary bg-sahayak-cream p-4 rounded-xl border border-sahayak-brown/10">
              <p><strong>Claimant:</strong> {vCase.claimantName} ({vCase.claimantUSN})</p>
              <div className="pt-1">
                <p className="font-bold text-sahayak-text-muted uppercase text-[10px]">Submitted Clues:</p>
                <ul className="list-disc list-inside space-y-1 mt-1 text-sahayak-text-secondary">
                  {vCase.answersSubmitted.map((ans, idx) => (
                    <li key={idx} className="font-semibold text-sahayak-text-primary">{ans}</li>
                  ))}
                </ul>
              </div>
            </div>

            {vCase.handoverOtp && (
              <div className="p-3 rounded-xl bg-sahayak-cream border border-sahayak-brown/15 flex items-center justify-between">
                <span className="text-xs text-sahayak-text-muted font-bold">Active Handover Passcode:</span>
                <span className="font-mono font-black text-sm text-sahayak-blue bg-sahayak-blue-ice px-3 py-1 rounded">
                  {vCase.handoverOtp}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Proctor Action Controls */}
        <div className="pt-4 border-t border-sahayak-brown/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-sahayak-text-muted">
            Authorized Officer: <strong className="text-sahayak-text-primary">Campus Security Desk #1</strong>
          </div>

          <div className="flex flex-wrap gap-3">
            {vCase && vCase.status !== 'VERIFIED' && (
              <button
                onClick={handleApproveClaim}
                className="px-5 py-2.5 rounded-xl bg-sahayak-blue text-white text-xs font-bold shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-sahayak-gold" />
                <span>Approve Ownership Claim</span>
              </button>
            )}

            {report.status !== 'RETURNED' && (
              <button
                onClick={handleCompleteHandover}
                className="px-5 py-2.5 rounded-xl bg-sahayak-success text-white text-xs font-bold shadow-neumorph hover:bg-sahayak-success/90 transition-all flex items-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>Sign Off Handover & Release Item</span>
              </button>
            )}
          </div>
        </div>
      </NeumorphicCard>
    </div>
  );
};
