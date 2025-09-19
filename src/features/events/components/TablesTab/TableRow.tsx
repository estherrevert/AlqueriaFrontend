import React from "react";
import type { SeatingTable } from "@/domain/seating/types";

type Props = {
  value: SeatingTable;
  onChange: (patch: Partial<SeatingTable>) => void;
  onDelete: () => Promise<void>;
  isDirty?: boolean;
  duplicateNumber?: boolean;
};

export default function TableRow({ value, onChange, onDelete, isDirty, duplicateNumber }: Props) {
  const clampNonNeg = (n: number) => (Number.isNaN(n) || n < 0 ? 0 : n);

  const total =
    (value.adults ?? 0) +
    (value.children ?? 0) +
    (value.staff ?? 0) +
    (value.no_menu ?? 0);

  return (
    <tr className="odd:bg-white even:bg-gray-50">
      <td className="px-2 py-1 text-center">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!value.is_main_table}
            onChange={(e) => onChange({ is_main_table: e.target.checked })}
          />
          <span className="text-xs text-gray-600">MP</span>
        </label>
      </td>

      <td className="px-2 py-1">
        <div className="flex flex-col">
          <input
            type="number"
            inputMode="numeric"
            pattern="\d*"
            min={1}
            step={1}
            className="w-24 px-2 py-1 border rounded-md"
            placeholder="nº"
            value={value.table_number ?? ""}
            onChange={(e) => {
              const raw = e.target.value ?? "";
              const digits = raw.replace(/\D+/g, "");   // fuerza solo dígitos
              onChange({ table_number: digits === "" ? "" : digits });
            }}
          />
          {duplicateNumber && (
            <span className="text-[11px] text-red-600 mt-1">Número de mesa duplicado</span>
          )}
        </div>
      </td>

      <td className="px-2 py-1 text-right font-medium">{total}</td>

      <td className="px-2 py-1">
        <input
          className="w-20 text-right px-2 py-1 border rounded-md"
          type="number"
          min={0}
          value={value.adults ?? 0}
          onChange={(e) => onChange({ adults: clampNonNeg(Number(e.target.value)) })}
        />
      </td>

      <td className="px-2 py-1">
        <input
          className="w-20 text-right px-2 py-1 border rounded-md"
          type="number"
          min={0}
          value={value.staff ?? 0}
          onChange={(e) => onChange({ staff: clampNonNeg(Number(e.target.value)) })}
        />
      </td>

      <td className="px-2 py-1">
        <input
          className="w-20 text-right px-2 py-1 border rounded-md"
          type="number"
          min={0}
          value={value.children ?? 0}
          onChange={(e) => onChange({ children: clampNonNeg(Number(e.target.value)) })}
        />
      </td>

      <td className="px-2 py-1">
        <input
          className="w-20 text-right px-2 py-1 border rounded-md"
          type="number"
          min={0}
          value={value.no_menu ?? 0}
          onChange={(e) => onChange({ no_menu: clampNonNeg(Number(e.target.value)) })}
        />
      </td>

      <td className="px-2 py-1">
        <input
          className="w-full px-2 py-1 border rounded-md"
          placeholder="Observaciones"
          value={value.notes ?? ""}
          onChange={(e) => onChange({ notes: e.target.value })}
        />
      </td>

      <td className="px-2 py-1 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <button
            onClick={onDelete}
            className="px-2 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
          >
            Eliminar
          </button>
          {isDirty && (
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 border border-yellow-200">
              Cambios sin guardar
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}
