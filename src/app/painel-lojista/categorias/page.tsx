import Link from "next/link";

import { SellerCategoriesBoard } from "@/components/seller-categories-board";
import { getSellerWorkspace } from "@/lib/services/catalog-service";

export default async function SellerCategoriesPage() {
  const workspace = await getSellerWorkspace();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10 2xl:px-12">
      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-8 lg:p-10">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Categorias da loja</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight theme-heading sm:text-4xl xl:text-5xl">
              Organize a vitrine por categorias comerciais reais da sua loja
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base sm:leading-8">
              Este modulo cuida das categorias que aparecem na vitrine, no cadastro de produtos e nos links compartilhaveis da loja.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/painel-lojista/produtos" className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]">
              Ir para produtos
            </Link>
            <Link href="/painel-lojista" className="rounded-full theme-border-button px-5 py-3 text-sm font-semibold transition">
              Voltar para painel
            </Link>
          </div>
        </div>
      </section>

      <SellerCategoriesBoard workspace={workspace} />
    </main>
  );
}
