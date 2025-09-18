import React from "react";

type Props = {
  values: { ceremony_time?: string; rings_by?: string; notes?: string };
};

export default function DetailView({ values }: Props) {
  return (
    <div className="divide-y divide-gray-100">
      <Row label="Hora ceremonia" value={values.ceremony_time} />
      <Row label="Momento/Anillos" value={values.rings_by} />
      <Row label="Notas" value={values.notes} />
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="py-2 flex justify-between gap-6">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium">{value || "—"}</span>
    </div>
  );
}
