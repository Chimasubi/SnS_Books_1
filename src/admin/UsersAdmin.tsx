import { useMemo, useState } from 'react';
import type { User } from '@/types';
import { db } from '@/lib/store';
import { useToast } from '@/context/ToastContext';
import { EmptyState, Button } from '@/components/ui';
import { IconSearch, IconUsers } from '@/components/icons';
import { formatDate } from '@/lib/format';

const ROLE_LABEL: Record<User['role'], string> = {
  USER: 'Reader',
  AUTHOR: 'Author',
  ADMIN: 'Admin',
};

export function AdminUsers() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');

  const users = useMemo(
    () =>
      db
        .read<User>('users')
        .filter((u) => u.role === 'USER' || u.role === 'AUTHOR')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [],
  );

  const filtered = users.filter(
    (u) => `${u.name} ${u.email} ${u.country}`.toLowerCase().includes(query.toLowerCase()),
  );

  const toggleDisable = (user: User) => {
    db.upsert<User>('users', { ...user, disabled: !user.disabled });
    toast(`${user.name} ${user.disabled ? 're-enabled' : 'disabled'}.`, 'info');
    window.location.reload();
  };

  const setRole = (user: User, role: User['role']) => {
    db.upsert<User>('users', { ...user, role });
    toast(`Role updated to ${ROLE_LABEL[role]}.`, 'success');
    window.location.reload();
  };

  if (users.length === 0) {
    return (
      <EmptyState
        icon={<IconUsers size={24} />}
        title="No readers yet"
        body="Reader accounts appear here as people register on the site."
      />
    );
  }

  return (
    <div className="stack">
      <div className="row-between flex-wrap">
        <p className="muted">{users.length} accounts</p>
        <div className="searchbox" style={{ maxWidth: 320 }}>
          <IconSearch size={16} />
          <input
            className="input"
            placeholder="Search name, email, country"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search accounts"
          />
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Reader</th>
              <th>Country</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>
                  <strong>{u.name}</strong>
                  <p className="muted" style={{ fontSize: 'var(--fs-xs)' }}>{u.email}</p>
                </td>
                <td>{u.country}</td>
                <td>
                  <select
                    className="select select-sm"
                    value={u.role}
                    onChange={(e) => setRole(u, e.target.value as User['role'])}
                    aria-label={`Role for ${u.name}`}
                  >
                    <option value="USER">{ROLE_LABEL.USER}</option>
                    <option value="AUTHOR">{ROLE_LABEL.AUTHOR}</option>
                  </select>
                </td>
                <td>{formatDate(u.createdAt)}</td>
                <td>
                  <span className={`chip ${u.disabled ? '' : 'chip-success'}`}>
                    {u.disabled ? 'Disabled' : 'Active'}
                  </span>
                </td>
                <td>
                  <Button
                    variant={u.disabled ? 'outline' : 'ghost'}
                    size="sm"
                    onClick={() => toggleDisable(u)}
                  >
                    {u.disabled ? 'Re-enable' : 'Disable'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}