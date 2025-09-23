import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import EventHeader from "@/features/events/components/EventHeader";
import Tabs, { TabKey } from "@/features/events/components/Tabs";
import FilesTab from "@/features/events/components/FilesTab";
import { makeEventsUseCases } from "@/application/events/usecases";
import { EventsHttpGateway } from "@/infrastructure/http/events.gateway";
import GeneralTab from "@/features/events/components/GeneralTab";
import TablesPanel from "@/features/events/components/TablesTab/TablesPanel";
import InventoryTab from "../components/InventoryTab";
import MenuTab from "../components/MenuTab/MenuTab";
import TastingsMenuTab from "@/features/events/components/TastingsTab/TastingsMenuTab";

const eventsUC = makeEventsUseCases(EventsHttpGateway);

type EventHeaderDTO = {
  id: number;
  title: string;
  status: "reserved" | "confirmed" | "cancelled";
  date?: string | null;
  clients?: { id: number; name: string }[];
};

export default function EventPage() {
  const { id } = useParams();
  const eventId = Number(id);
  const [search, setSearch] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventHeaderDTO | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await eventsUC.get(eventId);
        if (!mounted) return;
        setEvent({
          id: data.id,
          title: data.title,
          status: data.status,
          date: (data as any)?.day?.date ?? (data as any)?.date ?? null,
          clients: (data as any)?.clients ?? [],
        });
      } catch {
        setEvent(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [eventId]);

  const onTabChange = (key: TabKey) => {
    setSearch((prev) => {
      const n = new URLSearchParams(prev);
      n.set("tab", key);
      return n;
    }, { replace: true });
  };

  const activeTab = (search.get("tab") as TabKey) || "general";

  const tabs = useMemo(
    () => [
      { key: "general" as const, label: "GENERAL" },
      { key: "menu" as const, label: "MENÚ" },
      { key: "tastings" as const, label: "PRUEBAS MENÚ" }, 
      { key: "inventory" as const, label: "INVENTARIO" },
      { key: "tables" as const, label: "MESAS" },
      { key: "files" as const, label: "ARCHIVOS" },
    ],
    []
  );

  return (
    <main className="container max-w-6xl mx-auto px-3 py-4">
      {loading ? (
        <p>Cargando evento…</p>
      ) : event ? (
        <>
          <EventHeader
            id={event.id}
            title={event.title}
            status={event.status}
            date={event.date}
            onStatusChanged={(next) => setEvent((prev) => (prev ? { ...prev, status: next } : prev))}
          />
          <Tabs tabs={tabs} active={activeTab} onChange={onTabChange} />

          {activeTab === "general" && <GeneralTab eventId={event.id} />}

          {activeTab === "tables" && <TablesPanel eventId={event.id} />}

          {activeTab === "files" && <FilesTab eventId={event.id} />}
          {activeTab === "inventory" && <InventoryTab eventId={event.id} />}
          {activeTab === "menu" && (
            <MenuTab eventId={event.id} attendeesCount={event?.counts?.attendees ?? 0} />
          )}
          {activeTab === "tastings" && <TastingsMenuTab eventId={event.id} />}

          
        </>
      ) : (
        <div className="text-sm text-red-600">No se encontró el evento.</div>
      )}
    </main>
  );
}
