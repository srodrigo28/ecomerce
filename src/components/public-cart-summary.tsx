import Link from "next/link";

import type { CartPreview } from "@/types/catalog";

interface PublicCartSummaryProps {
  cart: CartPreview;
}

export function PublicCartSummary({ cart }: PublicCartSummaryProps) {
  const firstItem = cart.items[0];

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Carrinho em validacao</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Resumo do pedido</h2>
          </div>
          <span className="text-sm text-[var(--muted)]">{cart.items.length} itens no fluxo</span>
        </div>

        <div className="mt-6 space-y-4">
          {cart.items.map((item) => (
            <article key={item.id} className="grid gap-4 rounded-[1.75rem] border border-[var(--border)] bg-white p-4 md:grid-cols-[120px_minmax(0,1fr)]">
              <div className="aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{item.productName}</h3>
                    <p className="text-sm text-[var(--muted)]">{item.categoryName ?? "Categoria da loja"}</p>
                  </div>
                  <strong className="text-slate-900">R$ {item.totalPrice.toFixed(2)}</strong>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">Quantidade {item.quantity}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">Unitario R$ {item.unitPrice.toFixed(2)}</span>
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
          <div className="mt-5 space-y-4 rounded-[1.75rem] border border-[var(--border)] bg-white p-5">
            <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
              <span>Subtotal</span>
              <strong className="text-slate-900">R$ {cart.subtotal.toFixed(2)}</strong>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
              <span>Entrega</span>
              <strong className="text-slate-900">R$ {cart.shippingFee.toFixed(2)}</strong>
            </div>
            <div className="h-px bg-[var(--border)]" />
            <div className="flex items-center justify-between gap-3 text-base font-semibold text-slate-900">
              <span>Total</span>
              <strong>R$ {cart.total.toFixed(2)}</strong>
            </div>
          </div>
          <div className="mt-4 rounded-[1.5rem] border border-[var(--border)] bg-white p-4 text-sm leading-6 text-[var(--muted)]">
            <p>Entrega escolhida: <span className="font-medium text-slate-800">{cart.deliveryType}</span></p>
            <p>Pagamento inicial: <span className="font-medium text-slate-800">{cart.paymentLabel}</span></p>
            <p>Contato da loja: <span className="font-medium text-slate-800">{cart.store.whatsapp}</span></p>
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--border)] bg-slate-900 p-6 text-white shadow-[var(--shadow)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">Proxima etapa</p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            O proximo bloco natural aqui e transformar esse resumo em checkout com dados do cliente, endereco e confirmacao visual do pedido.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={`/lojas/${cart.store.slug}`} className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200">
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
