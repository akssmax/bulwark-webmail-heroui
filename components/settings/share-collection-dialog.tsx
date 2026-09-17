"use client";
import { Loader } from "@/components/ui/loader";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppSelect } from "@/components/ui/select";
import { AppModal } from "@/components/ui/modal";
import { Avatar } from "@/components/ui/avatar";
import { UserPlus, Trash2, Users } from "lucide-react";
import type { IJMAPClient } from "@/lib/jmap/client-interface";
import type { Principal, CalendarRights, AddressBookRights, FileNodeRights, MailboxRights } from "@/lib/jmap/types";
import { toast } from "@/stores/toast-store";

type ShareKind = "calendar" | "addressBook" | "file" | "mailbox";
type AnyRights = CalendarRights | AddressBookRights | FileNodeRights | MailboxRights;

type RolePreset = "freeBusy" | "read" | "readWrite" | "manager" | "custom";

const CALENDAR_PRESETS: Record<Exclude<RolePreset, "custom">, CalendarRights> = {
  freeBusy: {
    mayReadFreeBusy: true, mayReadItems: false, mayWriteAll: false, mayWriteOwn: false,
    mayUpdatePrivate: false, mayRSVP: false, mayShare: false, mayDelete: false,
  },
  read: {
    mayReadFreeBusy: true, mayReadItems: true, mayWriteAll: false, mayWriteOwn: false,
    mayUpdatePrivate: false, mayRSVP: false, mayShare: false, mayDelete: false,
  },
  readWrite: {
    mayReadFreeBusy: true, mayReadItems: true, mayWriteAll: true, mayWriteOwn: true,
    mayUpdatePrivate: true, mayRSVP: true, mayShare: false, mayDelete: false,
  },
  manager: {
    mayReadFreeBusy: true, mayReadItems: true, mayWriteAll: true, mayWriteOwn: true,
    mayUpdatePrivate: true, mayRSVP: true, mayShare: true, mayDelete: true,
  },
};

const ADDRESS_BOOK_PRESETS: Record<Exclude<RolePreset, "custom" | "freeBusy">, AddressBookRights> = {
  read: { mayRead: true, mayWrite: false, mayShare: false, mayDelete: false },
  readWrite: { mayRead: true, mayWrite: true, mayShare: false, mayDelete: false },
  manager: { mayRead: true, mayWrite: true, mayShare: true, mayDelete: true },
};

const FILE_PRESETS: Record<Exclude<RolePreset, "custom" | "freeBusy">, FileNodeRights> = {
  read: {
    mayRead: true, mayAddChildren: false, mayRename: false,
    mayDelete: false, mayModifyContent: false, mayShare: false,
  },
  readWrite: {
    mayRead: true, mayAddChildren: true, mayRename: true,
    mayDelete: true, mayModifyContent: true, mayShare: false,
  },
  manager: {
    mayRead: true, mayAddChildren: true, mayRename: true,
    mayDelete: true, mayModifyContent: true, mayShare: true,
  },
};

// Mail folder rights (RFC 8621 §2 + mail:share). "Read & write" lets the
// grantee file, flag and remove mail; "Manager" additionally lets them
// rename/delete the folder, create subfolders, send as it and re-share.
const MAILBOX_PRESETS: Record<Exclude<RolePreset, "custom" | "freeBusy">, MailboxRights> = {
  read: {
    mayReadItems: true, mayAddItems: false, mayRemoveItems: false, maySetSeen: true,
    maySetKeywords: false, mayCreateChild: false, mayRename: false, mayDelete: false,
    maySubmit: false, mayShare: false,
  },
  readWrite: {
    mayReadItems: true, mayAddItems: true, mayRemoveItems: true, maySetSeen: true,
    maySetKeywords: true, mayCreateChild: false, mayRename: false, mayDelete: false,
    maySubmit: false, mayShare: false,
  },
  manager: {
    mayReadItems: true, mayAddItems: true, mayRemoveItems: true, maySetSeen: true,
    maySetKeywords: true, mayCreateChild: true, mayRename: true, mayDelete: true,
    maySubmit: true, mayShare: true,
  },
};

function detectMailboxPreset(r: MailboxRights): RolePreset {
  for (const [name, preset] of Object.entries(MAILBOX_PRESETS) as [Exclude<RolePreset, "custom" | "freeBusy">, MailboxRights][]) {
    const keys = Object.keys(preset) as (keyof MailboxRights)[];
    if (keys.every((k) => preset[k] === (r[k] ?? false))) {
      return name;
    }
  }
  return "custom";
}

