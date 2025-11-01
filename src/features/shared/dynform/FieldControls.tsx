import React from "react";
import type { FieldDef } from "./types";

type Props = {
  field: FieldDef;
  value: unknown;
  onChange: (name: string, value: unknown) => void;
};

export default function FieldControl({ field, value, onChange }: Props) {
  const base =
    "px-3 py-2 rounded-xl border border-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-neutral-300";
  const onVal = (val: unknown) => onChange(field.name, val);

  switch (field.type) {
    case "textarea":
      return (
        <textarea
          id={field.name}
          name={field.name}
          placeholder={field.placeholder}
          className={base}
          rows={3}
          value={(value as string | number | readonly string[]) ?? ""}
          onChange={(e) => onVal(e.target.value)}
        />
      );
    case "select":
      return (
        <select
          id={field.name}
          name={field.name}
          className={base}
          value={(value as string | number | readonly string[]) ?? ""}
          onChange={(e) => onVal(e.target.value)}
        >
          <option value="">—</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case "time":
      return (
        <input
          type="time"
          id={field.name}
          name={field.name}
          className={base}
          value={(value as string | number | readonly string[]) ?? ""}
          onChange={(e) => onVal(e.target.value)}
        />
      );
    case "date":
      return (
        <input
          type="date"
          id={field.name}
          name={field.name}
          className={base}
          value={(value as string | number | readonly string[]) ?? ""}
          onChange={(e) => onVal(e.target.value)}
        />
      );
    case "number":
      return (
        <input
          type="number"
          inputMode="numeric"
          id={field.name}
          name={field.name}
          className={base}
          value={(value as string | number | readonly string[]) ?? ""}
          onChange={(e) => onVal(e.target.value)}
        />
      );
    case "phone":
      return (
        <input
          type="tel"
          id={field.name}
          name={field.name}
          className={base}
          value={(value as string | number | readonly string[]) ?? ""}
          onChange={(e) => onVal(e.target.value)}
        />
      );
    case "checkbox":
      return (
        <input
          type="checkbox"
          id={field.name}
          name={field.name}
          className="h-4 w-4"
          checked={!!value}
          onChange={(e) => onVal(e.target.checked)}
        />
      );
    default:
      return (
        <input
          type="text"
          id={field.name}
          name={field.name}
          placeholder={field.placeholder}
          className={base}
          value={(value as string | number | readonly string[]) ?? ""}
          onChange={(e) => onVal(e.target.value)}
        />
      );
  }
}
