import {
  EventInventory,
  InventoryCatalog,
  InventorySelectionPayload,
} from "./types";
import type {
  InventoryItemDetail,
  InventoryItemList,
  InventoryItemListParams,
  InventoryItemCreate,
  InventoryItemUpdate,
} from "./types";

export interface InventoryGatewayPort {
  getCatalog(): Promise<InventoryCatalog>;
  getEventInventory(eventId: number): Promise<EventInventory>;
  upsertEventInventory(
    eventId: number,
    payload: InventorySelectionPayload
  ): Promise<EventInventory>;
}

export interface InventoryItemGateway {
  list(
    type: string,
    params: InventoryItemListParams
  ): Promise<{ data: InventoryItemList[]; meta?: any }>;
  get(type: string, id: number): Promise<InventoryItemDetail>;
  create(
    type: string,
    input: InventoryItemCreate
  ): Promise<InventoryItemDetail>;
  update(
    type: string,
    id: number,
    input: InventoryItemUpdate
  ): Promise<InventoryItemDetail>;
  delete(type: string, id: number): Promise<void>;
}
