"use client";

import Link from "next/link";

export default function SellerSegmentError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="w-full rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-[var(--shadow)] sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Falha no painel</p>
        <h1 className="mt-3 text-3xl font-semibold theme-heading">Nao foi possivel carregar esse modulo do lojista agora.</h1>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)] sm:text-base">
          Tente novamente para recuperar o modulo ou volte para o painel principal enquanto continuamos refinando a base frontend-first.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]">
            Tentar novamente
          </button>
          <Link href="/painel-lojista" className="rounded-full theme-border-button px-5 py-3 text-sm font-semibold transition">
            Voltar para painel
          </Link>
        </div>
      </section>
    </main>
  );
}
