"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

import { saveLocalSellerProduct } from "@/lib/local-product-storage";
import {
  createSellerCategory,
  deleteSellerProductImage,
  getSellerProductById,
  setSellerProductMainImage,
  submitSellerProduct,
} from "@/lib/services/catalog-service";
import type { Category, ProductApiImageMeta, ProductFormDraft, ProductImage, ProductVariant, ProductVariantDraft, SellerWorkspace } from "@/types/catalog";

const MAX_IMAGES = 5;
const MIN_IMAGES = 1;
const CATEGORY_ACCEPTED_IMAGE_TYPES = "image/png,image/jpeg,image/webp";
const SELLER_PRODUCTS_SCROLL_KEY = "seller-products-scroll-target";
const DESCRIPTION_META_START = "[operacao-loja]";
const DESCRIPTION_META_END = "[/operacao-loja]";
const audienceOptions = ["Feminino", "Masculino", "Infantil", "Unissex"] as const;

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

const isObjectUrl = (value?: string | null) => Boolean(value?.startsWith("blob:"));
const shortenImageName = (value: string, max = 22) => (value.length > max ? `${value.slice(0, max - 3)}...` : value);
const createVariantDraft = (overrides?: Partial<ProductVariantDraft>): ProductVariantDraft => ({
  id: overrides?.id ?? `variant-${Math.random().toString(36).slice(2, 10)}`,
  sizeLabel: overrides?.sizeLabel ?? "",
  stock: overrides?.stock ?? "",
  minStock: overrides?.minStock ?? "0",
  priceRetail: overrides?.priceRetail ?? "",
  priceWholesale: overrides?.priceWholesale ?? "",
  pricePromotion: overrides?.pricePromotion ?? "",
});

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result);
        return;
      }
      reject(new Error("Nao foi possivel ler a imagem local do produto."));
    };
    reader.onerror = () => reject(new Error("Nao foi possivel ler a imagem local do produto."));
    reader.readAsDataURL(file);
  });

const getPersistableImageUrl = async (image: ProductImage) => {
  if (image.source === "upload" && image.file) {
    return readFileAsDataUrl(image.file);
  }

  return image.previewUrl;
};

const initialDraft = (workspace: SellerWorkspace): ProductFormDraft => ({
  name: "",
  description: "",
  categoryId: workspace.categories[0]?.id ?? "",
  newCategoryName: "",
  priceRetail: "",
  priceWholesale: "",
  pricePromotion: "",
  shelfSection: "A",
  shelfPosition: "1",
  audience: audienceOptions[0],
  variants: [createVariantDraft()],
  images: [],
});

type ParsedDescriptionMeta = {
  notes: string;
  shelfSection: string;
  shelfPosition: string;
  sizeLabel: string;
  audience: string;
};

const parseStructuredDescription = (value: string | undefined): ParsedDescriptionMeta => {
  const baseMeta: ParsedDescriptionMeta = {
    notes: value?.trim() ?? "",
    shelfSection: "A",
    shelfPosition: "1",
    sizeLabel: "",
    audience: audienceOptions[0],
  };

  if (!value) return baseMeta;

  const startIndex = value.indexOf(DESCRIPTION_META_START);
  const endIndex = value.indexOf(DESCRIPTION_META_END);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return baseMeta;
  }

  const metaBlock = value.slice(startIndex + DESCRIPTION_META_START.length, endIndex).trim();
  const notes = value.slice(0, startIndex).trim();
  const entries = metaBlock.split("\n").map((line) => line.trim()).filter(Boolean).reduce<Record<string, string>>((accumulator, line) => {
    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) return accumulator;
    const key = line.slice(0, separatorIndex).trim();
    const entryValue = line.slice(separatorIndex + 1).trim();
    if (key) accumulator[key] = entryValue;
    return accumulator;
  }, {});

  return {
    notes,
    shelfSection: entries.shelfSection || baseMeta.shelfSection,
    shelfPosition: entries.shelfPosition || baseMeta.shelfPosition,
    sizeLabel: entries.sizeLabel || baseMeta.sizeLabel,
    audience: entries.audience || baseMeta.audience,
  };
};

