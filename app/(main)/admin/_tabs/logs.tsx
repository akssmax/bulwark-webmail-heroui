'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import type { AuditEntry } from '@/lib/admin/types';
import { apiFetch } from '@/lib/browser-navigation';
import { Button } from '@/components/ui/button';
import { AppSelect } from '@/components/ui/select';

export function LogsTab() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const limit = 50;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (actionFilter) params.set('action', actionFilter);

    const res = await apiFetch(`/api/admin/audit?${params}`);
    if (res.ok) {
      const data = await res.json();
      setEntries(data.entries || []);
      setTotal(data.total || 0);
    }
    setLoading(false);
  }, [page, actionFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-foreground">Audit Log</h1>
          <p className="text-sm text-muted-foreground mt-1">{total} total entries</p>
        </div>
        <Button
          variant="outline"
          onClick={fetchLogs}
          className="h-9 gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <AppSelect
          value={actionFilter}
          onChange={(value) => { setActionFilter(value); setPage(1); }}
          options={[
            { value: '', label: 'All actions' },
            { value: 'admin.login', label: 'Login' },
            { value: 'admin.logout', label: 'Logout' },
            { value: 'admin.login_failed', label: 'Login Failed' },
            { value: 'admin.login_blocked', label: 'Login Blocked' },
            { value: 'admin.change-password', label: 'Password Change' },
            { value: 'config.update', label: 'Config Update' },
            { value: 'config.revert', label: 'Config Revert' },
            { value: 'policy.update', label: 'Policy Update' },
          ]}
          aria-label="Filter by action"
          className="w-full sm:w-auto min-w-[12rem]"
        />
      </div>

      <div className="sm:hidden space-y-2">
        {loading && entries.length === 0 ? (
          <div className="rounded-lg border border-border px-4 py-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="rounded-lg border border-border px-4 py-8 text-center text-sm text-muted-foreground">No entries found</div>
        ) : (
          entries.map((entry, i) => (
            <div key={i} className="rounded-lg border border-border p-3 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground truncate">
                  {entry.action}
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(entry.ts).toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-foreground break-words">
                {formatDetail(entry.detail)}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {entry.ip}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden sm:block border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-start px-4 py-2 font-medium text-muted-foreground whitespace-nowrap">Time</th>
              <th className="text-start px-4 py-2 font-medium text-muted-foreground whitespace-nowrap">Action</th>
              <th className="text-start px-4 py-2 font-medium text-muted-foreground">Details</th>
              <th className="text-start px-4 py-2 font-medium text-muted-foreground whitespace-nowrap">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && entries.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Loading...</td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No entries found</td>
              </tr>
            ) : (
              entries.map((entry, i) => (
                <tr key={i} className="hover:bg-muted/20">
                  <td className="px-4 py-2 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(entry.ts).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {entry.action}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs text-foreground max-w-xs truncate">
                    {formatDetail(entry.detail)}
                  </td>
                  <td className="px-4 py-2 text-xs text-muted-foreground font-mono">
                    {entry.ip}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDetail(detail: Record<string, unknown>): string {
  if (!detail || Object.keys(detail).length === 0) return '-';
  if (detail.reason) return String(detail.reason);
  if (detail.key) return `${detail.key}: ${JSON.stringify(detail.old)} → ${JSON.stringify(detail.new)}`;
  if (detail.changes && Array.isArray(detail.changes)) {
    return detail.changes.map((c: Record<string, unknown>) => `${c.key}`).join(', ');
  }
  if (detail.restrictionCount !== undefined) return `${detail.restrictionCount} restriction(s)`;
  return JSON.stringify(detail).slice(0, 100);
}
