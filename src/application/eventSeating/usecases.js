import { EventSeatingHttpGateway } from "@/infrastructure/http/event-seating.gateway";
export function makeEventSeatingUseCases(gw = EventSeatingHttpGateway) {
    return {
        index: (eventId) => gw.index(eventId),
        addTable: (eventId, payload) => gw.create(eventId, payload),
        updateTable: (id, payload) => gw.update(id, payload),
        removeTable: (id) => gw.remove(id),
        generatePdf: (eventId) => gw.generatePdf(eventId),
    };
}
