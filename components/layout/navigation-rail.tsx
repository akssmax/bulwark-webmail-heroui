"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Mail, Calendar, BookUser, HardDrive, Settings, Keyboard, Plus, Shield, LogOut, Check, Search } from "lucide-react";
import { AccountSwitcher } from "./account-switcher";
import { icons as lucideIcons, type LucideIcon } from "lucide-react";
import { useConfig } from "@/hooks/use-config";
import { useThemeStore } from "@/stores/theme-store";
import { usePathname, Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useCalendarStore } from "@/stores/calendar-store";
import { useEmailStore } from "@/stores/email-store";
import { useSettingsStore } from "@/stores/settings-store";
import { usePolicyStore } from "@/stores/policy-store";
import { useResolvedSidebarApps } from "@/hooks/use-resolved-sidebar-apps";
import { useAuthStore } from "@/stores/auth-store";
import { useAccountStore } from "@/stores/account-store";
import { useUpdateStore, selectHasUpdate } from "@/stores/update-store";
import { getActiveAccountSlotHeaders } from "@/lib/auth/active-account-slot";
import { getMaxAccounts } from "@/lib/account-utils";
import { isDocumentRTL } from "@/i18n/direction";
import { cn, formatFileSize } from "@/lib/utils";
import { useMenuNavigation } from "@/hooks/use-menu-navigation";
import { PluginSlot } from "@/components/plugins/plugin-slot";
import { KeyboardShortcutsModal } from "@/components/keyboard-shortcuts-modal";
import { apiFetch, getPathPrefix, withBasePath } from "@/lib/browser-navigation";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MenuButton } from "@/components/ui/menu-button";
import { Popover } from "@/components/ui/popover";
import { Tooltip } from "@/components/ui/tooltip";

interface NavItem {
  id: string;
  icon: typeof Mail;
  labelKey: string;
  href: string;
  hidden?: boolean;
  badge?: number;
}

interface NavigationRailProps {
  orientation?: "vertical" | "horizontal";
  collapsed?: boolean;
  className?: string;
  quota?: { used: number; total: number } | null;
  isPushConnected?: boolean;
  onLogout?: () => void;
  onShowShortcuts?: () => void;
  onManageApps?: () => void;
  onInlineApp?: (appId: string, url: string, name: string) => void;
  onCloseInlineApp?: () => void;
  activeAppId?: string | null;
  /**
   * If provided, intercepts the rail's built-in route navigation. Return
   * `true` to prevent the underlying `<Link>` from navigating - used by the
   * Pro interface to open the route as a tab instead. The visual rail is
   * unchanged.
   */
  onNavigate?: (itemId: 'mail' | 'calendar' | 'contacts' | 'files' | 'settings') => boolean | void;
  /**
   * When `onNavigate` is in use, this controls which nav item the rail
   * highlights as active (since the URL alone no longer reflects the
   * active app).
   */
  activeItemId?: 'mail' | 'calendar' | 'contacts' | 'files' | 'settings' | null;
  /**
   * Pro shell only: renders a Search entry that opens the global search
   * palette (#641) instead of navigating anywhere.
   */
  onOpenSearch?: () => void;
}