function detectCalendarPreset(r: CalendarRights): RolePreset {
  for (const [name, preset] of Object.entries(CALENDAR_PRESETS) as [Exclude<RolePreset, "custom">, CalendarRights][]) {
    if ((Object.keys(preset) as (keyof CalendarRights)[]).every((k) => preset[k] === r[k])) {
      return name;
    }
  }
  return "custom";
}

function detectAddressBookPreset(r: AddressBookRights): RolePreset {
  for (const [name, preset] of Object.entries(ADDRESS_BOOK_PRESETS) as [Exclude<RolePreset, "custom" | "freeBusy">, AddressBookRights][]) {
    const keys = Object.keys(preset) as (keyof AddressBookRights)[];
    if (keys.every((k) => preset[k] === (r[k] ?? false))) {
      return name;
    }
  }
  return "custom";
}

function detectFilePreset(r: FileNodeRights): RolePreset {
  for (const [name, preset] of Object.entries(FILE_PRESETS) as [Exclude<RolePreset, "custom" | "freeBusy">, FileNodeRights][]) {
    const keys = Object.keys(preset) as (keyof FileNodeRights)[];
    if (keys.every((k) => preset[k] === (r[k] ?? false))) {
      return name;
    }
  }
  return "custom";
}

function presetRights(kind: ShareKind, preset: RolePreset): AnyRights | undefined {
  if (preset === "custom") return undefined;
  if (kind === "calendar") return CALENDAR_PRESETS[preset as keyof typeof CALENDAR_PRESETS];
  if (kind === "file") return FILE_PRESETS[preset as keyof typeof FILE_PRESETS];
  if (kind === "mailbox") return MAILBOX_PRESETS[preset as keyof typeof MAILBOX_PRESETS];
  return ADDRESS_BOOK_PRESETS[preset as keyof typeof ADDRESS_BOOK_PRESETS];
}

function detectPreset(kind: ShareKind, rights: AnyRights): RolePreset {
  if (kind === "calendar") return detectCalendarPreset(rights as CalendarRights);
  if (kind === "file") return detectFilePreset(rights as FileNodeRights);
  if (kind === "mailbox") return detectMailboxPreset(rights as MailboxRights);
  return detectAddressBookPreset(rights as AddressBookRights);
}

interface ShareCollectionDialogProps {
  client: IJMAPClient;
  kind: ShareKind;
  collectionName: string;
  shareWith: Record<string, AnyRights> | null | undefined;
  ownAccountId: string;
  onShare: (principalId: string, rights: AnyRights | null) => Promise<void>;
  onClose: () => void;
}

