import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { StoreSignupForm } from "@/components/store-signup-form";
import { saveLocalSellerAuth } from "@/lib/local-auth-storage";
import { submitStoreSignup } from "@/lib/services/catalog-service";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

jest.mock("@/lib/services/catalog-service", () => ({
  submitStoreSignup: jest.fn(),
}));

jest.mock("@/lib/local-auth-storage", () => ({
  saveLocalSellerAuth: jest.fn(),
}));

const mockedFetch = jest.fn();

const fillStepOne = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText("Nome da loja"), "Atelie Solar");
  await user.type(screen.getByLabelText("Responsavel"), "Renata Sol");
  await user.type(screen.getByLabelText("CNPJ"), "12345678000190");
  await user.click(screen.getByRole("button", { name: "Continuar" }));
};

const fillStepTwo = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText("E-mail comercial"), "renata@ateliesolar.com");
  await user.type(screen.getByLabelText("WhatsApp da loja"), "11977779090");
  await user.type(screen.getByLabelText("Chave Pix"), "pix@ateliesolar.com");
  await user.click(screen.getByRole("button", { name: "Continuar" }));
};

const fillStepFour = async (user: ReturnType<typeof userEvent.setup>, password = "123123@") => {
  await user.type(screen.getByLabelText("Senha de acesso"), password);
  await user.type(screen.getByLabelText("Confirmar senha"), password);
};

describe("StoreSignupForm", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    pushMock.mockReset();
    mockedFetch.mockReset();
    (submitStoreSignup as jest.Mock).mockReset();
    (saveLocalSellerAuth as jest.Mock).mockReset();

    mockedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        uf: "SP",
        localidade: "Sao Paulo",
        bairro: "Bela Vista",
        logradouro: "Avenida Paulista",
      }),
    });

    global.fetch = mockedFetch as unknown as typeof fetch;
    document.cookie = "";
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("deve concluir o cadastro da loja e redirecionar para o painel", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    (submitStoreSignup as jest.Mock).mockResolvedValue({
      id: 101,
      name: "Atelie Solar",
      slug: "atelie-solar",
    });

    render(<StoreSignupForm />);

    await user.type(screen.getByLabelText("Nome da loja"), "Atelie Solar");
    await user.type(screen.getByLabelText("Responsavel"), "Renata Sol");
    await user.type(screen.getByLabelText("CNPJ"), "12345678000190");

    expect(screen.getByLabelText("CNPJ")).toHaveValue("12.345.678/0001-90");

    await user.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByRole("heading", { name: "Contato e recebimento" })).toBeInTheDocument();

    await fillStepTwo(user);

    expect(screen.getByRole("heading", { name: "Endereco da loja" })).toBeInTheDocument();

    await user.type(screen.getByLabelText("CEP"), "01310100");

    await waitFor(() => {
      expect(screen.getByLabelText("Estado")).toHaveValue("SP");
      expect(screen.getByLabelText("Cidade")).toHaveValue("Sao Paulo");
      expect(screen.getByLabelText("Bairro")).toHaveValue("Bela Vista");
      expect(screen.getByLabelText("Rua")).toHaveValue("Avenida Paulista");
    });

    await user.type(screen.getByLabelText("Numero"), "1500");
    await user.type(screen.getByLabelText("Complemento"), "Sala 10");
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(screen.getByRole("heading", { name: "Seguranca e revisao final" })).toBeInTheDocument();

    await fillStepFour(user);
    await user.click(screen.getByRole("button", { name: "Concluir cadastro" }));

    await waitFor(() => {
      expect(submitStoreSignup).toHaveBeenCalledWith({
        name: "Atelie Solar",
        slug: "atelie-solar",
        ownerName: "Renata Sol",
        ownerEmail: "renata@ateliesolar.com",
        password: "123123@",
        whatsapp: "(11) 97777-9090",
        cnpj: "12.345.678/0001-90",
        pixKey: "pix@ateliesolar.com",
        zipCode: "01310-100",
        state: "SP",
        city: "Sao Paulo",
        district: "Bela Vista",
        street: "Avenida Paulista",
        number: "1500",
        complement: "Sala 10",
      });
    });

    expect(saveLocalSellerAuth).toHaveBeenCalledWith({
      email: "renata@ateliesolar.com",
      password: "123123@",
      storeSlug: "atelie-solar",
      storeName: "Atelie Solar",
      ownerEmail: "renata@ateliesolar.com",
    });

    act(() => {
      jest.advanceTimersByTime(1200);
    });

    expect(pushMock).toHaveBeenCalledWith("/painel-lojista");
    expect(document.cookie).toContain("seller_store_slug=atelie-solar");
    expect(document.cookie).toContain("seller_owner_email=renata%40ateliesolar.com");
  });

  it("deve mostrar o erro da API quando o cadastro falhar", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    (submitStoreSignup as jest.Mock).mockRejectedValue(new Error("Ja existe uma loja cadastrada com este email de responsavel."));

    render(<StoreSignupForm />);

    await fillStepOne(user);
    await fillStepTwo(user);
    await user.type(screen.getByLabelText("CEP"), "01310100");

    await waitFor(() => {
      expect(screen.getByLabelText("Estado")).toHaveValue("SP");
    });

    await user.type(screen.getByLabelText("Numero"), "1500");
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await fillStepFour(user);
    await user.click(screen.getByRole("button", { name: "Concluir cadastro" }));

    await waitFor(() => {
      expect(screen.getByText("Ja existe uma loja cadastrada com este email de responsavel.")).toBeInTheDocument();
    });

    expect(saveLocalSellerAuth).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("deve permitir preencher o endereco manualmente quando o ViaCEP falhar", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    mockedFetch.mockRejectedValueOnce(new Error("ViaCEP indisponivel"));
    (submitStoreSignup as jest.Mock).mockResolvedValue({
      id: 101,
      name: "Atelie Solar",
      slug: "atelie-solar",
    });

    render(<StoreSignupForm />);

    await fillStepOne(user);
    await fillStepTwo(user);

    await user.type(screen.getByLabelText("CEP"), "01310100");

    await waitFor(() => {
      expect(screen.getByText("Nao foi possivel preencher o endereco automaticamente pelo CEP agora. Voce pode continuar digitando os campos manualmente.")).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText("Estado"), "sp");
    await user.type(screen.getByLabelText("Cidade"), "Sao Paulo");
    await user.type(screen.getByLabelText("Bairro"), "Bela Vista");
    await user.type(screen.getByLabelText("Rua"), "Avenida Paulista");
    await user.type(screen.getByLabelText("Numero"), "1500");
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(screen.getByRole("heading", { name: "Seguranca e revisao final" })).toBeInTheDocument();

    await fillStepFour(user);
    await user.click(screen.getByRole("button", { name: "Concluir cadastro" }));

    await waitFor(() => {
      expect(submitStoreSignup).toHaveBeenCalledWith(
        expect.objectContaining({
          state: "SP",
          city: "Sao Paulo",
          district: "Bela Vista",
          street: "Avenida Paulista",
          zipCode: "01310-100",
        }),
      );
    });
  });
});
