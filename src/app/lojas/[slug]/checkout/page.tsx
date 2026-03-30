import Link from "next/link";
import { notFound } from "next/navigation";

import { PublicCheckoutSummary } from "@/components/public-checkout-summary";
import { getCheckoutPreviewByStoreSlug, getFeaturedStores } from "@/lib/services/catalog-service";

export async function generateStaticParams() {
  const stores = await getFeaturedStores();
  return stores.map((store) => ({ slug: store.slug }));
}

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ product?: string; quantity?: string }>;
}) {
  const { slug } = await params;
  const { product, quantity } = await searchParams;
  const checkout = await getCheckoutPreviewByStoreSlug(slug, product, Number(quantity ?? "1"));

  if (!checkout) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <section className="rounded-[2rem] border border-[var(--border)] bg-[rgba(255,252,247,0.92)] p-4 shadow-[var(--shadow)] backdrop-blur sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href={`/lojas/${checkout.cart.store.slug}/carrinho?product=${product ?? ""}&quantity=${quantity ?? "1"}`} className="text-sm font-semibold text-[var(--accent-strong)] transition hover:text-[var(--accent)]">
              Voltar para o carrinho
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Checkout e confirmacao do pedido</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-lg sm:leading-8">
              Esta tela fecha a jornada frontend-first com cliente, endereco, forma de entrega e resumo final antes da API assumir persistencia e pagamentos reais.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-slate-700">Pedido {checkout.orderCode}</span>
            <span className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-slate-700">Loja {checkout.cart.store.name}</span>
          </div>
        </div>
      </section>

      <PublicCheckoutSummary checkout={checkout} />
    </main>
  );
}
