import { useMemo } from 'react';
import { getDashboardStats } from '@/services/analytics.service';
import { EmptyState } from '@/components/ui';
import { formatMoney } from '@/lib/format';

function Bars({ data }: { data: { day: string; orders: number; revenue: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.revenue));
  return (
    <div className="bar-chart" role="img" aria-label="Sales over the last 7 days">
      {data.map((d) => (
        <div key={d.day} className="bar-col">
          <div className="bar-value">{d.revenue > 0 ? formatMoney(d.revenue, 'TZS') : ''}</div>
          <div className="bar" style={{ height: `${(d.revenue / max) * 100}%` }} />
          <div className="bar-label">{d.day}</div>
        </div>
      ))}
    </div>
  );
}

export function AdminAnalytics() {
  const stats = useMemo(() => getDashboardStats(), []);
  const totalOrders = stats.salesByDay.reduce((s, d) => s + d.orders, 0);

  return (
    <div className="stack">
      <div className="admin-grid admin-grid-2">
        <div className="admin-panel">
          <div className="admin-panel-head"><h2>SALES — LAST 7 DAYS</h2></div>
          <div className="admin-panel-body">
            {totalOrders === 0 ? (
              <EmptyState title="No sales in this period" body="The chart fills in as orders are completed." />
            ) : (
              <Bars data={stats.salesByDay} />
            )}
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-head"><h2>READING ACTIVITY</h2></div>
          <div className="admin-panel-body stack-sm">
            <div className="row-between">
              <span className="muted">Active readers (30d)</span>
              <strong>{stats.activeReaders}</strong>
            </div>
            <div className="row-between">
              <span className="muted">Completion rate</span>
              <strong>{stats.completionRate}%</strong>
            </div>
            {stats.mostRead.length > 0 ? (
              <>
                <p className="eyebrow mt-3" style={{ marginBottom: 'var(--space-2)' }}>MOST READ</p>
                {stats.mostRead.map((m) => (
                  <div key={m.bookId} className="row-between">
                    <span className="muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</span>
                    <strong>{m.reads}</strong>
                  </div>
                ))}
              </>
            ) : (
              <p className="muted">No reading events yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="admin-grid admin-grid-3">
        <div className="admin-panel">
          <div className="admin-panel-head"><h2>CATALOGUE</h2></div>
          <div className="admin-panel-body stack-sm">
            <div className="row-between"><span className="muted">Published books</span><strong>{stats.books}</strong></div>
            <div className="row-between"><span className="muted">Reader accounts</span><strong>{stats.users}</strong></div>
          </div>
        </div>
        <div className="admin-panel">
          <div className="admin-panel-head"><h2>ORDERS</h2></div>
          <div className="admin-panel-body stack-sm">
            <div className="row-between"><span className="muted">Total orders</span><strong>{stats.orders}</strong></div>
            <div className="row-between"><span className="muted">Coupon code active</span><strong>SNS10</strong></div>
          </div>
        </div>
        <div className="admin-panel">
          <div className="admin-panel-head"><h2>REVENUE</h2></div>
          <div className="admin-panel-body stack-sm">
            <div className="row-between">
              <span className="muted">All-time</span>
              <strong>{stats.revenue > 0 ? formatMoney(stats.revenue, 'TZS') : 'TZS 0'}</strong>
            </div>
            <div className="row-between">
              <span className="muted">Popular</span>
              <strong style={{ textAlign: 'right' }}>{stats.popularBook ? stats.popularBook.title : '—'}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}