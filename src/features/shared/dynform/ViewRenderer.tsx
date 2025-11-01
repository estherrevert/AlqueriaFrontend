import React from "react";
import type { FormSchema } from "./types";

export default function ViewRenderer({
  schema,
  values,
}: {
  schema: FormSchema;
  values: Record<string, unknown>;
}) {
  return (
    <div className="space-y-6">
      {schema.map((sec) => (
        <section
          key={sec.key}
          className="bg-neutral-50 rounded-2xl border border-neutral-200 p-4 space-y-2"
        >
          <h4 className="text-base font-semibold text-text-main flex items-center gap-2">
            {sec.icon && <span key="icon">{sec.icon}</span>}
            {sec.title}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {sec.fields.map((f) => (
              <div key={f.name} className="flex flex-col gap-1">
                <span className="label">{f.label}</span>
                <span className="text-sm text-text-main">
                  {format(values[f.name])}
                </span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function format(v: unknown): React.ReactNode {
  if (v === true) return "Sí";
  if (v === false) return "No";
  return (v as string) ?? "—";
}