function StorageQuotaCircle({ quota, usagePercent }: { quota: { used: number; total: number }; usagePercent: number }) {
  const t = useTranslations("sidebar");
  const [open, setOpen] = useState(false);

  // Usage can legitimately exceed the quota (e.g. limit lowered after the fact)
  const free = Math.max(0, quota.total - quota.used);
  const strokeColor = usagePercent > 90
    ? "stroke-destructive"
    : usagePercent > 70
      ? "stroke-warning"
      : "stroke-success";
  const popoverPlacement = isDocumentRTL() ? "left bottom" : "right bottom";

  return (
    <Popover isOpen={open} onOpenChange={setOpen}>
      <Tooltip content={t("storage")} placement={isDocumentRTL() ? "left" : "right"} isDisabled={open}>
        <Popover.Trigger>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-8 w-8 min-w-8 rounded-full"
            aria-label={t("storage")}
          >
            <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="12" fill="none" className="stroke-muted" strokeWidth="3" />
              <circle
                cx="16" cy="16" r="12" fill="none"
                className={cn(strokeColor)}
                strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${(usagePercent / 100) * 75.4} 75.4`}
                style={{ transition: "stroke-dasharray 0.3s" }}
              />
            </svg>
            <span className="absolute text-xs font-bold text-muted-foreground tabular-nums">
              {Math.round(usagePercent)}%
            </span>
          </Button>
        </Popover.Trigger>
      </Tooltip>

      <Popover.Content placement={popoverPlacement} className="w-52 p-3" offset={8}>
        <Popover.Dialog className="outline-none p-0">
          <p className="text-xs font-semibold mb-2">{t("storage")}</p>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("storage_used")}</span>
              <span className="font-medium tabular-nums">{formatFileSize(quota.used)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("storage_free")}</span>
              <span className="font-medium tabular-nums">{formatFileSize(free)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("storage_total")}</span>
              <span className="font-medium tabular-nums">{formatFileSize(quota.total)}</span>
            </div>
          </div>
          <div className="mt-2.5 w-full bg-muted rounded-full h-1.5">
            <div
              className={cn(
                "h-1.5 rounded-full transition-all",
                usagePercent > 90
                  ? "bg-destructive"
                  : usagePercent > 70
                    ? "bg-warning"
                    : "bg-success"
              )}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 tabular-nums">
            {Math.round(usagePercent)}% {t("storage_used").toLowerCase()}
          </p>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}

export function NavigationRail({
  orientation = "vertical",
  collapsed = false,
  className,
  quota,
  onLogout,
  onShowShortcuts,
  onManageApps,
  onInlineApp,
  onCloseInlineApp,
  activeAppId,
  onNavigate,
  activeItemId,
  onOpenSearch,
}: NavigationRailProps) {
  const t = useTranslations("sidebar");
  const tGlobalSearch = useTranslations("global_search");
  const pathname = usePathname();
  const router = useRouter();
  const { appLogoLightUrl, appLogoDarkUrl } = useConfig();
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const { supportsCalendar } = useCalendarStore();
  const { mailboxes } = useEmailStore();
  const client = useAuthStore((s) => s.client);
  const supportsFiles = client?.supportsFiles() ?? false;
  const supportsContacts = client?.supportsContacts() ?? false;
  const showRailAccountList = useSettingsStore((s) => s.showRailAccountList);
  const sidebarAppsEnabled = usePolicyStore((s) => s.isFeatureEnabled('sidebarAppsEnabled'));
  const filesEnabled = usePolicyStore((s) => s.isFeatureEnabled('filesEnabled'));
  const contactsEnabled = usePolicyStore((s) => s.isFeatureEnabled('contactsEnabled'));
  const calendarEnabled = usePolicyStore((s) => s.isFeatureEnabled('calendarEnabled'));
  // Operator-provided apps (#931) plus the user's own; the gate above only
  // removes the user's, so a pinned set still shows when custom apps are off.
  const visibleSidebarApps = useResolvedSidebarApps();
  const inboxUnread = mailboxes.find(m => m.role === "inbox")?.unreadEmails || 0;
  const [isStalwartAdmin, setIsStalwartAdmin] = useState(false);
  const hasUpdate = useUpdateStore(selectHasUpdate);
  const updateSeverity = useUpdateStore((s) => s.status?.severity);
  const startUpdatePolling = useUpdateStore((s) => s.startPolling);
  useEffect(() => { startUpdatePolling(); }, [startUpdatePolling]);
  const updateImportant = updateSeverity === 'security' || updateSeverity === 'deprecated';

  // Account list for rail
  const accounts = useAccountStore((s) => s.accounts);
  // Read activeAccountId from authStore so the rail's account row matches the actually-loaded
  // session - accountStore has its own persisted copy that can drift out of sync.
  const activeAccountId = useAuthStore((s) => s.activeAccountId);
  const switchAccount = useAuthStore((s) => s.switchAccount);
  const logout = useAuthStore((s) => s.logout);
  const logoutAll = useAuthStore((s) => s.logoutAll);
  const [logoutMenuOpen, setLogoutMenuOpen] = useState(false);
  const logoutBtnRef = useRef<HTMLButtonElement>(null);
  const closeLogoutMenu = useCallback(() => setLogoutMenuOpen(false), []);
  const { menuRef: logoutPopoverRef, onKeyDown: onLogoutMenuKeyDown } = useMenuNavigation<HTMLDivElement>({
    open: logoutMenuOpen,
    onClose: closeLogoutMenu,
    triggerRef: logoutBtnRef,
  });
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const logoutPopoverPlacement = useMemo(
    () => (isDocumentRTL() ? "left bottom" : "right bottom"),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    const headers = getActiveAccountSlotHeaders();
    if (!headers['X-JMAP-Cookie-Slot']) return;
    apiFetch('/api/admin/auth', { headers })
      .then(res => res.json())
      .then(data => {
        if (cancelled || !data.stalwartAdmin) return;
        setIsStalwartAdmin(true);
        // Only "auto" mode may mint the admin session here; in "password"
        // mode the shield leads to /admin/login instead (#870).
        if (!data.authenticated && data.stalwartAutoLogin === true) {
          // Pre-create admin session so /admin works even after full page navigation
          apiFetch('/api/admin/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...headers },
            body: JSON.stringify({ stalwartAuth: true }),
          }).catch(() => {});
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const navItems: NavItem[] = [
    { id: "mail", icon: Mail, labelKey: "mail", href: "/", badge: inboxUnread },
    { id: "calendar", icon: Calendar, labelKey: "calendar", href: "/calendar", hidden: !supportsCalendar || !calendarEnabled },
    { id: "contacts", icon: BookUser, labelKey: "contacts", href: "/contacts", hidden: !supportsContacts || !contactsEnabled },
    { id: "files", icon: HardDrive, labelKey: "files", href: "/files", hidden: !supportsFiles || !filesEnabled },
  ];
  const tooltipPlacement = isDocumentRTL() ? "left" : "right";

  // When the host (e.g. the Pro shell) takes over navigation via `onNavigate`,
  // it tells us which item is active; otherwise we infer it from the URL.
  const isSettingsActive = onNavigate
    ? activeItemId === 'settings'
    : !activeAppId && pathname.startsWith("/settings");

  const visibleItems = navItems.filter((item) => !item.hidden);

  const getIsActive = (href: string, itemId: string) => {
    if (activeAppId) return false;
    if (onNavigate) {
      return activeItemId === itemId;
    }
    if (href === "/") {
      return pathname === "/" || pathname === "";
    }
    return pathname.startsWith(href);
  };

  const handleNavClick = (itemId: 'mail' | 'calendar' | 'contacts' | 'files' | 'settings') =>
    (e: React.MouseEvent) => {
      if (onNavigate) {
        const intercepted = onNavigate(itemId);
        if (intercepted !== false) {
          e.preventDefault();
        }
        return;
      }
      if (activeAppId) {
        onCloseInlineApp?.();
      }
    };

  if (orientation === "horizontal") {
    return (
      <nav
        className={cn("flex items-center bg-background border-t border-border shrink-0 overflow-x-auto mobile-scroll-hidden pb-[calc(env(safe-area-inset-bottom)/2)]", className)}
        role="navigation"
        aria-label={t("nav_label")}
      >
        {visibleItems.map((item) => {
          const isActive = getIsActive(item.href, item.id);
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={handleNavClick(item.id as 'mail' | 'calendar' | 'contacts' | 'files' | 'settings')}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-1 min-h-[44px] grow shrink-0 basis-[64px]",
                "transition-colors duration-150",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge != null && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 flex items-center justify-center min-w-[16px] h-4 text-xs font-bold rounded-full bg-red-500 text-white px-1">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary" />
                )}
              </div>
              <span className="text-xs font-medium leading-tight truncate max-w-full">{t(item.labelKey)}</span>
            </Link>
          );
        })}

        {/* Custom sidebar apps (per-app mobile visibility) */}
        {visibleSidebarApps.filter((app) => app.showOnMobile).map((app) => {
          const AppIcon = lucideIcons[app.icon as keyof typeof lucideIcons] as LucideIcon | undefined;
          const isActive = activeAppId === app.id;
          return (
            <Button
              key={app.id}
              variant="ghost"
              onClick={() => {
                if (isActive) {
                  onCloseInlineApp?.();
                } else if (app.openMode === 'tab') {
                  window.open(app.url, '_blank', 'noopener,noreferrer');
                } else {
                  onInlineApp?.(app.id, app.url, app.name);
                }
              }}
              className={cn(
                "flex h-auto min-h-[44px] flex-col items-center justify-center gap-1 rounded-none py-2 px-1 grow shrink-0 basis-[64px] font-normal",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                {AppIcon ? <AppIcon className="w-5 h-5" /> : null}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary" />
                )}
              </div>
              <span className="text-xs font-medium leading-tight truncate max-w-full">{app.name}</span>
            </Button>
          );
        })}

        {/* Admin (Stalwart admins) - hard nav because /admin lives outside the [locale] tree */}
        {isStalwartAdmin && (
          <a
            href={`${getPathPrefix()}/admin`}
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-2 px-1 min-h-[44px] grow shrink-0 basis-[64px]",
              "transition-colors duration-150",
              "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="relative">
              <Shield className="w-5 h-5" />
              {hasUpdate && (
                <span
                  className={cn(
                    "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-background",
                    updateImportant ? "bg-red-500" : "bg-amber-500",
                  )}
                  aria-label={updateImportant ? "Important update available" : "Update available"}
                />
              )}
            </span>
            <span className="text-xs font-medium leading-tight truncate max-w-full">{t("admin") || "Admin"}</span>
          </a>
        )}

        {/* Settings */}
        <Link
          href="/settings"
          onClick={handleNavClick('settings')}
          className={cn(
            "flex flex-col items-center justify-center gap-1 py-2 px-1 min-h-[44px] grow shrink-0 basis-[64px]",
            "transition-colors duration-150",
            isSettingsActive
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-current={isSettingsActive ? "page" : undefined}
        >
          <div className="relative">
            <Settings className="w-5 h-5" />
            {isSettingsActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary" />
            )}
          </div>
          <span className="text-xs font-medium leading-tight truncate max-w-full">{t("settings")}</span>
        </Link>
      </nav>
    );
  }

  const quotaUsagePercent = quota && quota.total > 0 ? Math.min((quota.used / quota.total) * 100, 100) : 0;

  return (
    <div
      className={cn(
        "flex flex-col h-full",
        collapsed ? "items-center" : "",
        className
      )}
    >
      {(() => {
        const logoUrl = withBasePath(resolvedTheme === 'dark' ? (appLogoDarkUrl || appLogoLightUrl) : (appLogoLightUrl || appLogoDarkUrl));
        return logoUrl ? (
          <div className="flex items-center justify-center py-3 px-1">
            <img
              src={logoUrl}
              alt=""
              className="w-8 h-8 object-contain"
            />
          </div>
        ) : null;
      })()}

      <nav
        className={cn(
          "flex flex-col flex-1 min-h-0 overflow-y-auto scroll-hidden",
          collapsed ? "items-center gap-1 py-3 px-1" : "gap-0.5 py-2 px-2",
        )}
        role="navigation"
        aria-label={t("nav_label")}
      >
        {onOpenSearch && (
          <Tooltip content={collapsed ? tGlobalSearch("title") : undefined} placement={tooltipPlacement}>
            <Button
              variant="ghost"
              onClick={onOpenSearch}
              data-tour="nav-search"
              className={cn(
                "relative h-auto min-h-0 items-center gap-2.5 font-normal",
                collapsed ? "justify-center w-10 h-10" : "px-2.5 text-sm",
                "max-lg:min-h-[44px]",
                "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              aria-label={collapsed ? tGlobalSearch("title") : undefined}
              style={collapsed ? undefined : { paddingBlock: 'var(--density-sidebar-py)' }}
            >
              <Search className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span className="truncate">{tGlobalSearch("title")}</span>}
            </Button>
          </Tooltip>
        )}
        {visibleItems.map((item) => {
          const isActive = getIsActive(item.href, item.id);
          const Icon = item.icon;
          const label = t(item.labelKey);
          return (
            <Tooltip key={item.id} content={collapsed ? label : undefined} placement={tooltipPlacement}>
              <Link
                href={item.href}
                onClick={handleNavClick(item.id as 'mail' | 'calendar' | 'contacts' | 'files' | 'settings')}
                data-tour={`nav-${item.id}`}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-md transition-colors duration-150",
                  collapsed
                    ? "justify-center w-10 h-10"
                    : "px-2.5 text-sm",
                  "max-lg:min-h-[44px]",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
                aria-label={collapsed ? label : undefined}
                style={collapsed ? undefined : { paddingBlock: 'var(--density-sidebar-py)' }}
              >
                <Icon className={cn("w-[18px] h-[18px] flex-shrink-0", isActive && "text-primary")} />
                {!collapsed && <span className="truncate">{label}</span>}
                {item.badge != null && item.badge > 0 && (
                  <span className={cn(
                    "absolute flex items-center justify-center min-w-[16px] h-4 text-xs font-bold rounded-full bg-red-500 text-white px-1",
                    collapsed ? "-top-0.5 -right-0.5" : "right-1.5"
                  )}>
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </Link>
            </Tooltip>
          );
        })}

        {/* Custom sidebar apps */}
        {visibleSidebarApps.length > 0 && (
          <div
            className={cn(
              "border-t",
              collapsed ? "w-8 mx-auto my-1 pt-1" : "mx-2 my-0.5 pt-0.5"
            )}
            style={{ borderColor: 'rgba(128, 128, 128, 0.3)' }}
          />
        )}
        {visibleSidebarApps.map((app) => {
          const AppIcon = lucideIcons[app.icon as keyof typeof lucideIcons] as LucideIcon | undefined;
          const isActive = activeAppId === app.id;
          return (
            <Tooltip key={app.id} content={collapsed ? app.name : undefined} placement={tooltipPlacement}>
              <Button
                variant="ghost"
                onClick={() => {
                  if (isActive) {
                    onCloseInlineApp?.();
                  } else if (app.openMode === 'tab') {
                    window.open(app.url, '_blank', 'noopener,noreferrer');
                  } else {
                    onInlineApp?.(app.id, app.url, app.name);
                  }
                }}
                className={cn(
                  "relative h-auto min-h-0 items-center gap-2.5 font-normal",
                  collapsed
                    ? "justify-center w-10 h-10"
                    : "px-2.5 text-sm",
                  "max-lg:min-h-[44px]",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                )}
                aria-label={collapsed ? app.name : undefined}
                style={collapsed ? undefined : { paddingBlock: 'var(--density-sidebar-py)' }}
              >
                {AppIcon ? <AppIcon className={cn("w-[18px] h-[18px] flex-shrink-0", isActive && "text-primary")} /> : null}
                {!collapsed && <span className="truncate">{app.name}</span>}
              </Button>
            </Tooltip>
          );
        })}

        {/* Manage apps button */}
        {sidebarAppsEnabled && onManageApps && (
          <Tooltip content={collapsed ? t("add_app") : undefined} placement={tooltipPlacement}>
            <Button
              variant="ghost"
              onClick={onManageApps}
              className={cn(
                "relative h-auto min-h-0 items-center gap-2.5 font-normal",
                collapsed
                  ? "justify-center w-10 h-10"
                  : "px-2.5 text-sm",
                "max-lg:min-h-[44px]",
                "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              aria-label={collapsed ? t("add_app") : undefined}
              style={collapsed ? undefined : { paddingBlock: 'var(--density-sidebar-py)' }}
            >
              <Plus className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span className="truncate">{t("add_app")}</span>}
            </Button>
          </Tooltip>
        )}
      </nav>

      <PluginSlot name="navigation-rail-bottom" />

      {/* Footer: Admin + Settings + Help + Storage Quota + Sign Out + Push Status */}
      <div className="mt-auto flex flex-col items-center gap-2 pb-3 px-1">
        {isStalwartAdmin && (
          <Tooltip content={t("admin") || "Admin"} placement={tooltipPlacement}>
            <a
              href={`${getPathPrefix()}/admin`}
              className="flex items-center justify-center w-10 h-10 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted relative"
              aria-label={t("admin") || "Admin"}
            >
              <Shield className="w-[18px] h-[18px]" />
              {hasUpdate && (
                <span
                  className={cn(
                    "absolute top-2 right-2 w-2 h-2 rounded-full ring-2 ring-background",
                    updateImportant ? "bg-red-500" : "bg-amber-500",
                  )}
                  aria-label={updateImportant ? "Important update available" : "Update available"}
                />
              )}
            </a>
          </Tooltip>
        )}

        <Tooltip content={t("settings")} placement={tooltipPlacement}>
          <Link
            href="/settings"
            onClick={handleNavClick('settings')}
            data-tour="nav-settings"
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-md transition-colors",
              isSettingsActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            aria-label={t("settings")}
            aria-current={isSettingsActive ? "page" : undefined}
          >
            <Settings className="w-[18px] h-[18px]" />
          </Link>
        </Tooltip>

        <div className="w-8 border-t" style={{ borderColor: 'rgba(128, 128, 128, 0.3)' }} />

        {onShowShortcuts && (
          <Tooltip content={t("keyboard_shortcuts")} placement={tooltipPlacement}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onShowShortcuts}
              data-tour="nav-shortcuts"
              className="h-10 w-10 min-w-10 text-muted-foreground hover:text-foreground"
              aria-label={t("keyboard_shortcuts")}
            >
              <Keyboard className="w-[18px] h-[18px]" />
            </Button>
          </Tooltip>
        )}
        {!onShowShortcuts && (
          <>
            <Tooltip content={t("keyboard_shortcuts")} placement={tooltipPlacement}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowShortcutsModal(true)}
                data-tour="nav-shortcuts"
                className="h-10 w-10 min-w-10 text-muted-foreground hover:text-foreground"
                aria-label={t("keyboard_shortcuts")}
              >
                <Keyboard className="w-[18px] h-[18px]" />
              </Button>
            </Tooltip>
            <KeyboardShortcutsModal
              isOpen={showShortcutsModal}
              onClose={() => setShowShortcutsModal(false)}
            />
          </>
        )}

        {quota && quota.total > 0 && (
          <div data-tour="storage-quota">
            <StorageQuotaCircle quota={quota} usagePercent={quotaUsagePercent} />
          </div>
        )}

        {onLogout && showRailAccountList && accounts.length > 0 && (
          <>
            <div className="w-8 border-t my-1" style={{ borderColor: 'rgba(128, 128, 128, 0.3)' }} />

            {/* Account circles */}
            <div className="flex flex-col items-center gap-3">
            {accounts.map((account) => {
              const isActive = account.id === activeAccountId;
              return (
                <Tooltip
                  key={account.id}
                  content={`${account.displayName || account.label} (${account.email || account.username})`}
                  placement={tooltipPlacement}
                >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (!isActive) switchAccount(account.id);
                  }}
                  className={cn(
                    "relative h-8 w-8 min-w-8 rounded-full p-0 flex-shrink-0",
                    isActive
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "opacity-70 hover:opacity-100"
                  )}
                  aria-label={`${account.displayName || account.label} (${account.email || account.username})`}
                >
                  <Avatar
                    name={account.displayName || account.label}
                    email={account.email || account.username}
                    size="sm"
                    disableFavicon
                    fallbackColor={account.avatarColor}
                  />
                  {isActive && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-2 h-2 text-primary-foreground" />
                    </span>
                  )}
                </Button>
                </Tooltip>
              );
            })}
            {accounts.length < getMaxAccounts() && (
              <Tooltip content={t("add_account")} placement={tooltipPlacement}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.push(`/login?mode=add-account` as never)}
                  className="h-8 w-8 min-w-8 rounded-full border-dashed border-muted-foreground/50 text-muted-foreground hover:border-foreground hover:text-foreground flex-shrink-0"
                  aria-label={t("add_account")}
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </Tooltip>
            )}
            </div>

            {/* Logout button with popover */}
            <Popover isOpen={logoutMenuOpen} onOpenChange={setLogoutMenuOpen}>
              <Tooltip content={t("sign_out")} placement={tooltipPlacement} isDisabled={logoutMenuOpen}>
                <Popover.Trigger>
                  <Button
                    ref={logoutBtnRef}
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 min-w-9 text-muted-foreground hover:text-foreground"
                    aria-label={t("sign_out")}
                    aria-expanded={logoutMenuOpen}
                    aria-haspopup="menu"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </Popover.Trigger>
              </Tooltip>

              <Popover.Content placement={logoutPopoverPlacement} className="w-56 overflow-hidden p-0" offset={8}>
                <Popover.Dialog className="outline-none p-0">
                  <div
                    ref={logoutPopoverRef}
                    onKeyDown={onLogoutMenuKeyDown}
                    role="menu"
                    aria-label={t("sign_out")}
                  >
                    <MenuButton
                      onClick={() => { setLogoutMenuOpen(false); logout(); }}
                      className="px-3 py-2.5"
                    >
                      <LogOut className="w-4 h-4" />
                      {t("sign_out")}
                    </MenuButton>
                    {accounts.length > 1 && (
                      <MenuButton
                        onClick={() => { setLogoutMenuOpen(false); logoutAll(); }}
                        className="px-3 py-2.5 text-destructive hover:text-destructive"
                      >
                        <LogOut className="w-4 h-4" />
                        {t("sign_out_all")}
                      </MenuButton>
                    )}
                  </div>
                </Popover.Dialog>
              </Popover.Content>
            </Popover>
          </>
        )}

        {onLogout && !showRailAccountList && (
          <AccountSwitcher variant="rail" />
        )}
      </div>
    </div>
  );
}
