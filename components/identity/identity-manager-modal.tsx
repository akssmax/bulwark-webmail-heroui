'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Mail, Pencil, Trash2, Plus, AlertTriangle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { AppModal } from '@/components/ui/modal';
import { IdentityForm } from './identity-form';
import { useIdentityStore } from '@/stores/identity-store';
import { useAuthStore } from '@/stores/auth-store';
import { useAccountStore } from '@/stores/account-store';
import { useSettingsStore } from '@/stores/settings-store';

function useSyncIdentities() {
  const syncIdentities = useAuthStore((state) => state.syncIdentities);
  return syncIdentities;
}

function useRefreshIdentities() {
  return useAuthStore((state) => state.refreshIdentities);
}
import type { Identity, EmailAddress } from '@/lib/jmap/types';
import { toast } from '@/stores/toast-store';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';

function emailMatchesUsername(email: string, username: string): boolean {
  if (email === username) return true;
  if (!username.includes('@') && email.split('@')[0] === username) return true;
  return false;
}

interface IdentityFormData {
  name: string;
  email: string;
  replyTo?: EmailAddress[] | null;
  bcc?: EmailAddress[] | null;
  textSignature?: string | null;
  htmlSignature?: string | null;
}

interface IdentityManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IdentityManagerModal({ isOpen, onClose }: IdentityManagerModalProps) {
  const t = useTranslations('identities');
  const tNotif = useTranslations('notifications');

  const client = useAuthStore((state) => state.client);
  const identities = useIdentityStore((state) => state.identities);
  const setPreferredPrimary = useIdentityStore((state) => state.setPreferredPrimary);
  const syncIdentities = useSyncIdentities();

  const refreshIdentitiesFromServer = useRefreshIdentities();

