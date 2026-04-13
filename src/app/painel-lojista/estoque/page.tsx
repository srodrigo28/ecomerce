import Link from "next/link";
import { cookies } from "next/headers";

import { SellerStockBoard } from "@/components/seller-stock-board";
import { getSellerWorkspace } from "@/lib/services/catalog-service";

export default async function SellerStockPage() {
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
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10 2xl:px-12">
      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-8 lg:p-10">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Estoque da loja</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl xl:text-5xl">
              Modulo dedicado para acompanhar produtos, alertas de ruptura e movimentacoes
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base sm:leading-8">
              Esta tela tira o estoque do dashboard resumido e transforma o tema em modulo proprio, com leitura por produto, filtro por categoria e historico de movimentacoes.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/painel-lojista" className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]">
              Voltar para painel
            </Link>
            <Link href="/painel-lojista/pedidos" className="rounded-full theme-border-button px-5 py-3 text-sm font-semibold transition">
              Ir para pedidos
            </Link>
          </div>
        </div>
      </section>

      <SellerStockBoard workspace={workspace} />
    </main>
  );
}

