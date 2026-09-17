"use client";

import { useState, useRef, useCallback, useMemo, useId } from "react";
import { Check, Plus, LogOut, Star, ChevronDown, AlertCircle, GripVertical, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAccountStore, type AccountEntry } from "@/stores/account-store";
import { useAuthStore } from "@/stores/auth-store";
import { getMaxAccounts, sortDefaultFirst, reorderNonDefaultIds } from "@/lib/account-utils";
import { isDocumentRTL } from "@/i18n/direction";
import { cn } from "@/lib/utils";
import { useRouter } from "@/i18n/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MenuButton } from "@/components/ui/menu-button";
import { Popover } from "@/components/ui/popover";
import { Tooltip } from "@/components/ui/tooltip";
import { useMenuNavigation } from "@/hooks/use-menu-navigation";

interface AccountSwitcherProps {
  /** "rail" = small avatar only (NavigationRail), "expanded" = avatar + name + email (Sidebar) */
  variant?: "rail" | "expanded" | "header";
  className?: string;
}

function AccountAvatar({ account, size = "sm" }: { account: AccountEntry; size?: "sm" | "md" }) {
  return (
    <Avatar
      name={account.displayName || account.label}
      email={account.email || account.username}
      size="sm"
      className={cn("flex-shrink-0", size === "md" && "w-9 h-9 text-sm")}
      disableFavicon
      fallbackColor={account.avatarColor}
    />
  );
}

