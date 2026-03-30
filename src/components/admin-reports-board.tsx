"use client";

import { useMemo, useState } from "react";

import type { AdminWorkspace, ReportPeriod } from "@/types/catalog";

const periodLabels: Record<ReportPeriod, string> = {
  dia: "Dia",
  semana: "Semana",
  mes: "Mes",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function AdminReportsBoard({ workspace }: { workspace: AdminWorkspace }) {
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>("dia");
  const [selectedStoreId, setSelectedStoreId] = useState<string>("all");

  const selectedSnapshot = useMemo(
    () => workspace.reportSummary.periodSnapshots.find((snapshot) => snapshot.period === selectedPeriod),
    [selectedPeriod, workspace.reportSummary.periodSnapshots],
  );

  const filteredStores = useMemo(() => {
    if (selectedStoreId === "all") {
      return workspace.reportSummary.byStore;
    }

    return workspace.reportSummary.byStore.filter((item) => item.storeId === selectedStoreId);
  }, [selectedStoreId, workspace.reportSummary.byStore]);

  const filteredOrders = useMemo(() => {
    if (selectedStoreId === "all") {
      return workspace.orders;
    }

    return workspace.orders.filter((order) => order.storeId === selectedStoreId);
  }, [selectedStoreId, workspace.orders]);

  const totals = useMemo(() => {
    const sales = filteredStores.reduce((sum, store) => sum + store.sales, 0);
    const orders = filteredStores.reduce((sum, store) => sum + store.orders, 0);
    const newProducts = filteredStores.reduce((sum, store) => sum + store.newProducts, 0);
    const newCustomers = filteredStores.reduce((sum, store) => sum + store.newCustomers, 0);

    return {
      sales,
      orders,
      newProducts,
      newCustomers,
    };
  }, [filteredStores]);

  const leadingStore = useMemo(() => [...filteredStores].sort((a, b) => b.sales - a.sales)[0], [filteredStores]);

  const trendLabel = useMemo(() => {
    const snapshots = workspace.reportSummary.periodSnapshots;
    const currentIndex = snapshots.findIndex((snapshot) => snapshot.period === selectedPeriod);
    const previous = currentIndex > 0 ? snapshots[currentIndex - 1] : undefined;

    if (!selectedSnapshot || !previous) {
      return "Leitura macro inicial pronta para validacao local.";
    }

    if (selectedSnapshot.revenue > previous.revenue) {
      return `Receita geral acima do periodo anterior em ${formatCurrency(selectedSnapshot.revenue - previous.revenue)}.`;
    }

    if (selectedSnapshot.revenue < previous.revenue) {
      return `Receita geral abaixo do periodo anterior em ${formatCurrency(previous.revenue - selectedSnapshot.revenue)}.`;
    }

    return "Receita geral estavel em relacao ao periodo anterior.";
  }, [selectedPeriod, selectedSnapshot, workspace.reportSummary.periodSnapshots]);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
          <p className="text-sm text-[var(--muted)]">Receita do recorte</p>
          <strong className="mt-2 block text-3xl text-slate-900">{formatCurrency(selectedSnapshot?.revenue ?? 0)}</strong>
        </article>
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
          <p className="text-sm text-[var(--muted)]">Pedidos do recorte</p>
          <strong className="mt-2 block text-3xl text-slate-900">{selectedSnapshot?.orders ?? 0}</strong>
        </article>
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
          <p className="text-sm text-[var(--muted)]">Ticket medio</p>
          <strong className="mt-2 block text-3xl text-slate-900">{formatCurrency(selectedSnapshot?.averageTicket ?? 0)}</strong>
        </article>
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
          <p className="text-sm text-[var(--muted)]">Lojista lider</p>
          <strong className="mt-2 block text-xl text-slate-900">{leadingStore?.storeName ?? "Sem dados"}</strong>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Filtros do admin</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Periodo e lojista</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              O admin consegue recortar a plataforma por periodo e aprofundar a leitura em um lojista especifico quando precisar.
            </p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-[auto_minmax(240px,320px)] md:items-end">
            <div className="flex flex-wrap gap-2">
              {workspace.reportSummary.periodSnapshots.map((snapshot) => (
                <button
                  key={snapshot.period}
                  type="button"
                  onClick={() => setSelectedPeriod(snapshot.period)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selectedPeriod === snapshot.period ? "bg-slate-900 text-white" : "border border-[var(--border)] bg-white text-slate-700 hover:border-[var(--accent)]"}`}
                >
                  {periodLabels[snapshot.period]}
                </button>
              ))}
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-800">Lojista</span>
              <select value={selectedStoreId} onChange={(event) => setSelectedStoreId(event.target.value)} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]">
                <option value="all">Todos os lojistas</option>
                {workspace.stores.map((store) => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            </label>
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Leitura macro</p>
          <div className="mt-4 rounded-[1.5rem] border border-[var(--border)] bg-white p-4 text-sm leading-6 text-[var(--muted)]">
            <p>{trendLabel}</p>
            <p className="mt-3">Receita dos lojistas visiveis: <span className="font-medium text-slate-800">{formatCurrency(totals.sales)}</span></p>
            <p>Pedidos dos lojistas visiveis: <span className="font-medium text-slate-800">{totals.orders}</span></p>
            <p>Novos produtos no recorte: <span className="font-medium text-slate-800">{totals.newProducts}</span></p>
            <p>Novos clientes no recorte: <span className="font-medium text-slate-800">{totals.newCustomers}</span></p>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Comparativo por lojista</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Vendas, pedidos e crescimento</h2>
          </div>

          <div className="mt-6 grid gap-3">
            {filteredStores.map((store) => (
              <article key={store.storeId} className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <strong className="text-slate-900">{store.storeName}</strong>
                    <p className="mt-1 text-sm text-[var(--muted)]">Pedidos {store.orders} · Produtos novos {store.newProducts} · Clientes novos {store.newCustomers}</p>
                  </div>
                  <strong className="text-lg text-slate-900">{formatCurrency(store.sales)}</strong>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Pedidos da plataforma</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Leitura operacional por lojista</h2>
          </div>

          <div className="mt-6 grid gap-3">
            {filteredOrders.map((order) => (
              <article key={order.id} className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-slate-900">{order.code}</strong>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{order.storeName}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{order.status}</span>
                    </div>
                    <p className="mt-2 text-sm text-[var(--muted)]">Cliente {order.customerName} · {new Date(order.createdAt).toLocaleDateString("pt-BR")} · {order.paymentStatus}</p>
                  </div>
                  <strong className="text-lg text-slate-900">{formatCurrency(order.total)}</strong>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>

      {filteredStores.length === 0 ? (
        <article className="rounded-[2rem] border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-[var(--shadow)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Sem dados no recorte</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">Nao encontramos lojistas para esse filtro.</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            Ajuste o lojista selecionado para voltar a enxergar a comparacao e o resumo da plataforma.
          </p>
        </article>
      ) : null}
    </div>
  );
}
