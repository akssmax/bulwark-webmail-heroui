'use client';
import { Loader } from "@/components/ui/loader";

import { useEffect, useState } from 'react';
import { Save, RotateCcw, Sparkles } from "lucide-react";
import { apiFetch } from '@/lib/browser-navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppSelect } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { AppModal } from '@/components/ui/modal';

interface ConfigEntry {
  // Sensitive keys (sessionSecret, oauthClientSecret) come back with
  // `value` omitted and `hasValue` set instead - the server never echoes
  // the raw secret to the client.
  value?: unknown;
  source: 'admin' | 'env' | 'default';
  hasValue?: boolean;
}

export function AuthTab() {
  const [config, setConfig] = useState<Record<string, ConfigEntry>>({});
  const [edits, setEdits] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => { fetchConfig(); }, []);

  async function fetchConfig() {
    setLoading(true);
    const res = await apiFetch('/api/admin/config');
    if (res.ok) setConfig(await res.json());
    setLoading(false);
  }

  function handleChange(key: string, value: unknown) {
    setEdits(prev => ({ ...prev, [key]: value }));
    setMessage(null);
  }

  function currentValue(key: string): unknown {
    if (key in edits) return edits[key];
    return config[key]?.value;
  }

  async function handleSave() {
    if (Object.keys(edits).length === 0) return;
    setSaving(true);
    setMessage(null);

    const res = await apiFetch('/api/admin/config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(edits),
    });

    if (res.ok) {
      setMessage({ type: 'success', text: 'Authentication settings saved.' });
      setEdits({});
      await fetchConfig();
    } else {
      const data = await res.json();
      setMessage({ type: 'error', text: data.error || 'Failed to save' });
    }
    setSaving(false);
  }

  async function handleRevert(key: string) {
    const res = await apiFetch('/api/admin/config', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    });
    if (res.ok) {
      setEdits(prev => { const next = { ...prev }; delete next[key]; return next; });
      await fetchConfig();
    }
  }

  const [setupRunning, setSetupRunning] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [setupOrigin, setSetupOrigin] = useState('');
  const [setupIssuer, setSetupIssuer] = useState('');
  const [setupOauthOnly, setSetupOauthOnly] = useState(false);

  function openSetupDialog() {
    if (typeof window === 'undefined') return;
    const origin = window.location.origin;
    const jmapUrl = (currentValue('jmapServerUrl') as string | undefined)?.replace(/\/+$/, '') || '';
    setSetupOrigin(origin);
    setSetupIssuer(jmapUrl || origin);
    setSetupOauthOnly(currentValue('oauthOnly') === true);
    setSetupOpen(true);
  }

  async function handleAutoSetup() {
    setSetupRunning(true);
    setMessage(null);
    try {
      const res = await apiFetch('/api/admin/oauth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: setupOrigin.trim().replace(/\/+$/, ''),
          issuerUrl: setupIssuer.trim().replace(/\/+$/, ''),
          oauthOnly: setupOauthOnly,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: 'success',
          text: `OAuth client ${data.action} on Stalwart (${data.issuerUrl}). ${data.redirectUriCount} redirect URI(s) registered for ${data.origin}.`,
        });
        setEdits({});
        setSetupOpen(false);
        await fetchConfig();
      } else {
        const detail = data.detail ? ` (${typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail).slice(0, 200)})` : '';
        setMessage({ type: 'error', text: (data.error || 'Setup failed') + detail });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Setup failed' });
    } finally {
      setSetupRunning(false);
    }
  }

  const setupOriginValid = /^https?:\/\/[^/]+$/.test(setupOrigin.trim().replace(/\/+$/, ''));
  const setupIssuerValid = /^https?:\/\/[^/]+$/.test(setupIssuer.trim().replace(/\/+$/, ''));

  const hasEdits = Object.keys(edits).length > 0;

  if (loading) {
    return <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-foreground">Authentication</h1>
          <p className="text-sm text-muted-foreground mt-1">OAuth, SSO, and session configuration</p>
        </div>
        {hasEdits && (
          <Button onClick={handleSave} disabled={saving} className="h-9 gap-2">
            {saving ? <Loader size="sm" color="current" /> : <Save className="w-4 h-4" />}
            Save changes
          </Button>
        )}
      </div>

      {message && (
        <div className={`text-sm rounded-md px-3 py-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300' : 'bg-destructive/10 text-destructive'}`}>
          {message.text}
        </div>
      )}

      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <h3 className="text-sm font-medium text-foreground">Auto-configure OAuth (Stalwart)</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Registers an OAuth client on the connected Stalwart server, generates a client secret, and saves the settings here.
              Requires your Stalwart account to have admin permissions.
            </p>
          </div>
          <Button
            onClick={openSetupDialog}
            disabled={setupRunning}
            className="shrink-0 h-9 gap-2"
          >
            {setupRunning ? <Loader size="sm" color="current" /> : <Sparkles className="w-4 h-4" />}
            {setupRunning ? 'Configuring…' : 'Set up automagically'}
          </Button>
        </div>
      </div>

      <AppModal
        isOpen={setupOpen}
        onClose={() => { if (!setupRunning) setSetupOpen(false); }}
        title="Auto-configure OAuth"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setSetupOpen(false)} disabled={setupRunning}>
              Cancel
            </Button>
            <Button
              onClick={handleAutoSetup}
              disabled={setupRunning || !setupOriginValid || !setupIssuerValid}
              className="gap-2"
            >
              {setupRunning ? <Loader size="sm" color="current" /> : <Sparkles className="w-4 h-4" />}
              {setupRunning ? 'Configuring…' : 'Configure'}
            </Button>
          </>
        }
      >
        <p className="text-xs text-muted-foreground mb-4">
          Verify the URLs below before continuing. The webmail and Stalwart can live on different domains.
        </p>
        <div className="space-y-4">
          <div>
            <label htmlFor="setup-origin" className="block text-xs font-medium text-foreground mb-1">
              Webmail origin
            </label>
            <Input
              id="setup-origin"
              type="url"
              value={setupOrigin}
              onChange={(e) => setSetupOrigin(e.target.value)}
              disabled={setupRunning}
              placeholder="https://webmail.example.com"
              className="h-9"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Used to register redirect URIs (one per locale: <code>{setupOrigin.trim().replace(/\/+$/, '') || 'https://…'}/&lt;locale&gt;/auth/callback</code>) on Stalwart.
            </p>
            {!setupOriginValid && setupOrigin.length > 0 && (
              <p className="text-xs text-destructive mt-1">Must be like https://host with no path.</p>
            )}
          </div>
          <div>
            <label htmlFor="setup-issuer" className="block text-xs font-medium text-foreground mb-1">
              Stalwart issuer URL
            </label>
            <Input
              id="setup-issuer"
              type="url"
              value={setupIssuer}
              onChange={(e) => setSetupIssuer(e.target.value)}
              disabled={setupRunning}
              placeholder="https://mail.example.com"
              className="h-9"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Where Stalwart serves <code>/.well-known/oauth-authorization-server</code>. Saved as <code>OAUTH_ISSUER_URL</code>. Pre-filled from your JMAP server URL.
            </p>
            {!setupIssuerValid && setupIssuer.length > 0 && (
              <p className="text-xs text-destructive mt-1">Must be like https://host with no path.</p>
            )}
          </div>
          <Checkbox
            isSelected={setupOauthOnly}
            onChange={setSetupOauthOnly}
            isDisabled={setupRunning}
            className="text-xs text-foreground"
          >
            Also enable “OAuth only” (hide password login)
          </Checkbox>
        </div>
      </AppModal>

      <Section title="OAuth / OpenID Connect">
        <Toggle label="OAuth Enabled" configKey="oauthEnabled" value={currentValue('oauthEnabled') as boolean} source={config.oauthEnabled?.source} onChange={handleChange} onRevert={handleRevert} />
        <Toggle label="OAuth Only" description="Hide password login form when enabled" configKey="oauthOnly" value={currentValue('oauthOnly') as boolean} source={config.oauthOnly?.source} onChange={handleChange} onRevert={handleRevert} />
        <Text label="OAuth Client ID" configKey="oauthClientId" value={currentValue('oauthClientId') as string} source={config.oauthClientId?.source} onChange={handleChange} onRevert={handleRevert} />
        <Text label="OAuth Client Secret" configKey="oauthClientSecret" value={currentValue('oauthClientSecret') as string} source={config.oauthClientSecret?.source} onChange={handleChange} onRevert={handleRevert} type="password" placeholder={config.oauthClientSecret?.hasValue ? '••••••••  (saved - type to replace)' : undefined} />
        <Text label="OAuth Issuer URL" configKey="oauthIssuerUrl" value={currentValue('oauthIssuerUrl') as string} source={config.oauthIssuerUrl?.source} onChange={handleChange} onRevert={handleRevert} placeholder="https://auth.example.com" />
        <Toggle label="Allow private OAuth endpoints" description="Permit discovery to resolve to RFC-1918 / loopback hosts. Enable only for split-DNS deployments where the mail server's public hostname resolves to an internal IP." configKey="oauthAllowPrivateEndpoints" value={currentValue('oauthAllowPrivateEndpoints') as boolean} source={config.oauthAllowPrivateEndpoints?.source} onChange={handleChange} onRevert={handleRevert} />
        <Text label="OAuth Scopes" description="Space-separated scopes that replace the defaults. Leave blank to use the built-in scope list." configKey="oauthScopes" value={currentValue('oauthScopes') as string} source={config.oauthScopes?.source} onChange={handleChange} onRevert={handleRevert} placeholder="openid email offline_access" />
        <Text label="OAuth Extra Scopes" description="Additional space-separated scopes appended to the defaults." configKey="oauthExtraScopes" value={currentValue('oauthExtraScopes') as string} source={config.oauthExtraScopes?.source} onChange={handleChange} onRevert={handleRevert} placeholder="urn:ietf:params:oauth:..." />
      </Section>

      <Section title="Single Sign-On">
        <Toggle label="Auto SSO" description="Automatically redirect to SSO provider on load" configKey="autoSsoEnabled" value={currentValue('autoSsoEnabled') as boolean} source={config.autoSsoEnabled?.source} onChange={handleChange} onRevert={handleRevert} />
      </Section>

      <Section title="Admin Dashboard">
        <Select
          label="Stalwart admin access"
          description="What a Stalwart admin account grants in this dashboard. “Automatic” signs Stalwart admins in without the admin password; “Password required” keeps the shield but asks for the admin password; “Off” ignores Stalwart admin status entirely. The last two need an admin password to be configured."
          configKey="stalwartAdminAccess"
          value={currentValue('stalwartAdminAccess') as string}
          source={config.stalwartAdminAccess?.source}
          options={['auto', 'password', 'off']}
          optionLabels={{ auto: 'Automatic (no password)', password: 'Password required', off: 'Off (separate admins)' }}
          onChange={handleChange}
          onRevert={handleRevert}
        />
      </Section>

      <Section title="Session & Security">
        <Select label="Cookie SameSite" configKey="cookieSameSite" value={currentValue('cookieSameSite') as string} source={config.cookieSameSite?.source} options={['lax', 'strict', 'none']} onChange={handleChange} onRevert={handleRevert} />
        <Text label="Allowed Frame Ancestors" configKey="allowedFrameAncestors" value={currentValue('allowedFrameAncestors') as string} source={config.allowedFrameAncestors?.source} onChange={handleChange} onRevert={handleRevert} placeholder="'none' or https://..." />
        <Text label="Parent Origin" description="For embedded mode communication" configKey="parentOrigin" value={currentValue('parentOrigin') as string} source={config.parentOrigin?.source} onChange={handleChange} onRevert={handleRevert} />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border rounded-lg">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

