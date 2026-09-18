"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { format } from "date-fns";
import {
  AppCalendar,
  calendarDateToJsDate,
  jsDateToCalendarDate,
} from "@/components/ui/date-picker";
import { getEventDayBounds } from "@/lib/calendar-utils";
import type { CalendarEvent } from "@/lib/jmap/types";
import { cn } from "@/lib/utils";

interface MiniCalendarProps {
  selectedDate: Date;
  displayMonth: Date;
  onSelectDate: (date: Date) => void;
  onChangeMonth: (date: Date) => void;
  events?: CalendarEvent[];
  firstDayOfWeek?: number;
  /** Week numbers are not supported by the HeroUI calendar grid. */
  showWeekNumbers?: boolean;
}

export function MiniCalendar({
  selectedDate,
  displayMonth,
  onSelectDate,
  onChangeMonth,
  events = [],
  firstDayOfWeek = 1,
}: MiniCalendarProps) {
  const t = useTranslations("calendar");
  const locale = useLocale();

  const eventDates = useMemo(() => {
    const set = new Set<string>();
    events.forEach((event) => {
      try {
        const { startDay, endDay } = getEventDayBounds(event);
        const cursor = new Date(startDay);
        while (cursor <= endDay) {
          set.add(format(cursor, "yyyy-MM-dd"));
          cursor.setDate(cursor.getDate() + 1);
        }
      } catch {
        /* skip malformed events */
      }
    });
    return set;
  }, [events]);

  const calendarValue = useMemo(
    () => jsDateToCalendarDate(selectedDate, locale),
    [locale, selectedDate],
  );
  const focusedValue = useMemo(
    () => jsDateToCalendarDate(displayMonth, locale),
    [displayMonth, locale],
  );

  return (
    <div className={cn("select-none mini-calendar")}>
      <AppCalendar
        aria-label={t("mini_calendar_change")}
        className="w-full max-w-none"
        placeholderClassName="h-56 w-full"
        value={calendarValue}
        onChange={(date) => onSelectDate(calendarDateToJsDate(date))}
        focusedValue={focusedValue}
        onFocusChange={(date) => onChangeMonth(calendarDateToJsDate(date))}
        firstDayOfWeek={firstDayOfWeek}
        eventDates={eventDates}
      />
    </div>
  );
}
