import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
// src/features/events/pages/EventPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/shared/queryKeys";
import { getUser } from "@/features/auth/api/auth.api";
import EventHeader from "@/features/events/components/EventHeader";
import Tabs from "@/features/events/components/Tabs";
import FilesTab from "@/features/events/components/FilesTab";
import { makeEventsUseCases } from "@/application/events/usecases";
import { EventsHttpGateway } from "@/infrastructure/http/events.gateway";
import GeneralTab from "@/features/events/components/GeneralTab";
import TablesPanel from "@/features/events/components/TablesTab/TablesPanel";
import InventoryTab from "@/features/events/components/InventoryTab/InventoryTab";
import MenuTab from "../components/MenuTab/MenuTab";
import TastingsMenuTab from "@/features/events/components/TastingsTab/TastingsMenuTab";
import RequireRole from "@/app/RequireRole";
import { useToast } from "@/ui/Toast";
const eventsUC = makeEventsUseCases(EventsHttpGateway);
export default function EventPage() {
    const { id } = useParams();
    const eventId = Number(id);
    const [search, setSearch] = useSearchParams();
    const { show } = useToast();
    const { data: me } = useQuery({ queryKey: qk.me, queryFn: getUser, retry: false });
    const isAdmin = (me?.role?.name ?? "") === "admin";
    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState(null);
    async function load() {
        const data = await eventsUC.get(eventId);
        setEvent({
            id: data.id,
            title: data.title ?? "Evento",
            status: data.status ?? "reserved",
            date: data.date ?? null,
            users: data.users ?? [],
            counts: data.counts ?? {},
        });
    }
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                await load();
            }
            finally {
                if (mounted)
                    setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [eventId]);
    const activeTab = search.get("tab") || "general";
    const tabs = useMemo(() => [
        { key: "general", label: "GENERAL" },
        { key: "menu", label: "MENÚ" },
        { key: "tastings", label: "PRUEBAS MENÚ" },
        { key: "tables", label: "MESAS" },
        { key: "inventory", label: "INVENTARIO" },
        // ✅ Solo mostrar "ARCHIVOS" a admin
        ...(isAdmin ? [{ key: "files", label: "ARCHIVOS" }] : []),
    ], [isAdmin]);
    // ✅ Si fuerzan ?tab=files y no es admin, avisa y redirige a general
    useEffect(() => {
        if (!isAdmin && activeTab === "files") {
            show("No tienes permiso para esta sección");
            setSearch((prev) => {
                prev.set("tab", "general");
                return prev;
            }, { replace: true });
        }
    }, [isAdmin, activeTab, setSearch, show]);
    const onTabChange = (key) => {
        setSearch((prev) => {
            prev.set("tab", key);
            return prev;
        });
    };
    return (_jsx("main", { className: "p-4", children: loading ? (_jsx("div", { className: "text-sm text-gray-500", children: "Cargando..." })) : event ? (_jsxs(_Fragment, { children: [_jsx(EventHeader, { id: event.id, title: event.title, status: event.status, date: event.date, users: event.users, onStatusChanged: (next) => setEvent((prev) => (prev ? { ...prev, status: next } : prev)), onReload: load }), _jsx(Tabs, { tabs: tabs, active: activeTab, onChange: onTabChange }), activeTab === "general" && _jsx(GeneralTab, { eventId: event.id }), activeTab === "tables" && _jsx(TablesPanel, { eventId: event.id }), activeTab === "inventory" && _jsx(InventoryTab, { eventId: event.id }), activeTab === "menu" && (_jsx(MenuTab, { eventId: event.id })), activeTab === "tastings" && _jsx(TastingsMenuTab, { eventId: event.id }), activeTab === "files" && (_jsx(RequireRole, { allowed: ['admin'], children: _jsx(FilesTab, { eventId: event.id }) }))] })) : (_jsx("div", { className: "text-sm text-red-600", children: "No se encontr\u00F3 el evento." })) }));
}
