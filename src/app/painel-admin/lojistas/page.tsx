import { AdminStoresBoard } from "@/components/admin-stores-board";
import { AdminTopbar } from "@/components/admin-topbar";
import { getAdminStores } from "@/lib/services/catalog-service";

export default async function AdminStoresPage() {
  const stores = await getAdminStores();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-8 px-4 pt-0 pb-6 sm:px-6 sm:pt-0 sm:pb-8 lg:px-10 lg:pt-0 lg:pb-10 2xl:px-12">
      <AdminTopbar />
      <AdminStoresBoard stores={stores} />
    </main>
  );
}
