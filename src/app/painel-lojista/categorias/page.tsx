import Link from "next/link";
import { cookies } from "next/headers";

import { SellerCategoriesBoard } from "@/components/seller-categories-board";
import { getSellerWorkspace } from "@/lib/services/catalog-service";

export default async function SellerCategoriesPage() {
  const cookieStore = await cookies();
  const currentStoreSlug = cookieStore.get("seller_store_slug")?.value;
  const currentOwnerEmail = cookieStore.get("seller_owner_email")?.value;
  const currentAuthToken = cookieStore.get("seller_auth_token")?.value ?? cookieStore.get("loja99_auth")?.value;
  const workspace = await getSellerWorkspace(
    currentStoreSlug,
    currentOwnerEmail ? decodeURIComponent(currentOwnerEmail) : undefined,
    currentAuthToken ? decodeURIComponent(currentAuthToken) : undefined,
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[980px] flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold theme-heading">Categorias</h1>
          <Link
            href="/painel-lojista"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-lg font-semibold text-rose-600 transition hover:bg-rose-100"
            aria-label="Fechar categorias"
            title="Fechar"
          >
            X
          </Link>
        </div>

        <div className="mt-5">
          <SellerCategoriesBoard workspace={workspace} />
        </div>
      </section>
    </main>
  );
}
