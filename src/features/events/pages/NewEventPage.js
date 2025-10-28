import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate, useSearchParams } from "react-router-dom";
import EventForm from "../components/EventForm";
export default function NewEventPage() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const initialDate = params.get("date") ?? undefined; // ISO YYYY-MM-DD
    return (_jsxs("div", { className: "max-w-3xl mx-auto p-4 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-xl font-semibold", children: "Nuevo evento" }), _jsx("button", { onClick: () => navigate(-1), className: "px-3 py-1.5  rounded-lg text-sm underline bg-primary text-white", children: "Volver" })] }), _jsx(EventForm, { initialDate: initialDate })] }));
}
