import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '@/services/auth.service';
import { useToast } from '@/context/ToastContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Button } from '@/components/ui';
import { Logo } from '@/components/Logo';

export function ForgotPassword() {
  usePageMeta({ title: 'Forgot Password', noindex: true });
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    setBusy(true);
    try {
      await forgotPassword(email);
      setSent(true);
      toast('If that account exists, a reset link is on its way.', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-wrap page">
      <div className="auth-card">
        <div className="mb-4"><Logo /></div>
        {sent ? (
          <>
            <h1>CHECK YOUR INBOX</h1>
            <p className="auth-sub">
              If an account exists for <strong>{email}</strong>, a password reset link has been
              sent. This demo does not dispatch real email — in production the backend would
              send a secure, time-limited reset link.
            </p>
            <Link to="/login" className="btn btn-outline btn-block">Back to sign in</Link>
          </>
        ) : (
          <>
            <h1>RESET PASSWORD</h1>
            <p className="auth-sub">
              Enter the email tied to your account and we will send you a reset link.
            </p>
            <form onSubmit={submit} className="stack">
              <div className="field">
                <label className="field-label" htmlFor="fp-email">Email</label>
                <input
                  id="fp-email"
                  className="input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@sns.books"
                />
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <Button type="submit" block loading={busy}>Send Reset Link</Button>
            </form>
            <p className="auth-switch">
              Remembered it? <Link to="/login">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}