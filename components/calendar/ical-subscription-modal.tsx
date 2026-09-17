"use client";
import { Loader } from "@/components/ui/loader";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AppModal } from "@/components/ui/modal";
import { AppSelect } from "@/components/ui/select";
import { X, Globe } from "lucide-react";
import type { IJMAPClient } from '@/lib/jmap/client-interface';
import { useCalendarStore, type ICalSubscription } from "@/stores/calendar-store";
import { CalendarColorPicker } from "@/components/settings/calendar-management-settings";
import { toast } from "@/stores/toast-store";

interface ICalSubscriptionModalProps {
  client: IJMAPClient;
  onClose: () => void;
  editSubscription?: ICalSubscription;
  initialUrl?: string;
  initialName?: string;
}

const REFRESH_INTERVAL_OPTIONS = [
  { value: "15", labelKey: "interval_15" as const },
  { value: "30", labelKey: "interval_30" as const },
  { value: "60", labelKey: "interval_60" as const },
  { value: "360", labelKey: "interval_360" as const },
  { value: "1440", labelKey: "interval_1440" as const },
];

export function ICalSubscriptionModal({ client, onClose, editSubscription, initialUrl, initialName }: ICalSubscriptionModalProps) {
  const t = useTranslations("calendar.subscription");
  const tCommon = useTranslations("common");
  const addICalSubscription = useCalendarStore((s) => s.addICalSubscription);
  const updateICalSubscription = useCalendarStore((s) => s.updateICalSubscription);

  const isEdit = !!editSubscription;

  const [url, setUrl] = useState(editSubscription?.url || initialUrl || "");
  const [name, setName] = useState(editSubscription?.name || initialName || "");
  const [color, setColor] = useState(editSubscription?.color || "#3b82f6");
  const [refreshInterval, setRefreshInterval] = useState(editSubscription?.refreshInterval || 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = url.trim().length > 0 && name.trim().length > 0;

  const refreshOptions = REFRESH_INTERVAL_OPTIONS.map((opt) => ({
    value: opt.value,
    label: t(opt.labelKey),
  }));

  const handleSubmit = useCallback(async () => {
    let trimmedUrl = url.trim();
    if (!trimmedUrl || !name.trim()) return;

    if (trimmedUrl.startsWith("webcal://")) {
      trimmedUrl = trimmedUrl.replace(/^webcal:\/\//, "https://");
    }

    try {
      new URL(trimmedUrl);
    } catch {
      setError(t("invalid_url"));
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      if (isEdit && editSubscription) {
        const updates: { url?: string; name?: string; color?: string; refreshInterval?: number } = {};
        if (trimmedUrl !== editSubscription.url) updates.url = trimmedUrl;
        if (name.trim() !== editSubscription.name) updates.name = name.trim();
        if (color !== editSubscription.color) updates.color = color;
        if (refreshInterval !== editSubscription.refreshInterval) updates.refreshInterval = refreshInterval;
        await updateICalSubscription(client, editSubscription.id, updates);
        toast.success(t("updated", { name: name.trim() }));
        onClose();
      } else {
        const subscription = await addICalSubscription(client, trimmedUrl, name.trim(), color, refreshInterval);
        if (subscription) {
          toast.success(t("success", { name: name.trim() }));
          onClose();
        } else {
          setError(t("error"));
        }
      }
    } catch (err) {
      const message = err instanceof Error && err.message ? err.message : '';
      setError(message || (isEdit ? t("update_error") : t("error")));
    } finally {
      setIsSubmitting(false);
    }
  }, [url, name, color, refreshInterval, client, isEdit, editSubscription, addICalSubscription, updateICalSubscription, onClose, t]);

  return (
    <AppModal
      isOpen
      onClose={onClose}
      size="md"
      className="max-w-md"
      header={(
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">{isEdit ? t("edit_title") : t("title")}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={tCommon("close")}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}
      footer={(
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader size="sm" color="current" className="me-2" />
                {isEdit ? t("saving") : t("subscribing")}
              </>
            ) : (
              isEdit ? t("save") : t("subscribe")
            )}
          </Button>
        </div>
      )}
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{t("description")}</p>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            {t("url_label")}
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t("url_placeholder")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isSubmitting}
            onKeyDown={(e) => { if (e.key === "Enter" && isValid) handleSubmit(); }}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            {t("name_label")}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("name_placeholder")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isSubmitting}
            onKeyDown={(e) => { if (e.key === "Enter" && isValid) handleSubmit(); }}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            {t("color_label")}
          </label>
          <CalendarColorPicker value={color} onChange={setColor} allowCustom />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            {t("refresh_interval")}
          </label>
          <AppSelect
            value={String(refreshInterval)}
            onChange={(v) => setRefreshInterval(Number(v))}
            options={refreshOptions}
            disabled={isSubmitting}
            aria-label={t("refresh_interval")}
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-md px-3 py-2">
            {error}
          </div>
        )}
      </div>
    </AppModal>
  );
}
