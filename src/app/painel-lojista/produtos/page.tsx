import { cookies } from "next/headers";

import { SellerProductsPageClient } from "@/components/seller-products-page-client";
import { getSellerWorkspace } from "@/lib/services/catalog-service";

export default async function SellerProductsPage() {
  const cookieStore = await cookies();
  const currentStoreSlug = cookieStore.get("seller_store_slug")?.value;
  const workspace = await getSellerWorkspace(currentStoreSlug);
  return <SellerProductsPageClient workspace={workspace} />;
}
