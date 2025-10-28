import { jsx as _jsx } from "react/jsx-runtime";
import { resolveBackendUrl } from "@/infrastructure/http/resolveBackendUrl";
export default function PdfActions({ url }) {
    const href = resolveBackendUrl(url);
    if (!href)
        return _jsx("div", { className: "text-sm text-gray-500", children: "A\u00FAn no hay un PDF creado." });
    return (_jsx("div", { className: "flex items-center gap-2", children: _jsx("a", { href: href, target: "_blank", rel: "noreferrer", className: "px-3 py-1.5 rounded-md text-sm  bg-primary text-white hover:bg-primary-hover", children: "Ver PDF" }) }));
}
