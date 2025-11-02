import React, { useState } from "react";
import type { FormSchema } from "./types";
import FieldControl from "./FieldControls";

type Props = {
  schema: FormSchema;
  values: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
};

const ChevronDown = () => (
  <svg
    className="w-5 h-5 transition-transform duration-300"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

export default function FormRendererImproved({
  schema,
  values,
  onChange,
}: Props) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(["general"])
  );

  const toggleSection = (key: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const getFieldProgress = (section: (typeof schema)[0]) => {
    const total = section.fields.length;
    const filled = section.fields.filter((f) => {
      const val = values[f.name];
      return val !== null && val !== undefined && val !== "";
    }).length;
    return { filled, total };
  };

  return (
    <div className="space-y-4">
      {schema.map((section) => {
        const isOpen = openSections.has(section.key);
        const { filled, total } = getFieldProgress(section);
        const progress = total > 0 ? (filled / total) * 100 : 0;

        return (
          <div key={section.key} className="card overflow-hidden">
            {/* Header del acordeón */}
            <button
              type="button"
              onClick={() => toggleSection(section.key)}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                {section.icon && (
                  <span className="text-2xl">{section.icon}</span>
                )}
                <h4 className="text-base font-semibold text-text-main">
                  {section.title}
                </h4>
                <div className="h-2 w-32 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs text-muted">
                  {filled}/{total}
                </span>
              </div>
              <div
                className={`transform transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                <ChevronDown />
              </div>
            </button>

            {/* Contenido del acordeón */}
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="p-4 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.fields.map((f) => (
                      <label
                        key={f.name}
                        className={`flex flex-col gap-2 ${
                          f.colSpan === 2 ? "md:col-span-2" : ""
                        }`}
                      >
                        <span className="label">{f.label}</span>
                        <FieldControl
                          field={f}
                          value={values[f.name]}
                          onChange={onChange}
                        />
                      </label>
                    ))}
                  </div>

                  {/* Botón cerrar al final para secciones largas */}
                  <div className="mt-4 pt-3 border-t border-neutral-200 flex justify-center">
                    <button
                      type="button"
                      onClick={() => toggleSection(section.key)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-secondary hover:text-secondary-hover transition-colors"
                    >
                      <div className="transform rotate-180">
                        <ChevronDown />
                      </div>
                      <span>Cerrar {section.title}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
