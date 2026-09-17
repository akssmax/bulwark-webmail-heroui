"use client";

import * as React from "react";
import { Button as HeroButton } from "@heroui/react";
import type { PressEvent } from "react-aria-components";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  variant?: "default" | "ghost" | "outline" | "destructive" | "secondary";
  size?: "sm" | "md" | "lg" | "icon";
  /** Tooltip label. Icon buttons also inherit `title` or `aria-label` when omitted. Pass `false` to disable. */
  tooltip?: React.ReactNode | false;
  tooltipPlacement?: "top" | "bottom" | "left" | "right";
}

const VARIANT_MAP = {
  default: "primary",
  ghost: "ghost",
  outline: "outline",
  destructive: "danger",
  secondary: "secondary",
} as const;

function bridgeOnClick(onClick?: React.MouseEventHandler<HTMLButtonElement>) {
  if (!onClick) return undefined;
  return (_event: PressEvent) => {
    onClick({
      preventDefault: () => {},
      stopPropagation: () => {},
    } as React.MouseEvent<HTMLButtonElement>);
  };
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      disabled,
      onClick,
      children,
      type = "button",
      title,
      tooltip,
      tooltipPlacement = "bottom",
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const heroSize = size === "icon" ? "sm" : size;
    const tooltipDisabled = tooltip === false;
    const tooltipContent =
      !tooltipDisabled && size === "icon"
        ? (tooltip ?? title ?? ariaLabel)
        : undefined;
    const button = (
      <HeroButton
        ref={ref}
        type={type}
        variant={VARIANT_MAP[variant]}
        size={heroSize}
        isIconOnly={size === "icon"}
        isDisabled={disabled}
        className={cn(className)}
        onPress={bridgeOnClick(onClick)}
        aria-label={ariaLabel ?? (size === "icon" && typeof title === "string" ? title : undefined)}
        {...(props as React.ComponentPropsWithoutRef<typeof HeroButton>)}
      >
        {children}
      </HeroButton>
    );

    if (tooltipContent) {
      return (
        <Tooltip content={tooltipContent} placement={tooltipPlacement}>
          {button}
        </Tooltip>
      );
    }

    return button;
  },
);
Button.displayName = "Button";

export { Button };
