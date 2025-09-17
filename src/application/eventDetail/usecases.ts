import { EventDetailHttpGateway, DetailPayload, DetailDTO } from "@/infrastructure/http/event-detail.gateway";

export function makeEventDetailUseCases() {
  return {
    get: (eventId: number): Promise<DetailDTO> =>
      EventDetailHttpGateway.get(eventId),

    save: (eventId: number, data: DetailPayload): Promise<DetailDTO> =>
      EventDetailHttpGateway.upsert(eventId, data),

    uploadPdf: (eventId: number, file: File): Promise<DetailDTO> =>
      EventDetailHttpGateway.upload(eventId, file),
  };
}
