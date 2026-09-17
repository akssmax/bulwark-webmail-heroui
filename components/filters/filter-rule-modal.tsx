"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppSelect } from "@/components/ui/select";
import { AppModal } from "@/components/ui/modal";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "@/stores/toast-store";
import type {
  FilterRule,
  FilterCondition,
  FilterAction,
  FilterConditionField,
  FilterComparator,
  FilterActionType,
} from "@/lib/jmap/sieve-types";
import type { Mailbox } from "@/lib/jmap/types";
import { buildMailboxTree, flattenMailboxTree, type MailboxNode, generateUUID } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settings-store";
import { useKeywordFormat } from "@/hooks/use-keyword-format";

interface FilterRuleModalProps {
  rule?: FilterRule;
  mailboxes: Mailbox[];
  onSave: (rule: FilterRule) => void;
  onClose: () => void;
}

const ALL_FIELDS: FilterConditionField[] = [
  "from", "to", "cc", "subject", "header", "size", "body", "attachment",
];

const TEXT_COMPARATORS: FilterComparator[] = [
  "contains", "not_contains", "is", "not_is", "starts_with", "ends_with", "matches",
];

const SIZE_COMPARATORS: FilterComparator[] = ["greater_than", "less_than"];

const ATTACHMENT_COMPARATORS: FilterComparator[] = ["has_any", "has_type"];

function comparatorsFor(field: FilterConditionField): FilterComparator[] {
  if (field === "size") return SIZE_COMPARATORS;
  if (field === "attachment") return ATTACHMENT_COMPARATORS;
  return TEXT_COMPARATORS;
}

const ALL_ACTION_TYPES: FilterActionType[] = [
  "move", "copy", "forward", "mark_read", "star", "add_label", "discard", "reject", "keep", "stop",
];

const ACTIONS_WITH_VALUE = new Set<FilterActionType>(["move", "copy", "forward", "reject", "add_label"]);
const ACTIONS_WITH_MAILBOX = new Set<FilterActionType>(["move", "copy"]);

function makeEmptyCondition(): FilterCondition {
  return { field: "from", comparator: "contains", value: "" };
}

function valueToInputString(v: string | string[]): string {
  if (Array.isArray(v)) return v.join(", ");
  return v;
}

function inputStringToValue(s: string): string | string[] {
  const parts = s.split(",").map((p) => p.trim()).filter((p) => p.length > 0);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  return parts;
}

function isConditionValueEmpty(v: string | string[]): boolean {
  if (Array.isArray(v)) return v.length === 0 || v.every((x) => !x.trim());
  return !v.trim();
}

function makeEmptyAction(): FilterAction {
  return { type: "move", value: "" };
}

