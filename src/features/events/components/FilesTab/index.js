import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ContractPanel from "./ContractPanel";
import BillsPanel from "./BillsPanel";
export default function FilesTab({ eventId }) {
    return (_jsxs("div", { className: "space-y-4", children: [_jsx(ContractPanel, { eventId: eventId }), _jsx(BillsPanel, { eventId: eventId })] }));
}
