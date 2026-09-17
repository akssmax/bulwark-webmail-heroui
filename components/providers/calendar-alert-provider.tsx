"use client";

import { useCalendarAlerts } from '@/hooks/use-calendar-alerts';
import { AppToastProvider } from '@/components/ui/toast';

export function CalendarAlertProvider({ children }: { children: React.ReactNode }) {
  useCalendarAlerts();

  return (
    <>
      {children}
      <AppToastProvider />
    </>
  );
}