export function ShareCollectionDialog({
  client,
  kind,
  collectionName,
  shareWith,
  ownAccountId,
  onShare,
  onClose,
}: ShareCollectionDialogProps) {
  const t = useTranslations("sharing");
  const tCommon = useTranslations("common");
  const [allPrincipals, setAllPrincipals] = useState<Principal[]>([]);
  const [loadingPrincipals, setLoadingPrincipals] = useState(true);
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  // Load principals on mount
  useEffect(() => {
    let cancelled = false;
    setLoadingPrincipals(true);
    client.getPrincipals().then((list) => {
      if (cancelled) return;
      setAllPrincipals(list);
      setLoadingPrincipals(false);
    }).catch(() => {
      if (!cancelled) setLoadingPrincipals(false);
    });
    return () => { cancelled = true; };
  }, [client]);

  // Map of every fetched principal by id, used for name/description lookups in
  // the shared list. Must include principals that already have a share so the
  // list shows their name rather than the raw id.
  const allPrincipalsById = useMemo(() => {
    const map = new Map<string, Principal>();
    for (const p of allPrincipals) map.set(p.id, p);
    return map;
  }, [allPrincipals]);

  // Principals available to add: exclude self and anyone already shared with.
  const principals = useMemo(() => {
    const existing = new Set(Object.keys(shareWith || {}));
    return allPrincipals.filter((p) => p.id !== ownAccountId && !existing.has(p.id));
  }, [allPrincipals, ownAccountId, shareWith]);

  const handleSetRights = async (principalId: string, preset: RolePreset) => {
    if (preset === "custom") return; // custom is read-only here
    const rights = presetRights(kind, preset);
    if (!rights) return;
    setSavingId(principalId);
    try {
      await onShare(principalId, rights);
      toast.success(t("share_updated"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("share_failed"));
    } finally {
      setSavingId(null);
    }
  };

  const handleRemove = async (principalId: string) => {
    setSavingId(principalId);
    try {
      await onShare(principalId, null);
      toast.success(t("share_removed"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("share_failed"));
    } finally {
      setSavingId(null);
    }
  };

  const handleAdd = async (principal: Principal) => {
    const rights = presetRights(kind, "read");
    if (!rights) return;
    setSavingId(principal.id);
    try {
      await onShare(principal.id, rights);
      setShowAdd(false);
      setSearch("");
      toast.success(t("share_added"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("share_failed"));
    } finally {
      setSavingId(null);
    }
  };

  const filteredPrincipals = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return principals;
    return principals.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  }, [principals, search]);

  const sharedEntries = useMemo(() => {
    return Object.entries(shareWith || {}) as [string, AnyRights][];
  }, [shareWith]);

  const presetOptions = kind === "calendar"
    ? ["freeBusy", "read", "readWrite", "manager"] as const
    : ["read", "readWrite", "manager"] as const;

  return (
    <AppModal
      isOpen
      onClose={onClose}
      title={(
        <span className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          {t("title", { name: collectionName })}
        </span>
      )}
      size="lg"
      className="max-w-lg max-h-[85vh]"
      bodyClassName="space-y-4 overflow-y-auto"
      footer={<Button onClick={onClose}>{tCommon("close")}</Button>}
    >
      <p className="text-sm text-muted-foreground">{t("description")}</p>

      {sharedEntries.length === 0 && !showAdd && (
        <div className="text-sm text-muted-foreground italic py-4 text-center">
          {t("no_shares")}
        </div>
      )}

      {sharedEntries.length > 0 && (
        <ul className="divide-y divide-border rounded-md border border-border overflow-hidden">
          {sharedEntries.map(([principalId, rights]) => {
            const principal = allPrincipalsById.get(principalId);
            const preset = detectPreset(kind, rights);
            const options = [
              ...presetOptions.map((p) => ({ value: p, label: t(`preset.${p}`) })),
              ...(preset === "custom" ? [{ value: "custom", label: t("preset.custom") }] : []),
            ];
            return (
              <li key={principalId} className="flex items-center gap-3 px-3 py-2.5">
                <Avatar
                  name={principal?.name}
                  email={principal?.email ?? undefined}
                  size="sm"
                  className="shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {principal?.name || principal?.email || principalId}
                  </div>
                  {principal?.description && (
                    <div className="text-xs text-muted-foreground truncate">
                      {principal.description}
                    </div>
                  )}
                </div>
                <AppSelect
                  value={preset}
                  onChange={(value) => handleSetRights(principalId, value as RolePreset)}
                  options={options}
                  disabled={savingId === principalId || preset === "custom"}
                  className="w-32 text-xs"
                  aria-label={t("preset.custom")}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemove(principalId)}
                  disabled={savingId === principalId}
                  aria-label={t("remove")}
                  title={t("remove")}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  {savingId === principalId
                    ? <Loader size="sm" color="current" />
                    : <Trash2 className="w-4 h-4" />}
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      {!showAdd && (
        <Button
          variant="outline"
          onClick={() => setShowAdd(true)}
          className="w-full"
        >
          <UserPlus className="w-4 h-4 me-2" />
          {t("add_person")}
        </Button>
      )}

      {showAdd && (
        <div className="space-y-2 border border-border rounded-md p-3">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search_placeholder")}
            autoFocus
          />
          <div className="max-h-48 overflow-y-auto -mx-1">
            {loadingPrincipals && (
              <div className="flex items-center justify-center py-4 text-muted-foreground">
                <Loader size="sm" color="current" className="me-2" />
                {t("loading_principals")}
              </div>
            )}
            {!loadingPrincipals && filteredPrincipals.length === 0 && (
              <div className="text-xs text-muted-foreground text-center py-3">
                {search.trim() ? t("no_match") : t("no_principals")}
              </div>
            )}
            {!loadingPrincipals && filteredPrincipals.map((p) => (
              <Button
                key={p.id}
                variant="ghost"
                onClick={() => handleAdd(p)}
                disabled={savingId === p.id}
                className="w-full justify-start h-auto px-3 py-2"
              >
                <div className="flex items-center gap-2 w-full">
                  <Avatar
                    name={p.name}
                    email={p.email ?? undefined}
                    size="sm"
                    className="shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-start">
                    <div className="text-sm font-medium truncate flex items-center gap-2">
                      {p.name}
                      {p.type === "group" && (
                        <span className="text-xs uppercase font-normal text-muted-foreground bg-muted rounded px-1 py-0.5">
                          {t("group")}
                        </span>
                      )}
                    </div>
                    {p.email && p.email !== p.name && (
                      <div className="text-xs text-muted-foreground truncate">{p.email}</div>
                    )}
                  </div>
                  {savingId === p.id && <Loader size="sm" color="current" />}
                </div>
              </Button>
            ))}
          </div>
          <div className="flex justify-end pt-1">
            <Button variant="ghost" size="sm" onClick={() => { setShowAdd(false); setSearch(""); }}>
              {tCommon("cancel")}
            </Button>
          </div>
        </div>
      )}
    </AppModal>
  );
}
