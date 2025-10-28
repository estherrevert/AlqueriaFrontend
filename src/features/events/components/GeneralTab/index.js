import { jsx as _jsx } from "react/jsx-runtime";
import DetailPanel from "./DetailPanel";
export default function GeneralTab({ eventId }) {
    return (_jsx("div", { className: "space-y-4", children: _jsx(DetailPanel, { eventId: eventId }) }));
}
