import { apiConfig, resolvedEndpoints } from "@/lib/config";
import { mockAdminWorkspace, mockCategories, mockProducts, mockStores } from "@/lib/mock-data";
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
  ProductApiImageMeta,
  PublicCatalogSearchResult,
  PublicSearchProductMatch,
  PublicSearchStoreResult,
  ReportPeriod,
  SellerApiReportBundle,
  SellerApiReportResult,
  SellerOrder,
  SellerProductSubmitInput,
  SellerWorkspace,
  StockMovement,
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

export interface StoreSignupSubmitInput {
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  whatsapp: string;
  cnpj: string;
  pixKey: string;
  zipCode: string;
  state: string;
  city: string;
  district: string;
  street: string;
  number: string;
  complement?: string;
}

export interface SellerCategoryUpsertInput {
  storeId: string;
  name: string;
  slug: string;
  active: boolean;
  categoryBaseId?: string | null;
}

const normalizeSearchValue = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();


const normalizeWhatsappDigits = (value: string) => value.replace(/\D/g, "");
const onlyDigits = (value: string) => value.replace(/\D/g, "");

const toNumberValue = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toNullableString = (value: unknown) => (typeof value === "string" && value.trim() ? value : undefined);

const resolveApiAssetUrl = (value: unknown) => {
  const rawValue = toNullableString(value);

  if (!rawValue) return undefined;
  if (/^https?:\/\//i.test(rawValue)) return rawValue;

  const apiOrigin = apiConfig.baseUrl.replace(/\/api\/v\d+$/i, "").replace(/\/$/, "");
  return apiOrigin ? `${apiOrigin}${rawValue.startsWith("/") ? rawValue : `/${rawValue}`}` : rawValue;
};

const emptySellerStore: StoreSummary = {
  id: "store-empty",
  name: "Sua loja",
  slug: "sua-loja",
  status: "ativo",
};

const createEmptySellerWorkspace = (store: StoreSummary = emptySellerStore): SellerWorkspace => ({
  store,
  categoryBases: [],
  categories: [],
  products: [],
  stockMovements: [],
  orders: [],
  reportSummary: {
    snapshots: reportPeriods.map((period) => ({ period, revenue: 0, orders: 0, averageTicket: 0 })),
    byCategory: [],
  },
  stats: {
    activeProducts: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
    catalogViews: 0,
    salesToday: 0,
    salesWeek: 0,
    salesMonth: 0,
  },
});

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
                  mainImageUrl: resolveApiAssetUrl(product.main_image_url ?? product.mainImageUrl) ?? null,
                }
              : undefined,
          };
        })
      : [],
    createdAt: String(source.created_at ?? source.createdAt),
    updatedAt: String(source.updated_at ?? source.updatedAt),
  };
};

export async function submitStoreSignup(input: StoreSignupSubmitInput) {
  if (shouldUseMocks) {
    throw new Error("A API real de lojas ainda nao esta configurada neste ambiente.");
  }

  const response = await fetch(resolvedEndpoints.stores, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: input.name,
      slug: input.slug,
      owner_name: input.ownerName,
      owner_email: input.ownerEmail,
      whatsapp: normalizeWhatsappDigits(input.whatsapp),
      cnpj: onlyDigits(input.cnpj),
      pix_key: input.pixKey,
      zip_code: input.zipCode,
      state: input.state,
      city: input.city,
      district: input.district,
      street: input.street,
      number: input.number,
      complement: input.complement || null,
      status: "draft",
    }),
    cache: "no-store",
  });

  const payload = (await response.json()) as { data?: Record<string, unknown>; message?: string; details?: string[] };

  if (!response.ok || !payload.data) {
    const detailLabel = Array.isArray(payload.details) && payload.details.length > 0 ? ` ${payload.details.join(" ")}` : "";
    throw new Error(`${payload.message ?? "Nao foi possivel cadastrar a loja na API."}${detailLabel}`.trim());
  }

  return {
    id: Number(payload.data.id),
    name: String(payload.data.name ?? input.name),
    slug: String(payload.data.slug ?? input.slug),
  };
}

