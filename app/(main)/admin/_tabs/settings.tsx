'use client';
import { Loader } from "@/components/ui/loader";

import { useEffect, useState } from 'react';
import { Save, RotateCcw } from "lucide-react";
import { apiFetch } from '@/lib/browser-navigation';
import { JmapServersSection } from './_jmap-servers-section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppSelect } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { JmapServerEntry } from '@/lib/admin/jmap-servers';

interface ConfigEntry {
  value?: unknown;
  source: 'admin' | 'env' | 'default';
  hasValue?: boolean;
}

export function SettingsTab() {
  const [config, setConfig] = useState<Record<string, ConfigEntry>>({});
  const [edits, setEdits] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    setLoading(true);
    const res = await apiFetch('/api/admin/config');
    if (res.ok) {
      setConfig(await res.json());
    }
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
      setMessage({ type: 'success', text: 'Settings saved. Changes take effect on next page load.' });
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
      setEdits(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      await fetchConfig();
      setMessage({ type: 'success', text: `${key} reverted to default` });
    }
  }

  const hasEdits = Object.keys(edits).length > 0;

  if (loading) {
    return <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-foreground">Server Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">General server configuration</p>
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

      <SettingsSection title="General">
        <TextSetting label="Application Name" configKey="appName" value={currentValue('appName') as string} source={config.appName?.source} onChange={handleChange} onRevert={handleRevert} />
        <TextSetting label="JMAP Server URL" configKey="jmapServerUrl" value={currentValue('jmapServerUrl') as string} source={config.jmapServerUrl?.source} onChange={handleChange} onRevert={handleRevert} placeholder="https://mail.example.com" />
        <ToggleSetting label="Allow Custom JMAP Endpoint" description="Show a JMAP server URL field on the login form, allowing users to connect to any JMAP server" configKey="allowCustomJmapEndpoint" value={currentValue('allowCustomJmapEndpoint') as boolean} source={config.allowCustomJmapEndpoint?.source} onChange={handleChange} onRevert={handleRevert} />
        {!!currentValue('allowCustomJmapEndpoint') && (
          <div className="px-4 py-2.5 bg-amber-50 dark:bg-amber-950/30 border-s-2 border-amber-400 dark:border-amber-600">
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              <strong>CORS warning:</strong> External JMAP servers must include this domain in their CORS <code className="text-xs bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded">Access-Control-Allow-Origin</code> header, or requests from the browser will be blocked.
            </p>
          </div>
        )}
        <ToggleSetting label="Stalwart Features" description="Enable Stalwart Mail Server-specific features" configKey="stalwartFeaturesEnabled" value={currentValue('stalwartFeaturesEnabled') as boolean} source={config.stalwartFeaturesEnabled?.source} onChange={handleChange} onRevert={handleRevert} />
        <ToggleSetting label="Demo Mode" description="Enable demo mode with sample data" configKey="demoMode" value={currentValue('demoMode') as boolean} source={config.demoMode?.source} onChange={handleChange} onRevert={handleRevert} />
        <ToggleSetting label="Search Engine Indexing" description="Allow search engines to index this webmail. Off (the default) sends noindex/nofollow in the page head, recommended for private deployments." configKey="searchEngineIndexing" value={currentValue('searchEngineIndexing') as boolean} source={config.searchEngineIndexing?.source} onChange={handleChange} onRevert={handleRevert} />
      </SettingsSection>

      <SettingsSection title="JMAP Servers (multi-server)">
        <ToggleSetting
          label="Auto-pick server by email domain"
          description="When users type their email, automatically select the matching server from the list below."
          configKey="jmapServerAutoPickByDomain"
          value={currentValue('jmapServerAutoPickByDomain') as boolean}
          source={config.jmapServerAutoPickByDomain?.source}
          onChange={handleChange}
          onRevert={handleRevert}
        />
        <JmapServersSection
          value={(currentValue('jmapServers') as JmapServerEntry[]) ?? []}
          source={config.jmapServers?.source}
          onChange={(next) => handleChange('jmapServers', next)}
          onRevert={() => handleRevert('jmapServers')}
        />
        {Array.isArray(currentValue('jmapServers')) && (currentValue('jmapServers') as JmapServerEntry[]).length > 0 && (
          <div className="px-4 py-2.5 bg-amber-50 dark:bg-amber-950/30 border-s-2 border-amber-400 dark:border-amber-600">
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              <strong>CORS warning:</strong> Each JMAP server must allow this webmail's origin in its <code className="text-xs bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded">Access-Control-Allow-Origin</code> header, or browser requests will be blocked.
            </p>
          </div>
        )}
      </SettingsSection>

      <SettingsSection title="Document Editing (WOPI)">
        <TextSetting label="WOPI Client URL" configKey="wopiClientUrl" value={currentValue('wopiClientUrl') as string} source={config.wopiClientUrl?.source} onChange={handleChange} onRevert={handleRevert} placeholder="https://office.example.com" />
        <TextSetting label="WOPI Host URL Override" configKey="wopiHostUrl" value={currentValue('wopiHostUrl') as string} source={config.wopiHostUrl?.source} onChange={handleChange} onRevert={handleRevert} placeholder="https://mail.example.com" />
        <div className="px-4 py-2.5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Point the client URL at a WOPI-compatible office suite (Collabora Online, OnlyOffice, EuroOffice, …) to let users edit documents in Files. The host override is only needed when the editor reaches this webmail under a different address than the browser does (e.g. Docker networks). The editor must also allow this webmail as a WOPI host.
          </p>
        </div>
      </SettingsSection>

      <SettingsSection title="Logging">
        <SelectSetting label="Log Format" configKey="logFormat" value={currentValue('logFormat') as string} source={config.logFormat?.source} options={['text', 'json']} onChange={handleChange} onRevert={handleRevert} />
        <SelectSetting label="Log Level" configKey="logLevel" value={currentValue('logLevel') as string} source={config.logLevel?.source} options={['error', 'warn', 'info', 'debug']} onChange={handleChange} onRevert={handleRevert} />
      </SettingsSection>

      <SettingsSection title="Settings Sync">
        <ToggleSetting label="Settings Sync Enabled" description="Requires SESSION_SECRET to be set" configKey="settingsSyncEnabled" value={currentValue('settingsSyncEnabled') as boolean} source={config.settingsSyncEnabled?.source} onChange={handleChange} onRevert={handleRevert} />
      </SettingsSection>
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border rounded-lg">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
      </div>
      <div className="divide-y divide-border">
        {children}
      </div>
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

function TextSetting({ label, configKey, value, source, onChange, onRevert, placeholder }: {
  label: string; configKey: string; value: string; source?: string;
  onChange: (key: string, value: unknown) => void; onRevert: (key: string) => void; placeholder?: string;
}) {
  return (
    <div className="px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex items-center gap-2 min-w-0">
        <label className="text-sm text-foreground">{label}</label>
        <SourceBadge source={source} />
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(configKey, e.target.value)}
          placeholder={placeholder}
          className="h-8 w-full sm:w-64"
        />
        {source === 'admin' && (
          <Button variant="ghost" size="icon" onClick={() => onRevert(configKey)} className="shrink-0 h-8 w-8" aria-label="Revert to default">
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

function ToggleSetting({ label, description, configKey, value, source, onChange, onRevert }: {
  label: string; description?: string; configKey: string; value: boolean; source?: string;
  onChange: (key: string, value: unknown) => void; onRevert: (key: string) => void;
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
          <Button variant="ghost" size="icon" onClick={() => onRevert(configKey)} className="h-8 w-8" aria-label="Revert to default">
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

function SelectSetting({ label, configKey, value, source, options, onChange, onRevert }: {
  label: string; configKey: string; value: string; source?: string; options: string[];
  onChange: (key: string, value: unknown) => void; onRevert: (key: string) => void;
}) {
  return (
    <div className="px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm text-foreground">{label}</span>
        <SourceBadge source={source} />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <AppSelect
          value={value ?? ''}
          onChange={(next) => onChange(configKey, next)}
          options={options.map((opt) => ({ value: opt, label: opt }))}
          aria-label={label}
          className="w-auto min-w-[10rem]"
        />
        {source === 'admin' && (
          <Button variant="ghost" size="icon" onClick={() => onRevert(configKey)} className="h-8 w-8" aria-label="Revert to default">
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
