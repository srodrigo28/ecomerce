import Link from "next/link";

import { StoreSignupForm } from "@/components/store-signup-form";

const onboardingSteps = [
  "Dados comerciais da loja",
  "Contato principal e canais de venda",
  "Pix e operacao de recebimento",
  "Endereco e cidade de atuacao",
];

export default function CadastroLojaPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <section className="rounded-[2rem] border border-[var(--border)] bg-[rgba(255,252,247,0.92)] p-4 shadow-[var(--shadow)] backdrop-blur sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex items-center gap-3 text-slate-900">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">H</span>
            <div>
              <strong className="block text-lg font-semibold">Cadastro de Loja</strong>
              <span className="text-sm text-[var(--muted)]">Onboarding comercial da Hierarquia</span>
            </div>
          </Link>
          <div className="flex flex-wrap gap-3">
            <Link href="/login" className="rounded-full theme-border-button px-4 py-2.5 text-sm font-semibold transition">
              Ja tenho acesso
            </Link>
            <Link href="/lojas-parceiras" className="rounded-full theme-border-button px-4 py-2.5 text-sm font-semibold transition">
              Ver lojas parceiras
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]">
        <article className="rounded-[2rem] border border-[var(--border)] bg-slate-900 p-6 text-white shadow-[var(--shadow)] lg:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">Entrada comercial</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            Cadastre sua loja e prepare a base de estoque, pedidos e vendas desde o primeiro acesso.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-lg sm:leading-8">
            O cadastro precisa refletir o que o negocio realmente usa. Por isso esta pagina ja parte dos campos mais importantes para operacao do lojista.
          </p>
          <div className="mt-8 grid gap-3">
            {onboardingSteps.map((step, index) => (
              <div key={step} className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-100">
                <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
                  0{index + 1}
                </span>
                {step}
              </div>
            ))}
          </div>
        </article>

        <StoreSignupForm />
      </section>
    </main>
  );
}