export function FilterRuleModal({
  rule,
  mailboxes,
  onSave,
  onClose,
}: FilterRuleModalProps) {
  const t = useTranslations("settings.filters");
  const isEdit = !!rule;
  const emailKeywords = useSettingsStore((state) => state.emailKeywords);
  const { tagName } = useKeywordFormat();

  const [name, setName] = useState(rule?.name || "");
  const [matchType, setMatchType] = useState<"all" | "any">(rule?.matchType || "all");
  const [conditions, setConditions] = useState<FilterCondition[]>(
    rule?.conditions.length ? [...rule.conditions] : [makeEmptyCondition()]
  );
  const [actions, setActions] = useState<FilterAction[]>(
    rule?.actions.length ? [...rule.actions] : [makeEmptyAction()]
  );
  const [stopProcessing, setStopProcessing] = useState(rule?.stopProcessing ?? false);

  const { hierarchicalMailboxes, mailboxPathMap } = useMemo(() => {
    const tree = buildMailboxTree(mailboxes.filter((mb) => !mb.isShared));
    const pathMap = new Map<string, string>();
    const buildPaths = (nodes: MailboxNode[], parentPath = "") => {
      for (const node of nodes) {
        const segment = node.role === "inbox" ? "INBOX" : node.name;
        const fullPath = parentPath ? `${parentPath}/${segment}` : segment;
        pathMap.set(node.id, fullPath);
        if (node.children.length > 0) buildPaths(node.children, fullPath);
      }
    };
    buildPaths(tree);
    return { hierarchicalMailboxes: flattenMailboxTree(tree), mailboxPathMap: pathMap };
  }, [mailboxes]);

  const fieldOptions = ALL_FIELDS.map((f) => ({
    value: f,
    label: t(`condition_fields.${f}`),
  }));

  const actionTypeOptions = ALL_ACTION_TYPES.map((a) => ({
    value: a,
    label: t(`action_types.${a}`),
  }));

  const mailboxOptions = [
    { value: "", label: t("move_to_folder") },
    ...hierarchicalMailboxes.map((mb) => ({
      value: mailboxPathMap.get(mb.id) || mb.name,
      label: `${"\u00A0".repeat(mb.depth * 3)}${mb.name}`,
    })),
  ];

  const labelOptions = [
    { value: "", label: t("label_placeholder") },
    ...emailKeywords.map((kw) => ({ value: kw.id, label: tagName(kw.id) })),
  ];

  const handleSave = useCallback(() => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error(t("validation_empty_name"));
      return;
    }

    const validConditions = conditions
      .filter((c) => {
        if (c.field === "attachment" && c.comparator === "has_any") return true;
        return !isConditionValueEmpty(c.value);
      })
      .map((c) => {
        if (c.field === "attachment" && c.comparator === "has_any") return c;
        if (c.field === "size") return c;
        if (typeof c.value !== "string") return c;
        const parsed = inputStringToValue(c.value);
        return { ...c, value: parsed };
      });
    if (validConditions.length === 0) {
      toast.error(t("validation_empty_conditions"));
      return;
    }

    const validActions = actions.filter(
      (a) => !ACTIONS_WITH_VALUE.has(a.type) || a.value?.trim()
    );
    if (validActions.length === 0) {
      toast.error(t("validation_empty_actions"));
      return;
    }

    onSave({
      id: rule?.id || generateUUID(),
      name: trimmedName,
      enabled: rule?.enabled ?? true,
      matchType,
      conditions: validConditions,
      actions: validActions,
      stopProcessing,
    });
  }, [name, matchType, conditions, actions, stopProcessing, rule, onSave, t]);

  const updateCondition = (index: number, updates: Partial<FilterCondition>) => {
    setConditions((prev) =>
      prev.map((c, i) => {
        if (i !== index) return c;
        const updated = { ...c, ...updates };
        if (updates.field && updates.field !== c.field) {
          const allowed = comparatorsFor(updates.field);
          if (!allowed.includes(c.comparator)) {
            updated.comparator = allowed[0];
          }
        }
        if (updates.field && updates.field !== "header") {
          delete updated.headerName;
        }
        if (updated.field === "attachment" && updated.comparator === "has_any") {
          updated.value = "";
        }
        if (updated.field === "size" && Array.isArray(updated.value)) {
          updated.value = updated.value[0] ?? "";
        }
        return updated;
      })
    );
  };

  const removeCondition = (index: number) => {
    if (conditions.length <= 1) return;
    setConditions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAction = (index: number, updates: Partial<FilterAction>) => {
    setActions((prev) =>
      prev.map((a, i) => {
        if (i !== index) return a;
        const updated = { ...a, ...updates };
        if (updates.type && !ACTIONS_WITH_VALUE.has(updates.type)) {
          delete updated.value;
        }
        if (updates.type && ACTIONS_WITH_MAILBOX.has(updates.type) && !updated.value) {
          const firstMb = hierarchicalMailboxes[0];
          updated.value = firstMb ? (mailboxPathMap.get(firstMb.id) || firstMb.name) : "";
        }
        return updated;
      })
    );
  };

  const removeAction = (index: number) => {
    if (actions.length <= 1) return;
    setActions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <AppModal
      isOpen
      onClose={onClose}
      size="lg"
      className="max-w-2xl max-h-[90vh]"
      title={isEdit ? t("edit_rule") : t("new_rule")}
      bodyClassName="px-6 py-4 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]"
      footer={(
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {t("save")}
          </Button>
        </div>
      )}
    >
      <div>
        <label className="text-sm font-medium mb-1 block text-foreground">
          {t("rule_name")}
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("rule_name_placeholder")}
          maxLength={200}
          autoFocus
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block text-foreground">
          {t("match_type")}
        </label>
        <div className="flex gap-2">
          {(["all", "any"] as const).map((type) => (
            <Button
              key={type}
              type="button"
              size="sm"
              variant={matchType === type ? "default" : "outline"}
              className="text-xs"
              onClick={() => setMatchType(type)}
            >
              {t(type === "all" ? "match_all" : "match_any")}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block text-foreground">
          {t("conditions")}
        </label>
        <div className="space-y-2">
          {conditions.map((condition, index) => (
            <div key={index} className="flex items-center gap-2 flex-wrap">
              <AppSelect
                value={condition.field}
                onChange={(v) =>
                  updateCondition(index, { field: v as FilterConditionField })
                }
                options={fieldOptions}
                aria-label={t("conditions")}
                className="w-auto min-w-[120px]"
              />

              {condition.field === "header" && (
                <Input
                  value={condition.headerName || ""}
                  onChange={(e) =>
                    updateCondition(index, { headerName: e.target.value })
                  }
                  placeholder={t("header_name")}
                  className="w-28"
                />
              )}

              <AppSelect
                value={condition.comparator}
                onChange={(v) =>
                  updateCondition(index, { comparator: v as FilterComparator })
                }
                options={comparatorsFor(condition.field).map((c) => ({
                  value: c,
                  label: t(`comparators.${c}`),
                }))}
                aria-label={t("comparators.contains")}
                className="w-auto min-w-[120px]"
              />

              {condition.field === "attachment" && condition.comparator === "has_any" ? (
                <div className="flex-1 min-w-[120px]" />
              ) : (
                <Input
                  value={valueToInputString(condition.value)}
                  onChange={(e) =>
                    updateCondition(index, { value: e.target.value })
                  }
                  onBlur={(e) => {
                    if (condition.field === "size") return;
                    if (
                      condition.field === "attachment" &&
                      condition.comparator === "has_any"
                    )
                      return;
                    const parsed = inputStringToValue(e.target.value);
                    if (
                      JSON.stringify(parsed) !== JSON.stringify(condition.value)
                    ) {
                      updateCondition(index, { value: parsed });
                    }
                  }}
                  placeholder={
                    condition.field === "size"
                      ? t("size_placeholder")
                      : condition.field === "attachment"
                        ? t("attachment_type_placeholder")
                        : t("value_placeholder_multi")
                  }
                  className="flex-1 min-w-[120px]"
                  type={condition.field === "size" ? "number" : "text"}
                />
              )}

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeCondition(index)}
                disabled={conditions.length <= 1}
                className="text-muted-foreground hover:text-destructive disabled:opacity-30"
                aria-label={t("delete_rule")}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setConditions((prev) => [...prev, makeEmptyCondition()])}
          className="mt-2 gap-1 text-primary h-auto p-0 hover:underline"
        >
          <Plus className="w-3.5 h-3.5" />
          {t("add_condition")}
        </Button>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block text-foreground">
          {t("actions")}
        </label>
        <div className="space-y-2">
          {actions.map((action, index) => (
            <div key={index} className="flex items-center gap-2 flex-wrap">
              <AppSelect
                value={action.type}
                onChange={(v) =>
                  updateAction(index, { type: v as FilterActionType })
                }
                options={actionTypeOptions}
                aria-label={t("actions")}
                className="w-auto min-w-[120px]"
              />

              {ACTIONS_WITH_MAILBOX.has(action.type) && (
                <AppSelect
                  value={action.value || ""}
                  onChange={(v) => updateAction(index, { value: v })}
                  options={mailboxOptions}
                  aria-label={t("move_to_folder")}
                  className="flex-1 min-w-[140px]"
                />
              )}

              {action.type === "forward" && (
                <Input
                  value={action.value || ""}
                  onChange={(e) => updateAction(index, { value: e.target.value })}
                  placeholder={t("forward_placeholder")}
                  type="email"
                  className="flex-1 min-w-[180px]"
                />
              )}

              {action.type === "reject" && (
                <Input
                  value={action.value || ""}
                  onChange={(e) => updateAction(index, { value: e.target.value })}
                  placeholder={t("reject_placeholder")}
                  className="flex-1 min-w-[180px]"
                />
              )}

              {action.type === "add_label" && (
                <AppSelect
                  value={action.value || ""}
                  onChange={(v) => updateAction(index, { value: v })}
                  options={labelOptions}
                  aria-label={t("label_placeholder")}
                  className="flex-1 min-w-[140px]"
                />
              )}

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeAction(index)}
                disabled={actions.length <= 1}
                className="text-muted-foreground hover:text-destructive disabled:opacity-30"
                aria-label={t("delete_rule")}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setActions((prev) => [...prev, makeEmptyAction()])}
          className="mt-2 gap-1 text-primary h-auto p-0 hover:underline"
        >
          <Plus className="w-3.5 h-3.5" />
          {t("add_action")}
        </Button>
      </div>

      <Checkbox isSelected={stopProcessing} onChange={setStopProcessing} className="text-sm text-foreground">
        {t("stop_processing")}
      </Checkbox>
    </AppModal>
  );
}
