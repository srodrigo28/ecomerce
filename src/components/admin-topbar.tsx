"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiBarChart2, FiGrid, FiHome, FiMenu, FiSettings, FiUsers } from "react-icons/fi";

import { AnimatedIconToolbar } from "@/components/animated-icon-toolbar";

const adminNavLinks = [
  { href: "/painel-admin", label: "Painel", icon: FiGrid },
  { href: "/painel-admin/lojistas", label: "Gerenciar lojistas", icon: FiUsers },
  { href: "/painel-admin/relatorios", label: "Relatorios", icon: FiBarChart2 },
  { href: "/painel-lojista", label: "Painel lojista", icon: FiSettings },
];

export function AdminTopbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="panel-topbar-glow sticky top-0 z-40 mb-6 border-b border-[var(--border)] bg-[color:var(--surface)]/86 backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8 2xl:px-10">
        <Link href="/painel-admin" className="flex min-w-0 items-center gap-3 text-slate-900">
          <span className="flex h-12 w-12 items-center justify-center rounded-[1.15rem] bg-[linear-gradient(135deg,#10b981_0%,#14b8a6_52%,#34d399_100%)] text-sm font-semibold text-white shadow-[0_18px_38px_rgba(16,185,129,0.24)]">A</span>
          <div className="min-w-0">
            <strong className="block truncate text-lg font-semibold">Painel Admin</strong>
            <span className="block truncate text-sm text-[var(--muted)]">Gestao central da plataforma</span>
          </div>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-3 xl:flex">
          {adminNavLinks.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-[var(--accent)] text-white shadow-[0_10px_24px_rgba(37,99,235,0.18)]"
                    : "theme-border-button"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <AnimatedIconToolbar
            items={[
              { href: "/painel-admin", label: "Dashboard", icon: FiGrid, exact: true },
              { href: "/painel-admin/lojistas", label: "Lojistas", icon: FiUsers },
              { href: "/painel-admin/relatorios", label: "Relatorios", icon: FiBarChart2 },
              { href: "/", label: "Inicio", icon: FiHome, exact: true },
            ]}
            variant="admin"
          />
          <Link href="/" className="rounded-full theme-border-button px-4 py-2 text-sm font-semibold transition">
            Inicio
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="inline-flex h-12 w-12 items-center justify-center rounded-[1.1rem] bg-slate-900 text-white transition hover:bg-slate-700 lg:hidden"
          aria-label="Abrir menu admin"
          aria-expanded={open}
        >
          <span className="text-lg leading-none">{open ? "×" : <FiMenu className="h-5 w-5" />}</span>
        </button>
      </div>

      {open ? (
        <div className="border-t border-[var(--border)] bg-[color:var(--surface)]/98 px-4 py-4 shadow-[var(--shadow-soft)] lg:hidden">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-2">
            {adminNavLinks.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-emerald-500 text-white"
                      : "theme-border-button"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="rounded-2xl theme-border-button px-4 py-3 text-sm font-semibold transition"
            >
              Voltar para inicio
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
