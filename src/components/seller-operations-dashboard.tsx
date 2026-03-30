"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui-badge";
import { Button } from "@/components/ui-button";
import type { Category, OrderStatus, ReportPeriod, SellerOrder, SellerWorkspace } from "@/types/catalog";

const periodLabels: Record<ReportPeriod, string> = {
  dia: "Dia",
  semana: "Semana",
  mes: "Mes",
};

const orderStatusOptions: OrderStatus[] = [
  "aguardando_pagamento",
  "pago",
  "em_preparo",
  "enviado",
  "concluido",
  "cancelado",
];

const orderStatusLabels: Record<OrderStatus, string> = {
  rascunho: "Rascunho",
  aguardando_pagamento: "Aguardando pagamento",
  pago: "Pago",
  em_preparo: "Em preparo",
  enviado: "Enviado",
  concluido: "Concluido",
  cancelado: "Cancelado",
};

const paymentStatusClass = {
  pago: "theme-badge-success",
  pendente: "theme-badge-warning",
  falhou: "theme-badge-danger",
};

const orderStatusClass: Record<OrderStatus, string> = {
  rascunho: "theme-badge-neutral",
  aguardando_pagamento: "theme-badge-warning",
  pago: "theme-badge-success",
  em_preparo: "theme-badge-info",
  enviado: "theme-badge-indigo",
  concluido: "theme-badge-success",
  cancelado: "theme-badge-danger",
};

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function SellerOperationsDashboard({ workspace }: { workspace: SellerWorkspace }) {
  const [categories, setCategories] = useState<Category[]>(workspace.categories);
  const [orders, setOrders] = useState<SellerOrder[]>(workspace.orders);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>("dia");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string>("all");
  const [feedback, setFeedback] = useState<string>("Painel local pronto para validar categorias, pedidos e relatorios da loja.");

  const selectedSnapshot = useMemo(
    () => workspace.reportSummary.snapshots.find((snapshot) => snapshot.period === selectedPeriod),
    [selectedPeriod, workspace.reportSummary.snapshots],
  );

  const filteredCategoriesReport = useMemo(() => {
    if (selectedCategoryId === "all") {
      return workspace.reportSummary.byCategory;
    }

    return workspace.reportSummary.byCategory.filter((item) => item.categoryId === selectedCategoryId);
  }, [selectedCategoryId, workspace.reportSummary.byCategory]);

  const filteredOrders = useMemo(() => {
    const byCategory =
      selectedCategoryId === "all"
        ? orders
        : orders.filter((order) => order.items.some((item) => item.categoryId === selectedCategoryId));

    if (selectedOrderStatus === "all") {
      return byCategory;
    }

    return byCategory.filter((order) => order.status === selectedOrderStatus);
  }, [orders, selectedCategoryId, selectedOrderStatus]);

  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();

    if (!trimmed) {
      setFeedback("Digite o nome da categoria para criar no painel da loja.");
      return;
    }

    const slug = slugify(trimmed);
    const exists = categories.some((category) => category.slug === slug);

    if (exists) {
      setFeedback("Ja existe uma categoria com esse nome nesta loja.");
      return;
    }

    const newCategory: Category = {
      id: `cat-dashboard-${slug}`,
      storeId: workspace.store.id,
      name: trimmed,
      slug,
      active: true,
      origin: "custom",
    };

    setCategories((current) => [...current, newCategory]);
    setNewCategoryName("");
    setFeedback(`Categoria ${trimmed} criada localmente para esta loja.`);
  };

  const handleStartEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const handleSaveCategory = (categoryId: string) => {
    const trimmed = editingCategoryName.trim();

    if (!trimmed) {
      setFeedback("O nome da categoria nao pode ficar vazio.");
      return;
    }

    const slug = slugify(trimmed);
    const exists = categories.some((category) => category.id !== categoryId && category.slug === slug);

    if (exists) {
      setFeedback("Ja existe outra categoria com esse nome nesta loja.");
      return;
    }

    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId ? { ...category, name: trimmed, slug } : category,
      ),
    );
    setEditingCategoryId(null);
    setEditingCategoryName("");
    setFeedback(`Categoria atualizada localmente para ${trimmed}.`);
  };

  const handleToggleCategory = (categoryId: string) => {
    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId ? { ...category, active: !category.active } : category,
      ),
    );

    const targetCategory = categories.find((category) => category.id === categoryId);
    if (targetCategory) {
      setFeedback(
        `Categoria ${targetCategory.name} ${targetCategory.active ? "desativada" : "ativada"} localmente.`,
      );
    }
  };

  const handleOrderStatusChange = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((current) =>
      current.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order)),
    );
    setFeedback(`Pedido atualizado localmente para ${orderStatusLabels[nextStatus]}.`);
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Operacao da loja</p>
              <h2 className="mt-2 text-2xl font-semibold theme-heading">Categorias do lojista</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Cada loja controla suas proprias categorias. As alteracoes daqui nao impactam os demais lojistas.
              </p>
            </div>
            <span className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
              {categories.length} categorias
            </span>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <input
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              placeholder="Criar nova categoria da loja"
              className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 theme-text outline-none transition focus:border-[var(--accent)]"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
            >
              Criar categoria
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <article key={category.id} className="rounded-[1.5rem] theme-surface-card p-4">
                <div className="flex items-center justify-between gap-3">
                  {editingCategoryId === category.id ? (
                    <input
                      value={editingCategoryName}
                      onChange={(event) => setEditingCategoryName(event.target.value)}
                      className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm theme-text outline-none transition focus:border-[var(--accent)]"
                    />
                  ) : (
                    <strong className="theme-heading">{category.name}</strong>
                  )}
                  <Badge variant={category.origin === "base" ? "success" : "neutral"}>{category.origin === "base" ? "Base" : "Custom"}</Badge>
                </div>
                <p className="mt-2 text-xs font-mono text-[var(--muted)]">/{category.slug}</p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  {category.active ? "Categoria ativa na loja." : "Categoria desativada localmente."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {editingCategoryId === category.id ? (
                    <Button type="button" onClick={() => handleSaveCategory(category.id)} variant="dark" size="sm">Salvar</Button>
                  ) : (
                    <Button type="button" onClick={() => handleStartEditCategory(category)} variant="secondary" size="sm">Editar</Button>
                  )}
                  <Button type="button" onClick={() => handleToggleCategory(category.id)} variant="secondary" size="sm">{category.active ? "Desativar" : "Ativar"}</Button>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Feedback do painel</p>
          <div className="mt-4 rounded-[1.5rem] border border-[var(--border)] bg-white p-4 text-sm leading-6 text-[var(--muted)]">
            {feedback}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] theme-surface-card p-4">
              <p className="text-sm text-[var(--muted)]">Vendas hoje</p>
              <strong className="mt-2 block text-2xl text-slate-900">{formatCurrency(workspace.stats.salesToday)}</strong>
            </div>
            <div className="rounded-[1.5rem] theme-surface-card p-4">
              <p className="text-sm text-[var(--muted)]">Pedidos pendentes</p>
              <strong className="mt-2 block text-2xl text-slate-900">{workspace.stats.pendingOrders}</strong>
            </div>
            <div className="rounded-[1.5rem] theme-surface-card p-4">
              <p className="text-sm text-[var(--muted)]">Estoque baixo</p>
              <strong className="mt-2 block text-2xl text-slate-900">{workspace.stats.lowStockProducts}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Relatorios do lojista</p>
              <h2 className="mt-2 text-2xl font-semibold theme-heading">Vendas e pedidos filtrados</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                O lojista precisa filtrar por periodo e categoria para entender o desempenho da propria operacao.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-[auto_auto] md:justify-start">
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

            <select
              value={selectedCategoryId}
              onChange={(event) => setSelectedCategoryId(event.target.value)}
              className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm theme-text outline-none transition focus:border-[var(--accent)]"
            >
              <option value="all">Todas as categorias</option>
              {categories.filter((category) => category.active).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] theme-surface-card p-4">
              <p className="text-sm text-[var(--muted)]">Receita do periodo</p>
              <strong className="mt-2 block text-2xl text-slate-900">{formatCurrency(selectedSnapshot?.revenue ?? 0)}</strong>
            </div>
            <div className="rounded-[1.5rem] theme-surface-card p-4">
              <p className="text-sm text-[var(--muted)]">Pedidos do periodo</p>
              <strong className="mt-2 block text-2xl text-slate-900">{selectedSnapshot?.orders ?? 0}</strong>
            </div>
            <div className="rounded-[1.5rem] theme-surface-card p-4">
              <p className="text-sm text-[var(--muted)]">Ticket medio</p>
              <strong className="mt-2 block text-2xl text-slate-900">{formatCurrency(selectedSnapshot?.averageTicket ?? 0)}</strong>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {filteredCategoriesReport.map((item) => (
              <article key={item.categoryId} className="rounded-[1.5rem] theme-surface-card p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <strong className="theme-heading">{item.categoryName}</strong>
                    <p className="mt-1 text-sm text-[var(--muted)]">{item.orders} pedido(s) e {item.units} unidade(s) vendidas</p>
                  </div>
                  <strong className="text-lg theme-heading">{formatCurrency(item.revenue)}</strong>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Pedidos da loja</p>
              <h2 className="mt-2 text-2xl font-semibold theme-heading">Leitura operacional</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Aqui validamos a visao de pedidos antes da API: status, pagamento, cliente e impacto por categoria.
              </p>
            </div>
            <span className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
              {filteredOrders.length} pedido(s)
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedOrderStatus("all")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selectedOrderStatus === "all" ? "theme-dark-cta" : "theme-border-button"}`}
            >
              Todos
            </button>
            {orderStatusOptions.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setSelectedOrderStatus(status)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selectedOrderStatus === status ? "theme-dark-cta" : "theme-border-button"}`}
              >
                {orderStatusLabels[status]}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-3">
            {filteredOrders.map((order) => (
              <article key={order.id} className="rounded-[1.5rem] theme-surface-card p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="theme-heading">{order.code}</strong>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${orderStatusClass[order.status]}`}>{orderStatusLabels[order.status]}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusClass[order.paymentStatus]}`}>{order.paymentStatus}</span>
                    </div>
                    <p className="mt-2 text-sm text-[var(--muted)]">Cliente {order.customerName} · {new Date(order.createdAt).toLocaleDateString("pt-BR")} · {order.deliveryType}</p>
                  </div>
                  <strong className="text-lg theme-heading">{formatCurrency(order.total)}</strong>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
                  {order.items.map((item) => (
                    <div key={item.id} className="rounded-2xl theme-surface-soft px-3 py-3">
                      {item.productName} · {item.quantity} x {formatCurrency(item.unitPrice)}
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                  <div className="text-sm text-[var(--muted)]">
                    Atualize o status para simular o fluxo operacional da loja antes da integracao da API.
                  </div>
                  <select
                    value={order.status}
                    onChange={(event) => handleOrderStatusChange(order.id, event.target.value as OrderStatus)}
                    className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm theme-text outline-none transition focus:border-[var(--accent)]"
                  >
                    {orderStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {orderStatusLabels[status]}
                      </option>
                    ))}
                  </select>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
