import { EventInventory, InventoryCatalog, InventorySelectionPayload } from "./types";

export interface InventoryGatewayPort {
  getCatalog(): Promise<InventoryCatalog>;
  getEventInventory(eventId: number): Promise<EventInventory>;
  upsertEventInventory(eventId: number, payload: InventorySelectionPayload): Promise<EventInventory>;
}
