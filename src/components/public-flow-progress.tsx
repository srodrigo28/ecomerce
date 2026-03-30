import Link from "next/link";

const stepLabels = {
  loja: "Loja",
  produto: "Produto",
  carrinho: "Carrinho",
  checkout: "Checkout",
  confirmado: "Confirmado",
} as const;

type FlowStep = keyof typeof stepLabels;

const orderedSteps: FlowStep[] = ["loja", "produto", "carrinho", "checkout", "confirmado"];

interface PublicFlowProgressProps {
  currentStep: FlowStep;
  storeSlug: string;
  productSlug?: string;
}

export function PublicFlowProgress({ currentStep, storeSlug, productSlug }: PublicFlowProgressProps) {
  const currentIndex = orderedSteps.indexOf(currentStep);
  const productHref = productSlug ? `/lojas/${storeSlug}/produtos/${productSlug}` : `/lojas/${storeSlug}`;

  const hrefMap: Record<FlowStep, string> = {
    loja: `/lojas/${storeSlug}`,
    produto: productHref,
    carrinho: productSlug ? `/lojas/${storeSlug}/carrinho?product=${productSlug}&quantity=1` : `/lojas/${storeSlug}/carrinho`,
    checkout: productSlug ? `/lojas/${storeSlug}/checkout?product=${productSlug}&quantity=1` : `/lojas/${storeSlug}/checkout`,
    confirmado: productSlug ? `/lojas/${storeSlug}/pedido-confirmado?product=${productSlug}&quantity=1` : `/lojas/${storeSlug}/pedido-confirmado`,
  };

  return (
    <section className="rounded-[2rem] border border-[var(--border)] bg-[rgba(255,252,247,0.82)] p-4 shadow-[var(--shadow)] backdrop-blur sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">Jornada publica</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            O cliente consegue entender em que etapa esta e qual sera o proximo passo do fluxo.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-5 lg:min-w-[720px]">
          {orderedSteps.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = step === currentStep;
            const isAccessible = index <= currentIndex;
            const baseClass = isCurrent
              ? "border-[var(--accent)] bg-[rgba(15,118,110,0.12)] text-[var(--accent-strong)]"
              : isCompleted
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-[var(--border)] bg-white text-slate-500";

            const content = (
              <div className={`rounded-[1.25rem] border px-4 py-3 transition ${baseClass}`}>
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-xs font-semibold text-slate-900">
                    0{index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{stepLabels[step]}</p>
                    <p className="text-xs">{isCurrent ? "Etapa atual" : isCompleted ? "Concluida" : "Proxima"}</p>
                  </div>
                </div>
              </div>
            );

            if (!isAccessible) {
              return <div key={step}>{content}</div>;
            }

            return (
              <Link key={step} href={hrefMap[step]} className="block">
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