const buildStructuredDescription = (draft: ProductFormDraft) => {
  const notes = draft.description.trim();
  const metaBlock = [
    DESCRIPTION_META_START,
    `shelfSection=${draft.shelfSection.trim() || "A"}`,
    `shelfPosition=${draft.shelfPosition.trim() || "1"}`,
    `audience=${draft.audience.trim() || audienceOptions[0]}`,
    DESCRIPTION_META_END,
  ].join("\n");

  return notes ? `${notes}\n\n${metaBlock}` : metaBlock;
};

const toVariantPayload = (draft: ProductFormDraft): ProductVariant[] =>
  draft.variants
    .filter((variant) => variant.sizeLabel.trim())
    .map((variant, index) => ({
      id: variant.id.startsWith("api-") ? variant.id.replace("api-", "") : undefined,
      sizeLabel: variant.sizeLabel.trim().toUpperCase(),
      stock: Number(variant.stock || 0),
      minStock: Number(variant.minStock || 0),
      priceRetail: variant.priceRetail ? Number(variant.priceRetail) : undefined,
      priceWholesale: variant.priceWholesale ? Number(variant.priceWholesale) : undefined,
      pricePromotion: variant.pricePromotion ? Number(variant.pricePromotion) : undefined,
      position: index + 1,
    }));

