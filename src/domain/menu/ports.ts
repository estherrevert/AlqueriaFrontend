import { EventMenu, MenuCatalog } from "./types";

export interface MenuGatewayPort {
  getCatalog(): Promise<MenuCatalog>;
  getEventMenu(eventId: number): Promise<EventMenu>;
  upsertEventMenu(
    eventId: number,
    payload: { dish_ids: number[]; drink_ids: number[]; extras: { id: number; quantity: number }[] }
  ): Promise<EventMenu>;
}
