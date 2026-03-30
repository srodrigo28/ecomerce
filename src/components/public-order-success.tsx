import Link from "next/link";

import type { OrderSuccessPreview } from "@/types/catalog";

interface PublicOrderSuccessProps {
  preview: OrderSuccessPreview;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const deliveryLabel = {
  entrega: "Entrega",
  retirada: "Retirada",
};

export function PublicOrderSuccess({ preview }: PublicOrderSuccessProps) {
  const { checkout, etaLabel, supportLabel, nextStepLabel } = preview;

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
      <article className="rounded-[2rem] border border-[rgba(16,185,129,0.24)] bg-[rgba(236,253,245,0.92)] p-6 shadow-[var(--shadow)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Pedido confirmado</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Seu pedido foi fechado com sucesso no fluxo frontend-first.
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700 sm:text-lg sm:leading-8">
          Agora ja conseguimos validar uma jornada completa: vitrine, produto, carrinho, checkout e sucesso do pedido antes da API.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-emerald-200 bg-white p-4">
            <p className="text-sm text-slate-500">Pedido</p>
            <strong className="mt-2 block text-xl text-slate-900">{checkout.orderCode}</strong>
          </div>
          <div className="rounded-[1.5rem] border border-emerald-200 bg-white p-4">
            <p className="text-sm text-slate-500">Total</p>
            <strong className="mt-2 block text-xl text-slate-900">{formatCurrency(checkout.cart.total)}</strong>
          </div>
          <div className="rounded-[1.5rem] border border-emerald-200 bg-white p-4">
            <p className="text-sm text-slate-500">Entrega</p>
            <strong className="mt-2 block text-xl text-slate-900">{deliveryLabel[checkout.cart.deliveryType]}</strong>
          </div>
        </div>
      </article>

      <aside className="space-y-6">
        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Proximos contatos</p>
          <div className="mt-5 space-y-4 rounded-[1.75rem] border border-[var(--border)] bg-white p-5 text-sm leading-6 text-[var(--muted)]">
            <p>{etaLabel}</p>
            <p>{supportLabel}</p>
            <p>{nextStepLabel}</p>
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--border)] bg-slate-900 p-6 text-white shadow-[var(--shadow)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">Continuar navegando</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={`/lojas/${checkout.cart.store.slug}`} className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200">
              Voltar para a loja
            </Link>
            <Link href="/lojas-parceiras" className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
              Ver outras lojas
            </Link>
          </div>
        </article>
      </aside>
    </section>
  );
}
