import Link from "next/link";
import { notFound } from "next/navigation";

import { PublicFlowProgress } from "@/components/public-flow-progress";
import { PublicOrderSuccess } from "@/components/public-order-success";
import { getFeaturedStores, getOrderSuccessPreviewByStoreSlug } from "@/lib/services/catalog-service";

export async function generateStaticParams() {
  const stores = await getFeaturedStores();
  return stores.map((store) => ({ slug: store.slug }));
}

export default async function PedidoConfirmadoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ product?: string; quantity?: string; orderCode?: string; orderId?: string }>;
}) {
  const { slug } = await params;
  const { product, quantity, orderCode } = await searchParams;
  const preview = await getOrderSuccessPreviewByStoreSlug(slug, product, Number(quantity ?? "1"), orderCode);

  if (!preview) {
    notFound();
  }

  const isPersistedOrder = Boolean(orderCode);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <PublicFlowProgress currentStep="confirmado" storeSlug={preview.checkout.cart.store.slug} productSlug={product} />

      <section className="rounded-[2rem] border border-[var(--border)] bg-[rgba(255,252,247,0.92)] p-4 shadow-[var(--shadow)] backdrop-blur sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href={`/lojas/${preview.checkout.cart.store.slug}`} className="text-sm font-semibold text-[var(--accent-strong)] transition hover:text-[var(--accent)]">
              Voltar para a vitrine
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              {isPersistedOrder ? "Pedido confirmado com persistencia real" : "Pedido confirmado no frontend"}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-lg sm:leading-8">
              {isPersistedOrder
                ? "Esta tela agora fecha a jornada publica com pedido salvo na API, codigo real gerado e base pronta para acompanhamento operacional."
                : "Esta tela fecha a validacao da jornada publica antes do backend: visual forte, resumo claro e proximos passos para loja e cliente."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-slate-700">{preview.checkout.orderCode}</span>
            <span className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-slate-700">{preview.checkout.cart.store.name}</span>
          </div>
        </div>
      </section>

      <PublicOrderSuccess preview={preview} />
    </main>
  );
}
