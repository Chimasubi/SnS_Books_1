import type { CurrencyCode } from '@/types';

/**
 * Currency metadata. Final payable amounts are always computed by the
 * backend/service layer (see lib/store.ts `computePrice`); this table only
 * provides display metadata.
 */
export const CURRENCY_META: Record<
  CurrencyCode,
  { label: string; symbol: string; placeholder: string; decimals: number }
> = {
  TZS: { label: 'Tanzanian Shilling', symbol: 'TZS', placeholder: 'TZS 15,000', decimals: 0 },
  USD: { label: 'US Dollar', symbol: '$', placeholder: '$6.50', decimals: 2 },
  EUR: { label: 'Euro', symbol: '€', placeholder: '€6.00', decimals: 2 },
  GBP: { label: 'Pound Sterling', symbol: '£', placeholder: '£5.00', decimals: 2 },
};

export function formatMoney(amount: number, currency: CurrencyCode): string {
  const meta = CURRENCY_META[currency];
  const value = meta.decimals > 0 ? amount.toFixed(meta.decimals) : amount.toLocaleString('en-US');
  return currency === 'TZS' ? `${meta.symbol} ${value}` : `${meta.symbol}${value}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function timeAgo(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function centsToMajor(value: number): number {
  return value / 100;
}

export function majorToCents(value: number): number {
  return Math.round(value * 100);
}