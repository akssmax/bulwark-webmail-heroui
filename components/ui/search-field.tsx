"use client";

import type { ComponentProps } from "react";
import { InputGroup, TextField } from "@heroui/react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type GroupInputProps = ComponentProps<typeof InputGroup.Input>;

export function SearchField({
  value,
  onChange,
  onClear,
  placeholder,
  clearLabel,
  "aria-label": ariaLabel,
  className,
  inputClassName,
  disabled,
  ...inputProps
}: {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  clearLabel?: string;
  "aria-label": string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
} & Omit<GroupInputProps, "value" | "onChange" | "className" | "placeholder" | "disabled">) {
  return (
    <TextField
      aria-label={ariaLabel}
      value={value}
      onChange={onChange}
      isDisabled={disabled}
      className={cn("w-full", className)}
    >
      <InputGroup fullWidth>
        <InputGroup.Prefix>
          <Search className="size-3.5 text-muted" />
        </InputGroup.Prefix>
        <InputGroup.Input
          placeholder={placeholder}
          className={inputClassName}
          {...inputProps}
        />
        {value && onClear ? (
          <InputGroup.Suffix className="pe-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClear}
              aria-label={clearLabel ?? "Clear search"}
            >
              <X className="size-3.5" />
            </Button>
          </InputGroup.Suffix>
        ) : null}
      </InputGroup>
    </TextField>
  );
}
