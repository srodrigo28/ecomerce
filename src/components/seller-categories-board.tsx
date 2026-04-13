"use client";

import { useEffect, useMemo, useState } from "react";

import { createSellerCategory, deleteSellerCategory, updateSellerCategory } from "@/lib/services/catalog-service";
import type { Category, SellerWorkspace } from "@/types/catalog";

const suggestedCategoryNames = ["Vestidos", "Calcas", "Blusas", "Bermudas", "Shorts", "Camisas"];
const acceptedImageTypes = "image/png,image/jpeg,image/webp";

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

const isObjectUrl = (value?: string | null) => Boolean(value?.startsWith("blob:"));

const renderCategoryPreview = (image?: string | null, label = "Preview da categoria") => {
  if (image) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={label} className="h-full w-full object-cover" />
      </>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 via-white to-amber-50 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
      Sem imagem
    </div>
  );
};

export function SellerCategoriesBoard({ workspace }: { workspace: SellerWorkspace }) {
  const [categories, setCategories] = useState<Category[]>(workspace.categories);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newCategoryImageFile, setNewCategoryImageFile] = useState<File | null>(null);
  const [newCategoryPreviewUrl, setNewCategoryPreviewUrl] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [editingCategoryDescription, setEditingCategoryDescription] = useState("");
  const [editingCategoryImageFile, setEditingCategoryImageFile] = useState<File | null>(null);
  const [editingCategoryPreviewUrl, setEditingCategoryPreviewUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState(
    "Cadastre categorias comerciais reais da loja, com nome, descricao e imagem obrigatoria, sempre vinculadas automaticamente a loja ativa.",
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (isObjectUrl(newCategoryPreviewUrl)) {
        URL.revokeObjectURL(newCategoryPreviewUrl);
      }
      if (isObjectUrl(editingCategoryPreviewUrl)) {
        URL.revokeObjectURL(editingCategoryPreviewUrl);
      }
    };
  }, [editingCategoryPreviewUrl, newCategoryPreviewUrl]);

  const activeCategories = useMemo(() => categories.filter((category) => category.active), [categories]);
  const inactiveCategories = useMemo(() => categories.filter((category) => !category.active), [categories]);

  const resetNewCategoryForm = () => {
    setNewCategoryName("");
    setNewCategoryDescription("");
    setNewCategoryImageFile(null);
    if (isObjectUrl(newCategoryPreviewUrl)) {
      URL.revokeObjectURL(newCategoryPreviewUrl);
    }
    setNewCategoryPreviewUrl(null);
  };

  const handleNewImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFeedback("Selecione um arquivo de imagem valido para a categoria.");
      event.target.value = "";
      return;
    }

    if (isObjectUrl(newCategoryPreviewUrl)) {
      URL.revokeObjectURL(newCategoryPreviewUrl);
    }

    setNewCategoryImageFile(file);
    setNewCategoryPreviewUrl(URL.createObjectURL(file));
  };

  const handleEditingImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFeedback("Selecione um arquivo de imagem valido para a categoria.");
      event.target.value = "";
      return;
    }

    if (isObjectUrl(editingCategoryPreviewUrl)) {
      URL.revokeObjectURL(editingCategoryPreviewUrl);
    }

    setEditingCategoryImageFile(file);
    setEditingCategoryPreviewUrl(URL.createObjectURL(file));
  };

  const handleCreateCategory = async () => {
    const trimmed = newCategoryName.trim();

    if (!trimmed) {
      setFeedback("Digite o nome da categoria da loja para cadastrar.");
      return;
    }

    if (!newCategoryImageFile) {
      setFeedback("Selecione a imagem da categoria para continuar.");
      return;
    }

    const slug = slugify(trimmed);
    const exists = categories.some((category) => category.slug === slug);

    if (exists) {
      setFeedback("Ja existe uma categoria com esse nome nesta loja.");
      return;
    }

    try {
      setIsSaving(true);
      const created = await createSellerCategory({
        storeId: workspace.store.id,
        name: trimmed,
        description: newCategoryDescription.trim() || undefined,
        imageFile: newCategoryImageFile,
        active: true,
      });

      setCategories((current) => [created, ...current]);
      resetNewCategoryForm();
      setFeedback(`Categoria ${trimmed} criada com sucesso para ${workspace.store.name}.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel criar a categoria.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEdit = (category: Category) => {
    if (isObjectUrl(editingCategoryPreviewUrl)) {
      URL.revokeObjectURL(editingCategoryPreviewUrl);
    }

    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
    setEditingCategoryDescription(category.description ?? "");
    setEditingCategoryImageFile(null);
    setEditingCategoryPreviewUrl(category.image ?? null);
  };

  const handleCancelEdit = () => {
    if (isObjectUrl(editingCategoryPreviewUrl)) {
      URL.revokeObjectURL(editingCategoryPreviewUrl);
    }

    setEditingCategoryId(null);
    setEditingCategoryName("");
    setEditingCategoryDescription("");
    setEditingCategoryImageFile(null);
    setEditingCategoryPreviewUrl(null);
  };

  const handleSaveEdit = async (categoryId: string) => {
    const trimmed = editingCategoryName.trim();

    if (!trimmed) {
      setFeedback("O nome da categoria nao pode ficar vazio.");
      return;
    }

    const currentCategory = categories.find((category) => category.id === categoryId);
    if (!currentCategory) {
      setFeedback("Nao foi possivel localizar a categoria para editar.");
      return;
    }

    if (!editingCategoryImageFile && !currentCategory.image) {
      setFeedback("Essa categoria precisa de uma imagem para continuar.");
      return;
    }

    const slug = slugify(trimmed);
    const exists = categories.some((category) => category.id !== categoryId && category.slug === slug);

    if (exists) {
      setFeedback("Ja existe outra categoria com esse nome nesta loja.");
      return;
    }

    try {
      setIsSaving(true);
      const updated = await updateSellerCategory(categoryId, {
        storeId: currentCategory.storeId,
        name: trimmed,
        description: editingCategoryDescription.trim() || undefined,
        imageFile: editingCategoryImageFile ?? undefined,
        active: currentCategory.active,
      });
      setCategories((current) => current.map((category) => (category.id === categoryId ? updated : category)));
      handleCancelEdit();
      setFeedback(`Categoria ${trimmed} atualizada com sucesso.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel atualizar a categoria.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleCategory = async (category: Category) => {
    try {
      setIsSaving(true);
      const updated = await updateSellerCategory(category.id, {
        storeId: category.storeId,
        name: category.name,
        description: category.description,
        active: !category.active,
      });
      setCategories((current) => current.map((item) => (item.id === category.id ? updated : item)));
      setFeedback(`Categoria ${category.name} ${category.active ? "desativada" : "ativada"} com sucesso.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel atualizar o status da categoria.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    try {
      setIsSaving(true);
      await deleteSellerCategory(category.id);
      setCategories((current) => current.filter((item) => item.id !== category.id));
      if (editingCategoryId === category.id) {
        handleCancelEdit();
      }
      setFeedback(`Categoria ${category.name} removida com sucesso.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel excluir a categoria.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Nova categoria</p>
            <h2 className="mt-2 text-2xl font-semibold theme-heading">Cadastre categorias comerciais da loja</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Informe nome, descricao e imagem da categoria. A loja ativa do painel e vinculada automaticamente no envio.
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="grid gap-3">
              <input
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                placeholder="Ex.: Vestidos, Calcas femininas, Blusas, Bermudas"
                className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm theme-text outline-none transition focus:border-[var(--accent)]"
              />
              <textarea
                value={newCategoryDescription}
                onChange={(event) => setNewCategoryDescription(event.target.value)}
                placeholder="Descricao da categoria para orientar o cadastro e a navegacao da loja"
                rows={3}
                className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm theme-text outline-none transition focus:border-[var(--accent)]"
              />
              <label className="grid gap-2 rounded-2xl border border-dashed border-[var(--border)] bg-white px-4 py-4 text-sm text-slate-700">
                <span className="font-medium text-slate-900">Imagem da categoria</span>
                <input type="file" accept={acceptedImageTypes} onChange={handleNewImageChange} className="text-sm" />
                <span className="text-xs text-[var(--muted)]">Obrigatoria. Use PNG, JPG, JPEG ou WEBP.</span>
              </label>
              <button
                type="button"
                onClick={() => void handleCreateCategory()}
                disabled={isSaving}
                className="rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? "Salvando..." : "Cadastrar categoria"}
              </button>
            </div>

            <div className="space-y-3">
              <div className="overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-white shadow-sm">
                <div className="aspect-[4/5] w-full">{renderCategoryPreview(newCategoryPreviewUrl)}</div>
              </div>
              <div className="rounded-[1.25rem] bg-slate-50 p-3 text-xs leading-5 text-[var(--muted)]">
                O preview ajuda a validar a capa da categoria antes do envio para a API.
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {suggestedCategoryNames.map((categoryName) => (
              <button
                key={categoryName}
                type="button"
                onClick={() => {
                  setNewCategoryName(categoryName);
                  setFeedback(`Nome ${categoryName} preenchido. Agora selecione a imagem para concluir o cadastro.`);
                }}
                disabled={isSaving || categories.some((category) => category.slug === slugify(categoryName))}
                className="rounded-full theme-border-button px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {categoryName}
              </button>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Resumo da organizacao</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] theme-surface-card p-4">
              <p className="text-sm text-[var(--muted)]">Categorias ativas</p>
              <strong className="mt-2 block text-3xl theme-heading">{activeCategories.length}</strong>
            </div>
            <div className="rounded-[1.5rem] theme-surface-card p-4">
              <p className="text-sm text-[var(--muted)]">Categorias inativas</p>
              <strong className="mt-2 block text-3xl theme-heading">{inactiveCategories.length}</strong>
            </div>
          </div>
          <div className="mt-4 rounded-[1.5rem] theme-surface-card p-4 text-sm leading-6 text-[var(--muted)]">
            {feedback}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Categorias ativas</p>
              <h2 className="mt-2 text-2xl font-semibold theme-heading">Prontas para a vitrine e produtos</h2>
            </div>
            <span className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">{activeCategories.length} ativa(s)</span>
          </div>

          <div className="mt-6 grid gap-3">
            {activeCategories.length ? activeCategories.map((category) => (
              <article key={category.id} className="rounded-[1.5rem] theme-surface-card p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 flex-1 gap-4">
                    <div className="h-28 w-24 shrink-0 overflow-hidden rounded-[1.25rem] border border-[var(--border)] bg-white">
                      {editingCategoryId === category.id
                        ? renderCategoryPreview(editingCategoryPreviewUrl, `Preview de ${category.name}`)
                        : renderCategoryPreview(category.image, category.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      {editingCategoryId === category.id ? (
                        <div className="space-y-2">
                          <input
                            value={editingCategoryName}
                            onChange={(event) => setEditingCategoryName(event.target.value)}
                            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm theme-text outline-none transition focus:border-[var(--accent)]"
                          />
                          <textarea
                            value={editingCategoryDescription}
                            onChange={(event) => setEditingCategoryDescription(event.target.value)}
                            placeholder="Descricao da categoria"
                            rows={3}
                            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm theme-text outline-none transition focus:border-[var(--accent)]"
                          />
                          <label className="grid gap-2 rounded-xl border border-dashed border-[var(--border)] bg-white px-3 py-3 text-sm text-slate-700">
                            <span className="font-medium text-slate-900">Trocar imagem da categoria</span>
                            <input type="file" accept={acceptedImageTypes} onChange={handleEditingImageChange} className="text-sm" />
                          </label>
                        </div>
                      ) : (
                        <>
                          <strong className="block truncate theme-heading">{category.name}</strong>
                          <p className="mt-1 text-sm text-[var(--muted)]">{category.description || "Sem descricao informada."}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">{category.slug}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editingCategoryId === category.id ? (
                      <>
                        <button type="button" onClick={() => void handleSaveEdit(category.id)} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">Salvar</button>
                        <button type="button" onClick={handleCancelEdit} className="rounded-full theme-border-button px-4 py-2 text-sm font-semibold transition">Cancelar</button>
                      </>
                    ) : (
                      <button type="button" onClick={() => handleStartEdit(category)} className="rounded-full theme-border-button px-4 py-2 text-sm font-semibold transition">Editar</button>
                    )}
                    <button type="button" onClick={() => void handleToggleCategory(category)} className="rounded-full theme-border-button px-4 py-2 text-sm font-semibold transition">Desativar</button>
                    <button type="button" onClick={() => void handleDeleteCategory(category)} className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100">Excluir</button>
                  </div>
                </div>
              </article>
            )) : (
              <div className="rounded-[1.5rem] border border-dashed border-[var(--border)] bg-white p-6 text-sm leading-6 text-[var(--muted)]">
                Ainda nao existem categorias ativas para esta loja. Comece com vestidos, calcas, blusas, bermudas ou shorts.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Categorias inativas</p>
              <h2 className="mt-2 text-2xl font-semibold theme-heading">Arquivadas sem perder historico</h2>
            </div>
            <span className="rounded-full theme-border-button px-4 py-2 text-xs font-semibold transition">{inactiveCategories.length} inativa(s)</span>
          </div>

          <div className="mt-6 grid gap-3">
            {inactiveCategories.length ? inactiveCategories.map((category) => (
              <article key={category.id} className="rounded-[1.5rem] theme-surface-card p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-24 w-20 overflow-hidden rounded-[1rem] border border-[var(--border)] bg-white">
                      {renderCategoryPreview(category.image, category.name)}
                    </div>
                    <div>
                      <strong className="theme-heading">{category.name}</strong>
                      <p className="mt-1 text-sm text-[var(--muted)]">{category.description || "Sem descricao informada."}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">{category.slug}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => void handleToggleCategory(category)} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">Ativar novamente</button>
                    <button type="button" onClick={() => void handleDeleteCategory(category)} className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100">Excluir</button>
                  </div>
                </div>
              </article>
            )) : (
              <div className="rounded-[1.5rem] border border-dashed border-[var(--border)] bg-white p-6 text-sm leading-6 text-[var(--muted)]">
                Nenhuma categoria inativa no momento.
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

