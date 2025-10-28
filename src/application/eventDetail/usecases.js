import { EventDetailHttpGateway } from "@/infrastructure/http/event-detail.gateway";
export function makeEventDetailUseCases(gateway = EventDetailHttpGateway) {
    return {
        get: (eventId) => gateway.get(eventId),
        save: (eventId, data) => gateway.save(eventId, data),
    };
}
