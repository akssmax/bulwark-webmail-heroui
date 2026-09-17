"use client";
import { Loader } from "@/components/ui/loader";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AppModal } from "@/components/ui/modal";
import { X, Calendar as CalendarIcon } from "lucide-react";
import type { IJMAPClient } from "@/lib/jmap/client-interface";
import { useCalendarStore } from "@/stores/calendar-store";
import { CalendarColorPicker } from "@/components/settings/calendar-management-settings";
import { CALENDAR_KIND_COMPONENTS, CalendarKindPicker, type CalendarKind } from "@/components/calendar/calendar-kind-picker";
import { toast } from "@/stores/toast-store";

interface CreateCalendarModalProps {
  client: IJMAPClient;
  onClose: () => void;
}

export function CreateCalendarModal({ client, onClose }: CreateCalendarModalProps) {
  const t = useTranslations("calendar.management");
  const tCommon = useTranslations("common");
  const createCalendar = useCalendarStore((s) => s.createCalendar);

  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [kind, setKind] = useState<CalendarKind>("events");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = name.trim().length > 0;

  const handleSubmit = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setIsSubmitting(true);
    try {
      const created = await createCalendar(client, { name: trimmed, color }, { components: CALENDAR_KIND_COMPONENTS[kind] });
      if (created) {
        toast.success(t("calendar_created"));
        onClose();
      } else {
        toast.error(t("error_create"));
      }
    } catch {
      toast.error(t("error_create"));
    } finally {
      setIsSubmitting(false);
    }
  }, [name, color, kind, client, createCalendar, onClose, t]);

  return (
    <AppModal
      isOpen
      onClose={() => { if (!isSubmitting) onClose(); }}
      size="md"
      className="max-w-md"
      header={(
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">{t("add_calendar")}</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label={tCommon("close")}
          >
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
                {tCommon("loading")}
              </>
            ) : (
              t("create")
            )}
          </Button>
        </div>
      )}
    >
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            {t("name")}
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
            {t("color")}
          </label>
          <CalendarColorPicker value={color} onChange={setColor} allowCustom />
        </div>

        <CalendarKindPicker value={kind} onChange={setKind} disabled={isSubmitting} />
      </div>
    </AppModal>
  );
}
