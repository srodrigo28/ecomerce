import { SellerProductForm } from "@/components/seller-product-form";
import { SellerProductsShowcase } from "@/components/seller-products-showcase";
import { getSellerWorkspace } from "@/lib/services/catalog-service";

const quickActions = [
  "Criar produtos com preview local",
  "Usar categorias base ou criar categorias da propria loja",
  "Testar estoque minimo e alertas de ruptura",
  "Validar a operacao antes da API entrar",
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export default async function SellerProductsPage() {
  const workspace = await getSellerWorkspace();
  const lowStockProducts = workspace.products.filter(
    (product) => product.stock <= (product.minStock ?? 0),
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10 2xl:px-12">
      <section className="grid gap-6 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] xl:p-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Painel do lojista</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl xl:text-5xl">
            Catalogo, categorias e estoque sem depender da API
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base sm:leading-8">
            Esta area evoluiu para refletir o nucleo do negocio: categorias por lojista, cadastro de produto, estoque
            minimo, alertas operacionais e leitura inicial de vendas antes da integracao definitiva.
          </p>
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
            <p className="text-sm text-[var(--muted)]">Vendas do mes</p>
            <strong className="mt-2 block text-3xl text-slate-900">{formatCurrency(workspace.stats.salesMonth)}</strong>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Categorias da loja</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Cada categoria pertence a esta loja. O uso de categorias base acelera o cadastro sem compartilhar dados entre lojistas.
              </p>
            </div>
            <span className="inline-flex items-center gap-3 rounded-[1.25rem] border border-[var(--border)] theme-surface-card px-4 py-2.5 text-sm font-semibold theme-text shadow-[var(--shadow-soft)]">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M8 9h8M8 12h8M8 15h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </span>
              <span>{workspace.categories.length} categorias ativas</span>
            </span>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {workspace.categories.map((category) => (
              <article key={category.id} className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <strong className="text-slate-900">{category.name}</strong>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${category.origin === "base" ? "theme-badge-success" : "theme-badge-neutral"}`}>
                    {category.origin === "base" ? "Base" : "Custom"}
                  </span>
                </div>
                <p className="mt-2 text-xs font-mono text-[var(--muted)]">/{category.slug}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Leitura rapida de vendas</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Mesmo com mocks, ja conseguimos simular a leitura do periodo para o lojista entender a operacao comercial.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
              <p className="text-sm text-[var(--muted)]">Hoje</p>
              <strong className="mt-2 block text-2xl text-slate-900">{formatCurrency(workspace.stats.salesToday)}</strong>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
              <p className="text-sm text-[var(--muted)]">Semana</p>
              <strong className="mt-2 block text-2xl text-slate-900">{formatCurrency(workspace.stats.salesWeek)}</strong>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
              <p className="text-sm text-[var(--muted)]">Mes</p>
              <strong className="mt-2 block text-2xl text-slate-900">{formatCurrency(workspace.stats.salesMonth)}</strong>
            </div>
          </div>
        </article>
      </section>

      <SellerProductsShowcase workspace={workspace} />

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

          <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5">
            <h3 className="text-lg font-semibold text-amber-900">Produtos em alerta</h3>
            <div className="mt-4 grid gap-3 text-sm leading-6 text-amber-900">
              {lowStockProducts.length ? (
                lowStockProducts.map((product) => (
                  <div key={product.id} className="rounded-2xl bg-white px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <strong>{product.name}</strong>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                        {product.stock}/{product.minStock ?? 0}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-amber-800">Abaixo do minimo recomendado para reposicao.</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-white px-4 py-3 text-sm">Nenhum produto em ruptura nesta leitura local.</div>
              )}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5">
            <h3 className="text-lg font-semibold text-slate-900">Movimentacoes recentes</h3>
            <div className="mt-4 grid gap-3 text-sm leading-6 text-[var(--muted)]">
              {workspace.stockMovements.map((movement) => (
                <div key={movement.id} className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-slate-900">{movement.type}</span>
                    <span className="text-xs font-medium text-slate-500">{new Date(movement.createdAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <p className="mt-1">Saldo {movement.previousStock} para {movement.currentStock}</p>
                  <p className="text-xs">{movement.note ?? "Sem observacao"}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <SellerProductForm workspace={workspace} />
      </section>
    </main>
  );
}
