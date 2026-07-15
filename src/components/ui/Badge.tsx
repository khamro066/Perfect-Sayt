import { HTMLAttributes } from "react";
import clsx from "clsx";

type Variant = "accent" | "danger" | "warning" | "success" | "preorder" | "neutral";

const variantClasses: Record<Variant, string> = {
  accent: "bg-accent-soft text-accent",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
  success: "bg-success-soft text-success",
  preorder: "bg-preorder-bg text-preorder-ink",
  neutral: "bg-line/60 text-muted",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-semibold",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
