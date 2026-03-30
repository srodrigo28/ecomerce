import type { LocalOrderDraft } from "@/types/catalog";

const STORAGE_KEY = "hierarquia-local-orders";

export function loadLocalOrders(): LocalOrderDraft[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LocalOrderDraft[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalOrder(order: LocalOrderDraft) {
  if (typeof window === "undefined") {
    return;
  }

  const existingOrders = loadLocalOrders();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([order, ...existingOrders]));
}
