import { EventMenu, MenuCatalog, MenuDrinkSelection } from "./types";

export interface MenuGatewayPort {
  getCatalog(): Promise<MenuCatalog>;

  // EVENTO
  getEventMenu(eventId: number): Promise<EventMenu>;
  upsertEventMenu(
    eventId: number,
    payload: { dish_ids?: number[]; drinks: MenuDrinkSelection[]; extras: { id: number; quantity: number }[] }
  ): Promise<EventMenu>;

  // CATA (sin extras)
  getTastingMenu(tastingId: number): Promise<EventMenu>;
  upsertTastingMenu(
    tastingId: number,
    payload: { dish_ids?: number[]; drinks: MenuDrinkSelection[] }
  ): Promise<EventMenu>;
}
