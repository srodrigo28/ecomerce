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

export type ProductImageSource = "upload" | "url";

export interface StoreSummary {
  id: string;
  name: string;
  slug: string;
  city?: string;
  state?: string;
  coverImageUrl?: string;
  whatsapp?: string;
  pixKey?: string;
  status: StoreStatus;
}

export interface Category {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  active: boolean;
}

export interface ProductImage {
  id: string;
  source: ProductImageSource;
  name: string;
  previewUrl: string;
  file?: File;
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
  imageUrls: string[];
  featured?: boolean;
}

export interface SellerStats {
  activeProducts: number;
  lowStockProducts: number;
  pendingOrders: number;
  catalogViews: number;
}

export interface SellerWorkspace {
  store: StoreSummary;
  categories: Category[];
  products: Product[];
  stats: SellerStats;
}

export interface ProductFormDraft {
  name: string;
  description: string;
  categoryId: string;
  priceRetail: string;
  priceWholesale: string;
  pricePromotion: string;
  stock: string;
  whatsapp: string;
  pixKey: string;
  images: ProductImage[];
}

export interface ApiListResponse<T> {
  data: T[];
  total: number;
}