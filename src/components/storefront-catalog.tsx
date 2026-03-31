"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiMenu, FiMessageCircle, FiSearch, FiX } from "react-icons/fi";

import { Modal } from "@/components/ui-modal";
import { Badge } from "@/components/ui-badge";
import { Button } from "@/components/ui-button";
import type { Category, Product, StoreSummary } from "@/types/catalog";

type StorefrontCatalogProps = {
  store: StoreSummary;
  categories: Category[];
  products: Product[];
  featuredProducts: Product[];
  selectedCategorySlug?: string;
};

type SortMode = "recentes" | "nome" | "preco";
type FilterMode = "todos" | "estoque" | "sem_estoque";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const normalizeValue = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export function StorefrontCatalog({
  store,
  categories,
  products,
  featuredProducts,
  selectedCategorySlug,
}: StorefrontCatalogProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileCategoryMenuOpen, setMobileCategoryMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(() => {
    if (!selectedCategorySlug) return "todas";
    return categories.find((item) => item.slug === selectedCategorySlug)?.id ?? "todas";
  });
  const [filterMode, setFilterMode] = useState<FilterMode>("todos");
  const [sortMode, setSortMode] = useState<SortMode>("recentes");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewIndex, setQuickViewIndex] = useState(0);

  const categoryOptions = useMemo(
    () => [{ id: "todas", name: "Tudo", slug: "all" }, ...categories],
    [categories],
  );

  const prioritizedProducts = useMemo(() => {
    if (featuredProducts.length > 0) {
      const featuredIds = new Set(featuredProducts.map((product) => product.id));
      const remaining = products.filter((product) => !featuredIds.has(product.id));
      return [...featuredProducts, ...remaining];
    }

    return products;
  }, [featuredProducts, products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = normalizeValue(searchTerm);

    const nextProducts = prioritizedProducts.filter((product) => {
      const categoryName = categories.find((item) => item.id === product.categoryId)?.name ?? "";
      const matchesSearch = !normalizedSearch
        || [product.name, product.slug, product.description ?? "", categoryName].some((value) =>
          normalizeValue(value).includes(normalizedSearch),
        );

      const matchesCategory = selectedCategoryId === "todas" || product.categoryId === selectedCategoryId;
      const matchesStock = filterMode === "todos"
        ? true
        : filterMode === "estoque"
          ? product.stock > 0
          : product.stock <= 0;

      return matchesSearch && matchesCategory && matchesStock;
    });

    return nextProducts.sort((left, right) => {
      if (sortMode === "nome") return left.name.localeCompare(right.name, "pt-BR");
      if (sortMode === "preco") return right.priceRetail - left.priceRetail;
      return Number(Boolean(right.featured)) - Number(Boolean(left.featured));
    });
  }, [categories, filterMode, prioritizedProducts, searchTerm, selectedCategoryId, sortMode]);

  const openQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setQuickViewIndex(0);
  };

  const selectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setMobileCategoryMenuOpen(false);
  };

  const quickViewImages = quickViewProduct?.imageUrls?.length ? quickViewProduct.imageUrls : [];
  const quickViewCategory = quickViewProduct
    ? categories.find((item) => item.id === quickViewProduct.categoryId)
    : undefined;

  const handleQuickViewImageStep = (direction: "prev" | "next") => {
    if (!quickViewImages.length) return;
    setQuickViewIndex((current) => direction === "next"
      ? (current + 1) % quickViewImages.length
      : (current - 1 + quickViewImages.length) % quickViewImages.length);
  };

  const whatsappHref = `https://wa.me/55${store.whatsapp}?text=${encodeURIComponent(`Ola, vim da vitrine da loja ${store.name} e quero atendimento.`)}`;

  return (
    <>
      <main className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-4 px-4 pb-8 pt-4 sm:px-6 sm:pb-10 lg:px-8 lg:pt-5 2xl:px-12">
        <section className="sticky top-3 z-20 rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)]/96 px-4 py-3 shadow-[var(--shadow)] backdrop-blur sm:px-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileCategoryMenuOpen((current) => !current)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full theme-border-button p-0 lg:hidden"
              aria-label="Abrir categorias"
              title="Abrir categorias"
            >
              {mobileCategoryMenuOpen ? <FiX className="h-4.5 w-4.5" /> : <FiMenu className="h-4.5 w-4.5" />}
            </button>

            <div className="min-w-0 shrink-0 lg:min-w-[180px]">
              <strong className="block truncate text-[clamp(1.4rem,2.2vw,2rem)] font-semibold leading-none theme-heading">{store.name}</strong>
            </div>

            <div className="hidden min-w-0 flex-1 gap-2 overflow-x-auto pb-1 pr-1 lg:flex [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categoryOptions.map((category) => {
                const active = selectedCategoryId === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => selectCategory(category.id)}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${active
                      ? "bg-[var(--accent)] text-white"
                      : "theme-border-button"
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSearchOpen((current) => !current)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full theme-border-button p-0"
                aria-label="Buscar produtos"
                title="Buscar produtos"
              >
                {searchOpen ? <FiX className="h-4.5 w-4.5" /> : <FiSearch className="h-4.5 w-4.5" />}
              </button>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] p-0 text-white transition hover:bg-[var(--accent-strong)]"
                aria-label="Falar no WhatsApp"
                title="Falar no WhatsApp"
              >
                <FiMessageCircle className="h-4.5 w-4.5" />
              </a>
            </div>
          </div>

          {mobileCategoryMenuOpen ? (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categoryOptions.map((category) => {
                const active = selectedCategoryId === category.id;
                return (
                  <button
                    key={`mobile-${category.id}`}
                    type="button"
                    onClick={() => selectCategory(category.id)}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${active
                      ? "bg-[var(--accent)] text-white"
                      : "theme-border-button"
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          ) : null}

          {searchOpen ? (
            <div className="mt-3 grid gap-3 rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface)] p-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_220px_220px]">
              <label className="block space-y-2 sm:col-span-2 xl:col-span-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Buscar</span>
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Nome, categoria ou slug"
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Filtro</span>
                <select
                  value={filterMode}
                  onChange={(event) => setFilterMode(event.target.value as FilterMode)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                >
                  <option value="todos">Todos</option>
                  <option value="estoque">Com estoque</option>
                  <option value="sem_estoque">Sem estoque</option>
                </select>
              </label>
              <label className="block space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Ordenar</span>
                <select
                  value={sortMode}
                  onChange={(event) => setSortMode(event.target.value as SortMode)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                >
                  <option value="recentes">Destaques</option>
                  <option value="nome">Nome</option>
                  <option value="preco">Maior preco</option>
                </select>
              </label>
            </div>
          ) : null}
        </section>

        {filteredProducts.length > 0 ? (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-[1.85rem] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:shadow-[var(--shadow)]"
              >
                <button type="button" onClick={() => openQuickView(product)} className="block w-full text-left">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.imageUrls[0]} alt={product.name} className="aspect-[4/5] w-full object-cover" />
                </button>
                <div className="space-y-2.5 p-4 pt-3">
                  
                  <button type="button" onClick={() => openQuickView(product)} className="block w-full text-left">
                    <h3 className="line-clamp-2 text-[1.32rem] font-semibold leading-tight theme-heading">{product.name}</h3>
                  </button>
                  <div className="pt-1">
                    <Link
                      href={`/lojas/${store.slug}/produtos/${product.slug}`}
                      className="flex min-h-11 items-center justify-between rounded-full bg-slate-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      <span>Ver produto</span>
                      <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-semibold text-white">Comprar</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="rounded-[2rem] border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center text-sm text-[var(--muted)]">
            Nenhum produto encontrado nessa selecao.
          </section>
        )}
      </main>

      {quickViewProduct ? (
        <Modal
          onClose={() => setQuickViewProduct(null)}
          title={quickViewProduct.name}
          description={quickViewCategory?.name ?? "Produto da loja"}
        >
          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_380px]">
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)]">
                {quickViewImages.length > 1 ? (
                  <>
                    <button type="button" onClick={() => handleQuickViewImageStep("prev")} className="absolute left-4 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-[0_12px_24px_rgba(15,23,42,0.12)] transition hover:scale-[1.03]" aria-label="Imagem anterior">
                      <FiChevronLeft className="h-5 w-5" />
                    </button>
                    <button type="button" onClick={() => handleQuickViewImageStep("next")} className="absolute right-4 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-[0_12px_24px_rgba(15,23,42,0.12)] transition hover:scale-[1.03]" aria-label="Proxima imagem">
                      <FiChevronRight className="h-5 w-5" />
                    </button>
                  </>
                ) : null}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={quickViewImages[quickViewIndex] ?? quickViewProduct.imageUrls[0]} alt={quickViewProduct.name} className="aspect-[4/5] w-full object-cover" />
              </div>
              {quickViewImages.length > 1 ? (
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                  {quickViewImages.map((imageUrl, index) => (
                    <button key={`${imageUrl}-${index}`} type="button" onClick={() => setQuickViewIndex(index)} className={`overflow-hidden rounded-[1.1rem] border transition ${quickViewIndex === index ? "border-[var(--accent)] shadow-[0_0_0_2px_rgba(37,99,235,0.16)]" : "border-[var(--border)]"}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt={`${quickViewProduct.name} ${index + 1}`} className="aspect-square w-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="space-y-4 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
              <div className="flex flex-wrap gap-2">
                {quickViewCategory ? <Badge variant="neutral">{quickViewCategory.name}</Badge> : null}
                <Badge variant={quickViewProduct.stock > 0 ? "success" : "danger"}>{quickViewProduct.stock > 0 ? `${quickViewProduct.stock} no estoque` : "Sem estoque"}</Badge>
              </div>
              <div className="rounded-[1.4rem] theme-surface-card p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Preco</p>
                <strong className="mt-2 block text-4xl theme-heading">{formatCurrency(quickViewProduct.priceRetail)}</strong>
              </div>
              {quickViewProduct.description ? <p className="text-sm leading-7 text-[var(--muted)]">{quickViewProduct.description}</p> : null}
              <div className="grid gap-3">
                <Button as={Link} href={`/lojas/${store.slug}/produtos/${quickViewProduct.slug}`} variant="dark" size="lg" className="justify-center text-center">Abrir pagina do produto</Button>
                <Button as={Link} href={`/lojas/${store.slug}/carrinho?product=${quickViewProduct.slug}&quantity=1`} variant="secondary" size="lg" className="justify-center text-center">Ir para o carrinho</Button>
                <Button as="a" href={`https://wa.me/55${store.whatsapp}?text=${encodeURIComponent(`Ola, quero comprar o produto ${quickViewProduct.name} da loja ${store.name}.`)}`} target="_blank" rel="noreferrer" variant="primary" size="lg" className="justify-center text-center">Falar com a loja</Button>
              </div>
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
}




