import { notFound } from "next/navigation";

import { StorefrontCatalog } from "@/components/storefront-catalog";
import { getFeaturedStores, getPublicStoreCatalogBySlug } from "@/lib/services/catalog-service";

export async function generateStaticParams() {
  const stores = await getFeaturedStores();
  return stores.map((store) => ({ slug: store.slug }));
}

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

  return (
    <StorefrontCatalog
      store={store}
      categories={categories}
      products={products}
      featuredProducts={featuredProducts}
      selectedCategorySlug={category === "all" ? undefined : category}
    />
  );
}
