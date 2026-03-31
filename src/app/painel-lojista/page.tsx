import { cookies } from "next/headers";

import { SellerOperationsDashboard } from "@/components/seller-operations-dashboard";
import { SellerProductsShowcase } from "@/components/seller-products-showcase";
import { getSellerWorkspace } from "@/lib/services/catalog-service";

export default async function SellerDashboardPage() {
  const cookieStore = await cookies();
  const currentStoreSlug = cookieStore.get("seller_store_slug")?.value;
  const workspace = await getSellerWorkspace(currentStoreSlug);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10 2xl:px-12">
      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
        <details className="group" open={false}>
          <summary className="flex cursor-pointer list-none flex-col gap-4 px-5 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Central operacional</p>
              <h2 className="mt-2 text-2xl font-semibold theme-heading">Categorias, pedidos, estoque e relatorios</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">Tudo que estava solto agora fica concentrado aqui em cima, de forma organizada e recolhivel, para nao competir com o catalogo da loja.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full theme-border-button px-4 py-2 text-sm font-semibold transition">Abrir informacoes</span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-white text-lg font-semibold text-slate-700 transition group-open:rotate-45">+</span>
            </div>
          </summary>
          <div className="border-t border-[var(--border)] px-4 py-4 sm:px-5 sm:py-5">
            <SellerOperationsDashboard workspace={workspace} />
          </div>
        </details>
      </section>

      <section>
        <SellerProductsShowcase workspace={workspace} />
      </section>
    </main>
  );
}
