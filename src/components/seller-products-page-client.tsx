"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Modal } from "@/components/ui-modal";
import { SellerProductForm, type SellerProductEditRequest } from "@/components/seller-product-form";
import { SellerProductsShowcase } from "@/components/seller-products-showcase";
import type { SellerWorkspace } from "@/types/catalog";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function SellerProductsPageClient({ workspace }: { workspace: SellerWorkspace }) {
  const router = useRouter();
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editRequest, setEditRequest] = useState<SellerProductEditRequest | null>(null);

  useEffect(() => {
    const handleEditRequest = (event: Event) => {
      const customEvent = event as CustomEvent<SellerProductEditRequest>;
      if (!customEvent.detail) return;
      setEditRequest(customEvent.detail);
      setIsProductModalOpen(true);
    };

    window.addEventListener("seller-product-edit", handleEditRequest as EventListener);
    return () => window.removeEventListener("seller-product-edit", handleEditRequest as EventListener);
  }, []);

  const handleOpenNewProductPage = () => {
    router.push("/painel-lojista/produtos/novo");
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setEditRequest(null);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10 2xl:px-12">
      <section className="rounded-[1.7rem] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
        <details className="group" open={false}>
          <summary className="flex cursor-pointer list-none flex-col gap-4 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Central do catalogo</p>
              <div className="mt-2 flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
                <h1 className="text-2xl font-semibold tracking-tight theme-heading sm:text-3xl">Catalogo, categorias e sinais da operacao</h1>
                <span className="w-fit rounded-full theme-border-button px-3 py-1.5 text-xs font-semibold transition">Clique para expandir</span>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">A area acima da listagem agora fica recolhida por padrao para deixar o catalogo mais limpo e abrir operacao so quando precisar.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <span className="rounded-full border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold theme-heading">{workspace.stats.activeProducts} produtos</span>
              <span className="rounded-full border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold theme-heading">{workspace.categories.length} categorias</span>
              <span className="rounded-full border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold theme-heading">{workspace.stats.lowStockProducts} estoque baixo</span>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleOpenNewProductPage();
                }}
                className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
              >
                Adicionar +
              </button>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-white text-lg font-semibold text-slate-700 transition group-open:rotate-45">+</span>
            </div>
          </summary>

          <div className="border-t border-[var(--border)] px-4 py-4 sm:px-5 sm:py-5">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <article className="rounded-[1.6rem] border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-soft)]">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold theme-heading">Categorias da loja</h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Categorias comerciais da loja, com base pronta e personalizacao por lojista.</p>
                  </div>
                  <span className="inline-flex items-center gap-3 rounded-[1.2rem] border border-[var(--border)] theme-surface-card px-4 py-2.5 text-sm font-semibold theme-text shadow-[var(--shadow-soft)]">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                        <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" stroke="currentColor" strokeWidth="1.8"/>
                        <path d="M8 9h8M8 12h8M8 15h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    </span>
                    <span>{workspace.categories.length} categorias ativas</span>
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {workspace.categories.map((category) => (
                    <article key={category.id} className="rounded-[1.3rem] border border-[var(--border)] bg-[var(--surface)] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <strong className="theme-heading">{category.name}</strong>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${category.origin === "base" ? "theme-badge-success" : "theme-badge-neutral"}`}>
                          {category.origin === "base" ? "Base" : "Custom"}
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-mono text-[var(--muted)]">/{category.slug}</p>
                    </article>
                  ))}
                </div>
              </article>

              <article className="rounded-[1.6rem] border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-soft)]">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold theme-heading">Leitura rapida de vendas</h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Resumo curto para consulta operacional sem disputar espaco com a listagem.</p>
                  </div>
                  <span className="rounded-full theme-border-button px-4 py-2 text-sm font-semibold transition">Painel resumido</span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-2">
                  <div className="rounded-[1.3rem] border border-[var(--border)] bg-[var(--surface)] p-4">
                    <p className="text-sm text-[var(--muted)]">Hoje</p>
                    <strong className="mt-2 block text-2xl theme-heading">{formatCurrency(workspace.stats.salesToday)}</strong>
                  </div>
                  <div className="rounded-[1.3rem] border border-[var(--border)] bg-[var(--surface)] p-4">
                    <p className="text-sm text-[var(--muted)]">Semana</p>
                    <strong className="mt-2 block text-2xl theme-heading">{formatCurrency(workspace.stats.salesWeek)}</strong>
                  </div>
                  <div className="rounded-[1.3rem] border border-[var(--border)] bg-[var(--surface)] p-4">
                    <p className="text-sm text-[var(--muted)]">Mes</p>
                    <strong className="mt-2 block text-2xl theme-heading">{formatCurrency(workspace.stats.salesMonth)}</strong>
                  </div>
                  <div className="rounded-[1.3rem] border border-[var(--border)] bg-[var(--surface)] p-4">
                    <p className="text-sm text-[var(--muted)]">Pedidos pendentes</p>
                    <strong className="mt-2 block text-2xl theme-heading">{workspace.stats.pendingOrders}</strong>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </details>
      </section>

      <SellerProductsShowcase workspace={workspace} />

      {isProductModalOpen ? (
        <Modal
          onClose={handleCloseProductModal}
          title="Editar produto"
          description="Atualize o produto sem sair da listagem. Ao concluir, a vitrine interna continua como foco da tela."
        >
          <div className="mt-6">
            <SellerProductForm workspace={workspace} externalEditRequest={editRequest} onCompleted={handleCloseProductModal} onCancel={handleCloseProductModal} />
          </div>
        </Modal>
      ) : null}
    </main>
  );
}
