import { AdminEventCalendar } from "@/components/admin-event-calendar";
import { AdminHeroSlider } from "@/components/admin-hero-slider";
import { AdminOperationsDashboard } from "@/components/admin-operations-dashboard";
import { AdminTopbar } from "@/components/admin-topbar";
import { getAdminWorkspace } from "@/lib/services/catalog-service";

export default async function AdminDashboardPage() {
  const workspace = await getAdminWorkspace();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-8 px-4 pt-0 pb-6 sm:px-6 sm:pt-0 sm:pb-8 lg:px-10 lg:pt-0 lg:pb-10 2xl:px-12">
      <AdminTopbar />

      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-8 lg:p-10">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_420px] xl:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Painel admin</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight theme-heading sm:text-4xl xl:text-5xl">
              Visao macro da plataforma com filtros por lojista e periodo
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base sm:leading-8">
              Esta area consolida o que o negocio precisa enxergar por ultimo antes da API: vendas, pedidos, cadastros e comparativo entre lojistas.
            </p>

            <AdminHeroSlider />
          </div>

          <AdminEventCalendar />
        </div>
      </section>

      <AdminOperationsDashboard workspace={workspace} />
    </main>
  );
}
