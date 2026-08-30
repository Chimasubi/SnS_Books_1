import { useState, type FormEvent } from 'react';
import type { CurrencyCode, SiteSettings } from '@/types';
import { db, getSettings } from '@/lib/store';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui';

const CURRENCIES: CurrencyCode[] = ['TZS', 'USD', 'EUR', 'GBP'];
const CURRENCY_LABEL: Record<CurrencyCode, string> = {
  TZS: 'Tanzanian Shilling',
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'Pound Sterling',
};

export function AdminSettings() {
  const { toast } = useToast();
  const [form, setForm] = useState<SiteSettings>(() => ({ ...getSettings() }));
  const [basePrices, setBasePrices] = useState<Record<CurrencyCode, number>>(() => ({
    ...getSettings().basePrices,
  }));

  const update = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleCurrency = (code: CurrencyCode) => {
    const enabled = form.currenciesEnabled.includes(code);
    const next = enabled
      ? form.currenciesEnabled.filter((c) => c !== code)
      : [...form.currenciesEnabled, code];
    if (next.length === 0) {
      toast('At least one currency is required.', 'error');
      return;
    }
    update('currenciesEnabled', next);
  };

  const save = (e: FormEvent) => {
    e.preventDefault();
    db.write<SiteSettings>('settings', [{ ...form, basePrices }]);
    toast('Settings saved.', 'success');
    window.location.reload();
  };

  const resetDemo = () => {
    if (!window.confirm('Reset all demo data to a fresh state? This clears orders, users, progress and bookmarks.')) return;
    window.localStorage.removeItem('sns.books.seeded.v1');
    const keys = Object.keys(window.localStorage).filter((k) => k.startsWith('sns.books.'));
    keys.forEach((k) => window.localStorage.removeItem(k));
    toast('Demo data reset. Reloading…', 'info');
    window.location.reload();
  };

  return (
    <form onSubmit={save} className="stack" style={{ maxWidth: 880 }}>
      <div className="panel panel-pad stack">
        <h2 className="mb-2" style={{ fontSize: 'var(--fs-lg)' }}>STORE</h2>
        <div className="field">
          <label className="field-label" htmlFor="s-name">Shop name</label>
          <input id="s-name" className="input" value={form.shopName} onChange={(e) => update('shopName', e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="s-tagline">Tagline</label>
          <input id="s-tagline" className="input" value={form.tagline} onChange={(e) => update('tagline', e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="s-announcement">Announcement bar (blank to hide)</label>
          <input id="s-announcement" className="input" value={form.announcement ?? ''} onChange={(e) => update('announcement', e.target.value || null)} placeholder="e.g. Free sample of every book" />
        </div>
      </div>

      <div className="panel panel-pad stack">
        <h2 className="mb-2" style={{ fontSize: 'var(--fs-lg)' }}>PRICING</h2>
        <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>
          Guide prices are set on each book in its own currency. These base amounts define
          conversion rates between enabled currencies.
        </p>
        {CURRENCIES.map((c) => (
          <div key={c} className="row-between flex-wrap" style={{ gap: 'var(--space-3)' }}>
            <label className="checkbox-row" style={{ margin: 0 }}>
              <input
                type="checkbox"
                checked={form.currenciesEnabled.includes(c)}
                onChange={() => toggleCurrency(c)}
              />
              {CURRENCY_LABEL[c]} ({c})
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              Base {c}
              <input
                className="input"
                style={{ width: 140 }}
                type="number"
                min={0}
                step="any"
                value={basePrices[c]}
                onChange={(e) => setBasePrices((p) => ({ ...p, [c]: Number(e.target.value) || 0 }))}
                aria-label={`Base price in ${c}`}
              />
            </label>
          </div>
        ))}
        <div className="field">
          <label className="field-label" htmlFor="s-default">Default store currency</label>
          <select
            id="s-default"
            className="select"
            value={form.defaultCurrency}
            onChange={(e) => update('defaultCurrency', e.target.value as CurrencyCode)}
          >
            {form.currenciesEnabled.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <p className="form-note">The currency first-time visitors see before they choose their own.</p>
        </div>
        <p className="form-note">
          E.g. a book priced TZS 15,000 converts to ${((15000 / (basePrices.TZS || 1)) * (basePrices.USD || 6.5)).toFixed(2)} USD at these base rates.
        </p>
      </div>

      <div className="panel panel-pad stack">
        <h2 className="mb-2" style={{ fontSize: 'var(--fs-lg)' }}>ACCESS & PRIVACY</h2>
        <label className="checkbox-row">
          <input type="checkbox" checked={form.allowRegistration} onChange={(e) => update('allowRegistration', e.target.checked)} />
          Allow new account registration
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={form.watermarkReaders} onChange={(e) => update('watermarkReaders', e.target.checked)} />
          Watermark the reader for logged-in users (per-user stamp, no tracking)
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={form.offlineReading} onChange={(e) => update('offlineReading', e.target.checked)} />
          Cache purchased chapters for offline reading (per-account, cleared on logout)
        </label>
      </div>

      <div className="row" style={{ gap: 'var(--space-3)' }}>
        <Button type="submit">Save Settings</Button>
        <Button type="button" variant="danger" onClick={resetDemo}>Reset Demo Data</Button>
      </div>
    </form>
  );
}