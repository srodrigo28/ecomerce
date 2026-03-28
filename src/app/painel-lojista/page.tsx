import Link from "next/link";

export default function SellerDashboardPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-10 sm:px-10">
      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Painel do lojista</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">Area operacional em construcao orientada por testes visuais</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted)]">
          O primeiro fluxo escolhido para ganhar profundidade foi o cadastro de produtos, porque ele concentra valor comercial,
          risco operacional e necessidade de preview de imagens.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/painel-lojista/produtos" className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]">
            Ir para cadastro de produtos
          </Link>
          <Link href="/" className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-[var(--accent)]">
            Voltar para inicio
          </Link>
        </div>
      </section>
    </main>
  );
}