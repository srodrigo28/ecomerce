const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

const normalizePath = (value: string | undefined, fallback: string) => {
  if (!value) return fallback;
  if (isAbsoluteUrl(value)) return value;
  return value.startsWith("/") ? value : `/${value}`;
};

const joinUrl = (baseUrl: string, path: string) => {
  if (isAbsoluteUrl(path)) return path;
  if (!baseUrl) return path;
  return `${baseUrl.replace(/\/$/, "")}${normalizePath(path, "")}`;
};

export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "Hierarquia",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};

export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  timeoutMs: toNumber(process.env.API_TIMEOUT_MS, 10000),
  token: process.env.API_TOKEN || "",
  useMocks: process.env.NEXT_PUBLIC_USE_API_MOCKS === "true",
};

export const endpointMap = {
  auth: normalizePath(process.env.NEXT_PUBLIC_API_AUTH_ENDPOINT, "/auth"),
  stores: normalizePath(process.env.NEXT_PUBLIC_API, "/api/lojas"),
  categories: normalizePath(
    process.env.NEXT_PUBLIC_API_CATEGORIES_ENDPOINT,
    "/categories"
  ),
  products: normalizePath(
    process.env.NEXT_PUBLIC_API_PRODUCTS_ENDPOINT,
    "/products"
  ),
  orders: normalizePath(process.env.NEXT_PUBLIC_API_ORDERS_ENDPOINT, "/orders"),
  reports: normalizePath(process.env.NEXT_PUBLIC_API_REPORTS_ENDPOINT, "/reports"),
  stock: normalizePath(process.env.NEXT_PUBLIC_API_STOCK_ENDPOINT, "/stock"),
};

export const resolvedEndpoints = Object.fromEntries(
  Object.entries(endpointMap).map(([key, value]) => [key, joinUrl(apiConfig.baseUrl, value)])
) as Record<keyof typeof endpointMap, string>;

export const hasServerApiToken = Boolean(apiConfig.token);

