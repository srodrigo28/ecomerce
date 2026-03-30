import type { ReactNode } from "react";

const badgeVariants = {
  neutral: "theme-badge-neutral",
  success: "theme-badge-success",
  warning: "theme-badge-warning",
  danger: "theme-badge-danger",
  info: "theme-badge-info",
  indigo: "theme-badge-indigo",
  accent: "bg-[var(--accent)] text-white",
} as const;

type BadgeVariant = keyof typeof badgeVariants;

export function Badge({
  children,
  className = "",
  variant = "neutral",
}: {
  children: ReactNode;
  className?: string;
  variant?: BadgeVariant;
}) {
  const classes = [
    "rounded-full px-3 py-1 text-xs font-semibold",
    badgeVariants[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <span className={classes}>{children}</span>;
}
