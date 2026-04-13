"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { FiEdit3, FiShare2, FiTrash2 } from "react-icons/fi";
import { useRouter } from "next/navigation";

import { FilterSelect } from "@/components/filter-select";
import { Modal } from "@/components/ui-modal";
import { Button } from "@/components/ui-button";
import { deleteSellerProduct, deleteSellerProductImage, getSellerProductById, submitSellerProduct } from "@/lib/services/catalog-service";
import type { ProductApiImageMeta, SellerWorkspace } from "@/types/catalog";
import {
  deleteLocalSellerProduct,
  readLocalSellerProducts,
  saveLocalSellerProduct,
  subscribeLocalSellerProducts,
  type LocalSellerProductRecord,
} from "@/lib/local-product-storage";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const EMPTY_LOCAL_PRODUCTS: LocalSellerProductRecord[] = [];

type ProductViewMode = "vitrine" | "lista";
type ProductFilterMode = "todos" | "estoque_baixo" | "sem_imagem" | "api" | "novo";
type ProductSortMode = "recentes" | "nome" | "preco" | "estoque";
type ManageSection = "catalogo" | "precos";

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
  images: ProductApiImageMeta[];
  createdAt: string;
  source: "api" | "local";
};

const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

const SELLER_PRODUCTS_SCROLL_KEY = "seller-products-scroll-target";

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
  const [manageTarget, setManageTarget] = useState<ShowcaseProductRecord | null>(null);
  const [manageImageId, setManageImageId] = useState<string | null>(null);
  const [deactivatedProductIds] = useState<string[]>([]);
  const [actionFeedback, setActionFeedback] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<ShowcaseProductRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isShowcaseFocused, setIsShowcaseFocused] = useState(false);
  const [manageSection, setManageSection] = useState<ManageSection>("catalogo");
  const [manageDraft, setManageDraft] = useState({
    name: "",
    priceRetail: "",
    priceWholesale: "",
    pricePromotion: "",
    stock: "",
    categoryId: "",
  });

  const localProducts = useSyncExternalStore<LocalSellerProductRecord[]>(
    subscribeLocalSellerProducts,
    readLocalSellerProducts,
    () => EMPTY_LOCAL_PRODUCTS,
  );

  useEffect(() => {
    if (!manageTarget) {
      setManageImageId(null);
      setManageDraft({
        name: "",
        priceRetail: "",
        priceWholesale: "",
        pricePromotion: "",
        stock: "",
        categoryId: "",
      });
      setManageSection("catalogo");
      return;
    }

    const primaryImage = manageTarget.images.find((image) => image.isMain) ?? manageTarget.images[0];
    setManageImageId(primaryImage?.id ?? null);
    setManageDraft({
      name: manageTarget.name,
      priceRetail: String(manageTarget.priceRetail),
      priceWholesale: manageTarget.priceWholesale !== undefined ? String(manageTarget.priceWholesale) : "",
      pricePromotion: manageTarget.pricePromotion !== undefined ? String(manageTarget.pricePromotion) : "",
      stock: String(manageTarget.stock),
      categoryId: manageTarget.categoryId,
    });
    setManageSection("catalogo");
  }, [manageTarget]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const shouldFocus = window.location.hash === "#produtos-cadastrados"
      || window.sessionStorage.getItem(SELLER_PRODUCTS_SCROLL_KEY) === "produtos-cadastrados";

    if (!shouldFocus) return;

    const frame = window.requestAnimationFrame(() => {
      const section = document.getElementById("produtos-cadastrados");
      section?.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsShowcaseFocused(true);
      window.sessionStorage.removeItem(SELLER_PRODUCTS_SCROLL_KEY);
      window.setTimeout(() => setIsShowcaseFocused(false), 2200);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [localProducts.length, workspace.products.length]);

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
      images: product.images ?? [],
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
        images: (product.images ?? []).map((image, index) => ({
          id: image.id,
          name: image.name,
          imageUrl: image.previewUrl,
          isMain: (product.mainImageUrl ?? product.images[0]?.previewUrl) === image.previewUrl,
          position: index + 1,
        })),
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

  const productPublicUrl = (product: ShowcaseProductRecord) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return new URL(`/lojas/${workspace.store.slug}/produtos/${product.slug}`, baseUrl || "http://localhost:3000").toString();
  };

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
  };

  const handleEdit = (product: ShowcaseProductRecord) => {
    setManageTarget(null);
    window.requestAnimationFrame(() => {
      window.dispatchEvent(
        new CustomEvent("seller-product-edit", {
          detail: product,
        }),
      );
    });
    setActionFeedback(`Produto ${product.name} carregado no formulario para edicao.`);
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
      setManageTarget(null);
    } catch (error) {
      setActionFeedback(error instanceof Error ? error.message : "Nao foi possivel remover o produto agora.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getManageGallery = (product: ShowcaseProductRecord | null) => {
    if (!product) return [];
    if (product.images.length) return product.images;
    return product.imageUrl
      ? [{ id: `${product.id}-cover`, name: product.name, imageUrl: product.imageUrl, isMain: true, position: 1 }]
      : [];
  };

  const manageGallery = getManageGallery(manageTarget);
  const manageSelectedIndex = manageGallery.findIndex((image) => image.id === manageImageId);
  const managePreviewImage = manageGallery[manageSelectedIndex >= 0 ? manageSelectedIndex : 0]
    ?? manageGallery.find((image) => image.isMain)
    ?? manageGallery[0]
    ?? null;
  const manageIsDeactivated = manageTarget ? deactivatedProductIds.includes(manageTarget.id) : false;
  const manageHasGalleryNavigation = manageGallery.length > 1;
  const manageDisplayName = manageDraft.name.trim() || manageTarget?.name || "";
  const manageDisplayPrice = Number(manageDraft.priceRetail || 0);
  const manageDisplayWholesale = Number(manageDraft.priceWholesale || 0);
  const manageDisplayPromotion = Number(manageDraft.pricePromotion || 0);
  const manageDisplayStock = Number(manageDraft.stock || 0);
  const manageDisplayCategoryName =
    workspace.categories.find((category) => category.id === manageDraft.categoryId)?.name
    ?? manageTarget?.categoryName
    ?? "Sem categoria";

  const mapProductToShowcaseRecord = (product: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    categoryId: string;
    priceRetail: number;
    priceWholesale?: number;
    pricePromotion?: number;
    stock: number;
    minStock?: number;
    imageUrls: string[];
    images?: ProductApiImageMeta[];
  }): ShowcaseProductRecord => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    categoryId: product.categoryId,
    categoryName: workspace.categories.find((category) => category.id === product.categoryId)?.name ?? "Sem categoria",
    priceRetail: product.priceRetail,
    priceWholesale: product.priceWholesale,
    pricePromotion: product.pricePromotion,
    stock: product.stock,
    minStock: product.minStock ?? 0,
    imageUrl: product.imageUrls[0],
    images: product.images ?? [],
    createdAt: new Date().toISOString(),
    source: "api",
  });

  const handleQuickSaveAndClose = async () => {
    if (!manageTarget) return;

    const trimmedName = manageDraft.name.trim();
    const nextPriceRetail = Number(manageDraft.priceRetail || 0);
    const nextPriceWholesale = manageDraft.priceWholesale ? Number(manageDraft.priceWholesale) : undefined;
    const nextPricePromotion = manageDraft.pricePromotion ? Number(manageDraft.pricePromotion) : undefined;
    const nextStock = Number(manageDraft.stock || 0);

    if (!trimmedName || !manageDraft.categoryId) {
      setActionFeedback("Preencha titulo e categoria para salvar as alteracoes.");
      return;
    }

    try {
      if (manageTarget.source === "local") {
        saveLocalSellerProduct({
          id: manageTarget.id,
          storeId: workspace.store.id,
          storeName: workspace.store.name,
          name: trimmedName,
          slug: manageTarget.slug,
          description: manageTarget.description,
          categoryId: manageDraft.categoryId,
          categoryName: workspace.categories.find((category) => category.id === manageDraft.categoryId)?.name ?? manageTarget.categoryName,
          priceRetail: nextPriceRetail,
          priceWholesale: nextPriceWholesale,
          pricePromotion: nextPricePromotion,
          stock: nextStock,
          minStock: manageTarget.minStock,
          images: manageGallery.map((image) => ({ id: image.id, name: image.name, previewUrl: image.imageUrl })),
          mainImageUrl: managePreviewImage?.imageUrl,
          createdAt: manageTarget.createdAt,
        });
      } else {
        const apiImages = manageGallery.map((image) => ({
          id: `manage-${image.id}`,
          source: "api" as const,
          name: image.name,
          previewUrl: image.imageUrl,
          apiImageId: image.id,
          isMain: managePreviewImage ? image.id === managePreviewImage.id : image.isMain,
        }));

        await submitSellerProduct({
          productId: manageTarget.id,
          storeId: workspace.store.id,
          categoryId: manageDraft.categoryId,
          name: trimmedName,
          slug: manageTarget.slug,
          description: manageTarget.description,
          priceRetail: nextPriceRetail,
          priceWholesale: nextPriceWholesale,
          pricePromotion: nextPricePromotion,
          stock: nextStock,
          minStock: manageTarget.minStock,
          images: apiImages,
          mainImageId: apiImages.find((image) => image.isMain)?.id,
        });
        router.refresh();
      }

      setActionFeedback(`Produto ${trimmedName} atualizado com sucesso.`);
      setManageTarget(null);
    } catch (error) {
      setActionFeedback(error instanceof Error ? error.message : "Nao foi possivel salvar as alteracoes rapidas do produto.");
    }
  };

  const handleOpenImageEditor = () => {
    if (!manageTarget) return;
    setActionFeedback(`Abrindo a edicao completa de ${manageDisplayName} para adicionar ou reorganizar imagens.`);
    handleEdit(manageTarget);
  };

  const handleDeleteSelectedManageImage = async () => {
    if (!manageTarget || !managePreviewImage) return;

    try {
      if (manageTarget.source === "local") {
        const remainingImages = manageGallery.filter((image) => image.id !== managePreviewImage.id);
        if (remainingImages.length === 0) {
          setActionFeedback("Mantenha ao menos 1 imagem no produto local antes de salvar.");
          return;
        }

        const nextMainImage = remainingImages[0];
        saveLocalSellerProduct({
          id: manageTarget.id,
          storeId: workspace.store.id,
          storeName: workspace.store.name,
          name: manageTarget.name,
          slug: manageTarget.slug,
          description: manageTarget.description,
          categoryId: manageTarget.categoryId,
          categoryName: manageTarget.categoryName,
          priceRetail: manageTarget.priceRetail,
          priceWholesale: nextPriceWholesale,
          pricePromotion: nextPricePromotion,
          stock: manageTarget.stock,
          minStock: manageTarget.minStock,
          images: remainingImages.map((image) => ({ id: image.id, name: image.name, previewUrl: image.imageUrl })),
          mainImageUrl: nextMainImage?.imageUrl,
          createdAt: manageTarget.createdAt,
        });

        setManageTarget({
          ...manageTarget,
          imageUrl: nextMainImage?.imageUrl,
          images: remainingImages.map((image, index) => ({ ...image, isMain: index == 0 })),
        });
        setManageImageId(nextMainImage?.id ?? null);
      } else {
        await deleteSellerProductImage(manageTarget.id, managePreviewImage.id);
        const refreshedProduct = await getSellerProductById(manageTarget.id);
        const nextRecord = mapProductToShowcaseRecord(refreshedProduct);
        setManageTarget(nextRecord);
        setManageImageId(nextRecord.images.find((image) => image.isMain)?.id ?? nextRecord.images[0]?.id ?? null);
        router.refresh();
      }

      setActionFeedback(`Imagem removida de ${manageDisplayName} com sucesso.`);
    } catch (error) {
      setActionFeedback(error instanceof Error ? error.message : "Nao foi possivel remover a imagem selecionada.");
    }
  };

  const handleManageGalleryStep = (direction: "prev" | "next") => {
    if (!manageGallery.length) return;

    const currentIndex = manageGallery.findIndex((image) => image.id === managePreviewImage?.id);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = direction === "next"
      ? (safeIndex + 1) % manageGallery.length
      : (safeIndex - 1 + manageGallery.length) % manageGallery.length;

    setManageImageId(manageGallery[nextIndex]?.id ?? null);
  };

  const renderActions = (product: ShowcaseProductRecord) => (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="secondary" size="sm" onClick={() => setManageTarget(product)}>
        Gerenciar
      </Button>
      <Button type="button" variant="dark" size="sm" onClick={() => handleOpenVitrine(product)}>
        Abrir vitrine
      </Button>
    </div>
  );

  return (
    <section id="produtos-cadastrados" className={`rounded-[2rem] border bg-[var(--surface)] p-5 shadow-[var(--shadow)] transition-all duration-300 sm:p-6 ${isShowcaseFocused ? "border-[var(--accent)] shadow-[0_0_0_3px_rgba(37,99,235,0.12)]" : "border-[var(--border)]"}`}>
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
              const isDeactivated = deactivatedProductIds.includes(product.id);

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
                      {isDeactivated ? (
                        <span className="rounded-full theme-badge-danger px-3 py-1 text-xs font-semibold">Desativado</span>
                      ) : null}
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
              const isDeactivated = deactivatedProductIds.includes(product.id);

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
                          {isDeactivated ? (
                            <span className="rounded-full theme-badge-danger px-3 py-1 text-xs font-semibold">Desativado</span>
                          ) : null}
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


      {manageTarget ? (
        <Modal
          onClose={() => setManageTarget(null)}
          title={manageDisplayName}
          description="Painel rapido do produto com foco em apresentacao, gestao e acoes comerciais da loja."
        >
          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.8fr)]">
            <div className="space-y-3 rounded-[2rem] bg-white p-2 shadow-[var(--shadow-soft)]">
              <div className="relative overflow-hidden rounded-[1.7rem] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_55%),linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
                {manageHasGalleryNavigation ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleManageGalleryStep("prev")}
                      className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-xl font-semibold text-slate-700 shadow-[0_12px_24px_rgba(15,23,42,0.12)] transition hover:scale-[1.03]"
                      aria-label="Imagem anterior"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => handleManageGalleryStep("next")}
                      className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-xl font-semibold text-slate-700 shadow-[0_12px_24px_rgba(15,23,42,0.12)] transition hover:scale-[1.03]"
                      aria-label="Proxima imagem"
                    >
                      ›
                    </button>
                  </>
                ) : null}

                <div className="min-h-[520px] sm:min-h-[600px] lg:min-h-[660px]">
                  {managePreviewImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={managePreviewImage.imageUrl} alt={manageDisplayName} className="h-full w-full object-contain px-0 py-0 sm:py-1" />
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center text-sm text-[var(--muted)]">Sem imagem principal para esse produto.</div>
                  )}
                </div>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
                      {manageSelectedIndex >= 0 ? manageSelectedIndex + 1 : 1} de {manageGallery.length || 1}
                    </span>
                    <div className="flex items-center gap-2">
                      {managePreviewImage?.isMain ? (
                        <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-white">Imagem principal</span>
                      ) : null}
                      {managePreviewImage ? (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleDeleteSelectedManageImage();
                          }}
                          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/92 text-rose-600 shadow-sm transition hover:bg-rose-50"
                          aria-label="Excluir imagem selecionada"
                          title="Excluir imagem selecionada"
                        >
                          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                            <path d="M9 4.75h6m-8 3h10m-8.25 0 .5 10.5a1 1 0 0 0 1 .95h3.5a1 1 0 0 0 1-.95l.5-10.5M10 10.5v5M14 10.5v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                          </svg>
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {manageGallery.length > 1 ? (
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-6">
                  {manageGallery.slice(0, 5).map((image) => {
                    const isSelected = managePreviewImage?.id === image.id;
                    return (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => setManageImageId(image.id)}
                        className={`overflow-hidden rounded-[1rem] border transition ${isSelected ? "border-[var(--accent)] shadow-[0_0_0_2px_rgba(37,99,235,0.12)]" : "border-[var(--border)] hover:border-[var(--accent)]"}`}
                      >
                        <div className="aspect-[4/5] bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={image.imageUrl} alt={image.name} className="h-full w-full object-cover" />
                        </div>
                      </button>
                    );
                  })}
                  {manageGallery.length < 5 ? (
                    <button
                      type="button"
                      onClick={handleOpenImageEditor}
                      className="flex aspect-[4/5] items-center justify-center rounded-[1rem] border border-dashed border-[var(--border)] bg-[var(--surface)] text-3xl font-light text-[var(--accent)] transition hover:border-[var(--accent)]"
                      aria-label="Adicionar imagem"
                      title="Adicionar imagem"
                    >
                      +
                    </button>
                  ) : null}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenImageEditor}
                  className="flex aspect-[4/5] max-w-[140px] items-center justify-center rounded-[1rem] border border-dashed border-[var(--border)] bg-[var(--surface)] text-3xl font-light text-[var(--accent)] transition hover:border-[var(--accent)]"
                  aria-label="Adicionar imagem"
                  title="Adicionar imagem"
                >
                  +
                </button>
              )}


              <details className="overflow-hidden rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface)] group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Mais detalhes</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">Galeria, origem do cadastro e status atual do produto</p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-white text-lg font-semibold text-slate-700 transition group-open:rotate-45">+</span>
                </summary>
                <div className="grid gap-3 border-t border-[var(--border)] px-4 py-4 sm:grid-cols-3">
                  <div className="rounded-[1.2rem] border border-[var(--border)] bg-white p-3">
                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Galeria</p>
                    <strong className="mt-2 block text-base theme-heading">{manageGallery.length} imagem(ns)</strong>
                  </div>
                  <div className="rounded-[1.2rem] border border-[var(--border)] bg-white p-3">
                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Origem</p>
                    <strong className="mt-2 block text-base theme-heading">{manageTarget.source === "api" ? "Persistido" : "Local"}</strong>
                  </div>
                  <div className="rounded-[1.2rem] border border-[var(--border)] bg-white p-3">
                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Status</p>
                    <strong className="mt-2 block text-base theme-heading">{manageIsDeactivated ? "Fora da vitrine" : "Em destaque"}</strong>
                  </div>
                </div>
              </details>
            </div>

            <div className="space-y-4">
              <div className="rounded-[2rem] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-soft)]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">Gestao</span>
                  <span className="rounded-full theme-badge-neutral px-3 py-1 text-xs font-semibold">{manageDisplayCategoryName}</span>
                  {manageIsDeactivated ? (
                    <span className="rounded-full theme-badge-danger px-3 py-1 text-xs font-semibold">Desativado</span>
                  ) : (
                    <span className="rounded-full theme-badge-success px-3 py-1 text-xs font-semibold">Ativo na vitrine</span>
                  )}
                </div>

                <h3 className="mt-4 text-3xl font-semibold leading-tight theme-heading">{manageDisplayName}</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">Cod. interno /{manageTarget.slug}</p>

                <div className="mt-5 border-t border-[var(--border)] pt-5">
                  <p className="text-sm text-[var(--muted)]">Preco varejo</p>
                  <p className="mt-2 text-4xl font-semibold leading-none text-rose-600">{formatCurrency(manageDisplayPrice)}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm">
                    <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-slate-700">
                      Atacado {manageDisplayWholesale > 0 ? formatCurrency(manageDisplayWholesale) : "Nao definido"}
                    </span>
                    <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-slate-700">
                      Promocional {manageDisplayPromotion > 0 ? formatCurrency(manageDisplayPromotion) : "Nao definido"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-emerald-600">Estoque atual: {manageDisplayStock} unidade(s)</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">Estoque minimo configurado: {manageTarget.minStock} unidade(s)</p>
                </div>

                <div className="mt-5 rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface)] p-4">
                  <p className="text-sm leading-6 text-[var(--muted)]">{manageTarget.description || "Adicione uma descricao mais forte para a vitrine publica e para a operacao da loja."}</p>
                </div>

                <div className="mt-4 flex gap-2 rounded-[1rem] border border-[var(--border)] bg-[var(--surface)] p-1">
                  <button
                    type="button"
                    onClick={() => setManageSection("catalogo")}
                    className={`flex-1 rounded-[0.8rem] px-3 py-2 text-sm font-semibold transition ${manageSection === "catalogo" ? "bg-white text-slate-950 shadow-sm" : "text-[var(--muted)]"}`}
                  >
                    Catalogo
                  </button>
                  <button
                    type="button"
                    onClick={() => setManageSection("precos")}
                    className={`flex-1 rounded-[0.8rem] px-3 py-2 text-sm font-semibold transition ${manageSection === "precos" ? "bg-white text-slate-950 shadow-sm" : "text-[var(--muted)]"}`}
                  >
                    Precos
                  </button>
                </div>

                <form
                  className="mt-4 grid gap-3 sm:grid-cols-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleQuickSaveAndClose();
                  }}
                >
                  {manageSection === "catalogo" ? (
                    <>
                      <label className="space-y-2 sm:col-span-2">
                        <span className="text-sm font-medium theme-heading">Titulo</span>
                        <input
                          autoFocus
                          value={manageDraft.name}
                          onChange={(event) => setManageDraft((current) => ({ ...current, name: event.target.value }))}
                          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                        />
                      </label>
                      <label className="space-y-2 sm:col-span-2">
                        <span className="text-sm font-medium theme-heading">Categoria</span>
                        <select
                          value={manageDraft.categoryId}
                          onChange={(event) => setManageDraft((current) => ({ ...current, categoryId: event.target.value }))}
                          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                        >
                          {workspace.categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </>
                  ) : (
                    <>
                      <label className="space-y-2">
                        <span className="text-sm font-medium theme-heading">Preco varejo</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={manageDraft.priceRetail}
                          onChange={(event) => setManageDraft((current) => ({ ...current, priceRetail: event.target.value }))}
                          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium theme-heading">Preco atacado</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={manageDraft.priceWholesale}
                          onChange={(event) => setManageDraft((current) => ({ ...current, priceWholesale: event.target.value }))}
                          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium theme-heading">Preco promocional</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={manageDraft.pricePromotion}
                          onChange={(event) => setManageDraft((current) => ({ ...current, pricePromotion: event.target.value }))}
                          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium theme-heading">Quantidade</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={manageDraft.stock}
                          onChange={(event) => setManageDraft((current) => ({ ...current, stock: event.target.value }))}
                          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                        />
                      </label>
                    </>
                  )}
                </form>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => void handleQuickSaveAndClose()}
                    className="rounded-[0.9rem] px-4"
                  >
                    Salvar alteracoes
                  </Button>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleOpenImageEditor}
                      className="inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-300 bg-amber-100 p-0 text-amber-700 shadow-[0_10px_25px_rgba(251,191,36,0.18)] hover:border-amber-400 hover:bg-amber-200"
                      aria-label="Editar"
                      title="Editar"
                    >
                      <FiEdit3 className="h-6 w-6" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleCopyLink(manageTarget)}
                      className="inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-sky-300 bg-sky-100 p-0 text-sky-700 shadow-[0_10px_25px_rgba(14,165,233,0.18)] hover:border-sky-400 hover:bg-sky-200"
                      aria-label="Compartilhar"
                      title="Compartilhar"
                    >
                      <FiShare2 className="h-6 w-6" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setDeleteTarget(manageTarget)}
                      className="inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-rose-300 bg-rose-600 p-0 text-white shadow-[0_10px_25px_rgba(225,29,72,0.2)] hover:border-rose-400 hover:bg-rose-700"
                      aria-label="Excluir"
                      title="Excluir"
                    >
                      <FiTrash2 className="h-6 w-6" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </Modal>
      ) : null}

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






















