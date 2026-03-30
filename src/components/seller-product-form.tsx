"use client";

import { useEffect, useRef, useState } from "react";

import type { Category, ProductFormDraft, ProductImage, SellerWorkspace } from "@/types/catalog";

const MAX_IMAGES = 5;
const MIN_IMAGES = 1;

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
  whatsapp: workspace.store.whatsapp ?? "",
  pixKey: workspace.store.pixKey ?? "",
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

export function SellerProductForm({ workspace }: { workspace: SellerWorkspace }) {
  const [draft, setDraft] = useState<ProductFormDraft>(() => initialDraft(workspace));
  const [categories, setCategories] = useState<Category[]>(() => workspace.categories);
  const [urlInput, setUrlInput] = useState("");
  const [feedback, setFeedback] = useState<string>("Formulario local pronto para teste. Nada sera enviado para API por enquanto.");
  const [submittedPreview, setSubmittedPreview] = useState<ProductFormDraft | null>(null);
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

      if (accepted.length < newImages.length) {
        setFeedback(`Limite de ${MAX_IMAGES} imagens atingido. Algumas imagens nao foram adicionadas.`);
      } else {
        setFeedback(`${accepted.length} imagem(ns) adicionada(s) com sucesso.`);
      }

      return {
        ...current,
        images: [...current.images, ...accepted],
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

      return {
        ...current,
        images: current.images.filter((image) => image.id !== imageId),
      };
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (draft.images.length < MIN_IMAGES) {
      setFeedback("Cada produto precisa ter pelo menos 1 imagem para teste do frontend.");
      return;
    }

    if (!draft.categoryId) {
      setFeedback("Selecione uma categoria ou crie uma nova antes de validar o produto.");
      return;
    }

    setSubmittedPreview(draft);
    setFeedback("Produto validado localmente. O frontend esta pronto para conectar com a API depois.");
  };

  const selectedCategory = categories.find((category) => category.id === draft.categoryId);
  const stockValue = Number(draft.stock || 0);
  const minStockValue = Number(draft.minStock || 0);
  const stockHealthLabel = stockValue <= 0 ? "Sem estoque" : stockValue <= minStockValue ? "Estoque baixo" : "Estoque saudavel";
  const stockHealthClass =
    stockValue <= 0
      ? "bg-rose-100 text-rose-700"
      : stockValue <= minStockValue
        ? "bg-amber-100 text-amber-700"
        : "bg-emerald-100 text-emerald-700";

  return (
    <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
      <form onSubmit={handleSubmit} className="space-y-6 rounded-[2rem] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)] sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Cadastro amigavel</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Novo produto</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Formulario pronto para teste local. O lojista pode organizar categoria, definir estoque minimo, subir imagens
              e revisar tudo antes da integracao real com API.
            </p>
          </div>
          <span className="w-fit rounded-full bg-[rgba(15,118,110,0.12)] px-4 py-2 text-xs font-semibold text-[var(--accent-strong)]">
            {draft.images.length}/{MAX_IMAGES} imagens
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-900">Nome do produto</span>
            <input
              value={draft.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Ex.: Vestido Midi Aurora"
              className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-900">Categoria</span>
            <select
              value={draft.categoryId}
              onChange={(event) => updateField("categoryId", event.target.value)}
              className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
              required
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <section className="space-y-4 rounded-[1.5rem] border border-[var(--border)] bg-slate-50 p-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Categorias da loja</h3>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              Cada lojista pode ter suas proprias categorias. As categorias base ajudam no inicio, mas nao substituem o CRUD individual.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {workspace.categoryBases.map((base) => (
              <button
                key={base.id}
                type="button"
                onClick={() => handleUseBaseCategory(base.name)}
                className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
              >
                Usar {base.name}
              </button>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <input
              value={draft.newCategoryName}
              onChange={(event) => updateField("newCategoryName", event.target.value)}
              placeholder="Adicionar nova categoria da loja"
              className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Adicionar categoria
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <div key={category.id} className="rounded-2xl border border-[var(--border)] bg-white px-4 py-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <strong className="text-slate-900">{category.name}</strong>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${category.origin === "base" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                    {category.origin === "base" ? "Base" : "Custom"}
                  </span>
                </div>
                <p className="mt-2 text-xs font-mono text-[var(--muted)]">/{category.slug}</p>
              </div>
            ))}
          </div>
        </section>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-900">Descricao</span>
          <textarea
            value={draft.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Destaque modelagem, tecido, caimento e ocasioes de uso."
            rows={5}
            className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-900">Preco varejo</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={draft.priceRetail}
              onChange={(event) => updateField("priceRetail", event.target.value)}
              placeholder="0,00"
              className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-900">Preco atacado</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={draft.priceWholesale}
              onChange={(event) => updateField("priceWholesale", event.target.value)}
              placeholder="Opcional"
              className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-900">Preco promocional</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={draft.pricePromotion}
              onChange={(event) => updateField("pricePromotion", event.target.value)}
              placeholder="Opcional"
              className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-900">Estoque atual</span>
            <input
              type="number"
              min="0"
              step="1"
              value={draft.stock}
              onChange={(event) => updateField("stock", event.target.value)}
              placeholder="0"
              className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-900">Estoque minimo</span>
            <input
              type="number"
              min="0"
              step="1"
              value={draft.minStock}
              onChange={(event) => updateField("minStock", event.target.value)}
              placeholder="5"
              className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-900">WhatsApp da loja</span>
            <input
              value={draft.whatsapp}
              onChange={(event) => updateField("whatsapp", event.target.value)}
              placeholder="11999990000"
              className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-900">Chave Pix</span>
            <input
              value={draft.pixKey}
              onChange={(event) => updateField("pixKey", event.target.value)}
              placeholder="pix@sualoja.com"
              className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
            />
          </label>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-slate-50 px-4 py-4 text-sm text-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>Leitura de estoque para este produto</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stockHealthClass}`}>{stockHealthLabel}</span>
          </div>
          <p className="mt-2 leading-6 text-[var(--muted)]">
            Estoque atual {stockValue} unidade(s). Estoque minimo configurado: {minStockValue || 0} unidade(s).
          </p>
        </div>

        <section className="space-y-4 rounded-[1.5rem] border border-dashed border-[var(--border)] bg-[rgba(15,118,110,0.03)] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Imagens do produto</h3>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Adicione imagens por upload local ou URL. O sistema aceita entre 1 e 5 imagens por produto.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Escolher arquivos
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <input
              value={urlInput}
              onChange={(event) => setUrlInput(event.target.value)}
              placeholder="https://exemplo.com/minha-foto.jpg"
              className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
            />
            <button
              type="button"
              onClick={handleAddUrl}
              className="rounded-2xl border border-[var(--border)] px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
            >
              Adicionar por URL
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {draft.images.length ? (
              draft.images.map((image, index) => (
                <article key={image.id} className="overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-white">
                  <div className="aspect-[4/5] bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.previewUrl} alt={image.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        Imagem {index + 1}
                      </span>
                      <span className="text-xs font-medium text-[var(--muted)]">
                        {image.source === "upload" ? "Upload local" : "URL remota"}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm leading-6 text-[var(--muted)]">{image.name}</p>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(image.id)}
                      className="w-full rounded-2xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                    >
                      Remover imagem
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-[var(--border)] bg-white px-5 py-8 text-sm leading-6 text-[var(--muted)] sm:col-span-2 xl:col-span-3">
                Nenhuma imagem adicionada ainda. Para um cadastro convincente no frontend, comece com a foto principal do produto.
              </div>
            )}
          </div>
        </section>

        <div className="rounded-2xl border border-[var(--border)] bg-slate-50 px-4 py-3 text-sm leading-6 text-[var(--muted)]">
          {feedback}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm leading-6 text-[var(--muted)]">
            Categoria selecionada: <span className="font-semibold text-slate-900">{selectedCategory?.name ?? "Nao definida"}</span>
          </div>
          <button
            type="submit"
            className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          >
            Validar cadastro localmente
          </button>
        </div>
      </form>

      <aside className="space-y-6 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6 2xl:sticky 2xl:top-6 2xl:self-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Preview operacional</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">Como o produto apareceria</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Este painel ajuda a testar a experiencia do lojista antes da API existir. Quando conectarmos o backend,
            a mesma interface pode reaproveitar payloads reais.
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-[var(--border)] bg-white p-4">
          <div className="aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-slate-100">
            {draft.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={draft.images[0].previewUrl} alt={draft.images[0].name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center text-sm leading-6 text-[var(--muted)]">
                A imagem principal aparece aqui assim que voce fizer upload local ou adicionar uma URL.
              </div>
            )}
          </div>
          <div className="space-y-3 p-2 pt-4">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {selectedCategory?.name ?? "Categoria"}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stockHealthClass}`}>{stockHealthLabel}</span>
            </div>
            <h4 className="text-xl font-semibold text-slate-900">{draft.name || "Nome do produto"}</h4>
            <p className="text-sm leading-6 text-[var(--muted)]">
              {draft.description || "A descricao preenchida no formulario aparece aqui para o lojista revisar antes da integracao real."}
            </p>
            <div className="grid gap-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <div className="flex items-center justify-between gap-3">
                <span>Varejo</span>
                <strong>R$ {draft.priceRetail || "0,00"}</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Atacado</span>
                <strong>R$ {draft.priceWholesale || "0,00"}</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Promocional</span>
                <strong>R$ {draft.pricePromotion || "0,00"}</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Estoque minimo</span>
                <strong>{draft.minStock || "0"}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[var(--border)] bg-white p-5">
          <h4 className="text-lg font-semibold text-slate-900">Regras desta etapa</h4>
          <div className="mt-4 grid gap-3 text-sm leading-6 text-[var(--muted)]">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">Categorias podem ser proprias da loja sem impactar outros lojistas.</div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">Cadastro de imagens com no minimo 1 e no maximo 5 arquivos ou URLs.</div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">Estoque minimo ajuda a antecipar reposicao antes da ruptura.</div>
          </div>
        </div>

        {submittedPreview ? (
          <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900">
            Ultima validacao local concluida para <strong>{submittedPreview.name || "produto sem nome"}</strong> com {submittedPreview.images.length} imagem(ns).
          </div>
        ) : null}
      </aside>
    </div>
  );
}
