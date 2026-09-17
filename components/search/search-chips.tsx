"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Chip } from "@heroui/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SearchFilters, sizeFilterBytes } from "@/lib/jmap/search-utils";

interface SearchChipsProps {
  filters: SearchFilters;
  onRemoveFilter: (key: keyof SearchFilters) => void;
  onClearAll: () => void;
  className?: string;
}

export function SearchChips({
  filters,
  onRemoveFilter,
  onClearAll,
  className,
}: SearchChipsProps) {
  const t = useTranslations("advanced_search");

  const chips: { key: keyof SearchFilters; label: string; value: string }[] = [];

  if (filters.from) {
    chips.push({ key: "from", label: t("from"), value: filters.from });
  }
  if (filters.to) {
    chips.push({ key: "to", label: t("to"), value: filters.to });
  }
  if (filters.subject) {
    chips.push({ key: "subject", label: t("subject"), value: filters.subject });
  }
  if (filters.body) {
    chips.push({ key: "body", label: t("body"), value: filters.body });
  }
  if (filters.hasAttachment !== null) {
    chips.push({
      key: "hasAttachment",
      label: t("has_attachment"),
      value: filters.hasAttachment ? t("yes") : t("no"),
    });
  }
  if (filters.dateAfter) {
    chips.push({ key: "dateAfter", label: t("date_after"), value: filters.dateAfter });
  }
  if (filters.dateBefore) {
    chips.push({ key: "dateBefore", label: t("date_before"), value: filters.dateBefore });
  }
  if (filters.isUnread !== null) {
    chips.push({
      key: "isUnread",
      label: filters.isUnread ? t("unread") : t("read"),
      value: "",
    });
  }
  if (filters.isStarred !== null) {
    chips.push({
      key: "isStarred",
      label: t("starred"),
      value: filters.isStarred ? t("yes") : t("no"),
    });
  }
  if (sizeFilterBytes(filters.minSizeKb) !== null) {
    chips.push({ key: "minSizeKb", label: t("size_min"), value: `${filters.minSizeKb} KB` });
  }
  if (sizeFilterBytes(filters.maxSizeKb) !== null) {
    chips.push({ key: "maxSizeKb", label: t("size_max"), value: `${filters.maxSizeKb} KB` });
  }

  if (chips.length === 0) return null;

  return (
    <div className={cn("px-4 py-2 border-b border-border bg-muted/20 flex items-center gap-2 flex-wrap", className)}>
      {chips.map((chip) => (
        <div key={chip.key} className="inline-flex items-center gap-0.5">
          <Chip variant="soft" color="accent" size="sm">
            <Chip.Label>
              <span className="font-medium">{chip.label}</span>
              {chip.value && (
                <>
                  <span className="opacity-60">:</span>
                  <span className="max-w-24 truncate">{chip.value}</span>
                </>
              )}
            </Chip.Label>
          </Chip>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemoveFilter(chip.key)}
            className="size-5 min-w-5 text-primary"
            aria-label={t("clear_all")}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ))}
      {chips.length > 1 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-7 min-h-7 px-2 text-xs text-muted-foreground"
        >
          {t("clear_all")}
        </Button>
      )}
    </div>
  );
}
