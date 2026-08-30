import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { CurrencyCode, PaymentMethodInfo, Money } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { getBookById } from '@/services/books.service';
import {
  getProvider,
  paymentOptionsFor,
} from '@/services/payments.service';
import { placeOrder, convertAmount, roundMoney, getCoupon, hasEntitlement, getSettings, getAuthor } from '@/lib/store';
import { CoverArt } from '@/components/CoverArt';
import { Button, Skeleton, EmptyState } from '@/components/ui';
import { IconBookOpen, IconShield, IconLock } from '@/components/icons';
import { formatMoney, formatNumber } from '@/lib/format';

export function Checkout() {
  usePageMeta({ title: 'Checkout', noindex: true });
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [book, setBook] = useState<Awaited<ReturnType<typeof getBookById>>>(null);
  const [currency, setCurrency] = useState<CurrencyCode>(getSettings().defaultCurrency);
  const [method, setMethod] = useState<string>('');
  const [providerId, setProviderId] = useState<string>('');
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<ReturnType<typeof getCoupon>>(null);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState<'summary' | 'paying' | 'verifying'>('summary');

  useEffect(() => {
    if (!bookId) return;
    getBookById(bookId).then((b) => {
      setBook(b);
      setCurrency(b?.price.currency ?? getSettings().defaultCurrency);
    });
  }, [bookId]);

  const options = useMemo(() => (book ? paymentOptionsFor(currency) : []), [book, currency]);

  // If re-entering, skip if already owned.
  useEffect(() => {
    if (user && book && hasEntitlement(user.id, book.id)) {
      toast('You already own this book.', 'info');
      navigate('/library', { replace: true });
    }
  }, [user, book, navigate, toast]);

  const priceInCurrency = useMemo(() => {
    if (!book) return null;
    const converted = convertAmount(book.price.amount, book.price.currency, currency);
    return { amount: roundMoney(converted, currency), currency } as Money;
  }, [book, currency]);

  const discount = coupon
    ? roundMoney((priceInCurrency?.amount ?? 0) * (coupon.percentOff / 100), priceInCurrency?.currency ?? currency)
    : 0;
  const total: Money | null = priceInCurrency
    ? { amount: roundMoney(priceInCurrency.amount - discount, priceInCurrency.currency), currency: priceInCurrency.currency }
    : null;

  const applyCouponNow = () => {
    if (!couponCode.trim()) return;
    const found = getCoupon(couponCode);
    if (found) {
      setCoupon(found);
      toast(`Coupon applied: ${found.percentOff}% off`, 'success');
    } else {
      setCoupon(null);
      toast('That coupon code is not valid.', 'error');
    }
  };

  const pay = async () => {
    if (!user || !book || !priceInCurrency || !method) return;
    const provider = getProvider(providerId);
    if (!provider) {
      toast('Payment gateway unavailable.', 'error');
      return;
    }
    setBusy(true);
    setStage('paying');
    try {
      const init = await provider.initiate({
        amount: total ?? priceInCurrency,
        userId: user.id,
        method,
        description: `${book.title} · ${book.eduNumber}`,
      });
      setStage('verifying');
      const verified = await provider.verify(init.reference);
      if (!verified.confirmed) {
        toast('The payment was not confirmed. Please try again.', 'error');
        navigate('/payment/failed', { state: { reference: init.reference } });
        return;
      }

      // Backend transaction: order → entitlement → library.
      const { order } = placeOrder({
        userId: user.id,
        bookId: book.id,
        currency: (total ?? priceInCurrency).currency,
        coupon,
        paymentMethod: method,
        provider: provider.id,
      });

      navigate('/payment/success', {
        state: { orderId: order.id, reference: order.reference, title: book.title, amount: order.total, bookId: book.id },
        replace: true,
      });
    } catch (err) {
      setBusy(false);
      setStage('summary');
      toast(err instanceof Error ? err.message : 'Payment failed. Please try again.', 'error');
    }
  };

  if (!book) {
    return (
      <div className="container section">
        <Skeleton style={{ height: 360 }} />
      </div>
    );
  }

  if (book.status === 'coming_soon') {
    return (
      <div className="container section">
        <EmptyState
          title="Not available yet"
          body={`${book.title} is coming soon. Pre-orders will open before launch.`}
          action={<Link to="/books" className="btn btn-primary">Browse books</Link>}
        />
      </div>
    );
  }

  const payBlocked = busy || !method || !priceInCurrency || !user;

  return (
    <div className="container">
      <section className="section" style={{ paddingTop: 'var(--space-7)' }}>
        <p className="eyebrow">Checkout</p>
        <h1 className="page-title mt-2">COMPLETE YOUR ORDER</h1>
      </section>

      <div className="checkout-grid">
        <div className="stack">
          <div className="panel panel-pad">
            <div className="row">
              <div style={{ width: 64 }}>
                <CoverArt book={book} />
              </div>
              <div>
                <span className="library-entry-order">{book.eduNumber}</span>
                <h2 style={{ fontSize: 'var(--fs-lg)', marginTop: 4 }}>{book.title}</h2>
                <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>
                  {book.subtitle} · by {getAuthor(book.authorId)?.name}
                </p>
              </div>
            </div>
          </div>

          <div className="panel panel-pad">
            <h2 className="mb-4" style={{ fontSize: 'var(--fs-lg)' }}>PAYMENT METHOD</h2>
            <div className="stack-sm">
              {options.flatMap((opt) =>
                opt.methods.map((m: PaymentMethodInfo) => {
                  const active = method === m.id && providerId === opt.providerId;
                  return (
                    <button
                      key={`${opt.providerId}-${m.id}`}
                      className={`pay-method ${active ? 'pay-method-active' : ''}`}
                      onClick={() => { setMethod(m.id); setProviderId(opt.providerId); }}
                      aria-pressed={active}
                    >
                      <span className="pay-method-radio" aria-hidden="true" />
                      <span className="stack-sm" style={{ gap: 2 }}>
                        <span className="pay-method-name">{m.label}</span>
                        <span className="pay-method-detail">{m.detail} · via {opt.providerName}</span>
                      </span>
                    </button>
                  );
                }),
              )}
            </div>
            <div className="pay-sim mt-4">
              <IconLock size={16} className="orange" style={{ marginTop: 2 }} />
              <span>
                This is a demonstration gateway. The payment client is intentionally abstracted
                (PaymentService → PaymentProvider) so real providers — M-Pesa, cards, PayPal,
                Stripe and others — can be plugged in without rebuilding checkout.
              </span>
            </div>
          </div>
        </div>

        <aside className="panel order-summary">
          <h2 className="mb-4" style={{ fontSize: 'var(--fs-lg)' }}>ORDER SUMMARY</h2>
          <div className="row">
            <div style={{ width: 52 }}>
              <CoverArt book={book} />
            </div>
            <div>
              <strong>{book.title}</strong>
              <p className="muted" style={{ fontSize: 'var(--fs-xs)' }}>E-BOOK · {book.category}</p>
            </div>
          </div>

          <div className="order-summary-row mt-4">
            <span className="muted">Subtotal ({priceInCurrency?.currency})</span>
            <span>{priceInCurrency ? formatMoney(priceInCurrency.amount, priceInCurrency.currency) : '—'}</span>
          </div>
          {coupon && (
            <div className="order-summary-row">
              <span className="muted">Coupon ({coupon.code})</span>
              <span className="orange">−{formatMoney(discount, priceInCurrency?.currency ?? 'TZS')}</span>
            </div>
          )}
          <div className="order-summary-total">
            <span>TOTAL</span>
            <span>{total ? formatMoney(total.amount, total.currency) : '—'}</span>
          </div>

          <div className="mt-4">
            <label className="field-label" htmlFor="coupon">Coupon code</label>
            <div className="row mt-2">
              <input
                id="coupon"
                className="input"
                style={{ minHeight: 40 }}
                placeholder="e.g. SNS10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <Button type="button" variant="outline" size="sm" onClick={applyCouponNow} disabled={!couponCode.trim()}>
                Apply
              </Button>
            </div>
          </div>

          <p className="muted mt-4" style={{ fontSize: 'var(--fs-xs)' }}>
            {book.price.currency !== (total?.currency) && (
              <>Fixed at {formatMoney(total?.amount ?? 0, currency)} ({currency}) · </>
            )}
            Authoritative price conversion is performed by the backend at checkout.
          </p>

          <Button block className="mt-4" onClick={pay} disabled={payBlocked} loading={busy}>
            {stage === 'paying' ? 'Awaiting approval…' : stage === 'verifying' ? 'Verifying payment…' : `Pay ${total ? formatMoney(total.amount, total.currency) : ''}`}
          </Button>

          <div className="row muted mt-3" style={{ fontSize: 'var(--fs-xs)', justifyContent: 'center', gap: 'var(--space-5)' }}>
            <span className="row" style={{ gap: 4 }}><IconShield size={14} /> Secure</span>
            <span className="row" style={{ gap: 4 }}><IconBookOpen size={14} /> Instant access</span>
          </div>

          <p className="form-note mt-3 text-center">
            Buyer: <strong>{user?.name}</strong> · {user?.email}
          </p>

          {import.meta.env.DEV && (
            <p className="form-note mt-2 text-center">
              Demo order nr {formatNumber(Date.now() % 100000)}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}