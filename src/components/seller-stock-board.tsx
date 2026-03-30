"use client";

import { useMemo, useState } from "react";

import type { SellerWorkspace, StockMovement } from "@/types/catalog";

const movementTypeLabels = {
  entrada: "Entrada",
  saida: "Saida",
  ajuste: "Ajuste",
};

const movementSourceLabels = {
  manual: "Manual",
  pedido: "Pedido",
  reposicao: "Reposicao",
  cancelamento: "Cancelamento",
};

const movementTypeClass = {
  entrada: "theme-badge-success",
  saida: "theme-badge-danger",
  ajuste: "theme-badge-warning",
};

export function SellerStockBoard({ workspace }: { workspace: SellerWorkspace }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [selectedMovementType, setSelectedMovementType] = useState<string>("all");

  const filteredProducts = useMemo(() => {
    if (selectedCategoryId === "all") {
      return workspace.products;
    }

    return workspace.products.filter((product) => product.categoryId === selectedCategoryId);
  }, [selectedCategoryId, workspace.products]);

  const filteredProductIds = useMemo(() => new Set(filteredProducts.map((product) => product.id)), [filteredProducts]);

  const filteredMovements = useMemo(() => {
    const byProduct = workspace.stockMovements.filter((movement) => filteredProductIds.has(movement.productId));

    if (selectedMovementType === "all") {
      return byProduct;
    }

    return byProduct.filter((movement) => movement.type === selectedMovementType);
  }, [filteredProductIds, selectedMovementType, workspace.stockMovements]);

  const summary = useMemo(() => {
    const lowStock = filteredProducts.filter((product) => product.stock <= (product.minStock ?? 0)).length;
    const outOfStock = filteredProducts.filter((product) => product.stock <= 0).length;
    const totalUnits = filteredProducts.reduce((sum, product) => sum + product.stock, 0);

    return {
      lowStock,
      outOfStock,
      totalUnits,
    };
  }, [filteredProducts]);

  const getProductName = (productId: string) =>
    workspace.products.find((product) => product.id === productId)?.name ?? "Produto nao encontrado";

  const getCategoryName = (categoryId: string) =>
    workspace.categories.find((category) => category.id === categoryId)?.name ?? "Categoria";

  const getStockHealth = (stock: number, minStock?: number) => {
    if (stock <= 0) {
      return {
        label: "Sem estoque",
        className: "theme-badge-danger",
      };
    }

    if (stock <= (minStock ?? 0)) {
      return {
        label: "Estoque baixo",
        className: "theme-badge-warning",
      };
    }

    return {
      label: "Saudavel",
      className: "theme-badge-success",
    };
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-[1.75rem] theme-surface-card p-5 shadow-[var(--shadow)]">
          <p className="text-sm text-[var(--muted)]">Produtos visiveis</p>
          <strong className="mt-2 block text-3xl theme-heading">{filteredProducts.length}</strong>
        </article>
        <article className="rounded-[1.75rem] theme-surface-card p-5 shadow-[var(--shadow)]">
          <p className="text-sm text-[var(--muted)]">Estoque baixo</p>
          <strong className="mt-2 block text-3xl theme-heading">{summary.lowStock}</strong>
        </article>
        <article className="rounded-[1.75rem] theme-surface-card p-5 shadow-[var(--shadow)]">
          <p className="text-sm text-[var(--muted)]">Sem estoque</p>
          <strong className="mt-2 block text-3xl theme-heading">{summary.outOfStock}</strong>
        </article>
        <article className="rounded-[1.75rem] theme-surface-card p-5 shadow-[var(--shadow)]">
          <p className="text-sm text-[var(--muted)]">Unidades visiveis</p>
          <strong className="mt-2 block text-3xl theme-heading">{summary.totalUnits}</strong>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Filtros de estoque</p>
              <h2 className="mt-2 text-2xl font-semibold theme-heading">Produtos e movimentacoes</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Filtre por categoria e tipo de movimento para acompanhar risco de ruptura e historico operacional.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium theme-text">Categoria</span>
              <select value={selectedCategoryId} onChange={(event) => setSelectedCategoryId(event.target.value)} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm theme-text outline-none transition focus:border-[var(--accent)]">
                <option value="all">Todas as categorias</option>
                {workspace.categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium theme-text">Tipo de movimento</span>
              <select value={selectedMovementType} onChange={(event) => setSelectedMovementType(event.target.value)} className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm theme-text outline-none transition focus:border-[var(--accent)]">
                <option value="all">Todos os movimentos</option>
                <option value="entrada">Entrada</option>
                <option value="saida">Saida</option>
                <option value="ajuste">Ajuste</option>
              </select>
            </label>
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Contexto da operacao</p>
          <div className="mt-4 rounded-[1.5rem] theme-surface-card p-4 text-sm leading-6 text-[var(--muted)]">
            <p>Loja: <span className="font-medium theme-text">{workspace.store.name}</span></p>
            <p>Alertas criticos atuais: <span className="font-medium theme-text">{workspace.stats.lowStockProducts}</span></p>
            <p>Movimentacoes mockadas: <span className="font-medium theme-text">{workspace.stockMovements.length}</span></p>
          </div>
        </article>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Leitura por produto</p>
            <h2 className="mt-2 text-2xl font-semibold theme-heading">Estado atual do estoque</h2>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => {
            const health = getStockHealth(product.stock, product.minStock);

            return (
              <article key={product.id} className="rounded-[1.75rem] theme-surface-card p-5 shadow-[var(--shadow)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold theme-heading">{product.name}</h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">{getCategoryName(product.categoryId)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${health.className}`}>{health.label}</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl theme-surface-soft px-3 py-3 text-sm">
                    <p className="text-[var(--muted)]">Atual</p>
                    <strong className="mt-1 block theme-heading">{product.stock}</strong>
                  </div>
                  <div className="rounded-2xl theme-surface-soft px-3 py-3 text-sm">
                    <p className="text-[var(--muted)]">Minimo</p>
                    <strong className="mt-1 block theme-heading">{product.minStock ?? 0}</strong>
                  </div>
                  <div className="rounded-2xl theme-surface-soft px-3 py-3 text-sm">
                    <p className="text-[var(--muted)]">SKU visual</p>
                    <strong className="mt-1 block theme-heading">{product.slug}</strong>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {filteredProducts.length === 0 ? (
          <article className="rounded-[2rem] border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-[var(--shadow)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Nenhum produto</p>
            <h2 className="mt-3 text-2xl font-semibold theme-heading">Nao ha produtos nesse recorte.</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Ajuste os filtros para voltar a enxergar os produtos mockados da loja e validar cenarios de estoque.
            </p>
          </article>
        ) : null}
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Historico de movimentacoes</p>
          <h2 className="mt-2 text-2xl font-semibold theme-heading">Tabela operacional</h2>
        </div>

        <div className="overflow-hidden rounded-[2rem] theme-surface-card shadow-[var(--shadow)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="theme-surface-soft theme-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Data</th>
                  <th className="px-4 py-3 font-semibold">Produto</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold">Origem</th>
                  <th className="px-4 py-3 font-semibold">Quantidade</th>
                  <th className="px-4 py-3 font-semibold">Saldo</th>
                  <th className="px-4 py-3 font-semibold">Observacao</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map((movement: StockMovement) => (
                  <tr key={movement.id} className="border-t border-[var(--border)] theme-text">
                    <td className="px-4 py-3">{new Date(movement.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-3 font-medium theme-heading">{getProductName(movement.productId)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${movementTypeClass[movement.type]}`}>
                        {movementTypeLabels[movement.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3">{movementSourceLabels[movement.source]}</td>
                    <td className="px-4 py-3">{movement.quantity}</td>
                    <td className="px-4 py-3">{movement.previousStock}{" -> "}{movement.currentStock}</td>
                    <td className="px-4 py-3">{movement.note ?? "Sem observacao"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredMovements.length === 0 ? (
          <article className="rounded-[2rem] border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-[var(--shadow)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Nenhuma movimentacao</p>
            <h2 className="mt-3 text-2xl font-semibold theme-heading">Nao encontramos movimentacoes para esse filtro.</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Troque o filtro de movimento ou categoria para revisar outras operacoes mockadas do estoque.
            </p>
          </article>
        ) : null}
      </section>
    </div>
  );
}

