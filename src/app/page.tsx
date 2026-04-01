import Link from "next/link";

import { Button } from "@/components/ui-button";
import { Card } from "@/components/ui-card";
import { getFeaturedStores, getSellerWorkspace } from "@/lib/services/catalog-service";

const navLinks = [
  { href: "#beneficios", label: "Beneficios" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#lojas", label: "Lojas" },
  { href: "#painel", label: "Painel" },
];

const sellerBenefits = [
  "Crie sua loja virtual e publique seu link proprio.",
  "Cadastre produtos com imagem, preco, categoria e descricao.",
  "Controle estoque e acompanhe o que precisa repor.",
  "Receba pedidos e organize seu atendimento em um unico painel.",
];

const sellerSteps = [
  {
    eyebrow: "Passo 1",
    title: "Cadastre sua loja",
    description: "Entre como lojista, informe seus dados comerciais e prepare sua operacao sem depender de uma equipe tecnica.",
  },
  {
    eyebrow: "Passo 2",
    title: "Monte seu catalogo",
    description: "Adicione categorias, produtos, fotos, precos e estoque para transformar sua vitrine em uma loja pronta para vender.",
  },
  {
    eyebrow: "Passo 3",
    title: "Venda com controle",
    description: "Acompanhe pedidos, atualize disponibilidade e mantenha sua loja organizada enquanto sua vitrine continua publicada.",
  },
];

const platformFeatures = [
  {
    title: "Loja virtual pronta para publicar",
    description: "Cada lojista ganha uma vitrine propria para divulgar produtos e gerar confianca desde o primeiro acesso.",
  },
  {
    title: "Estoque visivel e operacional",
    description: "O painel deixa claro o que esta disponivel, o que esta baixo e o que precisa de reposicao.",
  },
  {
    title: "Cadastro simples de produtos",
    description: "Fotos, preco, categoria, descricao e destaque comercial em um fluxo objetivo.",
  },
  {
    title: "Pedidos centralizados",
    description: "O lojista entende o que entrou, o status de cada pedido e o que precisa atender primeiro.",
  },
];

const categoryLinks = ["Moda feminina", "Masculino", "Calcas jeans", "Shorts", "Blusas", "Acessorios"];

export default async function Home() {
  const stores = await getFeaturedStores();
  const workspace = await getSellerWorkspace();

  const totalProducts = workspace.products.length;
  const lowStockProducts = workspace.products.filter((product) => product.stock <= (product.minStock ?? 0)).length;
  const pendingOrders = workspace.orders.filter((order) => order.status !== "concluido" && order.status !== "cancelado").length;
  const heroProducts = workspace.products.slice(0, 3);
  const featuredStores = stores.slice(0, 3);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-6 px-4 py-5 sm:gap-8 sm:px-6 sm:py-6 lg:px-10 lg:py-8">
      <section className="rounded-[2rem] border border-[var(--border)] bg-[rgba(255,255,255,0.82)] p-3 shadow-[var(--shadow)] backdrop-blur sm:p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex items-center gap-3 rounded-[1.5rem] px-3 py-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-md font-semibold text-white">
              S
            </span>
            <div>
              <strong className="block text-lg font-semibold theme-heading">Gyn Lojas</strong>
              <span className="text-sm text-[var(--muted)]">Plataforma para lojistas venderem online</span>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-2 rounded-[1.5rem] theme-surface-card px-3 py-2 lg:flex-1 lg:mx-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium theme-text transition hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-end">
            <Link
              href="/login"
              className="rounded-full theme-border-button px-4 py-2.5 text-sm font-semibold transition hover:text-[var(--accent-strong)]"
            >
              Entrar no painel
            </Link>
            <Link
                href="/cadastro-loja"
                className="inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white no-underline transition hover:bg-[var(--accent-strong)] hover:text-white focus:text-white visited:text-white"
              >
                Criar minha loja
            </Link>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[2.25rem] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(246,249,255,0.88))] p-6 shadow-[var(--shadow)] sm:p-8 xl:p-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-5%] top-[-10%] h-48 w-48 rounded-full bg-[rgba(245,158,11,0.14)] blur-3xl" />
          <div className="absolute bottom-[-12%] right-[-3%] h-64 w-64 rounded-full bg-[rgba(var(--accent-rgb),0.16)] blur-3xl" />
        </div>

        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] xl:items-center">
          <div className="space-y-6">
            <span className="inline-flex w-fit rounded-full bg-[rgba(15,118,110,0.12)] px-4 py-2 text-sm font-semibold text-[var(--accent-strong)]">
              Venda como marketplace, com cara de loja de verdade
            </span>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight theme-heading sm:text-5xl xl:text-6xl">
                Crie sua loja virtual, organize seu estoque e comece a vender com uma vitrine que convence.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">
                A tela inicial precisa falar com o lojista em segundos. Aqui a mensagem fica clara: voce entra, monta seu
                catalogo, controla estoque, recebe pedidos e publica uma loja virtual pronta para compartilhar.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {sellerBenefits.map((benefit) => (
                <div
                  key={benefit}
                  className="rounded-[1.5rem] border border-[var(--border)] bg-white/70 px-4 py-4 text-sm leading-6 text-slate-700 shadow-sm"
                >
                  {benefit}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 text-white">
              <Button as={Link} href="/cadastro-loja" size="lg">
                Quero criar minha loja
              </Button>
              <Button as={Link} href="/login" variant="secondary" size="lg">
                Ja tenho acesso ao painel
              </Button>
              <Button as={Link} href="/lojas-parceiras" variant="dark" size="lg">
                Ver lojas publicadas
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="p-4">
                <p className="text-sm text-[var(--muted)]">Lojas em destaque</p>
                <strong className="mt-2 block text-3xl theme-heading">{stores.length}</strong>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-[var(--muted)]">Produtos no catalogo</p>
                <strong className="mt-2 block text-3xl theme-heading">{totalProducts}</strong>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-[var(--muted)]">Pedidos em andamento</p>
                <strong className="mt-2 block text-3xl theme-heading">{pendingOrders}</strong>
              </Card>
            </div>
          </div>

          <aside className="overflow-hidden rounded-[2rem] border border-[rgba(15,23,42,0.08)] bg-[linear-gradient(180deg,#fffaf2_0%,#ffffff_42%,#f4f8ff_100%)] p-0 shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
            <div className="border-b border-[rgba(15,23,42,0.08)] bg-[linear-gradient(135deg,rgba(249,115,22,0.10),rgba(37,99,235,0.10))] px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Visao do lojista</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Sua operacao online em um so lugar</h2>
                  <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
                    Estoque, produtos, pedidos e vitrine organizada com links por categoria para divulgar melhor o catalogo.
                  </p>
                </div>
                <span className="rounded-full border border-orange-200 bg-white/80 px-3 py-1 text-xs font-semibold text-orange-700">
                  vitrine + painel
                </span>
              </div>
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              <div className="rounded-[1.5rem] border border-[rgba(15,23,42,0.08)] bg-white p-4 shadow-sm">
                <div>
                  <p className="text-sm font-medium text-slate-500">Loja em foco</p>
                  <strong className="mt-2 block text-xl text-slate-900">{workspace.store.name}</strong>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    O lojista entende que nao cria apenas uma pagina, mas uma loja virtual com vitrine publica, categorias,
                    estoque e atendimento comercial.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-medium text-emerald-700">Produtos</p>
                  <strong className="mt-2 block text-3xl text-emerald-950">{workspace.stats.activeProducts}</strong>
                  <p className="mt-1 text-xs leading-5 text-emerald-700">Catalogo publicado e pronto para vender</p>
                </div>
                <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-medium text-amber-700">Estoque</p>
                  <strong className="mt-2 block text-3xl text-amber-950">{lowStockProducts}</strong>
                  <p className="mt-1 text-xs leading-5 text-amber-700">Itens pedindo reposicao no painel</p>
                </div>
                <div className="rounded-[1.5rem] border border-sky-200 bg-sky-50 p-4">
                  <p className="text-sm font-medium text-sky-700">Pedidos</p>
                  <strong className="mt-2 block text-3xl text-sky-950">{pendingOrders}</strong>
                  <p className="mt-1 text-xs leading-5 text-sky-700">Atendimentos aguardando acompanhamento</p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px]">
                <div className="rounded-[1.5rem] border border-[rgba(15,23,42,0.08)] bg-[linear-gradient(180deg,#ffffff,#f8fbff)] p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Vitrine por categoria</p>
                      <strong className="mt-1 block text-lg text-slate-900">Links prontos para divulgar colecoes</strong>
                    </div>
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">categorias</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {categoryLinks.map((category) => (
                      <span
                        key={category}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-[rgba(15,23,42,0.08)] bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(249,115,22,0.10))] p-4">
                  <p className="text-sm font-medium text-slate-600">Fluxo rapido</p>
                  <div className="mt-3 space-y-2">
                    {["Cria loja", "Publica produtos", "Divulga links", "Recebe pedidos"].map((item) => (
                      <div key={item} className="rounded-2xl bg-white/85 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section id="beneficios" className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Mensagem principal</p>
          <h2 className="mt-3 text-3xl font-semibold theme-heading">A home precisa vender a ideia certa para o lojista</h2>
          <p className="mt-4 text-base leading-8 text-[var(--muted)]">
            Em vez de parecer um painel tecnico, a tela inicial agora mostra valor comercial. O foco deixa de ser ambiente,
            endpoint e mock, e passa a ser resultado: criar loja virtual, organizar catalogo e operar vendas com clareza.
          </p>
          <div className="mt-6 rounded-[1.75rem] bg-slate-950 p-5 text-white">
            <p className="text-sm text-slate-300">Promessa para o lojista</p>
            <strong className="mt-3 block text-2xl">
              Sua loja entra online com vitrine propria, estoque organizado e base pronta para receber pedidos.
            </strong>
          </div>
        </article>

        <article className="grid gap-4 md:grid-cols-2">
          {platformFeatures.map((feature) => (
            <Card key={feature.title} className="p-6">
              <h3 className="text-xl font-semibold theme-heading">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{feature.description}</p>
            </Card>
          ))}
        </article>
      </section>

      <section id="como-funciona" className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] sm:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Como funciona</p>
            <h2 className="mt-2 text-3xl font-semibold theme-heading">Um fluxo simples para a loja entrar e vender</h2>
          </div>
          <Link href="/cadastro-loja" className="text-sm font-semibold text-[var(--accent-strong)]">
            Comecar cadastro
          </Link>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          {sellerSteps.map((step) => (
            <Card key={step.title} className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">{step.eyebrow}</p>
              <h3 className="mt-3 text-2xl font-semibold theme-heading">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{step.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="lojas" className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Lojas na vitrine</p>
              <h2 className="mt-2 text-3xl font-semibold theme-heading">Exemplos que ajudam o lojista a visualizar o resultado</h2>
            </div>
            <Link href="/lojas-parceiras" className="text-sm font-semibold text-[var(--accent-strong)]">
              Ver todas as lojas
            </Link>
          </div>

          <div className="mt-6 grid gap-4">
            {featuredStores.map((store) => (
              <article key={store.id} className="overflow-hidden rounded-[1.75rem] theme-surface-card">
                <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="min-h-52 bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={store.coverImageUrl} alt={store.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-3 p-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold theme-heading">{store.name}</h3>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {store.status}
                      </span>
                    </div>
                    <p className="text-sm leading-6 text-[var(--muted)]">
                      {store.city}, {store.state}
                    </p>
                    <p className="text-sm leading-6 text-[var(--muted)]">
                      Loja com vitrine publica, contato comercial e caminho direto para compra.
                    </p>
                    <Link
                      href={`/lojas/${store.slug}`}
                      className="inline-flex rounded-full theme-dark-cta px-4 py-2.5 text-sm font-semibold transition"
                    >
                      Abrir loja
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article id="painel" className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-[var(--shadow)] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">Painel do lojista</p>
          <h2 className="mt-3 text-3xl font-semibold">O que o lojista administra depois que entra</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            A landing fica mais forte quando mostra o que existe por tras da vitrine. Aqui o lojista entende que nao vai
            ganhar so uma pagina bonita, mas sim uma operacao com catalogo, estoque e pedidos.
          </p>

          <div className="mt-6 grid gap-4">
            {heroProducts.length > 0 ? (
              heroProducts.map((product) => (
                <div key={product.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <strong className="block text-lg">{product.name}</strong>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{product.description}</p>
                    </div>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">
                      Estoque {product.stock}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-300">Preco de vitrine</span>
                    <strong className="text-lg">R$ {product.priceRetail.toFixed(2)}</strong>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-sm leading-7 text-slate-300">
                O catalogo do painel ainda esta vazio, mas a estrutura ja esta pronta para receber produtos, controle de
                estoque e operacao comercial.
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button as={Link} href="/painel-lojista" variant="secondary" size="lg" className="border-white/15 bg-white/5 text-white hover:text-white">
              Ver painel
            </Button>
            <Button as={Link} href="/painel-lojista/produtos" variant="secondary" size="lg" className="border-white/15 bg-white/5 text-white hover:text-white">
              Gerenciar produtos
            </Button>
          </div>
        </article>
      </section>

      <section className="rounded-[2.25rem] border border-[var(--border)] bg-[linear-gradient(135deg,#0f172a,#16233c)] p-6 text-white shadow-[var(--shadow)] sm:p-8 xl:p-10">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">CTA final</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold sm:text-4xl">
              Se o objetivo e atrair lojistas, a home precisa terminar com uma decisao clara: criar loja e entrar para vender.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
              Essa pagina agora prepara melhor a conversao porque mostra utilidade real. O lojista entende o produto, imagina
              sua operacao dentro dele e encontra o proximo passo sem ruido.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 xl:flex-col text-white">
            <Button as={Link} href="/cadastro-loja" size="lg">
              Criar loja agora
            </Button>
            <Button as={Link} href="/login" variant="secondary" size="lg" className="border-white/15 bg-white/5 text-white hover:text-white">
              Entrar com meu acesso
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

