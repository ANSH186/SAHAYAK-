import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { reportsService, assistantService } from '../../lib/services';
import { api } from '../../lib/api';
import { ItemCategory, ImageSource, ItemReport } from '../../types';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { SAHAYAKThread } from '../../components/ui/SAHAYAKThread';
import { 
  UploadCloud, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Info, 
  ShieldCheck, 
  Building, 
  Award,
  Image as ImageIcon,
  Camera,
  X,
  Search,
  Tag,
  Loader2,
  KeyRound,
  Copy
} from 'lucide-react';

const CATEGORIES: ItemCategory[] = [
  'ELECTRONICS',
  'DOCUMENTS_ID',
  'CALCULATORS',
  'KEYS',
  'BAGS_WALLETS',
  'ACCESSORIES',
  'BOOKS_NOTES',
  'OTHER'
];

const CAMPUS_DISCOVERY_LOCATIONS = [
  'Sir MV Block - Ground Floor Corridor',
  'Sir MV Block - 2nd Floor Labs',
  'SB Block (Computing & AI Labs)',
  'Central Library - Main Reading Hall',
  'North Canteen - Table 14',
  'Administrative Block - Reception',
  'Sports Complex - Court 2',
  'Parking Lot A - Near Bike Stand'
];

const CAMPUS_STORAGE_POINTS = [
  'Main Campus Security Desk (Main Entrance Locker)',
  'Sir MV Block Department Proctor Office (Room 102)',
  'Central Library Security Desk',
  'With Finder (Self-Custody pending handover)'
];

