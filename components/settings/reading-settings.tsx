"use client";
import { Loader } from "@/components/ui/loader";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSettingsStore } from '@/stores/settings-store';
import type { ArchiveMode, HoverAction } from '@/stores/settings-store';
import { ALL_HOVER_ACTIONS } from '@/stores/settings-store';
import { useAuthStore } from '@/stores/auth-store';
import { useEmailStore } from '@/stores/email-store';
import { cn } from '@/lib/utils';
import { SettingsSection, SettingItem, Select, ToggleSwitch } from './settings-section';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { AlertTriangle, FolderSync } from "lucide-react";
import { usePolicyStore } from '@/stores/policy-store';
import { Button } from '@/components/ui/button';

export function ReadingSettings() {
  const t = useTranslations('settings.email_behavior');
  const [isReorganizing, setIsReorganizing] = useState(false);
  const [reorganizeResult, setReorganizeResult] = useState<string | null>(null);
  const { isSettingLocked, isSettingHidden, isFeatureEnabled } = usePolicyStore();

  const {
    markAsReadDelay,
    deleteAction,
    permanentlyDeleteJunk,
    returnToListAfterAction,
    swipeRightAction,
    swipeLeftAction,
    clearSearchOnFolderChange,
    showPreview,
    mailLayout,
    disableThreading,
    emailsPerPage,
    mailAttachmentAction,
    attachmentPosition,
    archiveMode,
    hoverActions,
    hoverActionsMode,
    hoverActionsCorner,
    hideInlineImageAttachments,
    attachmentImagePreviewsEnabled,
    messageSpacing,
    plainTextFont,
    updateSetting,
  } = useSettingsStore();

  const isFocusedLayout = mailLayout === 'focus';

  const handleReorganizeArchive = async () => {
    const { client } = useAuthStore.getState();
    const { mailboxes, fetchMailboxes } = useEmailStore.getState();
    if (!client) return;

    const archiveMailbox = mailboxes.find(m => m.role === 'archive' || m.name.toLowerCase() === 'archive');
    if (!archiveMailbox) return;

    setIsReorganizing(true);
    setReorganizeResult(null);

    try {
      const archiveId = archiveMailbox.originalId || archiveMailbox.id;
      const emails = await client.getEmailsInMailbox(archiveId);
      let movedCount = 0;

      for (const email of emails) {
        const emailDate = new Date(email.receivedAt);
        const year = emailDate.getFullYear().toString();
        const month = (emailDate.getMonth() + 1).toString().padStart(2, '0');

        let currentMailboxes = useEmailStore.getState().mailboxes;

        let yearMailbox = currentMailboxes.find(
          m => m.name === year && m.parentId === archiveId
        );
        if (!yearMailbox) {
          yearMailbox = await client.createMailbox(year, archiveId);
          await fetchMailboxes(client);
          currentMailboxes = useEmailStore.getState().mailboxes;
        }

        if (archiveMode === 'year') {
          await client.moveEmail(email.id, yearMailbox.id);
          movedCount++;
        } else {
          const yearId = yearMailbox.originalId || yearMailbox.id;
          let monthMailbox = currentMailboxes.find(
            m => m.name === month && m.parentId === yearId
          );
          if (!monthMailbox) {
            monthMailbox = await client.createMailbox(month, yearId);
            await fetchMailboxes(client);
          }
          await client.moveEmail(email.id, monthMailbox.id);
          movedCount++;
        }
      }

      setReorganizeResult(t('archive_mode.reorganize_success', { count: movedCount }));
    } catch (error) {
      console.error('Failed to reorganize archive:', error);
      setReorganizeResult(t('archive_mode.reorganize_error'));
    } finally {
      setIsReorganizing(false);
    }
  };

  return (
    <SettingsSection title={t('title')} description={t('description')}>
      {!isSettingHidden('markAsReadDelay') && (
      <SettingItem label={t('mark_read.label')} description={t('mark_read.description')} locked={isSettingLocked('markAsReadDelay')}>
        <Select
          value={markAsReadDelay.toString()}
          onChange={(value) => updateSetting('markAsReadDelay', parseInt(value))}
          options={[
            { value: '0', label: t('mark_read.instant') },
            { value: '3000', label: t('mark_read.delay_3s') },
            { value: '5000', label: t('mark_read.delay_5s') },
            { value: '-1', label: t('mark_read.never') },
          ]}
        />
      </SettingItem>
      )}

      {!isSettingHidden('messageSpacing') && (
      <SettingItem label={t('message_spacing.label')} description={t('message_spacing.description')} locked={isSettingLocked('messageSpacing')}>
        <Select
          value={messageSpacing}
          onChange={(value) => updateSetting('messageSpacing', value as typeof messageSpacing)}
          options={[
            { value: 'auto', label: t('message_spacing.auto') },
            { value: 'always', label: t('message_spacing.always') },
            { value: 'edge', label: t('message_spacing.edge') },
          ]}
        />
      </SettingItem>
      )}

      {!isSettingHidden('plainTextFont') && (
      <SettingItem label={t('plain_text_font.label')} description={t('plain_text_font.description')} locked={isSettingLocked('plainTextFont')}>
        <Select
          value={plainTextFont}
          onChange={(value) => updateSetting('plainTextFont', value as typeof plainTextFont)}
          options={[
            { value: 'mono', label: t('plain_text_font.mono') },
            { value: 'sans', label: t('plain_text_font.sans') },
          ]}
        />
      </SettingItem>
      )}

      {!isSettingHidden('deleteAction') && (
      <SettingItem label={t('delete_action.label')} description={t('delete_action.description')} locked={isSettingLocked('deleteAction')}>
        <div className="flex flex-col gap-2">
          <Select
            value={deleteAction}
            onChange={(value) => updateSetting('deleteAction', value as 'trash' | 'trash-and-read' | 'permanent')}
            options={[
              { value: 'trash', label: t('delete_action.trash') },
              { value: 'trash-and-read', label: t('delete_action.trash_and_read') },
              { value: 'permanent', label: t('delete_action.permanent') },
            ]}
          />
          {deleteAction === 'permanent' && (
            <div className="flex items-start gap-2 p-2 rounded-md bg-destructive/10 text-destructive text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{t('delete_action.warning')}</span>
            </div>
          )}
        </div>
      </SettingItem>
      )}

      <SettingItem label={t('archive_mode.label')} description={t('archive_mode.description')}>
        <div className="flex flex-col gap-2">
          <Select
            value={archiveMode}
            onChange={(value) => updateSetting('archiveMode', value as ArchiveMode)}
            options={[
              { value: 'single', label: t('archive_mode.single') },
              { value: 'year', label: t('archive_mode.year') },
              { value: 'month', label: t('archive_mode.month') },
            ]}
          />
          {archiveMode !== 'single' && (
            <div className="flex flex-col gap-2">
              <Button
                variant="secondary"
                onClick={handleReorganizeArchive}
                disabled={isReorganizing}
                className="flex items-center gap-2 text-sm"
              >
                {isReorganizing ? (
                  <Loader size="sm" color="current" />
                ) : (
                  <FolderSync className="w-4 h-4" />
                )}
                <span>{t('archive_mode.reorganize')}</span>
              </Button>
              {reorganizeResult && (
                <p className="text-xs text-muted-foreground">{reorganizeResult}</p>
              )}
            </div>
          )}
        </div>
      </SettingItem>

      <SettingItem label={t('permanently_delete_junk.label')} description={t('permanently_delete_junk.description')}>
        <ToggleSwitch
          checked={permanentlyDeleteJunk}
          onChange={(checked) => updateSetting('permanentlyDeleteJunk', checked)}
        />
      </SettingItem>

      <SettingItem label={t('return_to_list_after_action.label')} description={t('return_to_list_after_action.description')}>
        <ToggleSwitch
          checked={returnToListAfterAction}
          onChange={(checked) => updateSetting('returnToListAfterAction', checked)}
        />
      </SettingItem>

      <SettingItem label={t('swipe_right_action.label')} description={t('swipe_right_action.description')}>
        <Select
          value={swipeRightAction}
          onChange={(value) => updateSetting('swipeRightAction', value as typeof swipeRightAction)}
          options={[
            { value: 'none', label: t('swipe_actions.none') },
            { value: 'archive', label: t('swipe_actions.archive') },
            { value: 'delete', label: t('swipe_actions.delete') },
            { value: 'markRead', label: t('swipe_actions.mark_read') },
            { value: 'star', label: t('swipe_actions.star') },
            { value: 'spam', label: t('swipe_actions.spam') },
          ]}
        />
      </SettingItem>

      <SettingItem label={t('swipe_left_action.label')} description={t('swipe_left_action.description')}>
        <Select
          value={swipeLeftAction}
          onChange={(value) => updateSetting('swipeLeftAction', value as typeof swipeLeftAction)}
          options={[
            { value: 'none', label: t('swipe_actions.none') },
            { value: 'archive', label: t('swipe_actions.archive') },
            { value: 'delete', label: t('swipe_actions.delete') },
            { value: 'markRead', label: t('swipe_actions.mark_read') },
            { value: 'star', label: t('swipe_actions.star') },
            { value: 'spam', label: t('swipe_actions.spam') },
          ]}
        />
      </SettingItem>

      <SettingItem label={t('clear_search_on_folder_change.label')} description={t('clear_search_on_folder_change.description')}>
        <ToggleSwitch
          checked={clearSearchOnFolderChange}
          onChange={(checked) => updateSetting('clearSearchOnFolderChange', checked)}
        />
      </SettingItem>

      {!isSettingHidden('showPreview') && (
      <SettingItem
        label={t('show_preview.label')}
        description={isFocusedLayout ? t('show_preview.focus_description') : t('show_preview.description')}
        locked={isSettingLocked('showPreview')}
      >
        <ToggleSwitch checked={showPreview} onChange={(checked) => updateSetting('showPreview', checked)} />
      </SettingItem>
      )}

      <SettingItem label={t('disable_threading.label')} description={t('disable_threading.description')}>
        <ToggleSwitch
          checked={disableThreading}
          onChange={(checked) => updateSetting('disableThreading', checked)}
        />
      </SettingItem>

      <SettingItem label={t('hide_inline_image_attachments.label')} description={t('hide_inline_image_attachments.description')}>
        <ToggleSwitch
          checked={hideInlineImageAttachments}
          onChange={(checked) => updateSetting('hideInlineImageAttachments', checked)}
        />
      </SettingItem>

      <SettingItem label={t('attachment_image_previews.label')} description={t('attachment_image_previews.description')}>
        <ToggleSwitch
          checked={attachmentImagePreviewsEnabled}
          onChange={(checked) => updateSetting('attachmentImagePreviewsEnabled', checked)}
        />
      </SettingItem>

      {isFeatureEnabled('hoverActionsConfigEnabled') && (
      <div className="py-3 border-b border-border space-y-3">
        <div>
          <label className="text-sm font-medium text-foreground">{t('hover_actions.label')}</label>
          <p className="text-xs text-muted-foreground mt-1">{t('hover_actions.description')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {ALL_HOVER_ACTIONS.map((action) => {
            const isEnabled = hoverActions.includes(action.id);
            return (
              <Button
                key={action.id}
                type="button"
                variant={isEnabled ? 'default' : 'secondary'}
                onClick={() => {
                  const newActions = isEnabled
                    ? hoverActions.filter((a: HoverAction) => a !== action.id)
                    : [...hoverActions, action.id];
                  updateSetting('hoverActions', newActions);
                }}
                className={cn(
                  'px-3 py-1.5 text-xs h-auto min-h-0',
                  isEnabled && 'font-medium'
                )}
              >
                {t(`hover_actions.${action.labelKey}`)}
              </Button>
            );
          })}
        </div>

        <div className="pt-2 space-y-2">
          <label className="text-xs font-medium text-foreground">{t('hover_actions.mode_label')}</label>
          <SegmentedTabs
            aria-label={t('hover_actions.mode_label')}
            value={hoverActionsMode}
            onChange={(mode) => updateSetting('hoverActionsMode', mode as 'inline' | 'floating')}
            className="w-full sm:w-fit"
            options={[
              { value: 'inline', label: t('hover_actions.mode_inline') },
              { value: 'floating', label: t('hover_actions.mode_floating') },
            ]}
          />
        </div>

        {hoverActionsMode === 'floating' && (
          <div className="pt-1 space-y-2">
            <label className="text-xs font-medium text-foreground">{t('hover_actions.corner_label')}</label>
            <div className="grid grid-cols-2 gap-2 w-48">
              {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((corner) => (
                <Button
                  key={corner}
                  type="button"
                  variant={hoverActionsCorner === corner ? 'default' : 'secondary'}
                  onClick={() => updateSetting('hoverActionsCorner', corner)}
                  className={cn(
                    'px-2 py-1.5 text-xs h-auto min-h-0 text-center',
                    hoverActionsCorner === corner && 'font-medium'
                  )}
                >
                  {t(`hover_actions.corner_${corner}`)}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
      )}

      <SettingItem label={t('attachment_click_action.label')} description={t('attachment_click_action.description')}>
        <Select
          value={mailAttachmentAction}
          onChange={(value) => updateSetting('mailAttachmentAction', value as 'preview' | 'download')}
          options={[
            { value: 'preview', label: t('attachment_click_action.preview') },
            { value: 'download', label: t('attachment_click_action.download') },
          ]}
        />
      </SettingItem>

      <SettingItem label={t('attachment_position.label')} description={t('attachment_position.description')}>
        <Select
          value={attachmentPosition}
          onChange={(value) => updateSetting('attachmentPosition', value as 'beside-sender' | 'below-header')}
          options={[
            { value: 'beside-sender', label: t('attachment_position.beside-sender') },
            { value: 'below-header', label: t('attachment_position.below-header') },
          ]}
        />
      </SettingItem>

      {!isSettingHidden('emailsPerPage') && (
      <SettingItem label={t('emails_per_page.label')} description={t('emails_per_page.description')} locked={isSettingLocked('emailsPerPage')}>
        <Select
          value={emailsPerPage.toString()}
          onChange={(value) => updateSetting('emailsPerPage', parseInt(value))}
          options={[
            { value: '10', label: t('emails_per_page.10') },
            { value: '25', label: t('emails_per_page.25') },
            { value: '50', label: t('emails_per_page.50') },
            { value: '100', label: t('emails_per_page.100') },
          ]}
        />
      </SettingItem>
      )}
    </SettingsSection>
  );
}
