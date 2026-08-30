import { Link, useLocation } from 'react-router-dom';
import { usePageMeta } from '@/hooks/usePageMeta';
import { IconAlert, IconRefresh } from '@/components/icons';

export function PaymentFailed() {
  usePageMeta({ title: 'Payment Failed', noindex: true });
  const location = useLocation();
  const reference = (location.state as { reference?: string } | null)?.reference;

  return (
    <main className="success-wrap page">
      <div className="stack-lg text-center" style={{ alignItems: 'center' }}>
        <span className="success-mark" style={{ color: 'var(--sns-danger)', background: 'rgba(255,77,79,0.12)' }}>
          <IconAlert size={44} />
        </span>
        <div>
          <p className="eyebrow" style={{ color: 'var(--sns-danger)' }}>Order not completed</p>
          <h1 className="page-title mt-2">PAYMENT FAILED</h1>
        </div>
        <p className="auth-sub" style={{ maxWidth: 440 }}>
          Your payment was not confirmed, so no entitlement was created and nothing was charged.
          Please try again or choose a different payment method.
        </p>
        {reference && (
          <p className="form-note">
            Payment reference: <code>{reference}</code>
          </p>
        )}
        <div className="row flex-wrap" style={{ justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => window.history.back()}>
            <IconRefresh size={16} /> Try Again
          </button>
          <Link to="/books" className="btn btn-outline">Browse Books</Link>
        </div>
        <p className="form-note">
          If money was deducted but you didn't receive access, contact SNS Books support with
          the reference above.
        </p>
      </div>
    </main>
  );
}