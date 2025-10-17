import { InventoryItemTraceability } from '../entities/inventory-item-traceability.entity';

export type GetInventoryItemsAgg = {
  inventoryId: string;
  warehouseCode: string;
  productCode: string;
  productName: string;
  boxNumber: string;
  weightInKg: number;
  events: Record<string, string>;
};

export type GetInventoryItemsByProductAgg = {
  inventoryId: string;
  warehouseCode: string;
  productCode: string;
  productName: string;
  inventoryQuantity: number;
  inventoryWeightInKg: number;
  stockQuantity: number;
  stockWeightInKg: number;
  quantityDif: number;
  weightInKgDif: number;
  cancelatedQuantity: number;
  cancelatedWeightInKg: number;
  blockedQuantity: number;
  blockedWeightInKg: number;
  dispatchedQuantity: number;
  dispatchedWeightInKg: number;
  traceabilityEvents: Map<string, Partial<InventoryItemTraceability>[]>;
};
