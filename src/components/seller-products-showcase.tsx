"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { FilterSelect } from "@/components/filter-select";
import { Modal } from "@/components/ui-modal";
import { Button } from "@/components/ui-button";
import { deleteSellerProduct } from "@/lib/services/catalog-service";
import type { SellerWorkspace } from "@/types/catalog";
import {
  deleteLocalSellerProduct,
  duplicateLocalSellerProduct,
  readLocalSellerProducts,
  subscribeLocalSellerProducts,
  type LocalSellerProductRecord,
} from "@/lib/local-product-storage";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const EMPTY_LOCAL_PRODUCTS: LocalSellerProductRecord[] = [];

type ProductViewMode = "vitrine" | "lista";
type ProductFilterMode = "todos" | "estoque_baixo" | "sem_imagem" | "api" | "novo";
type ProductSortMode = "recentes" | "nome" | "preco" | "estoque";

type ShowcaseProductRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  categoryName: string;
  priceRetail: number;
  priceWholesale?: number;
  pricePromotion?: number;
  stock: number;
  minStock: number;
  imageUrl?: string;
  createdAt: string;
  source: "api" | "local";
};

const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

const viewModeOptions: Array<{ value: ProductViewMode; label: string }> = [
  { value: "vitrine", label: "Vitrine" },
  { value: "lista", label: "Lista" },
];

