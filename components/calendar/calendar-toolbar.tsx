"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { ChevronLeft, ChevronRight, Plus, Upload, CalendarDays, Globe, ChevronDown, ArrowLeft, Menu } from "lucide-react";
import { startOfWeek } from "date-fns";
import { cn } from "@/lib/utils";
import type { CalendarViewMode } from "@/stores/calendar-store";
import type { Calendar } from "@/lib/jmap/types";
import { useCalendarLocale } from "@/hooks/use-calendar-locale";

interface CalendarToolbarProps {
  selectedDate: Date;
  /** Day at the top / start of the scrolled view, when it differs from the selection. */
  visibleDate?: Date | null;
  viewMode: CalendarViewMode;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onCreateEvent: () => void;
  onImport?: () => void;
  onSubscribe?: () => void;
  isMobile?: boolean;
  firstDayOfWeek?: number;
  onNavigateBack?: () => void;
  calendars?: Calendar[];
  selectedCalendarIds?: string[];
  onToggleVisibility?: (id: string) => void;
  enableCalendarTasks?: boolean;
  /** Show a burger button at the start that opens the (overlay) sidebar. */
  onMenuClick?: () => void;
}

export function CalendarToolbar({
  selectedDate,
  visibleDate,
  viewMode,
  onPrev,
  onNext,
  onToday,
  onViewModeChange,
  onCreateEvent,
  onImport,
  onSubscribe,
  isMobile,
  firstDayOfWeek = 1,
  onNavigateBack,
  calendars,
  selectedCalendarIds,
  onToggleVisibility,
  enableCalendarTasks,
  onMenuClick,
}: CalendarToolbarProps) {
  const t = useTranslations("calendar");
  const {
    weekStartsOn,
    formatMonthYear,
    formatMonthYearShort,
    formatWeekRange,
    formatWeekRangeShort,
    formatFullDate,
  } = useCalendarLocale();
  const views: CalendarViewMode[] = enableCalendarTasks
    ? ["month", "week", "day", "agenda", "tasks"]
    : ["month", "week", "day", "agenda"];
  // The views scroll freely (#759): while the user has scrolled away from
  // the selected day, the title describes what is on screen instead.
  const titleDate = visibleDate ?? selectedDate;
  const getDateLabel = (): string => {
    switch (viewMode) {
      case "month":
        return isMobile
          ? formatMonthYearShort(titleDate)
          : formatMonthYear(titleDate);
      case "week": {
        // A reported visible date is the first column in view; the selected
        // day is shown from the start of its week.
        const ws = visibleDate ?? startOfWeek(selectedDate, { weekStartsOn });
        return isMobile
          ? formatWeekRangeShort(ws)
          : formatWeekRange(ws);
      }
      case "day":
        return isMobile
          ? formatFullDate(titleDate)
          : formatFullDate(titleDate);
      case "agenda":
        return isMobile
          ? formatMonthYearShort(titleDate)
          : formatMonthYear(titleDate);
      case "tasks":
        return t("views.tasks");
    }
  };

  const renderCalendarMenuItems = () => {
    if (!calendars || !selectedCalendarIds || !onToggleVisibility) return null;
    const ownCalendars = calendars.filter(c => !c.isShared);
    const shared = calendars.filter(c => c.isShared);
    const groups = new Map<string, { accountName: string; cals: typeof shared }>();
    for (const c of shared) {
      const key = c.accountId || c.accountName || c.id;
      if (!groups.has(key)) groups.set(key, { accountName: c.accountName || key, cals: [] });
      groups.get(key)!.cals.push(c);
    }

    return (
      <>
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {t("my_calendars")}
        </div>
        {ownCalendars.map((cal) => {
          const isVisible = selectedCalendarIds.includes(cal.id);
          const color = cal.color || "#3b82f6";
          return (
            <Dropdown.Item
              key={cal.id}
              id={cal.id}
              onAction={() => onToggleVisibility(cal.id)}
              className="flex items-center gap-2"
            >
              <span
                className={cn(
                  "w-3.5 h-3.5 rounded-sm border-2 flex-shrink-0 transition-colors",
                  isVisible ? "border-transparent" : "border-muted-foreground/40 bg-transparent"
                )}
                style={isVisible ? { backgroundColor: color, borderColor: color } : undefined}
              />
              <span className={cn("truncate", !isVisible && "text-muted-foreground")}>
                {cal.name}
              </span>
            </Dropdown.Item>
          );
        })}
        {Array.from(groups.values()).map((group) => (
          <div key={group.accountName} className="mt-1">
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {group.accountName}
            </div>
            {group.cals.map((cal) => {
              const isVisible = selectedCalendarIds.includes(cal.id);
              const color = cal.color || "#3b82f6";
              return (
                <Dropdown.Item
                  key={cal.id}
                  id={cal.id}
                  onAction={() => onToggleVisibility(cal.id)}
                  className="flex items-center gap-2"
                >
                  <span
                    className={cn(
                      "w-3.5 h-3.5 rounded-sm border-2 flex-shrink-0 transition-colors",
                      isVisible ? "border-transparent" : "border-muted-foreground/40 bg-transparent"
                    )}
                    style={isVisible ? { backgroundColor: color, borderColor: color } : undefined}
                  />
                  <span className={cn("truncate", !isVisible && "text-muted-foreground")}>
                    {cal.name}
                  </span>
                </Dropdown.Item>
              );
            })}
          </div>
        ))}
      </>
    );
  };

  return (
    <div className={cn("border-b border-border", !isMobile && "flex items-center gap-2 px-4 py-3")}>
      {/* Burger menu (rendered in pages that use a narrow overlay sidebar) */}
      {onMenuClick && !isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-8 w-8 -ms-1 me-1"
          aria-label={t("nav_open_menu")}
        >
          <Menu className="w-4 h-4" />
        </Button>
      )}
      {/* ── MOBILE TOOLBAR ── */}
      {isMobile && (
        <div className="flex flex-col gap-1 px-2 py-2">
          {/* Row 1: Back / Date nav / Today */}
          <div className="flex items-center gap-1">
            {onMenuClick && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuClick}
                className="h-8 w-8 -ms-1 touch-manipulation"
                aria-label={t("nav_open_menu")}
              >
                <Menu className="w-4 h-4" />
              </Button>
            )}
            {onNavigateBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onNavigateBack}
                className="h-8 w-8 -ms-1 touch-manipulation"
                aria-label={t("back_to_month")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onPrev} className="h-8 w-8 touch-manipulation" aria-label={t("nav_prev")}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-semibold text-center flex-1 select-none truncate">
              {getDateLabel()}
            </span>
            <Button variant="ghost" size="icon" onClick={onNext} className="h-8 w-8 touch-manipulation" aria-label={t("nav_next")}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onToday} className="touch-manipulation text-xs h-7 px-2 ms-0.5">
              {t("views.today")}
            </Button>
          </div>

          {/* Row 2: View switcher pills + calendar toggle */}
          <div className="flex items-center gap-1.5">
            <div className="flex flex-1 border border-border rounded-md overflow-hidden">
              {views.map((v) => (
                <Button
                  key={v}
                  variant={v === viewMode ? "default" : "ghost"}
                  onClick={() => onViewModeChange(v)}
                  className={cn(
                    "flex-1 py-1.5 h-auto min-h-0 rounded-none text-xs font-medium touch-manipulation",
                    v !== viewMode && "text-muted-foreground",
                  )}
                >
                  {t(`views.${v}`)}
                </Button>
              ))}
            </div>

            {calendars && selectedCalendarIds && onToggleVisibility && (
              <Dropdown>
                <Dropdown.Trigger
                  aria-label={t("my_calendars")}
                  className="p-1.5 rounded-md border border-border transition-colors touch-manipulation hover:bg-muted"
                >
                  <CalendarDays className="w-4 h-4" />
                </Dropdown.Trigger>
                <Dropdown.Popover className="min-w-[180px] p-2">
                  <Dropdown.Menu aria-label={t("my_calendars")}>
                    {renderCalendarMenuItems()}
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            )}
          </div>
        </div>
      )}

      {/* ── DESKTOP TOOLBAR ── */}
      {!isMobile && (
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={onToday} className="h-8 me-1">
            {t("views.today")}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPrev} aria-label={t("nav_prev")}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onNext} aria-label={t("nav_next")}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <span className="text-base font-semibold ms-2 select-none">
            {getDateLabel()}
          </span>
        </div>
      )}





      <div className="flex-1" />

      {!isMobile && (
        <div className="flex h-8 border border-border rounded-md overflow-hidden">
          {views.map((v) => (
            <Button
              key={v}
              variant={v === viewMode ? "default" : "ghost"}
              onClick={() => onViewModeChange(v)}
              title={t(`views.${v}_hint`)}
              className={cn(
                "inline-flex items-center px-3 h-8 min-h-0 rounded-none text-xs font-medium",
                v !== viewMode && "text-muted-foreground",
              )}
            >
              {t(`views.${v}`)}
            </Button>
          ))}
        </div>
      )}

      {(onImport || onSubscribe) && !isMobile && (
        <Dropdown>
          <Dropdown.Trigger className="inline-flex items-center gap-1 h-8 px-3 rounded-md border border-border bg-background text-sm font-medium hover:bg-muted">
            <Upload className="w-4 h-4" />
            {t("import.title")}
            <ChevronDown className="w-3 h-3" />
          </Dropdown.Trigger>
          <Dropdown.Popover className="min-w-[180px]">
            <Dropdown.Menu aria-label={t("import.title")}>
              {onImport && (
                <Dropdown.Item id="import" onAction={onImport}>
                  <span className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {t("import.title")}
                  </span>
                </Dropdown.Item>
              )}
              {onSubscribe && (
                <Dropdown.Item id="subscribe" onAction={onSubscribe}>
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {t("subscription.title")}
                  </span>
                </Dropdown.Item>
              )}
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      )}

      {!isMobile && (
        <Button size="sm" className="h-8" onClick={onCreateEvent} data-tour="create-event-button">
          <Plus className="w-4 h-4 me-1" />
          {t("events.create")}
        </Button>
      )}
    </div>
  );
}
