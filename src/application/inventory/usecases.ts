import { InventoryGatewayPort } from "@/domain/inventory/ports";
import { InventoryHttpGateway } from "@/infrastructure/http/inventory.gateway";
import { EventInventory, InventoryCatalog, InventorySelectionPayload } from "@/domain/inventory/types";

export function makeInventoryUseCases(gateway: InventoryGatewayPort = new InventoryHttpGateway()) {
  async function loadCatalog(): Promise<InventoryCatalog> {
    return gateway.getCatalog();
  }

  async function getEventInventory(eventId: number): Promise<EventInventory> {
    return gateway.getEventInventory(eventId);
  }

  async function saveEventInventory(eventId: number, selection: InventorySelectionPayload): Promise<EventInventory> {
    return gateway.upsertEventInventory(eventId, selection);
  }

  return { loadCatalog, getEventInventory, saveEventInventory };
}
