import React from "react";

type FormState = { ceremony_time?: string; rings_by?: string; notes?: string };
type Props = {
  form: FormState;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

export default function DetailForm({ form, onChange }: Props) {
  return (
    <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm text-gray-600">Hora ceremonia</span>
        <input
          type="time"
          name="ceremony_time"
          value={form.ceremony_time || ""}
          onChange={onChange}
          className="px-3 py-2 rounded-md border border-gray-300"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-gray-600">Momento/Anillos</span>
        <input
          type="text"
          name="rings_by"
          value={form.rings_by || ""}
          onChange={onChange}
          placeholder="Quién/qué lleva los anillos…"
          className="px-3 py-2 rounded-md border border-gray-300"
        />
      </label>

      <label className="md:col-span-2 flex flex-col gap-1">
        <span className="text-sm text-gray-600">Notas</span>
        <textarea
          name="notes"
          value={form.notes || ""}
          onChange={onChange}
          rows={3}
          className="px-3 py-2 rounded-md border border-gray-300"
        />
      </label>
    </form>
  );
}
