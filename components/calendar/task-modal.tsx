"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AppSelect } from "@/components/ui/select";
import { DatePickerField, TimePickerField } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Trash2, CalendarDays, Bell, Flag } from "lucide-react";
import { format, parseISO } from "date-fns";

import type { CalendarTask, Calendar, CalendarEventAlert } from "@/lib/jmap/types";

interface TaskModalProps {
  task?: CalendarTask | null;
  calendars: Calendar[];
  onSave: (data: Partial<CalendarTask>) => void | Promise<void>;
  onDelete?: (id: string) => void;
  onClose: () => void;
  isMobile?: boolean;
}

type PriorityLevel = "none" | "high" | "medium" | "low";
type AlertOption = "none" | "at_time" | "5" | "15" | "30" | "60" | "1440";

function priorityToLevel(p: number): PriorityLevel {
  if (p >= 1 && p <= 4) return "high";
  if (p === 5) return "medium";
  if (p >= 6 && p <= 9) return "low";
  return "none";
}

function levelToPriority(l: PriorityLevel): number {
  switch (l) {
    case "high": return 1;
    case "medium": return 5;
    case "low": return 9;
    default: return 0;
  }
}

export function TaskModal({
  task,
  calendars,
  onSave,
  onDelete,
  onClose,
  isMobile: _isMobile,
}: TaskModalProps) {
  const t = useTranslations("calendar");
  const isEdit = !!task;
  const titleRef = useRef<HTMLInputElement>(null);

  const writableCalendars = calendars.filter(c => !c.isShared || c.myRights?.mayWriteAll || c.myRights?.mayWriteOwn);
  const defaultCalendarId = writableCalendars[0]?.id ?? calendars[0]?.id ?? "";

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [dueDate, setDueDate] = useState(task?.due ? format(parseISO(task.due), "yyyy-MM-dd") : "");
  const [dueTime, setDueTime] = useState(task?.due && !task.showWithoutTime ? format(parseISO(task.due), "HH:mm") : "");
  const [showTime, setShowTime] = useState(task?.due ? !task.showWithoutTime : false);
  const [priority, setPriority] = useState<PriorityLevel>(priorityToLevel(task?.priority ?? 0));
  const [progress, setProgress] = useState<CalendarTask["progress"]>(task?.progress ?? "needs-action");
  const [calendarId, setCalendarId] = useState(() => {
    if (task) {
      const ids = Object.keys(task.calendarIds);
      return ids[0] ?? defaultCalendarId;
    }
    return defaultCalendarId;
  });
  const [alertOption, setAlertOption] = useState<AlertOption>(() => {
    if (!task?.alerts) return "none";
    const first = Object.values(task.alerts)[0];
    if (!first || first.trigger["@type"] !== "OffsetTrigger") return "none";
    const offset = first.trigger.offset;
    if (offset === "PT0S") return "at_time";
    const m = offset.match(/-?PT?(\d+)M$/);
    if (m) return m[1] as AlertOption;
    const h = offset.match(/-?PT?(\d+)H$/);
    if (h) return String(parseInt(h[1]) * 60) as AlertOption;
    const d = offset.match(/-?P(\d+)D/);
    if (d) return String(parseInt(d[1]) * 1440) as AlertOption;
    return "none";
  });
  // The control only shows the first alert (and only simple offset triggers),
  // so writing `alerts` back on every save silently dropped the others. Track
  // whether the user actually changed it and only patch alerts then. (#504)
  const [alertTouched, setAlertTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const handleSave = useCallback(async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      let due: string | null = null;
      let showWithoutTime = true;
      if (dueDate) {
        if (showTime && dueTime) {
          due = `${dueDate}T${dueTime}:00`;
          showWithoutTime = false;
        } else {
          due = dueDate;
          showWithoutTime = true;
        }
      }

      const data: Partial<CalendarTask> = {
        "@type": "Task",
        title: title.trim(),
        description: description.trim() || "",
        due,
        showWithoutTime,
        priority: levelToPriority(priority),
        progress,
        calendarIds: { [calendarId]: true },
      };

      if (alertTouched) {
        // Merge into the existing map: the control edits the first alert
        // (the one it displayed) and leaves any others untouched. (#504)
        const merged: Record<string, CalendarEventAlert> = { ...(task?.alerts ?? {}) };
        const editedKey = Object.keys(merged)[0] ?? "default-alert";
        if (alertOption === "none") {
          delete merged[editedKey];
        } else {
          const offset = alertOption === "at_time" ? "PT0S" : `-PT${alertOption}M`;
          merged[editedKey] = {
            "@type": "Alert",
            trigger: { "@type": "OffsetTrigger", offset, relativeTo: "start" },
            action: "display",
            acknowledged: null,
            relatedTo: null,
          };
        }
        data.alerts = Object.keys(merged).length > 0 ? merged : null;
      }

      if (isEdit && task) {
        data.id = task.id;
      }

      await onSave(data);
      onClose();
    } finally {
      setSaving(false);
    }
  }, [title, description, dueDate, dueTime, showTime, priority, progress, calendarId, alertOption, alertTouched, isEdit, task, onSave, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  }, [onClose, handleSave]);

  return (
    <div className="flex flex-col h-full bg-background" onKeyDown={handleKeyDown}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold">
          {isEdit ? t("tasks.edit") : t("tasks.create")}
        </h2>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title */}
        <Input
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("tasks.title_placeholder")}
          className="text-base font-medium"
        />

        {/* Description */}
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("tasks.description_placeholder")}
          rows={3}
          className="min-h-0 resize-none"
        />

        {/* Due Date */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {t("tasks.due_date")}
          </label>
          <div className="flex items-center gap-2">
            <DatePickerField
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              aria-label={t("tasks.due_date")}
            />
            {dueDate && (
              <Checkbox
                isSelected={showTime}
                onChange={setShowTime}
                className="text-xs text-muted-foreground"
              >
                {t("tasks.include_time")}
              </Checkbox>
            )}
            {showTime && (
              <TimePickerField
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                aria-label={t("tasks.due_date")}
              />
            )}
          </div>
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Flag className="h-3.5 w-3.5" />
            {t("tasks.priority")}
          </label>
          <AppSelect
            value={priority}
            onChange={(v) => setPriority(v as PriorityLevel)}
            options={[
              { value: "none", label: t("tasks.priority_none") },
              { value: "high", label: t("tasks.priority_high") },
              { value: "medium", label: t("tasks.priority_medium") },
              { value: "low", label: t("tasks.priority_low") },
            ]}
            aria-label={t("tasks.priority")}
          />
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            {t("tasks.progress")}
          </label>
          <AppSelect
            value={progress}
            onChange={(v) => setProgress(v as CalendarTask["progress"])}
            options={[
              { value: "needs-action", label: t("tasks.progress_needs_action") },
              { value: "in-process", label: t("tasks.progress_in_process") },
              { value: "completed", label: t("tasks.progress_completed") },
              { value: "cancelled", label: t("tasks.progress_cancelled") },
            ]}
            aria-label={t("tasks.progress")}
          />
        </div>

        {/* Calendar */}
        {writableCalendars.length > 1 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              {t("tasks.calendar")}
            </label>
            <AppSelect
              value={calendarId}
              onChange={setCalendarId}
              options={writableCalendars.map((cal) => ({ value: cal.id, label: cal.name }))}
              aria-label={t("tasks.calendar")}
            />
          </div>
        )}

        {/* Alert */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5" />
            {t("tasks.alert")}
          </label>
          <AppSelect
            value={alertOption}
            onChange={(v) => {
              setAlertOption(v as AlertOption);
              setAlertTouched(true);
            }}
            options={[
              { value: "none", label: t("tasks.alert_none") },
              { value: "at_time", label: t("tasks.alert_at_time") },
              { value: "5", label: t("tasks.alert_5min") },
              { value: "15", label: t("tasks.alert_15min") },
              { value: "30", label: t("tasks.alert_30min") },
              { value: "60", label: t("tasks.alert_1hr") },
              { value: "1440", label: t("tasks.alert_1day") },
            ]}
            aria-label={t("tasks.alert")}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <div>
          {isEdit && onDelete && task && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="h-4 w-4 me-1" />
              {t("tasks.delete")}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t("tasks.cancel")}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!title.trim() || saving}>
            {t("tasks.save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
