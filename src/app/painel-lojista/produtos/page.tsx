import Link from "next/link";

import { SellerProductForm } from "@/components/seller-product-form";
import { getSellerWorkspace } from "@/lib/services/catalog-service";

const quickActions = [
  "Criar produtos com preview local",
  "Testar categorias sem backend",
  "Revisar imagens antes do envio real",
  "Validar estoque e precificacao no frontend",
];

export default async function SellerProductsPage() {
  const workspace = await getSellerWorkspace();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10 2xl:px-12">
      <section className="grid gap-6 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] xl:p-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Painel do lojista</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl xl:text-5xl">
            Cadastro de produtos sem depender da API
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base sm:leading-8">
            Esta area foi desenhada para testes reais de usabilidade desde ja. O lojista consegue cadastrar dados,
            experimentar imagens por upload local ou URL e revisar tudo com preview antes de existir integracao definitiva.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
              Voltar para a visao geral
            </Link>
            <span className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold text-slate-700">
              Loja em teste: {workspace.store.name}
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5">
            <p className="text-sm text-[var(--muted)]">Produtos ativos</p>
            <strong className="mt-2 block text-3xl text-slate-900">{workspace.stats.activeProducts}</strong>
          </div>
          <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5">
            <p className="text-sm text-[var(--muted)]">Pedidos pendentes</p>
            <strong className="mt-2 block text-3xl text-slate-900">{workspace.stats.pendingOrders}</strong>
          </div>
          <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5">
            <p className="text-sm text-[var(--muted)]">Estoque baixo</p>
            <strong className="mt-2 block text-3xl text-slate-900">{workspace.stats.lowStockProducts}</strong>
          </div>
          <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5">
            <p className="text-sm text-[var(--muted)]">Visualizacoes do catalogo</p>
            <strong className="mt-2 block text-3xl text-slate-900">{workspace.stats.catalogViews}</strong>
          </div>
        </div>
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(320px,0.7fr)_minmax(0,1.3fr)]">
        <aside className="space-y-6 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6 2xl:sticky 2xl:top-6 2xl:self-start">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">O que ja pode ser testado</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Mesmo sem API, o painel ja permite validar a experiencia operacional que o lojista vai usar todos os dias.
            </p>
          </div>
          <div className="grid gap-3">
            {quickActions.map((action) => (
              <div key={action} className="rounded-2xl border border-[var(--border)] bg-white px-4 py-4 text-sm leading-6 text-[var(--muted)]">
                {action}
              </div>
            ))}
          </div>
          <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            Fluxo pensado para reduzir retrabalho: primeiro validamos UX e regras no frontend, depois apenas conectamos a API.
          </div>
        </aside>

        <SellerProductForm workspace={workspace} />
      </section>
    </main>
  );
}
