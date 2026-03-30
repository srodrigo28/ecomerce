"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const accessCards = [
  {
    title: "Entrar como lojista",
    description: "Acesse seu painel para acompanhar categorias, estoque, pedidos e vendas.",
    href: "/painel-lojista",
    cta: "Abrir painel do lojista",
  },
  {
    title: "Entrar como admin",
    description: "Acompanhe a operacao da plataforma com filtros por lojista, pedidos e vendas.",
    href: "/painel-admin",
    cta: "Abrir painel admin",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState(
    "O login definitivo entra depois. Neste momento estamos validando experiencia, navegacao e entradas de negocio.",
  );

  const handleFrontendLogin = () => {
    if (!email.trim() || !password.trim()) {
      setFeedback("Preencha e-mail e senha para continuar para o painel de teste.");
      return;
    }

    const nextPath = email.toLowerCase().includes("admin") ? "/painel-admin" : "/painel-lojista";
    setFeedback(
      nextPath === "/painel-admin"
        ? "Acesso frontend validado. Redirecionando para o painel admin de teste..."
        : "Acesso frontend validado. Redirecionando para o painel do lojista de teste...",
    );

    window.setTimeout(() => {
      router.push(nextPath);
    }, 500);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <section className="rounded-[2rem] border border-[var(--border)] bg-[rgba(255,252,247,0.92)] p-4 shadow-[var(--shadow)] backdrop-blur sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex items-center gap-3 text-slate-900">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">H</span>
            <div>
              <strong className="block text-lg font-semibold">Hierarquia</strong>
              <span className="text-sm text-[var(--muted)]">Acesso ao ambiente operacional</span>
            </div>
          </Link>
          <div className="flex flex-wrap gap-3">
            <Link href="/cadastro-loja" className="rounded-full theme-border-button px-4 py-2.5 text-sm font-semibold transition">
              Cadastrar loja
            </Link>
            <Link href="/lojas-parceiras" className="rounded-full theme-border-button px-4 py-2.5 text-sm font-semibold transition">
              Ver lojas parceiras
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:p-8">
        <div className="space-y-6">
          <span className="inline-flex rounded-full bg-[rgba(15,118,110,0.12)] px-4 py-2 text-sm font-semibold text-[var(--accent-strong)]">
            Login frontend para validacao de fluxo
          </span>
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Entre no ambiente certo sem travar o projeto com backend antes da hora.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-lg sm:leading-8">
              Esta etapa continua mockada de proposito. O objetivo agora e validar jornada, hierarquia visual e acessos principais antes da API.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {accessCards.map((card) => (
              <article key={card.title} className="rounded-[1.75rem] border border-[var(--border)] bg-white p-5">
                <h2 className="text-xl font-semibold text-slate-900">{card.title}</h2>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{card.description}</p>
                <Link href={card.href} className="mt-5 inline-flex rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
                  {card.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-[1.75rem] border border-[rgba(245,158,11,0.3)] bg-[rgba(255,255,255,0.94)] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Acesso rapido</p>
          <form
            className="mt-5 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              handleFrontendLogin();
            }}
          >
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-800">E-mail</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="contato@minhaloja.com"
                className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--accent)]"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-800">Senha</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="Digite sua senha"
                className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--accent)]"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
            >
              Continuar no frontend
            </button>
          </form>
          <div className="mt-5 rounded-[1.5rem] border border-[var(--border)] bg-slate-50 p-4 text-sm leading-6 text-[var(--muted)]">
            {feedback}
          </div>
        </aside>
      </section>
    </main>
  );
}