function SourceBadge({ source }: { source?: string }) {
  if (!source || source === 'default') return null;
  return (
    <span className={`text-xs font-medium uppercase tracking-wider px-1.5 py-0.5 rounded ${source === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
      {source}
    </span>
  );
}

function Text({ label, description, configKey, value, source, onChange, onRevert, placeholder, type = 'text' }: {
  label: string; description?: string; configKey: string; value: string; source?: string;
  onChange: (k: string, v: unknown) => void; onRevert: (k: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div className="px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground">{label}</span>
          <SourceBadge source={source} />
        </div>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Input
          type={type}
          value={value ?? ''}
          onChange={(e) => onChange(configKey, e.target.value)}
          placeholder={placeholder}
          className="h-8 w-full sm:w-64"
        />
        {source === 'admin' && (
          <Button variant="ghost" size="icon" onClick={() => onRevert(configKey)} className="shrink-0 h-8 w-8" aria-label="Revert">
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

function Toggle({ label, description, configKey, value, source, onChange, onRevert }: {
  label: string; description?: string; configKey: string; value: boolean; source?: string;
  onChange: (k: string, v: unknown) => void; onRevert: (k: string) => void;
}) {
  return (
    <div className="px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground">{label}</span>
          <SourceBadge source={source} />
        </div>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Switch checked={value} onChange={(checked) => onChange(configKey, checked)} aria-label={label} />
        {source === 'admin' && (
          <Button variant="ghost" size="icon" onClick={() => onRevert(configKey)} className="h-8 w-8" aria-label="Revert">
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

function Select({ label, description, configKey, value, source, options, optionLabels, onChange, onRevert }: {
  label: string; description?: string; configKey: string; value: string; source?: string; options: string[];
  optionLabels?: Record<string, string>;
  onChange: (k: string, v: unknown) => void; onRevert: (k: string) => void;
}) {
  return (
    <div className="px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground">{label}</span>
          <SourceBadge source={source} />
        </div>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <AppSelect
          value={value ?? ''}
          onChange={(next) => onChange(configKey, next)}
          options={options.map((o) => ({ value: o, label: optionLabels?.[o] ?? o }))}
          aria-label={label}
          className="w-auto min-w-[10rem]"
        />
        {source === 'admin' && (
          <Button variant="ghost" size="icon" onClick={() => onRevert(configKey)} className="h-8 w-8" aria-label="Revert">
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
