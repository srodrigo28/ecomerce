"use client";

import { useEffect, useMemo, useState } from "react";

import { FilterSelect } from "@/components/filter-select";
import { SelectField } from "@/components/ui-form";
import { loadLocalOrders } from "@/lib/local-order-storage";
import type { LocalOrderDraft, OrderStatus, SellerWorkspace } from "@/types/catalog";

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

const deliveryLabel = {
  entrega: "Entrega",
  retirada: "Retirada",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function SellerOrdersBoard({ workspace }: { workspace: SellerWorkspace }) {
  const [orders, setOrders] = useState(workspace.orders);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [feedback, setFeedback] = useState("Modulo de pedidos pronto para validar fluxo operacional da loja antes da API.");
  const [localOrders, setLocalOrders] = useState<LocalOrderDraft[]>([]);

  useEffect(() => {
    const syncLocalOrders = () => {
      const browserOrders = loadLocalOrders().filter((order) => order.storeId === workspace.store.id);
      setLocalOrders(browserOrders);
    };

    syncLocalOrders();
    window.addEventListener("storage", syncLocalOrders);

    return () => window.removeEventListener("storage", syncLocalOrders);
  }, [workspace.store.id]);

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

  const localSummary = useMemo(() => {
    const total = localOrders.reduce((sum, order) => sum + order.total, 0);
    const deliveryOrders = localOrders.filter((order) => order.deliveryType === "entrega").length;

    return {
      count: localOrders.length,
      total,
      deliveryOrders,
    };
  }, [localOrders]);

  const handleOrderStatusChange = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order)));
    setFeedback(`Pedido atualizado localmente para ${orderStatusLabels[nextStatus]}.`);
  };

  const statusOptions = [{ value: "all", label: "Todos os status" }, ...orderStatusOptions.map((status) => ({ value: status, label: orderStatusLabels[status] }))];
  const categoryOptions = [{ value: "all", label: "Todas as categorias" }, ...workspace.categories.map((category) => ({ value: category.id, label: category.name }))];

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-[1.75rem] theme-surface-card p-5 shadow-[var(--shadow)]">
          <p className="text-sm text-[var(--muted)]">Pedidos visiveis</p>
          <strong className="mt-2 block text-3xl theme-heading">{filteredOrders.length}</strong>
        </article>
        <article className="rounded-[1.75rem] theme-surface-card p-5 shadow-[var(--shadow)]">
          <p className="text-sm text-[var(--muted)]">Pagamentos pendentes</p>
          <strong className="mt-2 block text-3xl theme-heading">{summary.pendingPayment}</strong>
        </article>
        <article className="rounded-[1.75rem] theme-surface-card p-5 shadow-[var(--shadow)]">
          <p className="text-sm text-[var(--muted)]">Pedidos em andamento</p>
          <strong className="mt-2 block text-3xl theme-heading">{summary.inProgress}</strong>
        </article>
        <article className="rounded-[1.75rem] theme-surface-card p-5 shadow-[var(--shadow)]">
          <p className="text-sm text-[var(--muted)]">Total filtrado</p>
          <strong className="mt-2 block text-3xl theme-heading">{formatCurrency(summary.revenue)}</strong>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Filtros operacionais</p>
              <h2 className="mt-2 text-2xl font-semibold theme-heading">Pedidos da loja</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Filtre por status e categoria para enxergar o que precisa de acao mais rapida no dia a dia.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <FilterSelect label="Status do pedido" value={selectedStatus} onChange={setSelectedStatus} options={statusOptions} />
            <FilterSelect label="Categoria" value={selectedCategoryId} onChange={setSelectedCategoryId} options={categoryOptions} />
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Feedback do modulo</p>
          <div className="mt-4 rounded-[1.5rem] theme-surface-card p-4 text-sm leading-6 text-[var(--muted)]">
            {feedback}
          </div>
          <div className="mt-6 rounded-[1.5rem] theme-surface-card p-4 text-sm leading-6 text-[var(--muted)]">
            <p>Loja: <span className="font-medium theme-text">{workspace.store.name}</span></p>
            <p>WhatsApp: <span className="font-medium theme-text">{workspace.store.whatsapp}</span></p>
            <p>Pedidos mockados: <span className="font-medium theme-text">{workspace.orders.length}</span></p>
            <p>Pedidos da vitrine: <span className="font-medium theme-text">{localSummary.count}</span></p>
          </div>
        </article>
      </section>

      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Pedidos da vitrine</p>
            <h2 className="mt-2 text-2xl font-semibold theme-heading">Leads convertidos pelo storefront</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">
              Aqui aparecem os pedidos locais salvos quando o cliente clica em comprar na vitrine e abre a conversa no WhatsApp da loja.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.25rem] theme-surface-card px-4 py-4 text-sm">
              <p className="text-[var(--muted)]">Pedidos locais</p>
              <strong className="mt-2 block text-2xl theme-heading">{localSummary.count}</strong>
            </div>
            <div className="rounded-[1.25rem] theme-surface-card px-4 py-4 text-sm">
              <p className="text-[var(--muted)]">Com entrega</p>
              <strong className="mt-2 block text-2xl theme-heading">{localSummary.deliveryOrders}</strong>
            </div>
            <div className="rounded-[1.25rem] theme-surface-card px-4 py-4 text-sm">
              <p className="text-[var(--muted)]">Valor potencial</p>
              <strong className="mt-2 block text-2xl theme-heading">{formatCurrency(localSummary.total)}</strong>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {localOrders.map((order) => (
            <article key={order.id} className="rounded-[1.75rem] border border-[var(--border)] theme-surface-card p-4 sm:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-xl theme-heading">{order.code}</strong>
                    <span className="rounded-full px-3 py-1 text-xs font-semibold theme-badge-info">Pedido da vitrine</span>
                    <span className="rounded-full px-3 py-1 text-xs font-semibold theme-badge-neutral">{deliveryLabel[order.deliveryType]}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    Cliente {order.customerName} · {new Date(order.createdAt).toLocaleDateString("pt-BR")} · {order.customerWhatsapp}
                  </p>
                </div>
                <div className="text-left xl:text-right">
                  <strong className="text-2xl theme-heading">{formatCurrency(order.total)}</strong>
                  <p className="mt-2 text-sm text-[var(--muted)]">Status inicial: rascunho local</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-2">
                <div className="rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface)] p-4">
                  <p className="text-sm font-semibold theme-heading">Resumo do pedido</p>
                  <div className="mt-3 grid gap-2 text-sm text-[var(--muted)]">
                    {order.items.map((item) => (
                      <div key={`${order.id}-${item.productId}`} className="rounded-2xl theme-surface-soft px-3 py-3">
                        {item.productName} · {item.quantity} x {formatCurrency(item.unitPrice)}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface)] p-4">
                  <p className="text-sm font-semibold theme-heading">Dados para atendimento</p>
                  <div className="mt-3 grid gap-2 text-sm text-[var(--muted)]">
                    <div className="rounded-2xl theme-surface-soft px-3 py-3">Endereco de apoio: <span className="font-medium theme-text">{order.addressLabel}</span></div>
                    <div className="rounded-2xl theme-surface-soft px-3 py-3">Pix da loja: <span className="font-medium theme-text">{order.pixKey ?? "A confirmar"}</span></div>
                    <div className="rounded-2xl theme-surface-soft px-3 py-3">Observacoes: <span className="font-medium theme-text">{order.notes || "Sem observacoes"}</span></div>
                  </div>
                </div>
              </div>
            </article>
          ))}

          {localOrders.length === 0 ? (
            <article className="rounded-[1.75rem] border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-[var(--shadow)]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Nenhum pedido local</p>
              <h3 className="mt-3 text-2xl font-semibold theme-heading">A vitrine ainda nao gerou pedidos salvos neste navegador.</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                Assim que o cliente usar o modal de compra da pagina de produto, o pedido aparecera aqui para a loja acompanhar antes da API.
              </p>
            </article>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        {filteredOrders.map((order) => (
          <article key={order.id} className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-xl theme-heading">{order.code}</strong>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${orderStatusClass[order.status]}`}>{orderStatusLabels[order.status]}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusClass[order.paymentStatus]}`}>{order.paymentStatus}</span>
                  <span className="rounded-full px-3 py-1 text-xs font-semibold theme-badge-neutral">{deliveryLabel[order.deliveryType]}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  Cliente {order.customerName} · {new Date(order.createdAt).toLocaleDateString("pt-BR")} · {order.itemCount} item(ns)
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-[auto_auto] sm:items-center">
                <strong className="text-2xl theme-heading">{formatCurrency(order.total)}</strong>
                <SelectField value={order.status} onChange={(event) => handleOrderStatusChange(order.id, event.target.value as OrderStatus)}>
                  {orderStatusOptions.map((status) => (
                    <option key={status} value={status}>{orderStatusLabels[status]}</option>
                  ))}
                </SelectField>
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="text-sm font-semibold theme-heading">Itens do pedido</p>
                <div className="mt-3 grid gap-2 text-sm text-[var(--muted)]">
                  {order.items.map((item) => (
                    <div key={item.id} className="rounded-2xl theme-surface-soft px-3 py-3">
                      {item.productName} · {item.quantity} x {formatCurrency(item.unitPrice)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="text-sm font-semibold theme-heading">Leitura rapida</p>
                <div className="mt-3 grid gap-2 text-sm text-[var(--muted)]">
                  <div className="rounded-2xl theme-surface-soft px-3 py-3">Pagamento: <span className="font-medium theme-text">{order.paymentStatus}</span></div>
                  <div className="rounded-2xl theme-surface-soft px-3 py-3">Entrega: <span className="font-medium theme-text">{deliveryLabel[order.deliveryType]}</span></div>
                  <div className="rounded-2xl theme-surface-soft px-3 py-3">Cliente: <span className="font-medium theme-text">{order.customerName}</span></div>
                </div>
              </div>
            </div>
          </article>
        ))}

        {filteredOrders.length === 0 ? (
          <article className="rounded-[2rem] border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-[var(--shadow)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Nenhum pedido</p>
            <h2 className="mt-3 text-2xl font-semibold theme-heading">Nao ha pedidos para esse recorte agora.</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Ajuste os filtros para voltar a enxergar os pedidos mockados da loja e validar outros cenarios operacionais.
            </p>
          </article>
        ) : null}
      </section>
    </div>
  );
}
