import Link from "next/link";

import { getFeaturedStores, getSellerWorkspace } from "@/lib/services/catalog-service";
import { apiConfig, appConfig, endpointMap, hasServerApiToken, resolvedEndpoints } from "@/lib/config";

const navLinks = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#vitrine-demo", label: "Lojas" },
  { href: "/lojas-parceiras", label: "Parceiros" },
  { href: "/painel-lojista", label: "Painel" },
];

const phases = [
  {
    title: "Crie sua loja",
    description: "Cadastre-se como loja, organize seu catalogo e publique seus produtos com uma experiencia simples.",
  },
  {
    title: "Venda com autonomia",
    description: "Gerencie imagens, precos, estoque, Pix e WhatsApp em um painel pensado para operacao real.",
  },
  {
    title: "Evolua por fases",
    description: "O frontend ja nasce pronto para testes e cresce sem travar a entrada da API depois.",
  },
];

const envChecks = [
  {
    label: "URL publica do app",
    value: appConfig.url,
    ready: Boolean(appConfig.url),
  },
  {
    label: "Base da API",
    value: apiConfig.baseUrl || "Nao preenchida",
    ready: Boolean(apiConfig.baseUrl),
  },
  {
    label: "Token da API",
    value: hasServerApiToken ? "Configurado no servidor" : "Nao preenchido",
    ready: hasServerApiToken,
  },
  {
    label: "Modo mock",
    value: apiConfig.useMocks || !apiConfig.baseUrl ? "Ativado" : "Desativado",
    ready: true,
  },
];

const highlights = [
  "Menu superior pronto para leitura em desktop e mobile",
  "Entrada comercial clara para lojistas, login e lojas parceiras",
  "Vitrine local com lojas e produtos de exemplo",
  "Painel do lojista com cadastro, estoque, pedidos e preview de imagens",
];

const partnerPillars = [
  "Lojas parceiras cadastradas",
  "Catalogo vivo",
  "Operacao com pedidos",
  "Crescimento multiloja",
];

const commerceJourney = [
  {
    title: "1. Atrair e cadastrar lojas",
    description: "A home precisa converter. Por isso a primeira decisao e deixar claro para quem a plataforma existe e qual acao cada perfil deve tomar.",
  },
  {
    title: "2. Organizar catalogo e vitrine",
    description: "Depois do cadastro vem a base comercial: loja, categorias, produtos, busca e apresentacao da vitrine.",
  },
  {
    title: "3. Fechar pedido com seguranca",
    description: "O fluxo seguinte e carrinho, entrega ou retirada, resumo do pedido e pagamento inicial por Pix manual.",
  },
];

