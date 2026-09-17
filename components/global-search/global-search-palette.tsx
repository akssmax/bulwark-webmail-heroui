"use client";
import { Loader } from "@/components/ui/loader";

import { useEffect, useMemo, useRef } from "react";
import { AlertTriangle, Clock3, CornerDownLeft, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useGlobalSearch } from "@/hooks/use-global-search";
import { useMenuNavigation } from "@/hooks/use-menu-navigation";
import { openHit } from "@/lib/global-search/open-hit";
import { SEARCH_KINDS, type GlobalSearchHit, type SearchKind } from "@/lib/global-search/types";
import { useAccountStore } from "@/stores/account-store";
import { useGlobalSearchStore } from "@/stores/global-search-store";
import { useProTabStore } from "@/stores/pro-tab-store";
import { useSearchHistoryStore } from "@/stores/search-history-store";
import { PaletteResultRow } from "@/components/global-search/palette-result-row";
import { SearchScopeChips } from "@/components/global-search/search-scope-chips";
import { AppModal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const PALETTE_LOCAL_LIMIT = 10;
export const PALETTE_REMOTE_LIMIT = 25;
const MAX_ROWS_PER_KIND = 5;

/**
 * The "search everything" quick palette (#641): one query across mail,
 * contacts, calendar and files of every logged-in account. Local cache hits
 * appear per keystroke; server hits merge in per kind as each login answers.
 * Enter on a row opens it in the right account; Enter in the input opens the
 * full search tab.
 */
export function GlobalSearchPalette({ proShell = true }: { proShell?: boolean }) {
  const t = useTranslations('global_search');
  const router = useRouter();

  const isOpen = useGlobalSearchStore((s) => s.isOpen);
  const query = useGlobalSearchStore((s) => s.query);
  const scope = useGlobalSearchStore((s) => s.scope);
  const accountId = useGlobalSearchStore((s) => s.accountId);
  const closePalette = useGlobalSearchStore((s) => s.closePalette);
  const setQuery = useGlobalSearchStore((s) => s.setQuery);
  const setScope = useGlobalSearchStore((s) => s.setScope);
  const setAccountId = useGlobalSearchStore((s) => s.setAccountId);

  const accounts = useAccountStore((s) => s.accounts);
  const accountOptions = useMemo(
    () => accounts.filter((a) => a.isConnected).map((a) => ({ localAccountId: a.id, label: a.label || a.email })),
    [accounts],
  );

  const recentSearches = useSearchHistoryStore((s) => s.recentSearches);
  const addRecentSearch = useSearchHistoryStore((s) => s.addRecentSearch);

  const { outcome, parsed, isSearching } = useGlobalSearch({
    query, scope, accountId,
    localLimit: PALETTE_LOCAL_LIMIT,
    remoteLimit: PALETTE_REMOTE_LIMIT,
    enabled: isOpen,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const { menuRef, onKeyDown } = useMenuNavigation<HTMLDivElement>({ open: isOpen, onClose: closePalette, autoFocus: false });

  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  const trimmed = query.trim();

  const submit = () => {
    if (!trimmed) return;
    addRecentSearch(trimmed);
    if (proShell) {
      useProTabStore.getState().openSearchTab({ query: trimmed, scope, accountId, title: trimmed });
    }
    closePalette();
  };

  const handleOpenHit = (hit: GlobalSearchHit) => {
    if (trimmed) addRecentSearch(trimmed);
    closePalette();
    void openHit(hit, { proShell, navigate: (path) => router.push(path) });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const inInput = event.target === inputRef.current;
    if (inInput) {
      if (event.key === 'Enter') {
        event.preventDefault();
        submit();
        return;
      }
      // Leave text-cursor keys to the input; ArrowDown moves into the list.
      if (event.key === 'Home' || event.key === 'End' || event.key === 'ArrowUp' || event.key === 'Tab') {
        if (event.key === 'Tab') return; // allow tabbing to the chips
        return;
      }
    }
    onKeyDown(event);
  };

  const kindsToShow = SEARCH_KINDS.filter((kind) => parsed.scope === 'all' || parsed.scope === kind);
  const hasAnyHit = kindsToShow.some((kind) => outcome.hits[kind].length > 0);
  const showRecent = !trimmed && recentSearches.length > 0;

  const renderGroup = (kind: SearchKind) => {
    const hits = outcome.hits[kind];
    const status = outcome.status[kind];
    if (hits.length === 0 && status.errors.length === 0 && status.status !== 'loading') return null;
    return (
      <div key={kind} className="py-1">
        <div className="flex items-center gap-2 px-3 pt-2 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {t(`scope_${kind}`)}
          <span className="inline-flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-muted px-1.5 text-xs font-semibold tabular-nums normal-case">
            {hits.length}
          </span>
          {status.status === 'loading' && <Loader size="sm" color="current" />}
        </div>
        {hits.slice(0, MAX_ROWS_PER_KIND).map((hit) => (
          <PaletteResultRow key={`${hit.localAccountId}-${hit.id}`} hit={hit} onOpen={handleOpenHit} />
        ))}
        {status.errors.map((error) => (
          <div key={error.localAccountId} className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            {t('account_error', { account: error.accountLabel })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={closePalette}
      size="lg"
      className="max-w-2xl max-h-[70vh]"
      bodyClassName="p-0 flex flex-col min-h-0 overflow-hidden"
      footer={proShell && trimmed ? (
        <Button
          variant="ghost"
          role="option"
          aria-selected={false}
          onClick={submit}
          className="h-auto min-h-0 w-full justify-start gap-2 rounded-none border-t border-border px-3 py-2 text-sm font-normal text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
          {t('show_all')}
        </Button>
      ) : undefined}
    >
      <div
        ref={menuRef}
        aria-label={t('title')}
        onKeyDown={handleKeyDown}
        className="flex flex-col min-h-0 flex-1"
      >
        <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-border">
          <Search className="w-4 h-4 shrink-0 text-muted-foreground" />
          <Input
            ref={inputRef}
            data-global-search-input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('placeholder')}
            aria-label={t('title')}
            className="flex-1 min-w-0 border-0 bg-transparent shadow-none focus-visible:ring-0 px-0"
          />
          {isSearching && <Loader size="sm" color="current" />}
        </div>

        <div className="px-3 py-2 border-b border-border">
          <SearchScopeChips
            scope={scope}
            onScopeChange={setScope}
            accounts={accountOptions}
            accountId={accountId}
            onAccountChange={setAccountId}
          />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto py-1">
          {showRecent && (
            <div className="py-1">
              <div className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('recent_searches')}</div>
              {recentSearches.map((term) => (
                <Button
                  key={term}
                  variant="ghost"
                  role="option"
                  aria-selected={false}
                  onClick={() => setQuery(term)}
                  className="h-auto min-h-0 w-full justify-start gap-2.5 rounded-md px-3 py-1.5 text-sm font-normal text-foreground hover:bg-muted focus:bg-muted"
                >
                  <Clock3 className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{term}</span>
                </Button>
              ))}
            </div>
          )}
          {!trimmed && !showRecent && (
            <p className="px-3 py-6 text-sm text-muted-foreground text-center">{t('empty_hint')}</p>
          )}
          {trimmed && kindsToShow.map(renderGroup)}
          {trimmed && !hasAnyHit && !isSearching && (
            <div className="px-3 py-6 text-center">
              <p className="text-sm text-foreground">{t('no_results', { query: trimmed })}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t('server_hint')}</p>
            </div>
          )}
        </div>
      </div>
    </AppModal>
  );
}
