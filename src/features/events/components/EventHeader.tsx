import React from "react";

type ClientLite = { id: number; name: string };
type Props = {
  title: string;
  status: "reserved" | "confirmed" | "cancelled";
  date?: string | null;
  clients?: ClientLite[];
};

const statusStyles: Record<Props["status"], string> = {
  confirmed: "bg-green-100 text-green-800 border border-green-200",
  reserved: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  cancelled: "bg-red-100 text-red-800 border border-red-200",
};

export default function EventHeader({ title, status, date, clients }: Props) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <span className={`px-2.5 py-0.5 rounded-md text-sm ${statusStyles[status]}`}>
          {status === "confirmed" ? "Confirmado" : status === "reserved" ? "Reservado" : "Cancelado"}
        </span>
      </div>

      <div className="mt-2 text-sm text-gray-600 flex flex-wrap items-center gap-3">
        {date && <span>📅 {new Date(date).toLocaleDateString()}</span>}
        {clients && clients.length > 0 && (
          <span>👥 {clients.map((c) => c.name).join(", ")}</span>
        )}
      </div>
    </div>
  );
}
