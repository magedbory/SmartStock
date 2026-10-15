/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowRightLeft,
  PackagePlus,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  SlidersHorizontal,
  Search,
  Filter,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import { MovementType } from '../types';

export const MovementsView: React.FC = () => {
  const {
    movements,
    currency,
    setIsMovementModalOpen,
    setMovementModalDefaultType,
    setMovementModalDefaultItemId
  } = useApp();

  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMovements = movements.filter((mov) => {
    const matchesType = typeFilter === 'ALL' || mov.type === typeFilter;
    const matchesSearch =
      mov.movementNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mov.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mov.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mov.createdByUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (mov.reason && mov.reason.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Quick Action Buttons */}
      <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-purple-950">
              حركات المخزون وسجل المعاملات (Transaction Log)
            </h1>
            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {filteredMovements.length} حركة
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            سجل غير قابل للتعديل لكافة عمليات التوريد والصرف والنقل والتسويات لضمان دقة المخزون بنسبة 98%
          </p>
        </div>

        {/* Action Buttons for Movement Types */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setMovementModalDefaultType('receipt');
              setMovementModalDefaultItemId('');
              setIsMovementModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all active:scale-95"
          >
            <PackagePlus className="h-4 w-4" />
            <span>توريد واستلام (+)</span>
          </button>

          <button
            onClick={() => {
              setMovementModalDefaultType('issue');
              setMovementModalDefaultItemId('');
              setIsMovementModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow transition-all active:scale-95"
          >
            <ArrowDownLeft className="h-4 w-4" />
            <span>إذن صرف (-)</span>
          </button>

          <button
            onClick={() => {
              setMovementModalDefaultType('transfer');
              setMovementModalDefaultItemId('');
              setIsMovementModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition-all active:scale-95"
          >
            <ArrowRightLeft className="h-4 w-4" />
            <span>نقل بين المواقع</span>
          </button>

          <button
            onClick={() => {
              setMovementModalDefaultType('adjustment');
              setMovementModalDefaultItemId('');
              setIsMovementModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow transition-all active:scale-95"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>تسوية جردية</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3.5 top-3 h-4 w-4 text-purple-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث برقم الحركة، اسم الصنف، الكود، أو المسؤول..."
            className="w-full pr-10 pl-4 py-2 rounded-xl bg-purple-50/50 border border-purple-200 text-xs sm:text-sm text-purple-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        {/* Type tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold w-full md:w-auto">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              typeFilter === 'ALL' ? 'bg-white text-purple-950 shadow-sm' : 'text-slate-600 hover:text-purple-900'
            }`}
          >
            جميع الحركات
          </button>
          <button
            onClick={() => setTypeFilter('receipt')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              typeFilter === 'receipt' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            توريد
          </button>
          <button
            onClick={() => setTypeFilter('issue')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              typeFilter === 'issue' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-rose-700'
            }`}
          >
            صرف
          </button>
          <button
            onClick={() => setTypeFilter('transfer')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              typeFilter === 'transfer' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-indigo-700'
            }`}
          >
            نقل
          </button>
          <button
            onClick={() => setTypeFilter('adjustment')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              typeFilter === 'adjustment' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-amber-700'
            }`}
          >
            تسوية جردية
          </button>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-purple-50/70 text-purple-950 font-bold border-b border-purple-200">
              <tr>
                <th className="py-3.5 px-4">رقم الحركة</th>
                <th className="py-3.5 px-4">نوع الحركة</th>
                <th className="py-3.5 px-4">الصنف والكود</th>
                <th className="py-3.5 px-4">الكمية المسجلة</th>
                <th className="py-3.5 px-4">الموقع والمصدر</th>
                <th className="py-3.5 px-4">المرجع والسبب</th>
                <th className="py-3.5 px-4">التاريخ والوقت</th>
                <th className="py-3.5 px-4">المسؤول عن الإدخال</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    لا توجد حركات مخزنية مسجلة تطابق معايير البحث
                  </td>
                </tr>
              ) : (
                filteredMovements.map((mov) => {
                  const isPositive =
                    mov.type === 'receipt' || mov.type === 'return' || (mov.type === 'adjustment' && mov.quantity > 0);
                  return (
                    <tr key={mov.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          {mov.movementNumber}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            mov.type === 'receipt'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : mov.type === 'issue'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : mov.type === 'transfer'
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                              : mov.type === 'return'
                              ? 'bg-teal-100 text-teal-800 border border-teal-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {mov.typeAr}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{mov.itemName}</div>
                        <div className="font-mono text-[10px] text-purple-700">{mov.itemCode}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span className={`text-sm ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {isPositive ? '+' : '-'}{Math.abs(mov.quantity)} {mov.unitName}
                        </span>
                        {mov.unitCost && mov.unitCost > 0 && (
                          <span className="text-[10px] text-slate-600 block">
                            (بسعر {mov.unitCost} {currency})
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-[11px]">
                        {mov.fromLocationPath && (
                          <div className="text-rose-700 font-medium">من: {mov.fromLocationPath}</div>
                        )}
                        {mov.toLocationPath && (
                          <div className="text-emerald-700 font-medium">إلى: {mov.toLocationPath}</div>
                        )}
                        {mov.supplierName && (
                          <div className="text-slate-500">المورد: {mov.supplierName}</div>
                        )}
                        {mov.batchNumber && (
                          <div className="text-purple-700 font-mono text-[10px]">دفعة: {mov.batchNumber}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-[11px] text-slate-600 max-w-xs">
                        {mov.maintenanceRequestNumber && (
                          <span className="font-bold text-indigo-700 block mb-0.5">
                            طلب صيانة #{mov.maintenanceRequestNumber}
                          </span>
                        )}
                        <span>{mov.reason || '—'}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                        {mov.createdAt}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 font-semibold text-[11px]">
                        {mov.createdByUserName}
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
  );
};
