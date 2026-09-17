"use client";

import type { ReactNode } from "react";
import {
  Toast,
  Button,
  Spinner,
  useMediaQuery,
  toast as heroToast,
} from "@heroui/react";
import type { ToastContentValue } from "@heroui/react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface AppToastContent extends ToastContentValue {
  appAction?: ToastAction;
  appSecondaryAction?: ToastAction;
  onClick?: () => void;
}

export interface AppToastInput {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClick?: () => void;
  icon?: ReactNode;
  action?: ToastAction;
  secondaryAction?: ToastAction;
}

function runAction(action: () => void, toastKey: string) {
  try {
    action();
    heroToast.close(toastKey);
  } catch {
    // Keep toast open on error so the user can retry.
  }
}

function AppToastItem({
  toast: queuedToast,
}: {
  toast: { key: string; content: AppToastContent };
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const content = queuedToast.content;
  const {
    title,
    description,
    variant,
    indicator,
    appAction,
    appSecondaryAction,
    onClick,
  } = content;
  const toastKey = queuedToast.key;
  const isLoading = content.isLoading ?? false;
  const hasActions = Boolean(appAction || appSecondaryAction);
  const isClickable = Boolean(onClick && !hasActions);

  const actions = hasActions ? (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {appSecondaryAction && (
        <Button
          size="sm"
          variant="primary"
          onPress={() => runAction(appSecondaryAction.onClick, toastKey)}
        >
          {appSecondaryAction.label}
        </Button>
      )}
      {appAction && (
        <Button
          size="sm"
          variant="secondary"
          onPress={() => runAction(appAction.onClick, toastKey)}
        >
          {appAction.label}
        </Button>
      )}
    </div>
  ) : null;

  return (
    <Toast
      toast={queuedToast}
      variant={variant}
      className={cn(isClickable && "cursor-pointer")}
      onClick={
        isClickable
          ? () => {
              onClick?.();
              heroToast.close(toastKey);
            }
          : undefined
      }
    >
      {indicator === null ? null : isLoading ? (
        <Toast.Indicator variant={variant}>
          <Spinner color="current" size="sm" />
        </Toast.Indicator>
      ) : (
        <Toast.Indicator variant={variant}>{indicator}</Toast.Indicator>
      )}
      <Toast.Content>
        {!!title && <Toast.Title>{title}</Toast.Title>}
        {!!description && <Toast.Description>{description}</Toast.Description>}
        {isMobile ? actions : null}
      </Toast.Content>
      {!isMobile ? actions : null}
      <Toast.CloseButton />
    </Toast>
  );
}

export function AppToastProvider() {
  return (
    <Toast.Provider placement="bottom end" width={380}>
      {(renderProps) => (
        <AppToastItem
          toast={renderProps.toast as { key: string; content: AppToastContent }}
        />
      )}
    </Toast.Provider>
  );
}
