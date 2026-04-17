import type { ReactNode } from "react";

export function Modal({
  children,
  onClose,
  title,
  description,
}: {
  children: ReactNode;
  onClose: () => void;
  title: string;
  description?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/45 px-3 pt-24 pb-4 sm:px-4 sm:pt-28 sm:pb-6 xl:px-8 xl:pt-32 xl:pb-8">
      <div className="max-h-[92vh] w-full max-w-[1480px] overflow-y-auto rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] sm:p-6 xl:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Modal comercial</p>
            <h2 className="mt-2 text-2xl font-semibold theme-heading sm:text-3xl">{title}</h2>
            {description ? <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="rounded-full theme-border-button px-4 py-2 text-sm font-semibold transition">
            Fechar
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
