import { useState } from 'react';
import { useNavigate } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/Layout';
import { PasswordInput } from '@/components/PasswordInput';
import { Leaf, AlertCircle, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      setSuccess(true);
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
              {success ? <CheckCircle2 className="w-7 h-7 text-white" /> : <KeyRound className="w-7 h-7 text-white" />}
            </div>
            <h1 className="text-2xl font-bold text-primary-900">
              {success ? 'Password Updated' : 'Set a New Password'}
            </h1>
            <p className="text-gray-500 mt-1">
              {success ? 'You can now sign in with your new password.' : 'Enter a new password for your account.'}
            </p>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">Your password has been reset successfully.</p>
              </div>
              <Button size="lg" className="w-full" onClick={() => navigate('/login')}>
                Go to Sign In
              </Button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 animate-scale-in">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <PasswordInput
                  label="New Password"
                  value={password}
                  onChange={setPassword}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <PasswordInput
                  label="Confirm Password"
                  value={confirm}
                  onChange={setConfirm}
                  placeholder="Re-enter new password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <Button type="submit" size="lg" disabled={loading} className="w-full">
                  {loading ? 'Updating…' : 'Update Password'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
