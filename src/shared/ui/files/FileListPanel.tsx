import React from "react";
import UploadButton from "@/shared/ui/files/UploadButton";
import { filenameFromUrl } from "@/shared/utils/filename";

export type FileItem = {
  id: number;
  url: string;
  created_at?: string | null;
  updated_at?: string | null;
};

type Props = {
  title: string;
  items: FileItem[];             
  onUpload: (f: File) => Promise<FileItem>;
  onDelete: (id: number) => Promise<void>;
  uploading?: boolean;
  loading?: boolean;
  emptyText: string;
  single?: boolean;               
};

const fmt = (iso?: string | null) =>
  iso ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" })
          .format(new Date(iso)) : "";

export default function FileListPanel({
  title, items, onUpload, onDelete, uploading = false, loading = false, emptyText, single = false,
}: Props) {

  const onDeleteClick = async (id: number) => {
    if (!confirm("¿Eliminar el archivo?")) return;
    await onDelete(id);
  };

  return (
    <section
      className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-[var(--color-text-main)]">{title}</h3>
        <UploadButton label="Subir PDF" onFile={onUpload} disabled={uploading} />
      </div>

      <div className="mt-3">
        {loading ? (
          <p className="text-sm text-[var(--color-text-main)]">Cargando…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-[var(--color-text-main)]">{emptyText}</p>
        ) : (
          <ul className={single ? "" : "divide-y divide-[var(--color-beige)]"}>
            {items.map((it) => {
              const friendly = filenameFromUrl(it.url) || `Documento #${it.id}`;
              const date = fmt(it.updated_at || it.created_at);
              return (
                <li
                  key={it.id}
                  className={single ? "py-1" : "py-3 flex items-center justify-between gap-3"}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate text-[var(--color-text-main)]">
                      {friendly}
                    </p>
                    {date && (
                      <p className="text-xs text-[var(--color-text-main)]">
                        Actualizado: {date}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <a
                      href={it.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-md text-sm  bg-primary text-white hover:bg-primary-hover"

                    >
                    Descargar
                    </a>

                    <button
                      type="button"
                      onClick={() => onDeleteClick(it.id)}
                      disabled={uploading}
                      className="
                        inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm
                        border-[var(--color-alert)] text-[var(--color-alert)] bg-white
                        hover:bg-[var(--color-alert)] hover:text-white
                        disabled:opacity-50
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)]
                      "
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
