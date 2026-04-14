import type { ElementType, ReactNode } from "react";

const buttonVariants = {
  primary: "theme-primary-cta",
  secondary: "theme-border-button",
  dark: "theme-dark-cta",
} as const;

const buttonSizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-3 text-sm",
} as const;

type ButtonVariant = keyof typeof buttonVariants;
type ButtonSize = keyof typeof buttonSizes;

type BaseProps = {
  children: ReactNode;
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

type ButtonProps<C extends ElementType> = BaseProps & {
  as?: C;
} & Omit<React.ComponentPropsWithoutRef<C>, keyof BaseProps | "as">;

export function Button<C extends ElementType = "button">({
  as,
  children,
  className = "",
  size = "md",
  variant = "primary",
  ...props
}: ButtonProps<C>) {
  const Component = as ?? "button";
  const classes = [
    "rounded-full font-semibold transition",
    buttonSizes[size],
    buttonVariants[variant],
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
