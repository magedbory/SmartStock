/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShoppingCart,
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Download,
  Flame,
  TrendingDown,
  Sparkles,
  ArrowRight,
  Trash2,
  Send,
  Building2,
  FileSpreadsheet,
  Check,
  Search,
  Eye,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  PackageCheck
} from 'lucide-react';
import { PurchaseRequisition, PurchaseRequisitionItem, RequisitionReason, RequisitionStatus, Item } from '../types';

export const PurchaseRequisitionsView: React.FC = () => {
  const {
    items,
    suppliers,
    currency,
    currentUser,
    companyProfile,
    purchaseRequisitions,
    createPurchaseRequisition,
    updatePurchaseRequisitionStatus,
    getItemConsumption60Days,
    setActiveTab
  } = useApp();

  const [activeTabMode, setActiveTabMode] = useState<'SUGGESTIONS' | 'CREATE' | 'HISTORY'>('SUGGESTIONS');
  const [filterReason, setFilterReason] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Requisition Form State
  const [reqTitle, setReqTitle] = useState('طلب توريد دوري — تعويض النواقص واستهلاك الـ 60 يوماً');
  const [reqDepartment, setReqDepartment] = useState('إدارة المستودعات وورش الصيانة');
  const [reqPriority, setReqPriority] = useState<'urgent' | 'high' | 'normal' | 'low'>('high');
  const [reqTargetDate, setReqTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().slice(0, 10);
  });
  const [reqTrackingNotes, setReqTrackingNotes] = useState('طلب شراء موجه لإدارة المشتريات للتعاقد الفوري مع الموردين المعتمدين');
  const [cartItems, setCartItems] = useState<PurchaseRequisitionItem[]>([]);

  // Manual item addition modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualItemId, setManualItemId] = useState('');
  const [manualQty, setManualQty] = useState(10);
  const [manualNotes, setManualNotes] = useState('');
  const [manualSupplierId, setManualSupplierId] = useState('');

  // View / Print Requisition Modal
  const [selectedReqForView, setSelectedReqForView] = useState<PurchaseRequisition | null>(null);

  // Compute smart analytics for all items
  const itemsAnalytics = useMemo(() => {
    return items.map((item) => {
      const stats = getItemConsumption60Days(item.id);
      const stock = item.totalQuantity ?? item.totalStock ?? 0;
      const reorder = item.reorderPoint ?? Math.ceil(item.minStock * 1.3);
      const isShortage = stock <= item.minStock;
      const isReorder = stock <= reorder;
      const isNew = stock === 0 || (item.createdAt && (item.createdAt.includes('2026-10-15') || item.createdAt.includes('2026-10-16')));

      return {
        item,
        ...stats,
        isShortage,
        isReorder,
        isNew,
      };
    });
  }, [items, getItemConsumption60Days]);

  // Filter suggested items
  const suggestedItems = useMemo(() => {
    return itemsAnalytics.filter((record) => {
      // Must match search query
      const matchSearch =
        record.item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (record.item.partNumber && record.item.partNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      // Filter category
      if (filterReason === 'SHORTAGE') return record.isShortage;
      if (filterReason === 'NEW_ITEM') return record.isNew;
      if (filterReason === 'HIGH_DEMAND') return record.reasonType === 'high_demand';
      if (filterReason === 'REORDER') return record.isReorder;

      // 'ALL' shows items that need purchase (shortage, high demand, new, or below reorder)
      return record.isReorder || record.isNew || record.reasonType === 'high_demand';
    });
  }, [itemsAnalytics, searchQuery, filterReason]);

  // Add a suggested item to current requisition cart
  const addToRequisition = (record: (typeof itemsAnalytics)[0]) => {
    const existingIndex = cartItems.findIndex((ci) => ci.itemId === record.item.id);
    if (existingIndex >= 0) {
      // already in cart
      return;
    }

    const preferredSup = suppliers.find((s) => s.id === record.item.preferredSupplierId) || suppliers[0];
    const unitPrice = record.item.avgCost || record.item.unitCost || 100;
    const requestedQty = record.suggestedQuantity;
    const currentStock = record.item.totalQuantity ?? record.item.totalStock ?? 0;
    const reorderPoint = record.item.reorderPoint ?? Math.ceil(record.item.minStock * 1.3);

    const newItem: PurchaseRequisitionItem = {
      id: `PRI-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      itemId: record.item.id,
      itemCode: record.item.code,
      itemName: record.item.name,
      unit: record.item.unitName,
      currentStock,
      minQuantity: record.item.minStock,
      reorderPoint,
      consumptionLast60Days: record.consumptionLast60Days,
      dailyBurnRate: record.dailyBurnRate,
      suggestedQuantity: record.suggestedQuantity,
      requestedQuantity: requestedQty,
      estimatedUnitPrice: unitPrice,
      totalPrice: unitPrice * requestedQty,
      preferredSupplierId: preferredSup?.id,
      preferredSupplierName: preferredSup?.name,
      reasonType: record.reasonType,
      notes: record.reasonText,
    };

    setCartItems((prev) => [...prev, newItem]);
  };

  // Add all suggested items into cart
  const addAllSuggestedToRequisition = () => {
    suggestedItems.forEach((rec) => {
      addToRequisition(rec);
    });
    setActiveTabMode('CREATE');
  };

  // Update quantity in cart
  const updateCartItemQuantity = (id: string, qty: number) => {
    const safeQty = Math.max(1, qty);
    setCartItems((prev) =>
      prev.map((itm) => {
        if (itm.id === id) {
          return {
            ...itm,
            requestedQuantity: safeQty,
            totalPrice: safeQty * itm.estimatedUnitPrice,
          };
        }
        return itm;
      })
    );
  };

  // Update unit price in cart
  const updateCartItemPrice = (id: string, price: number) => {
    const safePrice = Math.max(0, price);
    setCartItems((prev) =>
      prev.map((itm) => {
        if (itm.id === id) {
          return {
            ...itm,
            estimatedUnitPrice: safePrice,
            totalPrice: itm.requestedQuantity * safePrice,
          };
        }
        return itm;
      })
    );
  };

  // Remove from cart
  const removeCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Add Manual Item Submit
  const handleAddManualItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualItemId) return;
    const item = items.find((i) => i.id === manualItemId);
    if (!item) return;

    const stats = getItemConsumption60Days(item.id);
    const sup = suppliers.find((s) => s.id === manualSupplierId) || suppliers[0];
    const unitPrice = item.avgCost || item.unitCost || 120;
    const currentStock = item.totalQuantity ?? item.totalStock ?? 0;
    const reorderPoint = item.reorderPoint ?? Math.ceil(item.minStock * 1.3);

    const newItem: PurchaseRequisitionItem = {
      id: `PRI-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      itemId: item.id,
      itemCode: item.code,
      itemName: item.name,
      unit: item.unitName,
      currentStock,
      minQuantity: item.minStock,
      reorderPoint,
      consumptionLast60Days: stats.consumptionLast60Days,
      dailyBurnRate: stats.dailyBurnRate,
      suggestedQuantity: stats.suggestedQuantity,
      requestedQuantity: manualQty,
      estimatedUnitPrice: unitPrice,
      totalPrice: unitPrice * manualQty,
      preferredSupplierId: sup?.id,
      preferredSupplierName: sup?.name,
      reasonType: 'manual',
      notes: manualNotes || 'إضافة يدوية بناء على طلب الورشة',
    };

    setCartItems((prev) => [...prev, newItem]);
    setIsManualModalOpen(false);
    setManualItemId('');
    setManualNotes('');
    setManualQty(10);
  };

  // Submit Requisition
  const handleSubmitRequisition = () => {
    if (cartItems.length === 0) return;

    const res = createPurchaseRequisition({
      title: reqTitle,
      department: reqDepartment,
      priority: reqPriority,
      targetDeliveryDate: reqTargetDate,
      items: cartItems,
      trackingNotes: reqTrackingNotes,
    });

    if (res.success) {
      setCartItems([]);
      setActiveTabMode('HISTORY');
    }
  };

  // Total cart estimated value
  const cartTotalCost = useMemo(() => {
    return cartItems.reduce((acc, cur) => acc + cur.totalPrice, 0);
  }, [cartItems]);

  // Stats for the top cards
  const urgentCount = itemsAnalytics.filter((i) => i.isShortage).length;
  const newItemsCount = itemsAnalytics.filter((i) => i.isNew).length;
  const totalHistoricalPending = purchaseRequisitions.filter(
    (p) => p.status === 'sent_to_purchasing' || p.status === 'draft'
  ).length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-purple-800/40">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full border border-emerald-400/30 font-bold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                محرك التنبؤ واقتراح المشتريات الذكي
              </span>
              <span className="bg-purple-800/60 text-purple-200 text-xs px-2.5 py-1 rounded-full border border-purple-700/50">
                تحليل سحب آخر 60 يوم
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-purple-300" />
              إصدار طلبات واقتراحات الشراء لإدارة المشتريات
            </h1>
            <p className="text-purple-200 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
              تحديد تلقائي للنواقص دون الحدود الدنيا، احتساب معدل الاستهلاك الفعلي خلال آخر 60 يوماً، وتوليد طلبات شراء رسمية معتمدة لإرسالها لإدارة المشتريات بالمصنع.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTabMode('CREATE')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Plus className="h-4 w-4" />
              <span>إنشاء طلب شراء جديد ({cartItems.length})</span>
            </button>
            <button
              onClick={() => setActiveTabMode('HISTORY')}
              className="px-4 py-2.5 rounded-xl bg-purple-800/70 hover:bg-purple-700/80 text-purple-100 font-bold text-xs sm:text-sm border border-purple-600/40 flex items-center gap-2 transition-all"
            >
              <FileSpreadsheet className="h-4 w-4 text-purple-300" />
              <span>سجل الطلبات الصادرة ({purchaseRequisitions.length})</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-purple-800/50">
          <div className="bg-purple-950/50 rounded-2xl p-3 border border-purple-800/40">
            <div className="text-[11px] text-purple-300 font-medium">أصناف دون الحد الأدنى (نواقص)</div>
            <div className="text-xl font-black text-rose-300 mt-1 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-rose-400" />
              {urgentCount} صنف حرج
            </div>
          </div>

          <div className="bg-purple-950/50 rounded-2xl p-3 border border-purple-800/40">
            <div className="text-[11px] text-purple-300 font-medium">أصناف جديدة مضافة للمصنع</div>
            <div className="text-xl font-black text-amber-300 mt-1 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              {newItemsCount} صنف جديد
            </div>
          </div>

          <div className="bg-purple-950/50 rounded-2xl p-3 border border-purple-800/40">
            <div className="text-[11px] text-purple-300 font-medium">إجمالي الأصناف المقترح شراؤها</div>
            <div className="text-xl font-black text-emerald-300 mt-1 flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-emerald-400" />
              {suggestedItems.length} صنف مقترح
            </div>
          </div>

          <div className="bg-purple-950/50 rounded-2xl p-3 border border-purple-800/40">
            <div className="text-[11px] text-purple-300 font-medium">طلبات بانتظار التوريد</div>
            <div className="text-xl font-black text-purple-100 mt-1 flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-300" />
              {totalHistoricalPending} طلب شراء
            </div>
          </div>
        </div>
      </div>

      {/* Main Mode Navigation Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-purple-200/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTabMode('SUGGESTIONS')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
              activeTabMode === 'SUGGESTIONS'
                ? 'bg-purple-900 text-white shadow-md shadow-purple-950/20'
                : 'bg-white text-slate-700 hover:bg-purple-50 border border-slate-200'
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>محرك اقتراحات وتنبيهات الشراء ({suggestedItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTabMode('CREATE')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
              activeTabMode === 'CREATE'
                ? 'bg-purple-900 text-white shadow-md shadow-purple-950/20'
                : 'bg-white text-slate-700 hover:bg-purple-50 border border-slate-200'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>مسودة طلب الشراء الحالي</span>
            {cartItems.length > 0 && (
              <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.2 rounded-full font-bold">
                {cartItems.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTabMode('HISTORY')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
              activeTabMode === 'HISTORY'
                ? 'bg-purple-900 text-white shadow-md shadow-purple-950/20'
                : 'bg-white text-slate-700 hover:bg-purple-50 border border-slate-200'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>سجل الطلبات السابقة ({purchaseRequisitions.length})</span>
          </button>
        </div>

        {activeTabMode === 'SUGGESTIONS' && suggestedItems.length > 0 && (
          <button
            onClick={addAllSuggestedToRequisition}
            className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs border border-purple-300 flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Plus className="h-4 w-4 text-purple-700" />
            <span>إضافة جميع المقترحات تلقائياً لطلب الشراء ({suggestedItems.length})</span>
          </button>
        )}
      </div>

      {/* -------------------- TAB 1: SMART SUGGESTIONS & SHORTAGE MONITOR -------------------- */}
      {activeTabMode === 'SUGGESTIONS' && (
        <div className="space-y-4 animate-in fade-in">
          
          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="h-4 w-4 text-slate-400 absolute right-3 top-3" />
              <input
                type="text"
                placeholder="بحث باسم الصنف أو الكود..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none">
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1 shrink-0">
                <Filter className="h-3.5 w-3.5 text-purple-600" />
                تصنيف الاقتراح:
              </span>
              {[
                { id: 'ALL', label: 'كل المقترحات' },
                { id: 'SHORTAGE', label: 'النواقص دون الحد الأدنى' },
                { id: 'NEW_ITEM', label: 'أصناف جديدة مضافة' },
                { id: 'HIGH_DEMAND', label: 'عالية الاستهلاك (60 يوم)' },
                { id: 'REORDER', label: 'بلغت نقطة الطلب' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setFilterReason(btn.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    filterReason === btn.id
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-purple-100'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Suggested Items Table */}
          <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
            <div className="p-4 bg-purple-50/50 border-b border-purple-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-700" />
                <h3 className="text-sm font-bold text-purple-950">
                  قائمة الأصناف المقترح شراؤها بناء على النواقص واستهلاك آخر 60 يوماً
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                عدد الأصناف المعروضة: <strong className="text-purple-900 font-bold">{suggestedItems.length}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="p-3 font-bold">كود الصنف والاسم</th>
                    <th className="p-3 font-bold text-center">الرصيد الحالي</th>
                    <th className="p-3 font-bold text-center">الحد الأدنى ونقطة الطلب</th>
                    <th className="p-3 font-bold text-center bg-purple-50/60 text-purple-900">
                      سحب آخر 60 يوم (معدل يومي)
                    </th>
                    <th className="p-3 font-bold text-center bg-emerald-50/70 text-emerald-950">
                      الكمية المقترحة
                    </th>
                    <th className="p-3 font-bold">سبب الاقتراح والتنبيه</th>
                    <th className="p-3 font-bold text-center">التكلفة التقديرية</th>
                    <th className="p-3 font-bold text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {suggestedItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        لا توجد أصناف تطابق معايير الفلترة المحددة.
                      </td>
                    </tr>
                  ) : (
                    suggestedItems.map((record) => {
                      const inCart = cartItems.some((c) => c.itemId === record.item.id);
                      const unitCost = record.item.avgCost || record.item.unitCost || 100;
                      const estimatedTotal = unitCost * record.suggestedQuantity;
                      const currentQty = record.item.totalQuantity ?? record.item.totalStock ?? 0;
                      const reorderPoint = record.item.reorderPoint ?? Math.ceil(record.item.minStock * 1.3);

                      return (
                        <tr key={record.item.id} className="hover:bg-purple-50/30 transition-colors">
                          <td className="p-3 font-medium">
                            <div className="font-bold text-slate-900">{record.item.name}</div>
                            <div className="text-[11px] text-purple-700 font-mono mt-0.5">
                              {record.item.code} {record.item.partNumber && `| ${record.item.partNumber}`}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              الوحدة: {record.item.unitName} | {record.item.categoryName}
                            </div>
                          </td>

                          <td className="p-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md font-bold ${
                                record.isShortage
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {currentQty} {record.item.unitName}
                            </span>
                          </td>

                          <td className="p-3 text-center text-slate-600">
                            <div>الحد الأدنى: <strong>{record.item.minStock}</strong></div>
                            <div className="text-[11px] text-slate-400">إعادة الطلب: {reorderPoint}</div>
                          </td>

                          <td className="p-3 text-center bg-purple-50/30">
                            <span className="font-bold text-purple-950 block">
                              {record.consumptionLast60Days} {record.item.unitName}
                            </span>
                            <span className="text-[10px] text-purple-600 block mt-0.5">
                              ({record.dailyBurnRate} {record.item.unitName}/يوم)
                            </span>
                          </td>

                          <td className="p-3 text-center bg-emerald-50/40">
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-black text-xs shadow-xs">
                              {record.suggestedQuantity} {record.item.unitName}
                            </span>
                          </td>

                          <td className="p-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                                record.reasonType === 'shortage'
                                  ? 'bg-rose-100 text-rose-900 border border-rose-200'
                                  : record.reasonType === 'new_item'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                  : record.reasonType === 'high_demand'
                                  ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {record.reasonType === 'shortage' && <AlertTriangle className="h-3 w-3 text-rose-600" />}
                              {record.reasonType === 'new_item' && <Sparkles className="h-3 w-3 text-amber-600" />}
                              {record.reasonType === 'high_demand' && <TrendingDown className="h-3 w-3 text-indigo-600" />}
                              {record.reasonText}
                            </span>
                          </td>

                          <td className="p-3 text-center font-bold text-slate-800">
                            {estimatedTotal.toLocaleString()} {currency}
                            <div className="text-[10px] text-slate-400 font-normal">
                              ({unitCost.toLocaleString()} {currency}/وحدة)
                            </div>
                          </td>

                          <td className="p-3 text-center">
                            {inCart ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100/70 px-2.5 py-1 rounded-lg border border-emerald-300">
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                                تمت الإضافة
                              </span>
                            ) : (
                              <button
                                onClick={() => addToRequisition(record)}
                                className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1 mx-auto"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                <span>إضافة للطلب</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- TAB 2: CREATE / EDIT PURCHASE REQUISITION -------------------- */}
      {activeTabMode === 'CREATE' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Requisition Meta Details Form */}
          <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-purple-700" />
                <h2 className="text-base font-bold text-purple-950">بيانات طلب الشراء الرسمي لإدارة المشتريات</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs border border-purple-200 flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5 text-purple-700" />
                  <span>إضافة صنف يدوي من الدليل</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان / موضوع طلب الشراء *</label>
                <input
                  type="text"
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 font-semibold"
                  placeholder="مثال: طلب شراء عاجل لتعويض النواقص الحرجة لخطوط الإنتاج"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الإدارة الطالبة *</label>
                <input
                  type="text"
                  value={reqDepartment}
                  onChange={(e) => setReqDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">درجة الأهمية والاستعجال *</label>
                <select
                  value={reqPriority}
                  onChange={(e) => setReqPriority(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 font-bold"
                >
                  <option value="urgent">🔴 عاجل جداً (توقف خط إنتاج)</option>
                  <option value="high">🟠 مرتفع (استهلاك مستمر)</option>
                  <option value="normal">🔵 عادي (تجديد رصيد)</option>
                  <option value="low">⚪ منخفض (تخزين استراتيجي)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ التسليم المطلوب *</label>
                <input
                  type="date"
                  value={reqTargetDate}
                  onChange={(e) => setReqTargetDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات وتوجيهات لقسم المشتريات</label>
                <input
                  type="text"
                  value={reqTrackingNotes}
                  onChange={(e) => setReqTrackingNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  placeholder="مثال: يرجى التواصل مع المورد المعتمد وطلب شهادة المنشأ وضمان الجودة"
                />
              </div>
            </div>
          </div>

          {/* Cart Table */}
          <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
            <div className="p-4 bg-purple-50/50 border-b border-purple-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-purple-950 flex items-center gap-2">
                <span>الأصناف المدرجة في هذا الطلب</span>
                <span className="bg-purple-700 text-white text-[11px] px-2 py-0.5 rounded-full font-bold">
                  {cartItems.length} صنف
                </span>
              </h3>

              <div className="text-xs font-bold text-purple-900">
                إجمالي القيمة التقديرية: <span className="text-base font-black text-emerald-700">{cartTotalCost.toLocaleString()} {currency}</span>
              </div>
            </div>

            {cartItems.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <ShoppingCart className="h-12 w-12 mx-auto text-slate-300" />
                <p className="font-bold text-slate-600">لا توجد أصناف في مسودة طلب الشراء بعد.</p>
                <p className="text-xs text-slate-400">
                  يمكنك الذهاب لتبويب "محرك اقتراحات وتنبيهات الشراء" واختيار الأصناف المقترحة، أو النقر على "إضافة صنف يدوي".
                </p>
                <button
                  onClick={() => setActiveTabMode('SUGGESTIONS')}
                  className="px-4 py-2 rounded-xl bg-purple-700 text-white font-bold text-xs"
                >
                  استعراض النواقص والمقترحات
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <th className="p-3 font-bold">الصنف</th>
                      <th className="p-3 font-bold text-center">الرصيد / الحد الأدنى</th>
                      <th className="p-3 font-bold text-center">سحب آخر 60 يوم</th>
                      <th className="p-3 font-bold text-center bg-purple-50 text-purple-900">المقترح ذكياً</th>
                      <th className="p-3 font-bold text-center bg-emerald-50 text-emerald-950">الكمية المطلوبة للتوريد</th>
                      <th className="p-3 font-bold text-center">سعر الوحدة التقديري</th>
                      <th className="p-3 font-bold text-center">الإجمالي ({currency})</th>
                      <th className="p-3 font-bold">المورد المقترح</th>
                      <th className="p-3 font-bold text-center">حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cartItems.map((itm) => (
                      <tr key={itm.id} className="hover:bg-purple-50/20">
                        <td className="p-3 font-medium">
                          <div className="font-bold text-slate-900">{itm.itemName}</div>
                          <div className="text-[11px] text-purple-700 font-mono">{itm.itemCode}</div>
                          <div className="text-[10px] text-slate-400">{itm.notes}</div>
                        </td>

                        <td className="p-3 text-center text-slate-600">
                          <div>الرصيد: <strong>{itm.currentStock}</strong></div>
                          <div className="text-[11px] text-slate-400">الحد: {itm.minQuantity}</div>
                        </td>

                        <td className="p-3 text-center text-slate-700">
                          <strong>{itm.consumptionLast60Days}</strong> {itm.unit}
                          <div className="text-[10px] text-slate-400">({itm.dailyBurnRate}/يوم)</div>
                        </td>

                        <td className="p-3 text-center bg-purple-50/30 font-bold text-purple-900">
                          {itm.suggestedQuantity} {itm.unit}
                        </td>

                        <td className="p-3 text-center bg-emerald-50/40">
                          <input
                            type="number"
                            min="1"
                            value={itm.requestedQuantity}
                            onChange={(e) => updateCartItemQuantity(itm.id, Number(e.target.value))}
                            className="w-20 px-2 py-1 text-center font-black text-xs rounded-lg border border-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                          />
                          <span className="text-[10px] text-slate-500 block mt-0.5">{itm.unit}</span>
                        </td>

                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={itm.estimatedUnitPrice}
                            onChange={(e) => updateCartItemPrice(itm.id, Number(e.target.value))}
                            className="w-24 px-2 py-1 text-center font-bold text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </td>

                        <td className="p-3 text-center font-black text-emerald-800">
                          {itm.totalPrice.toLocaleString()} {currency}
                        </td>

                        <td className="p-3">
                          <span className="text-[11px] font-bold text-slate-700">
                            {itm.preferredSupplierName || 'المورد المعتمد من المشتريات'}
                          </span>
                        </td>

                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeCartItem(itm.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                            title="حذف الصنف من الطلب"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {cartItems.length > 0 && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-600">
                  سيتم تسجيل وإصدار هذا الطلب برقم تسلسلي رسمي وتوجيهه إلى <strong>إدارة المشتريات</strong> مع إشعار مدير المصنع.
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCartItems([])}
                    className="px-4 py-2 rounded-xl text-rose-700 hover:bg-rose-50 text-xs font-bold border border-rose-200"
                  >
                    تفريغ المسودة
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitRequisition}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-950/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
                  >
                    <Send className="h-4 w-4" />
                    <span>إصدار طلب الشراء وإرساله لإدارة المشتريات فورا</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------- TAB 3: REQUISITIONS HISTORY & OFFICIAL EXPORT -------------------- */}
      {activeTabMode === 'HISTORY' && (
        <div className="space-y-4 animate-in fade-in">
          
          <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
            <div className="p-4 bg-purple-50/50 border-b border-purple-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-purple-700" />
                <h3 className="text-sm font-bold text-purple-950">سجل طلبات الشراء المرسلة لإدارة المشتريات</h3>
              </div>
              <span className="text-xs text-slate-500">
                إجمالي الطلبات: <strong className="text-purple-900 font-bold">{purchaseRequisitions.length}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="p-3 font-bold">رقم الطلب</th>
                    <th className="p-3 font-bold">عنوان الطلب والإدارة</th>
                    <th className="p-3 font-bold text-center">عدد الأصناف</th>
                    <th className="p-3 font-bold text-center">إجمالي التكلفة التقديرية</th>
                    <th className="p-3 font-bold text-center">الأهمية</th>
                    <th className="p-3 font-bold text-center">حالة الطلب</th>
                    <th className="p-3 font-bold">تاريخ الإصدار ومقدم الطلب</th>
                    <th className="p-3 font-bold text-center">الإجراءات والطباعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchaseRequisitions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        لم يتم تسجيل طلبات شراء حتى الآن.
                      </td>
                    </tr>
                  ) : (
                    purchaseRequisitions.map((req) => (
                      <tr key={req.id} className="hover:bg-purple-50/20">
                        <td className="p-3 font-mono font-bold text-purple-900">
                          {req.prNumber}
                        </td>

                        <td className="p-3 font-medium">
                          <div className="font-bold text-slate-900">{req.title}</div>
                          <div className="text-[11px] text-slate-500">{req.department}</div>
                        </td>

                        <td className="p-3 text-center">
                          <span className="font-bold bg-slate-100 px-2.5 py-0.5 rounded-full text-slate-800">
                            {req.items.length} صنف
                          </span>
                        </td>

                        <td className="p-3 text-center font-black text-emerald-800">
                          {req.totalEstimatedCost.toLocaleString()} {currency}
                        </td>

                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              req.priority === 'urgent'
                                ? 'bg-rose-100 text-rose-800'
                                : req.priority === 'high'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {req.priority === 'urgent' ? 'عاجل جداً' : req.priority === 'high' ? 'مرتفع' : 'عادي'}
                          </span>
                        </td>

                        <td className="p-3 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              req.status === 'sent_to_purchasing'
                                ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                                : req.status === 'ordered'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : req.status === 'received'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {req.status === 'sent_to_purchasing'
                              ? 'مرسل للمشتريات'
                              : req.status === 'ordered'
                              ? 'جاري التوريد'
                              : req.status === 'received'
                              ? 'تم الاستلام بالمخزن'
                              : 'مسودة'}
                          </span>
                        </td>

                        <td className="p-3 text-slate-600">
                          <div>{req.createdAt}</div>
                          <div className="text-[11px] text-purple-700 font-medium">{req.createdByUserName}</div>
                        </td>

                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedReqForView(req)}
                              className="px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs flex items-center gap-1"
                              title="عرض تفاصيل ومحضر الطلب الرسمي للطباعة"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>عرض وطباعة</span>
                            </button>

                            {req.status === 'sent_to_purchasing' && (
                              <button
                                onClick={() => updatePurchaseRequisitionStatus(req.id, 'ordered', 'تم توجيه أمر الشراء للمورد')}
                                className="px-2 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[10px]"
                                title="تحويل الحالة إلى جاري التوريد"
                              >
                                تم التعاقد
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- MODAL: MANUAL ITEM ADDITION -------------------- */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-200 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-purple-950 mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-purple-700" />
              إضافة صنف يدوياً إلى طلب الشراء
            </h3>

            <form onSubmit={handleAddManualItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اختر الصنف من الدليل *</label>
                <select
                  required
                  value={manualItemId}
                  onChange={(e) => setManualItemId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 font-medium"
                >
                  <option value="">-- اضغط للاختيار --</option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.code} — {i.name} (الرصيد: {i.totalQuantity} {i.unitName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الكمية المطلوبة للتوريد *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={manualQty}
                  onChange={(e) => setManualQty(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المورد المفضل المقترح (اختياري)</label>
                <select
                  value={manualSupplierId}
                  onChange={(e) => setManualSupplierId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                >
                  <option value="">-- ترشيح إدارة المشتريات --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">مبرر الطلب أو ملاحظات الصيانة</label>
                <textarea
                  rows={2}
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="مثال: حاجة لعمل عمرة وقائية لماكينة التشكيل خلال أسبوعين"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-md"
                >
                  إضافة للطلب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- MODAL: OFFICIAL PRINTABLE PURCHASE REQUISITION -------------------- */}
      {selectedReqForView && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-purple-200 animate-in zoom-in-95 my-8">
            
            {/* Modal Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="font-bold text-purple-950 text-sm">عرض محضر طلب الشراء الرسمي المعتمد</span>
                <span className="bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">
                  {selectedReqForView.prNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="h-4 w-4" />
                  <span>طباعة رسمية</span>
                </button>
                <button
                  onClick={() => setSelectedReqForView(null)}
                  className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  إغلاق
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="py-6 space-y-6 print:p-0">
              
              {/* Official Header */}
              <div className="flex items-start justify-between border-b-2 border-purple-900 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-purple-900 text-white flex items-center justify-center font-bold shadow-sm">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-black text-lg text-purple-950">{companyProfile.companyName}</h2>
                    <p className="text-xs text-slate-600 font-bold">{companyProfile.factoryName}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {companyProfile.commercialRegister} | {companyProfile.taxNumber}
                    </p>
                  </div>
                </div>

                <div className="text-left font-mono text-xs">
                  <div className="font-bold text-purple-950 text-sm">نموذج طلب شراء قطع غيار ومستهلكات</div>
                  <div className="text-purple-700 mt-1">كود الوثيقة: PR-FORM-2026</div>
                  <div className="text-slate-500">التاريخ: {selectedReqForView.createdAt}</div>
                </div>
              </div>

              {/* Requisition Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-purple-50/60 p-4 rounded-2xl border border-purple-200 text-xs">
                <div>
                  <span className="text-slate-500 block">رقم طلب الشراء:</span>
                  <span className="font-bold text-purple-950 font-mono text-sm">{selectedReqForView.prNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">الإدارة الطالبة:</span>
                  <span className="font-bold text-purple-950">{selectedReqForView.department}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">تاريخ التسليم المطلوب:</span>
                  <span className="font-bold text-purple-950">{selectedReqForView.targetDeliveryDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">الأهمية:</span>
                  <span className="font-bold text-rose-800">
                    {selectedReqForView.priority === 'urgent' ? 'عاجل جداً' : 'مرتفع'}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                      <th className="p-2.5 font-bold">م</th>
                      <th className="p-2.5 font-bold">كود الصنف</th>
                      <th className="p-2.5 font-bold">اسم الصنف والمواصفات</th>
                      <th className="p-2.5 font-bold text-center">الرصيد الدفتري</th>
                      <th className="p-2.5 font-bold text-center">الكمية المطلوبة</th>
                      <th className="p-2.5 font-bold text-center">السعر التقديري</th>
                      <th className="p-2.5 font-bold text-center">الإجمالي ({currency})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedReqForView.items.map((itm, idx) => (
                      <tr key={itm.id}>
                        <td className="p-2.5 text-center font-bold text-slate-500">{idx + 1}</td>
                        <td className="p-2.5 font-mono text-purple-900 font-bold">{itm.itemCode}</td>
                        <td className="p-2.5">
                          <div className="font-bold text-slate-900">{itm.itemName}</div>
                          <div className="text-[10px] text-slate-500">{itm.notes}</div>
                        </td>
                        <td className="p-2.5 text-center">{itm.currentStock} {itm.unit}</td>
                        <td className="p-2.5 text-center font-bold text-emerald-800 bg-emerald-50/40">
                          {itm.requestedQuantity} {itm.unit}
                        </td>
                        <td className="p-2.5 text-center">{itm.estimatedUnitPrice.toLocaleString()}</td>
                        <td className="p-2.5 text-center font-bold">{itm.totalPrice.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                      <td colSpan={6} className="p-3 text-left">إجمالي التكلفة التقديرية لطلب الشراء:</td>
                      <td className="p-3 text-center text-emerald-800 text-sm font-black">
                        {selectedReqForView.totalEstimatedCost.toLocaleString()} {currency}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Justification & Tracking notes */}
              {selectedReqForView.trackingNotes && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700">توجيهات وملاحظات الطلب: </span>
                  <span className="text-slate-600">{selectedReqForView.trackingNotes}</span>
                </div>
              )}

              {/* Committee Signatures Block */}
              <div className="grid grid-cols-4 gap-4 pt-6 border-t border-slate-200 text-center text-xs">
                <div>
                  <div className="font-bold text-slate-800">معد الطلب</div>
                  <div className="text-[11px] text-slate-500 mt-1">{selectedReqForView.createdByUserName}</div>
                  <div className="mt-8 border-b border-dashed border-slate-400 w-24 mx-auto"></div>
                  <span className="text-[10px] text-slate-400">التوقيع</span>
                </div>

                <div>
                  <div className="font-bold text-slate-800">مدير المستودعات</div>
                  <div className="text-[11px] text-slate-500 mt-1">أحمد محمود</div>
                  <div className="mt-8 border-b border-dashed border-slate-400 w-24 mx-auto"></div>
                  <span className="text-[10px] text-slate-400">الاعتماد والتوقيع</span>
                </div>

                <div>
                  <div className="font-bold text-slate-800">مدير المصنع / التشغيل</div>
                  <div className="text-[11px] text-slate-500 mt-1">{companyProfile.managerName}</div>
                  <div className="mt-8 border-b border-dashed border-slate-400 w-24 mx-auto"></div>
                  <span className="text-[10px] text-slate-400">اعتماد الصرف المالي</span>
                </div>

                <div>
                  <div className="font-bold text-slate-800">استلام إدارة المشتريات</div>
                  <div className="text-[11px] text-slate-500 mt-1">قسم المشتريات والعقود</div>
                  <div className="mt-8 border-b border-dashed border-slate-400 w-24 mx-auto"></div>
                  <span className="text-[10px] text-slate-400">تاريخ ورقم أمر التوريد</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
