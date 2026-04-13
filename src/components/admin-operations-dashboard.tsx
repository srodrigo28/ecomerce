"use client";

import { useMemo, useState, useTransition } from "react";

import { updateAdminStoreStatus } from "@/lib/services/catalog-service";
import type { AdminWorkspace, ReportPeriod, StoreSummary } from "@/types/catalog";

const periodLabels: Record<ReportPeriod, string> = {
  dia: "Dia",
  semana: "Semana",
  mes: "Mes",
};

const statusLabels: Record<StoreSummary["status"], string> = {
  ativo: "Ativa",
  inativo: "Inativa",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function AdminOperationsDashboard({ workspace }: { workspace: AdminWorkspace }) {
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>("dia");
  const [selectedStoreId, setSelectedStoreId] = useState<string>("all");
  const [stores, setStores] = useState<StoreSummary[]>(workspace.stores);
  const [feedback, setFeedback] = useState("");
  const [pendingStoreId, setPendingStoreId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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

  const visibleStores = useMemo(() => {
    if (selectedStoreId === "all") {
      return stores;
    }

    return stores.filter((store) => store.id === selectedStoreId);
  }, [selectedStoreId, stores]);

  const handleToggleStatus = (store: StoreSummary) => {
    const nextActive = store.status !== "ativo";
    setPendingStoreId(store.id);
    setFeedback("");

    startTransition(async () => {
      try {
        const updatedStore = await updateAdminStoreStatus(store.id, nextActive);
        setStores((currentStores) => currentStores.map((item) => (item.id === updatedStore.id ? updatedStore : item)));
        setFeedback(`Status da loja ${updatedStore.name} atualizado para ${statusLabels[updatedStore.status]}.`);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Nao foi possivel atualizar o status da loja agora.");
      } finally {
        setPendingStoreId(null);
      }
    });
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Painel admin</p>
              <h2 className="mt-2 text-2xl font-semibold theme-heading">Visao geral da operacao</h2>
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
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selectedPeriod === snapshot.period ? "theme-dark-cta" : "theme-border-button"}`}
                >
                  {periodLabels[snapshot.period]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.5rem] theme-surface-card p-4">
              <p className="text-sm text-[var(--muted)]">Lojas cadastradas</p>
              <strong className="mt-2 block text-2xl theme-heading">{stores.length}</strong>
            </div>
            <div className="rounded-[1.5rem] theme-surface-card p-4">
              <p className="text-sm text-[var(--muted)]">Produtos</p>
              <strong className="mt-2 block text-2xl theme-heading">{workspace.stats.totalProducts}</strong>
            </div>
            <div className="rounded-[1.5rem] theme-surface-card p-4">
              <p className="text-sm text-[var(--muted)]">Pedidos</p>
              <strong className="mt-2 block text-2xl theme-heading">{workspace.stats.totalOrders}</strong>
            </div>
            <div className="rounded-[1.5rem] theme-surface-card p-4">
              <p className="text-sm text-[var(--muted)]">Clientes</p>
              <strong className="mt-2 block text-2xl theme-heading">{workspace.stats.totalCustomers}</strong>
            </div>
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Resumo filtrado</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] theme-surface-card p-4">
              <p className="text-sm text-[var(--muted)]">Receita</p>
              <strong className="mt-2 block text-2xl theme-heading">{formatCurrency(selectedSnapshot?.revenue ?? 0)}</strong>
            </div>
            <div className="rounded-[1.5rem] theme-surface-card p-4">
              <p className="text-sm text-[var(--muted)]">Pedidos</p>
              <strong className="mt-2 block text-2xl theme-heading">{selectedSnapshot?.orders ?? 0}</strong>
            </div>
            <div className="rounded-[1.5rem] theme-surface-card p-4">
              <p className="text-sm text-[var(--muted)]">Ticket medio</p>
              <strong className="mt-2 block text-2xl theme-heading">{formatCurrency(selectedSnapshot?.averageTicket ?? 0)}</strong>
            </div>
          </div>

          <div className="mt-6">
            <label className="space-y-2">
              <span className="text-sm font-medium theme-text">Filtrar por lojista</span>
              <select
                value={selectedStoreId}
                onChange={(event) => setSelectedStoreId(event.target.value)}
                className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm theme-text outline-none transition focus:border-[var(--accent)]"
              >
                <option value="all">Todos os lojistas</option>
                {stores.map((store) => (
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
            <h2 className="mt-2 text-2xl font-semibold theme-heading">Vendas, pedidos e cadastros</h2>
          </div>

          <div className="mt-6 grid gap-3">
            {filteredStores.map((store) => (
              <article key={store.storeId} className="rounded-[1.5rem] theme-surface-card p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <strong className="theme-heading">{store.storeName}</strong>
                    <p className="mt-1 text-sm text-[var(--muted)]">Pedidos {store.orders} · Produtos novos {store.newProducts} · Clientes novos {store.newCustomers}</p>
                  </div>
                  <strong className="text-lg theme-heading">{formatCurrency(store.sales)}</strong>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Lojistas cadastrados</p>
              <h2 className="mt-2 text-2xl font-semibold theme-heading">Ativar e inativar acesso das lojas</h2>
            </div>
            {feedback ? <p className="text-sm text-[var(--muted)]">{feedback}</p> : null}
          </div>

          <div className="mt-6 grid gap-3">
            {visibleStores.length === 0 ? (
              <article className="rounded-[1.5rem] theme-surface-card p-5">
                <p className="text-sm text-[var(--muted)]">Nenhum lojista encontrado para o filtro atual.</p>
              </article>
            ) : (
              visibleStores.map((store) => {
                const buttonPending = isPending && pendingStoreId === store.id;
                const locationLabel = [store.city, store.state].filter(Boolean).join(" - ");

                return (
                  <article key={store.id} className="rounded-[1.5rem] theme-surface-card p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <strong className="theme-heading">{store.name}</strong>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${store.status === "ativo" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>
                            {statusLabels[store.status]}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-[var(--muted)]">
                          {store.ownerEmail ?? "Email nao informado"}
                          {locationLabel ? ` · ${locationLabel}` : ""}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(store)}
                        disabled={buttonPending}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${store.status === "ativo" ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100" : "bg-emerald-600 text-white hover:bg-emerald-500"} disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {buttonPending ? "Atualizando..." : store.status === "ativo" ? "Inativar" : "Ativar"}
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
