import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function Loader({ fullScreen, size = "md", label }) {
    const sizeClasses = {
        sm: "w-6 h-6 border-2",
        md: "w-10 h-10 border-3",
        lg: "w-16 h-16 border-4",
    };
    const spinner = (_jsxs("div", { className: "flex flex-col items-center gap-3", children: [_jsx("div", { className: `${sizeClasses[size]} border-purple-600 border-t-transparent rounded-full animate-spin` }), label && _jsx("p", { className: "text-sm text-gray-600", children: label })] }));
    if (fullScreen) {
        return (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50", children: spinner }));
    }
    return spinner;
}
