"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { saveLocalSellerProduct } from "@/lib/local-product-storage";
import {
  createSellerCategory,
  deleteSellerProductImage,
  getSellerProductById,
  setSellerProductMainImage,
  submitSellerProduct,
} from "@/lib/services/catalog-service";
import type { Category, ProductApiImageMeta, ProductFormDraft, ProductImage, SellerWorkspace } from "@/types/catalog";

const MAX_IMAGES = 5;
const MIN_IMAGES = 1;

const stepLabels = [
  "Produto",
  "Categoria e preco",
  "Imagens",
  "Revisao",
] as const;

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

const initialDraft = (workspace: SellerWorkspace): ProductFormDraft => ({
  name: "",
  description: "",
  categoryId: workspace.categories[0]?.id ?? "",
  newCategoryName: "",
  priceRetail: "",
  priceWholesale: "",
  pricePromotion: "",
  stock: "",
  minStock: "",
  images: [],
});

const isValidUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
};

const formatCurrency = (value: string) => (value ? `R$ ${value}` : "R$ 0,00");

const shortenImageName = (value: string, max = 28) =>
  value.length > max ? `${value.slice(0, max - 3)}...` : value;

const SELLER_PRODUCTS_SCROLL_KEY = "seller-products-scroll-target";

export type SellerProductEditRequest = {
  id: string;
  source: "api" | "local";
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  priceRetail: number;
  priceWholesale?: number;
  pricePromotion?: number;
  stock: number;
  minStock: number;
  imageUrl?: string;
  images?: ProductApiImageMeta[];
};

