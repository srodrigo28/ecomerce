import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui-badge";
import { Button } from "@/components/ui-button";
import { Card } from "@/components/ui-card";
import { PublicFlowProgress } from "@/components/public-flow-progress";
import { StorePurchaseModal } from "@/components/store-purchase-modal";
import {
  getFeaturedStores,
  getPublicStoreCatalogBySlug,
  getStoreProductBySlugs,
  getStorePurchasePreviewBySlugs,
} from "@/lib/services/catalog-service";

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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const formatStoreAddress = (storeName: string, addressLabel: string) => `${storeName} • ${addressLabel}`;

export default async function ProdutoPublicoPage({
  params,
}: {
  params: Promise<{ slug: string; productSlug: string }>;
}) {
  const { slug, productSlug } = await params;
  const result = await getStoreProductBySlugs(slug, productSlug);
  const purchasePreview = await getStorePurchasePreviewBySlugs(slug, productSlug, 1);

  if (!result || !purchasePreview) {
    notFound();
  }

  const { store, product, category } = result;
  const secondaryPrice = product.pricePromotion ?? product.priceWholesale;
  const storeUrl = `/lojas/${store.slug}`;
  const productUrl = `/lojas/${store.slug}/produtos/${product.slug}`;
  const whatsappMessage = encodeURIComponent(
    `Ola, quero comprar o produto ${product.name} da loja ${store.name}. Vi na vitrine da Hierarquia e gostaria de seguir com o pedido.`,
  );
  const shareProductHref = `https://wa.me/?text=${encodeURIComponent(`Veja o produto ${product.name} da loja ${store.name}: ${productUrl}`)}`;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 2xl:px-12">
      <PublicFlowProgress currentStep="produto" storeSlug={store.slug} productSlug={product.slug} />

      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href={storeUrl} className="text-sm font-semibold text-[var(--accent-strong)] transition hover:text-[var(--accent)]">
              Voltar para {store.name}
            </Link>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight theme-heading sm:text-5xl">{product.name}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-lg sm:leading-8">{product.description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge variant="neutral" className="px-4 py-2 text-sm font-medium">{category?.name ?? "Categoria da loja"}</Badge>
            <Badge variant={product.stock > 0 ? "success" : "danger"} className="px-4 py-2 text-sm font-medium">
              {product.stock > 0 ? `Estoque ${product.stock}` : "Sem estoque"}
            </Badge>
            <Badge variant="accent" className="px-4 py-2 text-sm font-medium">Pix {store.pixKey}</Badge>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <Card variant="glass" className="overflow-hidden rounded-[2rem] p-0 shadow-[var(--shadow)]">
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="aspect-[4/5] bg-slate-100 lg:aspect-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.imageUrls[0]} alt={product.name} className="h-full w-full object-cover" />
              </div>
              <div className="grid grid-cols-3 gap-3 border-t border-[var(--border)] p-4 lg:grid-cols-1 lg:border-l lg:border-t-0">
                {product.imageUrls.map((imageUrl, index) => (
                  <div key={`${imageUrl}-${index}`} className="overflow-hidden rounded-[1rem] border border-[var(--border)] bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt={`${product.name} preview ${index + 1}`} className="aspect-square h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card variant="glass" className="rounded-[2rem] p-5 sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Apresentacao do produto</p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.5rem] theme-surface-card p-4">
                <p className="text-sm text-[var(--muted)]">Loja</p>
                <strong className="mt-2 block text-xl theme-heading">{store.name}</strong>
              </div>
              <div className="rounded-[1.5rem] theme-surface-card p-4">
                <p className="text-sm text-[var(--muted)]">Categoria</p>
                <strong className="mt-2 block text-xl theme-heading">{category?.name ?? "Categoria da loja"}</strong>
              </div>
              <div className="rounded-[1.5rem] theme-surface-card p-4">
                <p className="text-sm text-[var(--muted)]">Canal de venda</p>
                <strong className="mt-2 block text-xl theme-heading">WhatsApp + Pix</strong>
              </div>
            </div>
            <div className="mt-5 rounded-[1.5rem] theme-surface-card p-4 text-sm leading-7 text-[var(--muted)]">
              Esta tela foi desenhada no formato de marketplace para ajudar na apresentacao do produto, facilitar compartilhamento direto e preparar o fechamento do pedido com atendimento assistido da loja.
            </div>
          </Card>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <Card variant="glass" className="rounded-[2rem] p-5 sm:p-6 shadow-[var(--shadow)]">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Oferta da loja</p>
                <strong className="mt-2 block text-4xl theme-heading">{formatCurrency(product.priceRetail)}</strong>
                {secondaryPrice ? (
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Preco complementar ou promocional: <span className="font-medium theme-text">{formatCurrency(secondaryPrice)}</span>
                  </p>
                ) : null}
              </div>

              <div className="rounded-[1.5rem] theme-surface-card p-4 text-sm leading-6 text-[var(--muted)]">
                <p>Atendimento da loja: <span className="font-medium theme-text">{store.whatsapp}</span></p>
                <p>Chave Pix cadastrada: <span className="font-medium theme-text">{store.pixKey}</span></p>
                <p>Endereco da loja: <span className="font-medium theme-text">{formatStoreAddress(store.name, purchasePreview.addressLabel)}</span></p>
              </div>

              <div className="grid gap-3">
                <StorePurchaseModal purchasePreview={purchasePreview} />
                <Button as={Link} href={`/lojas/${store.slug}/carrinho?product=${product.slug}&quantity=2`} variant="secondary" size="lg">
                  Comprar 2 unidades
                </Button>
                <Button as="a" href={`https://wa.me/55${store.whatsapp}?text=${whatsappMessage}`} target="_blank" rel="noreferrer" variant="dark" size="lg">
                  Negociar no WhatsApp
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button as="a" href={shareProductHref} target="_blank" rel="noreferrer" variant="secondary" size="sm" className="justify-center text-center">
                  Compartilhar
                </Button>
                <Button as={Link} href={storeUrl} variant="secondary" size="sm" className="justify-center text-center">
                  Ver loja completa
                </Button>
              </div>
            </div>
          </Card>

          <Card className="rounded-[2rem] border-white/10 bg-[var(--dark-panel)] p-5 text-white shadow-[var(--shadow)] sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">Fluxo comercial</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              <p>1. O cliente abre um modal de compra sem sair da vitrine.</p>
              <p>2. O pedido local salva nome, WhatsApp, quantidade e forma de recebimento.</p>
              <p>3. A conversa pronta abre no WhatsApp da loja com Pix e endereco completos.</p>
              <p>4. Essa base fica pronta para depois sincronizar com a API Flask.</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <StorePurchaseModal purchasePreview={purchasePreview} />
              <Button as="a" href={`https://wa.me/55${store.whatsapp}?text=${whatsappMessage}`} target="_blank" rel="noreferrer" variant="secondary" size="sm">
                Falar com a loja
              </Button>
            </div>
          </Card>
        </aside>
      </section>
    </main>
  );
}
