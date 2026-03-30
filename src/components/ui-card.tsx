import type { ElementType, ReactNode } from "react";

const cardVariants = {
  surface: "theme-surface-card",
  soft: "theme-surface-soft",
  glass: "bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)]",
} as const;

type CardVariant = keyof typeof cardVariants;

type CardProps<C extends ElementType> = {
  as?: C;
  children: ReactNode;
  className?: string;
  variant?: CardVariant;
} & Omit<React.ComponentPropsWithoutRef<C>, "as" | "children" | "className">;

export function Card<C extends ElementType = "article">({
  as,
  children,
  className = "",
  variant = "surface",
  ...props
}: CardProps<C>) {
  const Component = as ?? "article";
  const classes = [
    "rounded-[1.75rem]",
    cardVariants[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
