import React, { useState, useMemo } from "react";
import { makeDishesUseCases } from "@/application/dishes/usecases";
import { makeDrinksUseCases } from "@/application/drinks/usecases";
import { makeInventoryItemsUseCases } from "@/application/inventory/usecases";
import { makeSuppliersUseCases } from "@/application/suppliers/usecases";
import type { Dish } from "@/domain/dishes/types";
import type { Drink } from "@/domain/drinks/types";
import type { InventoryItemList } from "@/domain/inventory/types";
import type { Supplier } from "@/domain/suppliers/types";
import DishForm from "@/features/dishes/components/DishForm";
import DrinkForm from "@/features/drinks/components/DrinkForm";
import InventoryItemForm from "@/features/inventory-catalog/components/InventoryItemForm";
import SupplierForm from "@/features/suppliers/components/SupplierForm";
import PlatosTab from "../tabs/PlatosTab";
import BebidasTab from "../tabs/BebidasTab";
import InventarioTab from "../tabs/InventarioTab";
import ProveedoresTab from "../tabs/ProveedoresTab";
import TabButton from "../components/shared/TabButton";

type TabType = "platos" | "bebidas" | "inventario" | "proveedores";
type InventoryType =
  | "napkins"
  | "table-linens"
  | "glassware"
  | "cutlery"
  | "crockery"
  | "furniture"
  | "floral-centers";

