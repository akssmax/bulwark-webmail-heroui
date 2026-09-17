"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Calendar,
  DateField,
  DatePicker,
  DateRangePicker,
  Label,
  RangeCalendar,
  TimeField,
} from "@heroui/react";
import {
  CalendarDate,
  CalendarDateTime,
  Time,
  parseDate,
  parseDateTime,
  parseTime,
} from "@internationalized/date";
import type { DateValue } from "@internationalized/date";
import { cn } from "@/lib/utils";

/** React Aria date literal segments can differ between Node SSR and the browser. */
function useClientMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function DateFieldPlaceholder({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={cn("w-full space-y-1.5", className)} aria-hidden>
      {label ? <Label>{label}</Label> : null}
      <div className="h-10 rounded-xl border border-border bg-surface" />
    </div>
  );
}

function ClientDateField({ label, className, children }: { label?: string; className?: string; children: ReactNode }) {
  const mounted = useClientMounted();
  if (!mounted) return <DateFieldPlaceholder label={label} className={className} />;
  return children;
}

function fireInputChange(
  onChange: React.ChangeEventHandler<HTMLInputElement> | undefined,
  value: string,
) {
  onChange?.({
    target: { value },
    currentTarget: { value },
  } as React.ChangeEvent<HTMLInputElement>);
}

function toCalendarDate(value?: string): CalendarDate | null {
  if (!value) return null;
  try {
    return parseDate(value.slice(0, 10));
  } catch {
    return null;
  }
}

function toCalendarDateTime(value?: string): CalendarDateTime | null {
  if (!value) return null;
  const normalized = value.length === 16 ? `${value}:00` : value.replace("T", "T");
  try {
    return parseDateTime(normalized.replace(" ", "T").slice(0, 19));
  } catch {
    const date = toCalendarDate(value);
    if (!date) return null;
    const timePart = value.includes("T") ? value.split("T")[1] : "00:00";
    const [h, m] = timePart.split(":").map(Number);
    return new CalendarDateTime(date.year, date.month, date.day, h || 0, m || 0);
  }
}

function toTime(value?: string): Time | null {
  if (!value) return null;
  try {
    return parseTime(value.length === 5 ? `${value}:00` : value);
  } catch {
    return null;
  }
}

function formatDate(value: DateValue | null): string {
  if (!value) return "";
  return `${value.year}-${String(value.month).padStart(2, "0")}-${String(value.day).padStart(2, "0")}`;
}

function formatDateTime(value: CalendarDateTime | null): string {
  if (!value) return "";
  return `${formatDate(value)}T${String(value.hour).padStart(2, "0")}:${String(value.minute).padStart(2, "0")}`;
}

function formatTime(value: Time | null): string {
  if (!value) return "";
  return `${String(value.hour).padStart(2, "0")}:${String(value.minute).padStart(2, "0")}`;
}