export async function createSellerCategory(input: SellerCategoryUpsertInput): Promise<Category> {
  if (shouldUseMocks) {
    throw new Error("A API real de categorias ainda nao esta configurada neste ambiente.");
  }

  const response = await fetch(resolvedEndpoints.categories, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      store_id: Number(input.storeId),
      category_base_id: input.categoryBaseId ? Number(input.categoryBaseId) : null,
      name: input.name,
      slug: input.slug,
      description: null,
      status: input.active ? "active" : "inactive",
      sort_order: 0,
    }),
    cache: "no-store",
  });

  const payload = (await response.json()) as { data?: Record<string, unknown>; message?: string; details?: string[] };

  if (!response.ok || !payload.data) {
    const detailLabel = Array.isArray(payload.details) && payload.details.length > 0 ? ` ${payload.details.join(" ")}` : "";
    throw new Error(`${payload.message ?? "Nao foi possivel criar a categoria na API."}${detailLabel}`.trim());
  }

  return mapApiCategory(payload.data);
}

export async function updateSellerCategory(categoryId: string, input: Partial<SellerCategoryUpsertInput>): Promise<Category> {
  if (shouldUseMocks) {
    throw new Error("A API real de categorias ainda nao esta configurada neste ambiente.");
  }

  const response = await fetch(`${resolvedEndpoints.categories}/${categoryId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...(input.storeId ? { store_id: Number(input.storeId) } : {}),
      ...(input.categoryBaseId !== undefined ? { category_base_id: input.categoryBaseId ? Number(input.categoryBaseId) : null } : {}),
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      ...(input.active !== undefined ? { status: input.active ? "active" : "inactive" } : {}),
    }),
    cache: "no-store",
  });

  const payload = (await response.json()) as { data?: Record<string, unknown>; message?: string; details?: string[] };

  if (!response.ok || !payload.data) {
    const detailLabel = Array.isArray(payload.details) && payload.details.length > 0 ? ` ${payload.details.join(" ")}` : "";
    throw new Error(`${payload.message ?? "Nao foi possivel atualizar a categoria na API."}${detailLabel}`.trim());
  }

  return mapApiCategory(payload.data);
}

export async function submitSellerProduct(input: SellerProductSubmitInput): Promise<Product> {
  if (shouldUseMocks) {
    throw new Error("A API real de produtos ainda nao esta configurada neste ambiente.");
  }

  const uploadImages = input.images.filter((image) => image.source === "upload" && image.file);
  const targetProductId = input.productId ? Number(input.productId) : null;

  if (!targetProductId && uploadImages.length === 0) {
    throw new Error("Adicione pelo menos 1 imagem por upload local para concluir o cadastro real do produto.");
  }

  const createResponse = await fetch(targetProductId ? `${resolvedEndpoints.products}/${targetProductId}` : resolvedEndpoints.products, {
    method: targetProductId ? "PATCH" : "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      store_id: Number(input.storeId),
      category_id: Number(input.categoryId),
      name: input.name,
      slug: input.slug,
      description_short: input.description || null,
      description_long: input.description || null,
      sku: null,
      price_retail: input.priceRetail,
      price_wholesale: input.priceWholesale ?? null,
      price_promotion: input.pricePromotion ?? null,
      stock: input.stock,
      min_stock: input.minStock,
      status: "draft",
      is_featured: false,
      notes: null,
    }),
    cache: "no-store",
  });

  const createPayload = (await createResponse.json()) as { data?: Record<string, unknown>; message?: string; details?: string[] };

  if (!createResponse.ok || !createPayload.data) {
    const detailLabel = Array.isArray(createPayload.details) && createPayload.details.length > 0 ? ` ${createPayload.details.join(" ")}` : "";
    throw new Error(`${createPayload.message ?? (targetProductId ? "Nao foi possivel atualizar o produto na API." : "Nao foi possivel criar o produto na API.")}${detailLabel}`.trim());
  }

  const createdProductId = Number(createPayload.data.id ?? targetProductId);

  if (uploadImages.length > 0) {
    const formData = new FormData();
    uploadImages.forEach((image) => {
      if (image.file) {
        formData.append("images", image.file, image.file.name);
      }
    });

    const uploadResponse = await fetch(`${resolvedEndpoints.products}/${createdProductId}/images`, {
      method: "POST",
      body: formData,
      cache: "no-store",
    });

    const uploadPayload = (await uploadResponse.json()) as { data?: Array<Record<string, unknown>>; message?: string; details?: string[] };

    if (!uploadResponse.ok) {
      const detailLabel = Array.isArray(uploadPayload.details) && uploadPayload.details.length > 0 ? ` ${uploadPayload.details.join(" ")}` : "";
      throw new Error(`${uploadPayload.message ?? "Nao foi possivel enviar as imagens do produto para a API."}${detailLabel}`.trim());
    }

    const selectedMainIndex = input.mainImageId
      ? uploadImages.findIndex((image) => image.id === input.mainImageId)
      : 0;

    if (selectedMainIndex >= 0 && Array.isArray(uploadPayload.data) && uploadPayload.data[selectedMainIndex]?.id) {
      await setSellerProductMainImage(String(createdProductId), String(uploadPayload.data[selectedMainIndex].id));
    }
  }

  return getSellerProductById(String(createdProductId));
}


export async function getSellerProductById(productId: string): Promise<Product> {
  if (shouldUseMocks) {
    throw new Error("A API real de produtos ainda nao esta configurada neste ambiente.");
  }

  const response = await fetch(`${resolvedEndpoints.products}/${productId}`, { cache: "no-store" });
  const payload = (await response.json()) as { data?: Record<string, unknown>; message?: string };

  if (!response.ok || !payload.data) {
    throw new Error(payload.message ?? "Nao foi possivel carregar o produto da API.");
  }

  return mapApiProduct(payload.data);
}

export async function setSellerProductMainImage(productId: string, imageId: string): Promise<void> {
  if (shouldUseMocks) {
    throw new Error("A API real de imagens ainda nao esta configurada neste ambiente.");
  }

  const response = await fetch(`${resolvedEndpoints.products}/${productId}/images/${imageId}/set-main`, {
    method: "POST",
    cache: "no-store",
  });

  const payload = (await response.json()) as { message?: string; details?: string[] };

  if (!response.ok) {
    const detailLabel = Array.isArray(payload.details) && payload.details.length > 0 ? ` ${payload.details.join(" ")}` : "";
    throw new Error(`${payload.message ?? "Nao foi possivel definir a imagem principal do produto."}${detailLabel}`.trim());
  }
}

export async function deleteSellerProductImage(productId: string, imageId: string): Promise<void> {
  if (shouldUseMocks) {
    throw new Error("A API real de imagens ainda nao esta configurada neste ambiente.");
  }

  const response = await fetch(`${resolvedEndpoints.products}/${productId}/images/${imageId}`, {
    method: "DELETE",
    cache: "no-store",
  });

  const payload = (await response.json()) as { message?: string; details?: string[] };

  if (!response.ok) {
    const detailLabel = Array.isArray(payload.details) && payload.details.length > 0 ? ` ${payload.details.join(" ")}` : "";
    throw new Error(`${payload.message ?? "Nao foi possivel remover a imagem do produto."}${detailLabel}`.trim());
  }
}

export async function deleteSellerProduct(productId: string): Promise<void> {
  if (shouldUseMocks) {
    throw new Error("A API real de produtos ainda nao esta configurada neste ambiente.");
  }

  const response = await fetch(`${resolvedEndpoints.products}/${productId}`, {
    method: "DELETE",
    cache: "no-store",
  });

  const payload = (await response.json()) as { message?: string; details?: string[] };

  if (!response.ok) {
    const detailLabel = Array.isArray(payload.details) && payload.details.length > 0 ? ` ${payload.details.join(" ")}` : "";
    throw new Error(`${payload.message ?? "Nao foi possivel remover o produto na API."}${detailLabel}`.trim());
  }
}

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

const mapApiStoreSummary = (payload: Record<string, unknown>): StoreSummary => ({
  id: String(payload.id),
  name: String(payload.name),
  slug: String(payload.slug),
  city: toNullableString(payload.city),
  state: toNullableString(payload.state),
  district: toNullableString(payload.district),
  street: toNullableString(payload.street),
  number: toNullableString(payload.number),
  zipCode: toNullableString(payload.zip_code ?? payload.zipCode),
  complement: toNullableString(payload.complement),
  whatsapp: toNullableString(payload.whatsapp),
  pixKey: toNullableString(payload.pix_key ?? payload.pixKey),
  status: String(payload.status ?? "ativo") === "inativo" ? "inativo" : "ativo",
});

const mapApiCategory = (payload: Record<string, unknown>): Category => ({
  id: String(payload.id),
  storeId: String(payload.store_id ?? payload.storeId),
  name: String(payload.name),
  slug: String(payload.slug),
  active: String(payload.status ?? "active") !== "inactive",
  origin: payload.category_base_id ?? payload.categoryBaseId ? "base" : "custom",
});

const mapApiProduct = (payload: Record<string, unknown>): Product => {
  const imageEntries = Array.isArray(payload.images) ? payload.images : [];
  const apiImages = imageEntries.reduce<ProductApiImageMeta[]>((accumulator, image, index) => {
    if (!image || typeof image !== "object") {
      return accumulator;
    }

    const record = image as Record<string, unknown>;
    const imageUrl = toNullableString(record.image_url ?? record.imageUrl);

    if (!imageUrl) {
      return accumulator;
    }

    accumulator.push({
      id: String(record.id ?? `image-${index + 1}`),
      name: String(record.filename ?? record.name ?? `Imagem ${index + 1}`),
      imageUrl,
      isMain: Boolean(record.is_main ?? record.isMain),
      position: Number(record.position ?? index + 1),
    });

    return accumulator;
  }, []);

  const fallbackMainImage = resolveApiAssetUrl(payload.main_image_url ?? payload.mainImageUrl);
  const orderedImages = [...apiImages].sort((left, right) => {
    if (left.isMain && !right.isMain) return -1;
    if (!left.isMain && right.isMain) return 1;
    return (left.position ?? 0) - (right.position ?? 0);
  });
  const imageUrls = orderedImages.map((image) => image.imageUrl);

  if (!imageUrls.length && fallbackMainImage) {
    imageUrls.push(fallbackMainImage);
  }

  return {
    id: String(payload.id),
    storeId: String(payload.store_id ?? payload.storeId),
    categoryId: String(payload.category_id ?? payload.categoryId),
    name: String(payload.name),
    slug: String(payload.slug),
    description: toNullableString(payload.description_short ?? payload.descriptionShort ?? payload.description_long ?? payload.descriptionLong),
    priceRetail: toNumberValue(payload.price_retail ?? payload.priceRetail),
    priceWholesale: payload.price_wholesale ?? payload.priceWholesale ? toNumberValue(payload.price_wholesale ?? payload.priceWholesale) : undefined,
    pricePromotion: payload.price_promotion ?? payload.pricePromotion ? toNumberValue(payload.price_promotion ?? payload.pricePromotion) : undefined,
    stock: Number(payload.stock ?? 0),
    minStock: Number(payload.min_stock ?? payload.minStock ?? 0),
    imageUrls,
    images: orderedImages,
    featured: Boolean(payload.is_featured ?? payload.isFeatured),
  };
};

const mapApiStockMovement = (payload: Record<string, unknown>): StockMovement => ({
  id: String(payload.id),
  storeId: String(payload.store_id ?? payload.storeId),
  productId: String(payload.product_id ?? payload.productId),
  type: String(payload.movement_type ?? payload.movementType) as StockMovement["type"],
  source: String(payload.source) as StockMovement["source"],
  quantity: Number(payload.quantity ?? 0),
  previousStock: Number(payload.previous_stock ?? payload.previousStock ?? 0),
  currentStock: Number(payload.current_stock ?? payload.currentStock ?? 0),
  createdAt: String(payload.created_at ?? payload.createdAt ?? new Date().toISOString()),
  note: toNullableString(payload.note),
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

  try {
    const stores = await fetchApiList<Record<string, unknown>>(resolvedEndpoints.stores);
    return stores.map(mapApiStoreSummary);
  } catch {
    return [];
  }
}

export async function getSellerWorkspace(storeSlug?: string): Promise<SellerWorkspace> {
  if (shouldUseMocks) {
    return createEmptySellerWorkspace(mockStores[0]);
  }

  try {
    const stores = await fetchApiList<Record<string, unknown>>(resolvedEndpoints.stores);

    if (stores.length === 0) {
      return createEmptySellerWorkspace();
    }

    const matchedStorePayload = storeSlug ? stores.find((store) => String(store.slug) === storeSlug) : undefined;
    const primaryStorePayload = matchedStorePayload ?? stores[stores.length - 1];
    const primaryStore = mapApiStoreSummary(primaryStorePayload);
    const storeId = Number(primaryStorePayload.id);

    const [categoriesPayload, productsPayload, stockPayload, sellerOrdersData, sellerReportData] = await Promise.all([
      fetchApiList<Record<string, unknown>>(`${resolvedEndpoints.categories}?store_id=${storeId}`),
      fetchApiList<Record<string, unknown>>(`${resolvedEndpoints.products}?store_id=${storeId}`),
      fetchApiList<Record<string, unknown>>(`${resolvedEndpoints.stock}/movements?store_id=${storeId}`),
      getSellerApiOrdersByStoreSlug(primaryStore.slug),
      getSellerApiReportByStoreSlug(primaryStore.slug),
    ]);

    const categories = categoriesPayload.map(mapApiCategory);
    const products = productsPayload.map(mapApiProduct);
    const stockMovements = stockPayload.map(mapApiStockMovement);
    const orders = sellerOrdersData.orders;
    const pendingOrders = orders.filter((order) => order.status !== "concluido" && order.status !== "cancelado").length;

    return {
      store: primaryStore,
      categoryBases: [],
      categories,
      products,
      stockMovements,
      orders,
      reportSummary: {
        snapshots: sellerReportData.snapshots,
        byCategory: sellerReportData.byCategory,
      },
      stats: {
        activeProducts: products.length,
        lowStockProducts: products.filter((product) => product.stock <= (product.minStock ?? 0)).length,
        pendingOrders,
        catalogViews: 0,
        salesToday: sellerReportData.snapshots.find((snapshot) => snapshot.period === "dia")?.revenue ?? 0,
        salesWeek: sellerReportData.snapshots.find((snapshot) => snapshot.period === "semana")?.revenue ?? 0,
        salesMonth: sellerReportData.snapshots.find((snapshot) => snapshot.period === "mes")?.revenue ?? 0,
      },
    };
  } catch {
    return createEmptySellerWorkspace();
  }
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

  if (shouldUseMocks) {
    const categories = mockCategories.filter((category) => category.storeId === store.id && category.active);
    const products = mockProducts.filter((product) => product.storeId === store.id);

    return {
      store,
      categories,
      products,
      featuredProducts: products.filter((product) => product.featured),
    };
  }

  try {
    const storeId = Number(store.id);
    const [categoriesPayload, productsPayload] = await Promise.all([
      fetchApiList<Record<string, unknown>>(`${resolvedEndpoints.categories}?store_id=${storeId}`),
      fetchApiList<Record<string, unknown>>(`${resolvedEndpoints.products}?store_id=${storeId}`),
    ]);

    const categories = categoriesPayload.map(mapApiCategory).filter((category) => category.active);
    const products = productsPayload.map(mapApiProduct);

    return {
      store,
      categories,
      products,
      featuredProducts: products.filter((product) => product.featured),
    };
  } catch {
    const categories = mockCategories.filter((category) => category.storeId === store.id && category.active);
    const products = mockProducts.filter((product) => product.storeId === store.id);

    return {
      store,
      categories,
      products,
      featuredProducts: products.filter((product) => product.featured),
    };
  }
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





