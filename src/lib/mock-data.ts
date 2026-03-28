import type { Category, Product, SellerWorkspace, StoreSummary } from "@/types/catalog";

export const mockStores: StoreSummary[] = [
  {
    id: "store-aurora",
    name: "Aurora Atelier",
    slug: "aurora-atelier",
    city: "Sao Paulo",
    state: "SP",
    coverImageUrl:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
    whatsapp: "11999990000",
    pixKey: "financeiro@auroraatelier.com",
    status: "ativo",
  },
  {
    id: "store-linha-fina",
    name: "Linha Fina Store",
    slug: "linha-fina-store",
    city: "Belo Horizonte",
    state: "MG",
    coverImageUrl:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80",
    whatsapp: "31999991111",
    pixKey: "pix@linhafina.com",
    status: "ativo",
  },
];

export const mockCategories: Category[] = [
  { id: "cat-vestidos", storeId: "store-aurora", name: "Vestidos", slug: "vestidos", active: true },
  { id: "cat-blazers", storeId: "store-aurora", name: "Blazers", slug: "blazers", active: true },
  { id: "cat-camisas", storeId: "store-aurora", name: "Camisas", slug: "camisas", active: true },
  { id: "cat-jeans", storeId: "store-linha-fina", name: "Jeans", slug: "jeans", active: true },
];

export const mockProducts: Product[] = [
  {
    id: "prod-aurora-1",
    storeId: "store-aurora",
    categoryId: "cat-vestidos",
    name: "Vestido Midi Aurora",
    slug: "vestido-midi-aurora",
    description: "Vestido midi em tecido leve para colecao de meia-estacao.",
    priceRetail: 249.9,
    priceWholesale: 189.9,
    pricePromotion: 219.9,
    stock: 12,
    imageUrls: [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
    ],
    featured: true,
  },
  {
    id: "prod-aurora-2",
    storeId: "store-aurora",
    categoryId: "cat-blazers",
    name: "Blazer Verona",
    slug: "blazer-verona",
    description: "Blazer estruturado para looks casuais e sociais.",
    priceRetail: 329.9,
    priceWholesale: 259.9,
    stock: 4,
    imageUrls: [
      "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    id: "prod-aurora-3",
    storeId: "store-aurora",
    categoryId: "cat-camisas",
    name: "Camisa Essencial Linho",
    slug: "camisa-essencial-linho",
    description: "Camisa de linho com modelagem ampla e acabamento premium.",
    priceRetail: 189.9,
    stock: 20,
    imageUrls: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
    ],
  },
];

export const mockSellerWorkspace: SellerWorkspace = {
  store: mockStores[0],
  categories: mockCategories.filter((category) => category.storeId === "store-aurora"),
  products: mockProducts.filter((product) => product.storeId === "store-aurora"),
  stats: {
    activeProducts: 18,
    lowStockProducts: 3,
    pendingOrders: 7,
    catalogViews: 1248,
  },
};