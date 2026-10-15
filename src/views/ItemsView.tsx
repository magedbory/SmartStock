/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Filter,
  Plus,
  QrCode,
  Edit2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowRightLeft,
  ChevronDown,
  Trash2,
  Tag
} from 'lucide-react';
import { Item } from '../types';

export const ItemsView: React.FC = () => {
  const {
    items,
    categories,
    currency,
    setIsItemModalOpen,
    setEditingItem,
    deactivateItem,
    setIsLabelModalOpen,
    setLabelModalItem,
    setIsMovementModalOpen,
    setMovementModalDefaultType,
    setMovementModalDefaultItemId
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'CRITICAL' | 'EXPIRY'>('ALL');
  const [selectedItemDetail, setSelectedItemDetail] = useState<Item | null>(null);

  // Filter items
  const filteredItems = items.filter((item) => {
    // Search query
    const matchesSearch =
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.barcode.includes(searchQuery);

    // Category filter
    const matchesCat = selectedCategory === 'ALL' || item.categoryId === selectedCategory;

    // Stock filter
    let matchesStock = true;
    if (stockFilter === 'LOW') matchesStock = item.totalQuantity <= item.minStock;
    if (stockFilter === 'CRITICAL') matchesStock = item.isCritical;
    if (stockFilter === 'EXPIRY') matchesStock = item.tracksExpiry;

    return matchesSearch && matchesCat && matchesStock;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-purple-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-purple-950">
              دليل قطع الغيار والمستهلكات (Item Master)
            </h1>
            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {filteredItems.length} صنف
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إدارة الكتالوج، الأكواد الفريدة، وحدات القياس، مستويات الأمان، وتواريخ الصلاحية
          </p>
        </div>

        <button
          onClick={() => {
            setEditingItem(null);
            setIsItemModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-sm shadow-md shadow-purple-900/20 transition-all hover:scale-[1.02] active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>إضافة قطعة غيار جديدة</span>
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3.5 top-3 h-4 w-4 text-purple-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث بالكود، الاسم، الباركود، أو الوصف..."
            className="w-full pr-10 pl-4 py-2 rounded-xl bg-purple-50/50 border border-purple-200 text-xs sm:text-sm text-purple-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full appearance-none pr-8 pl-8 py-2 rounded-xl bg-purple-50/50 border border-purple-200 text-xs font-bold text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="ALL">جميع التصنيفات</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-purple-500 pointer-events-none" />
            <ChevronDown className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-purple-500 pointer-events-none" />
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setStockFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                stockFilter === 'ALL' ? 'bg-white text-purple-950 shadow-sm' : 'text-slate-600 hover:text-purple-900'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setStockFilter('LOW')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                stockFilter === 'LOW' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              <AlertTriangle className="h-3 w-3" />
              <span>تحت الحد</span>
            </button>
            <button
              onClick={() => setStockFilter('CRITICAL')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                stockFilter === 'CRITICAL' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              <ShieldAlert className="h-3 w-3" />
              <span>أصناف حرجة</span>
            </button>
            <button
              onClick={() => setStockFilter('EXPIRY')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                stockFilter === 'EXPIRY' ? 'bg-purple-700 text-white shadow-sm' : 'text-slate-600 hover:text-purple-900'
              }`}
            >
              <Clock className="h-3 w-3" />
              <span>تتبع الصلاحية</span>
            </button>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-purple-50/70 text-purple-950 font-bold border-b border-purple-200">
              <tr>
                <th className="py-3.5 px-4">كود الصنف</th>
                <th className="py-3.5 px-4">اسم القطعة والمواصفات</th>
                <th className="py-3.5 px-4">التصنيف</th>
                <th className="py-3.5 px-4">الرصيد الكلي</th>
                <th className="py-3.5 px-4">الحد الأدنى</th>
                <th className="py-3.5 px-4">متوسط التكلفة</th>
                <th className="py-3.5 px-4">الموقع</th>
                <th className="py-3.5 px-4 text-center">الخصائص</th>
                <th className="py-3.5 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="h-12 w-12 rounded-2xl bg-purple-100 text-purple-700 mx-auto flex items-center justify-center">
                        <Search className="h-6 w-6" />
                      </div>
                      <p className="font-bold text-slate-700">لا توجد قطع غيار مطابقة للبحث أو الفلتر المختار</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('ALL');
                          setStockFilter('ALL');
                        }}
                        className="text-purple-700 font-bold hover:underline"
                      >
                        إعادة ضبط الفلاتر
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.totalQuantity <= item.minStock;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItemDetail(item)}
                      className={`hover:bg-purple-50/40 transition-colors cursor-pointer ${
                        !item.isActive ? 'opacity-60 bg-slate-50' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-purple-900 bg-purple-50 px-2 py-1 rounded-md border border-purple-200">
                          {item.code}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">{item.description}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                          {item.categoryName}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span
                          className={`text-sm ${
                            isLow
                              ? item.isCritical
                                ? 'text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg font-black'
                                : 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg'
                              : 'text-emerald-700'
                          }`}
                        >
                          {item.totalQuantity} {item.unitName}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-semibold font-mono">
                        {item.minStock} {item.unitName}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-700 font-bold">
                        {item.avgCost.toFixed(2)} {currency}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                        {item.locations.length > 0 ? (
                          <span>{item.locations[0].locationPath}</span>
                        ) : (
                          <span className="text-slate-400 italic">غير مسجل بموقع</span>
                        )}
                        {item.locations.length > 1 && (
                          <span className="mr-1 text-[10px] text-purple-700 font-bold">
                            (+{item.locations.length - 1} مواقع)
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {item.isCritical && (
                            <span
                              className="p-1 rounded-md bg-rose-100 text-rose-700"
                              title="صنف حرج لاستمرار خطوط الإنتاج"
                            >
                              <ShieldAlert className="h-3.5 w-3.5" />
                            </span>
                          )}
                          {item.tracksExpiry && (
                            <span
                              className="p-1 rounded-md bg-purple-100 text-purple-700"
                              title="يتطلب تتبع تاريخ الصلاحية والدفعات"
                            >
                              <Clock className="h-3.5 w-3.5" />
                            </span>
                          )}
                          {item.barcode && (
                            <span
                              className="p-1 rounded-md bg-indigo-100 text-indigo-700 font-mono text-[10px]"
                              title={`كود باركود: ${item.barcode}`}
                            >
                              <Tag className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Label Print */}
                          <button
                            onClick={() => {
                              setLabelModalItem(item);
                              setIsLabelModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-purple-700 hover:bg-purple-100 transition-colors"
                            title="طباعة ملصق باركود وQR"
                          >
                            <QrCode className="h-4 w-4" />
                          </button>

                          {/* Quick Movement */}
                          <button
                            onClick={() => {
                              setMovementModalDefaultType('receipt');
                              setMovementModalDefaultItemId(item.id);
                              setIsMovementModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-indigo-700 hover:bg-indigo-100 transition-colors"
                            title="تسجيل حركة سريعة"
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                          </button>

                          {/* Edit Item */}
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setIsItemModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                            title="تعديل بيانات الصنف"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          {/* Deactivate */}
                          {item.isActive && (
                            <button
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من رغبتك في تعطيل الصنف (${item.name})؟`)) {
                                  deactivateItem(item.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="تعطيل الصنف"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Item Drawer / Details Modal */}
      {selectedItemDetail && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedItemDetail(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-purple-100 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-purple-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                  {selectedItemDetail.code}
                </span>
                <h3 className="text-lg font-black text-purple-950 mt-1.5">
                  {selectedItemDetail.name}
                </h3>
                <p className="text-xs text-slate-500">{selectedItemDetail.description}</p>
              </div>
              <button
                onClick={() => setSelectedItemDetail(null)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100">
                <span className="text-[11px] text-purple-700 font-semibold block">الرصيد الكلي</span>
                <span className="text-lg font-black text-purple-950">
                  {selectedItemDetail.totalQuantity} {selectedItemDetail.unitName}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-500 font-semibold block">حد الأمان الأدنى</span>
                <span className="text-lg font-bold text-slate-800">
                  {selectedItemDetail.minStock} {selectedItemDetail.unitName}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-500 font-semibold block">متوسط التكلفة</span>
                <span className="text-lg font-bold text-slate-800">
                  {selectedItemDetail.avgCost.toFixed(2)} {currency}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100">
                <span className="text-[11px] text-indigo-700 font-semibold block">قيمة المخزون</span>
                <span className="text-lg font-black text-indigo-950">
                  {(selectedItemDetail.totalQuantity * selectedItemDetail.avgCost).toFixed(2)} {currency}
                </span>
              </div>
            </div>

            {/* Storage Locations */}
            <div>
              <h4 className="text-xs font-bold text-purple-950 mb-2 flex items-center gap-1.5">
                <span>أماكن التخزين وتوزيع الأرصدة:</span>
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {selectedItemDetail.locations.map((loc) => (
                  <div
                    key={loc.locationId}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/50 border border-purple-100 text-xs"
                  >
                    <span className="font-medium text-slate-800">{loc.locationPath}</span>
                    <span className="font-mono font-bold text-purple-900">
                      {loc.quantity} {selectedItemDetail.unitName}
                    </span>
                  </div>
                ))}
                {selectedItemDetail.locations.length === 0 && (
                  <p className="text-xs text-slate-400 italic">لا توجد مواقع مسجلة بها رصيد حالياً.</p>
                )}
              </div>
            </div>

            {/* Supplier Prices & Lowest Price */}
            <div>
              <h4 className="text-xs font-bold text-purple-950 mb-2">أسعار الموردين المسجلة للصنف:</h4>
              <div className="space-y-1.5">
                {selectedItemDetail.supplierPrices.map((sp, idx) => (
                  <div
                    key={sp.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs border ${
                      idx === 0
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{sp.supplierName}</span>
                      {idx === 0 && (
                        <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.2 rounded-full">
                          أقل سعر حالي
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-bold">
                      {sp.price.toFixed(2)} {sp.currency}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-3 border-t border-purple-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setLabelModalItem(selectedItemDetail);
                  setIsLabelModalOpen(true);
                  setSelectedItemDetail(null);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-100 text-purple-900 hover:bg-purple-200 font-bold text-xs"
              >
                <QrCode className="h-4 w-4" />
                <span>طباعة ملصق الباركود</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingItem(selectedItemDetail);
                    setIsItemModalOpen(true);
                    setSelectedItemDetail(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow"
                >
                  تعديل الصنف
                </button>
                <button
                  onClick={() => setSelectedItemDetail(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
