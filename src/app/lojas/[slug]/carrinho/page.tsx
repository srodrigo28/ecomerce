import Link from "next/link";
import { notFound } from "next/navigation";

import { PublicCartSummary } from "@/components/public-cart-summary";
import { getCartPreviewByStoreSlug, getFeaturedStores } from "@/lib/services/catalog-service";

export async function generateStaticParams() {
  const stores = await getFeaturedStores();
  return stores.map((store) => ({ slug: store.slug }));
}

export default async function CarrinhoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ product?: string; quantity?: string }>;
}) {
  const { slug } = await params;
  const { product, quantity } = await searchParams;
  const cart = await getCartPreviewByStoreSlug(slug, product, Number(quantity ?? "1"));

  if (!cart) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <section className="rounded-[2rem] border border-[var(--border)] bg-[rgba(255,252,247,0.92)] p-4 shadow-[var(--shadow)] backdrop-blur sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href={`/lojas/${cart.store.slug}`} className="text-sm font-semibold text-[var(--accent-strong)] transition hover:text-[var(--accent)]">
              Voltar para {cart.store.name}
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Carrinho e resumo do pedido</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-lg sm:leading-8">
              Esta etapa valida a experiencia de compra antes da API: item selecionado, composicao do pedido, entrega ou retirada e pagamento por Pix no fluxo inicial.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-slate-700">Loja {cart.store.name}</span>
            <span className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-slate-700">{cart.items.length} itens</span>
          </div>
        </div>
      </section>

      <PublicCartSummary cart={cart} />
    </main>
  );
}
