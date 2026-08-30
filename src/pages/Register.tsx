import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '@/services/auth.service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Button } from '@/components/ui';
import { Logo } from '@/components/Logo';
import { getSettings } from '@/lib/store';

const COUNTRIES = [
  'Tanzania',
  'Kenya',
  'Uganda',
  'Rwanda',
  'Burundi',
  'Nigeria',
  'South Africa',
  'Ethiopia',
  'Ghana',
  'United States',
  'United Kingdom',
  'Germany',
  'France',
  'Netherlands',
  'Other',
];

export function Register() {
  usePageMeta({ title: 'Create Account', noindex: true });
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('Tanzania');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const settings = getSettings();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!settings.allowRegistration) {
      setError('New registrations are currently paused.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      const user = await register({ name, email, password, country });
      setUser(user);
      toast('Your account is ready. Enjoy your library.', 'success');
      navigate('/library', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-wrap page">
      <div className="auth-card">
        <div className="mb-4"><Logo /></div>
        <h1>CREATE ACCOUNT</h1>
        <p className="auth-sub">Begin your SNS Books library in under a minute.</p>

        <form onSubmit={submit} className="stack">
          <div className="field">
            <label className="field-label" htmlFor="name">Full name</label>
            <input
              id="name"
              className="input"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              className="input"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@sns.books"
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              className="input"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="country">Country</label>
            <select id="country" className="select" value={country} onChange={(e) => setCountry(e.target.value)}>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}

          <Button type="submit" block loading={busy}>
            {busy ? 'Creating…' : 'Create Account'}
          </Button>
          <p className="form-note">
            By continuing you agree to the SNS Books terms. Purchased books are tied to your account.
          </p>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}