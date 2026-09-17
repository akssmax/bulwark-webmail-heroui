"use client";

import { Spinner } from "@heroui/react";
import { cn } from "@/lib/utils";

type LoaderSize = "sm" | "md" | "lg" | "xl";
type LoaderColor = "accent" | "current" | "danger" | "success" | "warning";

export interface LoaderProps {
  size?: LoaderSize;
  color?: LoaderColor;
  className?: string;
  "aria-label"?: string;
}

/** HeroUI Spinner wrapper — use instead of Lucide Loader2 / custom CSS spinners. */
export function Loader({
  size = "md",
  color = "accent",
  className,
  "aria-label": ariaLabel = "Loading",
}: LoaderProps) {
  return (
    <Spinner
      size={size}
      color={color}
      className={cn(className)}
      aria-label={ariaLabel}
    />
  );
}

export function LoaderBlock({
  label,
  size = "lg",
  className,
  labelClassName,
}: {
  label?: string;
  size?: LoaderSize;
  className?: string;
  labelClassName?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center", className)}>
      <Loader size={size} />
      {label ? (
        <p className={cn("mt-4 text-sm text-muted-foreground", labelClassName)}>{label}</p>
      ) : null}
    </div>
  );
}
