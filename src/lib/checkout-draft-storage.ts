export interface CheckoutDraftItem {
  productSlug: string;
  quantity: number;
}

export interface CheckoutDraft {
  storeSlug: string;
  customerName: string;
  customerWhatsapp: string;
  email?: string;
  deliveryType: "entrega" | "retirada";
  notes?: string;
  items: CheckoutDraftItem[];
  createdAt: string;
}

const STORAGE_KEY = "hierarquia-checkout-drafts";

function loadDraftMap(): Record<string, CheckoutDraft> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, CheckoutDraft>) : {};
  } catch {
    return {};
  }
}

function saveDraftMap(value: Record<string, CheckoutDraft>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

function buildKey(storeSlug: string) {
  return storeSlug;
}

export function loadCheckoutDraft(storeSlug: string): CheckoutDraft | null {
  const drafts = loadDraftMap();
  return drafts[buildKey(storeSlug)] ?? null;
}

export function saveCheckoutDraft(draft: CheckoutDraft) {
  const drafts = loadDraftMap();
  drafts[buildKey(draft.storeSlug)] = draft;
  saveDraftMap(drafts);
}

export function clearCheckoutDraft(storeSlug: string) {
  const drafts = loadDraftMap();
  delete drafts[buildKey(storeSlug)];
  saveDraftMap(drafts);
}
