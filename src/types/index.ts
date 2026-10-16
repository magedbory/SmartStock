/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RoleType = 
  | 'ADMIN' 
  | 'WAREHOUSE_MANAGER' 
  | 'MAINTENANCE_ENGINEER' 
  | 'MAINTENANCE_MANAGER' 
  | 'PROCUREMENT_OFFICER' 
  | 'PLANT_MANAGER';

export interface User {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  role: RoleType;
  roleTitleAr: string;
  department: string;
  avatarColor: string;
  isActive?: boolean;
}

export type MovementType = 'receipt' | 'issue' | 'return' | 'transfer' | 'adjustment';

export interface Category {
  id: string;
  name: string;
  code: string;
}

export interface Unit {
  id: string;
  name: string;
  symbol: string;
}

export interface LocationSpot {
  id: string;
  name: string; // e.g. "خانة 03"
  type: 'spot';
  shelfId: string;
  warehouseId: string;
  fullPath: string; // e.g. "المستودع الرئيسي / رف A-01 / خانة 03"
}

export interface Shelf {
  id: string;
  name: string; // e.g. "رف A-01"
  type: 'shelf';
  warehouseId: string;
  spots: LocationSpot[];
}

export interface Warehouse {
  id: string;
  name: string; // e.g. "المستودع الرئيسي"
  code: string;
  type: 'warehouse';
  shelves: Shelf[];
}

export interface Batch {
  id: string;
  itemId: string;
  batchNumber: string;
  expiryDate: string; // YYYY-MM-DD
  receivedDate: string;
  quantity: number;
  locationId: string;
}

export interface StockLocationBalance {
  locationId: string;
  locationPath: string;
  quantity: number;
}

export interface SupplierPrice {
  id: string;
  supplierId: string;
  supplierName: string;
  price: number;
  currency: string;
  date: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  taxNumber?: string;
  isActive: boolean;
}

export interface Item {
  id: string;
  code: string; // e.g. "BRG-6204-2RS"
  name: string; // e.g. "رولمان بلي (محمل كريات) 6204-2RS"
  categoryId: string;
  categoryName: string;
  unitId: string;
  unitName: string;
  description: string;
  tracksExpiry: boolean;
  minStock: number;
  isCritical: boolean; // صنف حرج
  avgCost: number; // متوسط التكلفة
  barcode: string; // e.g. "890123456001"
  isActive: boolean;
  totalQuantity: number;
  locations: StockLocationBalance[];
  batches?: Batch[];
  supplierPrices: SupplierPrice[];
}

export interface StockMovement {
  id: string;
  movementNumber: string; // e.g. "TRX-2026-0042"
  type: MovementType;
  typeAr: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  unitName: string;
  unitCost?: number;
  totalValue?: number;
  fromLocationId?: string;
  fromLocationPath?: string;
  toLocationId?: string;
  toLocationPath?: string;
  batchNumber?: string;
  expiryDate?: string;
  supplierId?: string;
  supplierName?: string;
  reason?: string;
  maintenanceRequestId?: string;
  maintenanceRequestNumber?: string;
  createdAt: string;
  createdByUserId: string;
  createdByUserName: string;
}

export type MaintenanceRequestType = 'routine' | 'breakdown'; // صيانة دورية أو عطل طارئ
export type MaintenanceRequestStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'fulfilled' | 'cancelled';

export interface MaintenanceRequestItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  requestedQty: number;
  approvedQty?: number;
  issuedQty?: number;
  unitName: string;
  availableStock: number;
}

export interface RequestStatusHistoryEntry {
  fromStatus: MaintenanceRequestStatus;
  toStatus: MaintenanceRequestStatus;
  changedByUserId: string;
  changedByUserName: string;
  timestamp: string;
  notes?: string;
}

export interface MaintenanceRequest {
  id: string;
  requestNumber: string; // e.g. "REQ-2026-015"
  type: MaintenanceRequestType;
  equipmentReference: string; // e.g. "ماكينة التعبئة الآلية - خط 1"
  status: MaintenanceRequestStatus;
  items: MaintenanceRequestItem[];
  requestedByUserId: string;
  requestedByUserName: string;
  requestedAt: string;
  approvedByUserId?: string;
  approvedByUserName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  fulfilledAt?: string;
  fulfilledByUserId?: string;
  fulfilledByUserName?: string;
  notes?: string;
  statusHistory: RequestStatusHistoryEntry[];
}

export interface InventoryAlert {
  id: string;
  type: 'low_stock' | 'expiry';
  itemId: string;
  itemCode: string;
  itemName: string;
  severity: 'critical' | 'warning' | 'info';
  currentStock: number;
  minStock?: number;
  batchNumber?: string;
  expiryDate?: string;
  daysUntilExpiry?: number;
  status: 'open' | 'acknowledged' | 'resolved';
  createdAt: string;
  message: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  entity: string; // 'Item' | 'Movement' | 'MaintenanceRequest' | 'Location' | 'User' | 'Setting' | 'InventoryCount'
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'FULFILL' | 'IMPORT';
  details: string;
  createdAt: string;
}

export type VarianceType = 
  | 'damage'       // تلف أو كسر أثناء النقل والتشغيل
  | 'loss'         // عجز غير مبرر أو فقدان
  | 'expiry'       // انتهاء تاريخ الصلاحية واستبعاد
  | 'data_error'   // خطأ إدخال أو تسجيل سابق
  | 'surplus'      // زيادة وفائض غير مسجل
  | 'routine';     // تسوية جردية دورية معتمدة

export interface InventoryAdjustmentRecord {
  id: string;
  adjustmentNumber: string; // e.g. "ADJ-2026-001"
  itemId: string;
  itemCode: string;
  itemName: string;
  unitName: string;
  locationId: string;
  locationPath: string;
  systemQty: number; // الرصيد الدفتري المسجل
  actualQty: number; // الرصيد الفعلي بعد الجرد
  varianceQty: number; // الفارق (الفعلي - الدفتري)
  unitCost: number;
  varianceValue: number; // القيمة المالية للعجز أو الزيادة
  varianceType: VarianceType;
  varianceTypeAr: string;
  reason: string;
  adjustedByUserId: string;
  adjustedByUserName: string;
  adjustedAt: string;
  sessionTitle?: string;
  status: 'approved' | 'pending_review';
}

export interface InventoryCountSession {
  id: string;
  sessionNumber: string;
  title: string;
  warehouseId?: string;
  warehouseName?: string;
  startedAt: string;
  completedAt?: string;
  status: 'in_progress' | 'completed';
  totalItemsCounted: number;
  matchedCount: number;
  varianceCount: number;
  totalVarianceValue: number;
  conductedByUserId: string;
  conductedByUserName: string;
  notes?: string;
}

