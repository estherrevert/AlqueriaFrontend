import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import UploadButton from "@/shared/ui/files/UploadButton";
import { filenameFromUrl } from "@/shared/utils/filename";
const fmt = (iso) => iso ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" })
    .format(new Date(iso)) : "";
export default function FileListPanel({ title, items, onUpload, onDelete, uploading = false, loading = false, emptyText, single = false, }) {
    const onDeleteClick = async (id) => {
        if (!confirm("¿Eliminar el archivo?"))
            return;
        await onDelete(id);
    };
    return (_jsxs("section", { className: "bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-base font-medium text-[var(--color-text-main)]", children: title }), _jsx(UploadButton, { label: "Subir PDF", onFile: onUpload, disabled: uploading })] }), _jsx("div", { className: "mt-3", children: loading ? (_jsx("p", { className: "text-sm text-[var(--color-text-main)]", children: "Cargando\u2026" })) : items.length === 0 ? (_jsx("p", { className: "text-sm text-[var(--color-text-main)]", children: emptyText })) : (_jsx("ul", { className: single ? "" : "divide-y divide-[var(--color-beige)]", children: items.map((it) => {
                        const friendly = filenameFromUrl(it.url) || `Documento #${it.id}`;
                        const date = fmt(it.updated_at || it.created_at);
                        return (_jsxs("li", { className: single ? "py-1" : "py-3 flex items-center justify-between gap-3", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-sm font-medium truncate text-[var(--color-text-main)]", children: friendly }), date && (_jsxs("p", { className: "text-xs text-[var(--color-text-main)]", children: ["Actualizado: ", date] }))] }), _jsxs("div", { className: "flex items-center gap-2 mt-2 sm:mt-0", children: [_jsx("a", { href: it.url, target: "_blank", rel: "noopener noreferrer", className: "px-3 py-1.5 rounded-md text-sm  bg-primary text-white hover:bg-primary-hover", children: "Descargar" }), _jsx("button", { type: "button", onClick: () => onDeleteClick(it.id), disabled: uploading, className: "\n                        inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm\n                        border-[var(--color-alert)] text-[var(--color-alert)] bg-white\n                        hover:bg-[var(--color-alert)] hover:text-white\n                        disabled:opacity-50\n                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)]\n                      ", children: "Eliminar" })] })] }, it.id));
                    }) })) })] }));
}
