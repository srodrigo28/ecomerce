import Link from "next/link";

import { searchPublicCatalog } from "@/lib/services/catalog-service";

export default async function LojasParceirasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string; category?: string }>;
}) {
  const { q, city = "all", category = "all" } = await searchParams;
  const [search, fullCatalog] = await Promise.all([searchPublicCatalog(q ?? ""), searchPublicCatalog("")]);
  const hasQuery = search.query.length > 0;

  const cityOptions = Array.from(
    new Set(fullCatalog.results.map((result) => result.store.city).filter((value): value is string => Boolean(value))),
  ).sort((a, b) => a.localeCompare(b));

  const categoryOptions = Array.from(
    new Set(fullCatalog.results.flatMap((result) => result.matchedCategories)),
  ).sort((a, b) => a.localeCompare(b));

  const filteredResults = search.results.filter((result) => {
    const cityMatches = city === "all" || result.store.city === city;
    const categoryMatches = category === "all" || result.matchedCategories.includes(category) || result.matchedProducts.some((product) => product.categoryName === category);

    return cityMatches && categoryMatches;
  });

  const resultsCountLabel = hasQuery
    ? `${filteredResults.length} loja(s) encontrada(s) para "${search.query}".`
    : `${filteredResults.length} loja(s) disponivel(is) para explorar na vitrine.`;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <section className="rounded-[2rem] border border-[var(--border)] bg-slate-900 p-6 text-white shadow-[var(--shadow)] lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">Lojas parceiras</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              Parceiras aqui significam as lojas cadastradas e ativas dentro da Hierarquia.
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-300 sm:text-lg sm:leading-8">
              Esta pagina reforca a leitura certa do produto: cada parceiro e um lojista participante, com catalogo proprio, categorias proprias e operacao independente.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/cadastro-loja" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200">
              Quero ser parceiro
            </Link>
            <Link href="/login" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              Fazer login
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)] lg:items-end">
          <form className="space-y-4">
            <label className="block space-y-3">
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Busca publica da vitrine</span>
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                <input
                  type="search"
                  name="q"
                  defaultValue={search.query}
                  placeholder="Buscar loja, categoria ou produto"
                  className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--accent)]"
                />
                <button type="submit" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
                  Buscar
                </button>
              </div>
            </label>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-800">Cidade</span>
                <select name="city" defaultValue={city} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]">
                  <option value="all">Todas as cidades</option>
                  {cityOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-800">Categoria</span>
                <select name="category" defaultValue={category} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]">
                  <option value="all">Todas as categorias</option>
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>

            <p className="text-sm leading-6 text-[var(--muted)]">
              A busca considera nome da loja, cidade, categoria e produto. Os filtros ajudam a cortar a vitrine sem depender da API.
            </p>
          </form>

          <div className="rounded-[1.75rem] border border-[rgba(245,158,11,0.25)] bg-[rgba(255,248,235,0.92)] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Resumo da busca</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">{resultsCountLabel}</p>
            {(city !== "all" || category !== "all") ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {city !== "all" ? <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">Cidade: {city}</span> : null}
                {category !== "all" ? <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">Categoria: {category}</span> : null}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {filteredResults.length > 0 ? (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredResults.map((result) => (
            <article key={result.store.id} className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
              <div className="aspect-[4/3] bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={result.store.coverImageUrl} alt={result.store.name} className="h-full w-full object-cover" />
              </div>
              <div className="space-y-4 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-slate-900">{result.store.name}</h2>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{result.store.status}</span>
                </div>
                <p className="text-sm leading-6 text-[var(--muted)]">
                  {result.store.city}, {result.store.state}
                </p>
                <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4 text-sm leading-6 text-[var(--muted)]">
                  <p>WhatsApp: <span className="font-medium text-slate-800">{result.store.whatsapp}</span></p>
                  <p>Pix: <span className="font-medium text-slate-800">{result.store.pixKey}</span></p>
                  <p>Slug publico: <span className="font-medium text-slate-800">/{result.store.slug}</span></p>
                </div>

                {result.matchedCategories.length > 0 ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Categorias encontradas</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {result.matchedCategories.map((matchedCategory) => (
                        <span key={`${result.store.id}-${matchedCategory}`} className="rounded-full border border-[var(--border)] bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                          {matchedCategory}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {result.matchedProducts.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Produtos encontrados</p>
                    {result.matchedProducts.slice(0, 3).map((product) => (
                      <div key={product.id} className="grid gap-3 rounded-[1.25rem] border border-[var(--border)] bg-white p-3 md:grid-cols-[64px_minmax(0,1fr)] md:items-center">
                        <div className="aspect-square overflow-hidden rounded-xl bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{product.name}</p>
                          <p className="text-sm text-[var(--muted)]">{product.categoryName ?? "Categoria da loja"}</p>
                          <p className="text-sm font-medium text-slate-900">R$ {product.priceRetail.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <Link href={`/lojas/${result.store.slug}`} className="inline-flex rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700">
                    Abrir vitrine da loja
                  </Link>
                  {result.matchedProducts[0] ? (
                    <Link href={`/lojas/${result.store.slug}/produtos/${result.matchedProducts[0].slug}`} className="inline-flex rounded-full border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-[var(--accent)]">
                      Ver produto encontrado
                    </Link>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-[2rem] border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-[var(--shadow)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Nenhum resultado</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">Nada apareceu para essa combinacao de busca e filtros.</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-base">
            Tente buscar pelo nome de uma loja, por categorias como Camisas ou Jeans, ou por produtos como Blazer e Vestido.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/lojas-parceiras" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
              Limpar busca e filtros
            </Link>
            <Link href="/" className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-[var(--accent)]">
              Voltar para home
            </Link>
          </div>
        </section>
      )}

      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Por que isso importa para o negocio</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-base">
              Quando tratamos parceiros como lojas cadastradas, o produto fica mais claro: cada lojista tem seu proprio catalogo, categorias isoladas, controle de estoque e leitura de vendas sem impactar os demais.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-[rgba(245,158,11,0.25)] bg-[rgba(255,248,235,0.92)] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Proximo passo</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Fechar a frente publica com loja parceira, login, vitrine e produto deixa o frontend mais coerente antes da futura integracao da API.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