const sumVariantStock = (variants: ProductVariant[]) => variants.reduce((sum, variant) => sum + variant.stock, 0);
const sumVariantMinStock = (variants: ProductVariant[]) => variants.reduce((sum, variant) => sum + (variant.minStock ?? 0), 0);

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
  variants?: ProductVariant[];
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
  const [feedback, setFeedback] = useState("Monte o produto com imagem, categoria e estoque para liberar a vitrine da loja.");
  const [submittedLabel, setSubmittedLabel] = useState<string | null>(null);
  const [mainImageId, setMainImageId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newCategoryImageFile, setNewCategoryImageFile] = useState<File | null>(null);
  const [newCategoryPreviewUrl, setNewCategoryPreviewUrl] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [deletedApiImageIds, setDeletedApiImageIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categoryImageInputRef = useRef<HTMLInputElement>(null);
  const latestImagesRef = useRef<ProductImage[]>([]);

  useEffect(() => {
    latestImagesRef.current = draft.images;
  }, [draft.images]);

  useEffect(() => {
    return () => {
      latestImagesRef.current.forEach((image) => {
        if (image.source === "upload") URL.revokeObjectURL(image.previewUrl);
      });
      if (newCategoryPreviewUrl && isObjectUrl(newCategoryPreviewUrl)) {
        URL.revokeObjectURL(newCategoryPreviewUrl);
      }
    };
  }, [newCategoryPreviewUrl]);

  useEffect(() => {
    if (!externalEditRequest || typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("seller-product-edit", { detail: externalEditRequest }));
  }, [externalEditRequest]);

  useEffect(() => {
    const handleEditProduct = (event: Event) => {
      const customEvent = event as CustomEvent<SellerProductEditRequest>;
      const detail = customEvent.detail;
      if (!detail) return;

      const parsedDescription = parseStructuredDescription(detail.description);
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
          ? [{ id: `existing-${detail.id}`, source: "url" as const, name: detail.name, previewUrl: detail.imageUrl }]
          : [];

      const selectedMain = nextImages.find((image) => image.isMain) ?? nextImages[0] ?? null;
      const nextVariants = detail.variants?.length
        ? detail.variants.map((variant, index) => ({
            ...createVariantDraft(),
            id: variant.id ? `api-${variant.id}` : `variant-${index + 1}`,
            sizeLabel: variant.sizeLabel,
            stock: String(variant.stock ?? 0),
            minStock: String(variant.minStock ?? 0),
            priceRetail: variant.priceRetail !== undefined ? String(variant.priceRetail) : "",
            priceWholesale: variant.priceWholesale !== undefined ? String(variant.priceWholesale) : "",
            pricePromotion: variant.pricePromotion !== undefined ? String(variant.pricePromotion) : "",
          }))
        : [
            {
              ...createVariantDraft(),
              sizeLabel: parsedDescription.sizeLabel,
              stock: String(detail.stock),
              minStock: String(detail.minStock),
            },
          ];
      setEditingProductId(detail.id);
      setDraft({
        name: detail.name,
        description: parsedDescription.notes,
        categoryId: detail.categoryId,
        newCategoryName: "",
        priceRetail: String(detail.priceRetail || ""),
        priceWholesale: detail.priceWholesale ? String(detail.priceWholesale) : "",
        pricePromotion: detail.pricePromotion ? String(detail.pricePromotion) : "",
        shelfSection: parsedDescription.shelfSection,
        shelfPosition: parsedDescription.shelfPosition,
        audience: parsedDescription.audience,
        variants: nextVariants,
        images: nextImages,
      });
      setMainImageId(selectedMain?.id ?? null);
      setDeletedApiImageIds([]);
      setSubmittedLabel(null);
      setFeedback(`Produto ${detail.name} carregado para edicao. Revise os tamanhos, os estoques e salve novamente.`);
      document.getElementById("cadastro-produto-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    window.addEventListener("seller-product-edit", handleEditProduct as EventListener);
    return () => window.removeEventListener("seller-product-edit", handleEditProduct as EventListener);
  }, []);

  const selectedCategory = useMemo(() => categories.find((category) => category.id === draft.categoryId), [categories, draft.categoryId]);
  const mainImage = useMemo(() => draft.images.find((image) => image.id === mainImageId) ?? draft.images[0] ?? null, [draft.images, mainImageId]);
  const variantPayload = useMemo(() => toVariantPayload(draft), [draft]);
  const totalStock = useMemo(() => sumVariantStock(variantPayload), [variantPayload]);
  const totalMinStock = useMemo(() => sumVariantMinStock(variantPayload), [variantPayload]);

  const updateField = <K extends keyof ProductFormDraft>(field: K, value: ProductFormDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const updateVariantField = (variantId: string, field: keyof ProductVariantDraft, value: string) => {
    setDraft((current) => ({
      ...current,
      variants: current.variants.map((variant) => (variant.id === variantId ? { ...variant, [field]: value } : variant)),
    }));
  };

  const handleAddVariant = () => {
    setDraft((current) => ({
      ...current,
      variants: [...current.variants, createVariantDraft()],
    }));
  };

  const handleRemoveVariant = (variantId: string) => {
    setDraft((current) => {
      const remaining = current.variants.filter((variant) => variant.id !== variantId);
      return {
        ...current,
        variants: remaining.length ? remaining : [createVariantDraft()],
      };
    });
  };

  const appendImages = (newImages: ProductImage[]) => {
    setDraft((current) => {
      const availableSlots = MAX_IMAGES - current.images.length;
      const accepted = newImages.slice(0, availableSlots);
      const nextImages = [...current.images, ...accepted];
      if (!mainImageId && nextImages[0]) setMainImageId(nextImages[0].id);
      setFeedback(accepted.length < newImages.length ? `Limite de ${MAX_IMAGES} imagens atingido. Algumas fotos ficaram de fora.` : `${accepted.length} imagem(ns) adicionada(s) ao produto.`);
      return { ...current, images: nextImages };
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
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

  const handleRemoveImage = (imageId: string) => {
    setDraft((current) => {
      const imageToRemove = current.images.find((image) => image.id === imageId);
      if (imageToRemove?.source === "upload") URL.revokeObjectURL(imageToRemove.previewUrl);
      if (imageToRemove?.source === "api" && imageToRemove.apiImageId) {
        setDeletedApiImageIds((currentIds) => (currentIds.includes(imageToRemove.apiImageId as string) ? currentIds : [...currentIds, imageToRemove.apiImageId as string]));
      }
      const nextImages = current.images.filter((image) => image.id !== imageId);
      if (mainImageId === imageId) setMainImageId(nextImages[0]?.id ?? null);
      return { ...current, images: nextImages };
    });
  };

  const resetCategoryModalState = () => {
    setDraft((current) => ({ ...current, newCategoryName: "" }));
    setNewCategoryDescription("");
    setNewCategoryImageFile(null);
    if (categoryImageInputRef.current) categoryImageInputRef.current.value = "";
    if (newCategoryPreviewUrl && isObjectUrl(newCategoryPreviewUrl)) URL.revokeObjectURL(newCategoryPreviewUrl);
    setNewCategoryPreviewUrl(null);
  };

  const handleCategoryImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFeedback("Selecione uma imagem valida para a categoria.");
      event.target.value = "";
      return;
    }
    if (newCategoryPreviewUrl && isObjectUrl(newCategoryPreviewUrl)) URL.revokeObjectURL(newCategoryPreviewUrl);
    setNewCategoryImageFile(file);
    setNewCategoryPreviewUrl(URL.createObjectURL(file));
  };

  const handleAddCategory = async () => {
    const trimmed = draft.newCategoryName.trim();
    if (!trimmed || isSavingCategory) {
      if (!trimmed) setFeedback("Digite o nome da categoria antes de salvar.");
      return;
    }
    if (!newCategoryImageFile) {
      setFeedback("Escolha a imagem da categoria antes de salvar.");
      return;
    }

    const slug = slugify(trimmed);
    const alreadyExists = categories.find((category) => category.slug === slug);
    if (alreadyExists) {
      setDraft((current) => ({ ...current, categoryId: alreadyExists.id, newCategoryName: "" }));
      setIsCategoryModalOpen(false);
      setFeedback(`Categoria ${alreadyExists.name} ja existe e foi selecionada.`);
      return;
    }

    setIsSavingCategory(true);
    try {
      const createdCategory = await createSellerCategory({
        storeId: workspace.store.id,
        name: trimmed,
        description: newCategoryDescription.trim() || undefined,
        imageFile: newCategoryImageFile,
        active: true,
      });
      setCategories((current) => [...current, createdCategory]);
      setDraft((current) => ({ ...current, categoryId: createdCategory.id, newCategoryName: "" }));
      resetCategoryModalState();
      setIsCategoryModalOpen(false);
      setFeedback(`Categoria ${createdCategory.name} salva com sucesso.`);
      setIsSavingCategory(false);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel salvar a categoria agora.";
      if (!message.includes("nao esta configurada")) {
        setFeedback(message);
        setIsSavingCategory(false);
        return;
      }
    }

    const newCategory: Category = {
      id: `cat-local-${slug}`,
      storeId: workspace.store.id,
      name: trimmed,
      slug,
      description: newCategoryDescription.trim() || undefined,
      image: newCategoryPreviewUrl ?? undefined,
      active: true,
      origin: "custom",
    };

    setCategories((current) => [...current, newCategory]);
    setDraft((current) => ({ ...current, categoryId: newCategory.id, newCategoryName: "" }));
    setIsCategoryModalOpen(false);
    setFeedback(`Categoria ${trimmed} adicionada localmente para esta loja.`);
    setIsSavingCategory(false);
  };

  const validateForm = () => {
    if (!draft.name.trim()) {
      setFeedback("Informe o nome ou codigo do produto antes de cadastrar.");
      return false;
    }
    if (!draft.categoryId) {
      setFeedback("Selecione uma categoria para o produto.");
      return false;
    }
    const completeVariants = draft.variants.filter((variant) => variant.sizeLabel.trim());
    if (!completeVariants.length) {
      setFeedback("Adicione pelo menos 1 tamanho para concluir o cadastro do produto.");
      return false;
    }
    const labels = new Set();
    for (const variant of completeVariants) {
      const normalizedLabel = variant.sizeLabel.trim().toUpperCase();
      if (labels.has(normalizedLabel)) {
        setFeedback(`O tamanho ${normalizedLabel} foi repetido. Ajuste a grade antes de salvar.`);
        return false;
      }
      labels.add(normalizedLabel);
      if (!variant.stock.trim()) {
        setFeedback(`Informe a quantidade do tamanho ${normalizedLabel}.`);
        return false;
      }
      if (Number(variant.stock) < 0) {
        setFeedback(`A quantidade do tamanho ${normalizedLabel} nao pode ser negativa.`);
        return false;
      }
      if (Number(variant.minStock || 0) < 0) {
        setFeedback(`O estoque minimo do tamanho ${normalizedLabel} nao pode ser negativo.`);
        return false;
      }
    }
    if (draft.images.length < MIN_IMAGES) {
      setFeedback("Adicione pelo menos 1 imagem para concluir o cadastro do produto.");
      return false;
    }
    if (!mainImageId) {
      setFeedback("Escolha a imagem principal do produto.");
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setDraft(initialDraft(workspace));
    setMainImageId(null);
    setEditingProductId(null);
    setDeletedApiImageIds([]);
  };

  const handleSubmit = async () => {
    if (!validateForm() || isSubmitting) return;

    const productName = draft.name.trim();
    const productSlug = slugify(productName);
    const categoryName = selectedCategory?.name ?? "Sem categoria";
    const serializedDescription = buildStructuredDescription(draft);

    setIsSubmitting(true);
    setSubmittedLabel(null);

    try {
      const createdProduct = await submitSellerProduct({
        productId: editingProductId ?? undefined,
        storeId: workspace.store.id,
        categoryId: draft.categoryId,
        name: productName,
        slug: productSlug,
        description: serializedDescription,
        priceRetail: Number(draft.priceRetail || 0),
        priceWholesale: draft.priceWholesale ? Number(draft.priceWholesale) : undefined,
        pricePromotion: draft.pricePromotion ? Number(draft.pricePromotion) : undefined,
        stock: totalStock,
        minStock: totalMinStock,
        variants: variantPayload,
        images: draft.images,
        mainImageId: mainImageId ?? undefined,
      });

      if (editingProductId) {
        for (const imageId of deletedApiImageIds) {
          await deleteSellerProductImage(createdProduct.id, imageId);
        }

        const selectedMainImage = draft.images.find((image) => image.id === mainImageId);
        if (selectedMainImage?.source === "api" && selectedMainImage.apiImageId) {
          await setSellerProductMainImage(createdProduct.id, selectedMainImage.apiImageId);
        }

        await getSellerProductById(createdProduct.id);
      }

      setFeedback(`Produto ${createdProduct.name} ${editingProductId ? "atualizado" : "cadastrado"} na API com sucesso.`);
      setSubmittedLabel(`${createdProduct.name} salvo com ${variantPayload.length} tamanho(s), ${draft.images.length} imagem(ns) e categoria ${categoryName}.`);

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(SELLER_PRODUCTS_SCROLL_KEY, "produtos-cadastrados");
      }

      if (!editingProductId) resetForm();

      setIsSubmitting(false);
      onCompleted?.();
      router.replace("/painel-lojista/produtos#produtos-cadastrados");
      window.setTimeout(() => {
        document.getElementById("produtos-cadastrados")?.scrollIntoView({ behavior: "smooth", block: "start" });
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

    const persistedImages = await Promise.all(
      draft.images.map(async (image) => ({
        id: image.id,
        name: image.name,
        previewUrl: await getPersistableImageUrl(image),
      })),
    );
    const persistedMainImageUrl = mainImage ? await getPersistableImageUrl(mainImage) : undefined;

    saveLocalSellerProduct({
      id: editingProductId ?? window.crypto.randomUUID(),
      storeId: workspace.store.id,
      storeName: workspace.store.name,
      name: productName,
      slug: productSlug,
      description: serializedDescription,
      categoryId: draft.categoryId,
      categoryName,
      priceRetail: Number(draft.priceRetail || 0),
      priceWholesale: draft.priceWholesale ? Number(draft.priceWholesale) : undefined,
      pricePromotion: draft.pricePromotion ? Number(draft.pricePromotion) : undefined,
      stock: totalStock,
      minStock: totalMinStock,
      variants: variantPayload.map((variant, index) => ({
        id: variant.id ?? `local-variant-${index + 1}`,
        sizeLabel: variant.sizeLabel,
        stock: variant.stock,
        minStock: variant.minStock ?? 0,
        priceRetail: variant.priceRetail,
        priceWholesale: variant.priceWholesale,
        pricePromotion: variant.pricePromotion,
        position: variant.position,
      })),
      images: persistedImages,
      mainImageUrl: persistedMainImageUrl,
      createdAt: new Date().toISOString(),
    });

    setFeedback(`Produto ${productName} salvo localmente na vitrine interna.`);
    setSubmittedLabel(`${productName} salvo localmente com ${variantPayload.length} tamanho(s) e categoria ${categoryName}.`);

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(SELLER_PRODUCTS_SCROLL_KEY, "produtos-cadastrados");
    }

    if (!editingProductId) resetForm();

    setIsSubmitting(false);
    onCompleted?.();
    router.replace("/painel-lojista/produtos#produtos-cadastrados");
    window.setTimeout(() => {
      document.getElementById("produtos-cadastrados")?.scrollIntoView({ behavior: "smooth", block: "start" });
      router.refresh();
    }, 200);
  };

  return (
    <div id="cadastro-produto-form" className="space-y-5 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-3xl font-semibold theme-heading">{editingProductId ? "Editar" : "Cadastro"}</h2>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-lg font-semibold text-rose-600 transition hover:bg-rose-100"
            aria-label="Fechar cadastro"
            title="Fechar"
          >
            X
          </button>
        ) : null}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(320px,0.86fr)_minmax(0,1.14fr)]">
        <section className="space-y-4 rounded-[1.8rem] border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-soft)]">
          <div className="relative overflow-hidden rounded-[1.6rem] border border-[var(--border)] bg-[linear-gradient(180deg,#ffffff_0%,#eef4ff_100%)]">
            <div className="aspect-[4/3] bg-slate-100">
              {mainImage ? <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mainImage.previewUrl} alt={mainImage.name} className="h-full w-full object-cover" />
              </> : <div className="flex h-full items-center justify-center px-8 text-center text-sm leading-6 text-[var(--muted)]">Envie a foto principal do produto. Ela sera a primeira imagem usada na vitrine e na gestao da loja.</div>}
            </div>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-4 right-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-[0_18px_36px_rgba(37,99,235,0.24)] transition hover:scale-[1.03] hover:bg-[var(--accent-strong)]" aria-label="Enviar imagens do produto">+
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-slate-700">
                {variantPayload.length} tamanho(s) · {totalStock} unidade(s)
              </div>
              <span className="rounded-full theme-border-button px-3 py-1.5 text-xs font-semibold transition">{draft.images.length}/{MAX_IMAGES}</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="space-y-2">
                <span className="text-sm font-medium theme-heading">Prateleira</span>
                <input aria-label="Prateleira" value={draft.shelfSection} onChange={(event) => updateField("shelfSection", event.target.value.toUpperCase().slice(0, 2))} placeholder="A" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-center outline-none transition focus:border-[var(--accent)]" />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium theme-heading">Posicao</span>
                <input aria-label="Posicao" value={draft.shelfPosition} onChange={(event) => updateField("shelfPosition", event.target.value)} placeholder="1" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-center outline-none transition focus:border-[var(--accent)]" />
              </label>
            </div>

            <div className="mt-4 rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium theme-heading">Grade e estoque</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">Cadastre varios tamanhos do mesmo produto com quantidades independentes.</p>
                </div>
                <button type="button" onClick={handleAddVariant} className="rounded-xl bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]">Adicionar tamanho</button>
              </div>

              <div className="mt-4 space-y-3">
                {draft.variants.map((variant, index) => (
                  <div key={variant.id} className="grid gap-3 rounded-[1rem] border border-[var(--border)] bg-white p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_44px]">
                    <label className="space-y-2">
                      <span className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--muted)]">Tamanho</span>
                      <input aria-label={`Tamanho ${index + 1}`} value={variant.sizeLabel} onChange={(event) => updateVariantField(variant.id, "sizeLabel", event.target.value.toUpperCase())} placeholder="34, 36, P, M, G" className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]" />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--muted)]">Qtd</span>
                      <input aria-label={`Qtd ${index + 1}`} type="number" min="0" step="1" value={variant.stock} onChange={(event) => updateVariantField(variant.id, "stock", event.target.value)} placeholder="30" className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]" />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--muted)]">Min.</span>
                      <input aria-label={`Minimo ${index + 1}`} type="number" min="0" step="1" value={variant.minStock} onChange={(event) => updateVariantField(variant.id, "minStock", event.target.value)} placeholder="0" className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]" />
                    </label>
                    <div className="flex items-end">
                      <button type="button" onClick={() => handleRemoveVariant(variant.id)} className="flex h-[50px] w-full items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-lg font-semibold text-rose-600 transition hover:bg-rose-100" aria-label={`Remover tamanho ${index + 1}`}>X</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {draft.images.length ? <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">{draft.images.map((image) => {
            const isMain = image.id === mainImageId;
            return (
              <article key={image.id} className={`overflow-hidden rounded-[1.2rem] border bg-[var(--surface)] ${isMain ? "border-[var(--accent)] shadow-[0_0_0_2px_rgba(37,99,235,0.08)]" : "border-[var(--border)]"}`}>
                <button type="button" onClick={() => setMainImageId(image.id)} className="block w-full text-left">
                  <div className="aspect-square bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.previewUrl} alt={image.name} className="h-full w-full object-cover" />
                  </div>
                </button>
                <div className="space-y-2 p-2">
                  <p className="truncate text-xs text-[var(--muted)]" title={image.name}>{shortenImageName(image.name)}</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setMainImageId(image.id)} className={`flex-1 rounded-full px-3 py-2 text-[11px] font-semibold transition ${isMain ? "bg-[var(--accent)] text-white" : "border border-[var(--border)] bg-white text-slate-700 hover:border-[var(--accent)]"}`}>{isMain ? "Principal" : "Usar"}</button>
                    <button type="button" onClick={() => handleRemoveImage(image.id)} className="rounded-full border border-rose-200 px-3 py-2 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-50">X</button>
                  </div>
                </div>
              </article>
            );
          })}</div> : null}
        </section>

        <section className="space-y-4 rounded-[1.8rem] border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-soft)]">
          <label className="space-y-2">
            <span className="text-sm font-medium theme-heading">Categoria</span>
            <div className="grid grid-cols-[minmax(0,1fr)_52px] gap-3">
              <select value={draft.categoryId} onChange={(event) => updateField("categoryId", event.target.value)} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]">
                <option value="">Selecione uma categoria</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <button type="button" onClick={() => setIsCategoryModalOpen(true)} className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[var(--accent)] text-2xl font-semibold text-white transition hover:bg-[var(--accent-strong)]" aria-label="Adicionar categoria">+</button>
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium theme-heading">Selecione</span>
            <select aria-label="Selecione" value={draft.audience} onChange={(event) => updateField("audience", event.target.value)} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]">
              {audienceOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium theme-heading">Produto</span>
            <input aria-label="Produto" value={draft.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Nome ou codigo do produto" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]" />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium theme-heading">Descricao</span>
            <textarea aria-label="Descricao" value={draft.description} onChange={(event) => updateField("description", event.target.value)} rows={4} placeholder="Descreva o produto, acabamento, cor, caimento e detalhes importantes para a venda..." className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]" />
          </label>

        </section>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-slate-50 px-4 py-3 text-sm leading-6 text-[var(--muted)]">{feedback}</div>

      <div className="flex justify-end">
        <button type="button" onClick={() => { void handleSubmit(); }} disabled={isSubmitting} className={`rounded-2xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] ${isSubmitting ? "cursor-not-allowed opacity-70" : ""}`}>
          {isSubmitting ? "Salvando..." : editingProductId ? "Salvar produto" : "Cadastrar"}
        </button>
      </div>

      {submittedLabel ? <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">Produto <strong>{submittedLabel}</strong></div> : null}

      {isCategoryModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-8">
          <div className="w-full max-w-[430px] rounded-[2rem] border border-white/10 bg-white p-4 shadow-[0_24px_80px_rgba(15,23,42,0.3)]">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Nova categoria</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">Cadastrar categoria</h3>
              </div>
              <button type="button" onClick={() => { resetCategoryModalState(); setIsCategoryModalOpen(false); }} className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-sm font-semibold text-rose-600 transition hover:bg-rose-100" aria-label="Fechar categoria">X</button>
            </div>

            <div className="relative overflow-hidden rounded-[1.6rem] border border-[var(--border)] bg-[#eef2f6]">
              <button
                type="button"
                onClick={() => categoryImageInputRef.current?.click()}
                disabled={isSavingCategory}
                className="block w-full text-left"
                aria-label={newCategoryPreviewUrl ? "Trocar imagem da categoria" : "Enviar imagem da categoria"}
              >
                <div className="aspect-[4/3] min-h-[220px] bg-[#eef2f6]">
                  {newCategoryPreviewUrl ? <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={newCategoryPreviewUrl} alt="Preview da categoria" className="h-full w-full object-cover" />
                  </> : <div className="flex h-full min-h-[220px] items-center justify-center px-12 text-center text-[15px] leading-7 text-slate-800">Envie a imagem da categoria.</div>}
                </div>
              </button>
              <button
                type="button"
                onClick={() => categoryImageInputRef.current?.click()}
                disabled={isSavingCategory}
                className="absolute bottom-4 right-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent)] text-2xl font-medium text-white shadow-[0_18px_36px_rgba(37,99,235,0.24)] transition hover:scale-[1.03] hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
                aria-label={newCategoryPreviewUrl ? "Trocar imagem da categoria" : "Enviar imagem da categoria"}
                title={newCategoryPreviewUrl ? "Trocar imagem" : "Enviar imagem"}
              >
                +
              </button>
              <input ref={categoryImageInputRef} type="file" accept={CATEGORY_ACCEPTED_IMAGE_TYPES} onChange={handleCategoryImageChange} className="hidden" />
            </div>

            <div className="mt-4 flex items-center justify-end gap-3">
              <span className="rounded-full border border-[var(--border)] bg-white px-4 py-1.5 text-sm font-semibold text-slate-900 shadow-sm">{newCategoryPreviewUrl ? "1" : "0"}/1</span>
            </div>

            <div className="mt-4 grid gap-4">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-950">Nome da categoria</span>
                <input value={draft.newCategoryName} onChange={(event) => updateField("newCategoryName", event.target.value)} placeholder="Ex.: Vestidos, Blusas, Calcas femininas" className="h-[50px] w-full rounded-[1rem] border border-[var(--border)] bg-white px-4 text-center text-base text-slate-900 outline-none transition focus:border-[var(--accent)]" />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-950">Descricao opcional</span>
                <textarea value={newCategoryDescription} onChange={(event) => setNewCategoryDescription(event.target.value)} rows={3} placeholder="Descricao da categoria" className="w-full resize-none rounded-[1rem] border border-[var(--border)] bg-white px-4 py-3 text-center text-base text-slate-900 outline-none transition focus:border-[var(--accent)]" />
              </label>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => { resetCategoryModalState(); setIsCategoryModalOpen(false); }} className="rounded-2xl border border-[var(--border)] px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-[var(--accent)]">Cancelar</button>
              <button type="button" onClick={() => { void handleAddCategory(); }} disabled={isSavingCategory} className={`rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] ${isSavingCategory ? "cursor-not-allowed opacity-70" : ""}`}>
                {isSavingCategory ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}









