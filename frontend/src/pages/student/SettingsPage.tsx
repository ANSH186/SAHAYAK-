import React, { useState } from 'react';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { 
  Settings, 
  Bell, 
  Lock, 
  ShieldCheck, 
  EyeOff, 
  Smartphone, 
  Save,
  CheckCircle2
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [matchPush, setMatchPush] = useState(true);
  const [anonymizeFinder, setAnonymizeFinder] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sahayak-blue-ice text-sahayak-blue font-semibold text-xs mb-1">
          <Settings className="w-3.5 h-3.5" />
          <span>Account Preferences</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
          Settings & Privacy
        </h1>
        <p className="text-xs sm:text-sm text-sahayak-text-secondary">
          Configure notification dispatch channels, privacy protections, and security preferences.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-sahayak-success-soft text-sahayak-success flex items-center gap-2 text-xs font-bold border border-sahayak-success/20">
          <CheckCircle2 className="w-4 h-4" />
          <span>Preferences updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Notification Settings */}
        <NeumorphicCard className="p-6 sm:p-8 border border-sahayak-brown/15 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-sahayak-brown/10">
            <div className="p-2 rounded-xl bg-sahayak-blue-ice text-sahayak-blue">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-sahayak-text-primary">
                Notification Channels
              </h3>
              <p className="text-xs text-sahayak-text-muted">Choose where you receive instant recovery notifications.</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-sahayak-cream border border-sahayak-brown/10 cursor-pointer">
              <div>
                <p className="font-bold text-sahayak-text-primary">Email Dispatch (@nie.ac.in)</p>
                <p className="text-sahayak-text-muted">Receive match notifications and verification outcome emails</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 text-sahayak-blue rounded focus:ring-sahayak-blue"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-sahayak-cream border border-sahayak-brown/10 cursor-pointer">
              <div>
                <p className="font-bold text-sahayak-text-primary">SMS Alerts for Handover OTP</p>
                <p className="text-sahayak-text-muted">Receive OTP passcodes via SMS when your lost item is ready for pickup</p>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 text-sahayak-blue rounded focus:ring-sahayak-blue"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-sahayak-cream border border-sahayak-brown/10 cursor-pointer">
              <div>
                <p className="font-bold text-sahayak-text-primary">Neural Radar Instant Alerts</p>
                <p className="text-sahayak-text-muted">Receive push alerts immediately when a match signal score exceeds 80%</p>
              </div>
              <input
                type="checkbox"
                checked={matchPush}
                onChange={(e) => setMatchPush(e.target.checked)}
                className="w-4 h-4 text-sahayak-blue rounded focus:ring-sahayak-blue"
              />
            </label>
          </div>
        </NeumorphicCard>

        {/* Privacy & Confidentiality */}
        <NeumorphicCard className="p-6 sm:p-8 border border-sahayak-brown/15 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-sahayak-brown/10">
            <div className="p-2 rounded-xl bg-sahayak-gold-soft text-sahayak-blue-deep">
              <ShieldCheck className="w-5 h-5 text-sahayak-gold" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-sahayak-text-primary">
                Privacy & Anonymity Controls
              </h3>
              <p className="text-xs text-sahayak-text-muted">Manage your public campus visibility.</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-sahayak-cream border border-sahayak-brown/10 cursor-pointer">
              <div>
                <p className="font-bold text-sahayak-text-primary">Anonymous Finder Reports</p>
                <p className="text-sahayak-text-muted">Hide your name on public found item feeds while still receiving Good Samaritan points</p>
              </div>
              <input
                type="checkbox"
                checked={anonymizeFinder}
                onChange={(e) => setAnonymizeFinder(e.target.checked)}
                className="w-4 h-4 text-sahayak-blue rounded focus:ring-sahayak-blue"
              />
            </label>
          </div>
        </NeumorphicCard>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-sahayak-blue text-white font-heading font-bold text-xs shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
