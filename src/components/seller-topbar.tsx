"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ComponentType } from "react";
import { FiArchive, FiBarChart2, FiExternalLink, FiGrid, FiHome, FiLogOut, FiPackage, FiPlusCircle, FiSettings, FiShoppingBag, FiTag } from "react-icons/fi";

import { useAuthStore } from "@/stores/auth-store";
import type { StoreSummary } from "@/types/catalog";

type MobileMenuLink = {
  href: string;
  label: string;
  hint: string;
  icon: ComponentType<{ className?: string }>;
};

const mobileMenuLinks: MobileMenuLink[] = [
  { href: "/painel-lojista/produtos/novo", label: "Cadastrar produto", hint: "Foto, categoria e estoque", icon: FiPlusCircle },
  { href: "/painel-lojista/categorias", label: "Cadastrar categoria", hint: "Imagem, nome e descricao", icon: FiTag },
  { href: "/painel-lojista", label: "Painel", hint: "Resumo da loja", icon: FiHome },
  { href: "/painel-lojista/produtos", label: "Produtos", hint: "Catalogo cadastrado", icon: FiPackage },
  { href: "/painel-lojista/pedidos", label: "Pedidos", hint: "Acompanhar vendas", icon: FiShoppingBag },
  { href: "/painel-lojista/estoque", label: "Estoque", hint: "Quantidades e alertas", icon: FiArchive },
  { href: "/painel-lojista/relatorios", label: "Relatorios", hint: "Resultados da loja", icon: FiBarChart2 },
  { href: "/painel-lojista/configuracao", label: "Configuracao", hint: "Dados da empresa", icon: FiSettings },
];

export function SellerTopbar({ store }: { store: StoreSummary }) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [open, setOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const closeMenus = () => {
    setOpen(false);
    setRegisterOpen(false);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      setIsLeaving(true);
      await logout();
      router.push("/login");
      router.refresh();
    } finally {
      setIsLeaving(false);
      closeMenus();
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
                  <Link href="/painel-lojista/produtos/novo" className="rounded-2xl theme-border-button px-4 py-3 text-sm font-semibold transition" onClick={() => setRegisterOpen(false)}>Novo produto</Link>
                  <Link href="/painel-lojista/produtos" className="rounded-2xl theme-border-button px-4 py-3 text-sm font-semibold transition" onClick={() => setRegisterOpen(false)}>Produtos</Link>
                  <Link href="/painel-lojista/categorias" className="rounded-2xl theme-border-button px-4 py-3 text-sm font-semibold transition" onClick={() => setRegisterOpen(false)}>Categoria</Link>
                </div>
              </div>
            ) : null}
          </div>
          <Link href="/painel-lojista/configuracao" className="rounded-full theme-border-button px-4 py-2 text-sm font-semibold transition">Configuracao</Link>
          <Link href={`/lojas/${store.slug}`} className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]">Abrir vitrine</Link>
        </nav>

        <div className="relative hidden lg:block">
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

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 lg:hidden"
          aria-expanded={mobileMenuOpen}
          aria-controls="seller-mobile-menu"
        >
          <span className="grid gap-1" aria-hidden="true">
            <span className="block h-0.5 w-4 rounded-full bg-white" />
            <span className="block h-0.5 w-4 rounded-full bg-white" />
            <span className="block h-0.5 w-4 rounded-full bg-white" />
          </span>
          Menu
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu do painel lojista">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/55"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Fechar menu"
          />
          <aside id="seller-mobile-menu" className="absolute right-0 top-0 flex h-dvh w-[min(92vw,390px)] flex-col overflow-y-auto border-l border-white/10 bg-[var(--surface)] p-4 shadow-[0_24px_80px_rgba(15,23,42,0.32)]">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Menu da loja</p>
                <h2 className="mt-2 truncate text-2xl font-semibold theme-heading">{store.name}</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">Acoes rapidas para cadastrar e vender.</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-lg font-semibold text-rose-600 transition hover:bg-rose-100"
                aria-label="Fechar menu"
                title="Fechar"
              >
                X
              </button>
            </div>

            <nav className="mt-5 grid gap-2" aria-label="Menu mobile do lojista">
              {mobileMenuLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenus}
                    className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-left transition hover:border-[var(--accent)] hover:bg-slate-50"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-slate-950">{item.label}</span>
                      <span className="mt-0.5 block truncate text-xs text-[var(--muted)]">{item.hint}</span>
                    </span>
                  </Link>
                );
              })}

              <Link
                href={`/lojas/${store.slug}`}
                onClick={closeMenus}
                className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-left transition hover:border-[var(--accent)] hover:bg-slate-50"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[var(--accent)]">
                  <FiExternalLink className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-950">Abrir vitrine publica</span>
                  <span className="mt-0.5 block truncate text-xs text-[var(--muted)]">Ver loja como cliente</span>
                </span>
              </Link>
            </nav>

            <div className="mt-5 rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
                  <FiGrid className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold theme-heading">Dados da loja</p>
                  <p className="mt-0.5 truncate text-xs text-[var(--muted)]">{[store.city, store.state].filter(Boolean).join(" - ") || "Cidade nao configurada"}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-sm text-[var(--muted)]">
                <p>WhatsApp: {store.whatsapp ?? "Nao configurado"}</p>
                <p>Pix: {store.pixKey ?? "Nao configurado"}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={isLeaving}
              className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-left text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-rose-700">
                <FiLogOut className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{isLeaving ? "Saindo..." : "Sair"}</span>
                <span className="mt-0.5 block text-xs text-rose-700/70">Encerrar sessao da loja</span>
              </span>
            </button>
          </aside>
        </div>
      ) : null}
    </header>
  );
}



