import { EventsHttpGateway } from "@/infrastructure/http/events.gateway";

export async function createEventUseCase(input: {
  title: string;
  status: "reserved" | "confirmed" | "cancelled";
  date: string; // YYYY-MM-DD
  user_ids: number[];
}) {
  if (!input.user_ids?.length) throw new Error("Selecciona al menos un responsable");
  if (!input.title?.trim()) throw new Error("Título requerido");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error("Fecha inválida (YYYY-MM-DD)");

  return await EventsHttpGateway.create(input);
}
