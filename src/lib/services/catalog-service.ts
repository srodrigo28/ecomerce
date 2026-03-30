import { apiConfig, resolvedEndpoints } from "@/lib/config";
import { mockAdminWorkspace, mockCategories, mockProducts, mockSellerWorkspace, mockStores } from "@/lib/mock-data";
import type {
  AdminWorkspace,
  AdminApiReportBundle,
  AdminApiReportResult,
  CartPreview,
  Category,
  CheckoutApiOrderResult,
  CheckoutPreview,
  CheckoutSubmitInput,
  OrderSuccessPreview,
  Product,
  PublicCatalogSearchResult,
  PublicSearchProductMatch,
  PublicSearchStoreResult,
  ReportPeriod,
  SellerApiReportBundle,
  SellerApiReportResult,
  SellerOrder,
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


const normalizeWhatsappDigits = (value: string) => value.replace(/\D/g, "");

const toNumberValue = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const mapCheckoutApiOrderResult = (payload: unknown): CheckoutApiOrderResult => {
  const source = payload as Record<string, unknown>;
  const customer = source.customer && typeof source.customer === "object"
    ? (source.customer as Record<string, unknown>)
    : undefined;
  const address = source.address && typeof source.address === "object"
    ? (source.address as Record<string, unknown>)
    : undefined;
  const store = source.store && typeof source.store === "object"
    ? (source.store as Record<string, unknown>)
    : undefined;

  return {
    id: Number(source.id),
    code: String(source.code),
    storeId: Number(source.store_id ?? source.storeId),
    customerId: Number(source.customer_id ?? source.customerId),
    addressId:
      source.address_id !== undefined && source.address_id !== null
        ? Number(source.address_id)
        : source.addressId !== undefined && source.addressId !== null
          ? Number(source.addressId)
          : null,
    subtotal: toNumberValue(source.subtotal),
    shippingCost: toNumberValue(source.shipping_cost ?? source.shippingCost),
    total: toNumberValue(source.total),
    paymentMethod: String(source.payment_method ?? source.paymentMethod ?? "pix"),
    paymentStatus: String(source.payment_status ?? source.paymentStatus ?? "pending"),
    orderStatus: String(source.order_status ?? source.orderStatus ?? "pending"),
    deliveryType: String(source.delivery_type ?? source.deliveryType ?? "pickup"),
    notes: typeof source.notes === "string" ? source.notes : null,
    itemsCount: Number(source.items_count ?? source.itemsCount ?? 0),
    customer: customer
      ? {
          id: Number(customer.id),
          name: String(customer.name),
          whatsapp: typeof customer.whatsapp === "string" ? customer.whatsapp : null,
          email: typeof customer.email === "string" ? customer.email : null,
          cpf: typeof customer.cpf === "string" ? customer.cpf : null,
        }
      : undefined,
    address: address
      ? {
          id: Number(address.id),
          zipCode:
            typeof (address.zip_code ?? address.zipCode) === "string"
              ? String(address.zip_code ?? address.zipCode)
              : null,
          state: typeof address.state === "string" ? address.state : null,
          city: typeof address.city === "string" ? address.city : null,
          district: typeof address.district === "string" ? address.district : null,
          street: typeof address.street === "string" ? address.street : null,
          number: typeof address.number === "string" ? address.number : null,
          complement: typeof address.complement === "string" ? address.complement : null,
          reference: typeof address.reference === "string" ? address.reference : null,
          fullAddress:
            typeof (address.full_address ?? address.fullAddress) === "string"
              ? String(address.full_address ?? address.fullAddress)
              : null,
        }
      : undefined,
    store: store
      ? {
          id: Number(store.id),
          name: String(store.name),
          slug: String(store.slug),
          whatsapp: typeof store.whatsapp === "string" ? store.whatsapp : null,
          pixKey:
            typeof (store.pix_key ?? store.pixKey) === "string"
              ? String(store.pix_key ?? store.pixKey)
              : null,
          city: typeof store.city === "string" ? store.city : null,
          state: typeof store.state === "string" ? store.state : null,
        }
      : undefined,
    items: Array.isArray(source.items)
      ? source.items.map((item) => {
          const entry = item as Record<string, unknown>;
          const product = entry.product && typeof entry.product === "object"
            ? (entry.product as Record<string, unknown>)
            : undefined;

          return {
            id: Number(entry.id),
            productId: Number(entry.product_id ?? entry.productId),
            productNameSnapshot: String(entry.product_name_snapshot ?? entry.productNameSnapshot),
            quantity: Number(entry.quantity),
            unitPrice: toNumberValue(entry.unit_price ?? entry.unitPrice),
            lineTotal: toNumberValue(entry.line_total ?? entry.lineTotal),
            categoryId:
              entry.category_id !== undefined && entry.category_id !== null
                ? Number(entry.category_id)
                : entry.categoryId !== undefined && entry.categoryId !== null
                  ? Number(entry.categoryId)
                  : null,
            product: product
              ? {
                  id: Number(product.id),
                  name: String(product.name),
                  slug: String(product.slug),
                  mainImageUrl:
                    typeof (product.main_image_url ?? product.mainImageUrl) === "string"
                      ? String(product.main_image_url ?? product.mainImageUrl)
                      : null,
                }
              : undefined,
          };
        })
      : [],
    createdAt: String(source.created_at ?? source.createdAt),
    updatedAt: String(source.updated_at ?? source.updatedAt),
  };
};

export async function submitCheckoutOrder(input: CheckoutSubmitInput): Promise<CheckoutApiOrderResult> {
  if (shouldUseMocks) {
    throw new Error("A API real de checkout ainda nao esta configurada neste ambiente.");
  }

  const response = await fetch(`${resolvedEndpoints.orders}/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      store_id: Number(input.storeId),
      delivery_type: input.deliveryType === "entrega" ? "delivery" : "pickup",
      payment_method: input.paymentMethod,
      shipping_cost: input.shippingCost,
      notes: input.notes,
      customer: {
        name: input.customer.fullName,
        email: input.customer.email || null,
        phone: normalizeWhatsappDigits(input.customer.whatsapp),
        whatsapp: normalizeWhatsappDigits(input.customer.whatsapp),
      },
      address: input.address
        ? {
            zip_code: input.address.zipCode,
            state: input.address.state,
            city: input.address.city,
            district: input.address.district,
            street: input.address.street,
            number: input.address.number,
            complement: input.address.complement || null,
            reference: input.address.reference || null,
          }
        : null,
      items: input.items.map((item) => ({
        product_id: Number(item.productId),
        quantity: item.quantity,
      })),
    }),
    cache: "no-store",
  });

  const payload = (await response.json()) as { data?: unknown; message?: string; details?: string[] };

  if (!response.ok || !payload.data) {
    const detailLabel = Array.isArray(payload.details) && payload.details.length > 0 ? ` ${payload.details.join(" ")}` : "";
    throw new Error(`${payload.message ?? "Nao foi possivel finalizar o checkout na API."}${detailLabel}`.trim());
  }

  return mapCheckoutApiOrderResult(payload.data);
}

const getStoreAddressLabel = (store: StoreSummary) =>
  [
    [store.street, store.number].filter(Boolean).join(", "),
    store.district,
    [store.city, store.state].filter(Boolean).join(" - "),
    store.zipCode,
  ]
    .filter(Boolean)
    .join(" | ");


interface ApiStoreSummaryRecord {
  id: number;
  name: string;
  slug: string;
}

const reportPeriods: ReportPeriod[] = ["dia", "semana", "mes"];

const mapApiStoreSummaryRecord = (payload: Record<string, unknown>): ApiStoreSummaryRecord => ({
  id: Number(payload.id),
  name: String(payload.name),
  slug: String(payload.slug),
});

const mapSellerApiReportResult = (payload: unknown): SellerApiReportResult => {
  const source = payload as Record<string, unknown>;
  const summary = (source.summary ?? {}) as Record<string, unknown>;
  const byCategorySource = Array.isArray(source.by_category) ? source.by_category : [];

  return {
    period: (source.period as ReportPeriod) ?? "mes",
    summary: {
      revenue: toNumberValue(summary.revenue),
      orders: Number(summary.orders ?? 0),
      averageTicket: toNumberValue(summary.average_ticket ?? summary.averageTicket),
    },
    byCategory: byCategorySource.map((item) => {
      const entry = item as Record<string, unknown>;
      return {
        categoryId: String(entry.category_id ?? entry.categoryId ?? ""),
        categoryName: String(entry.category_name ?? entry.categoryName ?? "Sem categoria"),
        revenue: toNumberValue(entry.revenue),
        orders: Number(entry.orders ?? 0),
        units: Number(entry.units ?? 0),
      };
    }),
  };
};

const mapAdminApiReportResult = (payload: unknown): AdminApiReportResult => {
  const source = payload as Record<string, unknown>;
  const summary = (source.summary ?? {}) as Record<string, unknown>;
  const byStoreSource = Array.isArray(source.by_store) ? source.by_store : [];

  return {
    period: (source.period as ReportPeriod) ?? "mes",
    summary: {
      revenue: toNumberValue(summary.revenue),
      orders: Number(summary.orders ?? 0),
      averageTicket: toNumberValue(summary.average_ticket ?? summary.averageTicket),
    },
    byStore: byStoreSource.map((item) => {
      const entry = item as Record<string, unknown>;
      return {
        storeId: String(entry.store_id ?? entry.storeId ?? ""),
        storeName: String(entry.store_name ?? entry.storeName ?? "Loja sem nome"),
        sales: toNumberValue(entry.sales),
        orders: Number(entry.orders ?? 0),
        newProducts: Number(entry.new_products ?? entry.newProducts ?? 0),
        newCustomers: Number(entry.new_customers ?? entry.newCustomers ?? 0),
      };
    }),
  };
};

async function fetchApiList<T = Record<string, unknown>>(url: string): Promise<T[]> {
  const response = await fetch(url, { cache: "no-store" });
  const payload = (await response.json()) as { data?: T[]; message?: string };

  if (!response.ok) {
    throw new Error(payload.message ?? "Nao foi possivel carregar a lista da API.");
  }

  return Array.isArray(payload.data) ? payload.data : [];
}

async function fetchApiPayload<T>(url: string, mapper: (payload: unknown) => T): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  const payload = (await response.json()) as { data?: unknown; message?: string };

  if (!response.ok || !payload.data) {
    throw new Error(payload.message ?? "Nao foi possivel carregar os dados da API.");
  }

  return mapper(payload.data);
}

const mapApiSellerOrder = (payload: unknown): SellerOrder => {
  const order = mapCheckoutApiOrderResult(payload);

  return {
    id: String(order.id),
    code: order.code,
    storeId: String(order.storeId),
    storeName: order.store?.name ?? "Loja da API",
    customerName: order.customer?.name ?? "Cliente da API",
    createdAt: order.createdAt,
    paymentStatus:
      order.paymentStatus === "paid"
        ? "pago"
        : order.paymentStatus === "failed"
          ? "falhou"
          : "pendente",
    status:
      order.orderStatus === "draft"
        ? "rascunho"
        : order.orderStatus === "paid"
          ? "pago"
          : order.orderStatus === "preparing"
            ? "em_preparo"
            : order.orderStatus === "shipped"
              ? "enviado"
              : order.orderStatus === "completed"
                ? "concluido"
                : order.orderStatus === "cancelled"
                  ? "cancelado"
                  : "aguardando_pagamento",
    total: order.total,
    itemCount: order.itemsCount,
    deliveryType: order.deliveryType === "delivery" ? "entrega" : "retirada",
    items: order.items.map((item) => ({
      id: String(item.id),
      productId: String(item.productId),
      productName: item.productNameSnapshot,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      categoryId: item.categoryId ? String(item.categoryId) : "",
    })),
  };
};

export async function getSellerApiOrdersByStoreSlug(
  storeSlug: string,
): Promise<{ targetStore?: ApiStoreSummaryRecord; matchedBySlug: boolean; orders: SellerOrder[] }> {
  if (shouldUseMocks) {
    return { matchedBySlug: false, orders: [] };
  }

  const apiStores = (await fetchApiList<Record<string, unknown>>(resolvedEndpoints.stores)).map(mapApiStoreSummaryRecord);

  if (apiStores.length === 0) {
    return { matchedBySlug: false, orders: [] };
  }

  const matchedStore = apiStores.find((store) => store.slug === storeSlug);
  const targetStore = matchedStore ?? apiStores[0];
  const ordersResponse = await fetch(`${resolvedEndpoints.orders}?store_id=${targetStore.id}`, { cache: "no-store" });
  const ordersPayload = (await ordersResponse.json()) as { data?: unknown[] };
  const orders = Array.isArray(ordersPayload.data) ? ordersPayload.data.map(mapApiSellerOrder) : [];

  return {
    targetStore,
    matchedBySlug: Boolean(matchedStore),
    orders,
  };
}

export async function getSellerApiReportByStoreSlug(storeSlug: string): Promise<SellerApiReportBundle> {
  if (shouldUseMocks) {
    return {
      matchedBySlug: false,
      snapshots: reportPeriods.map((period) => ({ period, revenue: 0, orders: 0, averageTicket: 0 })),
      byCategory: [],
    };
  }

  const apiStores = (await fetchApiList<Record<string, unknown>>(resolvedEndpoints.stores)).map(mapApiStoreSummaryRecord);

  if (apiStores.length === 0) {
    return {
      matchedBySlug: false,
      snapshots: reportPeriods.map((period) => ({ period, revenue: 0, orders: 0, averageTicket: 0 })),
      byCategory: [],
    };
  }

  const matchedStore = apiStores.find((store) => store.slug === storeSlug);
  const targetStore = matchedStore ?? apiStores[0];
  const reports = await Promise.all(
    reportPeriods.map((period) =>
      fetchApiPayload(
        `${resolvedEndpoints.reports}/seller?store_id=${targetStore.id}&period=${period}`,
        mapSellerApiReportResult,
      ),
    ),
  );

  const mesReport = reports.find((report) => report.period === "mes") ?? reports[reports.length - 1];

  return {
    matchedBySlug: Boolean(matchedStore),
    targetStoreId: String(targetStore.id),
    targetStoreName: targetStore.name,
    snapshots: reports.map((report) => ({
      period: report.period,
      revenue: report.summary.revenue,
      orders: report.summary.orders,
      averageTicket: report.summary.averageTicket,
    })),
    byCategory: mesReport?.byCategory ?? [],
  };
}

export async function getAdminApiReportSummary(): Promise<AdminApiReportBundle> {
  if (shouldUseMocks) {
    return {
      periodSnapshots: reportPeriods.map((period) => ({ period, revenue: 0, orders: 0, averageTicket: 0 })),
      byStore: [],
    };
  }

  const reports = await Promise.all(
    reportPeriods.map((period) =>
      fetchApiPayload(`${resolvedEndpoints.reports}/admin?period=${period}`, mapAdminApiReportResult),
    ),
  );

  const mesReport = reports.find((report) => report.period === "mes") ?? reports[reports.length - 1];

  return {
    periodSnapshots: reports.map((report) => ({
      period: report.period,
      revenue: report.summary.revenue,
      orders: report.summary.orders,
      averageTicket: report.summary.averageTicket,
    })),
    byStore: mesReport?.byStore ?? [],
  };
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
  confirmedOrderCode?: string,
): Promise<OrderSuccessPreview | undefined> {
  const checkout = await getCheckoutPreviewByStoreSlug(storeSlug, selectedProductSlug, quantity);

  if (!checkout) {
    return undefined;
  }

  return {
    checkout: {
      ...checkout,
      orderCode: confirmedOrderCode ?? checkout.orderCode,
      confirmationLabel: confirmedOrderCode
        ? "Pedido confirmado com persistencia real na API e pronto para acompanhamento operacional."
        : checkout.confirmationLabel,
    },
    etaLabel:
      checkout.cart.deliveryType === "entrega" ? "Entrega prevista para hoje ate 18h" : "Retirada disponivel em ate 40 minutos",
    supportLabel: `Acompanhamento inicial pelo WhatsApp ${checkout.cart.store.whatsapp}`,
    nextStepLabel: confirmedOrderCode
      ? "Pedido salvo no PostgreSQL e pronto para evoluir com status reais no painel."
      : "Pedido confirmado no frontend e pronto para futura integracao com API e status reais.",
  };
}
