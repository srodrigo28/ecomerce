import { apiConfig } from "@/lib/config";
import { mockSellerWorkspace, mockStores } from "@/lib/mock-data";
import type { SellerWorkspace, StoreSummary } from "@/types/catalog";

const shouldUseMocks = apiConfig.useMocks || !apiConfig.baseUrl;

export async function getFeaturedStores(): Promise<StoreSummary[]> {
  if (shouldUseMocks) {
    return mockStores;
  }

  return mockStores;
}

export async function getSellerWorkspace(): Promise<SellerWorkspace> {
  if (shouldUseMocks) {
    return mockSellerWorkspace;
  }

  return mockSellerWorkspace;
}