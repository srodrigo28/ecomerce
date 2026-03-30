import Link from "next/link";

import type { CartPreview } from "@/types/catalog";

interface PublicCartSummaryProps {
  cart: CartPreview;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const deliveryLabel = {
  entrega: "Entrega",
  retirada: "Retirada",
};

export function PublicCartSummary({ cart }: PublicCartSummaryProps) {
  const firstItem = cart.items[0];

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Carrinho em validacao</p>
            <h2 className="mt-2 text-2xl font-semibold theme-heading">Resumo do pedido</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Antes de seguir para o checkout, o cliente consegue revisar itens, valores e a forma inicial de entrega.
            </p>
          </div>
          <span className="text-sm text-[var(--muted)]">{cart.items.length} itens no fluxo</span>
        </div>

        <div className="mt-6 space-y-4">
          {cart.items.map((item) => (
            <article key={item.id} className="grid gap-4 rounded-[1.75rem] theme-surface-card p-4 md:grid-cols-[120px_minmax(0,1fr)]">
              <div className="aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold theme-heading">{item.productName}</h3>
                    <p className="text-sm text-[var(--muted)]">{item.categoryName ?? "Categoria da loja"}</p>
                  </div>
                  <strong className="theme-heading">{formatCurrency(item.totalPrice)}</strong>
                </div>
                <div className="flex flex-wrap gap-3 text-sm theme-muted">
                  <span className="rounded-full theme-surface-soft px-3 py-1 font-medium">Quantidade {item.quantity}</span>
                  <span className="rounded-full theme-surface-soft px-3 py-1 font-medium">Unitario {formatCurrency(item.unitPrice)}</span>
                </div>
                <Link href={`/lojas/${cart.store.slug}/produtos/${item.productSlug}`} className="inline-flex text-sm font-semibold text-[var(--accent-strong)] transition hover:text-[var(--accent)]">
                  Voltar para o produto
                </Link>
              </div>
            </article>
          ))}
        </div>
      </article>

      <aside className="space-y-6">
        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Fechamento inicial</p>
          <div className="mt-5 space-y-4 rounded-[1.75rem] theme-surface-card p-5">
            <div className="flex items-center justify-between gap-3 text-sm theme-muted">
              <span>Subtotal</span>
              <strong className="theme-heading">{formatCurrency(cart.subtotal)}</strong>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm theme-muted">
              <span>Entrega</span>
              <strong className="theme-heading">{formatCurrency(cart.shippingFee)}</strong>
            </div>
            <div className="h-px bg-[var(--border)]" />
            <div className="flex items-center justify-between gap-3 text-base font-semibold theme-heading">
              <span>Total</span>
              <strong>{formatCurrency(cart.total)}</strong>
            </div>
          </div>
          <div className="mt-4 rounded-[1.5rem] theme-surface-card p-4 text-sm leading-6 text-[var(--muted)]">
            <p>Entrega escolhida: <span className="font-medium theme-text">{deliveryLabel[cart.deliveryType]}</span></p>
            <p>Pagamento inicial: <span className="font-medium theme-text">{cart.paymentLabel}</span></p>
            <p>Contato da loja: <span className="font-medium theme-text">{cart.store.whatsapp}</span></p>
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--border)] bg-slate-900 p-6 text-white shadow-[var(--shadow)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">Proxima etapa</p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
O proximo bloco natural aqui e seguir para um checkout que ja pode receber os dados vindos do modal da vitrine e persistir o pedido na API.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={`/lojas/${cart.store.slug}`} className="rounded-full theme-border-button px-4 py-2.5 text-sm font-semibold transition">
              Continuar comprando
            </Link>
            {firstItem ? (
              <Link href={`/lojas/${cart.store.slug}/checkout?product=${firstItem.productSlug}&quantity=${firstItem.quantity}`} className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
                Ir para checkout
              </Link>
            ) : null}
          </div>
        </article>
      </aside>
    </section>
  );
}