export function AccountSwitcher({ variant = "rail", className }: AccountSwitcherProps) {
  const t = useTranslations("sidebar");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const closeMenu = useCallback(() => setOpen(false), []);
  const { menuRef: popoverRef, onKeyDown: handleMenuKeyDown } = useMenuNavigation<HTMLDivElement>({
    open,
    onClose: closeMenu,
    triggerRef: buttonRef,
  });

  const accounts = useAccountStore((s) => s.accounts);
  const setDefaultAccount = useAccountStore((s) => s.setDefaultAccount);
  const reorderAccounts = useAccountStore((s) => s.reorderAccounts);
  // Read activeAccountId from authStore so the selector matches the actually-loaded
  // session (primaryIdentity, JMAP client). accountStore.activeAccountId is a separate
  // persisted copy that can drift out of sync across hydration / partial persist writes.
  const activeAccountId = useAuthStore((s) => s.activeAccountId);
  const activeAccount = accounts.find((a) => a.id === activeAccountId);
  const switchAccount = useAuthStore((s) => s.switchAccount);
  const logout = useAuthStore((s) => s.logout);
  const removeAccount = useAuthStore((s) => s.removeAccount);
  const logoutAll = useAuthStore((s) => s.logoutAll);

  const handleSwitch = async (accountId: string) => {
    if (accountId === activeAccountId) return;
    setOpen(false);
    await switchAccount(accountId);
  };

  const handleAddAccount = () => {
    setOpen(false);
    router.push(`/login?mode=add-account` as never);
  };

  const handleRemove = (e: React.MouseEvent, account: AccountEntry) => {
    e.stopPropagation();
    const label = account.email || account.username;
    if (!window.confirm(t("remove_account_confirm", { account: label }))) return;
    removeAccount(account.id);
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  const handleLogoutAll = () => {
    setOpen(false);
    logoutAll();
  };

  const handleSetDefault = (accountId: string) => {
    setDefaultAccount(accountId);
  };

  // Display order: default account pinned to the top, the rest reorderable.
  const displayAccounts = useMemo(() => sortDefaultFirst(accounts), [accounts]);

  // Drag-to-rearrange (non-default accounts only; the default stays pinned).
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const resetDrag = () => { setDragId(null); setDragOverId(null); };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e: React.DragEvent, overId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (overId !== dragOverId) setDragOverId(overId);
  };
  const handleDrop = (e: React.DragEvent, overId: string) => {
    e.preventDefault();
    if (dragId) {
      const next = reorderNonDefaultIds(accounts, dragId, overId);
      if (next) reorderAccounts(next);
    }
    resetDrag();
  };

  const popoverPlacement = useMemo(() => {
    const rtl = isDocumentRTL();
    if (variant === "rail") return rtl ? "left bottom" : "right bottom";
    if (variant === "header") return rtl ? "bottom start" : "bottom end";
    return rtl ? "bottom end" : "bottom start";
  }, [variant]);

  // Show the account's own identity, not the preferred sending identity -
  // primaryIdentity can be an alias (e.g. info@korazo.net) that differs from
  // the actually logged-in account (info@linusrath.de).
  const displayName = activeAccount?.displayName || activeAccount?.label || "";
  const displayEmail = activeAccount?.email || activeAccount?.username || "";

  return (
    <Popover isOpen={open} onOpenChange={setOpen}>
      <Tooltip
        content={variant !== "expanded" ? (displayName || displayEmail) : undefined}
        placement={isDocumentRTL() ? "left" : "right"}
        isDisabled={open}
      >
        <Popover.Trigger>
          <Button
            ref={buttonRef}
            variant="ghost"
            data-testid="account-switcher"
            data-active-account-id={activeAccountId ?? undefined}
            className={cn(
              "flex items-center gap-2 rounded-md transition-colors",
              variant !== "expanded"
                ? "justify-center sidebar-hit hover:bg-muted"
                : "w-full px-2 min-h-[var(--density-touch-target)] hover:bg-muted text-start min-w-0 h-auto",
              className
            )}
            aria-label={t("switch_account")}
            aria-expanded={open}
            aria-haspopup="menu"
            aria-controls={open ? menuId : undefined}
          >
            {activeAccount ? (
              <>
                <AccountAvatar account={activeAccount} size={variant === "expanded" ? "md" : "sm"} />
                {variant === "expanded" && (
                  <>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
                    </div>
                    <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground flex-shrink-0 transition-transform", open && "rotate-180")} />
                  </>
                )}
              </>
            ) : (
              <div className={cn(
                "rounded-full bg-muted flex items-center justify-center text-muted-foreground",
                variant === "expanded" ? "w-9 h-9 text-sm" : "w-8 h-8 text-xs"
              )}>
                ?
              </div>
            )}
          </Button>
        </Popover.Trigger>
      </Tooltip>

      <Popover.Content
        placement={popoverPlacement}
        className="w-72 overflow-hidden p-0"
        offset={4}
      >
        <Popover.Dialog className="outline-none p-0">
          <div
            ref={popoverRef}
            role="menu"
            id={menuId}
            aria-label={t("switch_account")}
            onKeyDown={handleMenuKeyDown}
          >
          {/* Account List */}
          <div className="py-1 max-h-64 overflow-y-auto">
            {displayAccounts.map((account) => {
              const isActive = account.id === activeAccountId;
              const isDraggable = !account.isDefault && accounts.length > 2;
              return (
                <div
                  key={account.id}
                  draggable={isDraggable}
                  onDragStart={isDraggable ? (e) => handleDragStart(e, account.id) : undefined}
                  onDragOver={isDraggable ? (e) => handleDragOver(e, account.id) : undefined}
                  onDrop={isDraggable ? (e) => handleDrop(e, account.id) : undefined}
                  onDragEnd={isDraggable ? resetDrag : undefined}
                  className={cn(
                    "group/acct relative",
                    dragId === account.id && "opacity-50",
                    dragOverId === account.id && dragId !== account.id && "border-t-2 border-primary"
                  )}
                >
                  <Button
                    variant="ghost"
                    onClick={() => handleSwitch(account.id)}
                    data-testid="account-option"
                    data-account-id={account.id}
                    data-account-email={account.email || account.username}
                    role="menuitem"
                    disabled={isActive}
                    className={cn(
                      "h-auto w-full items-start justify-start gap-3 px-3 py-2.5 text-start font-normal min-h-[var(--density-touch-target)]",
                      isActive ? "bg-accent/50" : "hover:bg-muted",
                      (!isActive && !account.isDefault) ? (isDraggable ? "pe-14" : "pe-8") : (isDraggable && "pe-7")
                    )}
                  >
                    <div className="relative flex-shrink-0">
                      <AccountAvatar account={account} size="md" />
                      {isActive && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium truncate">
                          {account.displayName || account.label}
                        </span>
                        {account.isDefault && (
                          <Star className="w-3 h-3 text-amber-500 flex-shrink-0 fill-amber-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {account.email || account.username}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {account.hasError ? (
                          <AlertCircle className="w-3 h-3 text-destructive" />
                        ) : (
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            account.isConnected ? "bg-green-500" : "bg-muted-foreground/40"
                          )} />
                        )}
                        <span className="text-xs text-muted-foreground truncate">
                          {(() => { try { return new URL(account.serverUrl).hostname; } catch { return account.serverUrl; } })()}
                        </span>
                      </div>
                    </div>
                  </Button>
                  {isDraggable && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute end-7 top-1/2 -translate-y-1/2 text-muted-foreground/50 opacity-0 transition-opacity group-hover/acct:opacity-100"
                    >
                      <GripVertical className="w-4 h-4" />
                    </span>
                  )}
                  {!isActive && !account.isDefault && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleRemove(e, account)}
                      role="menuitem"
                      aria-label={t("remove_account")}
                      title={t("remove_account")}
                      className="absolute end-1.5 top-1/2 h-7 w-7 min-w-7 -translate-y-1/2 text-muted-foreground/60 opacity-0 transition-opacity group-hover/acct:opacity-100 hover:bg-destructive/10 hover:text-destructive focus:opacity-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Separator + Add Account */}
          {accounts.length < getMaxAccounts() && (
            <div className="border-t border-border">
              <MenuButton
                onClick={handleAddAccount}
                data-testid="add-account"
                className="px-3 py-2"
              >
                <Plus className="w-4 h-4" />
                {t("add_account")}
              </MenuButton>
            </div>
          )}

          {/* Separator + Actions */}
          <div className="border-t border-border">
            {activeAccount && !activeAccount.isDefault && accounts.length > 1 && (
              <MenuButton
                onClick={() => handleSetDefault(activeAccount.id)}
                className="px-3 py-2"
              >
                <Star className="w-4 h-4" />
                {t("set_as_default")}
              </MenuButton>
            )}
            <MenuButton onClick={handleLogout} className="px-3 py-2">
              <LogOut className="w-4 h-4" />
              {t("sign_out_of", { account: displayEmail })}
            </MenuButton>
            {accounts.length > 1 && (
              <MenuButton
                onClick={handleLogoutAll}
                className="px-3 py-2 text-destructive hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
                {t("sign_out_all")}
              </MenuButton>
            )}
          </div>
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
