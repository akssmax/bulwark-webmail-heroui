"use client";

import * as React from "react";
import { TextArea as HeroTextArea } from "@heroui/react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, onChange, ...props }, ref) => {
    return (
      <HeroTextArea
        ref={ref}
        className={cn("w-full min-h-[120px]", className)}
        onChange={onChange}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
