import Link from "next/link";
import { notFound } from "next/navigation";

import { getFeaturedStores, getPublicStoreCatalogBySlug } from "@/lib/services/catalog-service";

export async function generateStaticParams() {
  const stores = await getFeaturedStores();
  return stores.map((store) => ({ slug: store.slug }));
}

export default async function LojaPublicaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = await getPublicStoreCatalogBySlug(slug);

  if (!catalog) {
    notFound();
  }

  const { store, categories, products, featuredProducts } = catalog;
  const activeCount = products.filter((product) => product.stock > 0).length;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <section className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-slate-900 text-white shadow-[var(--shadow)]">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <div className="space-y-5 p-6 lg:p-8">
            <Link href="/lojas-parceiras" className="inline-flex text-sm font-semibold text-amber-300 transition hover:text-amber-200">
              Voltar para lojas parceiras
            </Link>
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">Vitrine publica da loja</p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">{store.name}</h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-lg sm:leading-8">
                Loja parceira da Hierarquia com catalogo proprio, categorias independentes e estrutura pronta para evoluir para carrinho e checkout no frontend.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-200">
              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">{store.city}, {store.state}</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">WhatsApp {store.whatsapp}</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">Pix {store.pixKey}</span>
            </div>
          </div>
          <div className="min-h-[260px] bg-slate-800 lg:min-h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={store.coverImageUrl} alt={store.name} className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Catalogo da loja</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Produtos em destaque</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
              <span>{products.length} produtos ativos</span>
              <Link href={`/lojas/${store.slug}/carrinho`} className="font-semibold text-[var(--accent-strong)] transition hover:text-[var(--accent)]">
                Ver resumo do carrinho
              </Link>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(featuredProducts.length > 0 ? featuredProducts : products).map((product) => (
              <article key={product.id} className="overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-white">
                <div className="aspect-[4/5] bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.imageUrls[0]} alt={product.name} className="h-full w-full object-cover" />
                </div>
                <div className="space-y-3 p-4">
                  <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                  <p className="text-sm leading-6 text-[var(--muted)]">{product.description}</p>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">Estoque {product.stock}</span>
                    <strong className="text-slate-900">R$ {product.priceRetail.toFixed(2)}</strong>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/lojas/${store.slug}/produtos/${product.slug}`}
                      className="inline-flex rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                      Ver produto
                    </Link>
                    <Link
                      href={`/lojas/${store.slug}/carrinho?product=${product.slug}&quantity=1`}
                      className="inline-flex rounded-full border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-[var(--accent)]"
                    >
                      Ir para carrinho
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </article>

        <aside className="space-y-6">
          <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Resumo da vitrine</p>
            <div className="mt-5 grid gap-3">
              <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
                <p className="text-sm text-[var(--muted)]">Categorias da loja</p>
                <strong className="mt-2 block text-2xl text-slate-900">{categories.length}</strong>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
                <p className="text-sm text-[var(--muted)]">Produtos com estoque</p>
                <strong className="mt-2 block text-2xl text-slate-900">{activeCount}</strong>
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Categorias</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {categories.map((category) => (
                <span key={category.id} className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-slate-700">
                  {category.name}
                </span>
              ))}
            </div>
          </article>
        </aside>
      </section>
    </main>
  );
}
