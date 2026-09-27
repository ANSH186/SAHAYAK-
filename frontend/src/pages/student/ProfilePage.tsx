import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/authContext';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { CertificateModal } from '../../components/feedback/CertificateModal';
import { 
  User, 
  GraduationCap, 
  Mail, 
  Phone, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  FileText,
  Edit2,
  Lock,
  Building,
  Save,
  X,
  AlertCircle
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { studentUser, updateProfile, refreshProfile } = useAuth();
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const [showCert, setShowCert] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit form state
  const [fullName, setFullName] = useState(studentUser?.fullName || studentUser?.name || 'Rahul Sharma');
  const [phone, setPhone] = useState(studentUser?.phone || '+91 98860 12345');
  const [branch, setBranch] = useState(studentUser?.department || studentUser?.branch || 'Computer Science & Engineering');
  const [emergencyContact, setEmergencyContact] = useState(studentUser?.emergencyContact || '+91 821 2480475');
  const [avatar, setAvatar] = useState(studentUser?.avatar || studentUser?.avatarUrl || '');

  useEffect(() => {
    if (studentUser) {
      setFullName(studentUser.fullName || studentUser.name || '');
      setPhone(studentUser.phone || '');
      setBranch(studentUser.department || studentUser.branch || 'Computer Science & Engineering');
      setEmergencyContact(studentUser.emergencyContact || '');
      setAvatar(studentUser.avatar || studentUser.avatarUrl || '');
    }
  }, [studentUser]);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const newUrl = uploadEvent.target.result as string;
          setAvatar(newUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

    try {
      await updateProfile({
        fullName,
        name: fullName,
        phone,
        department: branch,
        branch,
        emergencyContact,
        avatar,
        avatarUrl: avatar
      });
      await refreshProfile();
      setSuccessMsg('Profile and photo updated and synchronized with NIE database successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sahayak-blue-ice text-sahayak-blue font-semibold text-xs mb-1">
            <User className="w-3.5 h-3.5" />
            <span>NIE Verified Identity</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
            Student Profile
          </h1>
          <p className="text-xs sm:text-sm text-sahayak-text-secondary">
            Academic identity, Good Samaritan achievements, and campus recovery records.
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sahayak-cream border border-sahayak-brown/20 text-sahayak-blue-deep text-xs font-bold shadow-neumorph-sm hover:border-sahayak-blue transition-all self-start"
        >
          {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-sahayak-success-soft border border-sahayak-success/30 flex items-center gap-2.5 text-xs text-sahayak-success font-bold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Edit Form Card */}
      {isEditing && (
        <NeumorphicCard className="p-6 border-2 border-sahayak-blue/30 shadow-neumorph">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center justify-between border-b border-sahayak-brown/10 pb-3">
              <h3 className="font-heading font-bold text-sm text-sahayak-blue-deep uppercase tracking-wider">
                Edit Contact & Academic Information
              </h3>
              <span className="text-[11px] text-sahayak-text-muted">Direct Database Sync</span>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-sahayak-cream border border-sahayak-brown/15">
              <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                Profile Photo / Avatar
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-sahayak-brown/20 bg-sahayak-blue-ice flex items-center justify-center shrink-0">
                  {avatar ? (
                    <img src={avatar} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-sahayak-blue" />
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-sahayak-blue text-white text-xs font-bold shadow-neumorph-sm hover:bg-sahayak-blue-mid flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Upload New Photo</span>
                  </button>
                  <p className="text-[11px] text-sahayak-text-muted">
                    Supports JPG, PNG, WEBP. Syncs instantly across SAHAYAK header & dashboard.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-3 py-2 text-xs text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-3 py-2 text-xs text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Branch / Department
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-3 py-2 text-xs text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                  <option value="Information Science & Engineering">Information Science & Engineering (ISE)</option>
                  <option value="Electronics & Communication">Electronics & Communication (ECE)</option>
                  <option value="Electrical & Electronics">Electrical & Electronics (EEE)</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science (AI/DS)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="+91 821 2480475"
                  className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-3 py-2 text-xs text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-sahayak-brown/10">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-sahayak-cream border border-sahayak-brown/20 text-xs font-semibold text-sahayak-text-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded-xl bg-sahayak-blue text-white text-xs font-heading font-bold shadow-neumorph hover:bg-sahayak-blue-mid flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save & Sync Profile'}</span>
              </button>
            </div>
          </form>
        </NeumorphicCard>
      )}

      {/* Main Profile Card */}
      <NeumorphicCard className="p-6 sm:p-8 border border-sahayak-brown/15 shadow-neumorph space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-sahayak-brown/10">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-sahayak-brown/20 shadow-neumorph-sm relative bg-sahayak-blue-ice flex items-center justify-center">
            {studentUser?.avatar ? (
              <img
                src={studentUser.avatar}
                alt={studentUser?.fullName || studentUser?.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-sahayak-blue" />
            )}
            <button
              onClick={() => {
                setIsEditing(true);
                setTimeout(() => avatarInputRef.current?.click(), 100);
              }}
              className="absolute bottom-1 right-1 p-1.5 rounded-full bg-sahayak-blue text-white shadow-md hover:bg-sahayak-blue-mid transition-all"
              title="Change Profile Photo"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-heading font-extrabold text-2xl text-sahayak-blue-deep">
                  {studentUser?.fullName || studentUser?.name || 'Rahul Sharma'}
                </h2>
                <p className="text-xs font-mono font-bold text-sahayak-blue uppercase">
                  USN: {studentUser?.usn || '4NI21CS089'}
                </p>
              </div>

              <div className="flex items-center gap-2 justify-center sm:justify-end">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-sahayak-gold-soft text-sahayak-blue-deep border border-sahayak-gold/40 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-sahayak-gold" />
                  <span>{studentUser?.points || studentUser?.finderPoints || 240} Finder Points</span>
                </span>
              </div>
            </div>

            <p className="text-xs text-sahayak-text-secondary">
              {studentUser?.department || studentUser?.branch || 'Computer Science & Engineering'} • Semester {studentUser?.semester || 5}, Section {studentUser?.section || 'A'}
            </p>
            <p className="text-[11px] text-sahayak-text-muted font-medium">
              Badge: <span className="font-bold text-sahayak-blue">{studentUser?.badgeLevel || 'Campus Guardian Lv. 2 (Silver)'}</span>
            </p>
          </div>
        </div>

        {/* Academic Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-sahayak-cream border border-sahayak-brown/10 space-y-1">
            <span className="text-sahayak-text-muted font-bold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-sahayak-blue" />
              <span>Institutional Email</span>
            </span>
            <p className="font-semibold text-sahayak-text-primary">{studentUser?.email || 'rahul.nie@nie.ac.in'}</p>
          </div>

          <div className="p-4 rounded-xl bg-sahayak-cream border border-sahayak-brown/10 space-y-1">
            <span className="text-sahayak-text-muted font-bold flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-sahayak-blue" />
              <span>Handover Contact Phone</span>
            </span>
            <p className="font-semibold text-sahayak-text-primary">{studentUser?.phone || phone}</p>
          </div>
        </div>

        {/* Achievements & Certificates */}
        <div className="space-y-3 pt-2">
          <h3 className="font-heading font-bold text-sm text-sahayak-blue-deep uppercase tracking-wider">
            Verified Integrity Credentials
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-sahayak-cream-soft border border-sahayak-brown/15 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sahayak-gold-soft text-sahayak-gold flex items-center justify-center font-bold">
                  <Award className="w-5 h-5 text-sahayak-blue-deep" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-sahayak-text-primary">Good Samaritan Certificate</h4>
                  <p className="text-[11px] text-sahayak-text-muted">Issued by NIE Proctor Office</p>
                </div>
              </div>
              <button
                onClick={() => setShowCert(true)}
                className="px-3 py-1.5 rounded-lg bg-sahayak-blue text-white text-xs font-bold shadow-neumorph-sm hover:bg-sahayak-blue-mid"
              >
                View
              </button>
            </div>

            <div className="p-4 rounded-xl bg-sahayak-cream-soft border border-sahayak-brown/15 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sahayak-blue-ice text-sahayak-blue flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-sahayak-text-primary">Campus Guardian Tier</h4>
                  <p className="text-[11px] text-sahayak-text-muted">Recoveries Verified: {studentUser?.recoveredCount || 3}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-sahayak-success">Active</span>
            </div>
          </div>
        </div>
      </NeumorphicCard>

      <CertificateModal
        isOpen={showCert}
        onClose={() => setShowCert(false)}
        recipientName={studentUser?.fullName || studentUser?.name || 'Shaik Zayan Ahmed'}
        usn={studentUser?.usn}
        department={studentUser?.department || (studentUser as any)?.branch}
        itemTitle="HP Pavilion Laptop"
        date={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        pointsAwarded={studentUser?.points || 240}
      />
    </div>
  );
};

