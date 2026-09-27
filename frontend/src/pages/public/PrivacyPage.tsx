import React from 'react';
import { ShieldCheck, Lock, EyeOff, FileText, CheckCircle2, UserCheck } from 'lucide-react';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sahayak-success-soft text-sahayak-success font-semibold text-xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Institutional Safety Commitment</span>
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-sahayak-blue-deep">
          Privacy & Safety Policy
        </h1>
        <p className="text-sahayak-text-secondary text-sm max-w-lg mx-auto">
          How National Institute of Engineering safeguards student data, item verification confidentiality, and physical handover security.
        </p>
      </div>

      {/* Pillars of Protection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NeumorphicCard className="p-5 border border-sahayak-brown/10 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-sahayak-blue-ice text-sahayak-blue flex items-center justify-center">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-bold text-base text-sahayak-text-primary">
            No Public Contact Exposure
          </h3>
          <p className="text-xs text-sahayak-text-secondary leading-relaxed">
            Your USN, registered email, and phone numbers are never shared publicly or visible in search feeds. Communications occur strictly through verified in-app recovery threads.
          </p>
        </NeumorphicCard>

        <NeumorphicCard className="p-5 border border-sahayak-brown/10 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-sahayak-gold-soft text-sahayak-blue-deep flex items-center justify-center">
            <Lock className="w-5 h-5 text-sahayak-gold" />
          </div>
          <h3 className="font-heading font-bold text-base text-sahayak-text-primary">
            Encrypted Distinguishing Clues
          </h3>
          <p className="text-xs text-sahayak-text-secondary leading-relaxed">
            Private details provided during ownership claims (e.g. wallpaper contents, passwords, receipt numbers) are hidden from finder screens and reviewed solely by authorized proctors.
          </p>
        </NeumorphicCard>
      </div>

      {/* Policy Details */}
      <NeumorphicCard className="p-6 sm:p-8 border border-sahayak-brown/15 space-y-6 text-sm text-sahayak-text-secondary leading-relaxed">
        <div className="space-y-2">
          <h3 className="font-heading font-bold text-base text-sahayak-text-primary flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sahayak-success" />
            1. Institutional Authentication
          </h3>
          <p>
            Access to SAHAYAK is restricted to validated NIE students and faculty via NIE institutional email (@nie.ac.in) and verified University Seat Numbers (USN).
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-heading font-bold text-base text-sahayak-text-primary flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sahayak-success" />
            2. Campus Physical Custody
          </h3>
          <p>
            Found items are recommended to be deposited at NIE Security Desks or Department Proctor Lockers. The system logs chain-of-custody timestamp events for administrative audit.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-heading font-bold text-base text-sahayak-text-primary flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sahayak-success" />
            3. AI Feature Extraction
          </h3>
          <p>
            Image uploads are processed exclusively for color, contour, text, and brand signal extraction on secure university-governed nodes.
          </p>
        </div>
      </NeumorphicCard>
    </div>
  );
};
