import { AdminReportsBoard } from "@/components/admin-reports-board";
import { AdminTopbar } from "@/components/admin-topbar";
import { getAdminWorkspace } from "@/lib/services/catalog-service";

export default async function AdminReportsPage() {
  const workspace = await getAdminWorkspace();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-8 px-4 pt-0 pb-6 sm:px-6 sm:pt-0 sm:pb-8 lg:px-10 lg:pt-0 lg:pb-10 2xl:px-12">
      <AdminTopbar />

      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-8 lg:p-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Relatorios admin</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl xl:text-5xl">
            Modulo dedicado para acompanhar receita, pedidos e comparativo entre lojistas
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base sm:leading-8">
            Esta tela organiza a leitura macro da plataforma em um modulo proprio, com recorte por periodo, filtro por lojista e interpretacao mais clara da operacao geral.
          </p>
        </div>
      </section>

      <AdminReportsBoard workspace={workspace} />
    </main>
  );
}
