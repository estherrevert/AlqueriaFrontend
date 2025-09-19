import type { EventSeatingGateway } from "@/infrastructure/http/event-seating.gateway";
import { EventSeatingHttpGateway } from "@/infrastructure/http/event-seating.gateway";
import type { SeatingIndexDTO, SeatingTable } from "@/domain/seating/types";

export function makeEventSeatingUseCases(gw: EventSeatingGateway = EventSeatingHttpGateway) {
  return {
    index: (eventId: number): Promise<SeatingIndexDTO> => gw.index(eventId),
    addTable: (eventId: number, payload: Partial<SeatingTable>): Promise<SeatingTable> =>
      gw.create(eventId, payload),
    updateTable: (id: number, payload: Partial<SeatingTable>): Promise<SeatingTable> =>
      gw.update(id, payload),
    removeTable: (id: number): Promise<void> => gw.remove(id),
    generatePdf: (eventId: number): Promise<string> => gw.generatePdf(eventId),
  };
}
