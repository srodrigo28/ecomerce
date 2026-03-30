"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "hierarquia-theme";

const themes = [
  {
    id: "light",
    label: "Light",
    description: "Claro, limpo e versatil.",
    colors: ["#2563eb", "#f59e0b", "#fbfdff"],
  },
  {
    id: "dark",
    label: "Dark",
    description: "Mais noturno e com alto contraste.",
    colors: ["#38bdf8", "#f59e0b", "#08111d"],
  },
  {
    id: "areia",
    label: "Areia",
    description: "Neutro quente com toque editorial.",
    colors: ["#0f766e", "#f59e0b", "#fffaf4"],
  },
  {
    id: "grafite",
    label: "Grafite",
    description: "Mais corporativo e sofisticado.",
    colors: ["#4f46e5", "#14b8a6", "#f8fafc"],
  },
] as const;

type ThemeId = (typeof themes)[number]["id"];

const isThemeId = (value: string | null): value is ThemeId => themes.some((theme) => theme.id === value);

const getInitialTheme = (): ThemeId => {
  if (typeof window === "undefined") {
    return "light";
  }

  const savedTheme = window.localStorage.getItem(STORAGE_KEY);
  return isThemeId(savedTheme) ? savedTheme : "light";
};

const applyTheme = (theme: ThemeId) => {
  if (typeof document === "undefined") return;

  document.documentElement.setAttribute("data-theme", theme);
};

export function ThemeSwitcher() {
  const [activeTheme, setActiveTheme] = useState<ThemeId>(getInitialTheme);

  useEffect(() => {
    applyTheme(activeTheme);
  }, [activeTheme]);

  const handleThemeChange = (theme: ThemeId) => {
    setActiveTheme(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 w-[min(92vw,22rem)] theme-card rounded-[1.75rem] p-4 sm:bottom-6 sm:left-6 sm:p-5" suppressHydrationWarning>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Tema da interface</p>
          <h2 className="mt-2 text-lg font-semibold theme-text">Escolha a paleta</h2>
          <p className="mt-1 text-sm leading-6 theme-muted">A troca vale para todo o app e fica salva neste navegador.</p>
        </div>
        <div className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent-strong)]" suppressHydrationWarning>
          {themes.find((theme) => theme.id === activeTheme)?.label}
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {themes.map((theme) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => handleThemeChange(theme.id)}
            className="theme-chip rounded-[1.25rem] px-4 py-3 text-left"
            data-active={activeTheme === theme.id}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{theme.label}</p>
                <p className="mt-1 text-xs leading-5 theme-muted">{theme.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {theme.colors.map((color) => (
                  <span key={color} className="theme-swatch h-5 w-5 rounded-full" style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