export default async function Home() {
  const stores = await getFeaturedStores();
  const workspace = await getSellerWorkspace();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-8 px-4 py-6 sm:gap-10 sm:px-6 sm:py-8 lg:px-10 lg:py-10 2xl:px-12">
      <section className="rounded-[2rem] border border-[var(--border)] bg-[rgba(255,252,247,0.86)] p-3 shadow-[var(--shadow)] backdrop-blur sm:p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex items-center justify-center gap-3 rounded-[1.5rem] px-3 py-3 text-slate-900 lg:justify-start">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
              H
            </span>
            <div>
              <strong className="block text-lg font-semibold">Hierarquia</strong>
              <span className="text-sm text-[var(--muted)]">Marketplace multiloja de moda</span>
            </div>
          </Link>

          <nav className="order-3 flex flex-wrap items-center justify-center gap-2 rounded-[1.5rem] border border-[var(--border)] bg-white/80 px-3 py-2 lg:order-2 lg:mx-6 lg:flex-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-[rgba(15,118,110,0.08)] hover:text-[var(--accent-strong)]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="order-2 flex flex-wrap items-center justify-center gap-3 lg:order-3 lg:justify-end">
            <Link
              href="/login"
              className="rounded-full border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
            >
              Login
            </Link>
            <Link
              href="/cadastro-loja"
              className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
            >
              Cadastrar-se como loja
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] backdrop-blur sm:p-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] xl:p-10 2xl:gap-8">
        <div className="space-y-6">
          <span className="inline-flex w-fit rounded-full bg-[rgba(15,118,110,0.12)] px-4 py-2 text-sm font-semibold text-[var(--accent-strong)]">
            Plataforma multiloja em construcao com foco total no frontend
          </span>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl xl:text-6xl">
              Um menu moderno no topo, uma vitrine comercial clara e um caminho direto para lojas venderem melhor.
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-lg sm:leading-8">
              A home agora comunica o negocio com clareza: cadastro de lojistas, login operacional, pagina publica para
              lojas parceiras e entrada para a vitrine. Mantemos os mocks e a estrutura atual para validar o produto antes da API.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {phases.map((phase) => (
              <article key={phase.title} className="rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-5">
                <h2 className="text-lg font-semibold text-slate-900">{phase.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{phase.description}</p>
              </article>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/cadastro-loja" className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]">
              Cadastrar-se como loja
            </Link>
            <Link href="/login" className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-[var(--accent)]">
              Login do lojista
            </Link>
            <Link href="/lojas-parceiras" className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-[var(--accent)]">
              Nossas lojas parceiras
            </Link>
          </div>
        </div>

        <aside className="rounded-[1.75rem] border border-[rgba(245,158,11,0.3)] bg-[rgba(255,255,255,0.92)] p-5 sm:p-6 xl:self-start">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Entrada principal</p>
          <div className="mt-5 space-y-4">
            <div className="rounded-[1.5rem] border border-[var(--border)] bg-[rgba(255,248,235,0.9)] p-4">
              <p className="text-sm text-[var(--muted)]">Perfil mais importante agora</p>
              <strong className="mt-2 block text-2xl text-slate-900">Lojista multimarcas</strong>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Queremos que a loja entenda em segundos o que fazer: entrar, cadastrar-se e publicar catalogo.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
              <p className="text-sm text-[var(--muted)]">Acesso rapido</p>
              <div className="mt-4 grid gap-3">
                <Link href="/cadastro-loja" className="rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-700">
                  Quero cadastrar minha loja
                </Link>
                <Link href="/login" className="rounded-2xl border border-[var(--border)] px-4 py-3 text-center text-sm font-semibold text-slate-900 transition hover:border-[var(--accent)]">
                  Ja tenho acesso
                </Link>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">Base tecnica atual</p>
              <div className="mt-3 space-y-3">
                {envChecks.map((item) => (
                  <div key={item.label} className="rounded-2xl bg-slate-50 px-3 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-700">{item.label}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.ready ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {item.ready ? "ok" : "pendente"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section id="como-funciona" className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-900">O que ja conseguimos validar</h2>
          <div className="mt-6 grid gap-3">
            {highlights.map((highlight) => (
              <div key={highlight} className="rounded-2xl border border-[var(--border)] bg-white px-4 py-4 text-sm leading-6 text-[var(--muted)]">
                {highlight}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Mapa de endpoints</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Quando a API real entrar, o frontend continua. Troca apenas a origem dos dados.
              </p>
            </div>
            <span className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
              timeout {apiConfig.timeoutMs}ms
            </span>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-[var(--border)] bg-slate-950 text-slate-100">
            <div className="grid gap-px bg-slate-800 text-sm md:grid-cols-[minmax(180px,0.45fr)_minmax(0,1fr)]">
              {Object.entries(endpointMap).map(([key]) => (
                <div key={key} className="contents">
                  <div className="bg-slate-950 px-4 py-3 font-medium text-slate-300">{key}</div>
                  <div className="bg-slate-950 px-4 py-3 font-mono text-xs text-emerald-300">
                    {resolvedEndpoints[key as keyof typeof resolvedEndpoints]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Sequencia do e-commerce</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">O frontend deve crescer nessa ordem</h2>
          <div className="mt-6 grid gap-4">
            {commerceJourney.map((item) => (
              <article key={item.title} className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5">
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.description}</p>
              </article>
            ))}
          </div>
        </article>

        <article id="parceiros" className="rounded-[2rem] border border-[var(--border)] bg-slate-900 p-5 text-white shadow-[var(--shadow)] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">Lojas parceiras</p>
          <h2 className="mt-3 text-2xl font-semibold">As parceiras da Hierarquia sao as lojas cadastradas na plataforma</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            Esta secao agora comunica o conceito certo do produto: parceiro e a loja que vende conosco. Enquanto a API nao entra,
            a vitrine publica ja apresenta presenca comercial, prova social e caminho para novos cadastros.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {partnerPillars.map((pillar) => (
              <span key={pillar} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100">
                {pillar}
              </span>
            ))}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">Frente comercial</p>
              <strong className="mt-2 block text-xl">Captacao de lojas</strong>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">Frente visual</p>
              <strong className="mt-2 block text-xl">Vitrine de lojas participantes</strong>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">Frente operacional</p>
              <strong className="mt-2 block text-xl">Pedido e atendimento</strong>
            </div>
          </div>
          <Link href="/lojas-parceiras" className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200">
            Ver lojas parceiras
          </Link>
        </article>
      </section>

      <section id="vitrine-demo" className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Vitrine local</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Lojas de exemplo</h2>
            </div>
            <Link href="/lojas-parceiras" className="text-sm font-semibold text-[var(--accent-strong)]">
              Ver todas as lojas parceiras
            </Link>
          </div>
          <div className="mt-6 grid gap-4">
            {stores.map((store) => (
              <article key={store.id} className="overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-white">
                <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
                  <div className="min-h-56 bg-slate-100 lg:min-h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={store.coverImageUrl} alt={store.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-3 p-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold text-slate-900">{store.name}</h3>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{store.status}</span>
                    </div>
                    <p className="text-sm leading-6 text-[var(--muted)]">
                      {store.city}, {store.state} · WhatsApp {store.whatsapp}
                    </p>
                    <p className="text-sm leading-6 text-[var(--muted)]">
                      Chave Pix: <span className="font-medium text-slate-800">{store.pixKey}</span>
                    </p>
                    <Link href={`/lojas/${store.slug}`} className="inline-flex rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700">
                      Abrir vitrine da loja
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Painel em destaque</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Catalogo atual do lojista em teste</h2>
            </div>
            <Link href="/painel-lojista/produtos" className="text-sm font-semibold text-[var(--accent-strong)]">
              Abrir formulario completo
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {workspace.products.map((product) => (
              <article key={product.id} className="overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-white">
                <div className="aspect-[4/5] bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.imageUrls[0]} alt={product.name} className="h-full w-full object-cover" />
                </div>
                <div className="space-y-3 p-4">
                  <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                  <p className="text-sm leading-6 text-[var(--muted)]">{product.description}</p>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">Estoque {product.stock}</span>
                    <strong className="text-slate-900">R$ {product.priceRetail.toFixed(2)}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