export function AppCalendar({ "aria-label": ariaLabel }: { "aria-label"?: string }) {
  const mounted = useClientMounted();
  if (!mounted) {
    return <div className="h-72 w-72 rounded-xl border border-border bg-surface" aria-hidden />;
  }
  return (
    <Calendar aria-label={ariaLabel ?? "Choose date"}>
      <Calendar.Header>
        <Calendar.Heading />
        <Calendar.NavButton slot="previous" />
        <Calendar.NavButton slot="next" />
      </Calendar.Header>
      <Calendar.Grid>
        <Calendar.GridHeader>
          {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
        </Calendar.GridHeader>
        <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
      </Calendar.Grid>
    </Calendar>
  );
}

interface FieldProps {
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  label?: string;
  className?: string;
  isDisabled?: boolean;
  name?: string;
  "aria-label"?: string;
}

export function DatePickerField({
  value,
  onChange,
  label,
  className,
  isDisabled,
  name,
  "aria-label": ariaLabel,
}: FieldProps) {
  const parsed = toCalendarDate(value);
  return (
    <ClientDateField label={label} className={className}>
      <DatePicker
        className={cn("w-full", className)}
        name={name}
        isDisabled={isDisabled}
        value={parsed}
        onChange={(next) => fireInputChange(onChange, formatDate(next))}
        aria-label={ariaLabel ?? label ?? "Date"}
      >
        {label ? <Label>{label}</Label> : null}
        <DateField.Group fullWidth>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
          <DateField.Suffix>
            <DatePicker.Trigger>
              <DatePicker.TriggerIndicator />
            </DatePicker.Trigger>
          </DateField.Suffix>
        </DateField.Group>
        <DatePicker.Popover>
          <AppCalendar />
        </DatePicker.Popover>
      </DatePicker>
    </ClientDateField>
  );
}

export function DateTimePickerField({
  value,
  onChange,
  label,
  className,
  isDisabled,
  name,
  "aria-label": ariaLabel,
}: FieldProps) {
  const parsed = toCalendarDateTime(value);
  return (
    <ClientDateField label={label} className={className}>
      <DatePicker
        className={cn("w-full", className)}
        granularity="minute"
        name={name}
        isDisabled={isDisabled}
        value={parsed}
        onChange={(next) => {
          if (!next) {
            fireInputChange(onChange, "");
            return;
          }
          const dateTime =
            "hour" in next
              ? (next as CalendarDateTime)
              : new CalendarDateTime(
                  (next as DateValue).year,
                  (next as DateValue).month,
                  (next as DateValue).day,
                  0,
                  0,
                );
          fireInputChange(onChange, formatDateTime(dateTime));
        }}
        aria-label={ariaLabel ?? label ?? "Date and time"}
      >
        {label ? <Label>{label}</Label> : null}
        <DateField.Group fullWidth>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
          <DateField.Suffix>
            <DatePicker.Trigger>
              <DatePicker.TriggerIndicator />
            </DatePicker.Trigger>
          </DateField.Suffix>
        </DateField.Group>
        <DatePicker.Popover>
          <AppCalendar />
        </DatePicker.Popover>
      </DatePicker>
    </ClientDateField>
  );
}

export function TimePickerField({
  value,
  onChange,
  label,
  className,
  isDisabled,
  name,
  "aria-label": ariaLabel,
}: FieldProps) {
  const parsed = toTime(value);
  return (
    <ClientDateField label={label} className={className}>
      <TimeField
        className={cn("w-full", className)}
        name={name}
        isDisabled={isDisabled}
        value={parsed}
        onChange={(next) => fireInputChange(onChange, formatTime(next as Time | null))}
        aria-label={ariaLabel ?? label ?? "Time"}
        granularity="minute"
      >
        {label ? <Label>{label}</Label> : null}
        <TimeField.Group fullWidth>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
      </TimeField>
    </ClientDateField>
  );
}

export function DateRangePickerField({ className }: { className?: string }) {
  return (
    <ClientDateField label="Date range" className={className}>
      <DateRangePicker className={cn("w-full", className)} aria-label="Date range">
        <Label>Date range</Label>
        <DateField.Group fullWidth>
          <DateField.Input slot="start">{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
          <DateField.Input slot="end">{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
          <DateField.Suffix>
            <DateRangePicker.Trigger>
              <DateRangePicker.TriggerIndicator />
            </DateRangePicker.Trigger>
          </DateField.Suffix>
        </DateField.Group>
        <DateRangePicker.Popover>
          <RangeCalendar aria-label="Date range">
            <RangeCalendar.Header>
              <RangeCalendar.Heading />
              <RangeCalendar.NavButton slot="previous" />
              <RangeCalendar.NavButton slot="next" />
            </RangeCalendar.Header>
            <RangeCalendar.Grid>
              <RangeCalendar.GridHeader>
                {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
              </RangeCalendar.GridHeader>
              <RangeCalendar.GridBody>{(date) => <RangeCalendar.Cell date={date} />}</RangeCalendar.GridBody>
            </RangeCalendar.Grid>
          </RangeCalendar>
        </DateRangePicker.Popover>
      </DateRangePicker>
    </ClientDateField>
  );
}
