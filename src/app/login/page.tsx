"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui-button";
import { findLocalSellerAuth } from "@/lib/local-auth-storage";

const accessCards = [
  {
    title: "Entrar como lojista",
    description: "Acesse seu painel com o cadastro real criado no fluxo da loja.",
    href: "/cadastro-loja",
    cta: "Criar loja primeiro",
  },
  {
    title: "Entrar como admin",
    description: "O acesso admin continua separado e deve ganhar autenticacao propria depois.",
    href: "/painel-admin",
    cta: "Abrir admin de teste",
  },
];

const ADMIN_DEMO_EMAIL = "admin@hierarquia.local";
const ADMIN_DEMO_PASSWORD = "admin123";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState(
    "Use o e-mail e a senha criados no cadastro da loja. O login real da API entra na proxima fase.",
  );

  const handleFrontendLogin = () => {
    if (!email.trim() || !password.trim()) {
      setFeedback("Preencha e-mail e senha para validar o acesso.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail === ADMIN_DEMO_EMAIL && password === ADMIN_DEMO_PASSWORD) {
      setFeedback("Acesso admin de validacao confirmado. Redirecionando...");
      window.setTimeout(() => {
        router.push("/painel-admin");
      }, 500);
      return;
    }

    const sellerAccess = findLocalSellerAuth(email, password);

    if (!sellerAccess) {
      setFeedback("E-mail ou senha invalidos para este ambiente de teste. Use os dados criados no cadastro da loja.");
      return;
    }

    document.cookie = `seller_store_slug=${sellerAccess.storeSlug}; path=/; max-age=2592000; samesite=lax`;
    setFeedback(`Acesso validado para ${sellerAccess.storeName}. Redirecionando para o painel da loja...`);

    window.setTimeout(() => {
      router.push("/painel-lojista");
    }, 500);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 pt-0 pb-3 sm:px-6 sm:pt-0 sm:pb-4 lg:px-8 lg:pt-0 lg:pb-5">
      <section className="sticky top-0 z-30 rounded-[1.75rem] border border-[var(--border)] bg-[rgba(255,252,247,0.92)] px-4 py-3 shadow-[var(--shadow-soft)] backdrop-blur-xl sm:px-5 sm:py-4">
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
            Login validado localmente
          </span>
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Entre com os dados reais criados no cadastro da sua loja.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-lg sm:leading-8">
              Enquanto a autenticacao oficial da API nao entra, o ambiente usa validacao local para impedir acessos falsos e manter o contexto correto da loja no painel.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {accessCards.map((card) => (
              <article key={card.title} className="rounded-[1.75rem] border border-[var(--border)] bg-white p-5">
                <h2 className="text-xl font-semibold text-slate-900">{card.title}</h2>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{card.description}</p>
                <Button
                  as={Link}
                  href={card.href}
                  variant="dark"
                  size="md"
                  className="mt-5 inline-flex text-white hover:text-white focus:text-white visited:text-white"
                >
                  {card.cta}
                </Button>
              </article>
            ))}
          </div>
          <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4 text-sm leading-6 text-[var(--muted)]">
            Admin de teste: <span className="font-semibold text-slate-900">admin@hierarquia.local</span> com senha <span className="font-semibold text-slate-900">admin123</span>.
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
              Entrar no painel
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
