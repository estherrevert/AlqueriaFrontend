import { MenuHttpGateway } from "@/infrastructure/http/menu.gateway";
export function makeMenuUseCases(gateway = new MenuHttpGateway()) {
    async function loadCatalog() {
        return gateway.getCatalog();
    }
    async function getEventMenu(eventId) {
        return gateway.getEventMenu(eventId);
    }
    async function saveEventMenu(eventId, selection) {
        const payload = {
            dish_ids: selection.dishes,
            drinks: selection.drinks.map(d => ({ id: d.id, quantity: d.quantity })),
            extras: selection.extras.map((e) => ({ id: e.id, quantity: e.quantity })),
        };
        return gateway.upsertEventMenu(eventId, payload);
    }
    return { loadCatalog, getEventMenu, saveEventMenu };
}
