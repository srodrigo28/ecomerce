import { SellerTopbar } from "@/components/seller-topbar";
import { getSellerWorkspace } from "@/lib/services/catalog-service";

export default async function SellerAreaLayout({ children }: { children: React.ReactNode }) {
  const workspace = await getSellerWorkspace();

  return (
    <>
      <SellerTopbar store={workspace.store} />
      <div className="pt-24">{children}</div>
    </>
  );
}
