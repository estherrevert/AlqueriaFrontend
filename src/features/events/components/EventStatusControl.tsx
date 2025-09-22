import React, { useEffect, useMemo, useRef, useState } from "react";
import type { EventStatus } from "@/domain/events/types";
import { makeEventsUseCases } from "@/application/events/usecases";
import { EventsHttpGateway } from "@/infrastructure/http/events.gateway";

type Props = {
  eventId: number;
  status: EventStatus;
  onChanged?: (nextStatus: EventStatus) => void;
  disabled?: boolean;
  className?: string;
};

const uc = makeEventsUseCases(EventsHttpGateway);

const LABEL: Record<EventStatus, string> = {
  confirmed: "Confirmado",
  reserved: "Reservado",
  cancelled: "Cancelado",
};

const PILL_STYLE: Record<EventStatus, string> = {
  confirmed:
    "bg-green-100 text-green-800 ring-1 ring-green-200 hover:ring-2 hover:ring-green-300",
  reserved:
    "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200 hover:ring-2 hover:ring-yellow-300",
  cancelled:
    "bg-red-100 text-red-800 ring-1 ring-red-200 hover:ring-2 hover:ring-red-300",
};

const ALL: EventStatus[] = ["confirmed", "reserved", "cancelled"];

export default function EventStatusControl({
  eventId,
  status,
  onChanged,
  disabled,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [current, setCurrent] = useState<EventStatus>(status);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => setCurrent(status), [status]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const pillCls = useMemo(
    () =>
      `inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition 
       ${PILL_STYLE[current]} ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${className}`,
    [current, disabled, className]
  );

  async function handleSelect(next: EventStatus) {
    if (next === current) {
      setOpen(false);
      return;
    }
    try {
      setSaving(true);
      const updated = await uc.changeStatus(eventId, next);
      const updatedStatus = updated.status as EventStatus;
      setCurrent(updatedStatus);
      onChanged?.(updatedStatus);
    } catch (err) {
      console.error(err);
      alert("No se pudo cambiar el estado. Revisa la consola o la pestaña Network.");
    } finally {
      setSaving(false);
      setOpen(false);
    }
  }

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        disabled={disabled || saving}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && !saving && setOpen((v) => !v)}
        className={pillCls}
        title="Cambiar estado"
      >
        <span className="inline-block h-2 w-2 rounded-full bg-current opacity-70" />
        <span>{LABEL[current]}</span>
        <svg
          className={`h-4 w-4 transition ${open ? "rotate-180" : "rotate-0"}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-20 mt-2 min-w-[12rem] overflow-hidden rounded-xl border border-[var(--color-beige)] bg-white shadow-xl"
        >
          {ALL.map((opt) => (
            <button
              key={opt}
              role="option"
              aria-selected={opt === current}
              onClick={() => handleSelect(opt)}
              className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-[var(--color-alt-bg)] 
              ${opt === current ? "bg-[var(--color-bg-main)]" : ""}`}
            >
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${
                  opt === "confirmed"
                    ? "bg-green-500"
                    : opt === "reserved"
                    ? "bg-yellow-400"
                    : "bg-red-500"
                }`}
              />
              <span className="flex-1">{LABEL[opt]}</span>
              {opt === current && (
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.408 0l-3.5-3.5a1 1 0 111.408-1.42L8.5 11.59l6.796-6.8a1 1 0 011.408 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
