import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import EventHeader from "@/features/events/components/EventHeader";
import Tabs, { TabKey } from "@/features/events/components/Tabs";

import { makeEventsUseCases } from "@/application/events/usecases";
import { EventsHttpGateway } from "@/infrastructure/http/events.gateway";
import GeneralTab from "@/features/events/components/GeneralTab";
import TablesPanel from "@/features/events/components/TablesTab/TablesPanel";

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
      { key: "menu-inventory" as const, label: "MENÚ/INVENTARIO", disabled: true },
      { key: "tables" as const, label: "MESAS" },
      { key: "files" as const, label: "ARCHIVOS", disabled: true },
    ],
    []
  );

  return (
    <main className="container max-w-6xl mx-auto px-3 py-4">
      {loading ? (
        <p>Cargando evento…</p>
      ) : event ? (
        <>
          <EventHeader id={event.id} title={event.title} status={event.status} date={event.date} />

          <Tabs tabs={tabs} active={activeTab} onChange={onTabChange} />

          {activeTab === "general" && <GeneralTab eventId={event.id} />}

          {activeTab === "tables" && <TablesPanel eventId={event.id} />}

          {activeTab === "files" && (
            <section className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-500">Próximamente…</p>
            </section>
          )}
        </>
      ) : (
        <div className="text-sm text-red-600">No se encontró el evento.</div>
      )}
    </main>
  );
}
