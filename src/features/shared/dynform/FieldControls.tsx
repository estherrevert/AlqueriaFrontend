import React from "react";
import type { FieldDef } from "./types";

type Props = { field: FieldDef; value: any; onChange: (name: string, value: any) => void; };

export default function FieldControl({ field, value, onChange }: Props) {
  const base = "px-3 py-2 rounded-md border border-gray-300";
  const onVal = (val: any) => onChange(field.name, val);

  switch (field.type) {
    case "textarea":
      return <textarea id={field.name} name={field.name} placeholder={field.placeholder} className={base}
                       rows={3} value={value ?? ""} onChange={(e) => onVal(e.target.value)} />;
    case "select":
      return (
        <select id={field.name} name={field.name} className={base}
                value={value ?? ""} onChange={(e) => onVal(e.target.value)}>
          <option value="">—</option>
          {field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    case "time":
      return <input type="time" id={field.name} name={field.name} className={base}
                    value={value ?? ""} onChange={(e) => onVal(e.target.value)} />;
    case "number":
      return <input type="number" inputMode="numeric" id={field.name} name={field.name} className={base}
                    value={value ?? ""} onChange={(e) => onVal(e.target.value)} />;
    case "phone":
      return <input type="tel" id={field.name} name={field.name} className={base}
                    value={value ?? ""} onChange={(e) => onVal(e.target.value)} />;
    case "checkbox":
      return <input type="checkbox" id={field.name} name={field.name} className="h-4 w-4"
                    checked={!!value} onChange={(e) => onVal(e.target.checked)} />;
    default:
      return <input type="text" id={field.name} name={field.name} placeholder={field.placeholder} className={base}
                    value={value ?? ""} onChange={(e) => onVal(e.target.value)} />;
  }
}
