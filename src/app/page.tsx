import Link from "next/link";

import { getFeaturedStores, getSellerWorkspace } from "@/lib/services/catalog-service";
import { apiConfig, appConfig, endpointMap, hasServerApiToken, resolvedEndpoints } from "@/lib/config";

const phases = [
  {
    title: "Frontend testavel",
    description: "O projeto pode ser navegado e validado sem API usando dados locais e servicos mockados.",
  },
  {
    title: "Painel do lojista",
    description: "Cadastro de produtos com experiencia amigavel, preview e regras de imagens prontas.",
  },
  {
    title: "Conexao futura",
    description: "A troca para API real fica concentrada na camada de servicos e no .env.",
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
  "Vitrine local com lojas e produtos de exemplo",
  "Servicos preparados para trocar mock por API depois",
  "Painel do lojista com cadastro visualmente validavel",
  "Upload local e por URL com preview de 1 a 5 imagens",
];

export default async function Home() {
  const stores = await getFeaturedStores();
  const workspace = await getSellerWorkspace();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-8 px-4 py-6 sm:gap-10 sm:px-6 sm:py-8 lg:px-10 lg:py-10 2xl:px-12">
      <section className="grid gap-6 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] backdrop-blur sm:p-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] xl:p-10 2xl:gap-8">
        <div className="space-y-6">
          <span className="inline-flex w-fit rounded-full bg-[rgba(15,118,110,0.12)] px-4 py-2 text-sm font-semibold text-[var(--accent-strong)]">
            Frontend pronto para testes sem backend
          </span>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl xl:text-6xl">
              Hierarquia agora tem uma base visual navegavel e preparada para conectar com API depois.
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-lg sm:leading-8">
              Em vez de esperar a API existir, ja deixamos a experiencia principal viva: vitrine, contexto comercial,
              painel do lojista e cadastro de produtos com imagens e preview.
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
            <Link href="/painel-lojista/produtos" className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]">
              Abrir painel do lojista
            </Link>
            <a href="#vitrine-demo" className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-[var(--accent)]">
              Ver vitrine de exemplo
            </a>
          </div>
        </div>

        <aside className="rounded-[1.75rem] border border-[rgba(245,158,11,0.3)] bg-[rgba(255,255,255,0.92)] p-5 sm:p-6 xl:self-start">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Diagnostico rapido</p>
          <div className="mt-5 space-y-4">
            {envChecks.map((item) => (
              <div key={item.label} className="rounded-2xl border border-[var(--border)] px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-900">{item.label}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.ready ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {item.ready ? "ok" : "pendente"}
                  </span>
                </div>
                <p className="mt-2 break-all font-mono text-xs text-[var(--muted)]">{item.value}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
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

      <section id="vitrine-demo" className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Vitrine local</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Lojas de exemplo</h2>
            </div>
            <span className="text-sm text-[var(--muted)]">{stores.length} lojas carregadas por mock</span>
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
