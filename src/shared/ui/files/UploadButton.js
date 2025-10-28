import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from "react";
export default function UploadButton({ label, accept = "application/pdf", onFile, disabled }) {
    const ref = useRef(null);
    const pick = () => ref.current?.click();
    const onChange = async (e) => {
        const file = e.target.files?.[0];
        if (file)
            await onFile(file);
        if (ref.current)
            ref.current.value = "";
    };
    return (_jsxs(_Fragment, { children: [_jsx("input", { ref: ref, type: "file", accept: accept, className: "hidden", onChange: onChange, disabled: disabled }), _jsx("button", { type: "button", onClick: pick, disabled: disabled, className: "px-3 py-1.5 rounded-md text-sm bg-secondary text-white hover:bg-secondary-hover", children: label })] }));
}
