import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { 
  ShieldAlert, 
  Lock, 
  ArrowRight, 
  AlertCircle,
  KeyRound,
  ChevronLeft,
  Building2
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const quickFillAdmin = () => {
    setEmail('admin@nie.ac.in');
    setPassword('Admin@123');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const success = await loginAdmin(email, password);
      if (success) {
        navigate('/admin');
      } else {
        setError('Unauthorized access. Invalid proctor credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'Unauthorized access. Please verify administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-sahayak-cream to-sahayak-cream-soft">
      <div className="w-full max-w-md space-y-6">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-sahayak-text-muted hover:text-sahayak-blue transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Campus Portal</span>
        </Link>

        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sahayak-blue-deep text-white shadow-neumorph mb-2 ring-4 ring-sahayak-gold/20">
            <ShieldAlert className="w-8 h-8 text-sahayak-gold" />
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
            Proctor & Security Console
          </h1>
          <p className="text-xs sm:text-sm text-sahayak-text-secondary">
            Authorized administrative & campus security access only
          </p>
        </div>

        {/* Quick Fill Test Admin */}
        <div className="p-3 rounded-2xl bg-sahayak-cream-soft border border-sahayak-brown/15 shadow-neumorph-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-sahayak-blue-deep">Test Admin Account</p>
            <p className="text-[11px] text-sahayak-text-muted">admin@nie.ac.in</p>
          </div>
          <button
            type="button"
            onClick={quickFillAdmin}
            className="px-3 py-1.5 rounded-xl bg-sahayak-blue text-sahayak-gold text-xs font-bold shadow-neumorph hover:bg-sahayak-blue-deep transition-all cursor-pointer"
          >
            Auto Fill
          </button>
        </div>

        {/* Card Form */}
        <NeumorphicCard className="p-6 sm:p-8 border border-sahayak-brown/20 shadow-neumorph-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-sahayak-error-soft border border-sahayak-error/20 flex items-start gap-2.5 text-xs text-sahayak-error font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                Staff / Proctor Official Email
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sahayak-text-muted" />
                <input
                  type="email"
                  required
                  placeholder="e.g. security.proctor@nie.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-sahayak-text-primary uppercase tracking-wider">
                Security Passcode
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sahayak-text-muted" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-sahayak-cream border border-sahayak-brown/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-sahayak-text-primary focus:outline-none focus:ring-2 focus:ring-sahayak-blue"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-sahayak-blue-deep text-sahayak-gold font-heading font-bold text-sm shadow-neumorph hover:bg-sahayak-blue transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {loading ? (
                <span>Verifying Authorization...</span>
              ) : (
                <>
                  <span>Access Security Console</span>
                  <ArrowRight className="w-4 h-4 text-sahayak-gold" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-sahayak-brown/10 text-center">
            <p className="text-xs text-sahayak-text-muted">
              Student attempting to login?{' '}
              <Link to="/login" className="text-sahayak-blue font-bold hover:underline">
                Student Portal
              </Link>
            </p>
          </div>
        </NeumorphicCard>
      </div>
    </div>
  );
};
