import { MenuGatewayPort } from "@/domain/menu/ports";
import { MenuHttpGateway } from "@/infrastructure/http/menu.gateway";
import { EventMenu, MenuCatalog, MenuDrinkSelection, MenuExtraSelection } from "@/domain/menu/types";

export function makeMenuUseCases(gateway: MenuGatewayPort = new MenuHttpGateway()) {
  async function loadCatalog(): Promise<MenuCatalog> {
    return gateway.getCatalog();
  }

  async function getEventMenu(eventId: number): Promise<EventMenu> {
    return gateway.getEventMenu(eventId);
  }

  async function saveEventMenu(
    eventId: number,
    selection: {
      dishes: number[];
      drinks: MenuDrinkSelection[];
      extras: MenuExtraSelection[];
    }
  ): Promise<EventMenu> {
    const payload = {
      dish_ids: selection.dishes,
      drinks: selection.drinks.map(d => ({ id: d.id, quantity: d.quantity })),
      extras: selection.extras.map((e) => ({ id: e.id, quantity: e.quantity })),
    };
    return gateway.upsertEventMenu(eventId, payload);
  }

  return { loadCatalog, getEventMenu, saveEventMenu };
}
