import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import EventHeader from "@/features/events/components/EventHeader";
import Tabs, { TabKey } from "@/features/events/components/Tabs";
import DetailPanel from "@/features/events/components/GeneralTab/DetailPanel";

// Usa tus usecases/gateway existentes:
import { makeEventsUseCases } from "@/application/events/usecases";
import { EventsHttpGateway } from "@/infrastructure/http/events.gateway";

const eventsUC = makeEventsUseCases(EventsHttpGateway);

type EventHeaderDTO = {
  id: number;
  title: string;
  status: "reserved" | "confirmed" | "cancelled";
  date?: string | null;
  clients?: { id: number; name: string }[];
  counts?: Record<string, number>;
  flags?: Record<string, boolean>;
};

export default function EventPage() {
  const params = useParams<{ id: string }>();
  const eventId = Number(params.id);

  const [search, setSearch] = useSearchParams();
  const activeTab = (search.get("tab") as TabKey) ?? "general";

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventHeaderDTO | null>(null);

  const tabs = useMemo(
    () => [
      { key: "general", label: "GENERAL" },
      { key: "menu-inventory", label: "MENÚ E INVENTARIO", disabled: true }, // siguiente fase
      { key: "tables", label: "MESAS", disabled: true }, // placeholder
      { key: "files", label: "ARCHIVOS", disabled: true }, // siguiente fase
    ] as { key: TabKey; label: string; disabled?: boolean }[],
    []
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await eventsUC.get(eventId);
        if (!mounted) return;
        // resp debería ser el EventResource { data: {...} } o el objeto directo, según tu gateway
        // ajusta esto según tu EventsHttpGateway:
        const data = (resp as any).data ?? resp;
        setEvent({
          id: data.id,
          title: data.title,
          status: data.status,
          date: data.date,
          clients: data.clients ?? [],
          counts: data.counts ?? {},
          flags: data.flags ?? {},
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [eventId]);

  const onTabChange = (key: TabKey) => {
    setSearch((prev) => {
      const n = new URLSearchParams(prev);
      n.set("tab", key);
      return n;
    });
  };

  if (Number.isNaN(eventId)) {
    return <div className="p-4 text-sm text-red-600">ID de evento inválido.</div>;
  }

  return (
    <main className="p-4 md:p-6 lg:p-8">
      {loading ? (
        <div className="text-sm text-gray-500">Cargando evento…</div>
      ) : event ? (
        <>
          <EventHeader
            title={event.title}
            status={event.status}
            date={event.date}
            clients={event.clients}
          />

          <Tabs tabs={tabs} active={activeTab} onChange={onTabChange} />

          {/* Panels */}
          {activeTab === "general" && (
            <section className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Detalles del evento</h2>
              <DetailPanel eventId={event.id} />
              {/* En el siguiente paso añadimos ClientsDataPanel debajo */}
            </section>
          )}

          {activeTab === "menu-inventory" && (
            <section className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-500">Próximamente…</p>
            </section>
          )}

          {activeTab === "tables" && (
            <section className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-500">Próximamente…</p>
            </section>
          )}

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
