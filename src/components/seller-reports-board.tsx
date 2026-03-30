"use client";

import { useMemo, useState } from "react";

import type { ReportPeriod, SellerWorkspace } from "@/types/catalog";

const periodLabels: Record<ReportPeriod, string> = {
  dia: "Dia",
  semana: "Semana",
  mes: "Mes",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function SellerReportsBoard({ workspace }: { workspace: SellerWorkspace }) {
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>("dia");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  const selectedSnapshot = useMemo(
    () => workspace.reportSummary.snapshots.find((snapshot) => snapshot.period === selectedPeriod),
    [selectedPeriod, workspace.reportSummary.snapshots],
  );

  const filteredCategories = useMemo(() => {
    if (selectedCategoryId === "all") {
      return workspace.reportSummary.byCategory;
    }

    return workspace.reportSummary.byCategory.filter((item) => item.categoryId === selectedCategoryId);
  }, [selectedCategoryId, workspace.reportSummary.byCategory]);

  const categoryRevenue = filteredCategories.reduce((sum, item) => sum + item.revenue, 0);
  const categoryOrders = filteredCategories.reduce((sum, item) => sum + item.orders, 0);
  const categoryUnits = filteredCategories.reduce((sum, item) => sum + item.units, 0);

  const topCategory = useMemo(() => {
    const source = selectedCategoryId === "all" ? workspace.reportSummary.byCategory : filteredCategories;
    return [...source].sort((a, b) => b.revenue - a.revenue)[0];
  }, [filteredCategories, selectedCategoryId, workspace.reportSummary.byCategory]);

  const trendLabel = useMemo(() => {
    const snapshots = workspace.reportSummary.snapshots;
    const currentIndex = snapshots.findIndex((snapshot) => snapshot.period === selectedPeriod);
    const previous = currentIndex > 0 ? snapshots[currentIndex - 1] : undefined;

    if (!selectedSnapshot || !previous) {
      return "Leitura inicial do periodo pronta para validacao local.";
    }

    if (selectedSnapshot.revenue > previous.revenue) {
      return `Receita acima do periodo anterior em ${formatCurrency(selectedSnapshot.revenue - previous.revenue)}.`;
    }

    if (selectedSnapshot.revenue < previous.revenue) {
      return `Receita abaixo do periodo anterior em ${formatCurrency(previous.revenue - selectedSnapshot.revenue)}.`;
    }

    return "Receita estavel em relacao ao periodo anterior.";
  }, [selectedPeriod, selectedSnapshot, workspace.reportSummary.snapshots]);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-[1.75rem] theme-surface-card p-5 shadow-[var(--shadow)]">
          <p className="text-sm text-[var(--muted)]">Receita do periodo</p>
          <strong className="mt-2 block text-3xl theme-heading">{formatCurrency(selectedSnapshot?.revenue ?? 0)}</strong>
        </article>
        <article className="rounded-[1.75rem] theme-surface-card p-5 shadow-[var(--shadow)]">
          <p className="text-sm text-[var(--muted)]">Pedidos do periodo</p>
          <strong className="mt-2 block text-3xl theme-heading">{selectedSnapshot?.orders ?? 0}</strong>
        </article>
        <article className="rounded-[1.75rem] theme-surface-card p-5 shadow-[var(--shadow)]">
          <p className="text-sm text-[var(--muted)]">Ticket medio</p>
          <strong className="mt-2 block text-3xl theme-heading">{formatCurrency(selectedSnapshot?.averageTicket ?? 0)}</strong>
        </article>
        <article className="rounded-[1.75rem] theme-surface-card p-5 shadow-[var(--shadow)]">
          <p className="text-sm text-[var(--muted)]">Categoria lider</p>
          <strong className="mt-2 block text-xl theme-heading">{topCategory?.categoryName ?? "Sem dados"}</strong>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Filtros do relatorio</p>
              <h2 className="mt-2 text-2xl font-semibold theme-heading">Periodo e categoria</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                O lojista consegue recortar o desempenho por periodo e focar em uma categoria especifica quando quiser aprofundar a leitura.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-[auto_minmax(240px,320px)] md:items-end">
            <div className="flex flex-wrap gap-2">
              {workspace.reportSummary.snapshots.map((snapshot) => (
                <button
                  key={snapshot.period}
                  type="button"
                  onClick={() => setSelectedPeriod(snapshot.period)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selectedPeriod === snapshot.period ? "theme-dark-cta" : "theme-border-button"}`}
                >
                  {periodLabels[snapshot.period]}
                </button>
              ))}
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium theme-text">Categoria</span>
              <select value={selectedCategoryId} onChange={(event) => setSelectedCategoryId(event.target.value)} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm theme-text outline-none transition focus:border-[var(--accent)]">
                <option value="all">Todas as categorias</option>
                {workspace.categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Leitura rapida</p>
          <div className="mt-4 rounded-[1.5rem] theme-surface-card p-4 text-sm leading-6 text-[var(--muted)]">
            <p>{trendLabel}</p>
            <p className="mt-3">Pedidos no recorte atual: <span className="font-medium theme-text">{categoryOrders}</span></p>
            <p>Unidades vendidas no recorte: <span className="font-medium theme-text">{categoryUnits}</span></p>
            <p>Receita das categorias visiveis: <span className="font-medium theme-text">{formatCurrency(categoryRevenue)}</span></p>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Desempenho por categoria</p>
            <h2 className="mt-2 text-2xl font-semibold theme-heading">Ranking comercial</h2>
          </div>

          <div className="mt-6 grid gap-3">
            {filteredCategories.map((item) => (
              <article key={item.categoryId} className="rounded-[1.5rem] theme-surface-card p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <strong className="theme-heading">{item.categoryName}</strong>
                    <p className="mt-1 text-sm text-[var(--muted)]">{item.orders} pedido(s) · {item.units} unidade(s)</p>
                  </div>
                  <strong className="text-lg theme-heading">{formatCurrency(item.revenue)}</strong>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Interpretacao do periodo</p>
            <h2 className="mt-2 text-2xl font-semibold theme-heading">Resumo comercial do lojista</h2>
          </div>

          <div className="mt-6 grid gap-3">
            <div className="rounded-[1.5rem] theme-surface-card p-4">
              <p className="text-sm text-[var(--muted)]">Categoria mais forte</p>
              <strong className="mt-2 block text-xl theme-heading">{topCategory?.categoryName ?? "Sem dados"}</strong>
            </div>
            <div className="rounded-[1.5rem] theme-surface-card p-4">
              <p className="text-sm text-[var(--muted)]">Receita da categoria lider</p>
              <strong className="mt-2 block text-xl theme-heading">{formatCurrency(topCategory?.revenue ?? 0)}</strong>
            </div>
            <div className="rounded-[1.5rem] theme-surface-card p-4">
              <p className="text-sm text-[var(--muted)]">Ticket medio do periodo</p>
              <strong className="mt-2 block text-xl theme-heading">{formatCurrency(selectedSnapshot?.averageTicket ?? 0)}</strong>
            </div>
          </div>
        </article>
      </section>

      {filteredCategories.length === 0 ? (
        <article className="rounded-[2rem] border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-[var(--shadow)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Sem dados no recorte</p>
          <h2 className="mt-3 text-2xl font-semibold theme-heading">Nao encontramos informacoes para esse filtro.</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            Ajuste o periodo ou volte para todas as categorias para enxergar novamente o relatorio da loja.
          </p>
        </article>
      ) : null}
    </div>
  );
}
