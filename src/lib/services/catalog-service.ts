import { apiConfig } from "@/lib/config";
import { mockAdminWorkspace, mockCategories, mockProducts, mockSellerWorkspace, mockStores } from "@/lib/mock-data";
import type { AdminWorkspace, Category, Product, SellerWorkspace, StoreSummary } from "@/types/catalog";

const shouldUseMocks = apiConfig.useMocks || !apiConfig.baseUrl;

export interface PublicStoreCatalog {
  store: StoreSummary;
  categories: Category[];
  products: Product[];
  featuredProducts: Product[];
}

export async function getFeaturedStores(): Promise<StoreSummary[]> {
  if (shouldUseMocks) {
    return mockStores;
  }

  return mockStores;
}

export async function getSellerWorkspace(): Promise<SellerWorkspace> {
  if (shouldUseMocks) {
    return mockSellerWorkspace;
  }

  return mockSellerWorkspace;
}

export async function getAdminWorkspace(): Promise<AdminWorkspace> {
  if (shouldUseMocks) {
    return mockAdminWorkspace;
  }

  return mockAdminWorkspace;
}

export async function getStoreBySlug(slug: string): Promise<StoreSummary | undefined> {
  const stores = await getFeaturedStores();
  return stores.find((store) => store.slug === slug);
}

export async function getPublicStoreCatalogBySlug(slug: string): Promise<PublicStoreCatalog | undefined> {
  const store = await getStoreBySlug(slug);

  if (!store) {
    return undefined;
  }

  const categories = mockCategories.filter((category) => category.storeId === store.id && category.active);
  const products = mockProducts.filter((product) => product.storeId === store.id);

  return {
    store,
    categories,
    products,
    featuredProducts: products.filter((product) => product.featured),
  };
}

export async function getStoreProductBySlugs(
  storeSlug: string,
  productSlug: string,
): Promise<{ store: StoreSummary; product: Product; category?: Category } | undefined> {
  const catalog = await getPublicStoreCatalogBySlug(storeSlug);

  if (!catalog) {
    return undefined;
  }

  const product = catalog.products.find((item) => item.slug === productSlug);

  if (!product) {
    return undefined;
  }

  const category = catalog.categories.find((item) => item.id === product.categoryId);

  return {
    store: catalog.store,
    product,
    category,
  };
}
