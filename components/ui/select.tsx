"use client";

import { ListBox, Select } from "@heroui/react";
import { Header } from "react-aria-components";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectOptionGroup = {
  label: string;
  options: readonly SelectOption[];
};

function renderOptions(options: readonly SelectOption[]) {
  return options.map((option) => (
    <ListBox.Item key={option.value} id={option.value} textValue={option.label}>
      {option.label}
    </ListBox.Item>
  ));
}

export function AppSelect({
  value,
  onChange,
  options = [],
  groups,
  disabled,
  className,
  placeholder,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "data-testid": dataTestId,
}: {
  value: string;
  onChange: (value: string) => void;
  options?: readonly SelectOption[];
  groups?: readonly SelectOptionGroup[];
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "data-testid"?: string;
}) {
  return (
    <Select
      selectedKey={value || null}
      onSelectionChange={(key) => onChange(key == null ? "" : String(key))}
      isDisabled={disabled}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={cn("w-full", className)}
      fullWidth
      data-testid={dataTestId}
    >
      <Select.Trigger className="h-8 min-h-8 text-sm">
        <Select.Value>
          {({ selectedText, defaultChildren }) =>
            selectedText || placeholder || defaultChildren
          }
        </Select.Value>
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {groups && groups.length > 0
            ? groups.map((group) => (
                <ListBox.Section key={group.label}>
                  <Header className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    {group.label}
                  </Header>
                  {renderOptions(group.options)}
                </ListBox.Section>
              ))
            : renderOptions(options)}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
