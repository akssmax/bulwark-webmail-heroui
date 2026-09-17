import { toastQueue } from "@heroui/react";
import type { AppToastContent, AppToastInput, ToastAction, ToastType } from "@/components/ui/toast";

function mapType(type: ToastType): AppToastContent["variant"] {
  switch (type) {
    case "success":
      return "success";
    case "error":
      return "danger";
    case "warning":
      return "warning";
    case "info":
      return "accent";
  }
}

export function addToast(input: AppToastInput): string {
  const content: AppToastContent = {
    title: input.title,
    description: input.message,
    variant: mapType(input.type),
    appAction: input.action,
    appSecondaryAction: input.secondaryAction,
    onClick: input.onClick,
    ...(input.icon !== undefined ? { indicator: input.icon } : {}),
  };

  return toastQueue.add(content, {
    timeout: input.duration ?? 5000,
  });
}

interface ToastOptions {
  message?: string;
  action?: ToastAction;
  secondaryAction?: ToastAction;
  duration?: number;
}

function showToast(
  type: ToastType,
  title: string,
  options?: string | ToastOptions,
  defaultDuration?: number,
): void {
  const opts = typeof options === "string" ? { message: options } : options;
  addToast({
    type,
    title,
    message: opts?.message,
    action: opts?.action,
    secondaryAction: opts?.secondaryAction,
    duration: opts?.duration ?? defaultDuration,
  });
}

export const toast = {
  success: (title: string, options?: string | ToastOptions) => showToast("success", title, options),
  error: (title: string, options?: string | ToastOptions) => showToast("error", title, options, 10000),
  info: (title: string, options?: string | ToastOptions) => showToast("info", title, options),
  warning: (title: string, options?: string | ToastOptions) => showToast("warning", title, options),
};

export type { ToastAction, ToastType };