  useEffect(() => {
    if (isOpen) {
      refreshIdentitiesFromServer();
    }
  }, [isOpen, refreshIdentitiesFromServer]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { dialogProps: confirmDialogProps, confirm: confirmDialog } = useConfirmDialog();

  const refreshIdentities = useCallback(async () => {
    if (!client) return;
    try {
      const serverIdentities = await client.getIdentities();
      const username = useAuthStore.getState().username;
      const preferredPrimaryId = useIdentityStore.getState().preferredPrimaryId;
      const sorted = [...serverIdentities].sort((a, b) => {
        const aMatch = emailMatchesUsername(a.email, username || '');
        const bMatch = emailMatchesUsername(b.email, username || '');
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        if (aMatch && bMatch) {
          if (!a.mayDelete && b.mayDelete) return -1;
          if (a.mayDelete && !b.mayDelete) return 1;
        }
        return 0;
      });
      if (preferredPrimaryId) {
        const idx = sorted.findIndex((id) => id.id === preferredPrimaryId);
        if (idx > 0) {
          const [preferred] = sorted.splice(idx, 1);
          sorted.unshift(preferred);
        }
      }
      useIdentityStore.getState().setIdentities(sorted);
      syncIdentities();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to refresh identities';
      toast.error(message);
    }
  }, [client, syncIdentities]);

  const handleClose = () => {
    if (confirmDialogProps.isOpen) return;
    if (isCreating || editingId) {
      setIsCreating(false);
      setEditingId(null);
    } else {
      onClose();
    }
  };

  const handleCreate = useCallback(async (data: IdentityFormData) => {
    if (!client) return;

    try {
      await client.createIdentity(
        data.name,
        data.email,
        data.replyTo,
        data.bcc,
        data.textSignature,
        data.htmlSignature
      );

      await refreshIdentities();
      setIsCreating(false);
      toast.success(tNotif('identity_created'));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('validation_errors.unknown_error');
      toast.error(tNotif('identity_create_failed', { error: message }));
      throw error;
    }
  }, [client, refreshIdentities, t, tNotif]);

  const handleUpdate = useCallback(async (identity: Identity, data: IdentityFormData) => {
    if (!client) return;

    try {
      await client.updateIdentity(identity.id, {
        name: data.name,
        replyTo: data.replyTo,
        bcc: data.bcc,
        textSignature: data.textSignature,
        htmlSignature: data.htmlSignature,
      });

      await refreshIdentities();
      setEditingId(null);
      toast.success(tNotif('identity_updated'));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('validation_errors.unknown_error');
      toast.error(tNotif('identity_update_failed', { error: message }));
      throw error;
    }
  }, [client, refreshIdentities, t, tNotif]);

  const handleDelete = useCallback(async (identity: Identity) => {
    if (!client) return;
    if (!identity.mayDelete) {
      toast.error(t('cannot_delete'));
      return;
    }

    const confirmed = await confirmDialog({
      title: t('delete_confirm_title'),
      message: t('delete_confirm'),
      confirmText: t('delete_button'),
      variant: "destructive",
    });
    if (!confirmed) return;

    setDeletingId(identity.id);

    try {
      await client.deleteIdentity(identity.id);
      await refreshIdentities();
      toast.success(tNotif('identity_deleted'));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('validation_errors.unknown_error');
      toast.error(tNotif('identity_delete_failed', { error: message }));
    } finally {
      setDeletingId(null);
    }
  }, [client, refreshIdentities, t, tNotif, confirmDialog]);

  const handleSetPrimary = useCallback((identity: Identity) => {
    setPreferredPrimary(identity.id);
    const activeAccountId = useAccountStore.getState().activeAccountId;
    if (activeAccountId) {
      const current = useSettingsStore.getState().preferredIdentityIds;
      useSettingsStore.getState().updateSetting('preferredIdentityIds', {
        ...current,
        [activeAccountId]: identity.id,
      });
    }
    const reordered = [identity, ...identities.filter((id) => id.id !== identity.id)];
    useIdentityStore.getState().setIdentities(reordered);
    syncIdentities();
    toast.success(tNotif('identity_set_primary'));
  }, [identities, setPreferredPrimary, syncIdentities, tNotif]);

  return (
    <>
      <AppModal
        isOpen={isOpen}
        onClose={handleClose}
        size="lg"
        className="max-w-3xl max-h-[90vh]"
        bodyClassName="p-6 overflow-y-auto max-h-[calc(90vh-80px)]"
        header={(
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <h2 id="identity-modal-title" className="text-lg font-semibold text-foreground">
              {t('modal_title')}
            </h2>
          </div>
        )}
      >
        {isCreating && (
          <div className="mb-6 p-4 border border-border rounded-lg bg-muted/30">
            <h3 className="text-sm font-semibold mb-4">{t('create_new')}</h3>
            <IdentityForm
              onSave={handleCreate}
              onCancel={() => setIsCreating(false)}
            />
          </div>
        )}

        {!isCreating && !editingId && (
          <Button
            onClick={() => setIsCreating(true)}
            className="mb-6 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 me-2" />
            {t('create_new')}
          </Button>
        )}

        <div className="space-y-4">
          {identities.map((identity) => (
            <div
              key={identity.id}
              className="border border-border rounded-lg overflow-hidden"
            >
              {editingId === identity.id ? (
                <div className="p-4 bg-muted/30">
                  <h3 className="text-sm font-semibold mb-4">
                    {t('edit_identity')}
                  </h3>
                  <IdentityForm
                    identity={identity}
                    onSave={(data) => handleUpdate(identity, data)}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {identity.name}
                        </h3>
                        {identities[0]?.id === identity.id && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {t('primary_identity')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {identity.email}
                      </p>

                      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        {identity.replyTo && identity.replyTo.length > 0 && (
                          <p>
                            {t('display.reply_to')} {identity.replyTo.map((a) => a.email).join(', ')}
                          </p>
                        )}
                        {identity.bcc && identity.bcc.length > 0 && (
                          <p>
                            {t('display.bcc')} {identity.bcc.map((a) => a.email).join(', ')}
                          </p>
                        )}
                        {identity.textSignature && (
                          <p className="line-clamp-2">
                            {t('display.signature')} {identity.textSignature}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {identities[0]?.id !== identity.id && identities.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetPrimary(identity)}
                          disabled={!!editingId || isCreating}
                          title={t('set_as_primary')}
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(identity.id)}
                        disabled={!!editingId || isCreating}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(identity)}
                        disabled={
                          !identity.mayDelete ||
                          !!editingId ||
                          isCreating ||
                          deletingId === identity.id
                        }
                        className={!identity.mayDelete ? 'opacity-30' : ''}
                      >
                        {!identity.mayDelete ? (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {!identity.mayDelete && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {t('cannot_delete')}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}

          {identities.length === 0 && !isCreating && (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">{t('no_identities')}</p>
            </div>
          )}
        </div>
      </AppModal>

      <ConfirmDialog {...confirmDialogProps} />
    </>
  );
}
