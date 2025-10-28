import { TastingsHttpGateway } from "@/infrastructure/http/tastings.gateway";
import { MenuHttpGateway } from "@/infrastructure/http/menu.gateway";
export function makeTastingsUseCases(tastings = TastingsHttpGateway, menuGw = new MenuHttpGateway()) {
    async function listByEvent(eventId) {
        const { data } = await tastings.list({ event_id: eventId, per_page: 100 });
        return data;
    }
    // NUEVO: listar pruebas por día (usa el atajo "date")
    async function listByDay(date) {
        const { data } = await tastings.list({ date, per_page: 100 });
        return data;
    }
    async function create(input) {
        return tastings.create(input);
    }
    async function setDay(tastingId, day_id) {
        return tastings.updateDay(tastingId, day_id);
    }
    async function getTastingMenu(tastingId) {
        return menuGw.getTastingMenu(tastingId);
    }
    async function saveTastingMenu(tastingId, selection) {
        const payload = { dish_ids: selection.dishes, drinks: selection.drinks };
        return menuGw.upsertTastingMenu(tastingId, payload);
    }
    return { listByEvent, listByDay, create, setDay, getTastingMenu, saveTastingMenu };
}
