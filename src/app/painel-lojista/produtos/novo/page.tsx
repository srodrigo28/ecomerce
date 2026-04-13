import { cookies } from "next/headers";

import { SellerNewProductPageClient } from "@/components/seller-new-product-page-client";
import { getSellerWorkspace } from "@/lib/services/catalog-service";

export default async function SellerNewProductPage() {
  const cookieStore = await cookies();
  const currentStoreSlug = cookieStore.get("seller_store_slug")?.value;
  const currentOwnerEmail = cookieStore.get("seller_owner_email")?.value;
  const currentAuthToken = cookieStore.get("seller_auth_token")?.value ?? cookieStore.get("loja99_auth")?.value;
  const workspace = await getSellerWorkspace(
    currentStoreSlug,
    currentOwnerEmail ? decodeURIComponent(currentOwnerEmail) : undefined,
    currentAuthToken ? decodeURIComponent(currentAuthToken) : undefined,
  );

  return <SellerNewProductPageClient workspace={workspace} />;
}
