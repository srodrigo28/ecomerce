import Link from "next/link";
import { cookies } from "next/headers";

import { SellerCategoriesBoard } from "@/components/seller-categories-board";
import { getSellerWorkspace } from "@/lib/services/catalog-service";

export default async function SellerCategoriesPage() {
  const cookieStore = await cookies();
  const currentStoreSlug = cookieStore.get("seller_store_slug")?.value;
  const workspace = await getSellerWorkspace(currentStoreSlug);

  return (
    <main className="fixed inset-0 z-50 bg-slate-950/70 px-4 py-8 backdrop-blur-sm">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Operacao da loja</p>
            <h1 className="mt-2 text-2xl font-semibold theme-heading sm:text-3xl">Categorias do lojista</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">
              Gerencie as categorias comerciais da vitrine em um painel fixo, sem competir com o restante da navegacao.
            </p>
          </div>
          <Link href="/painel-lojista" className="rounded-full theme-border-button px-4 py-2 text-sm font-semibold transition">
            Fechar
          </Link>
        </div>

        <div className="mt-6 flex-1 overflow-y-auto pr-1">
          <SellerCategoriesBoard workspace={workspace} />
        </div>
      </div>
    </main>
  );
}
