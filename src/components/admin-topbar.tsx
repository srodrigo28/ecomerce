"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const adminNavLinks = [
  { href: "/painel-admin", label: "Painel" },
  { href: "/painel-admin/relatorios", label: "Relatorios" },
  { href: "/painel-lojista", label: "Painel lojista" },
];

export function AdminTopbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color:var(--surface)]/95 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10 2xl:px-12">
        <Link href="/painel-admin" className="flex min-w-0 items-center gap-3 text-slate-900">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">H</span>
          <div className="min-w-0">
            <strong className="block truncate text-lg font-semibold">Painel Admin</strong>
            <span className="block truncate text-sm text-[var(--muted)]">Gestao central da plataforma</span>
          </div>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-3 lg:flex">
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
          <Link href="/" className="rounded-full theme-border-button px-4 py-2 text-sm font-semibold transition">
            Inicio
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white transition hover:bg-slate-700 lg:hidden"
          aria-label="Abrir menu admin"
          aria-expanded={open}
        >
          <span className="text-lg leading-none">{open ? "×" : "≡"}</span>
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
                      ? "bg-[var(--accent)] text-white"
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