export function SellerProductsShowcase({ workspace }: { workspace: SellerWorkspace }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [filterMode, setFilterMode] = useState<ProductFilterMode>("todos");
  const [sortMode, setSortMode] = useState<ProductSortMode>("recentes");
  const [viewMode, setViewMode] = useState<ProductViewMode>("vitrine");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<ShowcaseProductRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const localProducts = useSyncExternalStore<LocalSellerProductRecord[]>(
    subscribeLocalSellerProducts,
    readLocalSellerProducts,
    () => EMPTY_LOCAL_PRODUCTS,
  );

  const mergedProducts = useMemo<ShowcaseProductRecord[]>(() => {
    const apiProducts = workspace.products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description ?? "",
      categoryId: product.categoryId,
      categoryName:
        workspace.categories.find((category) => category.id === product.categoryId)?.name ?? "Sem categoria",
      priceRetail: product.priceRetail,
      priceWholesale: product.priceWholesale,
      pricePromotion: product.pricePromotion,
      stock: product.stock,
      minStock: product.minStock ?? 0,
      imageUrl: product.imageUrls[0],
      createdAt: new Date().toISOString(),
      source: "api" as const,
    }));

    const localMapped = localProducts
      .filter((product) => product.storeId === workspace.store.id)
      .map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        categoryId: product.categoryId,
        categoryName: product.categoryName,
        priceRetail: product.priceRetail,
        priceWholesale: product.priceWholesale,
        pricePromotion: product.pricePromotion,
        stock: product.stock,
        minStock: product.minStock,
        imageUrl: product.mainImageUrl ?? product.images[0]?.previewUrl,
        createdAt: product.createdAt,
        source: "local" as const,
      }));

    return [...localMapped, ...apiProducts];
  }, [localProducts, workspace.categories, workspace.products, workspace.store.id]);

  const categoryOptions = useMemo(
    () => [
      { value: "todas", label: "Todas as categorias" },
      ...Array.from(new Set(mergedProducts.map((product) => product.categoryName))).map((categoryName) => ({
        value: categoryName,
        label: categoryName,
      })),
    ],
    [mergedProducts],
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = normalizeSearch(searchTerm);

    const nextProducts = mergedProducts.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        [product.name, product.slug, product.categoryName].some((value) => normalizeSearch(value).includes(normalizedSearch));

      const matchesCategory = selectedCategory === "todas" || product.categoryName === selectedCategory;
      const isLowStock = product.stock <= product.minStock;
      const hasImage = Boolean(product.imageUrl);
      const matchesFilter =
        filterMode === "todos"
          ? true
          : filterMode === "estoque_baixo"
            ? isLowStock
            : filterMode === "sem_imagem"
              ? !hasImage
              : filterMode === "api"
                ? product.source === "api"
                : product.source === "local";

      return matchesSearch && matchesCategory && matchesFilter;
    });

    return nextProducts.sort((left, right) => {
      if (sortMode === "nome") {
        return left.name.localeCompare(right.name, "pt-BR");
      }

      if (sortMode === "preco") {
        return right.priceRetail - left.priceRetail;
      }

      if (sortMode === "estoque") {
        return right.stock - left.stock;
      }

      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });
  }, [filterMode, mergedProducts, searchTerm, selectedCategory, sortMode]);

  const summary = useMemo(() => {
    const lowStock = filteredProducts.filter((product) => product.stock <= product.minStock).length;
    const withoutImage = filteredProducts.filter((product) => !product.imageUrl).length;

    return {
      total: filteredProducts.length,
      lowStock,
      withoutImage,
    };
  }, [filteredProducts]);

  const productPublicUrl = (product: ShowcaseProductRecord) => `${window.location.origin}/lojas/${workspace.store.slug}/produtos/${product.slug}`;

  const handleOpenVitrine = (product: ShowcaseProductRecord) => {
    window.open(productPublicUrl(product), "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async (product: ShowcaseProductRecord) => {
    try {
      await navigator.clipboard.writeText(productPublicUrl(product));
      setActionFeedback(`Link de ${product.name} copiado com sucesso.`);
    } catch {
      setActionFeedback(`Nao foi possivel copiar o link de ${product.name} agora.`);
    }
    setOpenMenuId(null);
  };

  const handleDuplicate = (product: ShowcaseProductRecord) => {
    duplicateLocalSellerProduct({
      id: product.id,
      storeId: workspace.store.id,
      storeName: workspace.store.name,
      name: product.name,
      slug: product.slug,
      description: product.description,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      priceRetail: product.priceRetail,
      priceWholesale: product.priceWholesale,
      pricePromotion: product.pricePromotion,
      stock: product.stock,
      minStock: product.minStock,
      images: product.imageUrl ? [{ id: `${product.id}-image`, name: product.name, previewUrl: product.imageUrl }] : [],
      mainImageUrl: product.imageUrl,
      createdAt: product.createdAt,
    });
    setActionFeedback(`Uma copia de ${product.name} foi adicionada na vitrine interna.`);
    setOpenMenuId(null);
  };

  const handleEdit = (product: ShowcaseProductRecord) => {
    window.dispatchEvent(
      new CustomEvent("seller-product-edit", {
        detail: product,
      }),
    );
    setActionFeedback(`Produto ${product.name} carregado no formulario para edicao.`);
    setOpenMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;

    setIsDeleting(true);

    try {
      if (deleteTarget.source === "local") {
        deleteLocalSellerProduct(deleteTarget.id);
      } else {
        await deleteSellerProduct(deleteTarget.id);
        router.refresh();
      }

      setActionFeedback(`Produto ${deleteTarget.name} removido com sucesso.`);
      setDeleteTarget(null);
    } catch (error) {
      setActionFeedback(error instanceof Error ? error.message : "Nao foi possivel remover o produto agora.");
    } finally {
      setIsDeleting(false);
      setOpenMenuId(null);
    }
  };

  const renderActions = (product: ShowcaseProductRecord) => (
    <div className="relative flex flex-wrap gap-2">
      <Button type="button" variant="secondary" size="sm" onClick={() => setOpenMenuId((current) => current === product.id ? null : product.id)}>
        Gerenciar
      </Button>
      <Button type="button" variant="dark" size="sm" onClick={() => handleOpenVitrine(product)}>
        Abrir vitrine
      </Button>
      {openMenuId === product.id ? (
        <div className="absolute right-0 top-12 z-20 min-w-[220px] rounded-[1.3rem] border border-[var(--border)] bg-white p-2 shadow-[var(--shadow)]">
          <button type="button" onClick={() => handleEdit(product)} className="flex w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-800 transition hover:bg-slate-50">
            Editar produto
          </button>
          <button type="button" onClick={() => handleDuplicate(product)} className="flex w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-800 transition hover:bg-slate-50">
            Duplicar produto
          </button>
          <button type="button" onClick={() => handleCopyLink(product)} className="flex w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-800 transition hover:bg-slate-50">
            Copiar link publico
          </button>
          <button type="button" onClick={() => { setDeleteTarget(product); setOpenMenuId(null); }} className="flex w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-700 transition hover:bg-rose-50">
            Excluir produto
          </button>
        </div>
      ) : null}
    </div>
  );

  return (
    <section id="produtos-cadastrados" className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Vitrine interna</p>
          <h2 className="mt-2 text-2xl font-semibold theme-heading">Produtos cadastrados da loja</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Agora essa area tambem funciona como base de gestao, com busca, filtros e dois modos de leitura do catalogo.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full theme-border-button px-4 py-2 text-sm font-semibold transition">{summary.total} resultado(s)</span>
          <span className="rounded-full theme-badge-warning px-3 py-1 text-xs font-semibold">{summary.lowStock} com estoque baixo</span>
          {actionFeedback ? <span className="rounded-full theme-badge-success px-3 py-1 text-xs font-semibold">{actionFeedback}</span> : null}
        </div>
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-soft)]">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(180px,0.35fr))_auto]">
          <label className="block space-y-2">
            <span className="text-sm font-medium theme-heading">Buscar produto</span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por nome, slug ou categoria"
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
            />
          </label>

          <FilterSelect label="Categoria" value={selectedCategory} onChange={setSelectedCategory} options={categoryOptions} />

          <FilterSelect
            label="Filtro"
            value={filterMode}
            onChange={(value) => setFilterMode(value as ProductFilterMode)}
            options={[
              { value: "todos", label: "Todos" },
              { value: "estoque_baixo", label: "Estoque baixo" },
              { value: "sem_imagem", label: "Sem imagem" },
              { value: "novo", label: "Novos locais" },
              { value: "api", label: "Vindos da API" },
            ]}
          />

          <FilterSelect
            label="Ordenar"
            value={sortMode}
            onChange={(value) => setSortMode(value as ProductSortMode)}
            options={[
              { value: "recentes", label: "Mais recentes" },
              { value: "nome", label: "Nome" },
              { value: "preco", label: "Maior preco" },
              { value: "estoque", label: "Maior estoque" },
            ]}
          />

          <div className="space-y-2">
            <span className="text-sm font-medium theme-heading">Visualizacao</span>
            <div className="flex flex-wrap gap-2">
              {viewModeOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={viewMode === option.value ? "primary" : "secondary"}
                  onClick={() => setViewMode(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {filteredProducts.length ? (
        viewMode === "vitrine" ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => {
              const isLowStock = product.stock <= product.minStock;

              return (
                <article key={`${product.source}-${product.id}`} className="overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-white">
                  <div className="aspect-[4/5] bg-slate-100">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-[var(--muted)]">Sem imagem principal</div>
                    )}
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.source === "local" ? "theme-badge-info" : "theme-badge-neutral"}`}>
                        {product.source === "local" ? "Novo" : "API"}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isLowStock ? "theme-badge-warning" : "theme-badge-success"}`}>
                        {isLowStock ? "Estoque baixo" : "Estoque ok"}
                      </span>
                    </div>
                    <div>
                      <strong className="block text-lg theme-heading">{product.name}</strong>
                      <p className="mt-1 text-sm text-[var(--muted)]">{product.categoryName}</p>
                      <p className="mt-1 text-xs font-mono text-[var(--muted)]">/{product.slug}</p>
                    </div>
                    <p className="line-clamp-2 text-sm leading-6 text-[var(--muted)]">{product.description || "Sem descricao informada."}</p>
                    <div className="flex items-center justify-between gap-3">
                      <strong className="text-lg theme-heading">{formatCurrency(product.priceRetail)}</strong>
                      <span className="text-sm text-[var(--muted)]">{product.stock} em estoque</span>
                    </div>
                    {renderActions(product)}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-4">
            {filteredProducts.map((product) => {
              const isLowStock = product.stock <= product.minStock;

              return (
                <article key={`${product.source}-${product.id}`} className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-soft)]">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <div className="h-28 w-24 shrink-0 overflow-hidden rounded-[1.2rem] bg-slate-100">
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center px-3 text-center text-xs text-[var(--muted)]">Sem imagem</div>
                        )}
                      </div>
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <strong className="text-lg theme-heading">{product.name}</strong>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.source === "local" ? "theme-badge-info" : "theme-badge-neutral"}`}>
                            {product.source === "local" ? "Novo" : "API"}
                          </span>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isLowStock ? "theme-badge-warning" : "theme-badge-success"}`}>
                            {isLowStock ? "Estoque baixo" : "Estoque ok"}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--muted)]">{product.categoryName}</p>
                        <p className="text-xs font-mono text-[var(--muted)]">/{product.slug}</p>
                        <p className="line-clamp-2 text-sm leading-6 text-[var(--muted)]">{product.description || "Sem descricao informada."}</p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[420px] xl:max-w-[460px] xl:flex-1">
                      <div className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--surface)] p-3">
                        <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Preco</p>
                        <strong className="mt-2 block text-base theme-heading">{formatCurrency(product.priceRetail)}</strong>
                      </div>
                      <div className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--surface)] p-3">
                        <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Estoque</p>
                        <strong className="mt-2 block text-base theme-heading">{product.stock} unidade(s)</strong>
                      </div>
                      <div className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--surface)] p-3">
                        <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Preview</p>
                        <strong className="mt-2 block text-base theme-heading">{product.imageUrl ? "Com imagem" : "Sem imagem"}</strong>
                      </div>
                    </div>

                    {renderActions(product)}
                  </div>
                </article>
              );
            })}
          </div>
        )
      ) : (
        <div className="mt-6 rounded-[1.5rem] border border-dashed border-[var(--border)] bg-white p-8 text-sm leading-6 text-[var(--muted)]">
          Nenhum produto corresponde aos filtros atuais. Ajuste a busca, a categoria ou o tipo de visualizacao para continuar gerenciando a loja.
        </div>
      )}

      {deleteTarget ? (
        <Modal
          onClose={() => setDeleteTarget(null)}
          title="Excluir produto"
          description={`Voce esta prestes a remover ${deleteTarget.name} da vitrine interna da loja.`}
        >
          <div className="mt-6 space-y-4">
            <div className="rounded-[1.4rem] border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800">
              Essa acao remove o produto do ambiente atual. Para itens da API, a exclusao tambem sera persistida no backend.
            </div>
            <div className="flex flex-wrap justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setDeleteTarget(null)}>
                Cancelar
              </Button>
              <Button type="button" variant="dark" onClick={handleConfirmDelete} className="bg-rose-700 hover:bg-rose-600" disabled={isDeleting}>
                {isDeleting ? "Excluindo..." : "Confirmar exclusao"}
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </section>
  );
}
