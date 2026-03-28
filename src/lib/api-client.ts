import { apiConfig, endpointMap, resolvedEndpoints } from "@/lib/config";

const createHeaders = () => {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (apiConfig.token) {
    headers.set("Authorization", `Bearer ${apiConfig.token}`);
  }

  return headers;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly endpoint: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(endpoint: keyof typeof endpointMap, init?: RequestInit) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeoutMs);

  try {
    const response = await fetch(resolvedEndpoints[endpoint], {
      ...init,
      headers: createHeaders(),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new ApiError(
        `Falha ao consumir ${endpoint}`,
        response.status,
        resolvedEndpoints[endpoint]
      );
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}