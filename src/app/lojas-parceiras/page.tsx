import Link from "next/link";

import { getFeaturedStores } from "@/lib/services/catalog-service";

export default async function LojasParceirasPage() {
  const stores = await getFeaturedStores();

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

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {stores.map((store) => (
          <article key={store.id} className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
            <div className="aspect-[4/3] bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={store.coverImageUrl} alt={store.name} className="h-full w-full object-cover" />
            </div>
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-900">{store.name}</h2>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{store.status}</span>
              </div>
              <p className="text-sm leading-6 text-[var(--muted)]">
                {store.city}, {store.state}
              </p>
              <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4 text-sm leading-6 text-[var(--muted)]">
                <p>WhatsApp: <span className="font-medium text-slate-800">{store.whatsapp}</span></p>
                <p>Pix: <span className="font-medium text-slate-800">{store.pixKey}</span></p>
                <p>Slug publico: <span className="font-medium text-slate-800">/{store.slug}</span></p>
              </div>
              <Link href={`/lojas/${store.slug}`} className="inline-flex rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700">
                Abrir vitrine da loja
              </Link>
            </div>
          </article>
        ))}
      </section>

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
