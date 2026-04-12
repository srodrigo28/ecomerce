"use client";

import { useEffect, useState } from "react";
import { FiArrowRight } from "react-icons/fi";

const heroSlides = [
  {
    eyebrow: "Operacao central",
    title: "Acompanhe cobrancas, entregas e a agenda comercial em um unico lugar.",
    description: "Uma leitura visual para a equipe entender rapidamente o que precisa de atencao primeiro.",
    tone: "from-white via-[#f8fbff] to-[#eef6ff]",
    glow: "bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.12),transparent_35%)]",
    chip: "bg-sky-100 text-sky-700",
  },
  {
    eyebrow: "Rotina do cliente",
    title: "Organize vencimentos, eventos e entregas importantes sem perder contexto.",
    description: "O calendario cresce com a operacao e prepara a base para lembretes e acoes futuras.",
    tone: "from-white via-[#f9fcff] to-[#effaf7]",
    glow: "bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.12),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_35%)]",
    chip: "bg-emerald-100 text-emerald-700",
  },
  {
    eyebrow: "Visao executiva",
    title: "Transforme a area administrativa em um painel mais vivo, visual e operacional.",
    description: "Slides e agenda ajudam a ocupar o hero com informacao util e mais presenca visual.",
    tone: "from-white via-[#fffdf7] to-[#fff7ed]",
    glow: "bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.10),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.14),transparent_30%)]",
    chip: "bg-amber-100 text-amber-700",
  },
];

export function AdminHeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroSlides.length);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, []);

  const activeSlide = heroSlides[activeIndex];

  return (
    <div className="mt-8">
      <div className={`relative overflow-hidden rounded-[1.9rem] border border-[var(--border)] bg-gradient-to-br ${activeSlide.tone} p-6 text-slate-900 shadow-[0_24px_60px_rgba(15,23,42,0.10)]`}>
        <div className={`pointer-events-none absolute inset-0 ${activeSlide.glow}`} />

        <button
          type="button"
          onClick={() => setActiveIndex((current) => (current + 1) % heroSlides.length)}
          className="absolute right-6 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)] transition hover:bg-[var(--accent-strong)]"
          aria-label="Proximo slide"
        >
          <FiArrowRight className="text-lg" />
        </button>

        <div className="relative flex flex-col gap-5 pr-16">
          <div className="space-y-4">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${activeSlide.chip}`}>
              {activeSlide.eyebrow}
            </span>
            <h2 className="max-w-3xl text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl">
              {activeSlide.title}
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              {activeSlide.description}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {heroSlides.map((slide, index) => {
          const active = index === activeIndex;

          return (
            <button
              key={slide.title}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 rounded-full transition ${active ? "w-8 bg-[var(--accent)]" : "w-2.5 bg-slate-300 hover:bg-slate-400"}`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}
