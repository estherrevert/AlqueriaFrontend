import { InventoryHttpGateway } from "@/infrastructure/http/inventory.gateway";
export function makeInventoryUseCases(gateway = new InventoryHttpGateway()) {
    async function loadCatalog() {
        return gateway.getCatalog();
    }
    async function getEventInventory(eventId) {
        return gateway.getEventInventory(eventId);
    }
    async function saveEventInventory(eventId, selection) {
        return gateway.upsertEventInventory(eventId, selection);
    }
    return { loadCatalog, getEventInventory, saveEventInventory };
}
