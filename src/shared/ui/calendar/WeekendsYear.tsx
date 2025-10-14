// src/ui/calendar/WeekendsYear.tsx
import React, { useMemo, useState } from "react";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { DayDTO } from "@/infrastructure/http/calendar.schemas";
import DayCell from "./DayCell";

type Props = { days?: DayDTO[]; year: number };

type WeekendMode = "SaSu" | "FSu"; // Sáb·Dom o Vie·Sáb·Dom

const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

// offset relativo al lunes (weekStartsOn: 1)
const offsetFromMonday = (dow: number) => (dow + 6) % 7; // 0→6, 1→0, 5→4, 6→5

export default function WeekendsYear({ days = [], year }: Props) {
  const [mode, setMode] = useState<WeekendMode>("SaSu");

  const byDate = useMemo(() => {
    const m = new Map<string, DayDTO>();
    for (const d of days) m.set(d.date,
       d);
    return m;
  }, [days]);

  const selectedCols = mode === "FSu" ? [5, 6, 0] : [6, 0]; // 5=Vie,6=Sáb,0=Dom
  const headerLetters = mode === "FSu" ? ["V", "S", "D"] : ["S", "D"];

  return (
    <div className="space-y-3">
      {/* Toggle de fin de semana */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-600">Mostrar:</span>
        <button
          onClick={() => setMode("SaSu")}
          className={`px-2 py-1 rounded border ${mode === "SaSu" ? "bg-primary text-white" : "bg-white"}`}
        >
          Sáb·Dom
        </button>
        <button
          onClick={() => setMode("FSu")}
          className={`px-2 py-1 rounded border ${mode === "FSu" ? "bg-primary text-white" : "bg-white"}`}
        >
          Vie·Sáb·Dom
        </button>
      </div>

      {/* 3 meses por fila en pantallas grandes, tarjetas amplias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 12 }).map((_, monthIndex) => {
          const pivot = new Date(year, monthIndex, 1);
          const monthStart = startOfMonth(pivot);
          const monthEnd = endOfMonth(pivot);
          const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
          const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

          const rows: React.ReactNode[] = [];

          // Cabecera V/S/D
          rows.push(
            <div key={"hdr"} className={`grid ${mode === "FSu" ? "grid-cols-3" : "grid-cols-2"} gap-2 mb-2`}>
              {headerLetters.map((L) => (
                <div key={L} className="text-center text-[11px] text-slate-500">
                  {L}
                </div>
              ))}
            </div>
          );

          for (let w = gridStart; w <= gridEnd; w = addDays(w, 7)) {
            const weekCells = selectedCols.map((dow) => {
              const c = addDays(w, offsetFromMonday(dow));
              const iso = format(c, "yyyy-MM-dd");
              const dto = byDate.get(iso);
              const today = new Date().toDateString() === c.toDateString();
              // 👇 en lugar de ocultar los fuera de mes, ahora los mostramos atenuados
              // DayCell ya se encarga de pintarlos gris y sin hover/click cuando es outside.
              return (
                <DayCell
                  key={iso}
                  date={c}
                  dto={dto}
                  monthStart={monthStart}
                  today={today}
                  size="compact"
                />
              );
            });

            rows.push(
              <div key={w.toISOString()} className={`grid ${mode === "FSu" ? "grid-cols-3" : "grid-cols-2"} gap-2`}>
                {weekCells}
              </div>
            );
          }

          return (
            <div key={monthIndex} className="border rounded-2xl p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold">
                  {MONTHS[monthIndex]} {year}
                </h3>
                <div className="text-[11px] text-gray-500">
                  {mode === "FSu" ? "Vie·Sáb·Dom" : "Sáb·Dom"}
                </div>
              </div>
              <div className="space-y-1">{rows}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
