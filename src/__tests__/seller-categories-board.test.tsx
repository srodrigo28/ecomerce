import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SellerCategoriesBoard } from "@/components/seller-categories-board";
import { createSellerCategory, deleteSellerCategory, updateSellerCategory } from "@/lib/services/catalog-service";
import type { SellerWorkspace } from "@/types/catalog";

jest.mock("@/lib/services/catalog-service", () => ({
  createSellerCategory: jest.fn(),
  updateSellerCategory: jest.fn(),
  deleteSellerCategory: jest.fn(),
}));

const objectUrlMock = jest.fn(() => "blob:preview-categoria");
const revokeObjectUrlMock = jest.fn();

const workspace: SellerWorkspace = {
  store: {
    id: "101",
    name: "Atelie Solar",
    slug: "atelie-solar",
    ownerEmail: "renata@ateliesolar.com",
    status: "ativo",
  },
  categoryBases: [],
  categories: [],
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

describe("SellerCategoriesBoard", () => {
  beforeEach(() => {
    (createSellerCategory as jest.Mock).mockReset();
    (updateSellerCategory as jest.Mock).mockReset();
    (deleteSellerCategory as jest.Mock).mockReset();

    Object.defineProperty(URL, "createObjectURL", {
      writable: true,
      value: objectUrlMock,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      writable: true,
      value: revokeObjectUrlMock,
    });

    objectUrlMock.mockClear();
    revokeObjectUrlMock.mockClear();
  });

  it("deve cadastrar categoria com imagem e atualizar a lista", async () => {
    const user = userEvent.setup();
    const imageFile = new File(["fake-image"], "vestidos.png", { type: "image/png" });

    (createSellerCategory as jest.Mock).mockResolvedValue({
      id: "cat-vestidos",
      storeId: "store-101",
      name: "Vestidos",
      slug: "vestidos",
      description: "Moda feminina para ocasioes especiais",
      image: "/uploads/categorias/vestidos.png",
      active: true,
      origin: "custom",
    });

    const { container } = render(<SellerCategoriesBoard workspace={workspace} />);
    const fileInput = container.querySelector("input[type=\"file\"]") as HTMLInputElement;

    await user.type(screen.getByPlaceholderText("Ex.: Vestidos, Calcas femininas, Blusas, Bermudas"), "Vestidos");
    await user.type(screen.getByPlaceholderText("Descricao da categoria para orientar o cadastro e a navegacao da loja"), "Moda feminina para ocasioes especiais");
    await user.upload(fileInput, imageFile);
    await user.click(screen.getByRole("button", { name: "Cadastrar categoria" }));

    await waitFor(() => {
      expect(createSellerCategory).toHaveBeenCalledWith({
        storeId: "101",
        name: "Vestidos",
        description: "Moda feminina para ocasioes especiais",
        imageFile,
        active: true,
      });
    });

    expect(await screen.findByText("Categoria Vestidos criada com sucesso para Atelie Solar.")).toBeInTheDocument();
    const activeSection = screen.getByRole("heading", { name: "Prontas para a vitrine e produtos" }).closest("article");
    expect(activeSection).not.toBeNull();
    const activeScope = within(activeSection as HTMLElement);
    expect(activeScope.getByText("Vestidos")).toBeInTheDocument();
    expect(activeScope.getByText("Moda feminina para ocasioes especiais")).toBeInTheDocument();
    expect(screen.getByText("1 ativa(s)")).toBeInTheDocument();
  });

  it("deve exigir imagem antes de cadastrar categoria", async () => {
    const user = userEvent.setup();

    render(<SellerCategoriesBoard workspace={workspace} />);

    await user.type(screen.getByPlaceholderText("Ex.: Vestidos, Calcas femininas, Blusas, Bermudas"), "Vestidos");
    await user.click(screen.getByRole("button", { name: "Cadastrar categoria" }));

    expect(screen.getByText("Selecione a imagem da categoria para continuar.")).toBeInTheDocument();
    expect(createSellerCategory).not.toHaveBeenCalled();
  });

  it("deve exibir o erro da API quando o cadastro de categoria falhar", async () => {
    const user = userEvent.setup();
    const imageFile = new File(["fake-image"], "vestidos.png", { type: "image/png" });

    (createSellerCategory as jest.Mock).mockRejectedValue(new Error("Nao foi possivel criar a categoria na API."));

    const { container } = render(<SellerCategoriesBoard workspace={workspace} />);
    const fileInput = container.querySelector("input[type=\"file\"]") as HTMLInputElement;

    await user.type(screen.getByPlaceholderText("Ex.: Vestidos, Calcas femininas, Blusas, Bermudas"), "Vestidos");
    await user.upload(fileInput, imageFile);
    await user.click(screen.getByRole("button", { name: "Cadastrar categoria" }));

    expect(await screen.findByText("Nao foi possivel criar a categoria na API.")).toBeInTheDocument();
    const activeSection = screen.getByRole("heading", { name: "Prontas para a vitrine e produtos" }).closest("article");
    expect(activeSection).not.toBeNull();
    const activeScope = within(activeSection as HTMLElement);
    expect(activeScope.queryByText(/^Vestidos$/)).not.toBeInTheDocument();
  });

  it("deve bloquear cadastro quando a sessao nao estiver vinculada a uma loja valida", async () => {
    const user = userEvent.setup();
    const invalidWorkspace: SellerWorkspace = {
      ...workspace,
      store: {
        id: "store-empty",
        name: "Sua loja",
        slug: "sua-loja",
        ownerEmail: "maria@gmail.com",
        status: "ativo",
      },
    };

    render(<SellerCategoriesBoard workspace={invalidWorkspace} />);

    expect(screen.getByText("Esta conta nao corresponde a uma loja valida do painel. Para cadastrar categorias, faca login com o email do responsavel da loja cadastrada na API, como os `ownerEmail` reais das lojas.")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("Ex.: Vestidos, Calcas femininas, Blusas, Bermudas"), "Vestidos");
    await user.click(screen.getByRole("button", { name: "Cadastrar categoria" }));

    expect(screen.getByText("Sua sessao atual nao esta vinculada a uma loja valida para cadastrar categorias. Entre com o email do responsavel de uma loja cadastrada na API.")).toBeInTheDocument();
    expect(createSellerCategory).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Cadastrar categoria" })).toBeDisabled();
  });

});
