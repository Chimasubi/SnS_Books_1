import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login } from '@/services/auth.service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Button } from '@/components/ui';
import { Logo } from '@/components/Logo';
import { DEMO_CREDENTIALS } from '@/config/site';

export function Login() {
  usePageMeta({ title: 'Sign In', noindex: true });
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/library';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login({ email, password });
      setUser(user);
      toast(`Welcome back, ${user.name.split(' ')[0]}.`, 'success');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setBusy(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <main className="auth-wrap page">
      <div className="auth-card">
        <div className="mb-4"><Logo /></div>
        <h1>WELCOME BACK</h1>
        <p className="auth-sub">Sign in to your library and pick up where you left off.</p>

        <form onSubmit={submit} className="stack">
          <div className="field">
            <label className="field-label" htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@sns.books"
            />
          </div>
          <div className="field">
            <div className="row-between">
              <label className="field-label" htmlFor="password">Password</label>
              <Link to="/forgot-password" style={{ fontSize: 'var(--fs-xs)', color: 'var(--sns-orange)' }}>
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}

          <Button type="submit" block loading={busy}>
            {busy ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <div className="auth-divider">Demo access</div>
        <div className="auth-demo">
          <div className="auth-demo-row">
            <span>Reader demo</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => fillDemo(DEMO_CREDENTIALS.reader.email, DEMO_CREDENTIALS.reader.password)}
            >
              Use <code>{DEMO_CREDENTIALS.reader.email}</code>
            </button>
          </div>
          <div className="auth-demo-row">
            <span>Admin demo</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => fillDemo(DEMO_CREDENTIALS.admin.email, DEMO_CREDENTIALS.admin.password)}
            >
              Use <code>{DEMO_CREDENTIALS.admin.email}</code>
            </button>
          </div>
          <p className="mt-3" style={{ fontSize: 'var(--fs-xs)' }}>
            Demo environment only — never reuse these credentials in production.
          </p>
        </div>

        <p className="auth-switch">
          New to SNS Books? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </main>
  );
}