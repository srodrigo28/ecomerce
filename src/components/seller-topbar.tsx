"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  FiArchive,
  FiBarChart2,
  FiBell,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiGrid,
  FiHome,
  FiLogOut,
  FiMenu,
  FiPackage,
  FiPlusCircle,
  FiSearch,
  FiSettings,
  FiShoppingBag,
  FiTag,
  FiUser,
} from "react-icons/fi";

import { AnimatedIconToolbar } from "@/components/animated-icon-toolbar";
import { useAuthStore } from "@/stores/auth-store";
import type { StoreSummary } from "@/types/catalog";

type NavLink = {
  href: string;
  label: string;
  hint: string;
  icon: ComponentType<{ className?: string }>;
  exact?: boolean;
  excludeStartsWith?: string[];
};

const sellerMenuLinks: NavLink[] = [
  { href: "/painel-lojista", label: "Painel", hint: "Resumo da loja", icon: FiHome, exact: true },
  { href: "/painel-lojista/produtos/novo", label: "Cadastrar produto", hint: "Foto, categoria e estoque", icon: FiPlusCircle, exact: true },
  { href: "/painel-lojista/produtos", label: "Produtos", hint: "Catalogo cadastrado", icon: FiPackage, excludeStartsWith: ["/painel-lojista/produtos/novo"] },
  { href: "/painel-lojista/categorias", label: "Categorias", hint: "Imagem, nome e descricao", icon: FiTag },
  { href: "/painel-lojista/pedidos", label: "Pedidos", hint: "Acompanhar vendas", icon: FiShoppingBag },
  { href: "/painel-lojista/estoque", label: "Estoque", hint: "Quantidades e alertas", icon: FiArchive },
  { href: "/painel-lojista/relatorios", label: "Relatorios", hint: "Resultados da loja", icon: FiBarChart2 },
  { href: "/painel-lojista/configuracao", label: "Configuracao", hint: "Dados da empresa", icon: FiSettings },
];

const toolbarItems = [
  { href: "/painel-lojista", label: "Resumo", icon: FiGrid, exact: true },
  { href: "/painel-lojista/produtos", label: "Produtos", icon: FiPackage },
  { href: "/painel-lojista/pedidos", label: "Pedidos", icon: FiShoppingBag },
  { href: "/painel-lojista/configuracao", label: "Configuracao", icon: FiSettings },
];

const sectionTitles: Array<{ match: string; title: string; subtitle: string }> = [
  { match: "/painel-lojista/produtos/novo", title: "Novo produto", subtitle: "Cadastre itens com imagens, variantes e estoque." },
  { match: "/painel-lojista/produtos", title: "Produtos", subtitle: "Organize seu catalogo e edite itens ja cadastrados." },
  { match: "/painel-lojista/categorias", title: "Categorias", subtitle: "Agrupe a vitrine e destaque as colecoes principais." },
  { match: "/painel-lojista/pedidos", title: "Pedidos", subtitle: "Acompanhe o fluxo comercial da loja em tempo real." },
  { match: "/painel-lojista/estoque", title: "Estoque", subtitle: "Revise saldos, alertas e movimentacoes operacionais." },
  { match: "/painel-lojista/relatorios", title: "Relatorios", subtitle: "Enxergue performance, receita e categorias." },
  { match: "/painel-lojista/configuracao", title: "Configuracao", subtitle: "Atualize dados, endereco e apresentacao da loja." },
  { match: "/painel-lojista", title: "Painel da loja", subtitle: "Visao central com atalhos, status e acoes rapidas." },
];

