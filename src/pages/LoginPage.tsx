import { useState } from 'react';
import { useNavigate } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/Layout';
import { Leaf, Mail, AlertCircle, ArrowLeft, UserCircle, Sprout, Stethoscope, ShieldCheck, MailCheck } from 'lucide-react';
import { PasswordInput } from '@/components/PasswordInput';
import { DEMO_ACCOUNTS } from '@/lib/demo';
import type { UserRole } from '@/types';

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn, requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate('/dashboard');
    }
  }

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResetLoading(true);
    const { error } = await requestPasswordReset(resetEmail);
    setResetLoading(false);
    if (error) {
      setError(error);
    } else {
      setResetSent(true);
    }
  }

  async function demoLogin(role: UserRole) {
    setLoading(true);
    setError(null);
    const account = DEMO_ACCOUNTS[role];
    setEmail(account.email);
    setPassword(account.password);
    const { error } = await signIn(account.email, account.password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate(role === 'admin' ? '/admin-dashboard' : role === 'expert' ? '/expert-dashboard' : '/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-sky-50 flex flex-col">
      <nav className="px-4 sm:px-6 h-16 flex items-center">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-primary-700 hover:text-primary-800">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-primary-900">Welcome Back</h1>
            <p className="text-gray-500 mt-1">Sign in to your AgriDoctor AI account</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 animate-scale-in">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <PasswordInput
              value={password}
              onChange={setPassword}
              required
              autoComplete="current-password"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => { setForgotOpen((v) => !v); setResetSent(false); setError(null); }}
                className="text-sm text-primary-600 font-medium hover:text-primary-700"
              >
                {forgotOpen ? 'Back to sign in' : 'Forgot password?'}
              </button>
            </div>
            <Button type="submit" size="lg" disabled={loading} className="w-full">
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          {forgotOpen && (
            <div className="mt-4 p-4 rounded-xl bg-primary-50/60 border border-primary-100 animate-scale-in">
              {resetSent ? (
                <div className="flex items-start gap-2">
                  <MailCheck className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-primary-800">
                    If an account exists for <span className="font-semibold">{resetEmail}</span>, a password reset link has been sent. Check your inbox and follow the link to set a new password.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleResetRequest} className="space-y-3">
                  <p className="text-sm text-gray-600">Enter your email and we'll send you a link to reset your password.</p>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                  <Button type="submit" size="md" disabled={resetLoading} className="w-full">
                    {resetLoading ? 'Sending…' : 'Send Reset Link'}
                  </Button>
                </form>
              )}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-sm text-gray-500 mb-3">Try a demo account:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => demoLogin('farmer')}
                disabled={loading}
                className="flex flex-col items-center gap-1 p-3 rounded-xl border border-primary-100 hover:bg-primary-50 transition-colors"
              >
                <Sprout className="w-5 h-5 text-primary-600" />
                <span className="text-xs font-medium text-gray-700">Farmer</span>
              </button>
              <button
                onClick={() => demoLogin('expert')}
                disabled={loading}
                className="flex flex-col items-center gap-1 p-3 rounded-xl border border-primary-100 hover:bg-primary-50 transition-colors"
              >
                <Stethoscope className="w-5 h-5 text-primary-600" />
                <span className="text-xs font-medium text-gray-700">Expert</span>
              </button>
              <button
                onClick={() => demoLogin('admin')}
                disabled={loading}
                className="flex flex-col items-center gap-1 p-3 rounded-xl border border-primary-100 hover:bg-primary-50 transition-colors"
              >
                <ShieldCheck className="w-5 h-5 text-primary-600" />
                <span className="text-xs font-medium text-gray-700">Admin</span>
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <button onClick={() => navigate('/register')} className="text-primary-600 font-semibold hover:text-primary-700">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
