import Link from "next/link";

import { SellerOperationsDashboard } from "@/components/seller-operations-dashboard";
import { getSellerWorkspace } from "@/lib/services/catalog-service";

export default async function SellerDashboardPage() {
  const workspace = await getSellerWorkspace();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10 2xl:px-12">
      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-8 lg:p-10">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Painel do lojista</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl xl:text-5xl">
              Operacao da loja com categorias, pedidos, estoque e relatorios
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base sm:leading-8">
              O fluxo agora deixa de ser apenas cadastro visual. Esta tela concentra a leitura que mais importa para o negocio:
              categorias proprias da loja, pedidos recebidos, vendas por periodo e sinais de estoque critico.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/painel-lojista/pedidos" className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]">
              Abrir modulo de pedidos
            </Link>
            <Link href="/painel-lojista/estoque" className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-[var(--accent)]">
              Abrir modulo de estoque
            </Link>
            <Link href="/painel-lojista/relatorios" className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-[var(--accent)]">
              Abrir relatorios
            </Link>
            <Link href="/painel-lojista/produtos" className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-[var(--accent)]">
              Ir para cadastro de produtos
            </Link>
            <Link href="/" className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-[var(--accent)]">
              Voltar para inicio
            </Link>
          </div>
        </div>
      </section>

      <SellerOperationsDashboard workspace={workspace} />
    </main>
  );
}
