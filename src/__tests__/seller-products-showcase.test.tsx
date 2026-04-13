import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SellerProductsShowcase } from "@/components/seller-products-showcase";
import {
  deleteLocalSellerProduct,
  readLocalSellerProducts,
  saveLocalSellerProduct,
  subscribeLocalSellerProducts,
} from "@/lib/local-product-storage";
import type { SellerWorkspace } from "@/types/catalog";

const pushMock = jest.fn();
const refreshMock = jest.fn();
const persistedImageUrl = "data:image/png;base64,ZmFrZS1pbWFnZQ==";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

jest.mock("@/lib/services/catalog-service", () => ({
  deleteSellerProduct: jest.fn(),
  deleteSellerProductImage: jest.fn(),
  getSellerProductById: jest.fn(),
  submitSellerProduct: jest.fn(),
}));

jest.mock("@/lib/local-product-storage", () => ({
  deleteLocalSellerProduct: jest.fn(),
  readLocalSellerProducts: jest.fn(),
  saveLocalSellerProduct: jest.fn(),
  subscribeLocalSellerProducts: jest.fn(() => () => undefined),
}));

const workspace: SellerWorkspace = {
  store: {
    id: "101",
    name: "Atelie Solar",
    slug: "atelie-solar",
    ownerEmail: "renata@ateliesolar.com",
    status: "ativo",
  },
  categoryBases: [],
  categories: [
    {
      id: "cat-camisetas",
      storeId: "101",
      name: "Camisetas",
      slug: "camisetas",
      active: true,
      origin: "custom",
    },
    {
      id: "cat-infantil",
      storeId: "101",
      name: "Infantil",
      slug: "infantil",
      active: true,
      origin: "custom",
    },
  ],
  products: [],
  stockMovements: [],
  orders: [],
  reportSummary: {
    snapshots: [],
    byCategory: [],
  },
  stats: {
    activeProducts: 1,
    lowStockProducts: 0,
    pendingOrders: 0,
    catalogViews: 0,
    salesToday: 0,
    salesWeek: 0,
    salesMonth: 0,
  },
};

const localProduct = {
  id: "local-1",
  storeId: "101",
  storeName: "Atelie Solar",
  name: "Camiseta Basica",
  slug: "camiseta-basica",
  description: "Malha leve para o dia a dia",
  categoryId: "cat-camisetas",
  categoryName: "Camisetas",
  priceRetail: 39.9,
  priceWholesale: 29.9,
  pricePromotion: 34.9,
  stock: 8,
  minStock: 2,
  images: [
    {
      id: "img-local-1",
      name: "camiseta-basica.png",
      previewUrl: persistedImageUrl,
    },
  ],
  mainImageUrl: persistedImageUrl,
  createdAt: "2026-04-13T12:00:00.000Z",
};

describe("SellerProductsShowcase", () => {
  beforeEach(() => {
    pushMock.mockReset();
    refreshMock.mockReset();
    (readLocalSellerProducts as jest.Mock).mockReturnValue([localProduct]);
    (saveLocalSellerProduct as jest.Mock).mockReset();
    (deleteLocalSellerProduct as jest.Mock).mockReset();
    (subscribeLocalSellerProducts as jest.Mock).mockClear();

    Object.defineProperty(window, "open", {
      writable: true,
      value: jest.fn(),
    });
  });

  it("deve permitir editar rapidamente um produto local pela tela de produtos", async () => {
    const user = userEvent.setup();

    render(<SellerProductsShowcase workspace={workspace} />);

    await user.click(screen.getByRole("button", { name: "Gerenciar" }));
    expect(screen.getByRole("button", { name: "Editar" })).toHaveClass("h-14", "w-14", "border-amber-300", "bg-amber-100", "text-amber-700");
    expect(screen.getByRole("button", { name: "Compartilhar" })).toHaveClass("h-14", "w-14", "border-sky-300", "bg-sky-100", "text-sky-700");
    expect(screen.getByRole("button", { name: "Excluir" })).toHaveClass("h-14", "w-14", "border-rose-300", "bg-rose-600", "text-white");
    await user.clear(screen.getByLabelText("Titulo"));
    await user.type(screen.getByLabelText("Titulo"), "Camiseta Premium");
    await user.selectOptions(screen.getAllByLabelText("Categoria")[1], "cat-infantil");
    await user.click(screen.getByRole("button", { name: "Precos" }));
    await user.clear(screen.getByLabelText("Preco varejo"));
    await user.type(screen.getByLabelText("Preco varejo"), "59.9");
    await user.clear(screen.getByLabelText("Preco atacado"));
    await user.type(screen.getByLabelText("Preco atacado"), "44.9");
    await user.clear(screen.getByLabelText("Preco promocional"));
    await user.type(screen.getByLabelText("Preco promocional"), "49.9");
    await user.clear(screen.getByLabelText("Quantidade"));
    await user.type(screen.getByLabelText("Quantidade"), "14");
    await user.click(screen.getByRole("button", { name: "Salvar alteracoes" }));

    await waitFor(() => {
      expect(saveLocalSellerProduct).toHaveBeenCalledWith({
        id: "local-1",
        storeId: "101",
        storeName: "Atelie Solar",
        name: "Camiseta Premium",
        slug: "camiseta-basica",
        description: "Malha leve para o dia a dia",
        categoryId: "cat-infantil",
        categoryName: "Infantil",
        priceRetail: 59.9,
        priceWholesale: 44.9,
        pricePromotion: 49.9,
        stock: 14,
        minStock: 2,
        mainImageUrl: persistedImageUrl,
        createdAt: "2026-04-13T12:00:00.000Z",
        images: [
          {
            id: "img-local-1",
            name: "camiseta-basica.png",
            previewUrl: persistedImageUrl,
          },
        ],
      });
    });

    expect(await screen.findByText("Produto Camiseta Premium atualizado com sucesso.")).toBeInTheDocument();
  });

  it("deve permitir excluir um produto local pela tela de produtos", async () => {
    const user = userEvent.setup();

    render(<SellerProductsShowcase workspace={workspace} />);

    await user.click(screen.getByRole("button", { name: "Gerenciar" }));
    await user.click(screen.getByRole("button", { name: "Excluir" }));
    await user.click(screen.getByRole("button", { name: "Confirmar exclusao" }));

    await waitFor(() => {
      expect(deleteLocalSellerProduct).toHaveBeenCalledWith("local-1");
    });

    expect(await screen.findByText("Produto Camiseta Basica removido com sucesso.")).toBeInTheDocument();
  });
});
