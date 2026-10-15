/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Boxes,
  AlertTriangle,
  Clock,
  ArrowRightLeft,
  Wrench,
  TrendingUp,
  PackagePlus,
  QrCode,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  ChevronLeft
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    items,
    movements,
    maintenanceRequests,
    alerts,
    currency,
    setActiveTab,
    setIsMovementModalOpen,
    setMovementModalDefaultType,
    setIsRequestModalOpen,
    setIsScannerOpen,
    setIsItemModalOpen,
    setEditingItem
  } = useApp();

  // Metrics calculation
  const totalValue = items.reduce((acc, itm) => acc + itm.totalQuantity * itm.avgCost, 0);
  const activeItemsCount = items.filter((i) => i.isActive).length;
  const lowStockItems = items.filter((i) => i.totalQuantity <= i.minStock && i.isActive);
  const criticalShortageItems = lowStockItems.filter((i) => i.isCritical);
  const pendingRequests = maintenanceRequests.filter((r) => r.status === 'submitted' || r.status === 'approved');
  const openAlerts = alerts.filter((a) => a.status === 'open');
  const expiringAlerts = openAlerts.filter((a) => a.type === 'expiry');

  // Category distribution
  const categoryStats: Record<string, { count: number; value: number }> = {};
  items.forEach((item) => {
    if (!categoryStats[item.categoryName]) {
      categoryStats[item.categoryName] = { count: 0, value: 0 };
    }
    categoryStats[item.categoryName].count += 1;
    categoryStats[item.categoryName].value += item.totalQuantity * item.avgCost;
  });

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-950/20 relative overflow-hidden border border-purple-700/40">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-800/80 text-purple-200 text-xs font-semibold border border-purple-600/50">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              نظام التشغيل ومراقبة المخزون الفعلي
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              لوحة مؤشرات مخزون قطع الغيار والمستهلكات
            </h1>
            <p className="text-purple-200 text-sm max-w-2xl leading-relaxed">
              رؤية فورية لكافة الأرصدة، مستويات التخزين، قطع الغيار الحرجة لخطوط الإنتاج، وتنبيهات النواقص وتواريخ الصلاحية.
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setMovementModalDefaultType('receipt');
                setIsMovementModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <PackagePlus className="h-4 w-4" />
              <span>توريد بضاعة</span>
            </button>

            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <Wrench className="h-4 w-4" />
              <span>طلب قطع صيانة</span>
            </button>

            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-800 text-purple-200 font-bold text-xs sm:text-sm border border-purple-600/60 shadow-sm transition-all"
            >
              <QrCode className="h-4 w-4" />
              <span>مسح كود</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* Total Value */}
        <div
          onClick={() => setActiveTab('reports')}
          className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-purple-300"
        >
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <span className="text-xs font-bold text-slate-500">إجمالي قيمة المخزون</span>
            <div className="p-2 rounded-xl bg-purple-50 group-hover:bg-purple-100 transition-colors">
              <TrendingUp className="h-5 w-5 text-purple-700" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-950">
            {totalValue.toLocaleString('ar-SA', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            <span className="text-xs font-bold text-purple-600 mr-1.5">{currency}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-emerald-600 font-bold inline-flex items-center">
              <ArrowUpRight className="h-3.5 w-3.5" /> محسوب بمتوسط التكلفة
            </span>
          </p>
        </div>

        {/* Active Items */}
        <div
          onClick={() => setActiveTab('items')}
          className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-purple-300"
        >
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <span className="text-xs font-bold text-slate-500">الأصناف المسجلة</span>
            <div className="p-2 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
              <Boxes className="h-5 w-5 text-indigo-700" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {activeItemsCount}
            <span className="text-xs font-semibold text-slate-500 mr-1.5">صنف مفعل</span>
          </div>
          <p className="text-[11px] text-purple-700 mt-2 font-medium">
            موزعة على {Object.keys(categoryStats).length} تصنيفات
          </p>
        </div>

        {/* Low Stock Items */}
        <div
          onClick={() => setActiveTab('alerts')}
          className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-amber-300"
        >
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold text-slate-500">تحت الحد الأدنى</span>
            <div className="p-2 rounded-xl bg-amber-50 group-hover:bg-amber-100 transition-colors">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-700">
            {lowStockItems.length}
            <span className="text-xs font-semibold text-slate-500 mr-1.5">أصناف</span>
          </div>
          <p className="text-[11px] text-amber-800 mt-2 font-medium">
            بحاجة لإعادة طلب فوري
          </p>
        </div>

        {/* Critical Shortage */}
        <div
          onClick={() => setActiveTab('alerts')}
          className="bg-gradient-to-br from-rose-50 to-purple-50/50 p-5 rounded-2xl border border-rose-200 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-rose-400"
        >
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-bold text-rose-900">نواقص حرجة</span>
            <div className="p-2 rounded-xl bg-rose-100 group-hover:bg-rose-200 transition-colors">
              <ShieldAlert className="h-5 w-5 text-rose-700 animate-pulse" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-700">
            {criticalShortageItems.length}
            <span className="text-xs font-semibold text-rose-900 mr-1.5">قطع تشغيل</span>
          </div>
          <p className="text-[11px] text-rose-700 mt-2 font-bold">
            خطورة توقف خطوط الإنتاج!
          </p>
        </div>

        {/* Expiring Batches */}
        <div
          onClick={() => setActiveTab('alerts')}
          className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-purple-300"
        >
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <span className="text-xs font-bold text-slate-500">متابعة الصلاحية</span>
            <div className="p-2 rounded-xl bg-purple-50 group-hover:bg-purple-100 transition-colors">
              <Clock className="h-5 w-5 text-purple-700" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-950">
            {expiringAlerts.length}
            <span className="text-xs font-semibold text-slate-500 mr-1.5">دفعات</span>
          </div>
          <p className="text-[11px] text-purple-700 mt-2 font-medium">
            زيوت وجوانات ومستهلكات
          </p>
        </div>

        {/* Pending Requests */}
        <div
          onClick={() => setActiveTab('requests')}
          className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-indigo-300"
        >
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <span className="text-xs font-bold text-slate-500">طلبات الصيانة</span>
            <div className="p-2 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
              <Wrench className="h-5 w-5 text-indigo-700" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-950">
            {pendingRequests.length}
            <span className="text-xs font-semibold text-slate-500 mr-1.5">طلب معلق</span>
          </div>
          <p className="text-[11px] text-indigo-700 mt-2 font-medium">
            بانتظار الاعتماد أو الصرف
          </p>
        </div>

      </div>

      {/* Main Grid: Critical Items & Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Critical & Low Stock Items Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-purple-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-purple-950">
                  أصناف بحاجة لاتخاذ إجراء (نواقص وتحت الحد الأدنى)
                </h2>
                <p className="text-xs text-slate-500">
                  الأصناف التي وصل رصيدها إلى الحد الأدنى المحدد أو أقل منه
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('alerts')}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
            >
              <span>عرض كل التنبيهات</span>
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-purple-50/60 text-purple-950 font-bold border-b border-purple-100">
                <tr>
                  <th className="py-3 px-4">كود الصنف</th>
                  <th className="py-3 px-4">اسم القطعة</th>
                  <th className="py-3 px-4">الأهمية</th>
                  <th className="py-3 px-4">الرصيد المتاح</th>
                  <th className="py-3 px-4">الحد الأدنى</th>
                  <th className="py-3 px-4">الموقع التخزيني</th>
                  <th className="py-3 px-4 text-center">إجراء سريع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {lowStockItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 text-sm">
                      ممتاز! كافة الأصناف تقع في مستويات آمنة أعلى من الحدود الدنيا.
                    </td>
                  </tr>
                ) : (
                  lowStockItems.map((item) => (
                    <tr key={item.id} className="hover:bg-purple-50/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-purple-900">{item.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{item.name}</td>
                      <td className="py-3 px-4">
                        {item.isCritical ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                            صنف حرج
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            عادي
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-rose-700">
                        {item.totalQuantity} {item.unitName}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-semibold">
                        {item.minStock} {item.unitName}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {item.locations[0]?.locationPath || 'غير محدد'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            setMovementModalDefaultType('receipt');
                            useApp().setMovementModalDefaultItemId(item.id);
                            setIsMovementModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-[11px] shadow-sm transition-all"
                        >
                          طلب توريد
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Inventory Breakdown by Category */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-purple-950">توزيع المخزون حسب التصنيف</h2>
              <p className="text-xs text-slate-500">حجم الاستثمار وعدد الأصناف في كل فئة</p>
            </div>
            <button
              onClick={() => setActiveTab('items')}
              className="text-xs font-bold text-purple-700 hover:text-purple-900"
            >
              عرض الدليل
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(categoryStats).map(([catName, stat]) => {
              const percentage = totalValue > 0 ? (stat.value / totalValue) * 100 : 0;
              return (
                <div key={catName} className="space-y-1.5 p-2 rounded-xl hover:bg-purple-50/50 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-950">{catName}</span>
                    <span className="font-mono font-bold text-purple-900">
                      {stat.value.toLocaleString('ar-SA')} {currency}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(5, percentage))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{stat.count} أصناف</span>
                    <span>{percentage.toFixed(1)}% من إجمالي القيمة</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Add Item link */}
          <div className="pt-3 border-t border-purple-50">
            <button
              onClick={() => {
                setEditingItem(null);
                setIsItemModalOpen(true);
              }}
              className="w-full py-2.5 rounded-xl border border-dashed border-purple-300 hover:border-purple-600 text-purple-700 hover:bg-purple-50 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <PackagePlus className="h-4 w-4" />
              <span>إضافة صنف جديد لدليل قطع الغيار</span>
            </button>
          </div>
        </div>

      </div>

      {/* Recent Movements Log Preview */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-purple-950">
                أحدث حركات المخزون المسجلة (توريد، صرف، نقل، تسوية)
              </h2>
              <p className="text-xs text-slate-500">سجل غير قابل للتعديل يضمن مطابقة الجرد وتتبع المسؤوليات</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('movements')}
            className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
          >
            <span>عرض كل الحركات</span>
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-purple-50/60 text-purple-950 font-bold border-b border-purple-100">
              <tr>
                <th className="py-3 px-4">رقم الحركة</th>
                <th className="py-3 px-4">النوع</th>
                <th className="py-3 px-4">الصنف</th>
                <th className="py-3 px-4">الكمية</th>
                <th className="py-3 px-4">من / إلى الموقع</th>
                <th className="py-3 px-4">التاريخ والوقت</th>
                <th className="py-3 px-4">المسؤول</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {movements.slice(0, 5).map((mov) => {
                const isPositive = mov.type === 'receipt' || mov.type === 'return' || (mov.type === 'adjustment' && mov.quantity > 0);
                return (
                  <tr key={mov.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-purple-900">{mov.movementNumber}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          mov.type === 'receipt'
                            ? 'bg-emerald-100 text-emerald-800'
                            : mov.type === 'issue'
                            ? 'bg-rose-100 text-rose-800'
                            : mov.type === 'transfer'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {mov.typeAr}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{mov.itemName}</span>
                      <span className="text-[10px] font-mono text-slate-600">{mov.itemCode}</span>
                    </td>
                    <td className="py-3 px-4 font-bold font-mono">
                      <span className={isPositive ? 'text-emerald-700' : 'text-rose-700'}>
                        {isPositive ? '+' : '-'}{Math.abs(mov.quantity)} {mov.unitName}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      {mov.toLocationPath ? `إلى: ${mov.toLocationPath}` : `من: ${mov.fromLocationPath || 'المستودع'}`}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{mov.createdAt}</td>
                    <td className="py-3 px-4 text-slate-700 font-semibold">{mov.createdByUserName}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
