import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui-badge";
import { Button } from "@/components/ui-button";
import { Card } from "@/components/ui-card";
import { PublicFlowProgress } from "@/components/public-flow-progress";
import { getFeaturedStores, getPublicStoreCatalogBySlug } from "@/lib/services/catalog-service";

export async function generateStaticParams() {
  const stores = await getFeaturedStores();
  return stores.map((store) => ({ slug: store.slug }));
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export default async function LojaPublicaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { slug } = await params;
  const { category = "all" } = await searchParams;
  const catalog = await getPublicStoreCatalogBySlug(slug);

  if (!catalog) {
    notFound();
  }

  const { store, categories, products, featuredProducts } = catalog;
  const leadProduct = (featuredProducts[0] ?? products[0])?.slug;
  const selectedCategory = category === "all" ? undefined : categories.find((item) => item.slug === category);
  const filteredProducts = category === "all"
    ? featuredProducts.length > 0
      ? featuredProducts
      : products
    : products.filter((product) => product.categoryId === selectedCategory?.id);
  const activeCount = filteredProducts.filter((product) => product.stock > 0).length;
  const storeUrl = `/lojas/${store.slug}`;
  const shareStoreHref = `https://wa.me/?text=${encodeURIComponent(`Confira a vitrine da loja ${store.name} na Hierarquia: ${storeUrl}`)}`;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 2xl:px-12">
      <PublicFlowProgress currentStep="loja" storeSlug={store.slug} productSlug={leadProduct} />

      <section className="overflow-hidden rounded-[2.25rem] border border-[var(--border)] bg-[var(--dark-panel)] text-white shadow-[var(--shadow)]">
        <div className="grid gap-0 xl:grid-cols-[minmax(0,1.15fr)_520px]">
          <div className="space-y-6 p-6 sm:p-8 xl:p-10">
            <Link href="/lojas-parceiras" className="inline-flex text-sm font-semibold text-amber-300 transition hover:text-amber-200">
              Voltar para lojas parceiras
            </Link>

            <div className="space-y-4">
              <Badge variant="accent" className="px-4 py-2 text-sm font-semibold">Loja oficial na Hierarquia</Badge>
              <div className="space-y-3">
                <h1 className="max-w-4xl text-3xl font-semibold tracking-tight sm:text-5xl xl:text-6xl">{store.name}</h1>
                <p className="max-w-3xl text-sm leading-7 text-slate-300 sm:text-lg sm:leading-8">
                  Vitrine comercial pronta para compartilhar por categoria, divulgar produtos e converter atendimento em pedido com apoio de WhatsApp e Pix.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-slate-100">
              <Badge className="px-4 py-2 text-sm font-medium" variant="neutral">{store.city}, {store.state}</Badge>
              <Badge className="px-4 py-2 text-sm font-medium" variant="neutral">WhatsApp {store.whatsapp}</Badge>
              <Badge className="px-4 py-2 text-sm font-medium" variant="neutral">Pix {store.pixKey}</Badge>
              <Badge className="px-4 py-2 text-sm font-medium" variant="success">{activeCount} produtos disponiveis</Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="rounded-[1.5rem] border-white/10 bg-white/6 p-4 text-white">
                <p className="text-sm text-slate-300">Categorias</p>
                <strong className="mt-2 block text-3xl">{categories.length}</strong>
                <p className="mt-2 text-sm text-slate-300">Links diretos por categoria para compartilhar.</p>
              </Card>
              <Card className="rounded-[1.5rem] border-white/10 bg-white/6 p-4 text-white">
                <p className="text-sm text-slate-300">Produtos no ar</p>
                <strong className="mt-2 block text-3xl">{products.length}</strong>
                <p className="mt-2 text-sm text-slate-300">Catalogo visual estilo marketplace para conversao rapida.</p>
              </Card>
              <Card className="rounded-[1.5rem] border-white/10 bg-white/6 p-4 text-white">
                <p className="text-sm text-slate-300">Canal principal</p>
                <strong className="mt-2 block text-3xl">WhatsApp</strong>
                <p className="mt-2 text-sm text-slate-300">Fechamento assistido com mensagem pronta e instrucao Pix.</p>
              </Card>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button as={Link} href={`${storeUrl}${leadProduct ? `/produtos/${leadProduct}` : ""}`} variant="primary">
                Ver destaque principal
              </Button>
              <Button as="a" href={shareStoreHref} target="_blank" rel="noreferrer" variant="secondary">
                Compartilhar loja
              </Button>
              <Button as={Link} href={`/lojas/${store.slug}/carrinho`} variant="secondary">
                Abrir carrinho da loja
              </Button>
            </div>
          </div>

          <div className="relative min-h-[320px] xl:min-h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={store.coverImageUrl} alt={store.name} className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <Card variant="glass" className="rounded-[2rem] p-5 sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Explorar a loja</p>
            <h2 className="mt-2 text-2xl font-semibold theme-heading">Categorias compartilhaveis</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Cada categoria gera um link proprio para o lojista divulgar colecoes especificas como se fosse uma vitrine de campanha.
            </p>

            <div className="mt-5 grid gap-3">
              <Button as={Link} href={storeUrl} variant={category === "all" ? "dark" : "secondary"} size="sm" className="justify-center text-center">
                Loja completa
              </Button>
              {categories.map((item) => {
                const categoryUrl = `/lojas/${store.slug}?category=${item.slug}`;
                const shareCategoryHref = `https://wa.me/?text=${encodeURIComponent(`Veja a categoria ${item.name} da loja ${store.name}: ${categoryUrl}`)}`;

                return (
                  <div key={item.id} className="rounded-[1.35rem] theme-surface-card p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <strong className="block text-sm theme-heading">{item.name}</strong>
                        <p className="mt-1 text-xs text-[var(--muted)]">/{item.slug}</p>
                      </div>
                      <Badge variant={category === item.slug ? "accent" : "neutral"}>{category === item.slug ? "Ativa" : "Link"}</Badge>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button as={Link} href={categoryUrl} variant={category === item.slug ? "dark" : "secondary"} size="sm" className="flex-1 justify-center text-center">
                        Abrir
                      </Button>
                      <Button as="a" href={shareCategoryHref} target="_blank" rel="noreferrer" variant="secondary" size="sm" className="flex-1 justify-center text-center">
                        Compartilhar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card variant="glass" className="rounded-[2rem] p-5 sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Atendimento</p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
              <p>Loja: <span className="font-medium theme-text">{store.name}</span></p>
              <p>WhatsApp: <span className="font-medium theme-text">{store.whatsapp}</span></p>
              <p>Chave Pix: <span className="font-medium theme-text">{store.pixKey}</span></p>
            </div>
            <div className="mt-5 flex flex-col gap-3">
              <Button as="a" href={`https://wa.me/55${store.whatsapp}?text=${encodeURIComponent(`Ola, vim da vitrine da Hierarquia e quero atendimento da loja ${store.name}.`)}`} target="_blank" rel="noreferrer" variant="primary">
                Falar com a loja
              </Button>
              <Button as={Link} href={`/lojas/${store.slug}/carrinho`} variant="secondary">
                Simular compra
              </Button>
            </div>
          </Card>
        </aside>

        <div className="space-y-6">
          <Card variant="glass" className="rounded-[2rem] p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Catalogo da loja</p>
                <h2 className="mt-2 text-2xl font-semibold theme-heading">
                  {selectedCategory ? `Categoria ${selectedCategory.name}` : "Vitrine completa da loja"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Layout pensado para leitura rapida, clique direto em produto e compartilhamento por segmento, como em marketplaces de alto giro.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
                <span>{filteredProducts.length} produto(s)</span>
                <span>{activeCount} com estoque</span>
                <Link href={`/lojas/${store.slug}/carrinho`} className="font-semibold text-[var(--accent-strong)] transition hover:text-[var(--accent)]">
                  Ver resumo do carrinho
                </Link>
              </div>
            </div>
          </Card>

          {filteredProducts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {filteredProducts.map((product) => {
                const categoryLink = `/lojas/${store.slug}?category=${categories.find((item) => item.id === product.categoryId)?.slug ?? "all"}`;
                const productShareHref = `https://wa.me/?text=${encodeURIComponent(`Veja o produto ${product.name} da loja ${store.name}: /lojas/${store.slug}/produtos/${product.slug}`)}`;

                return (
                  <article key={product.id} className="overflow-hidden rounded-[1.75rem] theme-surface-card shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:shadow-[var(--shadow)]">
                    <div className="relative aspect-[4/5] bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={product.imageUrls[0]} alt={product.name} className="h-full w-full object-cover" />
                      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        {product.featured ? <Badge variant="accent">Destaque</Badge> : null}
                        <Badge variant={product.stock > 0 ? "success" : "danger"}>{product.stock > 0 ? `Estoque ${product.stock}` : "Sem estoque"}</Badge>
                      </div>
                    </div>

                    <div className="space-y-4 p-4 sm:p-5">
                      <div className="space-y-2">
                        <Link href={categoryLink} className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)] transition hover:text-[var(--accent)]">
                          {categories.find((item) => item.id === product.categoryId)?.name ?? "Categoria da loja"}
                        </Link>
                        <h3 className="line-clamp-2 text-lg font-semibold theme-heading">{product.name}</h3>
                        <p className="line-clamp-2 text-sm leading-6 text-[var(--muted)]">{product.description}</p>
                      </div>

                      <div className="space-y-1">
                        <strong className="block text-2xl theme-heading">{formatCurrency(product.priceRetail)}</strong>
                        {product.pricePromotion ? (
                          <p className="text-sm text-[var(--muted)]">Pix ou promocional: <span className="font-medium theme-text">{formatCurrency(product.pricePromotion)}</span></p>
                        ) : null}
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        <Button as={Link} href={`/lojas/${store.slug}/produtos/${product.slug}`} variant="dark" size="sm" className="justify-center text-center">
                          Ver detalhes
                        </Button>
                        <Button as={Link} href={`/lojas/${store.slug}/carrinho?product=${product.slug}&quantity=1`} variant="secondary" size="sm" className="justify-center text-center">
                          Comprar
                        </Button>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        <Button as="a" href={productShareHref} target="_blank" rel="noreferrer" variant="secondary" size="sm" className="justify-center text-center">
                          Compartilhar
                        </Button>
                        <Button as="a" href={`https://wa.me/55${store.whatsapp}?text=${encodeURIComponent(`Ola, quero comprar o produto ${product.name} da loja ${store.name}.`)}`} target="_blank" rel="noreferrer" variant="secondary" size="sm" className="justify-center text-center">
                          WhatsApp
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <Card variant="surface" className="rounded-[2rem] border border-dashed px-6 py-10 text-center shadow-[var(--shadow)]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Nenhum produto</p>
              <h3 className="mt-3 text-xl font-semibold theme-heading">Nao encontramos produtos para essa categoria.</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                Troque o filtro para voltar para a vitrine completa ou compartilhar outra categoria da loja.
              </p>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
