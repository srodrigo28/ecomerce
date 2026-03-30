export default function SellerSegmentLoading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10 2xl:px-12">
      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-8 lg:p-10">
        <div className="space-y-4">
          <div className="h-4 w-36 rounded-full theme-surface-soft" />
          <div className="h-12 w-full max-w-4xl rounded-2xl theme-surface-soft" />
          <div className="h-20 w-full max-w-3xl rounded-2xl theme-surface-soft" />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
          <div className="space-y-4">
            <div className="h-4 w-40 rounded-full theme-surface-soft" />
            <div className="h-8 w-64 rounded-2xl theme-surface-soft" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-12 rounded-2xl theme-surface-soft" />
              <div className="h-12 rounded-2xl theme-surface-soft" />
            </div>
          </div>
        </div>
        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
          <div className="space-y-4">
            <div className="h-4 w-44 rounded-full theme-surface-soft" />
            <div className="h-24 rounded-[1.5rem] theme-surface-soft" />
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="h-20 rounded-[1.5rem] theme-surface-soft" />
              <div className="h-20 rounded-[1.5rem] theme-surface-soft" />
              <div className="h-20 rounded-[1.5rem] theme-surface-soft" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