export function SellerTopbar({ store }: { store: StoreSummary }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const currentSection = sectionTitles.find((item) => pathname === item.match || pathname.startsWith(`${item.match}/`)) ?? sectionTitles[sectionTitles.length - 1];

  useEffect(() => {
    const savedState = window.localStorage.getItem("seller-sidebar-collapsed");
    const nextCollapsed = savedState === "true";
    setIsCollapsed(nextCollapsed);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--seller-sidebar-width", isCollapsed ? "6rem" : "16rem");
    window.localStorage.setItem("seller-sidebar-collapsed", String(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);
  useEffect(() => {
    setOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const closeMenus = () => {
    setOpen(false);
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
    <>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 96 : 256 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className={`fixed inset-y-0 left-0 z-50 hidden border-r border-white/8 bg-[linear-gradient(180deg,#0f172a_0%,#121b31_52%,#17223a_100%)] text-slate-100 shadow-[0_30px_80px_rgba(15,23,42,0.42)] transition-[width] duration-300 lg:flex ${isCollapsed ? "w-24" : "w-64"}`}
      >
        <div className="flex w-full flex-col">
          <div className={`border-b border-white/8 px-3 py-4 ${isCollapsed ? "flex flex-col items-center gap-3" : "flex items-center gap-3"}`}>
            <div className={`flex ${isCollapsed ? "w-full justify-center" : "min-w-0 flex-1 items-center gap-3"}`}>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.4rem] bg-[linear-gradient(135deg,#22c55e_0%,#14b8a6_52%,#38bdf8_100%)] text-base font-black text-white shadow-[0_18px_38px_rgba(34,197,94,0.28)]">
                {(store.name || "L").slice(0, 1).toUpperCase()}
              </div>
              {!isCollapsed ? (
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-emerald-300/80">Minha loja</p>
                  <strong className="mt-1 block truncate text-lg font-semibold text-white">{store.name}</strong>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setIsCollapsed((current) => !current)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-slate-100 transition hover:bg-white/10"
              title={isCollapsed ? "Expandir menu" : "Colapsar menu"}
              aria-label={isCollapsed ? "Expandir menu lateral" : "Colapsar menu lateral"}
            >
              {isCollapsed ? <FiChevronRight className="h-5 w-5" /> : <FiChevronLeft className="h-5 w-5" />}
            </button>
          </div>

          <nav className="flex-1 px-3 py-4">
            <div className="grid gap-2">
              {sellerMenuLinks.map((item) => {
                const Icon = item.icon;
                const isExcluded = item.excludeStartsWith?.some((prefix) => pathname.startsWith(prefix)) ?? false;
                const active = item.exact
                  ? pathname === item.href
                  : !isExcluded && (pathname === item.href || pathname.startsWith(`${item.href}/`));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 overflow-hidden rounded-[1.25rem] border px-3 py-3 transition-all duration-300 ${
                      active
                        ? "border-emerald-400/18 bg-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_18px_45px_rgba(15,23,42,0.18)]"
                        : "border-transparent text-slate-300 hover:border-white/8 hover:bg-white/6 hover:text-white"
                    } ${isCollapsed ? "justify-center px-0" : ""}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition ${active ? "bg-emerald-400/16 text-emerald-300" : "bg-white/6 text-slate-200 group-hover:bg-white/10 group-hover:text-white"}`}>
                      <Icon className="h-[18px] w-[18px]" />
                      <span className={`absolute -bottom-1 h-1.5 w-1.5 rounded-full bg-emerald-300 transition ${active ? "opacity-100" : "opacity-0"}`} />
                    </span>
                    {!isCollapsed ? (
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold">{item.label}</span>
                        <span className="mt-0.5 block truncate text-xs text-slate-400">{item.hint}</span>
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-white/8 px-3 py-3">
            <Link
              href={`/lojas/${store.slug}`}
              className={`flex items-center gap-3 rounded-[1.25rem] border border-emerald-400/16 bg-emerald-400/10 px-3 py-3 text-emerald-100 transition hover:-translate-y-0.5 hover:bg-emerald-400/16 ${isCollapsed ? "justify-center px-0" : ""}`}
              title={isCollapsed ? "Abrir vitrine" : undefined}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/16 text-emerald-200">
                <FiExternalLink className="h-[18px] w-[18px]" />
              </span>
              {!isCollapsed ? (
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold">Abrir vitrine</span>
                  <span className="mt-0.5 block truncate text-xs text-emerald-100/70">Ver a loja como cliente</span>
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </motion.aside>

      <header
        className="panel-topbar-glow seller-topbar-shell fixed top-0 z-[90] border-b border-[var(--border)] bg-[color:var(--surface)]/78 backdrop-blur-2xl"
      >
        <div className="flex w-full items-center justify-between gap-3 overflow-hidden px-4 py-3.5 sm:px-5 lg:border-l lg:border-white/35 lg:px-6 2xl:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3 lg:max-w-[min(38vw,420px)] xl:max-w-[min(46vw,620px)] 2xl:max-w-none">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border border-[var(--border)] bg-[color:var(--surface)] text-[var(--foreground)] shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-[rgba(var(--accent-rgb),0.22)] lg:hidden"
              aria-expanded={mobileMenuOpen}
              aria-controls="seller-mobile-menu"
              aria-label="Abrir menu"
            >
              <FiMenu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Area operacional</p>
              <div className="mt-1 flex min-w-0 items-center gap-3">
                <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-[1.1rem] bg-[linear-gradient(135deg,rgba(var(--accent-rgb),0.18),rgba(var(--accent-rgb),0.08))] text-[var(--accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] sm:flex">
                  <FiGrid className="h-[18px] w-[18px]" />
                </div>
                <div className="min-w-0">
                  <strong className="block truncate text-lg font-semibold theme-heading sm:text-xl">{currentSection.title}</strong>
                  <span className="hidden truncate text-[13px] text-[var(--muted)] min-[1500px]:block">{currentSection.subtitle}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 pr-[32px] sm:gap-2 xl:pr-[48px]">
            <AnimatedIconToolbar items={toolbarItems} />

            <div className="group relative hidden xl:block">
              <button
                type="button"
                className="panel-icon-button border-[var(--border)] bg-[color:var(--surface)] text-[var(--muted)] hover:-translate-y-1 hover:border-[rgba(var(--accent-rgb),0.22)] hover:text-[var(--foreground)]"
                aria-label="Pesquisar"
              >
                <FiSearch className="h-[18px] w-[18px]" />
              </button>
              <span className="panel-tooltip">Pesquisa rapida</span>
            </div>

            <div className="group relative hidden xl:block">
              <button
                type="button"
                className="panel-icon-button border-[var(--border)] bg-[color:var(--surface)] text-[var(--muted)] hover:-translate-y-1 hover:border-[rgba(var(--accent-rgb),0.22)] hover:text-[var(--foreground)]"
                aria-label="Notificacoes"
              >
                <FiBell className="h-[18px] w-[18px]" />
                <span className="panel-icon-dot opacity-100" />
              </button>
              <span className="panel-tooltip">Alertas da loja</span>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="flex items-center gap-3 rounded-[1.25rem] border border-[var(--border)] bg-[color:var(--surface)] px-3 py-2 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-[rgba(var(--accent-rgb),0.22)]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.95rem] bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_52%,rgba(var(--accent-rgb),0.85)_100%)] text-sm font-semibold text-white shadow-[0_16px_34px_rgba(15,23,42,0.18)]">
                  {(store.name || "L").slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden min-w-0 text-left sm:block">
                  <span className="block max-w-[138px] truncate text-sm font-semibold theme-heading xl:max-w-[160px]">{store.name}</span>
                  <span className="hidden max-w-[160px] truncate text-xs text-[var(--muted)] min-[1500px]:block">Minha loja conectada</span>
                </span>
              </button>

              <AnimatePresence>
                {open ? (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute right-0 mt-3 w-[min(92vw,340px)] rounded-[1.7rem] border border-[var(--border)] bg-[color:var(--surface-strong)]/96 p-3 shadow-[var(--shadow)] backdrop-blur-2xl"
                  >
                    <div className="rounded-[1.4rem] border border-[var(--border)] bg-[linear-gradient(145deg,rgba(var(--accent-rgb),0.12),rgba(255,255,255,0.9))] p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-slate-900 text-white">
                          <FiUser className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold theme-heading">{store.name}</p>
                          <p className="truncate text-xs text-[var(--muted)]">WhatsApp: {store.whatsapp ?? "Nao configurado"}</p>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-1 text-sm text-[var(--muted)]">
                        <p>Pix: {store.pixKey ?? "Nao configurado"}</p>
                        <p>Cidade: {[store.city, store.state].filter(Boolean).join(" - ") || "Nao configurada"}</p>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2">
                      <Link href="/painel-lojista/configuracao" className="rounded-[1.2rem] theme-border-button px-4 py-3 text-sm font-semibold transition" onClick={() => setOpen(false)}>Alterar dados da empresa</Link>
                      <Link href={`/lojas/${store.slug}`} className="rounded-[1.2rem] theme-border-button px-4 py-3 text-sm font-semibold transition" onClick={() => setOpen(false)}>Abrir vitrine publica</Link>
                      <button type="button" onClick={() => void handleLogout()} disabled={isLeaving} className="rounded-[1.2rem] bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70">
                        {isLeaving ? "Saindo..." : "Sair"}
                      </button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen ? (
          <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu do painel lojista">
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Fechar menu"
            />
            <motion.aside
              id="seller-mobile-menu"
              initial={{ x: -48, opacity: 0.92 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -56, opacity: 0.94 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="absolute left-0 top-0 flex h-dvh w-[min(88vw,380px)] flex-col overflow-y-auto border-r border-white/10 bg-[linear-gradient(180deg,#0f172a_0%,#121b31_52%,#17223a_100%)] p-4 text-slate-100 shadow-[0_24px_80px_rgba(15,23,42,0.42)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">Menu da loja</p>
                  <h2 className="mt-2 truncate text-2xl font-semibold text-white">{store.name}</h2>
                  <p className="mt-1 text-sm text-slate-400">Acesso rapido ao painel, cadastros e operacao.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/8 text-lg font-semibold text-white transition hover:bg-white/12"
                  aria-label="Fechar menu"
                >
                  X
                </button>
              </div>

              <nav className="mt-6 grid gap-2" aria-label="Menu mobile do lojista">
              {sellerMenuLinks.map((item) => {
                const Icon = item.icon;
                const isExcluded = item.excludeStartsWith?.some((prefix) => pathname.startsWith(prefix)) ?? false;
                const active = item.exact
                  ? pathname === item.href
                  : !isExcluded && (pathname === item.href || pathname.startsWith(`${item.href}/`));

                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                    >
                      <Link
                        href={item.href}
                        onClick={closeMenus}
                        className={`flex items-center gap-3 rounded-[1.35rem] border px-4 py-3 text-left transition ${
                          active
                            ? "border-emerald-400/18 bg-white/8"
                            : "border-white/8 bg-white/4 hover:border-white/12 hover:bg-white/6"
                        }`}
                      >
                        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${active ? "bg-emerald-400/16 text-emerald-200" : "bg-white/8 text-slate-100"}`}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-white">{item.label}</span>
                          <span className="mt-0.5 block truncate text-xs text-slate-400">{item.hint}</span>
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}

                <Link
                  href={`/lojas/${store.slug}`}
                  onClick={closeMenus}
                  className="flex items-center gap-3 rounded-[1.35rem] border border-emerald-400/16 bg-emerald-400/10 px-4 py-3 text-left transition hover:bg-emerald-400/14"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/16 text-emerald-200">
                    <FiExternalLink className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-white">Abrir vitrine publica</span>
                    <span className="mt-0.5 block truncate text-xs text-emerald-100/70">Ver loja como cliente</span>
                  </span>
                </Link>
              </nav>

              <div className="mt-5 rounded-[1.5rem] border border-white/8 bg-white/6 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/8 text-slate-100">
                    <FiGrid className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">Dados da loja</p>
                    <p className="mt-0.5 truncate text-xs text-slate-400">{[store.city, store.state].filter(Boolean).join(" - ") || "Cidade nao configurada"}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-sm text-slate-400">
                  <p>WhatsApp: {store.whatsapp ?? "Nao configurado"}</p>
                  <p>Pix: {store.pixKey ?? "Nao configurado"}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={isLeaving}
                className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-rose-400/16 bg-rose-400/10 px-4 py-3 text-left text-rose-100 transition hover:bg-rose-400/14 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-rose-100">
                  <FiLogOut className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{isLeaving ? "Saindo..." : "Sair"}</span>
                  <span className="mt-0.5 block text-xs text-rose-100/70">Encerrar sessao da loja</span>
                </span>
              </button>
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
