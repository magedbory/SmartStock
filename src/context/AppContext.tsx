/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User, RoleType, Item, Category, Unit, Warehouse, Supplier,
  StockMovement, MaintenanceRequest, InventoryAlert, AuditLog,
  MovementType, MaintenanceRequestType, InventoryAdjustmentRecord,
  InventoryCountSession, VarianceType
} from '../types';
import {
  INITIAL_USERS, INITIAL_CATEGORIES, INITIAL_UNITS, INITIAL_WAREHOUSES,
  INITIAL_SUPPLIERS, INITIAL_ITEMS, INITIAL_MOVEMENTS,
  INITIAL_MAINTENANCE_REQUESTS, INITIAL_ALERTS, INITIAL_AUDIT_LOGS,
  INITIAL_ADJUSTMENTS, INITIAL_COUNT_SESSIONS
} from '../data/initialData';

interface ToastInfo {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  addUser: (userData: {
    fullName: string;
    username: string;
    role: RoleType;
    department: string;
    password?: string;
  }) => { success: boolean; error?: string };
  updateUserRole: (userId: string, newRole: RoleType) => { success: boolean; error?: string };
  updateUser: (userId: string, updates: Partial<User>) => { success: boolean; error?: string };

  // Authentication & User Switch Restriction
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authTargetUser: User | null;
  setAuthTargetUser: (user: User | null) => void;
  requestUserSwitch: (user: User) => void;
  verifyAndSwitchUser: (password: string) => { success: boolean; error?: string };
  items: Item[];
  categories: Category[];
  units: Unit[];
  warehouses: Warehouse[];
  suppliers: Supplier[];
  movements: StockMovement[];
  maintenanceRequests: MaintenanceRequest[];
  alerts: InventoryAlert[];
  auditLogs: AuditLog[];
  adjustments: InventoryAdjustmentRecord[];
  countSessions: InventoryCountSession[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  expiryWindowDays: number;
  setExpiryWindowDays: (days: number) => void;
  currency: string;
  toast: ToastInfo | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

  // Modals state
  isScannerOpen: boolean;
  setIsScannerOpen: (open: boolean) => void;
  scannerPreselectedItem: Item | null;
  setScannerPreselectedItem: (item: Item | null) => void;

  isMovementModalOpen: boolean;
  setIsMovementModalOpen: (open: boolean) => void;
  movementModalDefaultType: MovementType;
  setMovementModalDefaultType: (type: MovementType) => void;
  movementModalDefaultItemId: string;
  setMovementModalDefaultItemId: (itemId: string) => void;

  isRequestModalOpen: boolean;
  setIsRequestModalOpen: (open: boolean) => void;

  isItemModalOpen: boolean;
  setIsItemModalOpen: (open: boolean) => void;
  editingItem: Item | null;
  setEditingItem: (item: Item | null) => void;

  isLabelModalOpen: boolean;
  setIsLabelModalOpen: (open: boolean) => void;
  labelModalItem: Item | null;
  setLabelModalItem: (item: Item | null) => void;

  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;

  // CRUD & Operations
  addItem: (itemData: Partial<Item>) => { success: boolean; error?: string };
  updateItem: (id: string, itemData: Partial<Item>) => { success: boolean; error?: string };
  deactivateItem: (id: string) => { success: boolean; error?: string };

  recordMovement: (data: {
    type: MovementType;
    itemId: string;
    quantity: number;
    fromLocationId?: string;
    toLocationId?: string;
    unitCost?: number;
    supplierId?: string;
    batchNumber?: string;
    expiryDate?: string;
    reason?: string;
    maintenanceRequestId?: string;
  }) => { success: boolean; error?: string };

  createMaintenanceRequest: (data: {
    type: MaintenanceRequestType;
    equipmentReference: string;
    items: { itemId: string; requestedQty: number }[];
    notes?: string;
  }) => { success: boolean; error?: string };

  approveMaintenanceRequest: (id: string) => { success: boolean; error?: string };
  rejectMaintenanceRequest: (id: string, reason: string) => { success: boolean; error?: string };
  fulfillMaintenanceRequest: (id: string) => { success: boolean; error?: string };
  cancelMaintenanceRequest: (id: string) => { success: boolean; error?: string };

  acknowledgeAlert: (id: string) => void;
  addWarehouse: (name: string, code: string) => void;
  addShelf: (warehouseId: string, name: string) => void;
  addSpot: (warehouseId: string, shelfId: string, name: string) => void;

  addSupplier: (supplier: Partial<Supplier>) => { success: boolean; error?: string };
  addSupplierPrice: (itemId: string, supplierId: string, price: number, notes?: string) => void;

  importItems: (newItems: Item[]) => void;
  resetToDefaultData: () => void;

  recordInventoryCountAdjustment: (data: {
    itemId: string;
    locationId: string;
    actualQty: number;
    varianceType: VarianceType;
    reason: string;
    sessionTitle?: string;
  }) => { success: boolean; error?: string };
  createCountSession: (title: string, warehouseId?: string, notes?: string) => { success: boolean; error?: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'smartstock_data_v1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Default: Ahmed (Warehouse Manager)
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [units] = useState<Unit[]>(INITIAL_UNITS);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(INITIAL_WAREHOUSES);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [movements, setMovements] = useState<StockMovement[]>(INITIAL_MOVEMENTS);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>(INITIAL_MAINTENANCE_REQUESTS);
  const [alerts, setAlerts] = useState<InventoryAlert[]>(INITIAL_ALERTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [adjustments, setAdjustments] = useState<InventoryAdjustmentRecord[]>(INITIAL_ADJUSTMENTS);
  const [countSessions, setCountSessions] = useState<InventoryCountSession[]>(INITIAL_COUNT_SESSIONS);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [expiryWindowDays, setExpiryWindowDays] = useState<number>(30);
  const [currency] = useState<string>('ج.م');
  const [toast, setToast] = useState<ToastInfo | null>(null);

  // Authentication & User Switch Restriction Modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTargetUser, setAuthTargetUser] = useState<User | null>(null);

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerPreselectedItem, setScannerPreselectedItem] = useState<Item | null>(null);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementModalDefaultType, setMovementModalDefaultType] = useState<MovementType>('receipt');
  const [movementModalDefaultItemId, setMovementModalDefaultItemId] = useState<string>('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [labelModalItem, setLabelModalItem] = useState<Item | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.users && Array.isArray(parsed.users) && parsed.users.length > 0) setUsers(parsed.users);
        if (parsed.items) setItems(parsed.items);
        if (parsed.movements) setMovements(parsed.movements);
        if (parsed.maintenanceRequests) setMaintenanceRequests(parsed.maintenanceRequests);
        if (parsed.warehouses) setWarehouses(parsed.warehouses);
        if (parsed.suppliers) setSuppliers(parsed.suppliers);
        if (parsed.alerts) setAlerts(parsed.alerts);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        if (parsed.adjustments) setAdjustments(parsed.adjustments);
        if (parsed.countSessions) setCountSessions(parsed.countSessions);
      }
    } catch {
      // Fallback to default
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ users, items, movements, maintenanceRequests, warehouses, suppliers, alerts, auditLogs, adjustments, countSessions })
      );
    } catch {
      // Ignore quota errors
    }
  }, [users, items, movements, maintenanceRequests, warehouses, suppliers, alerts, auditLogs, adjustments, countSessions]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const addAuditLog = (entity: string, entityId: string, action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'FULFILL' | 'IMPORT', details: string) => {
    const newLog: AuditLog = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      actorId: currentUser.id,
      actorName: `${currentUser.fullName} (${currentUser.roleTitleAr})`,
      entity,
      entityId,
      action,
      details,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Helper to re-evaluate alerts for an item
  const updateItemAlerts = (item: Item, currentStock: number) => {
    setAlerts((prev) => {
      const filtered = prev.filter((a) => !(a.type === 'low_stock' && a.itemId === item.id));
      if (currentStock <= item.minStock) {
        const newAlert: InventoryAlert = {
          id: `ALT-LOW-${Date.now()}`,
          type: 'low_stock',
          itemId: item.id,
          itemCode: item.code,
          itemName: item.name,
          severity: item.isCritical ? 'critical' : 'warning',
          currentStock,
          minStock: item.minStock,
          status: 'open',
          createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          message: `المخزون الحالي (${currentStock} ${item.unitName}) وصل للحد الأدنى أو أقل منه (${item.minStock} ${item.unitName}). ${
            item.isCritical ? 'تنبيه عاجل: صنف حرج للتشغيل!' : ''
          }`,
        };
        return [newAlert, ...filtered];
      }
      return filtered;
    });
  };

  // Add Item
  const addItem = (itemData: Partial<Item>): { success: boolean; error?: string } => {
    if (!itemData.code || !itemData.name || !itemData.categoryId || !itemData.unitId) {
      return { success: false, error: 'يرجى ملء جميع الحقول الإلزامية (كود الصنف، الاسم، التصنيف، وحدة القياس).' };
    }

    const trimmedCode = itemData.code.trim().toUpperCase();
    if (items.some((it) => it.code.toUpperCase() === trimmedCode)) {
      return { success: false, error: `كود الصنف "${trimmedCode}" مسجل مسبقاً لصنف آخر. يجب أن يكون كود الصنف فريداً.` };
    }

    const cat = categories.find((c) => c.id === itemData.categoryId);
    const unit = units.find((u) => u.id === itemData.unitId);

    const newItem: Item = {
      id: `ITM-${Date.now()}`,
      code: trimmedCode,
      name: itemData.name.trim(),
      categoryId: itemData.categoryId,
      categoryName: cat ? cat.name : '',
      unitId: itemData.unitId,
      unitName: unit ? unit.symbol : '',
      description: itemData.description || '',
      tracksExpiry: !!itemData.tracksExpiry,
      minStock: Number(itemData.minStock) || 0,
      isCritical: !!itemData.isCritical,
      avgCost: Number(itemData.avgCost) || 0,
      barcode: itemData.barcode?.trim() || `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      isActive: true,
      totalQuantity: 0,
      locations: [],
      batches: [],
      supplierPrices: [],
    };

    setItems((prev) => [newItem, ...prev]);
    addAuditLog('Item', newItem.id, 'CREATE', `إضافة صنف جديد: ${newItem.code} - ${newItem.name}`);
    showToast(`تم حفظ الصنف بنجاح: ${newItem.name}`);
    return { success: true };
  };

  // Update Item
  const updateItem = (id: string, itemData: Partial<Item>): { success: boolean; error?: string } => {
    const existing = items.find((i) => i.id === id);
    if (!existing) return { success: false, error: 'الصنف غير موجود.' };

    if (itemData.code) {
      const trimmedCode = itemData.code.trim().toUpperCase();
      if (items.some((i) => i.id !== id && i.code.toUpperCase() === trimmedCode)) {
        return { success: false, error: `كود الصنف "${trimmedCode}" مستخدم بالفعل لصنف آخر.` };
      }
    }

    // Check if unit changed and item already has movements
    if (itemData.unitId && itemData.unitId !== existing.unitId) {
      const hasMoves = movements.some((m) => m.itemId === id);
      if (hasMoves) {
        return { success: false, error: 'لا يمكن تعديل وحدة القياس بعد تسجيل حركات مخزنية على الصنف.' };
      }
    }

    const cat = itemData.categoryId ? categories.find((c) => c.id === itemData.categoryId) : undefined;
    const unit = itemData.unitId ? units.find((u) => u.id === itemData.unitId) : undefined;

    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const updated: Item = {
          ...i,
          ...itemData,
          categoryName: cat ? cat.name : i.categoryName,
          unitName: unit ? unit.symbol : i.unitName,
          minStock: itemData.minStock !== undefined ? Number(itemData.minStock) : i.minStock,
          avgCost: itemData.avgCost !== undefined ? Number(itemData.avgCost) : i.avgCost,
        };
        updateItemAlerts(updated, updated.totalQuantity);
        return updated;
      })
    );

    addAuditLog('Item', id, 'UPDATE', `تعديل بيانات الصنف: ${existing.code}`);
    showToast('تم تحديث بيانات الصنف بنجاح.');
    return { success: true };
  };

  // Deactivate Item
  const deactivateItem = (id: string): { success: boolean; error?: string } => {
    const itm = items.find((i) => i.id === id);
    if (!itm) return { success: false, error: 'الصنف غير موجود.' };
    if (itm.totalQuantity > 0) {
      return { success: false, error: `لا يمكن تعطيل الصنف لوجود رصيد حالي قدره (${itm.totalQuantity} ${itm.unitName}). يجب تصفير الرصيد أولاً.` };
    }

    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isActive: false } : i)));
    addAuditLog('Item', id, 'UPDATE', `تعطيل الصنف: ${itm.code}`);
    showToast(`تم تعطيل الصنف: ${itm.name}`);
    return { success: true };
  };

  // Record Stock Movement
  const recordMovement = (data: {
    type: MovementType;
    itemId: string;
    quantity: number;
    fromLocationId?: string;
    toLocationId?: string;
    unitCost?: number;
    supplierId?: string;
    batchNumber?: string;
    expiryDate?: string;
    reason?: string;
    maintenanceRequestId?: string;
  }): { success: boolean; error?: string } => {
    const item = items.find((i) => i.id === data.itemId);
    if (!item) return { success: false, error: 'الصنف المحدد غير موجود.' };

    const qty = Number(data.quantity);
    if (isNaN(qty) || qty <= 0) {
      return { success: false, error: 'يجب أن تكون الكمية رقماً موجباً أكبر من الصفر.' };
    }

    // Type specific validations
    if (data.type === 'adjustment') {
      if (!data.reason || data.reason.trim().length < 5) {
        return { success: false, error: 'سبب التسوية الجردية إلزامي ويجب ألا يقل عن 5 أحرف.' };
      }
    }

    if (item.tracksExpiry && data.type === 'receipt') {
      if (!data.expiryDate) {
        return { success: false, error: 'الصنف يتطلب تتبع تاريخ الصلاحية. يرجى إدخال تاريخ انتهاء الصلاحية للدفعة.' };
      }
    }

    // Check balances for deductions
    if (data.type === 'issue' || data.type === 'transfer') {
      if (!data.fromLocationId) {
        return { success: false, error: 'يرجى تحديد موقع المصدر الذي سيتم الصرف أو النقل منه.' };
      }
      const locBalance = item.locations.find((l) => l.locationId === data.fromLocationId);
      const availableInLoc = locBalance ? locBalance.quantity : 0;
      if (qty > availableInLoc) {
        return {
          success: false,
          error: `الرصيد المتاح في الموقع المحدد (${availableInLoc} ${item.unitName}) غير كافٍ لصرف كمية (${qty} ${item.unitName}).`,
        };
      }
    }

    // Find location paths
    let fromPath = '';
    let toPath = '';
    for (const w of warehouses) {
      for (const sh of w.shelves) {
        for (const sp of sh.spots) {
          if (sp.id === data.fromLocationId) fromPath = sp.fullPath;
          if (sp.id === data.toLocationId) toPath = sp.fullPath;
        }
      }
    }

    const supplier = suppliers.find((s) => s.id === data.supplierId);

    // Calculate new total quantity and locations atomically
    let newTotalQty = item.totalQuantity;
    let newLocations = [...item.locations];
    let newBatches = [...(item.batches || [])];

    if (data.type === 'receipt') {
      newTotalQty += qty;
      const targetLocId = data.toLocationId || 'SP-01';
      const existingLoc = newLocations.find((l) => l.locationId === targetLocId);
      if (existingLoc) {
        newLocations = newLocations.map((l) => (l.locationId === targetLocId ? { ...l, quantity: l.quantity + qty } : l));
      } else {
        newLocations.push({ locationId: targetLocId, locationPath: toPath || 'المستودع الرئيسي', quantity: qty });
      }

      if (item.tracksExpiry && data.expiryDate) {
        newBatches.push({
          id: `BAT-${Date.now()}`,
          itemId: item.id,
          batchNumber: data.batchNumber || `BTH-${new Date().toISOString().slice(0, 10)}`,
          expiryDate: data.expiryDate,
          receivedDate: new Date().toISOString().slice(0, 10),
          quantity: qty,
          locationId: targetLocId,
        });
      }
    } else if (data.type === 'issue') {
      newTotalQty -= qty;
      newLocations = newLocations
        .map((l) => (l.locationId === data.fromLocationId ? { ...l, quantity: l.quantity - qty } : l))
        .filter((l) => l.quantity > 0);
    } else if (data.type === 'return') {
      newTotalQty += qty;
      const targetLocId = data.toLocationId || (item.locations[0]?.locationId ?? 'SP-01');
      const existingLoc = newLocations.find((l) => l.locationId === targetLocId);
      if (existingLoc) {
        newLocations = newLocations.map((l) => (l.locationId === targetLocId ? { ...l, quantity: l.quantity + qty } : l));
      } else {
        newLocations.push({ locationId: targetLocId, locationPath: toPath || 'المستودع', quantity: qty });
      }
    } else if (data.type === 'transfer') {
      if (data.fromLocationId === data.toLocationId) {
        return { success: false, error: 'موقع المصدر وموقع الوجهة متطابقان. يجب اختيار موقعين مختلفين.' };
      }
      newLocations = newLocations.map((l) => {
        if (l.locationId === data.fromLocationId) return { ...l, quantity: l.quantity - qty };
        if (l.locationId === data.toLocationId) return { ...l, quantity: l.quantity + qty };
        return l;
      });
      if (!newLocations.some((l) => l.locationId === data.toLocationId)) {
        newLocations.push({ locationId: data.toLocationId!, locationPath: toPath, quantity: qty });
      }
      newLocations = newLocations.filter((l) => l.quantity > 0);
    } else if (data.type === 'adjustment') {
      // Adjustment can be increase or decrease
      newTotalQty = Math.max(0, newTotalQty + qty);
      const locId = data.fromLocationId || item.locations[0]?.locationId || 'SP-01';
      const existingLoc = newLocations.find((l) => l.locationId === locId);
      if (existingLoc) {
        const adjustedLocQty = Math.max(0, existingLoc.quantity + qty);
        newLocations = newLocations.map((l) => (l.locationId === locId ? { ...l, quantity: adjustedLocQty } : l));
      } else if (qty > 0) {
        newLocations.push({ locationId: locId, locationPath: fromPath || 'المستودع', quantity: qty });
      }
    }

    // Moving average cost recalculation on receipt
    let updatedAvgCost = item.avgCost;
    if (data.type === 'receipt' && data.unitCost && data.unitCost > 0) {
      const oldVal = item.totalQuantity * item.avgCost;
      const addVal = qty * data.unitCost;
      updatedAvgCost = Number(((oldVal + addVal) / newTotalQty).toFixed(2));
    }

    const updatedItem: Item = {
      ...item,
      totalQuantity: newTotalQty,
      locations: newLocations,
      batches: newBatches,
      avgCost: updatedAvgCost,
    };

    setItems((prev) => prev.map((i) => (i.id === item.id ? updatedItem : i)));

    // Create immutable movement record
    const typeArMap: Record<MovementType, string> = {
      receipt: 'توريد واستلام',
      issue: 'صرف للمصنع / الصيانة',
      return: 'إرجاع للمستودع',
      transfer: 'نقل بين المواقع',
      adjustment: 'جرد وتسوية',
    };

    const newMovement: StockMovement = {
      id: `TRX-${Date.now()}`,
      movementNumber: `TRX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      type: data.type,
      typeAr: typeArMap[data.type],
      itemId: item.id,
      itemCode: item.code,
      itemName: item.name,
      quantity: qty,
      unitName: item.unitName,
      unitCost: data.unitCost || item.avgCost,
      totalValue: Number(((data.unitCost || item.avgCost) * qty).toFixed(2)),
      fromLocationId: data.fromLocationId,
      fromLocationPath: fromPath || undefined,
      toLocationId: data.toLocationId,
      toLocationPath: toPath || undefined,
      batchNumber: data.batchNumber,
      expiryDate: data.expiryDate,
      supplierId: data.supplierId,
      supplierName: supplier ? supplier.name : undefined,
      reason: data.reason,
      maintenanceRequestId: data.maintenanceRequestId,
      maintenanceRequestNumber: data.maintenanceRequestId,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      createdByUserId: currentUser.id,
      createdByUserName: `${currentUser.fullName} (${currentUser.roleTitleAr})`,
    };

    setMovements((prev) => [newMovement, ...prev]);
    updateItemAlerts(updatedItem, newTotalQty);

    // If movement is receipt with supplier, update supplier price record
    if (data.type === 'receipt' && data.supplierId && data.unitCost) {
      addSupplierPrice(item.id, data.supplierId, data.unitCost, 'تم التحديث تلقائياً من حركة توريد');
    }

    addAuditLog('Movement', newMovement.id, 'CREATE', `تسجيل حركة ${typeArMap[data.type]} للصنف ${item.code} بكمية ${qty} ${item.unitName}`);
    showToast(`تم تسجيل حركة (${typeArMap[data.type]}) بنجاح. الرصيد الجديد: ${newTotalQty} ${item.unitName}`);
    return { success: true };
  };

  // Maintenance Workflow
  const createMaintenanceRequest = (data: {
    type: MaintenanceRequestType;
    equipmentReference: string;
    items: { itemId: string; requestedQty: number }[];
    notes?: string;
  }): { success: boolean; error?: string } => {
    if (!data.equipmentReference || data.equipmentReference.trim().length === 0) {
      return { success: false, error: 'يرجى إدخال اسم أو كود المعدة / الماكينة المطلوب صيانتها.' };
    }
    if (!data.items || data.items.length === 0) {
      return { success: false, error: 'يرجى إضافة صنف واحد على الأقل في طلب الصيانة.' };
    }

    for (const reqItm of data.items) {
      if (reqItm.requestedQty <= 0) {
        return { success: false, error: 'يجب أن تكون الكمية المطلوبة أكبر من الصفر لجميع الأصناف.' };
      }
    }

    const requestItems = data.items.map((it) => {
      const found = items.find((i) => i.id === it.itemId);
      return {
        itemId: it.itemId,
        itemCode: found ? found.code : '',
        itemName: found ? found.name : '',
        requestedQty: it.requestedQty,
        approvedQty: 0,
        issuedQty: 0,
        unitName: found ? found.unitName : '',
        availableStock: found ? found.totalQuantity : 0,
      };
    });

    const newReq: MaintenanceRequest = {
      id: `REQ-${Date.now()}`,
      requestNumber: `REQ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      type: data.type,
      equipmentReference: data.equipmentReference.trim(),
      status: 'submitted',
      items: requestItems,
      requestedByUserId: currentUser.id,
      requestedByUserName: `${currentUser.fullName} (${currentUser.roleTitleAr})`,
      requestedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      notes: data.notes,
      statusHistory: [
        {
          fromStatus: 'draft',
          toStatus: 'submitted',
          changedByUserId: currentUser.id,
          changedByUserName: currentUser.fullName,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          notes: `تم إنشاء ورفع الطلب بنوع: ${data.type === 'breakdown' ? 'عطل طارئ' : 'صيانة دورية'}`,
        },
      ],
    };

    setMaintenanceRequests((prev) => [newReq, ...prev]);
    addAuditLog('MaintenanceRequest', newReq.id, 'CREATE', `إنشاء طلب صيانة جديد: ${newReq.requestNumber} للمعدة: ${newReq.equipmentReference}`);
    showToast(`تم إرسال طلب الصيانة رقم ${newReq.requestNumber} بنجاح للاعتماد.`);
    return { success: true };
  };

  const approveMaintenanceRequest = (id: string): { success: boolean; error?: string } => {
    const req = maintenanceRequests.find((r) => r.id === id);
    if (!req) return { success: false, error: 'طلب الصيانة غير موجود.' };

    // Prevent approving own request (separation of duties from PRD)
    if (req.requestedByUserId === currentUser.id) {
      return { success: false, error: 'لا يمكن لمقدم الطلب اعتماده بنفسه (فصل المهام والصلاحيات). يجب أن يتم الاعتماد بواسطة مدير الصيانة.' };
    }

    const updatedItems = req.items.map((it) => ({
      ...it,
      approvedQty: it.requestedQty,
    }));

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const updatedReq: MaintenanceRequest = {
      ...req,
      status: 'approved',
      items: updatedItems,
      approvedByUserId: currentUser.id,
      approvedByUserName: `${currentUser.fullName} (${currentUser.roleTitleAr})`,
      approvedAt: now,
      statusHistory: [
        ...req.statusHistory,
        {
          fromStatus: req.status,
          toStatus: 'approved',
          changedByUserId: currentUser.id,
          changedByUserName: currentUser.fullName,
          timestamp: now,
          notes: 'تمت الموافقة على الطلب بالكامل وأحيل للمستودع للصرف',
        },
      ],
    };

    setMaintenanceRequests((prev) => prev.map((r) => (r.id === id ? updatedReq : r)));
    addAuditLog('MaintenanceRequest', id, 'APPROVE', `اعتماد طلب الصيانة ${req.requestNumber}`);
    showToast(`تم اعتماد طلب الصيانة ${req.requestNumber}، وهو متاح الآن في قائمة صرف المستودع.`);
    return { success: true };
  };

  const rejectMaintenanceRequest = (id: string, reason: string): { success: boolean; error?: string } => {
    if (!reason || reason.trim().length < 5) {
      return { success: false, error: 'سبب الرفض إلزامي ويجب ألا يقل عن 5 أحرف.' };
    }

    const req = maintenanceRequests.find((r) => r.id === id);
    if (!req) return { success: false, error: 'طلب الصيانة غير موجود.' };

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const updatedReq: MaintenanceRequest = {
      ...req,
      status: 'rejected',
      rejectionReason: reason.trim(),
      statusHistory: [
        ...req.statusHistory,
        {
          fromStatus: req.status,
          toStatus: 'rejected',
          changedByUserId: currentUser.id,
          changedByUserName: currentUser.fullName,
          timestamp: now,
          notes: `تم الرفض لسبب: ${reason.trim()}`,
        },
      ],
    };

    setMaintenanceRequests((prev) => prev.map((r) => (r.id === id ? updatedReq : r)));
    addAuditLog('MaintenanceRequest', id, 'REJECT', `رفض طلب الصيانة ${req.requestNumber} لسبب: ${reason.trim()}`);
    showToast(`تم رفض طلب الصيانة ${req.requestNumber}.`);
    return { success: true };
  };

  const fulfillMaintenanceRequest = (id: string): { success: boolean; error?: string } => {
    const req = maintenanceRequests.find((r) => r.id === id);
    if (!req) return { success: false, error: 'طلب الصيانة غير موجود.' };
    if (req.status !== 'approved') {
      return { success: false, error: 'لا يمكن صرف طلب صيانة غير معتمد.' };
    }

    // Check stock for all items
    for (const line of req.items) {
      const itm = items.find((i) => i.id === line.itemId);
      const qtyToIssue = line.approvedQty || line.requestedQty;
      if (!itm || itm.totalQuantity < qtyToIssue) {
        return {
          success: false,
          error: `الرصيد المتاح للصنف ${line.itemCode} (${itm?.totalQuantity || 0}) أقل من الكمية المعتمدة (${qtyToIssue}). لا يمكن استكمال الصرف.`,
        };
      }
    }

    // Deduct stock and create movements for each line
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newMovementsToAdd: StockMovement[] = [];

    setItems((prevItems) => {
      let updated = [...prevItems];
      for (const line of req.items) {
        const qtyToIssue = line.approvedQty || line.requestedQty;
        const target = updated.find((i) => i.id === line.itemId);
        if (target) {
          const fromLoc = target.locations[0] || { locationId: 'SP-01', locationPath: 'المستودع الرئيسي', quantity: 0 };
          const newLocations = target.locations
            .map((loc, idx) => (idx === 0 ? { ...loc, quantity: Math.max(0, loc.quantity - qtyToIssue) } : loc))
            .filter((l) => l.quantity > 0);

          const updatedTarget: Item = {
            ...target,
            totalQuantity: Math.max(0, target.totalQuantity - qtyToIssue),
            locations: newLocations,
          };

          updated = updated.map((i) => (i.id === target.id ? updatedTarget : i));
          updateItemAlerts(updatedTarget, updatedTarget.totalQuantity);

          newMovementsToAdd.push({
            id: `TRX-${Date.now()}-${line.itemId}`,
            movementNumber: `TRX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
            type: 'issue',
            typeAr: 'صرف لطلب صيانة',
            itemId: target.id,
            itemCode: target.code,
            itemName: target.name,
            quantity: qtyToIssue,
            unitName: target.unitName,
            unitCost: target.avgCost,
            totalValue: Number((target.avgCost * qtyToIssue).toFixed(2)),
            fromLocationId: fromLoc.locationId,
            fromLocationPath: fromLoc.locationPath,
            reason: `صرف بموجب طلب الصيانة المعتمد ${req.requestNumber} للمعدة (${req.equipmentReference})`,
            maintenanceRequestId: req.id,
            maintenanceRequestNumber: req.requestNumber,
            createdAt: now,
            createdByUserId: currentUser.id,
            createdByUserName: `${currentUser.fullName} (مدير المستودع)`,
          });
        }
      }
      return updated;
    });

    if (newMovementsToAdd.length > 0) {
      setMovements((prev) => [...newMovementsToAdd, ...prev]);
    }

    const updatedReq: MaintenanceRequest = {
      ...req,
      status: 'fulfilled',
      fulfilledAt: now,
      fulfilledByUserId: currentUser.id,
      fulfilledByUserName: `${currentUser.fullName} (${currentUser.roleTitleAr})`,
      items: req.items.map((it) => ({
        ...it,
        issuedQty: it.approvedQty || it.requestedQty,
      })),
      statusHistory: [
        ...req.statusHistory,
        {
          fromStatus: req.status,
          toStatus: 'fulfilled',
          changedByUserId: currentUser.id,
          changedByUserName: currentUser.fullName,
          timestamp: now,
          notes: 'تم صرف جميع قطع الغيار من المستودع بنجاح وتحديث الأرصدة تلقائياً',
        },
      ],
    };

    setMaintenanceRequests((prev) => prev.map((r) => (r.id === id ? updatedReq : r)));
    addAuditLog('MaintenanceRequest', id, 'FULFILL', `صرف طلب الصيانة ${req.requestNumber} وتسجيل حركات صرف`);
    showToast(`تم صرف قطع الغيار لطلب الصيانة ${req.requestNumber} بنجاح وتسجيل حركات الإخراج.`);
    return { success: true };
  };

  const cancelMaintenanceRequest = (id: string): { success: boolean; error?: string } => {
    const req = maintenanceRequests.find((r) => r.id === id);
    if (!req) return { success: false, error: 'طلب الصيانة غير موجود.' };
    if (req.status !== 'submitted' && req.status !== 'draft') {
      return { success: false, error: 'لا يمكن إلغاء الطلب بعد اعتماده أو صرفه.' };
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const updatedReq: MaintenanceRequest = {
      ...req,
      status: 'cancelled',
      statusHistory: [
        ...req.statusHistory,
        {
          fromStatus: req.status,
          toStatus: 'cancelled',
          changedByUserId: currentUser.id,
          changedByUserName: currentUser.fullName,
          timestamp: now,
          notes: 'تم إلغاء الطلب من قبل المستخدم',
        },
      ],
    };

    setMaintenanceRequests((prev) => prev.map((r) => (r.id === id ? updatedReq : r)));
    addAuditLog('MaintenanceRequest', id, 'UPDATE', `إلغاء طلب الصيانة ${req.requestNumber}`);
    showToast(`تم إلغاء طلب الصيانة ${req.requestNumber}.`);
    return { success: true };
  };

  const acknowledgeAlert = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'acknowledged' } : a)));
    showToast('تم تأكيد واستلام التنبيه.');
  };

  const addWarehouse = (name: string, code: string) => {
    const newWh: Warehouse = {
      id: `WH-${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      type: 'warehouse',
      shelves: [],
    };
    setWarehouses((prev) => [...prev, newWh]);
    addAuditLog('Location', newWh.id, 'CREATE', `إضافة مستودع جديد: ${name}`);
    showToast(`تمت إضافة المستودع: ${name}`);
  };

  const addShelf = (warehouseId: string, name: string) => {
    const newShelf = {
      id: `SH-${Date.now()}`,
      name: name.trim(),
      type: 'shelf' as const,
      warehouseId,
      spots: [],
    };
    setWarehouses((prev) =>
      prev.map((w) => (w.id === warehouseId ? { ...w, shelves: [...w.shelves, newShelf] } : w))
    );
    showToast(`تمت إضافة الرف: ${name}`);
  };

  const addSpot = (warehouseId: string, shelfId: string, name: string) => {
    const targetWh = warehouses.find((w) => w.id === warehouseId);
    const targetSh = targetWh?.shelves.find((s) => s.id === shelfId);
    const fullPath = `${targetWh?.name || 'مستودع'} / ${targetSh?.name || 'رف'} / ${name.trim()}`;

    const newSpot = {
      id: `SP-${Date.now()}`,
      name: name.trim(),
      type: 'spot' as const,
      shelfId,
      warehouseId,
      fullPath,
    };

    setWarehouses((prev) =>
      prev.map((w) => {
        if (w.id !== warehouseId) return w;
        return {
          ...w,
          shelves: w.shelves.map((sh) => (sh.id === shelfId ? { ...sh, spots: [...sh.spots, newSpot] } : sh)),
        };
      })
    );
    showToast(`تمت إضافة الخانة: ${name}`);
  };

  const addSupplier = (supData: Partial<Supplier>): { success: boolean; error?: string } => {
    if (!supData.name || supData.name.trim().length === 0) {
      return { success: false, error: 'اسم المورد إلزامي.' };
    }
    const newSup: Supplier = {
      id: `SUP-${Date.now()}`,
      name: supData.name.trim(),
      contactPerson: supData.contactPerson || '',
      phone: supData.phone || '',
      email: supData.email || '',
      address: supData.address || '',
      isActive: true,
    };
    setSuppliers((prev) => [newSup, ...prev]);
    addAuditLog('Supplier', newSup.id, 'CREATE', `إضافة مورد جديد: ${newSup.name}`);
    showToast(`تمت إضافة المورد ${newSup.name} بنجاح.`);
    return { success: true };
  };

  const addSupplierPrice = (itemId: string, supplierId: string, price: number, notes?: string) => {
    const sup = suppliers.find((s) => s.id === supplierId);
    if (!sup) return;

    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== itemId) return i;
        const newPriceEntry = {
          id: `SP-${Date.now()}`,
          supplierId,
          supplierName: sup.name,
          price: Number(price),
          currency: 'ج.م',
          date: new Date().toISOString().slice(0, 10),
          notes,
        };
        const filteredPrices = i.supplierPrices.filter((p) => p.supplierId !== supplierId);
        return {
          ...i,
          supplierPrices: [newPriceEntry, ...filteredPrices],
        };
      })
    );
  };

  const importItems = (newItems: Item[]) => {
    setItems((prev) => [...newItems, ...prev]);
    addAuditLog('Item', 'BATCH-IMPORT', 'IMPORT', `استيراد جماعي لعدد ${newItems.length} صنف من ملف إكسل`);
    showToast(`تم استيراد ${newItems.length} صنف بنجاح وإضافتها إلى الدليل.`);
  };

  // User Management & Permissions
  const addUser = (userData: {
    fullName: string;
    username: string;
    role: RoleType;
    department: string;
    password?: string;
  }): { success: boolean; error?: string } => {
    if (!userData.fullName?.trim() || !userData.username?.trim()) {
      return { success: false, error: 'الاسم واسم المستخدم مطلوبان.' };
    }

    const cleanUsername = userData.username.trim().toLowerCase();
    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: `اسم المستخدم "${cleanUsername}" مسجل مسبقاً لموظف آخر.` };
    }

    const roleTitles: Record<RoleType, string> = {
      ADMIN: 'مسؤول النظام',
      WAREHOUSE_MANAGER: 'مدير المستودع (المستخدم الرئيسي)',
      MAINTENANCE_ENGINEER: 'مهندس صيانة',
      MAINTENANCE_MANAGER: 'مدير الصيانة',
      PROCUREMENT_OFFICER: 'مسؤولة المشتريات',
      PLANT_MANAGER: 'مدير المصنع / المراقب المالي',
    };

    const roleColors: Record<RoleType, string> = {
      ADMIN: 'bg-slate-800',
      WAREHOUSE_MANAGER: 'bg-purple-700',
      MAINTENANCE_ENGINEER: 'bg-indigo-600',
      MAINTENANCE_MANAGER: 'bg-violet-800',
      PROCUREMENT_OFFICER: 'bg-fuchsia-700',
      PLANT_MANAGER: 'bg-purple-900',
    };

    const newUser: User = {
      id: `USR-${Date.now()}`,
      fullName: userData.fullName.trim(),
      username: cleanUsername,
      role: userData.role,
      roleTitleAr: roleTitles[userData.role] || userData.role,
      department: userData.department.trim() || 'قسم عام',
      avatarColor: roleColors[userData.role] || 'bg-purple-600',
      password: userData.password || '123456',
      isActive: true,
    };

    setUsers((prev) => [...prev, newUser]);
    addAuditLog('User', newUser.id, 'CREATE', `إضافة موظف جديد: ${newUser.fullName} وتعيين صلاحية (${newUser.roleTitleAr})`);
    showToast(`تمت إضافة الموظف ${newUser.fullName} بنجاح.`);
    return { success: true };
  };

  const updateUserRole = (userId: string, newRole: RoleType): { success: boolean; error?: string } => {
    const userToUpdate = users.find((u) => u.id === userId);
    if (!userToUpdate) return { success: false, error: 'المستخدم غير موجود.' };

    const roleTitles: Record<RoleType, string> = {
      ADMIN: 'مسؤول النظام',
      WAREHOUSE_MANAGER: 'مدير المستودع (المستخدم الرئيسي)',
      MAINTENANCE_ENGINEER: 'مهندس صيانة',
      MAINTENANCE_MANAGER: 'مدير الصيانة',
      PROCUREMENT_OFFICER: 'مسؤولة المشتريات',
      PLANT_MANAGER: 'مدير المصنع / المراقب المالي',
    };

    const newTitle = roleTitles[newRole] || newRole;

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole, roleTitleAr: newTitle } : u))
    );

    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, role: newRole, roleTitleAr: newTitle }));
    }

    addAuditLog(
      'User',
      userId,
      'UPDATE',
      `تعديل صلاحية الموظف ${userToUpdate.fullName} من (${userToUpdate.roleTitleAr}) إلى (${newTitle})`
    );
    showToast(`تم تحديث صلاحية ${userToUpdate.fullName} إلى (${newTitle}) بنجاح.`);
    return { success: true };
  };

  const updateUser = (userId: string, updates: Partial<User>): { success: boolean; error?: string } => {
    const userToUpdate = users.find((u) => u.id === userId);
    if (!userToUpdate) return { success: false, error: 'المستخدم غير موجود.' };

    if (updates.username && updates.username !== userToUpdate.username) {
      const cleanUsername = updates.username.trim().toLowerCase();
      if (users.some((u) => u.id !== userId && u.username.toLowerCase() === cleanUsername)) {
        return { success: false, error: `اسم المستخدم "${cleanUsername}" مسجل بالفعل لموظف آخر.` };
      }
    }

    const roleTitles: Record<RoleType, string> = {
      ADMIN: 'مسؤول النظام',
      WAREHOUSE_MANAGER: 'مدير المستودع (المستخدم الرئيسي)',
      MAINTENANCE_ENGINEER: 'مهندس صيانة',
      MAINTENANCE_MANAGER: 'مدير الصيانة',
      PROCUREMENT_OFFICER: 'مسؤولة المشتريات',
      PLANT_MANAGER: 'مدير المصنع / المراقب المالي',
    };

    const finalRole = updates.role || userToUpdate.role;
    const finalRoleTitle = updates.role ? (roleTitles[updates.role] || updates.role) : userToUpdate.roleTitleAr;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              ...updates,
              role: finalRole,
              roleTitleAr: finalRoleTitle,
            }
          : u
      )
    );

    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({
        ...prev,
        ...updates,
        role: finalRole,
        roleTitleAr: finalRoleTitle,
      }));
    }

    addAuditLog('User', userId, 'UPDATE', `تعديل بيانات وصلاحيات الموظف: ${userToUpdate.fullName}`);
    showToast(`تم تحديث بيانات الموظف ${userToUpdate.fullName} بنجاح.`);
    return { success: true };
  };

  // User Switch Restriction with Password
  const requestUserSwitch = (user: User) => {
    setAuthTargetUser(user);
    setIsAuthModalOpen(true);
  };

  const verifyAndSwitchUser = (password: string): { success: boolean; error?: string } => {
    if (!authTargetUser) {
      return { success: false, error: 'لم يتم تحديد المستخدم المراد الانتقال إليه.' };
    }

    const expectedPassword = authTargetUser.password || '123456';
    if (password !== expectedPassword && password !== '123456') {
      return {
        success: false,
        error: 'كلمة المرور غير صحيحة. كلمة المرور الافتراضية لجميع المستخدمين هي 123456.',
      };
    }

    setCurrentUser(authTargetUser);
    setIsAuthModalOpen(false);
    setAuthTargetUser(null);
    addAuditLog('User', authTargetUser.id, 'UPDATE', `تسجيل دخول ناجح للمستخدم: ${authTargetUser.fullName} (${authTargetUser.roleTitleAr})`);
    showToast(`تم تسجيل الدخول بنجاح بصلاحيات: ${authTargetUser.fullName}`);
    return { success: true };
  };

  // Inventory Count & Adjustments
  const recordInventoryCountAdjustment = (data: {
    itemId: string;
    locationId: string;
    actualQty: number;
    varianceType: VarianceType;
    reason: string;
    sessionTitle?: string;
  }): { success: boolean; error?: string } => {
    const item = items.find((i) => i.id === data.itemId);
    if (!item) return { success: false, error: 'الصنف غير موجود.' };

    if (!data.reason || data.reason.trim().length < 5) {
      return { success: false, error: 'سبب التسوية إلزامي ويجب ألا يقل عن 5 أحرف لتبرير العجز أو الفائض.' };
    }

    if (data.actualQty < 0) {
      return { success: false, error: 'الرصيد الفعلي لا يمكن أن يكون سالباً.' };
    }

    let locPath = '';
    for (const w of warehouses) {
      for (const sh of w.shelves) {
        for (const sp of sh.spots) {
          if (sp.id === data.locationId) locPath = sp.fullPath;
        }
      }
    }

    const currentLocBal = item.locations.find((l) => l.locationId === data.locationId);
    const systemQty = currentLocBal ? currentLocBal.quantity : 0;
    const varianceQty = data.actualQty - systemQty;
    const varianceValue = Number((varianceQty * item.avgCost).toFixed(2));

    const varianceTypeArMap: Record<VarianceType, string> = {
      damage: 'تلف أو كسر أثناء النقل والتشغيل',
      loss: 'عجز غير مبرر / فقدان',
      expiry: 'انتهاء تاريخ الصلاحية واستبعاد',
      data_error: 'خطأ إدخال أو تسجيل سابق',
      surplus: 'زيادة وفائض غير مسجل',
      routine: 'تسوية جردية دورية معتمدة',
    };

    const newAdjustmentRecord: InventoryAdjustmentRecord = {
      id: `ADJ-${Date.now()}`,
      adjustmentNumber: `ADJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      itemId: item.id,
      itemCode: item.code,
      itemName: item.name,
      unitName: item.unitName,
      locationId: data.locationId,
      locationPath: locPath || currentLocBal?.locationPath || 'المستودع الرئيسي',
      systemQty,
      actualQty: data.actualQty,
      varianceQty,
      unitCost: item.avgCost,
      varianceValue,
      varianceType: data.varianceType,
      varianceTypeAr: varianceTypeArMap[data.varianceType] || 'تسوية جردية',
      reason: data.reason.trim(),
      adjustedByUserId: currentUser.id,
      adjustedByUserName: `${currentUser.fullName} (${currentUser.roleTitleAr})`,
      adjustedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      sessionTitle: data.sessionTitle || 'جرد ميداني مباشر',
      status: 'approved',
    };

    // Update item stock atomically
    const newTotalQty = Math.max(0, item.totalQuantity + varianceQty);
    let newLocations = [...item.locations];
    if (currentLocBal) {
      newLocations = newLocations
        .map((l) => (l.locationId === data.locationId ? { ...l, quantity: data.actualQty } : l))
        .filter((l) => l.quantity > 0);
    } else if (data.actualQty > 0) {
      newLocations.push({ locationId: data.locationId, locationPath: locPath || 'المستودع الرئيسي', quantity: data.actualQty });
    }

    const updatedItem: Item = {
      ...item,
      totalQuantity: newTotalQty,
      locations: newLocations,
    };

    setItems((prev) => prev.map((i) => (i.id === item.id ? updatedItem : i)));
    setAdjustments((prev) => [newAdjustmentRecord, ...prev]);

    // Record StockMovement as adjustment
    const newMovement: StockMovement = {
      id: `TRX-${Date.now()}`,
      movementNumber: `TRX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'adjustment',
      typeAr: 'تسوية جردية (جرد فعلي)',
      itemId: item.id,
      itemCode: item.code,
      itemName: item.name,
      quantity: varianceQty,
      unitName: item.unitName,
      unitCost: item.avgCost,
      totalValue: Math.abs(varianceValue),
      fromLocationId: varianceQty < 0 ? data.locationId : undefined,
      fromLocationPath: varianceQty < 0 ? locPath : undefined,
      toLocationId: varianceQty > 0 ? data.locationId : undefined,
      toLocationPath: varianceQty > 0 ? locPath : undefined,
      reason: `تسوية جرد (${varianceTypeArMap[data.varianceType]}): ${data.reason.trim()}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      createdByUserId: currentUser.id,
      createdByUserName: `${currentUser.fullName} (${currentUser.roleTitleAr})`,
    };

    setMovements((prev) => [newMovement, ...prev]);
    updateItemAlerts(updatedItem, newTotalQty);

    addAuditLog(
      'InventoryCount',
      newAdjustmentRecord.id,
      'UPDATE',
      `تسوية جرد للصنف ${item.code}: الدفتري ${systemQty} ← الفعلي ${data.actualQty} (${varianceQty > 0 ? '+' : ''}${varianceQty} ${item.unitName}) - السبب: ${data.reason.trim()}`
    );

    showToast(`تم حفظ تسوية الجرد للصنف (${item.code}) وتحديث الرصيد الفعلي.`);
    return { success: true };
  };

  const createCountSession = (title: string, warehouseId?: string, notes?: string): { success: boolean; error?: string } => {
    if (!title?.trim()) {
      return { success: false, error: 'عنوان جلسة الجرد مطلوب.' };
    }
    const wh = warehouses.find((w) => w.id === warehouseId);
    const newSession: InventoryCountSession = {
      id: `SES-${Date.now()}`,
      sessionNumber: `CNT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      title: title.trim(),
      warehouseId,
      warehouseName: wh ? wh.name : 'كافة المستودعات',
      startedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'in_progress',
      totalItemsCounted: 0,
      matchedCount: 0,
      varianceCount: 0,
      totalVarianceValue: 0,
      conductedByUserId: currentUser.id,
      conductedByUserName: `${currentUser.fullName} (${currentUser.roleTitleAr})`,
      notes,
    };
    setCountSessions((prev) => [newSession, ...prev]);
    addAuditLog('InventoryCount', newSession.id, 'CREATE', `بدء جلسة جرد جديدة: ${newSession.title}`);
    showToast(`تم فتح جلسة الجرد (${newSession.title}) بنجاح.`);
    return { success: true };
  };

  const resetToDefaultData = () => {
    setItems(INITIAL_ITEMS);
    setMovements(INITIAL_MOVEMENTS);
    setMaintenanceRequests(INITIAL_MAINTENANCE_REQUESTS);
    setWarehouses(INITIAL_WAREHOUSES);
    setSuppliers(INITIAL_SUPPLIERS);
    setAlerts(INITIAL_ALERTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setUsers(INITIAL_USERS);
    setAdjustments(INITIAL_ADJUSTMENTS);
    setCountSessions(INITIAL_COUNT_SESSIONS);
    localStorage.removeItem(STORAGE_KEY);
    showToast('تمت استعادة البيانات الأولية النموذجية بنجاح.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        items,
        categories,
        units,
        warehouses,
        suppliers,
        movements,
        maintenanceRequests,
        alerts,
        auditLogs,
        activeTab,
        setActiveTab,
        expiryWindowDays,
        setExpiryWindowDays,
        currency,
        toast,
        showToast,

        isScannerOpen,
        setIsScannerOpen,
        scannerPreselectedItem,
        setScannerPreselectedItem,

        isMovementModalOpen,
        setIsMovementModalOpen,
        movementModalDefaultType,
        setMovementModalDefaultType,
        movementModalDefaultItemId,
        setMovementModalDefaultItemId,

        isRequestModalOpen,
        setIsRequestModalOpen,

        isItemModalOpen,
        setIsItemModalOpen,
        editingItem,
        setEditingItem,

        isLabelModalOpen,
        setIsLabelModalOpen,
        labelModalItem,
        setLabelModalItem,

        isLocationModalOpen,
        setIsLocationModalOpen,

        addItem,
        updateItem,
        deactivateItem,
        recordMovement,
        createMaintenanceRequest,
        approveMaintenanceRequest,
        rejectMaintenanceRequest,
        fulfillMaintenanceRequest,
        cancelMaintenanceRequest,
        acknowledgeAlert,
        addWarehouse,
        addShelf,
        addSpot,
        addSupplier,
        addSupplierPrice,
        importItems,
        resetToDefaultData,

        addUser,
        updateUser,
        updateUserRole,

        isAuthModalOpen,
        setIsAuthModalOpen,
        authTargetUser,
        setAuthTargetUser,
        requestUserSwitch,
        verifyAndSwitchUser,

        adjustments,
        countSessions,
        recordInventoryCountAdjustment,
        createCountSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
