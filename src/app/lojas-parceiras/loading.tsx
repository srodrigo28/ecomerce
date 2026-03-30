export default function LojasParceirasLoading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--dark-panel)] p-6 text-white shadow-[var(--shadow)] lg:p-8">
        <div className="space-y-4">
          <div className="h-4 w-40 rounded-full bg-white/10" />
          <div className="h-12 w-full max-w-4xl rounded-2xl bg-white/10" />
          <div className="h-20 w-full max-w-3xl rounded-2xl bg-white/10" />
        </div>
      </section>

      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)] lg:items-end">
          <div className="space-y-4">
            <div className="h-4 w-52 rounded-full theme-surface-soft" />
            <div className="h-12 w-full rounded-2xl theme-surface-soft" />
            <div className="grid gap-3 md:grid-cols-2">
              <div className="h-12 rounded-2xl theme-surface-soft" />
              <div className="h-12 rounded-2xl theme-surface-soft" />
            </div>
          </div>
          <div className="h-32 rounded-[1.75rem] theme-surface-soft" />
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <article key={index} className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
            <div className="aspect-[4/3] theme-surface-soft" />
            <div className="space-y-4 p-5">
              <div className="h-6 w-2/3 rounded-xl theme-surface-soft" />
              <div className="h-4 w-1/2 rounded-xl theme-surface-soft" />
              <div className="h-24 rounded-[1.5rem] theme-surface-soft" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="h-11 rounded-full theme-surface-soft" />
                <div className="h-11 rounded-full theme-surface-soft" />
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
