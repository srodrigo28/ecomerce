export type UserRole = "admin" | "lojista" | "cliente";

export type StoreStatus = "ativo" | "inativo";

export type OrderStatus =
  | "rascunho"
  | "aguardando_pagamento"
  | "pago"
  | "em_preparo"
  | "enviado"
  | "concluido"
  | "cancelado";

export type ProductImageSource = "upload" | "url" | "api";
export type StockMovementType = "entrada" | "saida" | "ajuste";
export type StockMovementSource = "manual" | "pedido" | "reposicao" | "cancelamento";
export type ReportPeriod = "dia" | "semana" | "mes";
export type CartDeliveryType = "entrega" | "retirada";

export interface StoreSummary {
  id: string;
  name: string;
  slug: string;
  ownerEmail?: string;
  city?: string;
  state?: string;
  district?: string;
  street?: string;
  number?: string;
  zipCode?: string;
  complement?: string;
  deliveryLabel?: string;
  coverImageUrl?: string;
  whatsapp?: string;
  pixKey?: string;
  status: StoreStatus;
}

export interface CategoryBase {
  id: string;
  name: string;
  slug: string;
  active: boolean;
}

export interface Category {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  active: boolean;
  origin?: "base" | "custom";
}

export interface ProductImage {
  id: string;
  source: ProductImageSource;
  name: string;
  previewUrl: string;
  file?: File;
  apiImageId?: string;
  isMain?: boolean;
}

export interface ProductApiImageMeta {
  id: string;
  name: string;
  imageUrl: string;
  isMain: boolean;
  position?: number;
}

export interface Product {
  id: string;
  storeId: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  priceRetail: number;
  priceWholesale?: number;
  pricePromotion?: number;
  stock: number;
  minStock?: number;
  imageUrls: string[];
  images?: ProductApiImageMeta[];
  featured?: boolean;
}

export interface StockMovement {
  id: string;
  storeId: string;
  productId: string;
  type: StockMovementType;
  source: StockMovementSource;
  quantity: number;
  previousStock: number;
  currentStock: number;
  createdAt: string;
  note?: string;
}

export interface SellerOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  categoryId: string;
}

export interface SellerOrder {
  id: string;
  code: string;
  storeId: string;
  storeName: string;
  customerName: string;
  createdAt: string;
  paymentStatus: "pendente" | "pago" | "falhou";
  status: OrderStatus;
  total: number;
  itemCount: number;
  deliveryType: "entrega" | "retirada";
  items: SellerOrderItem[];
}

export interface SellerReportByCategory {
  categoryId: string;
  categoryName: string;
  revenue: number;
  orders: number;
  units: number;
}

export interface SellerReportSnapshot {
  period: ReportPeriod;
  revenue: number;
  orders: number;
  averageTicket: number;
}

export interface SellerReportSummary {
  snapshots: SellerReportSnapshot[];
  byCategory: SellerReportByCategory[];
}

export interface SellerStats {
  activeProducts: number;
  lowStockProducts: number;
  pendingOrders: number;
  catalogViews: number;
  salesToday: number;
  salesWeek: number;
  salesMonth: number;
}

export interface SellerWorkspace {
  store: StoreSummary;
  categoryBases: CategoryBase[];
  categories: Category[];
  products: Product[];
  stockMovements: StockMovement[];
  orders: SellerOrder[];
  reportSummary: SellerReportSummary;
  stats: SellerStats;
}

export interface AdminSummaryStats {
  totalStores: number;
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  salesToday: number;
  salesWeek: number;
  salesMonth: number;
}

export interface AdminStoreSnapshot {
  storeId: string;
  storeName: string;
  sales: number;
  orders: number;
  newProducts: number;
  newCustomers: number;
}

export interface AdminReportSummary {
  periodSnapshots: SellerReportSnapshot[];
  byStore: AdminStoreSnapshot[];
}

export interface AdminWorkspace {
  stats: AdminSummaryStats;
  stores: StoreSummary[];
  orders: SellerOrder[];
  reportSummary: AdminReportSummary;
}

export interface SellerApiReportResult {
  period: ReportPeriod;
  summary: {
    revenue: number;
    orders: number;
    averageTicket: number;
  };
  byCategory: SellerReportByCategory[];
}

export interface SellerApiReportBundle {
  matchedBySlug: boolean;
  targetStoreId?: string;
  targetStoreName?: string;
  snapshots: SellerReportSnapshot[];
  byCategory: SellerReportByCategory[];
}