export function SellerProductForm({
  workspace,
  externalEditRequest,
  onCompleted,
  onCancel,
}: {
  workspace: SellerWorkspace;
  externalEditRequest?: SellerProductEditRequest | null;
  onCompleted?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<ProductFormDraft>(() => initialDraft(workspace));
  const [categories, setCategories] = useState<Category[]>(() => workspace.categories);
  const [step, setStep] = useState(0);
  const [urlInput, setUrlInput] = useState("");
  const [feedback, setFeedback] = useState<string>("Preencha cada etapa com calma para montar um cadastro de produto mais elegante.");
  const [submittedPreview, setSubmittedPreview] = useState<ProductFormDraft | null>(null);
  const [mainImageId, setMainImageId] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [deletedApiImageIds, setDeletedApiImageIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const latestImagesRef = useRef<ProductImage[]>([]);

  useEffect(() => {
    latestImagesRef.current = draft.images;
  }, [draft.images]);

  useEffect(() => {
    return () => {
      latestImagesRef.current.forEach((image) => {
        if (image.source === "upload") {
          URL.revokeObjectURL(image.previewUrl);
        }
      });
    };
  }, []);

  useEffect(() => {
    if (!externalEditRequest || typeof window === "undefined") {
      return;
    }

    window.dispatchEvent(
      new CustomEvent("seller-product-edit", {
        detail: externalEditRequest,
      }),
    );
  }, [externalEditRequest]);

  useEffect(() => {
    const handleEditProduct = (event: Event) => {
      const customEvent = event as CustomEvent<{
        id: string;
        source: "api" | "local";
        name: string;
        slug: string;
        description: string;
        categoryId: string;
        priceRetail: number;
        priceWholesale?: number;
        pricePromotion?: number;
        stock: number;
        minStock: number;
        imageUrl?: string;
        images?: ProductApiImageMeta[];
      }>;
      const detail = customEvent.detail;
      if (!detail) return;

      const nextImages: ProductImage[] = (detail.images ?? []).length
        ? (detail.images ?? []).map((image, index) => ({
            id: `api-${image.id}-${index}`,
            source: "api" as const,
            name: image.name,
            previewUrl: image.imageUrl,
            apiImageId: image.id,
            isMain: image.isMain,
          }))
        : detail.imageUrl
          ? [
              {
                id: `existing-${detail.id}`,
                source: "url" as const,
                name: detail.name,
                previewUrl: detail.imageUrl,
              },
            ]
          : [];

      const selectedMain = nextImages.find((image) => image.isMain) ?? nextImages[0] ?? null;

      setEditingProductId(detail.id);
      setDraft({
        name: detail.name,
        description: detail.description,
        categoryId: detail.categoryId,
        newCategoryName: "",
        priceRetail: String(detail.priceRetail),
        priceWholesale: detail.priceWholesale ? String(detail.priceWholesale) : "",
        pricePromotion: detail.pricePromotion ? String(detail.pricePromotion) : "",
        stock: String(detail.stock),
        minStock: String(detail.minStock),
        images: nextImages,
      });
      setMainImageId(selectedMain?.id ?? null);
      setDeletedApiImageIds([]);
      setStep(0);
      setSubmittedPreview(null);
      setFeedback(`Produto ${detail.name} carregado para edicao. Revise os campos e salve as alteracoes.`);
      const form = document.getElementById("cadastro-produto-form");
      form?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    window.addEventListener("seller-product-edit", handleEditProduct as EventListener);
    return () => {
      window.removeEventListener("seller-product-edit", handleEditProduct as EventListener);
    };
  }, []);

  const updateField = <K extends keyof ProductFormDraft>(field: K, value: ProductFormDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const appendImages = (newImages: ProductImage[]) => {
    setDraft((current) => {
      const availableSlots = MAX_IMAGES - current.images.length;
      const accepted = newImages.slice(0, availableSlots);
      const nextImages = [...current.images, ...accepted];

      if (!mainImageId && nextImages[0]) {
        setMainImageId(nextImages[0].id);
      }

      if (accepted.length < newImages.length) {
        setFeedback(`Limite de ${MAX_IMAGES} imagens atingido. Algumas imagens nao foram adicionadas.`);
      } else {
        setFeedback(`${accepted.length} imagem(ns) adicionada(s) com sucesso.`);
      }

      return {
        ...current,
        images: nextImages,
      };
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const prepared = files.map((file, index) => ({
      id: `upload-${file.name}-${file.lastModified}-${index}`,
      source: "upload" as const,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      file,
    }));

    appendImages(prepared);
    event.target.value = "";
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();

    if (!trimmed) {
      setFeedback("Informe uma URL de imagem para adicionar preview remoto.");
      return;
    }

    if (!isValidUrl(trimmed)) {
      setFeedback("A URL informada nao parece valida. Use http:// ou https://.");
      return;
    }

    appendImages([
      {
        id: `url-${trimmed}`,
        source: "url",
        name: trimmed,
        previewUrl: trimmed,
      },
    ]);
    setUrlInput("");
  };

  const handleAddCategory = async () => {
    const trimmed = draft.newCategoryName.trim();

    if (!trimmed || isSavingCategory) {
      if (!trimmed) {
        setFeedback("Digite o nome da nova categoria para adicionar ao cadastro.");
      }
      return;
    }

    const slug = slugify(trimmed);
    const alreadyExists = categories.find((category) => category.slug === slug);

    if (alreadyExists) {
      setDraft((current) => ({ ...current, categoryId: alreadyExists.id, newCategoryName: "" }));
      setIsCategoryModalOpen(false);
      setFeedback(`Categoria ${alreadyExists.name} ja existe e foi selecionada para este produto.`);
      return;
    }

    setIsSavingCategory(true);

    try {
      const createdCategory = await createSellerCategory({
        storeId: workspace.store.id,
        name: trimmed,
        slug,
        active: true,
      });

      setCategories((current) => [...current, createdCategory]);
      setDraft((current) => ({
        ...current,
        categoryId: createdCategory.id,
        newCategoryName: "",
      }));
      setIsCategoryModalOpen(false);
      setFeedback(`Categoria ${createdCategory.name} salva com sucesso e pronta para os proximos cadastros.`);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel salvar a categoria agora.";

      if (!message.includes("nao esta configurada")) {
        setFeedback(message);
        return;
      }
    } finally {
      setIsSavingCategory(false);
    }

    const newCategory: Category = {
      id: `cat-local-${slug}`,
      storeId: workspace.store.id,
      name: trimmed,
      slug,
      active: true,
      origin: "custom",
    };

    setCategories((current) => [...current, newCategory]);
    setDraft((current) => ({
      ...current,
      categoryId: newCategory.id,
      newCategoryName: "",
    }));
    setIsCategoryModalOpen(false);
    setFeedback(`Categoria ${trimmed} adicionada localmente para esta loja.`);
  };

  const handleUseBaseCategory = (baseName: string) => {
    const slug = slugify(baseName);
    const existingCategory = categories.find((category) => category.slug === slug);

    if (existingCategory) {
      setDraft((current) => ({ ...current, categoryId: existingCategory.id }));
      setIsCategoryModalOpen(false);
      setFeedback(`Categoria ${existingCategory.name} selecionada para este produto.`);
      return;
    }

    const newCategory: Category = {
      id: `cat-base-${slug}`,
      storeId: workspace.store.id,
      name: baseName,
      slug,
      active: true,
      origin: "base",
    };

    setCategories((current) => [...current, newCategory]);
    setDraft((current) => ({ ...current, categoryId: newCategory.id }));
    setIsCategoryModalOpen(false);
    setFeedback(`Categoria base ${baseName} adicionada localmente a esta loja.`);
  };

  const handleRemoveImage = (imageId: string) => {
    setDraft((current) => {
      const imageToRemove = current.images.find((image) => image.id === imageId);
      if (imageToRemove?.source === "upload") {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }

      if (imageToRemove?.source === "api" && imageToRemove.apiImageId) {
        setDeletedApiImageIds((currentIds) => currentIds.includes(imageToRemove.apiImageId as string) ? currentIds : [...currentIds, imageToRemove.apiImageId as string]);
      }

      const nextImages = current.images.filter((image) => image.id !== imageId);
      if (mainImageId === imageId) {
        setMainImageId(nextImages[0]?.id ?? null);
      }

      return {
        ...current,
        images: nextImages,
      };
    });
  };

  const validateStep = (targetStep = step) => {
    if (targetStep === 0) {
      if (!draft.name.trim()) {
        setFeedback("Preencha o nome do produto para continuar.");
        return false;
      }
    }

    if (targetStep === 1) {
      if (!draft.categoryId || !draft.priceRetail || !draft.stock) {
        setFeedback("Defina categoria, preco varejo e estoque antes de continuar.");
        return false;
      }
    }

    if (targetStep === 2) {
      if (draft.images.length < MIN_IMAGES) {
        setFeedback("Escolha entre 1 e 5 imagens antes de continuar.");
        return false;
      }

      if (!mainImageId) {
        setFeedback("Escolha uma imagem principal para seguir.");
        return false;
      }
    }

    return true;
  };

  const handleNextStep = () => {
    if (!validateStep()) {
      return;
    }

    if (step === 2) {
      setIsImageModalOpen(true);
      return;
    }

    setStep((current) => Math.min(current + 1, stepLabels.length - 1));
  };

  const handleConfirmImageStep = () => {
    setIsImageModalOpen(false);
    setStep(3);
    setFeedback("Sequencia de imagens validada. Agora revise o produto antes de finalizar.");
  };

  const handleSubmit = async () => {
    if (!validateStep(2) || isSubmitting) {
      return;
    }

    const productName = draft.name.trim();
    const productSlug = slugify(productName);
    const categoryName = selectedCategory?.name ?? "Sem categoria";

    setIsSubmitting(true);

    try {
      const createdProduct = await submitSellerProduct({
        productId: editingProductId ?? undefined,
        storeId: workspace.store.id,
        categoryId: draft.categoryId,
        name: productName,
        slug: productSlug,
        description: draft.description.trim(),
        priceRetail: Number(draft.priceRetail || 0),
        priceWholesale: draft.priceWholesale ? Number(draft.priceWholesale) : undefined,
        pricePromotion: draft.pricePromotion ? Number(draft.pricePromotion) : undefined,
        stock: Number(draft.stock || 0),
        minStock: Number(draft.minStock || 0),
        images: draft.images,
        mainImageId: mainImageId ?? undefined,
      });

      let finalProduct = createdProduct;
      const selectedMainImage = draft.images.find((image) => image.id === mainImageId);

      if (editingProductId) {
        for (const imageId of deletedApiImageIds) {
          await deleteSellerProductImage(createdProduct.id, imageId);
        }

        if (selectedMainImage?.source === "api" && selectedMainImage.apiImageId) {
          await setSellerProductMainImage(createdProduct.id, selectedMainImage.apiImageId);
        }

        finalProduct = await getSellerProductById(createdProduct.id);
      }

      const nextSubmittedPreview: ProductFormDraft = {
        ...draft,
        images: finalProduct.images?.map((image) => ({
          id: `saved-${image.id}`,
          source: "api" as const,
          name: image.name,
          previewUrl: image.imageUrl,
          apiImageId: image.id,
          isMain: image.isMain,
        })) ?? draft.images,
      };
      setSubmittedPreview(nextSubmittedPreview);
      setFeedback(`Produto ${finalProduct.name} ${editingProductId ? "atualizado" : "cadastrado"} na API com sucesso. Abrindo a vitrine interna da loja.`);
      setEditingProductId(null);
      setDeletedApiImageIds([]);

      if (!editingProductId) {
        setDraft(initialDraft(workspace));
        setMainImageId(null);
        setStep(0);
      }

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(SELLER_PRODUCTS_SCROLL_KEY, "produtos-cadastrados");
      }

      setIsSubmitting(false);
      onCompleted?.();
      router.replace("/painel-lojista/produtos#produtos-cadastrados");
      window.setTimeout(() => {
        const showcase = document.getElementById("produtos-cadastrados");
        showcase?.scrollIntoView({ behavior: "smooth", block: "start" });
        router.refresh();
      }, 200);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel concluir o cadastro do produto.";

      if (!message.includes("nao esta configurada")) {
        setFeedback(message);
        setIsSubmitting(false);
        return;
      }
    }

    saveLocalSellerProduct({
      id: editingProductId ?? window.crypto.randomUUID(),
      storeId: workspace.store.id,
      storeName: workspace.store.name,
      name: productName,
      slug: productSlug,
      description: draft.description.trim(),
      categoryId: draft.categoryId,
      categoryName,
      priceRetail: Number(draft.priceRetail || 0),
      priceWholesale: draft.priceWholesale ? Number(draft.priceWholesale) : undefined,
      pricePromotion: draft.pricePromotion ? Number(draft.pricePromotion) : undefined,
      stock: Number(draft.stock || 0),
      minStock: Number(draft.minStock || 0),
      images: draft.images.map((image) => ({
        id: image.id,
        name: image.name,
        previewUrl: image.previewUrl,
      })),
      mainImageUrl: mainImage?.previewUrl,
      createdAt: new Date().toISOString(),
    });

    setSubmittedPreview(draft);
    setFeedback(`Produto ${productName || "sem nome"} ${editingProductId ? "atualizado" : "cadastrado"} localmente. Abrindo a vitrine interna da loja.`);
    setEditingProductId(null);
    setDeletedApiImageIds([]);

    if (!editingProductId) {
      setDraft(initialDraft(workspace));
      setMainImageId(null);
      setStep(0);
    }

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(SELLER_PRODUCTS_SCROLL_KEY, "produtos-cadastrados");
    }

    setIsSubmitting(false);
    onCompleted?.();
    router.replace("/painel-lojista/produtos#produtos-cadastrados");
    window.setTimeout(() => {
      const showcase = document.getElementById("produtos-cadastrados");
      showcase?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  };

  const selectedCategory = categories.find((category) => category.id === draft.categoryId);
  const stockValue = Number(draft.stock || 0);
  const minStockValue = Number(draft.minStock || 0);
  const stockHealthLabel = stockValue <= 0 ? "Sem estoque" : stockValue <= minStockValue ? "Estoque baixo" : "Estoque saudavel";
  const stockHealthClass =
    stockValue <= 0
      ? "theme-badge-danger"
      : stockValue <= minStockValue
        ? "theme-badge-warning"
        : "theme-badge-success";

  const mainImage = draft.images.find((image) => image.id === mainImageId) ?? draft.images[0];

  return (
    <div id="cadastro-produto-form" className="space-y-6 rounded-[2rem] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)] sm:p-6 lg:p-8">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Cadastro guiado</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">{editingProductId ? "Editar produto em etapas" : "Novo produto em etapas"}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              O fluxo agora guia o lojista por blocos curtos, sem distracao, ate finalizar o cadastro com mais clareza e mais elegancia.
            </p>
          </div>
          <span className="w-fit rounded-full bg-[rgba(15,118,110,0.12)] px-4 py-2 text-xs font-semibold text-[var(--accent-strong)]">
            Etapa {step + 1} de {stepLabels.length}
          </span>
        </div>

        {editingProductId ? (
          <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Modo edicao</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Aqui voce pode ajustar descricao, preco, estoque, categoria e imagens sem trocar o layout da vitrine.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full theme-border-button px-3 py-1.5 text-xs font-semibold">Descricao</span>
                <span className="rounded-full theme-border-button px-3 py-1.5 text-xs font-semibold">Preco</span>
                <span className="rounded-full theme-border-button px-3 py-1.5 text-xs font-semibold">Estoque</span>
                <span className="rounded-full theme-border-button px-3 py-1.5 text-xs font-semibold">Categoria</span>
                <span className="rounded-full theme-border-button px-3 py-1.5 text-xs font-semibold">Imagens</span>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-4">
          {stepLabels.map((label, index) => {
            const isCurrent = index === step;
            const isDone = index < step;

            return (
              <div key={label} className={`rounded-[1.5rem] border px-4 py-4 ${isCurrent ? "border-[var(--accent)] bg-[rgba(15,118,110,0.08)]" : isDone ? "border-emerald-200 bg-emerald-50" : "border-[var(--border)] bg-slate-50"}`}>
                <div className="flex items-center gap-3">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${isCurrent ? "bg-[var(--accent)] text-white" : isDone ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`}>
                    0{index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{label}</p>
                    <p className="text-xs text-[var(--muted)]">{isCurrent ? "Etapa atual" : isDone ? "Concluida" : "A seguir"}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] p-5">
        {step === 0 ? (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Informacoes essenciais do produto</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Comece pelo nome e pela descricao para construir a base visual do cadastro.</p>
            </div>
            <div className="grid gap-4">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-900">Nome do produto</span>
                <input value={draft.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Ex.: Vestido Midi Aurora" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-900">Descricao</span>
                <textarea value={draft.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Destaque modelagem, tecido, caimento e ocasioes de uso." rows={6} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]" />
              </label>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Categoria, preco e estoque</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Agora organizamos a parte comercial e operacional do produto.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-900">Categoria</span>
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                  >
                    Adicionar categoria
                  </button>
                </div>
                <select value={draft.categoryId} onChange={(event) => updateField("categoryId", event.target.value)} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]">
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-900">Preco varejo</span>
                <input type="number" min="0" step="0.01" value={draft.priceRetail} onChange={(event) => updateField("priceRetail", event.target.value)} placeholder="0,00" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-900">Preco atacado</span>
                <input type="number" min="0" step="0.01" value={draft.priceWholesale} onChange={(event) => updateField("priceWholesale", event.target.value)} placeholder="Opcional" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-900">Preco promocional</span>
                <input type="number" min="0" step="0.01" value={draft.pricePromotion} onChange={(event) => updateField("pricePromotion", event.target.value)} placeholder="Opcional" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-900">Estoque atual</span>
                <input type="number" min="0" step="1" value={draft.stock} onChange={(event) => updateField("stock", event.target.value)} placeholder="0" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-900">Estoque minimo</span>
                <input type="number" min="0" step="1" value={draft.minStock} onChange={(event) => updateField("minStock", event.target.value)} placeholder="5" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]" />
              </label>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-4 text-sm text-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span>Leitura de estoque para este produto</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stockHealthClass}`}>{stockHealthLabel}</span>
              </div>
              <p className="mt-2 leading-6 text-[var(--muted)]">Estoque atual {stockValue} unidade(s). Estoque minimo configurado: {minStockValue || 0} unidade(s).</p>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Imagens do produto</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Escolha entre 1 e 5 imagens, visualize tudo em preview, marque uma como principal e, na edicao, adicione novas ou remova as atuais.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="rounded-full bg-[rgba(15,118,110,0.12)] px-4 py-2 text-xs font-semibold text-[var(--accent-strong)]">
                {draft.images.length}/{MAX_IMAGES} imagens escolhidas
              </div>
              {editingProductId ? (
                <div className="rounded-full theme-border-button px-4 py-2 text-xs font-semibold transition">
                  Remova as antigas ou envie novas antes de salvar
                </div>
              ) : null}
              <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
                Upload local
              </button>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
              <input value={urlInput} onChange={(event) => setUrlInput(event.target.value)} placeholder="https://exemplo.com/minha-foto.jpg" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]" />
              <button type="button" onClick={handleAddUrl} className="rounded-2xl theme-border-button px-5 py-3 text-sm font-semibold transition">
                Adicionar URL
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {draft.images.length ? (
                <>
                  {draft.images.map((image, index) => {
                    const isMain = image.id === mainImageId;

                    return (
                      <article key={image.id} className={`overflow-hidden rounded-[1.5rem] border bg-white ${isMain ? "border-[var(--accent)] shadow-[0_0_0_2px_rgba(15,118,110,0.08)]" : "border-[var(--border)]"}`}>
                        <div className="relative aspect-[4/5] bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={image.previewUrl} alt={image.name} className="h-full w-full object-cover" />
                          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${isMain ? "bg-[var(--accent)] text-white" : "bg-white/90 text-slate-700"}`}>
                              {isMain ? "Principal" : `Imagem ${index + 1}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(image.id)}
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/92 text-rose-600 shadow-sm transition hover:bg-rose-50"
                              aria-label={`Remover ${image.name}`}
                              title="Remover imagem"
                            >
                              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                                <path d="M9 4.75h6m-8 3h10m-8.25 0 .5 10.5a1 1 0 0 0 1 .95h3.5a1 1 0 0 0 1-.95l.5-10.5M10 10.5v5M14 10.5v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                              </svg>
                            </button>
                          </div>
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-transparent p-3">
                            <div className="flex items-center justify-between gap-3 text-white">
                              <p className="line-clamp-1 text-xs font-medium">{shortenImageName(image.name, 24)}</p>
                              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
                                {image.source === "upload" ? "Upload" : image.source === "api" ? "API" : "URL"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <button type="button" onClick={() => setMainImageId(image.id)} className={`w-full rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${isMain ? "bg-slate-100 text-slate-700" : "bg-slate-900 text-white hover:bg-slate-700"}`}>
                            {isMain ? "Imagem principal" : "Usar como principal"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                  {draft.images.length < MAX_IMAGES ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex aspect-[4/5] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[var(--border)] bg-white px-5 text-center transition hover:border-[var(--accent)] hover:bg-[var(--surface)]"
                    >
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(15,118,110,0.12)] text-3xl font-light text-[var(--accent)]">+</span>
                      <strong className="mt-4 block text-base theme-heading">Adicionar imagem</strong>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Use este espaco para enviar mais uma foto sem sair da grade.</p>
                    </button>
                  ) : null}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-[1.5rem] border border-dashed border-[var(--border)] bg-white px-5 py-10 text-sm leading-6 text-[var(--muted)] sm:col-span-2 xl:col-span-3"
                >
                  Nenhuma imagem adicionada ainda. Clique para enviar a primeira foto do produto.
                </button>
              )}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Revisao final</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Revise o produto completo antes de validar o cadastro localmente.</p>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(360px,0.95fr)_minmax(0,1.05fr)]">
              <div className="overflow-hidden rounded-[1.9rem] border border-[var(--border)] bg-white p-4">
                <div className="aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-slate-100">
                  {mainImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mainImage.previewUrl} alt={mainImage.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center text-sm leading-6 text-[var(--muted)]">A imagem principal aparecera aqui.</div>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Imagem principal</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{mainImage ? shortenImageName(mainImage.name, 36) : "Nenhuma imagem definida"}</p>
                  </div>
                  <span className="rounded-full theme-badge-success px-3 py-1 text-xs font-semibold">Vitrine</span>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="rounded-[1.6rem] border border-[var(--border)] bg-white p-5">
                  <p className="text-sm text-[var(--muted)]">Nome</p>
                  <strong className="mt-2 block text-2xl text-slate-900">{draft.name || "Produto sem nome"}</strong>
                  <p className="mt-2 text-sm text-[var(--muted)]">/{slugify(draft.name || "produto")}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
                    <p className="text-sm text-[var(--muted)]">Categoria</p>
                    <strong className="mt-2 block text-xl text-slate-900">{selectedCategory?.name ?? "Nao definida"}</strong>
                  </div>
                  <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
                    <p className="text-sm text-[var(--muted)]">Preco varejo</p>
                    <strong className="mt-2 block text-xl text-slate-900">{formatCurrency(draft.priceRetail)}</strong>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
                    <p className="text-sm text-[var(--muted)]">Estoque</p>
                    <strong className="mt-2 block text-xl text-slate-900">{draft.stock || "0"}</strong>
                  </div>
                  <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
                    <p className="text-sm text-[var(--muted)]">Imagens</p>
                    <strong className="mt-2 block text-xl text-slate-900">{draft.images.length}</strong>
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4 text-sm leading-6 text-[var(--muted)]">
                  {draft.description || "Adicione uma descricao para o produto ficar mais claro na vitrine e na operacao interna."}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {draft.images.slice(0, 3).map((image) => (
                    <div key={image.id} className={`overflow-hidden rounded-[1.2rem] border ${image.id === mainImageId ? "border-[var(--accent)]" : "border-[var(--border)]"}`}>
                      <div className="aspect-[4/5] bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image.previewUrl} alt={image.name} className="h-full w-full object-cover" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-slate-50 px-4 py-3 text-sm leading-6 text-[var(--muted)]">
        {feedback}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          {onCancel ? (
            <button type="button" onClick={onCancel} className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-[var(--accent)]">
              Fechar
            </button>
          ) : null}
          <button type="button" onClick={() => setStep((current) => Math.max(current - 1, 0))} className={`rounded-full px-5 py-3 text-sm font-semibold transition ${step === 0 ? "cursor-not-allowed border border-[var(--border)] bg-slate-100 text-slate-400" : "border border-[var(--border)] bg-white text-slate-800 hover:border-[var(--accent)]"}`} disabled={step === 0}>
            Voltar etapa
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          {step < 3 ? (
            <button type="button" onClick={handleNextStep} className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]">
              Continuar
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={isSubmitting} className={`rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] ${isSubmitting ? "cursor-not-allowed opacity-70" : ""}`}>
              {isSubmitting ? "Salvando..." : editingProductId ? "Salvar alteracoes" : "Finalizar cadastro"}
            </button>
          )}
        </div>
      </div>

      {submittedPreview ? (
        <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900">
          Produto <strong>{submittedPreview.name || "produto sem nome"}</strong> salvo na vitrine interna com {submittedPreview.images.length} imagem(ns) e imagem principal definida.
        </div>
      ) : null}

      {isCategoryModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-8">
          <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.3)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Nova categoria</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">Adicionar sem sair do produto</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Cadastre uma categoria comercial da loja e volte direto para o formulario sem perder os dados preenchidos.</p>
              </div>
              <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--accent)]">Fechar</button>
            </div>

            <div className="mt-6 space-y-4">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-900">Nome da categoria</span>
                <input value={draft.newCategoryName} onChange={(event) => updateField("newCategoryName", event.target.value)} placeholder="Ex.: Vestidos, Blusas, Calcas femininas" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]" />
              </label>

              <div className="flex flex-wrap gap-2">
                {workspace.categoryBases.map((base) => (
                  <button key={base.id} type="button" onClick={() => handleUseBaseCategory(base.name)} className="rounded-full theme-border-button px-4 py-2 text-sm font-semibold transition">
                    Usar {base.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-[var(--accent)]">Cancelar</button>
              <button
                type="button"
                onClick={() => {
                  void handleAddCategory();
                }}
                disabled={isSavingCategory}
                className={`rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] ${isSavingCategory ? "cursor-not-allowed opacity-70" : ""}`}
              >
                {isSavingCategory ? "Salvando categoria..." : "Salvar categoria"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isImageModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-8">
          <div className="w-full max-w-5xl rounded-[2rem] border border-white/10 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.3)] sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Revisao das imagens</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">Escolha final da sequencia visual</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">Veja a ordem das imagens em preview, confirme qual sera a principal e siga para a revisao final sem distracoes.</p>
              </div>
              <button type="button" onClick={() => setIsImageModalOpen(false)} className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--accent)]">
                Fechar
              </button>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(360px,0.9fr)_minmax(0,1.1fr)]">
              <div className="rounded-[1.9rem] border border-[var(--border)] bg-slate-50 p-5">
                <div className="aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-white">
                  {mainImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mainImage.previewUrl} alt={mainImage.name} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Imagem principal</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{mainImage ? shortenImageName(mainImage.name, 34) : "Nenhuma imagem principal escolhida"}</p>
                  </div>
                  <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-white">Principal</span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {draft.images.map((image, index) => {
                  const isMain = image.id === mainImageId;

                  return (
                    <article key={image.id} className={`overflow-hidden rounded-[1.5rem] border bg-white ${isMain ? "border-[var(--accent)] shadow-[0_0_0_2px_rgba(37,99,235,0.08)]" : "border-[var(--border)]"}`}>
                      <div className="aspect-[4/5] bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image.previewUrl} alt={image.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="space-y-3 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isMain ? "bg-[var(--accent)] text-white" : "theme-badge-neutral"}`}>{isMain ? "Principal" : `Ordem ${index + 1}`}</span>
                          <span className="text-xs text-[var(--muted)]">{image.source === "upload" ? "Upload" : image.source === "api" ? "API" : "URL"}</span>
                        </div>
                        <p className="text-sm text-[var(--muted)]" title={image.name}>{shortenImageName(image.name)}</p>
                        {!isMain ? (
                          <button type="button" onClick={() => setMainImageId(image.id)} className="w-full rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700">
                            Usar como principal
                          </button>
                        ) : (
                          <div className="rounded-2xl bg-slate-100 px-4 py-2.5 text-center text-sm font-semibold text-slate-700">
                            Selecionada como principal
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button type="button" onClick={() => setIsImageModalOpen(false)} className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-[var(--accent)]">
                Revisar novamente
              </button>
              <button type="button" onClick={handleConfirmImageStep} className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]">
                Confirmar imagens e continuar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
