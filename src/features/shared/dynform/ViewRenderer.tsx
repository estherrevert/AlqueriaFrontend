import React from "react";
import type { FormSchema } from "./types";

export default function ViewRenderer({ schema, values }: { schema: FormSchema; values: Record<string, any> }) {
  return (
    <div className="space-y-6">
      {schema.map(sec => (
        <section key={sec.key} className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">{sec.title}</h4>
          <div className="divide-y divide-gray-100">
            {sec.fields.map(f => (
              <div key={f.name} className="py-2 flex justify-between gap-6">
                <span className="text-sm text-gray-500">{f.label}</span>
                <span className="text-sm font-medium">{format(values[f.name])}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function format(v: any) {
  if (v === true) return "Sí";
  if (v === false) return "No";
  return v ?? "—";
}
