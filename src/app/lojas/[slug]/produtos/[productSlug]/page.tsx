import Link from "next/link";
import { notFound } from "next/navigation";

import { getFeaturedStores, getPublicStoreCatalogBySlug, getStoreProductBySlugs } from "@/lib/services/catalog-service";

export async function generateStaticParams() {
  const stores = await getFeaturedStores();
  const catalogs = await Promise.all(stores.map((store) => getPublicStoreCatalogBySlug(store.slug)));

  return catalogs.flatMap((catalog) =>
    (catalog?.products ?? []).map((product) => ({
      slug: catalog!.store.slug,
      productSlug: product.slug,
    })),
  );
}

export default async function ProdutoPublicoPage({
  params,
}: {
  params: Promise<{ slug: string; productSlug: string }>;
}) {
  const { slug, productSlug } = await params;
  const result = await getStoreProductBySlugs(slug, productSlug);

  if (!result) {
    notFound();
  }

  const { store, product, category } = result;
  const secondaryPrice = product.pricePromotion ?? product.priceWholesale;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <section className="rounded-[2rem] border border-[var(--border)] bg-[rgba(255,252,247,0.92)] p-4 shadow-[var(--shadow)] backdrop-blur sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href={`/lojas/${store.slug}`} className="text-sm font-semibold text-[var(--accent-strong)] transition hover:text-[var(--accent)]">
              Voltar para {store.name}
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">{product.name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-lg sm:leading-8">{product.description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-slate-700">
              {category?.name ?? "Categoria da loja"}
            </span>
            <span className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-slate-700">
              Estoque {product.stock}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
        <article className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
          <div className="aspect-[4/5] bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.imageUrls[0]} alt={product.name} className="h-full w-full object-cover" />
          </div>
        </article>

        <aside className="space-y-6">
          <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Resumo comercial</p>
            <div className="mt-5 space-y-4">
              <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
                <p className="text-sm text-[var(--muted)]">Preco de vitrine</p>
                <strong className="mt-2 block text-3xl text-slate-900">R$ {product.priceRetail.toFixed(2)}</strong>
              </div>
              {secondaryPrice ? (
                <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
                  <p className="text-sm text-[var(--muted)]">Preco complementar</p>
                  <strong className="mt-2 block text-2xl text-slate-900">R$ {secondaryPrice.toFixed(2)}</strong>
                </div>
              ) : null}
              <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4 text-sm leading-6 text-[var(--muted)]">
                <p>Loja: <span className="font-medium text-slate-800">{store.name}</span></p>
                <p>WhatsApp: <span className="font-medium text-slate-800">{store.whatsapp}</span></p>
                <p>Pix: <span className="font-medium text-slate-800">{store.pixKey}</span></p>
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-[var(--border)] bg-slate-900 p-6 text-white shadow-[var(--shadow)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">Proximo bloco do frontend</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Esta pagina prepara o terreno para carrinho, variacoes, calculo de entrega e fechamento do pedido, mantendo a API para depois.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={`/lojas/${store.slug}`} className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200">
                Voltar para a loja
              </Link>
              <Link href="/cadastro-loja" className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
                Cadastrar nova loja
              </Link>
            </div>
          </article>
        </aside>
      </section>
    </main>
  );
}
