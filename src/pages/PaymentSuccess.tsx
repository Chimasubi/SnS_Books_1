import { Link, useLocation } from 'react-router-dom';
import type { Money } from '@/types';
import { usePageMeta } from '@/hooks/usePageMeta';
import { formatMoney } from '@/lib/format';
import { IconCheckCircle, IconBookOpen, IconLibrary, IconShield } from '@/components/icons';

interface SuccessState {
  orderId?: string;
  reference?: string;
  title?: string;
  amount?: Money;
  bookId?: string;
}

export function PaymentSuccess() {
  usePageMeta({ title: 'Purchase Complete', noindex: true });
  const location = useLocation();
  const state = (location.state ?? {}) as SuccessState;

  return (
    <main className="success-wrap page">
      <div className="stack-lg text-center" style={{ alignItems: 'center' }}>
        <span className="success-mark"><IconCheckCircle size={44} /></span>
        <div>
          <p className="eyebrow">Order confirmed</p>
          <h1 className="page-title mt-2">PURCHASE COMPLETE</h1>
        </div>
        <p className="auth-sub" style={{ maxWidth: 460 }}>
          {state.title ? (
            <>
              <strong>{state.title}</strong> has been added to your library.
            </>
          ) : (
            <>Your book has been added to your library.</>
          )}
        </p>

        {state.reference && (
          <div className="panel panel-pad">
            <div className="order-summary-row">
              <span className="muted">Order reference</span>
              <span>{state.reference}</span>
            </div>
            {state.amount && (
              <div className="order-summary-row">
                <span className="muted">Amount paid</span>
                <span className="orange" style={{ fontWeight: 'var(--fw-bold)' }}>
                  {formatMoney(state.amount.amount, state.amount.currency)}
                </span>
              </div>
            )}
            {state.orderId && (
              <div className="order-summary-row" style={{ borderBottom: 0 }}>
                <span className="muted">Recorded against your account</span>
                <span><IconShield size={14} className="orange" /> Entitlement active</span>
              </div>
            )}
          </div>
        )}

        <div className="row flex-wrap" style={{ justifyContent: 'center' }}>
          <Link to="/library" className="btn btn-primary">
            <IconLibrary size={16} /> Go to My Library
          </Link>
          {state.bookId ? (
            <Link to={`/read/${state.bookId}`} className="btn btn-outline">
              <IconBookOpen size={16} /> Read Now
            </Link>
          ) : (
            <button className="btn btn-outline" onClick={() => window.history.back()}>
              <IconBookOpen size={16} /> Back
            </button>
          )}
        </div>

        <p className="form-note">
          The entitlement and order were created on the backend at purchase time — not by the
          success screen. Enjoy your book.
        </p>
      </div>
    </main>
  );
}