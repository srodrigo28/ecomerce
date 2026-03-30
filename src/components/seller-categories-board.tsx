"use client";

import { useMemo, useState } from "react";

import { createSellerCategory, updateSellerCategory } from "@/lib/services/catalog-service";
import type { Category, SellerWorkspace } from "@/types/catalog";

const suggestedCategoryNames = ["Vestidos", "Calcas", "Blusas", "Bermudas", "Shorts", "Camisas"];

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

export function SellerCategoriesBoard({ workspace }: { workspace: SellerWorkspace }) {
  const [categories, setCategories] = useState<Category[]>(workspace.categories);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [feedback, setFeedback] = useState("Cadastre categorias comerciais reais da loja, como vestidos, calcas, blusas, bermudas e shorts.");
  const [isSaving, setIsSaving] = useState(false);

  const activeCategories = useMemo(() => categories.filter((category) => category.active), [categories]);
  const inactiveCategories = useMemo(() => categories.filter((category) => !category.active), [categories]);

  const handleCreateCategory = async (categoryName?: string) => {
    const trimmed = (categoryName ?? newCategoryName).trim();

    if (!trimmed) {
      setFeedback("Digite o nome da categoria da loja para cadastrar.");
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
        slug,
        active: true,
      });

      setCategories((current) => [created, ...current]);
      setNewCategoryName("");
      setFeedback(`Categoria ${trimmed} criada com sucesso para ${workspace.store.name}.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel criar a categoria.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEdit = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const handleSaveEdit = async (categoryId: string) => {
    const trimmed = editingCategoryName.trim();

    if (!trimmed) {
      setFeedback("O nome da categoria nao pode ficar vazio.");
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
      const updated = await updateSellerCategory(categoryId, { name: trimmed, slug });
      setCategories((current) => current.map((category) => (category.id === categoryId ? updated : category)));
      setEditingCategoryId(null);
      setEditingCategoryName("");
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
      const updated = await updateSellerCategory(category.id, { active: !category.active });
      setCategories((current) => current.map((item) => (item.id === category.id ? updated : item)));
      setFeedback(`Categoria ${category.name} ${category.active ? "desativada" : "ativada"} com sucesso.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel atualizar o status da categoria.");
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
              Organize a vitrine por tipos reais de roupa e produto. Isso melhora o cadastro, os links por categoria e a navegacao da loja.
            </p>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <input
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              placeholder="Ex.: Vestidos, Calcas femininas, Blusas, Bermudas"
              className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm theme-text outline-none transition focus:border-[var(--accent)]"
            />
            <button
              type="button"
              onClick={() => void handleCreateCategory()}
              disabled={isSaving}
              className="rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? "Salvando..." : "Cadastrar categoria"}
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {suggestedCategoryNames.map((categoryName) => (
              <button
                key={categoryName}
                type="button"
                onClick={() => void handleCreateCategory(categoryName)}
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
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    {editingCategoryId === category.id ? (
                      <input
                        value={editingCategoryName}
                        onChange={(event) => setEditingCategoryName(event.target.value)}
                        className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm theme-text outline-none transition focus:border-[var(--accent)]"
                      />
                    ) : (
                      <strong className="block truncate theme-heading">{category.name}</strong>
                    )}
                    <p className="mt-1 text-sm text-[var(--muted)]">Slug publico: /{category.slug}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editingCategoryId === category.id ? (
                      <button type="button" onClick={() => void handleSaveEdit(category.id)} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">Salvar</button>
                    ) : (
                      <button type="button" onClick={() => handleStartEdit(category)} className="rounded-full theme-border-button px-4 py-2 text-sm font-semibold transition">Editar</button>
                    )}
                    <button type="button" onClick={() => void handleToggleCategory(category)} className="rounded-full theme-border-button px-4 py-2 text-sm font-semibold transition">Desativar</button>
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
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <strong className="theme-heading">{category.name}</strong>
                    <p className="mt-1 text-sm text-[var(--muted)]">Slug publico: /{category.slug}</p>
                  </div>
                  <button type="button" onClick={() => void handleToggleCategory(category)} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">Ativar novamente</button>
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
