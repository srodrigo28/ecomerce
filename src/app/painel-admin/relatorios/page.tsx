import Link from "next/link";

import { AdminReportsBoard } from "@/components/admin-reports-board";
import { getAdminWorkspace } from "@/lib/services/catalog-service";

export default async function AdminReportsPage() {
  const workspace = await getAdminWorkspace();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10 2xl:px-12">
      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-8 lg:p-10">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Relatorios admin</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl xl:text-5xl">
              Modulo dedicado para acompanhar receita, pedidos e comparativo entre lojistas
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base sm:leading-8">
              Esta tela organiza a leitura macro da plataforma em um modulo proprio, com recorte por periodo, filtro por lojista e interpretacao mais clara da operacao geral.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/painel-admin" className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]">
              Voltar para painel admin
            </Link>
            <Link href="/painel-lojista" className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-[var(--accent)]">
              Ver painel do lojista
            </Link>
          </div>
        </div>
      </section>

      <AdminReportsBoard workspace={workspace} />
    </main>
  );
}
