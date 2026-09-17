'use client';

// Modal shown the first time a plugin is enabled, listing every permission
// the plugin's manifest declares. Accepting persists the grant on the
// plugin record so future enables skip the prompt.

import React, { useEffect, useSyncExternalStore } from 'react';
import { head, resolveHead, subscribe, describePermission } from '@/lib/plugin-sandbox/consent';
import { AppModal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

export function PluginConsentDialog(): React.JSX.Element | null {
  const current = useSyncExternalStore(subscribe, head, () => null);

  useEffect(() => {
    if (!current) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        resolveHead(false);
      }
    }
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [current]);

  if (!current) return null;

  return (
    <AppModal
      isOpen
      onClose={() => resolveHead(false)}
      size="md"
      className="max-w-[560px]"
      title={`Allow "${current.pluginName}" to access your data?`}
      bodyClassName="space-y-4"
      footer={(
        <div className="flex gap-2 justify-end w-full">
          <Button type="button" variant="outline" onClick={() => resolveHead(false)}>
            Deny
          </Button>
          <Button type="button" autoFocus onClick={() => resolveHead(true)}>
            Allow
          </Button>
        </div>
      )}
    >
      <p className="text-xs text-muted-foreground">
        This plugin is requesting the permissions below. You can revoke them by uninstalling the plugin.
      </p>

      <ul className="list-none p-0 m-0 max-h-80 overflow-y-auto space-y-1.5">
        {current.permissions.map((perm) => {
          const desc = describePermission(perm);
          return (
            <li
              key={perm}
              className="p-2.5 rounded-lg bg-accent border border-border"
            >
              <div className="text-sm font-semibold mb-0.5">{desc.title}</div>
              <div className="text-xs text-muted-foreground">{desc.body}</div>
              <code className="text-xs text-muted-foreground block mt-1">{perm}</code>
            </li>
          );
        })}
      </ul>

      <div className="text-xs text-muted-foreground text-end">
        Plugin: {current.pluginId}
      </div>
    </AppModal>
  );
}
