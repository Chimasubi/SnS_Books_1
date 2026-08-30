import { Link } from 'react-router-dom';
import { getDashboardStats } from '@/services/analytics.service';
import { EmptyState } from '@/components/ui';
import { formatMoney, formatNumber } from '@/lib/format';
import { IconBook, IconUsers, IconDollar, IconChart, IconArrowRight } from '@/components/icons';
import { useMemo } from 'react';

export function AdminDashboard() {
  const stats = useMemo(() => getDashboardStats(), []);

  const cards = [
    { label: 'Books', value: formatNumber(stats.books), icon: <IconBook size={20} />, to: '/admin/books' },
    { label: 'Users', value: formatNumber(stats.users), icon: <IconUsers size={20} />, to: '/admin/users' },
    { label: 'Sales', value: formatNumber(stats.orders), icon: <IconDollar size={20} />, to: '/admin/orders' },
    {
      label: 'Revenue',
      value: stats.revenue > 0 ? formatMoney(stats.revenue, 'TZS') : 'TZS 0',
      icon: <IconChart size={20} />,
      to: '/admin/analytics',
    },
  ];

  return (
    <div className="stack">
      <div className="stat-grid">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="stat-card">
            <span className="orange">{c.icon}</span>
            <span className="stat-card-label">{c.label}</span>
            <span className="stat-card-value">{c.value}</span>
          </Link>
        ))}
      </div>

      <div className="admin-grid admin-grid-2">
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2>RECENT ORDERS</h2>
            <Link to="/admin/orders" className="btn btn-ghost btn-sm">All orders <IconArrowRight size={13} /></Link>
          </div>
          <div className="table-wrap">
            {stats.recentOrders.length === 0 ? (
              <div className="admin-panel-body">
                <EmptyState title="No orders yet" body="When readers purchase books, their orders appear here." />
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Book</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td>{o.reference}</td>
                      <td>{o.items[0]?.title}</td>
                      <td>{formatMoney(o.total.amount, o.total.currency)}</td>
                      <td><span className="chip chip-success">{o.status}</span></td>
                      <td>{new Date(o.createdAt).toLocaleDateString('en-GB')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="stack">
          <div className="admin-panel">
            <div className="admin-panel-head"><h2>READERS</h2></div>
            <div className="admin-panel-body stack-sm">
              <div className="row-between">
                <span className="muted">Active readers (last 30d)</span>
                <strong>{formatNumber(stats.activeReaders)}</strong>
              </div>
              <div className="row-between">
                <span className="muted">Reading completion</span>
                <strong>{stats.completionRate}%</strong>
              </div>
              {stats.popularBook && (
                <div className="row-between">
                  <span className="muted">Most purchased</span>
                  <strong>{stats.popularBook.title} · {stats.popularBook.sales}</strong>
                </div>
              )}
            </div>
          </div>

          <div className="admin-panel">
            <div className="admin-panel-head"><h2>MOST READ</h2></div>
            <div className="admin-panel-body">
              {stats.mostRead.length === 0 ? (
                <p className="muted">Open books to start collecting reader data.</p>
              ) : (
                <div className="stack-sm">
                  {stats.mostRead.map((m) => (
                    <div key={m.bookId} className="row-between">
                      <span className="muted">{m.title}</span>
                      <strong>{m.reads}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}