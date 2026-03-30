import Link from "next/link";

import type { CheckoutPreview } from "@/types/catalog";

interface PublicCheckoutSummaryProps {
  checkout: CheckoutPreview;
}

export function PublicCheckoutSummary({ checkout }: PublicCheckoutSummaryProps) {
  const { cart, customer, address } = checkout;
  const firstItem = cart.items[0];

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <article className="space-y-6">
        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Dados do cliente</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-slate-800">Nome completo</span>
              <input type="text" defaultValue={customer.fullName} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-800">WhatsApp</span>
              <input type="text" defaultValue={customer.whatsapp} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-800">E-mail</span>
              <input type="email" defaultValue={customer.email} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]" />
            </label>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Entrega e endereco</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-slate-800">Rua e numero</span>
              <input type="text" defaultValue={address.street} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-800">Bairro</span>
              <input type="text" defaultValue={address.district} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-800">CEP</span>
              <input type="text" defaultValue={address.zipCode} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-800">Cidade</span>
              <input type="text" defaultValue={address.city} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-800">Estado</span>
              <input type="text" defaultValue={address.state} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]" />
            </label>
          </div>
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">Entrega: {cart.deliveryType}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">Pagamento: {cart.paymentLabel}</span>
          </div>
        </div>
      </article>

      <aside className="space-y-6">
        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Confirmacao visual</p>
          <div className="mt-5 space-y-4 rounded-[1.75rem] border border-[var(--border)] bg-white p-5">
            <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
              <span>Pedido</span>
              <strong className="text-slate-900">{checkout.orderCode}</strong>
            </div>
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
            <p>{checkout.confirmationLabel}</p>
            <p className="mt-2">{checkout.note}</p>
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--border)] bg-slate-900 p-6 text-white shadow-[var(--shadow)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">Fechar pedido</p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            A confirmacao final ainda e visual. O objetivo agora e validar o checkout completo antes da futura persistencia da API.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={`/lojas/${cart.store.slug}/carrinho${firstItem ? `?product=${firstItem.productSlug}&quantity=${firstItem.quantity}` : ""}`} className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200">
              Voltar para carrinho
            </Link>
            <Link href={`/lojas/${cart.store.slug}/pedido-confirmado${firstItem ? `?product=${firstItem.productSlug}&quantity=${firstItem.quantity}` : ""}`} className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
              Confirmar pedido no frontend
            </Link>
          </div>
        </article>
      </aside>
    </section>
  );
}
