'use client';

// Host-rendered modal for plugin-requested confirm/alert/prompt dialogs.
// Subscribes to the host-dialog queue and renders the head request, one at
// a time. Closing the modal advances the queue. Prompts collect one or more
// (optionally masked) fields so plugins never fall back to `window.prompt`,
// which the sandbox blocks.

import React, { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { head, resolveHead, subscribe } from '@/lib/plugin-sandbox/host-dialog';
import { PluginIframeSlot } from './plugin-iframe-slot';
import type { SlotName } from '@/lib/plugin-types';
import { AppModal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function renderMessage(message?: string): React.ReactNode {
  if (!message) return null;
  return message.split('**').map((seg, i) =>
    i % 2 === 1
      ? <strong key={i}>{seg}</strong>
      : <React.Fragment key={i}>{seg}</React.Fragment>,
  );
}

export function PluginDialogHost(): React.JSX.Element | null {
  const current = useSyncExternalStore(subscribe, head, () => null);

  const isPrompt = current?.kind === 'prompt';
  const fields = useMemo(() => (isPrompt ? current?.fields ?? [] : []), [isPrompt, current]);

  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!current) return;
    const init: Record<string, string> = {};
    for (const f of current.fields ?? []) init[f.name] = '';
    setValues(init);
  }, [current]);

  const canSubmit = fields.every((f) => !f.required || (values[f.name] ?? '').length > 0);

  const cancel = () => resolveHead(current?.kind === 'prompt' || current?.kind === 'custom' ? null : false);
  const submitPrompt = () => { if (canSubmit) resolveHead(values); };

  useEffect(() => {
    if (!current) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        cancel();
      } else if (e.key === 'Enter' && (current?.kind === 'confirm' || current?.kind === 'alert')) {
        e.preventDefault();
        resolveHead(true);
      }
    }
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, canSubmit, values]);

  if (!current) return null;

  const confirmLabel = current.confirmLabel ?? (current.kind === 'alert' ? 'OK' : current.kind === 'prompt' ? 'Submit' : 'Confirm');
  const cancelLabel = current.cancelLabel ?? 'Cancel';
  const isCustom = current.kind === 'custom';

  return (
    <AppModal
      isOpen
      onClose={cancel}
      size={isCustom ? 'lg' : 'md'}
      className={isCustom ? 'max-w-xl max-h-[85vh]' : 'max-w-[480px]'}
      header={(
        <div className="flex items-start justify-between gap-3 w-full">
          <h2 id="plugin-dialog-title" className="text-base font-semibold">
            {current.title}
          </h2>
          {isCustom && (
            <Button
              variant="ghost"
              size="icon"
              onClick={cancel}
              aria-label="Close"
              className="h-auto w-auto p-0"
            >
              ✕
            </Button>
          )}
        </div>
      )}
      bodyClassName="space-y-4"
      footer={
        isCustom || isPrompt ? undefined : (
          <div className="flex gap-2 justify-end w-full">
            {current.kind === 'confirm' && (
              <Button type="button" variant="outline" autoFocus={!!current.danger} onClick={cancel}>
                {cancelLabel}
              </Button>
            )}
            <Button
              type="button"
              autoFocus={current.kind === 'alert' || !current.danger}
              variant={current.danger ? 'destructive' : 'default'}
              onClick={() => resolveHead(true)}
            >
              {confirmLabel}
            </Button>
          </div>
        )
      }
    >
      {current.message && (
        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap break-words">
          {renderMessage(current.message)}
        </p>
      )}
      {isCustom ? (
        <PluginIframeSlot
          pluginId={current.pluginId}
          slot={(current.slot ?? 'plugin-dialog') as SlotName}
          extraProps={{ ...(current.extraProps ?? {}), onResult: (value: unknown) => resolveHead(value) }}
        />
      ) : isPrompt ? (
        <form onSubmit={(e) => { e.preventDefault(); submitPrompt(); }} className="space-y-3">
          {fields.map((f, i) => (
            <label key={f.name} className="flex flex-col gap-1">
              <span className="text-xs font-medium">
                {f.label}{f.required ? ' *' : ''}
              </span>
              <Input
                type={f.type === 'password' ? 'password' : 'text'}
                value={values[f.name] ?? ''}
                placeholder={f.placeholder}
                autoFocus={i === 0}
                autoComplete={f.type === 'password' ? 'off' : undefined}
                onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
              />
            </label>
          ))}
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={cancel}>
              {cancelLabel}
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {confirmLabel}
            </Button>
          </div>
        </form>
      ) : null}
      <div className="text-xs text-muted-foreground text-end">
        From plugin: {current.pluginId}
      </div>
    </AppModal>
  );
}
