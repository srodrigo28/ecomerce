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

export function AdminOperationsDashboard({ workspace }: { workspace: AdminWorkspace }) {
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

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Painel admin</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Visao geral da operacao</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                O admin precisa filtrar por periodo e por lojista para acompanhar vendas, pedidos e crescimento da plataforma.
              </p>
            </div>
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
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
              <p className="text-sm text-[var(--muted)]">Lojas cadastradas</p>
              <strong className="mt-2 block text-2xl text-slate-900">{workspace.stats.totalStores}</strong>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
              <p className="text-sm text-[var(--muted)]">Produtos</p>
              <strong className="mt-2 block text-2xl text-slate-900">{workspace.stats.totalProducts}</strong>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
              <p className="text-sm text-[var(--muted)]">Pedidos</p>
              <strong className="mt-2 block text-2xl text-slate-900">{workspace.stats.totalOrders}</strong>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
              <p className="text-sm text-[var(--muted)]">Clientes</p>
              <strong className="mt-2 block text-2xl text-slate-900">{workspace.stats.totalCustomers}</strong>
            </div>
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Resumo filtrado</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
              <p className="text-sm text-[var(--muted)]">Receita</p>
              <strong className="mt-2 block text-2xl text-slate-900">{formatCurrency(selectedSnapshot?.revenue ?? 0)}</strong>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
              <p className="text-sm text-[var(--muted)]">Pedidos</p>
              <strong className="mt-2 block text-2xl text-slate-900">{selectedSnapshot?.orders ?? 0}</strong>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
              <p className="text-sm text-[var(--muted)]">Ticket medio</p>
              <strong className="mt-2 block text-2xl text-slate-900">{formatCurrency(selectedSnapshot?.averageTicket ?? 0)}</strong>
            </div>
          </div>

          <div className="mt-6">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-900">Filtrar por lojista</span>
              <select
                value={selectedStoreId}
                onChange={(event) => setSelectedStoreId(event.target.value)}
                className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
              >
                <option value="all">Todos os lojistas</option>
                {workspace.stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Comparativo por lojista</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Vendas, pedidos e cadastros</h2>
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
    </div>
  );
}
