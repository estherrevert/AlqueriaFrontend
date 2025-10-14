// src/features/events/pages/EventPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/shared/queryKeys";
import { getUser } from "@/features/auth/api/auth.api";

import EventHeader from "@/features/events/components/EventHeader";
import Tabs, { TabKey } from "@/features/events/components/Tabs";
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

type EventHeaderDTO = {
  id: number;
  title: string;
  status: "reserved" | "confirmed" | "cancelled";
  date?: string | null;
  users?: { id: number; name: string }[];
  counts?: {
    attendees?: number | null;
    bills?: number | null;
    seating_tables?: number | null;
    menus?: number | null;
  };
};

export default function EventPage() {
  const { id } = useParams();
  const eventId = Number(id);
  const [search, setSearch] = useSearchParams();
  const { show } = useToast();

  const { data: me } = useQuery({ queryKey: qk.me, queryFn: getUser, retry: false });
  const isAdmin = (me?.role?.name ?? "") === "admin";

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventHeaderDTO | null>(null);

  async function load() {
    const data = await eventsUC.get(eventId);
    setEvent({
      id: data.id,
      title: data.title ?? "Evento",
      status: (data.status as any) ?? "reserved",
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
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [eventId]);

  const activeTab = (search.get("tab") as TabKey) || "general";

  const tabs = useMemo(
    () => [
      { key: "general" as const, label: "GENERAL" },
      { key: "menu" as const, label: "MENÚ" },
      { key: "tastings" as const, label: "PRUEBAS MENÚ" },
      { key: "tables" as const, label: "MESAS" },
      { key: "inventory" as const, label: "INVENTARIO" },
      // ✅ Solo mostrar "ARCHIVOS" a admin
      ...(isAdmin ? [{ key: "files" as const, label: "ARCHIVOS" }] : []),
    ],
    [isAdmin]
  );

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

  const onTabChange = (key: TabKey) => {
    setSearch((prev) => {
      prev.set("tab", key);
      return prev;
    });
  };

  return (
    <main className="p-4">
      {loading ? (
        <div className="text-sm text-gray-500">Cargando...</div>
      ) : event ? (
        <>
          <EventHeader
            id={event.id}
            title={event.title}
            status={event.status}
            date={event.date}
            users={event.users}
            onStatusChanged={(next) => setEvent((prev) => (prev ? { ...prev, status: next } : prev))}
            onReload={load}
          />

          <Tabs tabs={tabs} active={activeTab} onChange={onTabChange} />

          {activeTab === "general" && <GeneralTab eventId={event.id} />}
          {activeTab === "tables" && <TablesPanel eventId={event.id} />}
          {activeTab === "inventory" && <InventoryTab eventId={event.id} />}
          {activeTab === "menu" && (
            <MenuTab eventId={event.id} attendeesCount={event?.counts?.attendees ?? 0} />
          )}
          {activeTab === "tastings" && <TastingsMenuTab eventId={event.id} />}

          {/* ✅ Guardia extra al renderizar FilesTab */}
          {activeTab === "files" && (
            <RequireRole allowed={['admin']}>
              <FilesTab eventId={event.id} />
            </RequireRole>
          )}
        </>
      ) : (
        <div className="text-sm text-red-600">No se encontró el evento.</div>
      )}
    </main>
  );
}
