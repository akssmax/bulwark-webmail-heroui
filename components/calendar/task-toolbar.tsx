"use client";

import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { TaskViewFilter } from "@/stores/task-store";

interface TaskToolbarProps {
  filter: TaskViewFilter;
  showCompleted: boolean;
  onFilterChange: (filter: TaskViewFilter) => void;
  onShowCompletedChange: (show: boolean) => void;
  onCreateTask: () => void;
}

const FILTERS: TaskViewFilter[] = ["all", "pending", "completed", "overdue"];

export function TaskToolbar({
  filter,
  showCompleted,
  onFilterChange,
  onShowCompletedChange,
  onCreateTask,
}: TaskToolbarProps) {
  const t = useTranslations("calendar");

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border flex-wrap">
      <div className="flex border border-border rounded-md overflow-hidden">
        {FILTERS.map((f) => (
          <Button
            key={f}
            type="button"
            size="sm"
            variant={f === filter ? "default" : "ghost"}
            onClick={() => onFilterChange(f)}
            className={cn(
              "rounded-none px-3 py-1.5 text-xs font-medium h-auto",
              f !== filter && "text-muted-foreground hover:bg-muted"
            )}
          >
            {t(`tasks.filter_${f}`)}
          </Button>
        ))}
      </div>

      <Checkbox
        isSelected={showCompleted}
        onChange={onShowCompletedChange}
        className="text-xs text-muted-foreground ms-2"
      >
        {t("tasks.show_completed")}
      </Checkbox>

      <div className="flex-1" />

      <Button size="sm" onClick={onCreateTask}>
        <Plus className="w-4 h-4 me-1" />
        {t("tasks.create")}
      </Button>
    </div>
  );
}
