/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileSpreadsheet,
  Download,
  Filter,
  Calendar,
  Layers,
  ArrowRightLeft,
  Search,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

export const ReportsExportView: React.FC = () => {
  const { items, movements, categories, currency, showToast } = useApp();

  const [reportType, setReportType] = useState<'BALANCES' | 'MOVEMENTS'>('BALANCES');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [movementTypeFilter, setMovementTypeFilter] = useState<string>('ALL');

  // Filtered Balances
  const filteredBalances = items.filter((item) => {
    if (selectedCategory !== 'ALL' && item.categoryId !== selectedCategory) return false;
    return true;
  });

  const totalInventoryValue = filteredBalances.reduce((acc, itm) => acc + itm.totalQuantity * itm.avgCost, 0);
  const totalUnitsCount = filteredBalances.reduce((acc, itm) => acc + itm.totalQuantity, 0);

  // Filtered Movements
  const filteredMovements = movements.filter((mov) => {
    if (movementTypeFilter !== 'ALL' && mov.type !== movementTypeFilter) return false;
    return true;
  });

  // Export to Excel / CSV with UTF-8 BOM
  const exportToExcel = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM for Arabic support in Excel

    if (reportType === 'BALANCES') {
      csvContent += 'كود الصنف,اسم القطعة,التصنيف,الرصيد الكلي,وحدة القياس,متوسط التكلفة,إجمالي القيمة,الموقع التخزيني,صنف حرج\n';
      filteredBalances.forEach((itm) => {
        const locations = itm.locations.map((l) => `${l.locationPath} (${l.quantity})`).join(' | ');
        csvContent += `"${itm.code}","${itm.name}","${itm.categoryName}",${itm.totalQuantity},"${itm.unitName}",${itm.avgCost.toFixed(2)},${(itm.totalQuantity * itm.avgCost).toFixed(2)},"${locations}","${itm.isCritical ? 'نعم' : 'لا'}"\n`;
      });
    } else {
      csvContent += 'رقم الحركة,النوع,كود الصنف,اسم الصنف,الكمية,وحدة القياس,من موقع,إلى موقع,المورد,السبب أو المرجع,التاريخ,المسؤول\n';
      filteredMovements.forEach((mov) => {
        csvContent += `"${mov.movementNumber}","${mov.typeAr}","${mov.itemCode}","${mov.itemName}",${mov.quantity},"${mov.unitName}","${mov.fromLocationPath || ''}","${mov.toLocationPath || ''}","${mov.supplierName || ''}","${mov.reason || ''}","${mov.createdAt}","${mov.createdByUserName}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `SmartStock_${reportType === 'BALANCES' ? 'أرصدة_المخزون' : 'سجل_الحركات'}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('تم تصدير التقرير بصيغة إكسل (CSV مع دعم اللغة العربية) بنجاح.');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-purple-950">
              تقارير المخزون والتصدير إلى Excel (Reports & Export)
            </h1>
            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              تصدير رسمي مطابق للجرد
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            استخراج بيانات دقيقة للأرصدة وقيمة المخزون وسجلات الحركات المالية والتشغيلية بتنسيق يدعم العربية
          </p>
        </div>

        <button
          onClick={exportToExcel}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-sm shadow-md transition-all active:scale-95"
        >
          <Download className="h-4 w-4" />
          <span>تصدير النتائج إلى Excel (.CSV)</span>
        </button>
      </div>

      {/* Report Type Selector & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setReportType('BALANCES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              reportType === 'BALANCES'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-purple-900 hover:bg-purple-50'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>تقرير أرصدة المخزون وقيمتها</span>
          </button>

          <button
            onClick={() => setReportType('MOVEMENTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              reportType === 'MOVEMENTS'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-purple-900 hover:bg-purple-50'
            }`}
          >
            <ArrowRightLeft className="h-4 w-4" />
            <span>تقرير سجل حركات المخزون</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {reportType === 'BALANCES' ? (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 rounded-xl bg-purple-50/50 border border-purple-200 text-xs font-bold text-purple-950 focus:ring-2 focus:ring-purple-600"
            >
              <option value="ALL">جميع التصنيفات</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={movementTypeFilter}
              onChange={(e) => setMovementTypeFilter(e.target.value)}
              className="p-2 rounded-xl bg-purple-50/50 border border-purple-200 text-xs font-bold text-purple-950 focus:ring-2 focus:ring-purple-600"
            >
              <option value="ALL">جميع أنواع الحركات</option>
              <option value="receipt">توريد واستلام</option>
              <option value="issue">صرف</option>
              <option value="transfer">نقل بين المواقع</option>
              <option value="adjustment">تسوية جردية</option>
            </select>
          )}
        </div>
      </div>

      {/* Summary KPI Strip for Balances */}
      {reportType === 'BALANCES' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-purple-100">
            <span className="text-xs text-slate-500 font-bold block">إجمالي عدد الأصناف المعروضة</span>
            <span className="text-xl font-black text-purple-950">{filteredBalances.length} صنف</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-purple-100">
            <span className="text-xs text-slate-500 font-bold block">إجمالي عدد القطع والوحدات بالمخازن</span>
            <span className="text-xl font-black text-indigo-950">{totalUnitsCount.toLocaleString('ar-SA')} وحدة</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-purple-100">
            <span className="text-xs text-slate-500 font-bold block">إجمالي القيمة التقديرية للأصناف</span>
            <span className="text-xl font-black text-emerald-700">
              {totalInventoryValue.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} {currency}
            </span>
          </div>
        </div>
      )}

      {/* Report Table Display */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {reportType === 'BALANCES' ? (
            <table className="w-full text-right text-xs">
              <thead className="bg-purple-50/70 text-purple-950 font-bold border-b border-purple-200">
                <tr>
                  <th className="py-3.5 px-4">كود الصنف</th>
                  <th className="py-3.5 px-4">اسم القطعة</th>
                  <th className="py-3.5 px-4">التصنيف</th>
                  <th className="py-3.5 px-4">الرصيد المتاح</th>
                  <th className="py-3.5 px-4">متوسط التكلفة</th>
                  <th className="py-3.5 px-4">إجمالي القيمة</th>
                  <th className="py-3.5 px-4">مواقع التخزين</th>
                  <th className="py-3.5 px-4 text-center">صنف حرج</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredBalances.map((itm) => (
                  <tr key={itm.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-900">{itm.code}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{itm.name}</td>
                    <td className="py-3.5 px-4 text-slate-500">{itm.categoryName}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {itm.totalQuantity} {itm.unitName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {itm.avgCost.toFixed(2)} {currency}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-950">
                      {(itm.totalQuantity * itm.avgCost).toFixed(2)} {currency}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-600">
                      {itm.locations.map((l) => `${l.locationPath} (${l.quantity})`).join(', ') || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {itm.isCritical ? (
                        <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                          نعم
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">لا</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-right text-xs">
              <thead className="bg-purple-50/70 text-purple-950 font-bold border-b border-purple-200">
                <tr>
                  <th className="py-3.5 px-4">رقم الحركة</th>
                  <th className="py-3.5 px-4">النوع</th>
                  <th className="py-3.5 px-4">الصنف</th>
                  <th className="py-3.5 px-4">الكمية</th>
                  <th className="py-3.5 px-4">من / إلى الموقع</th>
                  <th className="py-3.5 px-4">السبب أو المرجع</th>
                  <th className="py-3.5 px-4">التاريخ</th>
                  <th className="py-3.5 px-4">المسؤول</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredMovements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-900">{mov.movementNumber}</td>
                    <td className="py-3.5 px-4 font-bold">{mov.typeAr}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{mov.itemName}</td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {mov.quantity} {mov.unitName}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-600">
                      {mov.toLocationPath || mov.fromLocationPath || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{mov.reason || mov.maintenanceRequestNumber || '—'}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{mov.createdAt}</td>
                    <td className="py-3.5 px-4 text-slate-700">{mov.createdByUserName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};
