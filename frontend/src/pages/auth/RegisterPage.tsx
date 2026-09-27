import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { SAHAYAKThread } from '../../components/ui/SAHAYAKThread';
import { useAuth } from '../../lib/authContext';
import { 
  User, 
  GraduationCap, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Phone,
  Mail,
  Building,
  Key,
  Eye,
  EyeOff,
  Check,
  X,
  Lock,
  AlertCircle
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { step = 'identity' } = useParams<{ step?: string }>();
  const navigate = useNavigate();
  const { registerStudent } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    usn: '',
    department: 'Computer Science & Engineering',
    semester: 6,
    section: 'A',
    password: '',
    confirmPassword: '',
    agreeTerms: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const updateField = (field: string, val: any) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const getStepNumber = () => {
    switch (step) {
      case 'identity': return 1;
      case 'academic': return 2;
      case 'security': return 3;
      case 'complete': return 4;
      default: return 1;
    }
  };

  // Password requirements real-time validation
  const pwd = formData.password;
  const hasMinLength = pwd.length >= 8;
  const hasUppercase = /[A-Z]/.test(pwd);
  const hasLowercase = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[@$!%*?&#^()_+\-=\[\]{}|;:,.<>?/~`]/.test(pwd);
  const passwordsMatch = pwd.length > 0 && pwd === formData.confirmPassword;
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial && passwordsMatch;

  // Email validation
  const isNieEmail = formData.email.toLowerCase().trim().endsWith('@nie.ac.in');

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step === 'identity' || !step) {
      if (!formData.fullName.trim() || !formData.email.trim()) {
        setError('Please fill in your full name and institutional email.');
        return;
      }
      if (!isNieEmail) {
        setError('Access Restricted: Only official institutional emails ending in "@nie.ac.in" are permitted.');
        return;
      }
      navigate('/register/academic');
    } else if (step === 'academic') {
      if (!formData.usn.trim()) {
        setError('Please provide your official student USN.');
        return;
      }
      navigate('/register/security');
    } else if (step === 'security') {
      if (!hasMinLength) {
        setError('Password must be at least 8 characters long.');
        return;
      }
      if (!hasUppercase) {
        setError('Password must contain at least one uppercase letter (A-Z).');
        return;
      }
      if (!hasLowercase) {
        setError('Password must contain at least one lowercase letter (a-z).');
        return;
      }
      if (!hasNumber) {
        setError('Password must contain at least one numerical digit (0-9).');
        return;
      }
      if (!hasSpecial) {
        setError('Password must contain at least one special symbol (e.g. @, #, $, %, !).');
        return;
      }
      if (!passwordsMatch) {
        setError('Passwords do not match. Please re-enter your password confirmation.');
        return;
      }
      if (!formData.agreeTerms) {
        setError('You must agree to the NIE Code of Conduct to proceed.');
        return;
      }

      setLoading(true);
      try {
        await registerStudent(formData);
        navigate('/register/complete');
      } catch (err: any) {
        setError(err.message || 'Registration failed. Please verify your details.');
      } finally {
        setLoading(false);
      }
    }
  };

  const stepNumber = getStepNumber();

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-lg space-y-6">
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sahayak-blue-ice border border-sahayak-blue-sky/30 text-sahayak-blue font-semibold text-xs">
            <Sparkles className="w-3.5 h-3.5 text-sahayak-gold" />
            <span>NIE Student Registration</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
            Join SAHAYAK
          </h1>
          <p className="text-xs sm:text-sm text-sahayak-text-secondary">
            Step {stepNumber} of 4: {step === 'academic' ? 'Academic Details' : step === 'security' ? 'Security & Password Creation' : step === 'complete' ? 'Setup Complete' : 'Personal Identity'}
          </p>
        </div>

        {/* Step Progress Thread */}
        <div className="px-2">
          <SAHAYAKThread activeStep={stepNumber} height={3} />
          <div className="flex justify-between text-[11px] font-semibold text-sahayak-text-muted mt-2">
            <span className={stepNumber >= 1 ? 'text-sahayak-blue font-bold' : ''}>Identity</span>
            <span className={stepNumber >= 2 ? 'text-sahayak-blue font-bold' : ''}>Academic</span>
            <span className={stepNumber >= 3 ? 'text-sahayak-blue font-bold' : ''}>Security</span>
            <span className={stepNumber >= 4 ? 'text-sahayak-success font-bold' : ''}>Complete</span>
          </div>
        </div>

        <NeumorphicCard className="p-6 sm:p-8 border border-sahayak-brown/15 shadow-neumorph">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-sahayak-error-soft text-sahayak-error text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {stepNumber === 1 && (
            <form onSubmit={handleNext} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Full Name (as per NIE Records)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sahayak-text-muted" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                    NIE Institutional Email
                  </label>
                  <span className="text-[10px] font-bold text-sahayak-blue bg-sahayak-blue-ice px-2 py-0.5 rounded-md border border-sahayak-blue-sky/30">
                    *@nie.ac.in Only
                  </span>
                </div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sahayak-text-muted" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul.sharma@nie.ac.in"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className={`w-full bg-sahayak-cream border rounded-xl pl-10 pr-4 py-2.5 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 ${
                      formData.email && !isNieEmail
                        ? 'border-sahayak-error focus:ring-sahayak-error'
                        : 'border-sahayak-brown/20 focus:ring-sahayak-blue'
                    }`}
                  />
                </div>
                {formData.email && !isNieEmail && (
                  <p className="text-[11px] font-semibold text-sahayak-error flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Email address must end with <strong>@nie.ac.in</strong></span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Mobile Number (for Handover SMS)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sahayak-text-muted" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!isNieEmail && formData.email.length > 0}
                className="w-full py-3 rounded-xl bg-sahayak-blue text-white font-heading font-bold text-sm shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                <span>Continue to Academic Info</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {stepNumber === 2 && (
            <form onSubmit={handleNext} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  University Seat Number (USN)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4NI21CS089"
                  value={formData.usn}
                  onChange={(e) => updateField('usn', e.target.value.toUpperCase())}
                  className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-4 py-2.5 text-sm font-mono uppercase text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Department / Branch
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => updateField('department', e.target.value)}
                  className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-4 py-2.5 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                  <option value="Information Science & Engineering">Information Science & Engineering (ISE)</option>
                  <option value="Electronics & Communication Engineering">Electronics & Communication (ECE)</option>
                  <option value="Electrical & Electronics Engineering">Electrical & Electronics (EEE)</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                    Current Semester
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => updateField('semester', Number(e.target.value))}
                    className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-4 py-2.5 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                    Section
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formData.section}
                    onChange={(e) => updateField('section', e.target.value.toUpperCase())}
                    className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl px-4 py-2.5 text-sm uppercase text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => navigate('/register/identity')}
                  className="px-4 py-3 rounded-xl bg-sahayak-cream border border-sahayak-brown/20 text-sahayak-text-primary text-sm font-semibold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-sahayak-blue text-white font-heading font-bold text-sm shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center justify-center gap-2"
                >
                  <span>Continue to Security</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {stepNumber === 3 && (
            <form onSubmit={handleNext} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Create Institutional Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sahayak-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 8 characters with Uppercase, Number & Symbol"
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl pl-10 pr-10 py-2.5 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sahayak-text-muted hover:text-sahayak-text-primary p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements Live Checklist */}
              <div className="p-3 bg-sahayak-cream-soft rounded-xl border border-sahayak-brown/15 space-y-2">
                <div className="text-[11px] font-bold text-sahayak-text-secondary uppercase tracking-wider">
                  Password Strength Requirements:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-sahayak-success font-semibold' : 'text-sahayak-text-muted'}`}>
                    {hasMinLength ? <Check className="w-3.5 h-3.5 text-sahayak-success" /> : <X className="w-3.5 h-3.5 text-sahayak-error" />}
                    <span>At least 8 characters</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-sahayak-success font-semibold' : 'text-sahayak-text-muted'}`}>
                    {hasUppercase ? <Check className="w-3.5 h-3.5 text-sahayak-success" /> : <X className="w-3.5 h-3.5 text-sahayak-error" />}
                    <span>1+ Uppercase letter (A-Z)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-sahayak-success font-semibold' : 'text-sahayak-text-muted'}`}>
                    {hasLowercase ? <Check className="w-3.5 h-3.5 text-sahayak-success" /> : <X className="w-3.5 h-3.5 text-sahayak-error" />}
                    <span>1+ Lowercase letter (a-z)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-sahayak-success font-semibold' : 'text-sahayak-text-muted'}`}>
                    {hasNumber ? <Check className="w-3.5 h-3.5 text-sahayak-success" /> : <X className="w-3.5 h-3.5 text-sahayak-error" />}
                    <span>1+ Number (0-9)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 sm:col-span-2 ${hasSpecial ? 'text-sahayak-success font-semibold' : 'text-sahayak-text-muted'}`}>
                    {hasSpecial ? <Check className="w-3.5 h-3.5 text-sahayak-success" /> : <X className="w-3.5 h-3.5 text-sahayak-error" />}
                    <span>1+ Special symbol (@, $, !, %, *, #, etc.)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sahayak-text-muted" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat your password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    className={`w-full bg-sahayak-cream border rounded-xl pl-10 pr-10 py-2.5 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 ${
                      formData.confirmPassword && !passwordsMatch
                        ? 'border-sahayak-error focus:ring-sahayak-error'
                        : 'border-sahayak-brown/20 focus:ring-sahayak-blue'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sahayak-text-muted hover:text-sahayak-text-primary p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.confirmPassword && !passwordsMatch && (
                  <p className="text-[11px] font-semibold text-sahayak-error flex items-center gap-1 mt-1">
                    <X className="w-3 h-3" />
                    <span>Passwords do not match</span>
                  </p>
                )}
                {formData.confirmPassword && passwordsMatch && (
                  <p className="text-[11px] font-semibold text-sahayak-success flex items-center gap-1 mt-1">
                    <Check className="w-3 h-3" />
                    <span>Passwords match perfectly</span>
                  </p>
                )}
              </div>

              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={(e) => updateField('agreeTerms', e.target.checked)}
                  className="mt-1 rounded text-sahayak-blue focus:ring-sahayak-blue"
                />
                <label htmlFor="agreeTerms" className="text-xs text-sahayak-text-secondary leading-normal">
                  I agree to abide by the NIE Code of Conduct and acknowledge that false item claims are subject to institutional disciplinary action.
                </label>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => navigate('/register/academic')}
                  className="px-4 py-3 rounded-xl bg-sahayak-cream border border-sahayak-brown/20 text-sahayak-text-primary text-sm font-semibold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !isPasswordValid}
                  className="flex-1 py-3 rounded-xl bg-sahayak-blue text-white font-heading font-bold text-sm shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Creating Student Account in Database...</span>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <CheckCircle2 className="w-4 h-4 text-sahayak-gold" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {stepNumber === 4 && (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 rounded-full bg-sahayak-success-soft text-sahayak-success mx-auto flex items-center justify-center shadow-neumorph-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h2 className="font-heading font-bold text-xl text-sahayak-text-primary">
                  Account Ready!
                </h2>
                <p className="text-xs text-sahayak-text-secondary max-w-sm mx-auto">
                  Your student account for <span className="font-mono font-bold text-sahayak-blue">{formData.fullName} ({formData.usn})</span> has been registered in the SAHAYAK database.
                </p>
              </div>

              <Link
                to="/student"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-sahayak-blue text-white font-heading font-bold text-sm shadow-neumorph hover:bg-sahayak-blue-mid transition-all w-full"
              >
                <span>Enter Student Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-sahayak-brown/10 text-center">
            <p className="text-xs text-sahayak-text-muted">
              Already registered?{' '}
              <Link to="/login" className="text-sahayak-blue font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </NeumorphicCard>
      </div>
    </div>
  );
};
