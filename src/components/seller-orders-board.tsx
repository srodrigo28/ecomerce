"use client";

import { useMemo, useState } from "react";

import type { OrderStatus, SellerWorkspace } from "@/types/catalog";

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
  pago: "bg-emerald-100 text-emerald-700",
  pendente: "bg-amber-100 text-amber-700",
  falhou: "bg-rose-100 text-rose-700",
};

const orderStatusClass: Record<OrderStatus, string> = {
  rascunho: "bg-slate-100 text-slate-700",
  aguardando_pagamento: "bg-amber-100 text-amber-700",
  pago: "bg-emerald-100 text-emerald-700",
  em_preparo: "bg-sky-100 text-sky-700",
  enviado: "bg-indigo-100 text-indigo-700",
  concluido: "bg-emerald-100 text-emerald-700",
  cancelado: "bg-rose-100 text-rose-700",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const deliveryLabel = {
  entrega: "Entrega",
  retirada: "Retirada",
};

export function SellerOrdersBoard({ workspace }: { workspace: SellerWorkspace }) {
  const [orders, setOrders] = useState(workspace.orders);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [feedback, setFeedback] = useState("Modulo de pedidos pronto para validar fluxo operacional da loja antes da API.");

  const filteredOrders = useMemo(() => {
    const byStatus = selectedStatus === "all" ? orders : orders.filter((order) => order.status === selectedStatus);

    if (selectedCategoryId === "all") {
      return byStatus;
    }

    return byStatus.filter((order) => order.items.some((item) => item.categoryId === selectedCategoryId));
  }, [orders, selectedCategoryId, selectedStatus]);

  const summary = useMemo(() => {
    const pendingPayment = filteredOrders.filter((order) => order.paymentStatus === "pendente").length;
    const inProgress = filteredOrders.filter((order) => ["pago", "em_preparo", "enviado"].includes(order.status)).length;
    const revenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);

    return {
      pendingPayment,
      inProgress,
      revenue,
    };
  }, [filteredOrders]);

  const handleOrderStatusChange = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order)));
    setFeedback(`Pedido atualizado localmente para ${orderStatusLabels[nextStatus]}.`);
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
          <p className="text-sm text-[var(--muted)]">Pedidos visiveis</p>
          <strong className="mt-2 block text-3xl text-slate-900">{filteredOrders.length}</strong>
        </article>
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
          <p className="text-sm text-[var(--muted)]">Pagamentos pendentes</p>
          <strong className="mt-2 block text-3xl text-slate-900">{summary.pendingPayment}</strong>
        </article>
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
          <p className="text-sm text-[var(--muted)]">Pedidos em andamento</p>
          <strong className="mt-2 block text-3xl text-slate-900">{summary.inProgress}</strong>
        </article>
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
          <p className="text-sm text-[var(--muted)]">Total filtrado</p>
          <strong className="mt-2 block text-3xl text-slate-900">{formatCurrency(summary.revenue)}</strong>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Filtros operacionais</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Pedidos da loja</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Filtre por status e categoria para enxergar o que precisa de acao mais rapida no dia a dia.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-800">Status do pedido</span>
              <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]">
                <option value="all">Todos os status</option>
                {orderStatusOptions.map((status) => (
                  <option key={status} value={status}>{orderStatusLabels[status]}</option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-800">Categoria</span>
              <select value={selectedCategoryId} onChange={(event) => setSelectedCategoryId(event.target.value)} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]">
                <option value="all">Todas as categorias</option>
                {workspace.categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Feedback do modulo</p>
          <div className="mt-4 rounded-[1.5rem] border border-[var(--border)] bg-white p-4 text-sm leading-6 text-[var(--muted)]">
            {feedback}
          </div>
          <div className="mt-6 rounded-[1.5rem] border border-[var(--border)] bg-white p-4 text-sm leading-6 text-[var(--muted)]">
            <p>Loja: <span className="font-medium text-slate-800">{workspace.store.name}</span></p>
            <p>WhatsApp: <span className="font-medium text-slate-800">{workspace.store.whatsapp}</span></p>
            <p>Pedidos totais mockados: <span className="font-medium text-slate-800">{workspace.orders.length}</span></p>
          </div>
        </article>
      </section>

      <section className="space-y-4">
        {filteredOrders.map((order) => (
          <article key={order.id} className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-xl text-slate-900">{order.code}</strong>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${orderStatusClass[order.status]}`}>{orderStatusLabels[order.status]}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusClass[order.paymentStatus]}`}>{order.paymentStatus}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{deliveryLabel[order.deliveryType]}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  Cliente {order.customerName} · {new Date(order.createdAt).toLocaleDateString("pt-BR")} · {order.itemCount} item(ns)
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-[auto_auto] sm:items-center">
                <strong className="text-2xl text-slate-900">{formatCurrency(order.total)}</strong>
                <select
                  value={order.status}
                  onChange={(event) => handleOrderStatusChange(order.id, event.target.value as OrderStatus)}
                  className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
                >
                  {orderStatusOptions.map((status) => (
                    <option key={status} value={status}>{orderStatusLabels[status]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">Itens do pedido</p>
                <div className="mt-3 grid gap-2 text-sm text-[var(--muted)]">
                  {order.items.map((item) => (
                    <div key={item.id} className="rounded-2xl bg-slate-50 px-3 py-3">
                      {item.productName} · {item.quantity} x {formatCurrency(item.unitPrice)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">Leitura rapida</p>
                <div className="mt-3 grid gap-2 text-sm text-[var(--muted)]">
                  <div className="rounded-2xl bg-slate-50 px-3 py-3">Pagamento: <span className="font-medium text-slate-800">{order.paymentStatus}</span></div>
                  <div className="rounded-2xl bg-slate-50 px-3 py-3">Entrega: <span className="font-medium text-slate-800">{deliveryLabel[order.deliveryType]}</span></div>
                  <div className="rounded-2xl bg-slate-50 px-3 py-3">Cliente: <span className="font-medium text-slate-800">{order.customerName}</span></div>
                </div>
              </div>
            </div>
          </article>
        ))}

        {filteredOrders.length === 0 ? (
          <article className="rounded-[2rem] border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-[var(--shadow)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Nenhum pedido</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">Nao ha pedidos para esse recorte agora.</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Ajuste os filtros para voltar a enxergar os pedidos mockados da loja e validar outros cenarios operacionais.
            </p>
          </article>
        ) : null}
      </section>
    </div>
  );
}
