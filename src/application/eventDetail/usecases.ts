import type { EventDetailGateway, DetailDTO } from "@/infrastructure/http/event-detail.gateway";
import { EventDetailHttpGateway } from "@/infrastructure/http/event-detail.gateway";

export function makeEventDetailUseCases(gateway: EventDetailGateway = EventDetailHttpGateway) {
  return {
    get: (eventId: number): Promise<DetailDTO> => gateway.get(eventId),
    save: (eventId: number, data: Record<string, unknown>): Promise<DetailDTO> =>
      gateway.save(eventId, data),
  };
}
