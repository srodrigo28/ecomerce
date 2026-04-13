import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SellerProductForm } from "@/components/seller-product-form";
import { saveLocalSellerProduct } from "@/lib/local-product-storage";
import { submitSellerProduct } from "@/lib/services/catalog-service";
import type { SellerWorkspace } from "@/types/catalog";

const replaceMock = jest.fn();
const refreshMock = jest.fn();
const createObjectUrlMock = jest.fn(() => "blob:preview-produto");
const revokeObjectUrlMock = jest.fn();
const fileReaderDataUrl = "data:image/png;base64,ZmFrZS1pbWFnZQ==";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
    refresh: refreshMock,
  }),
}));

jest.mock("@/lib/services/catalog-service", () => ({
  createSellerCategory: jest.fn(),
  deleteSellerProductImage: jest.fn(),
  getSellerProductById: jest.fn(),
  setSellerProductMainImage: jest.fn(),
  submitSellerProduct: jest.fn(),
}));

jest.mock("@/lib/local-product-storage", () => ({
  saveLocalSellerProduct: jest.fn(),
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
  ],
  products: [],
  stockMovements: [],
  orders: [],
  reportSummary: {
    snapshots: [],
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
};

const fillRequiredFields = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText("Produto"), "Camiseta Basica");
  await user.type(screen.getByLabelText("Descricao"), "Malha leve para o dia a dia");
  await user.clear(screen.getByLabelText("Prateleira"));
  await user.type(screen.getByLabelText("Prateleira"), "B");
  await user.clear(screen.getByLabelText("Posicao"));
  await user.type(screen.getByLabelText("Posicao"), "12");
  await user.selectOptions(screen.getByLabelText("Selecione"), "Infantil");

  await user.type(screen.getByLabelText("Tamanho 1"), "34");
  await user.clear(screen.getByLabelText("Qtd 1"));
  await user.type(screen.getByLabelText("Qtd 1"), "10");
  await user.clear(screen.getByLabelText("Minimo 1"));
  await user.type(screen.getByLabelText("Minimo 1"), "1");

  await user.click(screen.getByRole("button", { name: "Adicionar tamanho" }));
  await user.type(screen.getByLabelText("Tamanho 2"), "36");
  await user.clear(screen.getByLabelText("Qtd 2"));
  await user.type(screen.getByLabelText("Qtd 2"), "15");
  await user.clear(screen.getByLabelText("Minimo 2"));
  await user.type(screen.getByLabelText("Minimo 2"), "2");
};

