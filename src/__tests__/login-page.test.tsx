import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LoginPage from "@/app/login/page";
import { useAuthStore } from "@/stores/auth-store";

const pushMock = jest.fn();
const refreshMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

jest.mock("next/link", () => {
  const LinkMock = ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>{children}</a>
  );

  LinkMock.displayName = "NextLinkMock";

  return LinkMock;
});

jest.mock("@/stores/auth-store", () => ({
  useAuthStore: jest.fn(),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    pushMock.mockReset();
    refreshMock.mockReset();
  });

  it("deve autenticar o lojista e redirecionar para o painel", async () => {
    const loginMock = jest.fn().mockResolvedValue({
      authenticated: true,
      token: "token-123",
      user: {
        role: "lojista",
        ownerName: "Renata Sol",
        ownerEmail: "renata@ateliesolar.com",
      },
      store: {
        id: "101",
        name: "Atelie Solar",
        slug: "atelie-solar",
        status: "ativo",
      },
    });

    (useAuthStore as jest.Mock).mockImplementation((selector: (state: { login: typeof loginMock }) => unknown) =>
      selector({ login: loginMock }),
    );

    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("E-mail"), "RENATA@ATELIESOLAR.COM");
    await user.type(screen.getByLabelText("Senha"), "123123@");
    await user.click(screen.getByRole("button", { name: "Entrar no painel" }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith("renata@ateliesolar.com", "123123@");
    });

    expect(pushMock).toHaveBeenCalledWith("/painel-lojista");
    expect(refreshMock).toHaveBeenCalled();
    expect(screen.getByText("Acesso validado para Atelie Solar. Redirecionando para o painel da loja...")).toBeInTheDocument();
  });

  it("deve mostrar erro quando a autenticacao falhar", async () => {
    const loginMock = jest.fn().mockRejectedValue(new Error("Email ou senha invalidos."));

    (useAuthStore as jest.Mock).mockImplementation((selector: (state: { login: typeof loginMock }) => unknown) =>
      selector({ login: loginMock }),
    );

    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText("E-mail"), "renata@ateliesolar.com");
    await user.type(screen.getByLabelText("Senha"), "senha-errada");
    await user.click(screen.getByRole("button", { name: "Entrar no painel" }));

    await waitFor(() => {
      expect(screen.getByText("Email ou senha invalidos.")).toBeInTheDocument();
    });

    expect(pushMock).not.toHaveBeenCalled();
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it("deve exigir email e senha antes de tentar login", async () => {
    const loginMock = jest.fn();

    (useAuthStore as jest.Mock).mockImplementation((selector: (state: { login: typeof loginMock }) => unknown) =>
      selector({ login: loginMock }),
    );

    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: "Entrar no painel" }));

    expect(screen.getByText("Preencha e-mail e senha para validar o acesso.")).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });
});
