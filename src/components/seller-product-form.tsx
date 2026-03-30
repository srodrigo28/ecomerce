"use client";

import { useEffect, useRef, useState } from "react";

import type { Category, ProductFormDraft, ProductImage, SellerWorkspace } from "@/types/catalog";

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

export function SellerProductForm({ workspace }: { workspace: SellerWorkspace }) {
  const [draft, setDraft] = useState<ProductFormDraft>(() => initialDraft(workspace));
  const [categories, setCategories] = useState<Category[]>(() => workspace.categories);
  const [step, setStep] = useState(0);
  const [urlInput, setUrlInput] = useState("");
  const [feedback, setFeedback] = useState<string>("Preencha cada etapa com calma para montar um cadastro de produto mais elegante.");
  const [submittedPreview, setSubmittedPreview] = useState<ProductFormDraft | null>(null);
  const [mainImageId, setMainImageId] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      draft.images.forEach((image) => {
        if (image.source === "upload") {
          URL.revokeObjectURL(image.previewUrl);
        }
      });
    };
  }, [draft.images]);

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

  const handleAddCategory = () => {
    const trimmed = draft.newCategoryName.trim();

    if (!trimmed) {
      setFeedback("Digite o nome da nova categoria para adicionar ao cadastro.");
      return;
    }

    const slug = slugify(trimmed);
    const alreadyExists = categories.some((category) => category.slug === slug);

    if (alreadyExists) {
      setFeedback("Ja existe uma categoria com esse nome nesta loja.");
      return;
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
    setFeedback(`Categoria ${trimmed} adicionada localmente para esta loja.`);
  };

  const handleUseBaseCategory = (baseName: string) => {
    const slug = slugify(baseName);
    const existingCategory = categories.find((category) => category.slug === slug);

    if (existingCategory) {
      setDraft((current) => ({ ...current, categoryId: existingCategory.id }));
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
    setFeedback(`Categoria base ${baseName} adicionada localmente a esta loja.`);
  };

  const handleRemoveImage = (imageId: string) => {
    setDraft((current) => {
      const imageToRemove = current.images.find((image) => image.id === imageId);
      if (imageToRemove?.source === "upload") {
        URL.revokeObjectURL(imageToRemove.previewUrl);
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

  const handleSubmit = () => {
    if (!validateStep(2)) {
      return;
    }

    setSubmittedPreview(draft);
    setFeedback("Produto validado localmente em formato step-by-step. O frontend esta pronto para evoluir com a API depois.");
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
    <div className="space-y-6 rounded-[2rem] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)] sm:p-6 lg:p-8">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Cadastro guiado</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Novo produto em etapas</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              O fluxo agora guia o lojista por blocos curtos, sem distracao, ate finalizar o cadastro com mais clareza e mais elegancia.
            </p>
          </div>
          <span className="w-fit rounded-full bg-[rgba(15,118,110,0.12)] px-4 py-2 text-xs font-semibold text-[var(--accent-strong)]">
            Etapa {step + 1} de {stepLabels.length}
          </span>
        </div>

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

            <div className="space-y-4 rounded-[1.5rem] border border-[var(--border)] bg-slate-50 p-5">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">Categorias da loja</h4>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Use uma categoria base ou crie uma nova sem sair do fluxo.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {workspace.categoryBases.map((base) => (
                  <button key={base.id} type="button" onClick={() => handleUseBaseCategory(base.name)} className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]">
                    Usar {base.name}
                  </button>
                ))}
              </div>

              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                <input value={draft.newCategoryName} onChange={(event) => updateField("newCategoryName", event.target.value)} placeholder="Adicionar nova categoria da loja" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]" />
                <button type="button" onClick={handleAddCategory} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
                  Adicionar categoria
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-900">Categoria</span>
                <select value={draft.categoryId} onChange={(event) => updateField("categoryId", event.target.value)} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]">
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </label>
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
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Escolha entre 1 e 5 imagens, visualize tudo em preview e marque uma como principal.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="rounded-full bg-[rgba(15,118,110,0.12)] px-4 py-2 text-xs font-semibold text-[var(--accent-strong)]">
                {draft.images.length}/{MAX_IMAGES} imagens escolhidas
              </div>
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
                draft.images.map((image, index) => {
                  const isMain = image.id === mainImageId;

                  return (
                    <article key={image.id} className={`overflow-hidden rounded-[1.5rem] border bg-white ${isMain ? "border-[var(--accent)] shadow-[0_0_0_2px_rgba(15,118,110,0.08)]" : "border-[var(--border)]"}`}>
                      <div className="aspect-[4/5] bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image.previewUrl} alt={image.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="space-y-3 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isMain ? "bg-[var(--accent)] text-white" : "theme-badge-neutral"}`}>
                            {isMain ? "Principal" : `Imagem ${index + 1}`}
                          </span>
                          <span className="text-xs font-medium text-[var(--muted)]">{image.source === "upload" ? "Upload local" : "URL remota"}</span>
                        </div>
                        <p className="line-clamp-2 text-sm leading-6 text-[var(--muted)]">{image.name}</p>
                        <div className="grid gap-2">
                          <button type="button" onClick={() => setMainImageId(image.id)} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
                            {isMain ? "Imagem principal" : "Definir como principal"}
                          </button>
                          <button type="button" onClick={() => handleRemoveImage(image.id)} className="rounded-2xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50">
                            Remover imagem
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-[var(--border)] bg-white px-5 py-10 text-sm leading-6 text-[var(--muted)] sm:col-span-2 xl:col-span-3">
                  Nenhuma imagem adicionada ainda. Para uma apresentacao mais forte, escolha a sequencia visual do produto antes de seguir.
                </div>
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

            <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-white p-4">
                <div className="aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-slate-100">
                  {mainImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mainImage.previewUrl} alt={mainImage.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center text-sm leading-6 text-[var(--muted)]">A imagem principal aparecera aqui.</div>
                  )}
                </div>
              </div>

              <div className="grid gap-3">
                <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
                  <p className="text-sm text-[var(--muted)]">Nome</p>
                  <strong className="mt-2 block text-xl text-slate-900">{draft.name || "Produto sem nome"}</strong>
                </div>
                <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
                  <p className="text-sm text-[var(--muted)]">Categoria</p>
                  <strong className="mt-2 block text-xl text-slate-900">{selectedCategory?.name ?? "Nao definida"}</strong>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
                    <p className="text-sm text-[var(--muted)]">Preco varejo</p>
                    <strong className="mt-2 block text-xl text-slate-900">{formatCurrency(draft.priceRetail)}</strong>
                  </div>
                  <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
                    <p className="text-sm text-[var(--muted)]">Imagens</p>
                    <strong className="mt-2 block text-xl text-slate-900">{draft.images.length}</strong>
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4 text-sm leading-6 text-[var(--muted)]">
                  {draft.description || "Adicione uma descricao para o produto ficar mais claro na vitrine e na operacao interna."}
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
        <button type="button" onClick={() => setStep((current) => Math.max(current - 1, 0))} className={`rounded-full px-5 py-3 text-sm font-semibold transition ${step === 0 ? "cursor-not-allowed border border-[var(--border)] bg-slate-100 text-slate-400" : "border border-[var(--border)] bg-white text-slate-800 hover:border-[var(--accent)]"}`} disabled={step === 0}>
          Voltar etapa
        </button>

        <div className="flex flex-wrap gap-3">
          {step < 3 ? (
            <button type="button" onClick={handleNextStep} className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]">
              Continuar
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]">
              Finalizar cadastro
            </button>
          )}
        </div>
      </div>

      {submittedPreview ? (
        <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900">
          Ultima validacao local concluida para <strong>{submittedPreview.name || "produto sem nome"}</strong> com {submittedPreview.images.length} imagem(ns) e imagem principal definida.
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

            <div className="mt-6 grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="rounded-[1.75rem] border border-[var(--border)] bg-slate-50 p-4">
                <div className="aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-white">
                  {mainImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mainImage.previewUrl} alt={mainImage.name} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="mt-4">
                  <p className="text-sm font-semibold text-slate-900">Imagem principal</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{mainImage?.name ?? "Nenhuma imagem principal escolhida"}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {draft.images.map((image, index) => {
                  const isMain = image.id === mainImageId;

                  return (
                    <article key={image.id} className={`overflow-hidden rounded-[1.5rem] border bg-slate-50 ${isMain ? "border-[var(--accent)]" : "border-[var(--border)]"}`}>
                      <div className="aspect-[4/5] bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image.previewUrl} alt={image.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="space-y-3 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isMain ? "bg-[var(--accent)] text-white" : "bg-white text-slate-700"}`}>{isMain ? "Principal" : `Ordem ${index + 1}`}</span>
                          <span className="text-xs text-[var(--muted)]">{image.source === "upload" ? "Upload" : "URL"}</span>
                        </div>
                        <p className="line-clamp-2 text-sm text-[var(--muted)]">{image.name}</p>
                        <button type="button" onClick={() => setMainImageId(image.id)} className="w-full rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
                          {isMain ? "Imagem principal" : "Usar como principal"}
                        </button>
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
