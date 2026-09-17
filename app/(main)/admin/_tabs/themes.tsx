'use client';
import { Loader } from "@/components/ui/loader";

import { useEffect, useState, useRef } from 'react';
import { Upload, Trash2, Power, PowerOff, Palette, Save, Shield, Lock, LockOpen } from "lucide-react";
import type { SettingsPolicy } from '@/lib/admin/types';
import { DEFAULT_POLICY, DEFAULT_THEME_POLICY } from '@/lib/admin/types';
import { apiFetch } from '@/lib/browser-navigation';
import { BUILTIN_THEMES } from '@/lib/builtin-themes';
import { Button } from '@/components/ui/button';
import { AppSelect } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

// Derive from the single source of truth so newly added built-in themes show
// up here automatically (was previously a hardcoded subset — see #496).
const BUILTIN_THEME_OPTIONS = BUILTIN_THEMES.map(t => ({ id: t.id, name: t.name }));

interface ThemeEntry {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  variants: string[];
  enabled: boolean;
  forceEnabled?: boolean;
  installedAt: string;
  updatedAt: string;
}

export function ThemesTab() {
  const [themes, setThemes] = useState<ThemeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [policy, setPolicy] = useState<SettingsPolicy>({ ...DEFAULT_POLICY });
  const [policyDirty, setPolicyDirty] = useState(false);
  const [savingPolicy, setSavingPolicy] = useState(false);

  useEffect(() => { fetchThemes(); fetchPolicy(); }, []);

  async function fetchPolicy() {
    try {
      const res = await apiFetch('/api/admin/policy');
      if (res.ok) {
        const data = await res.json();
        setPolicy({
          ...data,
          themePolicy: { ...DEFAULT_THEME_POLICY, ...(data.themePolicy || {}) },
        });
      }
    } catch { /* ignore */ }
  }

  function toggleThemesEnabled() {
    setPolicy(prev => ({
      ...prev,
      features: { ...prev.features, themesEnabled: !prev.features.themesEnabled },
    }));
    setPolicyDirty(true);
    setMessage(null);
  }

  function toggleUserThemeUploads() {
    setPolicy(prev => ({
      ...prev,
      features: { ...prev.features, userThemesEnabled: !prev.features.userThemesEnabled },
    }));
    setPolicyDirty(true);
    setMessage(null);
  }

  function toggleBuiltinTheme(themeId: string) {
    setPolicy(prev => {
      const disabled = prev.themePolicy?.disabledBuiltinThemes || [];
      const isDisabled = disabled.includes(themeId);
      return {
        ...prev,
        themePolicy: {
          ...DEFAULT_THEME_POLICY,
          ...prev.themePolicy,
          disabledBuiltinThemes: isDisabled
            ? disabled.filter((id: string) => id !== themeId)
            : [...disabled, themeId],
        },
      };
    });
    setPolicyDirty(true);
    setMessage(null);
  }

  function toggleAdminTheme(themeId: string) {
    setPolicy(prev => {
      const disabled = prev.themePolicy?.disabledThemes || [];
      const isDisabled = disabled.includes(themeId);
      return {
        ...prev,
        themePolicy: {
          ...DEFAULT_THEME_POLICY,
          ...prev.themePolicy,
          disabledThemes: isDisabled
            ? disabled.filter((id: string) => id !== themeId)
            : [...disabled, themeId],
        },
      };
    });
    setPolicyDirty(true);
    setMessage(null);
  }

  function setDefaultTheme(themeId: string | null) {
    setPolicy(prev => ({
      ...prev,
      themePolicy: {
        ...DEFAULT_THEME_POLICY,
        ...prev.themePolicy,
        defaultThemeId: themeId,
      },
    }));
    setPolicyDirty(true);
    setMessage(null);
  }

  async function handleSavePolicy() {
    setSavingPolicy(true);
    setMessage(null);
    try {
      const res = await apiFetch('/api/admin/policy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Theme policy saved. Users will see changes on next login.' });
        setPolicyDirty(false);
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Failed to save policy' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save policy' });
    } finally {
      setSavingPolicy(false);
    }
  }

  async function fetchThemes() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/themes');
      if (res.ok) setThemes(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiFetch('/api/admin/themes', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        const warnings = data.warnings?.length ? ` (${data.warnings.length} warning(s))` : '';
        setMessage({ type: 'success', text: `Theme "${data.theme.name}" installed${warnings}` });
        await fetchThemes();
      } else {
        setMessage({ type: 'error', text: data.error || 'Upload failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Upload failed' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function toggleTheme(id: string, enabled: boolean) {
    setMessage(null);
    const res = await apiFetch('/api/admin/themes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, enabled }),
    });

    if (res.ok) {
      setThemes(prev => prev.map(t => t.id === id ? { ...t, enabled } : t));
    } else {
      const data = await res.json();
      setMessage({ type: 'error', text: data.error || 'Update failed' });
    }
  }

  async function toggleForceEnabled(id: string, forceEnabled: boolean) {
    setMessage(null);
    const body: Record<string, unknown> = { id, forceEnabled };
    if (forceEnabled) body.enabled = true;

    const res = await apiFetch('/api/admin/themes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setThemes(prev => prev.map(t => t.id === id ? { ...t, forceEnabled, ...(forceEnabled ? { enabled: true } : {}) } : t));
      setPolicy(prev => {
        const current = prev.forceEnabledThemes || [];
        return {
          ...prev,
          forceEnabledThemes: forceEnabled
            ? [...current.filter(tid => tid !== id), id]
            : current.filter(tid => tid !== id),
        };
      });
      setPolicyDirty(true);
    } else {
      const data = await res.json();
      setMessage({ type: 'error', text: data.error || 'Update failed' });
    }
  }

  async function forceEnableAll() {
    setMessage(null);
    const disabled = themes.filter(t => !t.enabled);
    if (disabled.length === 0) {
      setMessage({ type: 'success', text: 'All themes are already enabled' });
      return;
    }
    let failed = 0;
    for (const t of disabled) {
      const res = await apiFetch('/api/admin/themes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: t.id, enabled: true }),
      });
      if (!res.ok) failed++;
    }
    if (failed === 0) {
      await fetchThemes();
      setMessage({ type: 'success', text: `All ${disabled.length} theme(s) enabled` });
    } else {
      await fetchThemes();
      setMessage({ type: 'error', text: `${failed} theme(s) failed to enable` });
    }
  }

  async function forceDisableAll() {
    setMessage(null);
    const enabled = themes.filter(t => t.enabled);
    if (enabled.length === 0) {
      setMessage({ type: 'success', text: 'All themes are already disabled' });
      return;
    }
    let failed = 0;
    for (const t of enabled) {
      const res = await apiFetch('/api/admin/themes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: t.id, enabled: false }),
      });
      if (!res.ok) failed++;
    }
    if (failed === 0) {
      await fetchThemes();
      setMessage({ type: 'success', text: `All ${enabled.length} theme(s) disabled` });
    } else {
      await fetchThemes();
      setMessage({ type: 'error', text: `${failed} theme(s) failed to disable` });
    }
  }

  async function deleteTheme(id: string, name: string) {
    if (!confirm(`Remove theme "${name}"? This cannot be undone.`)) return;

    setMessage(null);
    const res = await apiFetch('/api/admin/themes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setThemes(prev => prev.filter(t => t.id !== id));
      setMessage({ type: 'success', text: `Theme "${name}" removed` });
    } else {
      const data = await res.json();
      setMessage({ type: 'error', text: data.error || 'Delete failed' });
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">Loading...</div>;
  }

  const themesEnabled = policy.features.themesEnabled ?? true;
  const userThemesEnabled = policy.features.userThemesEnabled ?? true;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-foreground">Themes</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage themes and theme policy for all users</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {policyDirty && (
            <Button onClick={handleSavePolicy} disabled={savingPolicy} className="h-9 gap-2">
              {savingPolicy ? <Loader size="sm" color="current" /> : <Save className="w-4 h-4" />}
              Save Policy
            </Button>
          )}
          <Button
            className="h-9 gap-2"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? <Loader size="sm" color="current" /> : <Upload className="w-4 h-4" />}
            Upload Theme
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={handleUpload}
            disabled={uploading}
            className="sr-only"
          />
        </div>
      </div>

      {message && (
        <div className={`text-sm rounded-md px-3 py-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300' : 'bg-destructive/10 text-destructive'}`}>
          {message.text}
        </div>
      )}

      <div className="border border-border rounded-lg">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-foreground">Theme Policy</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Control theme availability and defaults for users</p>
        </div>

        <div className="divide-y divide-border">
          <div className="px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <span className="text-sm text-foreground">Themes Enabled</span>
              <p className="text-xs text-muted-foreground mt-0.5">Allow users to select and apply themes</p>
            </div>
            <Switch checked={themesEnabled} onChange={toggleThemesEnabled} aria-label="Themes Enabled" className="shrink-0" />
          </div>

          <div className="px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <span className="text-sm text-foreground">User Theme Uploads</span>
              <p className="text-xs text-muted-foreground mt-0.5">Allow users to upload their own theme files</p>
            </div>
            <Switch checked={userThemesEnabled} onChange={toggleUserThemeUploads} aria-label="User Theme Uploads" className="shrink-0" />
          </div>

          {themes.length > 0 && (
            <div className="px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <span className="text-sm text-foreground">Force Enable / Disable All</span>
                <p className="text-xs text-muted-foreground mt-0.5">Bulk toggle all deployed themes at once</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" onClick={forceEnableAll} className="h-7 gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700">
                  <Power className="w-3.5 h-3.5" />
                  Enable All
                </Button>
                <Button variant="secondary" size="sm" onClick={forceDisableAll} className="h-7 gap-1.5">
                  <PowerOff className="w-3.5 h-3.5" />
                  Disable All
                </Button>
              </div>
            </div>
          )}

          <div className="px-4 py-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <span className="text-sm text-foreground">Default Theme</span>
                <p className="text-xs text-muted-foreground mt-0.5">Theme applied when users have not chosen one</p>
              </div>
              <AppSelect
                value={policy.themePolicy?.defaultThemeId || ''}
                onChange={(value) => setDefaultTheme(value || null)}
                placeholder="System Default"
                aria-label="Default Theme"
                className="w-full sm:w-auto shrink-0"
                groups={[
                  {
                    label: 'Default',
                    options: [{ value: '', label: 'System Default' }],
                  },
                  {
                    label: 'Built-in',
                    options: BUILTIN_THEME_OPTIONS
                      .filter(t => !(policy.themePolicy?.disabledBuiltinThemes || []).includes(t.id))
                      .map(t => ({ value: t.id, label: t.name })),
                  },
                  ...(themes.length > 0
                    ? [{
                        label: 'Admin-deployed',
                        options: themes
                          .filter(t => !(policy.themePolicy?.disabledThemes || []).includes(t.id))
                          .map(t => ({ value: t.id, label: t.name })),
                      }]
                    : []),
                ]}
              />
            </div>
          </div>

          <div className="px-4 py-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Built-in Themes</span>
            <div className="mt-2 space-y-2">
              {BUILTIN_THEME_OPTIONS.map(theme => {
                const disabled = (policy.themePolicy?.disabledBuiltinThemes || []).includes(theme.id);
                return (
                  <div key={theme.id} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-foreground">{theme.name}</span>
                    <Switch checked={!disabled} onChange={() => toggleBuiltinTheme(theme.id)} aria-label={theme.name} />
                  </div>
                );
              })}
            </div>
          </div>

          {themes.length > 0 && (
            <div className="px-4 py-3">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Admin-deployed Themes</span>
              <div className="mt-2 space-y-2">
                {themes.map(theme => {
                  const disabled = (policy.themePolicy?.disabledThemes || []).includes(theme.id);
                  return (
                    <div key={theme.id} className="flex items-center justify-between gap-4">
                      <span className="text-sm text-foreground">{theme.name}</span>
                      <Switch checked={!disabled} onChange={() => toggleAdminTheme(theme.id)} aria-label={theme.name} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border border-border rounded-lg">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-foreground">Deployed Themes</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Admin-uploaded themes available to all users</p>
        </div>
        {themes.length === 0 ? (
          <div className="p-12 text-center">
            <Palette className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No themes installed</p>
            <p className="text-xs text-muted-foreground mt-1">Upload a theme ZIP file to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {themes.map(theme => (
              <div key={theme.id} className="px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm font-medium text-foreground">{theme.name}</span>
                    <span className="text-xs text-muted-foreground">v{theme.version}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${theme.enabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                      {theme.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    {theme.forceEnabled && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Forced
                      </span>
                    )}
                  </div>
                  {theme.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{theme.description}</p>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    by {theme.author} &middot; {theme.variants.join(', ')} &middot; installed {new Date(theme.installedAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleForceEnabled(theme.id, !theme.forceEnabled)}
                    aria-label={theme.forceEnabled ? 'Remove force-enable (users can deactivate)' : 'Force enable (users cannot deactivate)'}
                    className={theme.forceEnabled ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-950/50' : undefined}
                  >
                    {theme.forceEnabled ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleTheme(theme.id, !theme.enabled)}
                    aria-label={theme.enabled ? 'Disable' : 'Enable'}
                  >
                    <Power className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTheme(theme.id, theme.name)}
                    aria-label="Remove"
                    className="hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
