import { api } from "@/shared/api/client";

export type DetailDTO = {
  id: number | null;
  url: string | null;
  data: Record<string, unknown>;
};

export interface EventDetailGateway {
  get(eventId: number): Promise<DetailDTO>;
  save(eventId: number, data: Record<string, unknown>): Promise<DetailDTO>;
}

/** Desenvuelve axios y SOLO desenvuelve el wrapper { data: {...} } cuando realmente es un wrapper.
 *  No confundimos con la propiedad 'data' del propio dominio (los campos del detalle).
 */
function unwrap(any: any): DetailDTO {
  const raw = any?.data ?? any; // axios -> data ; fetch/json -> ya es el objeto

  const candidate = raw?.data;
  const looksWrapper =
    candidate &&
    typeof candidate === "object" &&
    // el wrapper debe contener claves propias del detalle (id/url) o al menos no ser un simple objeto campo->valor
    (("id" in candidate) || ("url" in candidate) || ("data" in candidate && typeof candidate.data === "object"));

  const d = looksWrapper ? candidate : raw;

  const id =
    d?.id == null
      ? null
      : typeof d.id === "number"
      ? d.id
      : !Number.isNaN(Number(d.id))
      ? Number(d.id)
      : null;

  const url = typeof d?.url === "string" && d.url.trim() ? d.url : null;
  const data = (d?.data && typeof d.data === "object" ? d.data : {}) as Record<string, unknown>;

  return { id, url, data };
}

export const EventDetailHttpGateway: EventDetailGateway = {
  async get(eventId: number): Promise<DetailDTO> {
    const res = await api.get(`/api/v1/events/${eventId}/detail`, { withCredentials: true });
    return unwrap(res);
  },
  async save(eventId: number, data: Record<string, unknown>): Promise<DetailDTO> {
    const res = await api.put(`/api/v1/events/${eventId}/detail`, { data }, { withCredentials: true });
    return unwrap(res);
  },
};

