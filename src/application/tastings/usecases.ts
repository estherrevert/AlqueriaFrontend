import type { TastingSummary } from "@/domain/tastings/types";
import type { TastingsGateway } from "@/domain/tastings/ports";
import { TastingsHttpGateway } from "@/infrastructure/http/tastings.gateway";
import { MenuHttpGateway } from "@/infrastructure/http/menu.gateway";
import type { MenuGatewayPort } from "@/domain/menu/ports";
import type { EventMenu, MenuDrinkSelection } from "@/domain/menu/types";

export function makeTastingsUseCases(
  tastings: TastingsGateway = TastingsHttpGateway,
  menuGw: MenuGatewayPort = new MenuHttpGateway()
) {
  async function listByEvent(eventId: number): Promise<TastingSummary[]> {
    const { data } = await tastings.list({ event_id: eventId, per_page: 100 });
    return data;
  }

  async function create(input: { event_id: number; day_id: number; hour: string; attendees: number; title?: string | null; notes?: string | null; }): Promise<TastingSummary> {
    return tastings.create(input);
  }

  async function setDay(tastingId: number, day_id: number): Promise<TastingSummary> {
    return tastings.updateDay(tastingId, day_id);
  }

  async function getTastingMenu(tastingId: number): Promise<EventMenu> {
    return menuGw.getTastingMenu(tastingId);
  }

  async function saveTastingMenu(
    tastingId: number,
    selection: { dishes: number[]; drinks: MenuDrinkSelection[] }
  ): Promise<EventMenu> {
    const payload = { dish_ids: selection.dishes, drinks: selection.drinks };
    return menuGw.upsertTastingMenu(tastingId, payload);
  }

  return { listByEvent, create, setDay, getTastingMenu, saveTastingMenu };
}
