export default function LojaSegmentLoading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 2xl:px-12">
      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="h-4 w-40 rounded-full theme-surface-soft" />
            <div className="h-10 w-full max-w-3xl rounded-2xl theme-surface-soft" />
            <div className="h-16 w-full max-w-2xl rounded-2xl theme-surface-soft" />
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="h-10 w-28 rounded-full theme-surface-soft" />
            <div className="h-10 w-28 rounded-full theme-surface-soft" />
            <div className="h-10 w-36 rounded-full theme-surface-soft" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
            <div className="space-y-4">
              <div className="h-4 w-36 rounded-full theme-surface-soft" />
              <div className="h-8 w-full rounded-2xl theme-surface-soft" />
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-24 rounded-[1.35rem] theme-surface-soft" />
              ))}
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-6">
            <div className="space-y-3">
              <div className="h-4 w-32 rounded-full theme-surface-soft" />
              <div className="h-8 w-80 rounded-2xl theme-surface-soft" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <article key={index} className="overflow-hidden rounded-[1.75rem] theme-surface-card shadow-[var(--shadow-soft)]">
                <div className="aspect-[4/5] theme-surface-soft" />
                <div className="space-y-4 p-4 sm:p-5">
                  <div className="h-4 w-32 rounded-full theme-surface-soft" />
                  <div className="h-6 w-full rounded-xl theme-surface-soft" />
                  <div className="h-16 rounded-xl theme-surface-soft" />
                  <div className="h-8 w-32 rounded-xl theme-surface-soft" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
