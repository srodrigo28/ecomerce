export interface LocalSellerProductImage {
  id: string;
  name: string;
  previewUrl: string;
}

export interface LocalSellerProductVariant {
  id: string;
  sizeLabel: string;
  stock: number;
  minStock: number;
  priceRetail?: number;
  priceWholesale?: number;
  pricePromotion?: number;
  position?: number;
}

export interface LocalSellerProductRecord {
  id: string;
  storeId: string;
  storeName: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  categoryName: string;
  priceRetail: number;
  priceWholesale?: number;
  pricePromotion?: number;
  stock: number;
  minStock: number;
  variants?: LocalSellerProductVariant[];
  images: LocalSellerProductImage[];
  mainImageUrl?: string;
  createdAt: string;
}

const STORAGE_KEY = "hierarquia-local-products";
const STORAGE_EVENT = "hierarquia-local-products-change";
const EMPTY_LOCAL_PRODUCTS: LocalSellerProductRecord[] = [];

let cachedRawValue: string | null | undefined;
let cachedParsedValue: LocalSellerProductRecord[] = EMPTY_LOCAL_PRODUCTS;

const parseLocalProducts = (raw: string | null): LocalSellerProductRecord[] => {
  if (!raw) {
    return EMPTY_LOCAL_PRODUCTS;
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : EMPTY_LOCAL_PRODUCTS;
  } catch {
    return EMPTY_LOCAL_PRODUCTS;
  }
};

const commitLocalProducts = (products: LocalSellerProductRecord[]) => {
  if (typeof window === "undefined") {
    return;
  }

  const nextValue = JSON.stringify(products);
  cachedRawValue = nextValue;
  cachedParsedValue = products;
  window.localStorage.setItem(STORAGE_KEY, nextValue);
  window.dispatchEvent(new Event(STORAGE_EVENT));
};

export const readLocalSellerProducts = (): LocalSellerProductRecord[] => {
  if (typeof window === "undefined") {
    return EMPTY_LOCAL_PRODUCTS;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRawValue) {
    return cachedParsedValue;
  }

  cachedRawValue = raw;
  cachedParsedValue = parseLocalProducts(raw);
  return cachedParsedValue;
};

export const subscribeLocalSellerProducts = (callback: () => void) => {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      callback();
    }
  };

  const handleCustomChange = () => {
    callback();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(STORAGE_EVENT, handleCustomChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(STORAGE_EVENT, handleCustomChange);
  };
};

export const saveLocalSellerProduct = (product: LocalSellerProductRecord) => {
  if (typeof window === "undefined") {
    return;
  }

  const existing = readLocalSellerProducts().filter((entry) => entry.id != product.id);
  commitLocalProducts([product, ...existing]);
};

export const deleteLocalSellerProduct = (productId: string) => {
  if (typeof window === "undefined") {
    return;
  }

  const remaining = readLocalSellerProducts().filter((entry) => entry.id !== productId);
  commitLocalProducts(remaining);
};

export const duplicateLocalSellerProduct = (product: LocalSellerProductRecord) => {
  if (typeof window === "undefined") {
    return;
  }

  const duplicate: LocalSellerProductRecord = {
    ...product,
    id: window.crypto.randomUUID(),
    name: `${product.name} Copia`,
    slug: `${product.slug}-copia-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  };

  saveLocalSellerProduct(duplicate);
};
