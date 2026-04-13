import Link from "next/link";

import type { StoreSummary } from "@/types/catalog";

const statusLabels: Record<StoreSummary["status"], string> = {
  ativo: "Ativa",
  inativo: "Inativa",
};

const formatAddress = (store: StoreSummary) => {
  const parts = [store.city, store.state].filter(Boolean);
  return parts.length > 0 ? parts.join(" - ") : "Endereco ainda nao informado";
};

export function AdminStoresBoard({ stores }: { stores: StoreSummary[] }) {
  return (
    <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-8 lg:p-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Gestao de lojistas</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight theme-heading sm:text-4xl">
            Todas as lojas cadastradas na plataforma
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base sm:leading-8">
            Esta area centraliza quem ja foi cadastrado, qual o status atual e quais dados basicos cada lojista informou no onboarding.
          </p>
        </div>

        <div className="rounded-[1.5rem] theme-surface-card px-5 py-4">
          <p className="text-sm text-[var(--muted)]">Total de lojistas</p>
          <strong className="mt-2 block text-3xl theme-heading">{stores.length}</strong>
        </div>
      </div>

      {stores.length === 0 ? (
        <article className="mt-8 rounded-[1.5rem] border border-dashed border-[var(--border)] px-6 py-10 text-center">
          <strong className="block text-lg theme-heading">Nenhum lojista encontrado</strong>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Quando novas lojas forem cadastradas pela API, elas aparecerao aqui para acompanhamento administrativo.
          </p>
        </article>
      ) : (
        <div className="mt-8 grid gap-4">
          {stores.map((store) => (
            <article key={store.id} className="rounded-[1.75rem] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-soft)]">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-lg theme-heading">{store.name}</strong>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${store.status === "ativo" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>
                      {statusLabels[store.status]}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-3 text-sm text-[var(--muted)] sm:grid-cols-2 xl:grid-cols-4">
                    <p><span className="font-semibold text-slate-900">Slug:</span> {store.slug}</p>
                    <p><span className="font-semibold text-slate-900">Email:</span> {store.ownerEmail ?? "Nao informado"}</p>
                    <p><span className="font-semibold text-slate-900">Local:</span> {formatAddress(store)}</p>
                    <p><span className="font-semibold text-slate-900">WhatsApp:</span> {store.whatsapp ?? "Nao informado"}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/lojas/${store.slug}`}
                    className="rounded-full theme-border-button px-4 py-2 text-sm font-semibold transition"
                  >
                    Ver vitrine
                  </Link>
                  <Link
                    href={`/painel-lojista?store=${store.slug}`}
                    className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    Abrir painel lojista
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
