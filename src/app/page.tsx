import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui-button";
import { Card } from "@/components/ui-card";
import { getFeaturedStores, getSellerWorkspace } from "@/lib/services/catalog-service";

const simpleCards = [
  {
    title: "Crie sua loja online",
    description: "Monte sua vitrine digital com um link proprio e uma apresentacao profissional para comecar a vender.",
  },
  {
    title: "Cadastre seu estoque",
    description: "Organize produtos, acompanhe disponibilidade e tenha mais clareza para repor no momento certo.",
  },
  {
    title: "Venda com simplicidade",
    description: "Receba pedidos e acompanhe sua operacao em um fluxo facil para o lojista usar no dia a dia.",
  },
];

const visualHighlights = [
  {
    eyebrow: "colecao feminina",
    title: "Looks que chamam atencao",
    description: "Visual forte para valorizar novidades, pecas premium e campanhas da loja.",
  },
  {
    eyebrow: "colecao masculina",
    title: "Vitrine limpa e confiante",
    description: "Apresentacao elegante para destacar produtos, estilo e identidade da marca.",
  },
];

export default async function Home() {
  const stores = await getFeaturedStores();
  const workspace = await getSellerWorkspace();

  const activeStores = stores.filter((store) => store.status === "ativo").length;
  const totalProducts = workspace.products.length;
  const lowStockProducts = workspace.products.filter((product) => product.stock <= (product.minStock ?? 0)).length;
  const visualStores = stores.slice(0, 2);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1360px] flex-col gap-10 px-4 py-5 sm:px-6 lg:px-10 lg:py-6">
      <header className="border-b border-[var(--border)] bg-white/92">
        <div className="mx-auto flex w-full items-center justify-between gap-4 py-4">
          <Link href="/" className="flex items-center gap-0.5 text-[2rem] font-black tracking-tight">
            <span className="text-[var(--accent)]">Minha</span>
            <span className="text-slate-900">Loja</span>
          </Link>

          <div className="hidden min-w-[320px] flex-1 justify-center md:flex">
            <div className="w-full max-w-[560px] rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm text-slate-400 shadow-sm">
              Buscar produtos...
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
            >
              Login
            </Link>
            <Button as={Link} href="/cadastro-loja" size="md" variant="dark" className="rounded-xl px-5 py-3">
              Cadastrar
            </Button>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_1.35fr]">
        <article className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <div className="grid gap-5 sm:grid-cols-2">
            {visualStores.map((store, index) => {
              const highlight = visualHighlights[index] ?? visualHighlights[visualHighlights.length - 1];

              return (
                <div key={store.id} className="group">
                  <div className="relative overflow-hidden rounded-[1.5rem] bg-slate-100 shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                    <div className="relative aspect-[4/5]">
                      {store.coverImageUrl ? (
                        <Image
                          src={store.coverImageUrl}
                          alt={highlight.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 20vw"
                          className="object-cover transition duration-500 ease-out group-hover:scale-[1.05]"
                        />
                      ) : (
                        <div className="h-full w-full bg-[linear-gradient(135deg,#e2e8f0,#ffffff)]" />
                      )}
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(15,23,42,0.38)_100%)] opacity-70 transition duration-500 group-hover:opacity-90" />
                      <div className="absolute left-4 top-4 rounded-full bg-white/88 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-900 shadow-sm backdrop-blur-sm">
                        {highlight.eyebrow}
                      </div>
                    </div>
                  </div>
                  <div className="px-1 py-4 text-center">
                    <p className="text-xl font-black tracking-tight text-slate-950 transition duration-300 group-hover:text-[var(--accent)]">
                      {highlight.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{highlight.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-[var(--shadow-soft)]">
          <div className="flex h-full min-h-[420px] flex-col justify-center px-8 py-10 sm:px-12">
            <span className="w-fit rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
              Plataforma simples para lojistas
            </span>
            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">
              Crie sua loja online, cadastre seu estoque e comece a vender sem complicacao.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Uma pagina inicial limpa, direta e visual para mostrar ao lojista que ele pode publicar sua loja,
              organizar produtos e vender com mais confianca.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button as={Link} href="/cadastro-loja" size="lg" className="rounded-xl px-6">
                Criar minha loja agora
              </Button>
              <Button as={Link} href="/login" size="lg" variant="secondary" className="rounded-xl px-6">
                Entrar no painel
              </Button>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <Card className="border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
          <p className="text-sm font-medium text-slate-500">Lojas ativas</p>
          <strong className="mt-3 block text-4xl font-black tracking-tight text-slate-950">{activeStores}</strong>
          <p className="mt-3 text-sm leading-7 text-slate-600">Lojistas usando a plataforma para publicar e vender online.</p>
        </Card>

        <Card className="border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
          <p className="text-sm font-medium text-slate-500">Produtos cadastrados</p>
          <strong className="mt-3 block text-4xl font-black tracking-tight text-slate-950">{totalProducts}</strong>
          <p className="mt-3 text-sm leading-7 text-slate-600">Catalogo organizado para apresentar melhor a loja e acelerar vendas.</p>
        </Card>

        <Card className="border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
          <p className="text-sm font-medium text-slate-500">Estoque simplificado</p>
          <strong className="mt-3 block text-4xl font-black tracking-tight text-slate-950">{lowStockProducts}</strong>
          <p className="mt-3 text-sm leading-7 text-slate-600">Itens que precisam de reposicao para manter a operacao ativa.</p>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {simpleCards.map((card) => (
          <Card key={card.title} className="border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
            <h2 className="text-2xl font-black tracking-tight text-slate-950">{card.title}</h2>
            <p className="mt-4 text-base leading-8 text-slate-600">{card.description}</p>
          </Card>
        ))}
      </section>
    </main>
  );
}
