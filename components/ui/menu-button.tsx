"use client";

import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Menu row styled as a full-width ghost button (dropdown / overflow menus). */
export const MenuButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function MenuButton({ className, children, ...props }, ref) {
    return (
      <Button
        ref={ref}
        variant="ghost"
        role="menuitem"
        className={cn(
          "h-auto min-h-0 w-full justify-start gap-2 rounded-none px-3 py-1.5 text-sm font-normal text-foreground hover:bg-muted",
          className,
        )}
        {...props}
      >
        {children}
      </Button>
    );
  },
);
MenuButton.displayName = "MenuButton";
