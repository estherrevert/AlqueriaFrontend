import React from "react";
import { resolveBackendUrl } from "@/infrastructure/http/resolveBackendUrl";

export default function PdfActions({ url }: { url: string | null }) {
  const href = resolveBackendUrl(url);
  if (!href) return <div className="text-sm text-gray-500">Aún no hay un PDF creado.</div>;

  return (
    <div className="flex items-center gap-2">
      <a href={href} target="_blank" rel="noreferrer"
         className="px-3 py-1.5 rounded-md text-sm  bg-primary text-white hover:bg-primary-hover">
        Ver PDF
      </a>
    </div>
  );
}
