"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { motion } from "motion/react";

type ToolbarItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  exact?: boolean;
};

export function AnimatedIconToolbar({
  items,
  variant = "seller",
}: {
  items: ToolbarItem[];
  variant?: "seller" | "admin";
}) {
  const pathname = usePathname();

  return (
    <div className="hidden items-center gap-2 xl:flex">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const activeClasses =
          variant === "admin"
            ? "border-emerald-400/35 bg-emerald-400/14 text-emerald-200 shadow-[0_18px_45px_rgba(16,185,129,0.18)]"
            : "border-[rgba(var(--accent-rgb),0.28)] bg-[rgba(var(--accent-rgb),0.14)] text-[var(--foreground)] shadow-[0_18px_45px_rgba(var(--accent-rgb),0.16)]";

        return (
          <motion.div
            key={item.href}
            className="group relative"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
          >
            <Link
              href={item.href}
              aria-label={item.label}
              className={`panel-icon-button ${active ? activeClasses : "border-[var(--border)] bg-[color:var(--surface)] text-[var(--muted)] hover:-translate-y-1 hover:border-[rgba(var(--accent-rgb),0.22)] hover:text-[var(--foreground)]"}`}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span className={`panel-icon-dot ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
            </Link>
            <span className="panel-tooltip">
              {item.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
