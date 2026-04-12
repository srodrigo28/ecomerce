import { expect, type Page, test } from "@playwright/test";

const signupApiUrl = "http://localhost:4010/api/lojas";
const localAuthStorageKey = "hierarquia-local-seller-auth";

async function mockRegistrationDependencies(page: Page) {
  let requestPayload: Record<string, unknown> | null = null;

  await page.route("https://viacep.com.br/ws/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        cep: "01310-100",
        logradouro: "Avenida Paulista",
        bairro: "Bela Vista",
        localidade: "Sao Paulo",
        uf: "SP",
      }),
    });
  });

  await page.route(signupApiUrl, async (route) => {
    requestPayload = JSON.parse(route.request().postData() ?? "{}") as Record<string, unknown>;

    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        id: 101,
        name: "Atelie Solar",
        slug: "atelie-solar",
        ownerName: "Renata Sol",
        ownerEmail: "renata@ateliesolar.com",
        whatsapp: "(11) 97777-9090",
        cnpj: "12345678000190",
        pixKey: "pix@ateliesolar.com",
        zipCode: "01310-100",
        state: "SP",
        city: "Sao Paulo",
        district: "Bela Vista",
        street: "Avenida Paulista",
        number: "1500",
        complement: "Sala 10",
        status: "draft",
      }),
    });
  });

  return {
    getRequestPayload: () => requestPayload,
  };
}

async function goToNextStep(page: Page, expectedHeading: string) {
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByRole("heading", { name: expectedHeading })).toBeVisible();
}

async function completeStoreSignup(page: Page) {
  await page.goto("/cadastro-loja");

  await page.getByLabel("Nome da loja").fill("Atelie Solar");
  await page.getByLabel("Responsavel").fill("Renata Sol");
  await page.getByLabel("CNPJ").pressSequentially("12345678000190");
  await goToNextStep(page, "Contato e recebimento");

  await page.getByLabel("E-mail comercial").fill("renata@ateliesolar.com");
  await page.getByLabel("WhatsApp da loja").pressSequentially("11977779090");
  await page.getByLabel("Chave Pix").fill("pix@ateliesolar.com");
  await goToNextStep(page, "Endereco da loja");

  await page.getByLabel("CEP").pressSequentially("01310100");
  await expect(page.getByLabel("Estado")).toHaveValue("SP");
  await expect(page.getByLabel("Cidade")).toHaveValue("Sao Paulo");
  await expect(page.getByLabel("Bairro")).toHaveValue("Bela Vista");
  await expect(page.getByLabel("Rua")).toHaveValue("Avenida Paulista");
  await page.getByLabel("Numero").fill("1500");
  await page.getByLabel("Complemento").fill("Sala 10");
  await goToNextStep(page, "Seguranca e revisao final");

  await page.getByLabel("Senha de acesso").fill("123123@");
  await page.getByLabel("Confirmar senha").fill("123123@");
  await page.getByRole("button", { name: "Concluir cadastro" }).click();
}

test("deve cadastrar loja e persistir o acesso local do lojista", async ({ page, context }) => {
  const api = await mockRegistrationDependencies(page);

  await completeStoreSignup(page);

  await page.waitForURL("**/painel-lojista");

  const authStorage = await page.evaluate((storageKey) => window.localStorage.getItem(storageKey), localAuthStorageKey);
  expect(authStorage).not.toBeNull();

  const savedAuth = JSON.parse(authStorage ?? "[]") as Array<{
    email: string;
    password: string;
    storeSlug: string;
    storeName: string;
  }>;

  expect(savedAuth).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        email: "renata@ateliesolar.com",
        password: "123123@",
        storeSlug: "atelie-solar",
        storeName: "Atelie Solar",
      }),
    ]),
  );

  const cookies = await context.cookies();
  expect(cookies).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: "seller_store_slug",
        value: "atelie-solar",
      }),
    ]),
  );

  expect(api.getRequestPayload()).toMatchObject({
    name: "Atelie Solar",
    slug: "atelie-solar",
    ownerName: "Renata Sol",
    ownerEmail: "renata@ateliesolar.com",
    password: "123123@",
    cnpj: "12345678000190",
    status: "draft",
  });
});

test("deve permitir login com as credenciais criadas no cadastro da loja", async ({ page, context }) => {
  await mockRegistrationDependencies(page);

  await completeStoreSignup(page);
  await page.waitForURL("**/painel-lojista");

  await context.clearCookies();
  await page.goto("/login");

  await page.getByLabel("E-mail").fill("renata@ateliesolar.com");
  await page.getByLabel("Senha").fill("123123@");
  await page.getByRole("button", { name: "Entrar no painel" }).click();

  await page.waitForURL("**/painel-lojista");

  const cookies = await context.cookies();
  expect(cookies).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: "seller_store_slug",
        value: "atelie-solar",
      }),
    ]),
  );
});
