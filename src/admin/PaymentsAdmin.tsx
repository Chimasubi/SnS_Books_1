import { useMemo } from 'react';
import type { PaymentTransaction, User } from '@/types';
import { db } from '@/lib/store';
import { EmptyState } from '@/components/ui';
import { IconShield } from '@/components/icons';
import { formatDate, formatMoney } from '@/lib/format';

const STATUS_CHIP: Record<PaymentTransaction['status'], string> = {
  confirmed: 'chip-success',
  pending: '',
  created: '',
  failed: '',
};

export function AdminPayments() {
  const payments = useMemo(
    () => [...db.read<PaymentTransaction>('payments')].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [],
  );
  const users = useMemo(() => db.read<User>('users'), []);

  return (
    <div className="stack">
      <p className="muted">
        {payments.length} payment records · Payments are reconciled against the store's order
        ledger; a confirmed payment is what releases an entitlement.
      </p>

      {payments.length === 0 ? (
        <EmptyState
          icon={<IconShield size={24} />}
          title="No payment records"
          body="Every confirmed payment through the payment providers appears here, linked to its order."
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Reader</th>
                <th>Provider</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>{p.reference}</td>
                  <td>{users.find((u) => u.id === p.userId)?.email ?? p.userId}</td>
                  <td>{p.provider}</td>
                  <td>{p.method}</td>
                  <td>{formatMoney(p.amount.amount, p.amount.currency)}</td>
                  <td><span className={`chip ${STATUS_CHIP[p.status]}`}>{p.status}</span></td>
                  <td>{formatDate(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}