export interface AdminApiReportResult {
  period: ReportPeriod;
  summary: {
    revenue: number;
    orders: number;
    averageTicket: number;
  };
  byStore: AdminStoreSnapshot[];
}

export interface AdminApiReportBundle {
  periodSnapshots: SellerReportSnapshot[];
  byStore: AdminStoreSnapshot[];
}

export interface CartPreviewItem {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  categoryName?: string;
}

export interface CartPreview {
  store: StoreSummary;
  items: CartPreviewItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  deliveryType: CartDeliveryType;
  paymentLabel: string;
}

export interface CheckoutCustomerPreview {
  fullName: string;
  whatsapp: string;
  email: string;
}

export interface CheckoutAddressPreview {
  street: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
}


export interface CheckoutSubmitAddressInput {
  zipCode: string;
  state: string;
  city: string;
  district: string;
  street: string;
  number: string;
  complement?: string;
  reference?: string;
}

export interface CheckoutSubmitCustomerInput {
  fullName: string;
  whatsapp: string;
  email: string;
}

export interface CheckoutSubmitInput {
  storeId: string;
  deliveryType: CartDeliveryType;
  paymentMethod: string;
  shippingCost: number;
  notes?: string;
  customer: CheckoutSubmitCustomerInput;
  address?: CheckoutSubmitAddressInput;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface CheckoutApiOrderItem {
  id: number;
  productId: number;
  productNameSnapshot: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  categoryId?: number | null;
  product?: {
    id: number;
    name: string;
    slug: string;
    mainImageUrl?: string | null;
  };
}

export interface CheckoutApiOrderResult {
  id: number;
  code: string;
  storeId: number;
  customerId: number;
  addressId?: number | null;
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  deliveryType: string;
  notes?: string | null;
  itemsCount: number;
  customer?: {
    id: number;
    name: string;
    whatsapp?: string | null;
    email?: string | null;
    cpf?: string | null;
  };
  address?: {
    id: number;
    zipCode?: string | null;
    state?: string | null;
    city?: string | null;
    district?: string | null;
    street?: string | null;
    number?: string | null;
    complement?: string | null;
    reference?: string | null;
    fullAddress?: string | null;
  };
  store?: {
    id: number;
    name: string;
    slug: string;
    whatsapp?: string | null;
    pixKey?: string | null;
    city?: string | null;
    state?: string | null;
  };
  items: CheckoutApiOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutPreview {
  cart: CartPreview;
  customer: CheckoutCustomerPreview;
  address: CheckoutAddressPreview;
  orderCode: string;
  note: string;
  confirmationLabel: string;
}

export interface OrderSuccessPreview {
  checkout: CheckoutPreview;
  etaLabel: string;
  supportLabel: string;
  nextStepLabel: string;
}

export interface StorePurchasePreview {
  store: StoreSummary;
  product: Product;
  category?: Category;
  suggestedQuantity: number;
  whatsappNumber: string;
  pixKey?: string;
  addressLabel: string;
  deliveryLabel: string;
  shareUrl: string;
}

export interface LocalOrderDraftItem {
  productId: string;
  productName: string;
  productSlug: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface LocalOrderDraft {
  id: string;
  code: string;
  createdAt: string;
  storeId: string;
  storeSlug: string;
  storeName: string;
  storeWhatsapp?: string;
  pixKey?: string;
  customerName: string;
  customerWhatsapp: string;
  notes?: string;
  deliveryType: CartDeliveryType;
  addressLabel: string;
  items: LocalOrderDraftItem[];
  subtotal: number;
  total: number;
  status: "rascunho_local";
}

export interface SellerProductSubmitInput {
  productId?: string;
  storeId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  priceRetail: number;
  priceWholesale?: number;
  pricePromotion?: number;
  stock: number;
  minStock: number;
  images: ProductImage[];
  mainImageId?: string;
}

export interface ProductFormDraft {
  name: string;
  description: string;
  categoryId: string;
  newCategoryName: string;
  priceRetail: string;
  priceWholesale: string;
  pricePromotion: string;
  stock: string;
  minStock: string;
  shelfSection: string;
  shelfPosition: string;
  sizeLabel: string;
  audience: string;
  images: ProductImage[];
}

export interface PublicSearchProductMatch {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  categoryName?: string;
  priceRetail: number;
}

export interface PublicSearchStoreResult {
  store: StoreSummary;
  matchedCategories: string[];
  matchedProducts: PublicSearchProductMatch[];
}

export interface PublicCatalogSearchResult {
  query: string;
  totalStores: number;
  results: PublicSearchStoreResult[];
}

export interface ApiListResponse<T> {
  data: T[];
  total: number;
}