export default function ProductsManagementPage() {
  // Use cases
  const dishesUC = makeDishesUseCases();
  const drinksUC = makeDrinksUseCases();
  const inventoryUC = makeInventoryItemsUseCases();
  const suppliersUC = makeSuppliersUseCases();

  // Data state
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItemList[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Loading state
  const [loadingDishes, setLoadingDishes] = useState(true);
  const [loadingDrinks, setLoadingDrinks] = useState(true);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

  // Error state
  const [errorDishes, setErrorDishes] = useState<string | null>(null);
  const [errorDrinks, setErrorDrinks] = useState<string | null>(null);
  const [errorInventory, setErrorInventory] = useState<string | null>(null);
  const [errorSuppliers, setErrorSuppliers] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>("platos");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<
    "dish" | "drink" | "inventory" | "supplier"
  >("dish");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [inventoryType, setInventoryType] = useState<InventoryType>("napkins");

  // Load dishes on mount
  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingDishes(true);
      setErrorDishes(null);
      try {
        const { data } = await dishesUC.list({ per_page: 100 });
        if (alive) setDishes(data);
      } catch (e: any) {
        if (alive) setErrorDishes(e?.message ?? "Error cargando platos");
      } finally {
        if (alive) setLoadingDishes(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Load drinks on mount
  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingDrinks(true);
      setErrorDrinks(null);
      try {
        const { data } = await drinksUC.list({ per_page: 100 });
        if (alive) setDrinks(data);
      } catch (e: any) {
        if (alive) setErrorDrinks(e?.message ?? "Error cargando bebidas");
      } finally {
        if (alive) setLoadingDrinks(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Load inventory when tab changes
  React.useEffect(() => {
    if (activeTab !== "inventario") return;
    let alive = true;
    (async () => {
      setLoadingInventory(true);
      setErrorInventory(null);
      try {
        const { data } = await inventoryUC.list(inventoryType, {
          per_page: 100,
        });
        if (alive) setInventoryItems(data);
      } catch (e: any) {
        if (alive) setErrorInventory(e?.message ?? "Error cargando inventario");
      } finally {
        if (alive) setLoadingInventory(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [activeTab, inventoryType]);

  // Load suppliers when tab changes
  React.useEffect(() => {
    if (activeTab !== "proveedores") return;
    let alive = true;
    (async () => {
      setLoadingSuppliers(true);
      setErrorSuppliers(null);
      try {
        const { data } = await suppliersUC.list({ per_page: 100 });
        if (alive) setSuppliers(data);
      } catch (e: any) {
        if (alive)
          setErrorSuppliers(e?.message ?? "Error cargando proveedores");
      } finally {
        if (alive) setLoadingSuppliers(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [activeTab]);

  // Filter dishes
  const filteredDishes = useMemo(() => {
    if (!searchQuery) return dishes;
    return dishes.filter((d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [dishes, searchQuery]);

  // Filter drinks
  const filteredDrinks = useMemo(() => {
    if (!searchQuery) return drinks;
    return drinks.filter((d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [drinks, searchQuery]);

  // Filter inventory
  const filteredInventory = useMemo(() => {
    if (!searchQuery) return inventoryItems;
    return inventoryItems.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [inventoryItems, searchQuery]);

  // Filter suppliers
  const filteredSuppliers = useMemo(() => {
    if (!searchQuery) return suppliers;
    return suppliers.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [suppliers, searchQuery]);

  // Group dishes by category
  const dishesByCategory = useMemo(() => {
    const grouped: Record<string, Dish[]> = {};
    filteredDishes.forEach((dish) => {
      const category = dish.type || "Sin categoría";
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(dish);
    });
    return grouped;
  }, [filteredDishes]);

  // Group drinks by category
  const drinksByCategory = useMemo(() => {
    const grouped: Record<string, Drink[]> = {};
    filteredDrinks.forEach((drink) => {
      const category = drink.type || "Sin categoría";
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(drink);
    });
    return grouped;
  }, [filteredDrinks]);

  // Handlers
  const handleCreate = (type: "dish" | "drink" | "inventory" | "supplier") => {
    setFormType(type);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (
    id: number,
    type: "dish" | "drink" | "inventory" | "supplier"
  ) => {
    setFormType(type);
    setEditingId(id);
    setShowForm(true);
  };

  const handleDelete = async (
    id: number,
    type: "dish" | "drink" | "inventory" | "supplier"
  ) => {
    const message =
      type === "dish"
        ? "¿Eliminar este plato?"
        : type === "drink"
        ? "¿Eliminar esta bebida?"
        : type === "inventory"
        ? "¿Eliminar este item?"
        : "¿Eliminar este proveedor?";
    if (!confirm(message)) return;
    try {
      if (type === "dish") {
        await dishesUC.remove(id);
        setDishes(dishes.filter((d) => d.id !== id));
      } else if (type === "drink") {
        await drinksUC.remove(id);
        setDrinks(drinks.filter((d) => d.id !== id));
      } else if (type === "inventory") {
        await inventoryUC.remove(inventoryType, id);
        setInventoryItems(inventoryItems.filter((i) => i.id !== id));
      } else {
        await suppliersUC.remove(id);
        setSuppliers(suppliers.filter((s) => s.id !== id));
      }
    } catch (e: any) {
      alert(e?.message ?? "Error al eliminar");
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleFormSuccess = async () => {
    handleFormClose();
    try {
      if (formType === "dish") {
        const { data } = await dishesUC.list({ per_page: 100 });
        setDishes(data);
      } else if (formType === "drink") {
        const { data } = await drinksUC.list({ per_page: 100 });
        setDrinks(data);
      } else if (formType === "inventory") {
        const { data } = await inventoryUC.list(inventoryType, {
          per_page: 100,
        });
        setInventoryItems(data);
      } else {
        const { data } = await suppliersUC.list({ per_page: 100 });
        setSuppliers(data);
      }
    } catch (e: any) {
      if (formType === "dish") {
        setErrorDishes(e?.message ?? "Error recargando");
      } else if (formType === "drink") {
        setErrorDrinks(e?.message ?? "Error recargando");
      } else if (formType === "inventory") {
        setErrorInventory(e?.message ?? "Error recargando");
      } else {
        setErrorSuppliers(e?.message ?? "Error recargando");
      }
    }
  };

  // Format price helper
  const formatPrice = (item: Dish | Drink | InventoryItemList) => {
    const nf = new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    });
    const pricing = item.pricing as any;
    if (pricing?.per_person) {
      return `${nf.format(pricing.per_person)}/persona`;
    }
    if (pricing?.global) {
      return nf.format(pricing.global);
    }
    if (pricing?.per_unit) {
      return `${nf.format(pricing.per_unit)}/unidad`;
    }
    return "Sin precio";
  };

  // Derived state
  const loading =
    activeTab === "platos"
      ? loadingDishes
      : activeTab === "bebidas"
      ? loadingDrinks
      : activeTab === "inventario"
      ? loadingInventory
      : activeTab === "proveedores"
      ? loadingSuppliers
      : false;

  const error =
    activeTab === "platos"
      ? errorDishes
      : activeTab === "bebidas"
      ? errorDrinks
      : activeTab === "inventario"
      ? errorInventory
      : activeTab === "proveedores"
      ? errorSuppliers
      : null;

  return (
    <div className="mx-auto max-w-7xl p-4 space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-text-main">
          Gestión de Productos
        </h1>
        <p className="text-sm text-muted">Administra el catálogo completo</p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-neutral-200 bg-white rounded-t-xl overflow-hidden">
        <div className="flex gap-1 p-1">
          <TabButton
            active={activeTab === "platos"}
            onClick={() => setActiveTab("platos")}
            icon="🥗"
            label="Platos"
          />
          <TabButton
            active={activeTab === "bebidas"}
            onClick={() => setActiveTab("bebidas")}
            icon="🍷"
            label="Bebidas"
          />
          <TabButton
            active={activeTab === "inventario"}
            onClick={() => setActiveTab("inventario")}
            icon="📦"
            label="Inventario"
          />
          <TabButton
            active={activeTab === "proveedores"}
            onClick={() => setActiveTab("proveedores")}
            icon="🤝"
            label="Proveedores"
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-xl border border-neutral-200 p-6 shadow-sm">
        {loading && (
          <div className="text-center py-12 text-muted">Cargando…</div>
        )}
        {error && (
          <div className="text-center py-12 text-[color:var(--color-alert)]">
            {error}
          </div>
        )}

        {activeTab === "platos" && !loadingDishes && !errorDishes && (
          <PlatosTab
            dishes={dishes}
            filteredDishes={filteredDishes}
            dishesByCategory={dishesByCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onCreate={() => handleCreate("dish")}
            onEdit={(id) => handleEdit(id, "dish")}
            onDelete={(id) => handleDelete(id, "dish")}
            formatPrice={formatPrice}
          />
        )}

        {activeTab === "bebidas" && !loadingDrinks && !errorDrinks && (
          <BebidasTab
            drinks={drinks}
            filteredDrinks={filteredDrinks}
            drinksByCategory={drinksByCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onCreate={() => handleCreate("drink")}
            onEdit={(id) => handleEdit(id, "drink")}
            onDelete={(id) => handleDelete(id, "drink")}
            formatPrice={formatPrice}
          />
        )}

        {activeTab === "inventario" && !loadingInventory && !errorInventory && (
          <InventarioTab
            items={inventoryItems}
            filteredItems={filteredInventory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onCreate={() => handleCreate("inventory")}
            onEdit={(id) => handleEdit(id, "inventory")}
            onDelete={(id) => handleDelete(id, "inventory")}
            formatPrice={formatPrice}
            inventoryType={inventoryType}
            onTypeChange={setInventoryType}
          />
        )}

        {activeTab === "proveedores" &&
          !loadingSuppliers &&
          !errorSuppliers && (
            <ProveedoresTab
              suppliers={suppliers}
              filteredSuppliers={filteredSuppliers}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onCreate={() => handleCreate("supplier")}
              onEdit={(id) => handleEdit(id, "supplier")}
              onDelete={(id) => handleDelete(id, "supplier")}
            />
          )}
      </div>

      {/* Modal Overlay */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            {formType === "dish" ? (
              <DishForm
                dishId={editingId}
                onClose={handleFormClose}
                onSuccess={handleFormSuccess}
              />
            ) : formType === "drink" ? (
              <DrinkForm
                drinkId={editingId}
                onClose={handleFormClose}
                onSuccess={handleFormSuccess}
              />
            ) : formType === "supplier" ? (
              <SupplierForm
                supplierId={editingId}
                onClose={handleFormClose}
                onSuccess={handleFormSuccess}
              />
            ) : (
              <InventoryItemForm
                type={inventoryType}
                itemId={editingId}
                onClose={handleFormClose}
                onSuccess={handleFormSuccess}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
