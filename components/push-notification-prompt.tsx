"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Alert,
  Button,
  Card,
  CloseButton,
} from "@heroui/react";
import { Loader } from "@/components/ui/loader";
import { Bell } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { usePolicyStore } from "@/stores/policy-store";
import { useSettingsStore } from "@/stores/settings-store";
import {
  enableWebPush,
  isWebPushEnabled,
  isWebPushSupported,
  resyncWebPush,
} from "@/lib/web-push";
import { resolveActiveRelayUrl } from "@/lib/push-relays";
import {
  isPWAInstallPromptVisible,
  PWA_INSTALL_PROMPT_VISIBILITY_EVENT,
} from "@/components/pwa-install-prompt";

const DISMISSED_KEY_PREFIX = "bulwark.push.onboarding.dismissed.v1.";
export const PUSH_NOTIFICATION_PROMPT_DELAY_MS = 1_000;

function dismissedKey(accountId: string): string {
  return `${DISMISSED_KEY_PREFIX}${accountId}`;
}

function isExcludedPath(pathname: string): boolean {
  return /(^|\/)settings(?:\/|$)/.test(pathname)
    || /(^|\/)setup(?:\/|$)/.test(pathname)
    || /(^|\/)login(?:\/|$)/.test(pathname);
}

function wasDismissed(accountId: string): boolean {
  try {
    return localStorage.getItem(dismissedKey(accountId)) === "1";
  } catch {
    return false;
  }
}

function dismissPermanently(accountId: string): void {
  try {
    localStorage.setItem(dismissedKey(accountId), "1");
  } catch {
    // Storage may be unavailable in hardened/private browser contexts. The
    // prompt still closes for the current session.
  }
}

export function PushNotificationPrompt() {
  const pathname = usePathname();
  const tPush = useTranslations("settings.notifications.push");
  const tInstall = useTranslations("pwa_install");

  const client = useAuthStore((state) => state.client);
  const username = useAuthStore((state) => state.username);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isDemoMode = useAuthStore((state) => state.isDemoMode);
  const emailNotificationsEnabled = useSettingsStore(
    (state) => state.emailNotificationsEnabled,
  );
  const policyLoaded = usePolicyStore((state) => state.loaded);
  const policy = usePolicyStore((state) => state.policy);
  const userPushRelayUrl = useSettingsStore((state) => state.pushRelayUrl);

  const [showPrompt, setShowPrompt] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Session-only dismissal is per account: dismissing on one account must not
  // re-offer the prompt on an account dismissed earlier in the same session.
  const [sessionDismissedAccountIds, setSessionDismissedAccountIds] = useState<
    ReadonlySet<string>
  >(() => new Set());
  const [pwaPromptVisible, setPwaPromptVisible] = useState(
    isPWAInstallPromptVisible,
  );

  const accountId = client?.getAccountId() ?? null;
  const relayBaseUrl = resolveActiveRelayUrl(policy, userPushRelayUrl);

  const dismissForSession = useCallback((id: string) => {
    setSessionDismissedAccountIds((previous) => {
      if (previous.has(id)) return previous;
      const next = new Set(previous);
      next.add(id);
      return next;
    });
  }, []);

  // A layout effect subscribes before the browser can paint, so a visibility
  // event dispatched by the PWA prompt during the same commit is not missed.
  useLayoutEffect(() => {
    const handlePwaPromptVisibility = (event: Event) => {
      const visible = (event as CustomEvent<{ visible?: boolean }>).detail?.visible;
      setPwaPromptVisible(visible === true);
    };

    window.addEventListener(
      PWA_INSTALL_PROMPT_VISIBILITY_EVENT,
      handlePwaPromptVisibility,
    );
    setPwaPromptVisible(isPWAInstallPromptVisible());
    return () => {
      window.removeEventListener(
        PWA_INSTALL_PROMPT_VISIBILITY_EVENT,
        handlePwaPromptVisibility,
      );
    };
  }, []);

  // Accounts that already have push on get their registration touched up in
  // the background once per page load: expiry refreshed and the server-side
  // delivery filter installed or repaired (older registrations predate it and
  // would keep waking the device for spam). Deliberately independent of the
  // prompt gating below - dismissing the onboarding prompt must not leave a
  // live registration stale.
  useEffect(() => {
    if (!policyLoaded || !isAuthenticated || !client || !accountId || isDemoMode) return;
    void resyncWebPush({
      client,
      relayBaseUrl,
      accountLabel: username ?? undefined,
    });
  }, [accountId, client, isAuthenticated, isDemoMode, policyLoaded, relayBaseUrl, username]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    setShowPrompt(false);
    setError(null);

    if (
      !policyLoaded
      || !isAuthenticated
      || !client
      || !accountId
      || isDemoMode
      || !emailNotificationsEnabled
      || isExcludedPath(pathname)
      || sessionDismissedAccountIds.has(accountId)
      || pwaPromptVisible
      || wasDismissed(accountId)
      || !isWebPushSupported()
      || Notification.permission === "denied"
    ) {
      return;
    }

    timer = setTimeout(() => {
      void isWebPushEnabled(accountId)
        .then((enabled) => {
          if (!cancelled && !enabled) setShowPrompt(true);
        })
        .catch(() => {
          // Failure to inspect the browser subscription should not trigger an
          // onboarding prompt whose current state we cannot determine.
        });
    }, PUSH_NOTIFICATION_PROMPT_DELAY_MS);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [
    accountId,
    client,
    emailNotificationsEnabled,
    isAuthenticated,
    isDemoMode,
    pathname,
    policyLoaded,
    pwaPromptVisible,
    sessionDismissedAccountIds,
  ]);

  const handleEnable = async () => {
    if (!client) return;
    setIsEnabling(true);
    setError(null);
    try {
      await enableWebPush({
        client,
        relayBaseUrl,
        accountLabel: username ?? undefined,
      });
      setShowPrompt(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enable push");
    } finally {
      setIsEnabling(false);
    }
  };

  const handleDismiss = () => {
    if (accountId) dismissForSession(accountId);
    setShowPrompt(false);
  };

  const handleDismissForever = () => {
    if (accountId) {
      dismissPermanently(accountId);
      dismissForSession(accountId);
    }
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <Card className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-4">
      <Card.Header className="flex flex-row items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-3">
          <Bell className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="min-w-0">
            <Card.Title>{tPush("title")}</Card.Title>
            <Card.Description>{tPush("description")}</Card.Description>
          </div>
        </div>
        <CloseButton
          aria-label={tPush("dismiss_aria")}
          isDisabled={isEnabling}
          onPress={handleDismiss}
          className="shrink-0"
        />
      </Card.Header>
      <Card.Content className="flex flex-col gap-2">
        {error ? (
          <Alert status="danger">
            <Alert.Content>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Content>
          </Alert>
        ) : null}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            isDisabled={isEnabling}
            onPress={handleDismiss}
          >
            {tInstall("not_now")}
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            isDisabled={isEnabling}
            onPress={() => void handleEnable()}
          >
            <span className="inline-flex items-center justify-center gap-2">
              {isEnabling ? <Loader size="sm" color="current" /> : null}
              {tPush("enable")}
            </span>
          </Button>
        </div>
      </Card.Content>
      <Card.Footer className="pt-0">
        <Button
          variant="tertiary"
          fullWidth
          size="sm"
          isDisabled={isEnabling}
          onPress={handleDismissForever}
        >
          {tInstall("dont_remind")}
        </Button>
      </Card.Footer>
    </Card>
  );
}
