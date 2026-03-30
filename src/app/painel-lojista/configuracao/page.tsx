import Link from "next/link";

import { StoreSettingsForm } from "@/components/store-settings-form";

const settingsHighlights = [
  "WhatsApp e Pix usados no modal de compra",
  "Endereco completo para vitrine e retirada",
  "Logo, capa e descricao da loja",
  "Politica de entrega e horario de atendimento",
];

export default function SellerStoreSettingsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10 2xl:px-12">
      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-8 lg:p-10">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Configuracao da loja</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight theme-heading sm:text-4xl xl:text-5xl">
              Centralize os dados que movem a vitrine, o WhatsApp e o fluxo comercial
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base sm:leading-8">
              Este modulo organiza os dados principais da loja em um fluxo guiado: identidade visual, contato, Pix, endereco e regras de entrega.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/painel-lojista" className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]">
              Voltar para painel
            </Link>
            <Link href="/lojas/aurora-atelier" className="rounded-full theme-border-button px-5 py-3 text-sm font-semibold transition">
              Abrir vitrine
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(380px,1.05fr)]">
        <article className="rounded-[2rem] border border-white/10 bg-[var(--dark-panel)] p-6 text-white shadow-[var(--shadow)] lg:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">Modulo comercial</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Tudo o que a loja precisa para vender bem deve nascer aqui.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
            A configuracao da loja agora deixa de ficar espalhada pelo onboarding e passa a existir como area propria dentro do painel do lojista.
          </p>
          <div className="mt-8 grid gap-3">
            {settingsHighlights.map((item, index) => (
              <div key={item} className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-100">
                <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
                  0{index + 1}
                </span>
                {item}
              </div>
            ))}
          </div>
        </article>

        <StoreSettingsForm />
      </section>
    </main>
  );
}
