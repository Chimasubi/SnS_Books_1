import { useMemo, useState } from 'react';
import type { Order, User } from '@/types';
import { db } from '@/lib/store';
import { EmptyState } from '@/components/ui';
import { IconDollar, IconSearch } from '@/components/icons';
import { formatDate, formatMoney } from '@/lib/format';

const STATUS_CHIP: Record<Order['status'], string> = {
  paid: 'chip-success',
  pending: '',
  failed: '',
  refunded: 'chip-ghost',
  cancelled: 'chip-ghost',
};

export function AdminOrders() {
  const [status, setStatus] = useState<'all' | Order['status']>('all');
  const [query, setQuery] = useState('');

  const orders = useMemo(
    () =>
      [...db.read<Order>('orders')].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [],
  );
  const users = useMemo(() => db.read<User>('users'), []);

  const filtered = orders.filter((o) => {
    if (status !== 'all' && o.status !== status) return false;
    const email = users.find((u) => u.id === o.userId)?.email ?? '';
    if (query && !`${o.reference} ${email} ${o.items[0]?.title}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="stack">
      <div className="row-between flex-wrap">
        <p className="muted">{orders.length} orders</p>
        <div className="row flex-wrap" style={{ gap: 'var(--space-3)' }}>
          <div className="searchbox" style={{ maxWidth: 280 }}>
            <IconSearch size={16} />
            <input className="input" placeholder="Reference, email, book" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search orders" />
          </div>
          <select className="select select-sm" value={status} onChange={(e) => setStatus(e.target.value as 'all' | Order['status'])} aria-label="Filter by status">
            <option value="all">All statuses</option>
            {(['paid', 'pending', 'failed', 'refunded', 'cancelled'] as Order['status'][]).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<IconDollar size={24} />}
          title="No orders yet"
          body="Completed purchases are recorded here as secure, time-stamped order records."
        />
      ) : filtered.length === 0 ? (
        <EmptyState title="No matching orders" body="Try a different filter or search term." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Reader</th>
                <th>Book</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td>{o.reference}</td>
                  <td>{users.find((u) => u.id === o.userId)?.email ?? o.userId}</td>
                  <td>{o.items.map((i) => i.title).join(', ')}</td>
                  <td>{formatMoney(o.total.amount, o.total.currency)}</td>
                  <td><span className={`chip ${STATUS_CHIP[o.status]}`}>{o.status}</span></td>
                  <td>{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}