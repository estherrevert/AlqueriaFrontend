import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import EventHeader from "@/features/events/components/EventHeader";
import Tabs, { TabKey } from "@/features/events/components/Tabs";

import { makeEventsUseCases } from "@/application/events/usecases";
import { EventsHttpGateway } from "@/infrastructure/http/events.gateway";
import GeneralTab from "@/features/events/components/GeneralTab";

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

  const [event, setEvent] = useState<EventHeaderDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const activeTab = (search.get("tab") as TabKey) || "general";

  const tabs = useMemo(
    () => [
      { key: "general" as const, label: "GENERAL" },
      { key: "menu-inventory" as const, label: "MENÚ/INVENTARIO", disabled: true },
      { key: "tables" as const, label: "MESAS", disabled: true },
      { key: "files" as const, label: "ARCHIVOS", disabled: true },
    ],
    []
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await eventsUC.get(eventId);
        if (!mounted) return;
        const data: any = resp?.data ?? resp;
        setEvent({
          id: data.id,
          title: data.title,
          status: data.status,
          date: data?.day?.date ?? data?.date ?? null,
          clients: data?.clients ?? [],
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
      prev.set("tab", key);
      return prev;
    }, { replace: true });
  };

  if (loading) return <div className="p-4 text-sm text-gray-500">Cargando evento…</div>;

  return (
    <main className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
      {event ? (
        <>
          <EventHeader
            title={event.title}
            status={event.status}
            date={event.date}
            clients={event.clients}
          />

          <Tabs tabs={tabs} active={activeTab} onChange={onTabChange} />

          {activeTab === "general" && <GeneralTab eventId={event.id} />}

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
