"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuthStore } from "@/stores/auth-store";
import type { StoreSummary } from "@/types/catalog";

export function SellerTopbar({ store }: { store: StoreSummary }) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [open, setOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLeaving(true);
      await logout();
      router.push("/login");
      router.refresh();
    } finally {
      setIsLeaving(false);
      setOpen(false);
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[var(--border)] bg-[color:var(--surface)]/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10 2xl:px-12">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Loja logada</p>
          <div className="mt-1 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
              {(store.name || "L").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <strong className="block truncate text-base font-semibold theme-heading">{store.name}</strong>
              <span className="block truncate text-sm text-[var(--muted)]">Vitrine publica de {store.name}</span>
            </div>
          </div>
        </div>

        <nav className="hidden items-center gap-3 lg:flex">
          <Link href="/painel-lojista" className="rounded-full theme-border-button px-4 py-2 text-sm font-semibold transition">Painel</Link>
          <Link href="/painel-lojista/pedidos" className="rounded-full theme-border-button px-4 py-2 text-sm font-semibold transition">Pedidos</Link>
          <div className="relative">
            <button
              type="button"
              onClick={() => setRegisterOpen((current) => !current)}
              className="rounded-full theme-border-button px-4 py-2 text-sm font-semibold transition"
            >
              Cadastrar
            </button>

            {registerOpen ? (
              <div className="absolute left-0 mt-3 w-56 rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow)]">
                <div className="grid gap-2">
                  <Link href="/painel-lojista/produtos" className="rounded-2xl theme-border-button px-4 py-3 text-sm font-semibold transition" onClick={() => setRegisterOpen(false)}>Produtos</Link>
                  <Link href="/painel-lojista/categorias" className="rounded-2xl theme-border-button px-4 py-3 text-sm font-semibold transition" onClick={() => setRegisterOpen(false)}>Categoria</Link>
                </div>
              </div>
            ) : null}
          </div>
          <Link href="/painel-lojista/configuracao" className="rounded-full theme-border-button px-4 py-2 text-sm font-semibold transition">Configuracao</Link>
          <Link href={`/lojas/${store.slug}`} className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]">Abrir vitrine</Link>
        </nav>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Minha loja
          </button>

          {open ? (
            <div className="absolute right-0 mt-3 w-72 rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow)]">
              <div className="rounded-[1.25rem] theme-surface-card p-4">
                <p className="text-sm font-semibold theme-heading">{store.name}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">WhatsApp: {store.whatsapp ?? "Nao configurado"}</p>
                <p className="text-sm text-[var(--muted)]">Pix: {store.pixKey ?? "Nao configurado"}</p>
                <p className="text-sm text-[var(--muted)]">Cidade: {[store.city, store.state].filter(Boolean).join(" - ") || "Nao configurada"}</p>
              </div>
              <div className="mt-3 grid gap-2">
                <Link href="/painel-lojista/configuracao" className="rounded-2xl theme-border-button px-4 py-3 text-sm font-semibold transition" onClick={() => setOpen(false)}>Alterar dados da empresa</Link>
                <Link href={`/lojas/${store.slug}`} className="rounded-2xl theme-border-button px-4 py-3 text-sm font-semibold transition" onClick={() => setOpen(false)}>Abrir vitrine publica</Link>
                <button type="button" onClick={() => void handleLogout()} disabled={isLeaving} className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70">
                  {isLeaving ? "Saindo..." : "Sair"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
