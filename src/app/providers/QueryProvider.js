import { jsx as _jsx } from "react/jsx-runtime";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});
export default function QueryProvider({ children }) {
    return _jsx(QueryClientProvider, { client: qc, children: children });
}
