"use client";

import { useState, type ComponentProps } from "react";
import { InputGroup, TextField } from "@heroui/react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type GroupInputProps = ComponentProps<typeof InputGroup.Input>;

export function PasswordField({
  value,
  onChange,
  placeholder,
  "aria-label": ariaLabel,
  className,
  inputClassName,
  disabled,
  showLock = false,
  revealLabel,
  hideLabel,
  ...inputProps
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  "aria-label"?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  showLock?: boolean;
  revealLabel?: string;
  hideLabel?: string;
} & Omit<GroupInputProps, "value" | "onChange" | "className" | "placeholder" | "disabled" | "type">) {
  const [revealed, setRevealed] = useState(false);

  return (
    <TextField
      aria-label={ariaLabel}
      value={value}
      onChange={onChange}
      isDisabled={disabled}
      className={cn("w-full", className)}
    >
      <InputGroup fullWidth>
        {showLock ? (
          <InputGroup.Prefix>
            <Lock className="size-3.5 text-muted" />
          </InputGroup.Prefix>
        ) : null}
        <InputGroup.Input
          type={revealed ? "text" : "password"}
          placeholder={placeholder}
          className={inputClassName}
          {...inputProps}
        />
        <InputGroup.Suffix className="pe-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setRevealed((open) => !open)}
            aria-label={revealed ? (hideLabel ?? "Hide password") : (revealLabel ?? "Show password")}
            tabIndex={-1}
          >
            {revealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          </Button>
        </InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}
