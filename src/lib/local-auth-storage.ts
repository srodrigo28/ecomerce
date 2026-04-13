export type LocalSellerAuthRecord = {
  email: string;
  password: string;
  storeSlug: string;
  storeName: string;
  ownerEmail?: string;
};

const STORAGE_KEY = "hierarquia-local-seller-auth";

const isBrowser = () => typeof window !== "undefined";

const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const saveLocalSellerAuth = (record: LocalSellerAuthRecord) => {
  if (!isBrowser()) return;

  const nextRecord = {
    ...record,
    email: normalizeEmail(record.email),
  };

  const current = readLocalSellerAuthRecords().filter((item) => item.email !== nextRecord.email);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([nextRecord, ...current]));
};

export const readLocalSellerAuthRecords = (): LocalSellerAuthRecord[] => {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is LocalSellerAuthRecord =>
            Boolean(item)
            && typeof item.email === "string"
            && typeof item.password === "string"
            && typeof item.storeSlug === "string"
            && typeof item.storeName === "string"
            && (item.ownerEmail === undefined || typeof item.ownerEmail === "string"),
        )
      : [];
  } catch {
    return [];
  }
};

export const findLocalSellerAuth = (email: string, password: string) => {
  const normalizedEmail = normalizeEmail(email);
  return readLocalSellerAuthRecords().find(
    (record) => record.email === normalizedEmail && record.password === password,
  );
};
