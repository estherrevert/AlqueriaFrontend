import {
  InventoryGatewayPort,
  InventoryItemGateway,
} from "@/domain/inventory/ports";
import { InventoryHttpGateway } from "@/infrastructure/http/inventory.gateway";
import { InventoryItemsHttpGateway } from "@/infrastructure/http/inventory-items.gateway";
import {
  EventInventory,
  InventoryCatalog,
  InventorySelectionPayload,
  InventoryItemDetail,
  InventoryItemList,
  InventoryItemListParams,
  InventoryItemCreate,
  InventoryItemUpdate,
} from "@/domain/inventory/types";

export function makeInventoryUseCases(
  gateway: InventoryGatewayPort = new InventoryHttpGateway()
) {
  async function loadCatalog(): Promise<InventoryCatalog> {
    return gateway.getCatalog();
  }

  async function getEventInventory(eventId: number): Promise<EventInventory> {
    return gateway.getEventInventory(eventId);
  }

  async function saveEventInventory(
    eventId: number,
    selection: InventorySelectionPayload
  ): Promise<EventInventory> {
    return gateway.upsertEventInventory(eventId, selection);
  }

  return { loadCatalog, getEventInventory, saveEventInventory };
}

export function makeInventoryItemsUseCases(
  gateway: InventoryItemGateway = InventoryItemsHttpGateway
) {
  async function list(type: string, params: InventoryItemListParams = {}) {
    return gateway.list(type, params);
  }

  async function get(type: string, id: number): Promise<InventoryItemDetail> {
    return gateway.get(type, id);
  }

  async function create(
    type: string,
    input: InventoryItemCreate
  ): Promise<InventoryItemDetail> {
    return gateway.create(type, input);
  }

  async function update(
    type: string,
    id: number,
    input: InventoryItemUpdate
  ): Promise<InventoryItemDetail> {
    return gateway.update(type, id, input);
  }

  async function remove(type: string, id: number): Promise<void> {
    return gateway.delete(type, id);
  }

  return { list, get, create, update, remove };
}
