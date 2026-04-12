"use client";

import { useMemo, useState } from "react";

import { Modal } from "@/components/ui-modal";

type CalendarEvent = {
  date: string;
  label: string;
  type: "cobranca" | "entrega" | "agenda";
};

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const demoEvents: CalendarEvent[] = [
  { date: "2026-04-08", label: "Cobranca recorrente", type: "cobranca" },
  { date: "2026-04-12", label: "Entrega importante", type: "entrega" },
  { date: "2026-04-19", label: "Reuniao comercial", type: "agenda" },
  { date: "2026-04-24", label: "Fechamento mensal", type: "cobranca" },
];

const eventBadgeStyles: Record<CalendarEvent["type"], string> = {
  cobranca: "bg-amber-100 text-amber-700",
  entrega: "bg-sky-100 text-sky-700",
  agenda: "bg-emerald-100 text-emerald-700",
};

const eventDayStyles: Record<CalendarEvent["type"], string> = {
  cobranca: "bg-amber-50 text-amber-700 border-amber-200",
  entrega: "bg-sky-50 text-sky-700 border-sky-200",
  agenda: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function AdminEventCalendar() {
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const leadingDays = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const cells: Array<{ date: Date; inMonth: boolean }> = [];

    for (let index = leadingDays - 1; index >= 0; index -= 1) {
      cells.push({
        date: new Date(year, month, -index),
        inMonth: false,
      });
    }

    for (let day = 1; day <= totalDays; day += 1) {
      cells.push({
        date: new Date(year, month, day),
        inMonth: true,
      });
    }

    while (cells.length % 7 !== 0) {
      const nextDay = cells.length - totalDays - leadingDays + 1;
      cells.push({
        date: new Date(year, month + 1, nextDay),
        inMonth: false,
      });
    }

    return cells;
  }, [viewDate]);

  const currentMonthEvents = useMemo(() => {
    const monthKey = `${viewDate.getFullYear()}-${`${viewDate.getMonth() + 1}`.padStart(2, "0")}`;
    return demoEvents.filter((event) => event.date.startsWith(monthKey));
  }, [viewDate]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDateKey) {
      return [];
    }

    return demoEvents.filter((event) => event.date === selectedDateKey);
  }, [selectedDateKey]);

  const todayKey = toDateKey(new Date());

  return (
    <>
      <aside className="rounded-[1.75rem] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] p-5 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Agenda operacional</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Calendario de eventos</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white text-lg font-semibold text-slate-700 transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
              aria-label="Mes anterior"
            >
              {"<"}
            </button>
            <button
              type="button"
              onClick={() => setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white text-lg font-semibold text-slate-700 transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
              aria-label="Proximo mes"
            >
              {">"}
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <strong className="text-base font-semibold capitalize text-slate-900">{monthFormatter.format(viewDate)}</strong>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {currentMonthEvents.length} evento(s)
            </span>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2">
            {weekDays.map((day) => (
              <span key={day} className="text-center text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                {day}
              </span>
            ))}

            {calendarDays.map(({ date, inMonth }) => {
              const dateKey = toDateKey(date);
              const events = demoEvents.filter((event) => event.date === dateKey);
              const isToday = dateKey === todayKey;
              const primaryEvent = events[0];
              const hasEvents = Boolean(primaryEvent);

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => setSelectedDateKey(dateKey)}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold transition ${
                    inMonth
                      ? hasEvents
                        ? `${eventDayStyles[primaryEvent.type]} shadow-sm`
                        : isToday
                          ? "border-[var(--accent)] bg-[rgba(37,99,235,0.08)] text-[var(--accent-strong)]"
                          : "border-slate-200 bg-slate-50 text-slate-900 hover:border-[var(--accent)]"
                      : "border-transparent bg-slate-50/40 text-slate-300"
                  }`}
                  aria-label={`Abrir eventos do dia ${date.getDate()}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-2xl bg-amber-50 px-3 py-3 text-xs font-semibold text-amber-700">Cobrancas</div>
          <div className="rounded-2xl bg-sky-50 px-3 py-3 text-xs font-semibold text-sky-700">Entregas</div>
          <div className="rounded-2xl bg-emerald-50 px-3 py-3 text-xs font-semibold text-emerald-700">Eventos internos</div>
        </div>
      </aside>

      {selectedDateKey ? (
        <Modal
          title={`Eventos de ${dateFormatter.format(new Date(`${selectedDateKey}T12:00:00`))}`}
          description="Este modal ja deixa a base pronta para evoluirmos depois com cobrancas, entregas e compromissos importantes do cliente."
          onClose={() => setSelectedDateKey(null)}
        >
          <div className="mt-6 grid gap-3">
            {selectedDateEvents.length > 0 ? (
              selectedDateEvents.map((event) => (
                <article key={`${event.date}-${event.label}`} className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${eventBadgeStyles[event.type]}`}>
                      {event.type}
                    </span>
                    <strong className="text-base text-slate-900">{event.label}</strong>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-[var(--border)] bg-slate-50 p-4 text-sm leading-6 text-[var(--muted)]">
                Nenhum evento cadastrado para este dia ainda.
              </div>
            )}
          </div>
        </Modal>
      ) : null}
    </>
  );
}
