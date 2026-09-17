"use client";

import { useTranslations } from "next-intl";
import type { SearchScope } from "@/lib/global-search/query-parser";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { AppSelect } from "@/components/ui/select";

export interface ScopeAccountOption {
  localAccountId: string;
  label: string;
}

export interface SearchScopeChipsProps {
  scope: SearchScope;
  onScopeChange: (scope: SearchScope) => void;
  accounts: ScopeAccountOption[];
  accountId: string | null;
  onAccountChange: (accountId: string | null) => void;
}

const SCOPES: readonly SearchScope[] = ['all', 'mail', 'contacts', 'calendar', 'files'];

/**
 * Scope + account chips of the global search palette. They are sugar over the
 * `in:` / `account:` query operators - an explicit operator in the query wins.
 */
export function SearchScopeChips({ scope, onScopeChange, accounts, accountId, onAccountChange }: SearchScopeChipsProps) {
  const t = useTranslations('global_search');
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <SegmentedTabs
        value={scope}
        onChange={(value) => onScopeChange(value as SearchScope)}
        options={SCOPES.map((option) => ({
          value: option,
          label: t(`scope_${option}`),
        }))}
        aria-label={t('scope_label')}
      />
      {accounts.length > 1 && (
        <AppSelect
          value={accountId ?? ''}
          onChange={(value) => onAccountChange(value || null)}
          options={[
            { value: '', label: t('all_accounts') },
            ...accounts.map((account) => ({
              value: account.localAccountId,
              label: account.label,
            })),
          ]}
          aria-label={t('account_label')}
          className="ml-auto max-w-[14rem] text-xs"
        />
      )}
    </div>
  );
}