export const ReportFoundPage: React.FC = () => {
  const { studentUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [missingReports, setMissingReports] = useState<any[]>([]);
  const [loadingMissing, setLoadingMissing] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('ELECTRONICS');
  const [description, setDescription] = useState('');
  const [incidentPlace, setIncidentPlace] = useState(CAMPUS_DISCOVERY_LOCATIONS[0]);
  const [currentLocation, setCurrentLocation] = useState(CAMPUS_STORAGE_POINTS[0]);
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState('11:15');

  // Found Image (Required)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageSource, setImageSource] = useState<ImageSource>('USER_CAPTURED');
  const [dragActive, setDragActive] = useState(false);

  const [aiAssisting, setAiAssisting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdReportId, setCreatedReportId] = useState<string | null>(null);
  const [createdReport, setCreatedReport] = useState<ItemReport | null>(null);

  useEffect(() => {
    async function loadMissing() {
      setLoadingMissing(true);
      try {
        const lost = await api.reports.list({ type: 'LOST' });
        if (Array.isArray(lost)) {
          setMissingReports(lost);
        }
      } catch (err) {
        console.warn('Failed to load lost reports:', err);
      } finally {
        setLoadingMissing(false);
      }
    }
    loadMissing();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageSource('USER_CAPTURED');
      
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setImagePreview(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setImageFile(file);
      setImageSource('USER_CAPTURED');
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setImagePreview(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiAssistance = async () => {
    if (!title) return;
    setAiAssisting(true);
    try {
      const generated = await assistantService.generateReportDescription(title, category, incidentPlace);
      setDescription(generated);
    } finally {
      setAiAssisting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const report = await reportsService.createReport({
        type: 'FOUND',
        title,
        category,
        description,
        status: 'SUBMITTED',
        incidentPlace,
        currentLocation,
        incidentDate,
        incidentTime,
        images: [
          {
            id: `img-${Date.now()}`,
            url: imagePreview,
            source: imageSource,
            isReference: false,
            uploadedAt: new Date().toISOString()
          }
        ],
        reporterId: studentUser?.id || '',
        reporterName: studentUser?.fullName || studentUser?.name || 'Student',
        reporterUSN: studentUser?.usn || '',
        isAnonymous: false
      }, imageFile);

      setCreatedReportId(report.id);
      setCreatedReport(report);
      setStep(3);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sahayak-success-soft text-sahayak-success font-semibold text-xs">
          <Award className="w-3.5 h-3.5" />
          <span>Good Samaritan Recovery Pipeline</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
          Report a Found Item
        </h1>
        <p className="text-xs sm:text-sm text-sahayak-text-secondary max-w-lg mx-auto">
          Help return lost property to a fellow NIE student. Reporting a found item earns you verified Finder Points and Good Samaritan recognition!
        </p>

        <div className="pt-2 max-w-xs mx-auto">
          <SAHAYAKThread activeStep={step === 3 ? 2 : 1} height={3} />
        </div>
      </div>

      {/* STEP 1: Check Active Lost Reports */}
      {step === 1 && (
        <NeumorphicCard className="p-6 sm:p-8 border border-sahayak-brown/15 space-y-6">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-sahayak-gold-soft/50 border border-sahayak-gold/30">
            <Info className="w-5 h-5 text-sahayak-blue-deep shrink-0" />
            <p className="text-xs text-sahayak-text-primary leading-relaxed">
              <span className="font-bold">Check missing reports first:</span> Someone on campus might currently be searching for this item.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-sahayak-text-muted">
              Active Missing Item Reports on NIE North ({missingReports.length})
            </h3>
            
            {missingReports.length === 0 ? (
              <div className="p-4 rounded-xl bg-sahayak-cream border border-sahayak-brown/10 text-center text-xs text-sahayak-text-secondary">
                No active lost reports currently awaiting recovery in the database. Proceed below to submit your found item.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {missingReports
                  .filter(item => !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.incidentPlace?.toLowerCase().includes(searchQuery.toLowerCase()))
                  .slice(0, 4)
                  .map((item) => (
                    <div key={item.id} className="p-3.5 rounded-xl bg-sahayak-cream border border-sahayak-brown/10 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-sahayak-blue-ice text-sahayak-blue flex items-center justify-center font-bold text-xs shrink-0">
                          <Tag className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-sahayak-text-primary truncate">{item.title}</h4>
                          <p className="text-[11px] text-sahayak-text-muted truncate">{item.incidentPlace}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setTitle(item.title);
                          setCategory(item.category || 'OTHER');
                          setStep(2);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-sahayak-blue text-white text-xs font-bold shrink-0 ml-2"
                      >
                        This Is It
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-sahayak-brown/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-sahayak-text-secondary">
              Not listed above?
            </span>
            <button
              onClick={() => setStep(2)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sahayak-blue text-white font-heading font-bold text-sm shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center justify-center gap-2"
            >
              <span>Submit New Found Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </NeumorphicCard>
      )}

      {/* STEP 2: Fill Found Item Form */}
      {step === 2 && (
        <NeumorphicCard className="p-6 sm:p-8 border border-sahayak-brown/15 shadow-neumorph">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Item Name / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Casio Scientific Calculator fx-991EX"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-4 py-2.5 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ItemCategory)}
                  className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-4 py-2.5 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* SEPARATE: Place Found VS Current Physical Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-sahayak-cream border border-sahayak-brown/15">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sahayak-blue" />
                  <span>Where Did You Find It? *</span>
                </label>
                <select
                  value={incidentPlace}
                  onChange={(e) => setIncidentPlace(e.target.value)}
                  className="w-full bg-sahayak-cream-soft border border-sahayak-brown/20 rounded-xl px-3 py-2 text-xs text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                >
                  {CAMPUS_DISCOVERY_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <p className="text-[11px] text-sahayak-text-muted">Exact discovery spot on campus</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-sahayak-gold" />
                  <span>Current Physical Location *</span>
                </label>
                <select
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  className="w-full bg-sahayak-cream-soft border border-sahayak-brown/20 rounded-xl px-3 py-2 text-xs text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                >
                  {CAMPUS_STORAGE_POINTS.map((pt) => (
                    <option key={pt} value={pt}>{pt}</option>
                  ))}
                </select>
                <p className="text-[11px] text-sahayak-text-muted">Where the item is physically stored now</p>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Date Found *
                </label>
                <input
                  type="date"
                  required
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-4 py-2.5 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Approx Time *
                </label>
                <input
                  type="time"
                  required
                  value={incidentTime}
                  onChange={(e) => setIncidentTime(e.target.value)}
                  className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-4 py-2.5 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                />
              </div>
            </div>

            {/* Real Interactive Image Upload Section */}
            <div className="space-y-3 p-4 rounded-xl bg-sahayak-cream border border-sahayak-brown/15">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-sahayak-blue" />
                  <span>Found Item Photo (Required for Neural Match Radar) *</span>
                </label>
                <span className="text-[11px] font-bold text-sahayak-success">Neural Vision Ready</span>
              </div>

              {/* Drag & Drop File Selector Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-sahayak-blue bg-sahayak-blue-ice/60 scale-[1.01]' 
                    : 'border-sahayak-brown/25 bg-sahayak-cream-soft hover:border-sahayak-blue/60 hover:bg-sahayak-cream'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-sahayak-blue/10 text-sahayak-blue flex items-center justify-center shadow-neumorph-sm">
                    <UploadCloud className="w-6 h-6 text-sahayak-blue" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-sahayak-text-primary">
                      Click to Browse or Drag & Drop Captured Item Photo
                    </p>
                    <p className="text-[11px] text-sahayak-text-muted mt-0.5">
                      Supports JPG, PNG, or WEBP (Max 10MB)
                    </p>
                  </div>
                  {imageFile && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sahayak-success-soft text-sahayak-success text-xs font-bold mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Preview & Image URL Alternative */}
              <div className="flex flex-col sm:flex-row gap-4 items-center pt-2">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-sahayak-brown/20 shadow-sm shrink-0 bg-sahayak-cream-soft flex items-center justify-center">
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Found Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageFile(null);
                          setImagePreview('');
                        }}
                        className="absolute top-1 right-1 p-1 rounded-full bg-sahayak-error text-white hover:opacity-90 shadow-sm"
                        title="Remove custom photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-sahayak-text-muted p-2 text-center">
                      <ImageIcon className="w-6 h-6 text-sahayak-brown/40" />
                      <span className="text-[9px] mt-1 font-bold">No Image</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 w-full space-y-1.5">
                  <label className="block text-[11px] font-bold text-sahayak-text-secondary uppercase">
                    Or paste image URL:
                  </label>
                  <input
                    type="text"
                    value={imagePreview}
                    onChange={(e) => {
                      setImagePreview(e.target.value);
                      setImageFile(null);
                    }}
                    placeholder="https://example.com/found.jpg"
                    className="w-full bg-sahayak-cream-soft border border-sahayak-brown/20 rounded-xl px-3 py-2 text-xs text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                  />
                  <p className="text-[11px] text-sahayak-text-muted">
                    Photo will be processed for neural visual features.
                  </p>
                </div>
              </div>
            </div>

            {/* Description with AI Assistant */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Public Visual Description
                </label>
                <button
                  type="button"
                  onClick={handleAiAssistance}
                  disabled={aiAssisting || !title}
                  className="inline-flex items-center gap-1.5 text-xs text-sahayak-blue font-bold hover:underline disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sahayak-gold" />
                  <span>{aiAssisting ? 'Generating with AI...' : 'AI Auto-Draft'}</span>
                </button>
              </div>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="General description without revealing secret distinguishing clues..."
                className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl p-3 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-sahayak-brown/10">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-xl bg-sahayak-cream border border-sahayak-brown/20 text-sahayak-text-primary text-sm font-semibold"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-sahayak-blue text-white font-heading font-bold text-sm shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Registering & Initiating Match Engine...</span>
                ) : (
                  <>
                    <span>Submit Found Item & Earn +30 Points</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </NeumorphicCard>
      )}

      {/* STEP 3: Success Confirmation */}
      {step === 3 && (
        <NeumorphicCard className="p-8 text-center space-y-6 border border-sahayak-brown/15 shadow-neumorph-lg">
          <div className="w-16 h-16 rounded-full bg-sahayak-success-soft text-sahayak-success mx-auto flex items-center justify-center shadow-neumorph-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="font-heading font-extrabold text-2xl text-sahayak-blue-deep">
              Found Report Submitted!
            </h2>
            <p className="text-xs sm:text-sm text-sahayak-text-secondary max-w-md mx-auto">
              Report registered successfully. You have been awarded <span className="font-bold text-sahayak-gold">+30 Good Samaritan Points</span>!
            </p>
          </div>

          {/* Anti-Fraud Case Tracking & Security PIN */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-sahayak-blue-deep to-sahayak-blue text-white max-w-md mx-auto text-left space-y-3 shadow-neumorph">
            <div className="flex items-center justify-between border-b border-white/20 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sahayak-gold" />
                <span className="font-heading font-bold text-xs uppercase tracking-wider text-sahayak-gold">
                  Anti-Fraud Verification Pass
                </span>
              </div>
              <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded font-mono">TAMPER PROTECTED</span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-white/70">Official Tracking Number:</span>
              <div className="flex items-center justify-between bg-white/10 px-3 py-1.5 rounded-lg">
                <span className="font-mono font-bold text-sm tracking-wider text-white">
                  {createdReport?.trackingNumber || `NIE-FND-${Date.now().toString(36).toUpperCase()}`}
                </span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(createdReport?.trackingNumber || '')}
                  className="text-white/70 hover:text-white p-1"
                  title="Copy Tracking Number"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-white/70 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-sahayak-gold" /> Handover Security Claim PIN:
                </span>
                <span className="text-[9px] bg-sahayak-gold/20 text-sahayak-gold px-1.5 py-0.5 rounded font-semibold">
                  Required for Handover
                </span>
              </div>
              <div className="flex items-center justify-between bg-white/10 px-3 py-2 rounded-lg border border-sahayak-gold/30">
                <span className="font-mono font-black text-lg tracking-widest text-sahayak-gold">
                  {createdReport?.antiFraudCode || 'SEC-VERIFY'}
                </span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(createdReport?.antiFraudCode || '')}
                  className="text-sahayak-gold/80 hover:text-sahayak-gold p-1"
                  title="Copy Security PIN"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-white/70 leading-relaxed pt-1">
                🔒 Security staff or proctor will verify this secret PIN before completing the item return to prevent imposter fraud.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-sahayak-cream border border-sahayak-brown/10 max-w-md mx-auto text-left space-y-2 text-xs">
            <div className="flex justify-between text-sahayak-text-secondary">
              <span>Item:</span>
              <span className="font-bold text-sahayak-text-primary">{title}</span>
            </div>
            <div className="flex justify-between text-sahayak-text-secondary">
              <span>Current Physical Stash:</span>
              <span className="font-bold text-sahayak-blue">{currentLocation}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/student/rewards"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sahayak-blue text-white font-heading font-bold text-sm shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4 text-sahayak-gold" />
              <span>View Finder Points & Rewards</span>
            </Link>
            <Link
              to="/student"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sahayak-cream border border-sahayak-brown/20 text-sahayak-text-primary text-sm font-semibold hover:border-sahayak-blue"
            >
              Dashboard
            </Link>
          </div>
        </NeumorphicCard>
      )}
    </div>
  );
};