describe("SellerProductForm", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    replaceMock.mockReset();
    refreshMock.mockReset();
    createObjectUrlMock.mockClear();
    revokeObjectUrlMock.mockClear();
    (submitSellerProduct as jest.Mock).mockReset();
    (saveLocalSellerProduct as jest.Mock).mockReset();
    sessionStorage.clear();

    Object.defineProperty(URL, "createObjectURL", {
      writable: true,
      value: createObjectUrlMock,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      writable: true,
      value: revokeObjectUrlMock,
    });
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      writable: true,
      value: jest.fn(),
    });
    Object.defineProperty(global, "FileReader", {
      writable: true,
      value: class {
        public result: string | ArrayBuffer | null = null;
        public onload: null | (() => void) = null;
        public onerror: null | (() => void) = null;

        readAsDataURL() {
          this.result = fileReaderDataUrl;
          this.onload?.();
        }
      },
    });

    jest.spyOn(window.crypto, "randomUUID").mockReturnValue("uuid-local-1");
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("deve carregar imagens ao abrir a edicao por externalEditRequest", async () => {
    render(<SellerProductForm
      workspace={workspace}
      externalEditRequest={{
        id: "prod-201",
        source: "local",
        name: "Vestido Floral",
        slug: "vestido-floral",
        description: "Leve e solto",
        categoryId: "cat-camisetas",
        priceRetail: 79.9,
        stock: 12,
        minStock: 2,
        imageUrl: "/uploads/produtos/vestido-floral-capa.png",
        images: [
          { id: "api-img-1", name: "vestido-floral-1.png", imageUrl: "/uploads/produtos/vestido-floral-1.png", isMain: true },
          { id: "api-img-2", name: "vestido-floral-2.png", imageUrl: "/uploads/produtos/vestido-floral-2.png", isMain: false },
        ],
        variants: [
          { id: "variant-1", sizeLabel: "M", stock: 12, minStock: 2, position: 1 },
        ],
      }}
    />);

    expect(await screen.findByText("Produto Vestido Floral carregado para edicao. Revise os tamanhos, os estoques e salve novamente.")).toBeInTheDocument();
    expect(screen.getAllByRole("img", { name: "vestido-floral-1.png" })[0]).toHaveAttribute("src", "/uploads/produtos/vestido-floral-1.png");
    expect(screen.getAllByRole("img", { name: "vestido-floral-2.png" })[0]).toHaveAttribute("src", "/uploads/produtos/vestido-floral-2.png");
    expect(screen.getByLabelText("Produto")).toHaveValue("Vestido Floral");
  });

  it("deve cadastrar produto com varios tamanhos e enviar variants para a API", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const onCompleted = jest.fn();
    const imageFile = new File(["fake-image"], "camiseta-basica.png", {
      type: "image/png",
      lastModified: 1700000000000,
    });

    (submitSellerProduct as jest.Mock).mockResolvedValue({
      id: "prod-101",
      storeId: "101",
      categoryId: "cat-camisetas",
      name: "Camiseta Basica",
      slug: "camiseta-basica",
      description: "Malha leve para o dia a dia",
      priceRetail: 0,
      stock: 25,
      minStock: 3,
      imageUrls: ["/uploads/produtos/camiseta-basica.png"],
      variants: [
        { sizeLabel: "34", stock: 10, minStock: 1, position: 1 },
        { sizeLabel: "36", stock: 15, minStock: 2, position: 2 },
      ],
    });

    const { container } = render(<SellerProductForm workspace={workspace} onCompleted={onCompleted} />);
    const fileInput = container.querySelector('input[type="file"][multiple]') as HTMLInputElement;

    await fillRequiredFields(user);
    await user.upload(fileInput, imageFile);
    await user.click(screen.getByRole("button", { name: "Cadastrar" }));

    await waitFor(() => {
      expect(submitSellerProduct).toHaveBeenCalledWith({
        storeId: "101",
        categoryId: "cat-camisetas",
        name: "Camiseta Basica",
        slug: "camiseta-basica",
        description:
          "Malha leve para o dia a dia\n\n[operacao-loja]\nshelfSection=B\nshelfPosition=12\naudience=Infantil\n[/operacao-loja]",
        priceRetail: 0,
        priceWholesale: undefined,
        pricePromotion: undefined,
        stock: 25,
        minStock: 3,
        variants: [
          { sizeLabel: "34", stock: 10, minStock: 1, priceRetail: undefined, priceWholesale: undefined, pricePromotion: undefined, position: 1, id: undefined },
          { sizeLabel: "36", stock: 15, minStock: 2, priceRetail: undefined, priceWholesale: undefined, pricePromotion: undefined, position: 2, id: undefined },
        ],
        mainImageId: "upload-camiseta-basica.png-1700000000000-0",
        images: [
          expect.objectContaining({
            id: "upload-camiseta-basica.png-1700000000000-0",
            source: "upload",
            name: "camiseta-basica.png",
            previewUrl: "blob:preview-produto",
            file: imageFile,
          }),
        ],
        productId: undefined,
      });
    });

    expect(await screen.findByText("Produto Camiseta Basica cadastrado na API com sucesso.")).toBeInTheDocument();
    expect(screen.getByText("Camiseta Basica salvo com 2 tamanho(s), 1 imagem(ns) e categoria Camisetas.")).toBeInTheDocument();
    expect(onCompleted).toHaveBeenCalled();
    expect(replaceMock).toHaveBeenCalledWith("/painel-lojista/produtos#produtos-cadastrados");
    expect(sessionStorage.getItem("seller-products-scroll-target")).toBe("produtos-cadastrados");

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(refreshMock).toHaveBeenCalled();
    expect(screen.getByLabelText("Produto")).toHaveValue("");
    expect(screen.getByLabelText("Tamanho 1")).toHaveValue("");
  });

  it("deve exigir pelo menos um tamanho antes de concluir o cadastro", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(<SellerProductForm workspace={workspace} />);

    await user.type(screen.getByLabelText("Produto"), "Camiseta Basica");
    await user.click(screen.getByRole("button", { name: "Cadastrar" }));

    expect(screen.getByText("Adicione pelo menos 1 tamanho para concluir o cadastro do produto.")).toBeInTheDocument();
    expect(submitSellerProduct).not.toHaveBeenCalled();
  });

  it("deve salvar o produto localmente com variants quando a API nao estiver configurada", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const imageFile = new File(["fake-image"], "camiseta-basica.png", {
      type: "image/png",
      lastModified: 1700000000000,
    });

    (submitSellerProduct as jest.Mock).mockRejectedValue(
      new Error("A API real de produtos ainda nao esta configurada neste ambiente."),
    );

    const { container } = render(<SellerProductForm workspace={workspace} />);
    const fileInput = container.querySelector('input[type="file"][multiple]') as HTMLInputElement;

    await fillRequiredFields(user);
    await user.upload(fileInput, imageFile);
    await user.click(screen.getByRole("button", { name: "Cadastrar" }));

    await waitFor(() => {
      expect(saveLocalSellerProduct).toHaveBeenCalledWith({
        id: "uuid-local-1",
        storeId: "101",
        storeName: "Atelie Solar",
        name: "Camiseta Basica",
        slug: "camiseta-basica",
        description:
          "Malha leve para o dia a dia\n\n[operacao-loja]\nshelfSection=B\nshelfPosition=12\naudience=Infantil\n[/operacao-loja]",
        categoryId: "cat-camisetas",
        categoryName: "Camisetas",
        priceRetail: 0,
        priceWholesale: undefined,
        pricePromotion: undefined,
        stock: 25,
        minStock: 3,
        variants: [
          { id: "local-variant-1", sizeLabel: "34", stock: 10, minStock: 1, priceRetail: undefined, priceWholesale: undefined, pricePromotion: undefined, position: 1 },
          { id: "local-variant-2", sizeLabel: "36", stock: 15, minStock: 2, priceRetail: undefined, priceWholesale: undefined, pricePromotion: undefined, position: 2 },
        ],
        mainImageUrl: fileReaderDataUrl,
        createdAt: expect.any(String),
        images: [
          {
            id: "upload-camiseta-basica.png-1700000000000-0",
            name: "camiseta-basica.png",
            previewUrl: fileReaderDataUrl,
          },
        ],
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Produto Camiseta Basica salvo localmente na vitrine interna.")).toBeInTheDocument();
    });
    expect(replaceMock).toHaveBeenCalledWith("/painel-lojista/produtos#produtos-cadastrados");
  });
});
