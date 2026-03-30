import { apiConfig } from "@/lib/config";
import { mockAdminWorkspace, mockCategories, mockProducts, mockSellerWorkspace, mockStores } from "@/lib/mock-data";
import type {
  AdminWorkspace,
  CartPreview,
  Category,
  CheckoutPreview,
  OrderSuccessPreview,
  Product,
  PublicCatalogSearchResult,
  PublicSearchProductMatch,
  PublicSearchStoreResult,
  SellerWorkspace,
  StorePurchasePreview,
  StoreSummary,
} from "@/types/catalog";

const shouldUseMocks = apiConfig.useMocks || !apiConfig.baseUrl;

export interface PublicStoreCatalog {
  store: StoreSummary;
  categories: Category[];
  products: Product[];
  featuredProducts: Product[];
}

const normalizeSearchValue = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const getStoreAddressLabel = (store: StoreSummary) =>
  [
    [store.street, store.number].filter(Boolean).join(", "),
    store.district,
    [store.city, store.state].filter(Boolean).join(" - "),
    store.zipCode,
  ]
    .filter(Boolean)
    .join(" | ");

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

export async function searchPublicCatalog(query: string): Promise<PublicCatalogSearchResult> {
  const normalizedQuery = normalizeSearchValue(query);
  const stores = await getFeaturedStores();

  if (!normalizedQuery) {
    return {
      query: query.trim(),
      totalStores: stores.length,
      results: await Promise.all(
        stores.map(async (store) => {
          const catalog = await getPublicStoreCatalogBySlug(store.slug);

          return {
            store,
            matchedCategories: catalog?.categories.map((category) => category.name) ?? [],
            matchedProducts: (catalog?.products ?? []).slice(0, 3).map<PublicSearchProductMatch>((product) => ({
              id: product.id,
              name: product.name,
              slug: product.slug,
              imageUrl: product.imageUrls[0],
              categoryName: catalog?.categories.find((category) => category.id === product.categoryId)?.name,
              priceRetail: product.priceRetail,
            })),
          } satisfies PublicSearchStoreResult;
        }),
      ),
    };
  }

  const results = (await Promise.all(
    stores.map(async (store) => {
      const catalog = await getPublicStoreCatalogBySlug(store.slug);

      if (!catalog) {
        return null;
      }

      const storeMatches = [
        store.name,
        store.city,
        store.state,
        store.slug,
        store.district,
        store.street,
      ]
        .filter(Boolean)
        .some((value) => normalizeSearchValue(value ?? "").includes(normalizedQuery));

      const matchedCategories = catalog.categories
        .filter((category) => normalizeSearchValue(category.name).includes(normalizedQuery))
        .map((category) => category.name);

      const matchedProducts = catalog.products
        .filter((product) => {
          const categoryName = catalog.categories.find((category) => category.id === product.categoryId)?.name ?? "";

          return [product.name, product.description ?? "", product.slug, categoryName].some((value) =>
            normalizeSearchValue(value).includes(normalizedQuery),
          );
        })
        .map<PublicSearchProductMatch>((product) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          imageUrl: product.imageUrls[0],
          categoryName: catalog.categories.find((category) => category.id === product.categoryId)?.name,
          priceRetail: product.priceRetail,
        }));

      if (!storeMatches && matchedCategories.length === 0 && matchedProducts.length === 0) {
        return null;
      }

      return {
        store,
        matchedCategories,
        matchedProducts,
      } satisfies PublicSearchStoreResult;
    }),
  )).filter((result): result is PublicSearchStoreResult => Boolean(result));

  return {
    query: query.trim(),
    totalStores: results.length,
    results,
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

export async function getStorePurchasePreviewBySlugs(
  storeSlug: string,
  productSlug: string,
  quantity = 1,
): Promise<StorePurchasePreview | undefined> {
  const result = await getStoreProductBySlugs(storeSlug, productSlug);

  if (!result) {
    return undefined;
  }

  const { store, product, category } = result;

  return {
    store,
    product,
    category,
    suggestedQuantity: Math.max(1, quantity),
    whatsappNumber: store.whatsapp ?? "",
    pixKey: store.pixKey,
    addressLabel: getStoreAddressLabel(store),
    deliveryLabel:
      store.deliveryLabel ?? "Entrega e retirada combinadas diretamente com a loja pelo WhatsApp.",
    shareUrl: `/lojas/${store.slug}/produtos/${product.slug}`,
  };
}

export async function getCartPreviewByStoreSlug(
  storeSlug: string,
  selectedProductSlug?: string,
  quantity = 1,
): Promise<CartPreview | undefined> {
  const catalog = await getPublicStoreCatalogBySlug(storeSlug);

  if (!catalog) {
    return undefined;
  }

  const chosenProduct = selectedProductSlug
    ? catalog.products.find((product) => product.slug === selectedProductSlug)
    : catalog.products[0];

  const fallbackProduct = catalog.products.find((product) => product.slug !== chosenProduct?.slug);
  const previewProducts = [chosenProduct, fallbackProduct].filter((product): product is Product => Boolean(product));

  const items = previewProducts.map((product, index) => {
    const itemQuantity = index === 0 ? Math.max(1, quantity) : 1;
    const category = catalog.categories.find((entry) => entry.id === product.categoryId);
    const totalPrice = product.priceRetail * itemQuantity;

    return {
      id: `cart-${product.id}`,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      imageUrl: product.imageUrls[0],
      quantity: itemQuantity,
      unitPrice: product.priceRetail,
      totalPrice,
      categoryName: category?.name,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryType = subtotal >= 400 ? "retirada" : "entrega";
  const shippingFee = deliveryType === "entrega" ? 22 : 0;

  return {
    store: catalog.store,
    items,
    subtotal,
    shippingFee,
    total: subtotal + shippingFee,
    deliveryType,
    paymentLabel: "Pix manual com confirmacao no painel",
  };
}

export async function getCheckoutPreviewByStoreSlug(
  storeSlug: string,
  selectedProductSlug?: string,
  quantity = 1,
): Promise<CheckoutPreview | undefined> {
  const cart = await getCartPreviewByStoreSlug(storeSlug, selectedProductSlug, quantity);

  if (!cart) {
    return undefined;
  }

  const storeCity = cart.store.city ?? "Sao Paulo";
  const storeState = cart.store.state ?? "SP";

  return {
    cart,
    customer: {
      fullName: "Cliente em validacao",
      whatsapp: "(11) 98888-7788",
      email: "cliente@exemplo.com",
    },
    address: {
      street: cart.store.street ?? "Rua das Vitrines, 120",
      district: cart.store.district ?? "Centro",
      city: storeCity,
      state: storeState,
      zipCode: cart.store.zipCode ?? "01000-000",
    },
    orderCode: `PED-${cart.store.slug.toUpperCase().slice(0, 5)}-001`,
    note:
      cart.deliveryType === "entrega"
        ? "Entrega local em validacao visual com confirmacao por WhatsApp."
        : "Retirada em loja com janela de atendimento confirmada no WhatsApp.",
    confirmationLabel: "Pedido pronto para confirmacao manual no frontend",
  };
}

export async function getOrderSuccessPreviewByStoreSlug(
  storeSlug: string,
  selectedProductSlug?: string,
  quantity = 1,
): Promise<OrderSuccessPreview | undefined> {
  const checkout = await getCheckoutPreviewByStoreSlug(storeSlug, selectedProductSlug, quantity);

  if (!checkout) {
    return undefined;
  }

  return {
    checkout,
    etaLabel:
      checkout.cart.deliveryType === "entrega" ? "Entrega prevista para hoje ate 18h" : "Retirada disponivel em ate 40 minutos",
    supportLabel: `Acompanhamento inicial pelo WhatsApp ${checkout.cart.store.whatsapp}`,
    nextStepLabel: "Pedido confirmado no frontend e pronto para futura integracao com API e status reais.",
  };
}
