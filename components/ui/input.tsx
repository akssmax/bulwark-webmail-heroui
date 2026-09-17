"use client";

import * as React from "react";
import { Input as HeroInput } from "@heroui/react";
import { cn } from "@/lib/utils";
import {
  DatePickerField,
  DateTimePickerField,
  TimePickerField,
} from "@/components/ui/date-picker";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    if (type === "date") {
      return (
        <DatePickerField
          className={className}
          value={typeof props.value === "string" ? props.value : undefined}
          onChange={props.onChange}
          isDisabled={props.disabled}
          name={props.name}
          aria-label={props["aria-label"]}
        />
      );
    }
    if (type === "time") {
      return (
        <TimePickerField
          className={className}
          value={typeof props.value === "string" ? props.value : undefined}
          onChange={props.onChange}
          isDisabled={props.disabled}
          name={props.name}
          aria-label={props["aria-label"]}
        />
      );
    }
    if (type === "datetime-local") {
      return (
        <DateTimePickerField
          className={className}
          value={typeof props.value === "string" ? props.value : undefined}
          onChange={props.onChange}
          isDisabled={props.disabled}
          name={props.name}
          aria-label={props["aria-label"]}
        />
      );
    }

    return (
      <HeroInput
        ref={ref}
        type={type}
        className={cn("w-full", className)}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
