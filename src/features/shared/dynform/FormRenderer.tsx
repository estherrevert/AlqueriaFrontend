import React from "react";
import type { FormSchema } from "./types";
import FieldControl from "./FieldControls";

type Props = { schema: FormSchema; values: Record<string, any>; onChange: (name: string, value: any) => void; };

export default function FormRenderer({ schema, values, onChange }: Props) {
  return (
    <div className="space-y-8">
      {schema.map(section => (
        <section key={section.key} className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">{section.title}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.fields.map(f => (
              <label key={f.name} className={`flex flex-col gap-1 ${f.colSpan === 2 ? "md:col-span-2" : ""}`}>
                <span className="text-sm text-gray-600">{f.label}</span>
                <FieldControl field={f} value={values[f.name]} onChange={onChange}/>
              </label>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
