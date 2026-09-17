'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react';
import type { JmapServerEntry } from '@/lib/admin/jmap-servers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  value: JmapServerEntry[];
  source?: string;
  onChange: (next: JmapServerEntry[]) => void;
  onRevert: () => void;
}

interface RowDraft {
  id: string;
  label: string;
  url: string;
  domains: string;
  oauthClientId: string;
  oauthIssuerUrl: string;
  oauthClientSecret: string;
  oauthExpanded: boolean;
}

function entryToDraft(e: JmapServerEntry): RowDraft {
  return {
    id: e.id,
    label: e.label,
    url: e.url,
    domains: (e.domains ?? []).join(', '),
    oauthClientId: e.oauth?.clientId ?? '',
    oauthIssuerUrl: e.oauth?.issuerUrl ?? '',
    oauthClientSecret: e.oauth?.clientSecret ?? '',
    oauthExpanded: !!(e.oauth && (e.oauth.clientId || e.oauth.issuerUrl || e.oauth.clientSecret)),
  };
}

function draftToEntry(d: RowDraft): JmapServerEntry | null {
  const id = d.id.trim();
  const url = d.url.trim().replace(/\/+$/, '');
  if (!id || !url) return null;
  const domains = d.domains
    .split(/[,\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const clientId = d.oauthClientId.trim();
  const issuerUrl = d.oauthIssuerUrl.trim().replace(/\/+$/, '');
  const clientSecret = d.oauthClientSecret;
  const oauth = clientId || issuerUrl || clientSecret
    ? {
        ...(clientId ? { clientId } : {}),
        ...(issuerUrl ? { issuerUrl } : {}),
        ...(clientSecret ? { clientSecret } : {}),
      }
    : undefined;
  return {
    id,
    label: d.label.trim() || id,
    url,
    ...(domains.length > 0 ? { domains } : {}),
    ...(oauth ? { oauth } : {}),
  };
}

function emptyDraft(): RowDraft {
  return {
    id: '',
    label: '',
    url: '',
    domains: '',
    oauthClientId: '',
    oauthIssuerUrl: '',
    oauthClientSecret: '',
    oauthExpanded: false,
  };
}

export function JmapServersSection({ value, source, onChange, onRevert }: Props) {
  const [drafts, setDrafts] = useState<RowDraft[]>(() => value.map(entryToDraft));
  const lastEmittedRef = useRef(value);

  useEffect(() => {
    if (value === lastEmittedRef.current) return;
    setDrafts(value.map(entryToDraft))
  }, [value]);

  function commit(next: RowDraft[]) {
    setDrafts(next);
    const entries = next.map(draftToEntry).filter((e): e is JmapServerEntry => e !== null);
    lastEmittedRef.current = entries;
    onChange(entries);
  }

  function update(idx: number, patch: Partial<RowDraft>) {
    commit(drafts.map((d, i) => (i === idx ? { ...d, ...patch } : d)));
  }

  function remove(idx: number) {
    commit(drafts.filter((_, i) => i !== idx));
  }

  function add() {
    setDrafts((prev) => [...prev, emptyDraft()]);
    // Don't commit yet - new row needs id+url before it counts.
  }

  const ids = new Set<string>();
  const duplicateIdx = new Set<number>();
  drafts.forEach((d, i) => {
    const id = d.id.trim();
    if (!id) return;
    if (ids.has(id)) duplicateIdx.add(i);
    ids.add(id);
  });

  return (
    <div className="px-4 py-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Servers</span>
            {source && source !== 'default' && (
              <span className={`text-xs font-medium uppercase tracking-wider px-1.5 py-0.5 rounded ${source === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {source}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Each entry appears as an option on the login dropdown. Leave the list empty to fall back to the single <code className="text-xs">JMAP Server URL</code> above.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {source === 'admin' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRevert}
              className="h-8 w-8"
              aria-label="Revert to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={add}
            className="h-8 gap-1.5 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add server
          </Button>
        </div>
      </div>

      {drafts.length === 0 && (
        <div className="text-xs text-muted-foreground italic">No servers configured.</div>
      )}

      {drafts.map((d, i) => {
        const isDuplicate = duplicateIdx.has(i);
        return (
          <div key={i} className="rounded-md border border-border bg-muted/20 p-3 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-start">
              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-muted-foreground mb-1">ID</label>
                <Input
                  type="text"
                  value={d.id}
                  onChange={(e) => update(i, { id: e.target.value })}
                  placeholder="main"
                  className={`h-8 ${isDuplicate ? 'border-destructive' : ''}`}
                />
                {isDuplicate && <p className="text-xs text-destructive mt-0.5">Duplicate id</p>}
              </div>
              <div className="sm:col-span-4">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Label</label>
                <Input
                  type="text"
                  value={d.label}
                  onChange={(e) => update(i, { label: e.target.value })}
                  placeholder="Main server"
                  className="h-8"
                />
              </div>
              <div className="sm:col-span-5">
                <label className="block text-xs font-medium text-muted-foreground mb-1">JMAP URL</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="url"
                    value={d.url}
                    onChange={(e) => update(i, { url: e.target.value })}
                    placeholder="https://mail.example.com"
                    className="h-8"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(i)}
                    className="shrink-0 h-8 w-8 hover:text-destructive"
                    aria-label="Remove server"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Email domains (comma-separated, used for auto-pick)
              </label>
              <Input
                type="text"
                value={d.domains}
                onChange={(e) => update(i, { domains: e.target.value })}
                placeholder="example.com, example.org"
                className="h-8"
              />
            </div>
            <Button
              variant="ghost"
              onClick={() => update(i, { oauthExpanded: !d.oauthExpanded })}
              className="h-auto px-0 gap-1 text-xs text-muted-foreground hover:text-foreground font-normal"
              type="button"
            >
              {d.oauthExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              Per-server OAuth (optional, overrides global)
            </Button>
            {d.oauthExpanded && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 ps-4 border-s border-border">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">OAuth Client ID</label>
                  <Input
                    type="text"
                    value={d.oauthClientId}
                    onChange={(e) => update(i, { oauthClientId: e.target.value })}
                    className="h-8"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">OAuth Issuer URL</label>
                  <Input
                    type="url"
                    value={d.oauthIssuerUrl}
                    onChange={(e) => update(i, { oauthIssuerUrl: e.target.value })}
                    placeholder="https://auth.example.com"
                    className="h-8"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">OAuth Client Secret</label>
                  <Input
                    type="password"
                    value={d.oauthClientSecret}
                    onChange={(e) => update(i, { oauthClientSecret: e.target.value })}
                    className="h-8"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
