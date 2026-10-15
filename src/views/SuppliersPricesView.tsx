/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Truck,
  Plus,
  Search,
  DollarSign,
  TrendingDown,
  Building,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { Supplier, Item } from '../types';

export const SuppliersPricesView: React.FC = () => {
  const { suppliers, items, currency, addSupplier, addSupplierPrice } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'LOWEST_PRICES' | 'SUPPLIERS_LIST'>('LOWEST_PRICES');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Supplier Modal state
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [newSupName, setNewSupName] = useState('');
  const [newSupPerson, setNewSupPerson] = useState('');
  const [newSupPhone, setNewSupPhone] = useState('');
  const [newSupEmail, setNewSupEmail] = useState('');
  const [newSupAddress, setNewSupAddress] = useState('');

  // Add Price Modal state
  const [isAddPriceOpen, setIsAddPriceOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [priceNotes, setPriceNotes] = useState('');

  // Calculate lowest price per item
  const itemsWithLowestPrice = items.map((itm) => {
    let lowestPrice = Infinity;
    let bestSupplier = '';
    itm.supplierPrices.forEach((sp) => {
      if (sp.price < lowestPrice) {
        lowestPrice = sp.price;
        bestSupplier = sp.supplierName;
      }
    });

    return {
      ...itm,
      lowestPrice: lowestPrice === Infinity ? null : lowestPrice,
      bestSupplier: bestSupplier || 'غير مسجل',
    };
  });

  const filteredItems = itemsWithLowestPrice.filter((itm) =>
    itm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    itm.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    itm.bestSupplier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-purple-950">
              إدارة الموردين واستعلام أقل الأسعار (Lowest Price Lookup)
            </h1>
            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {suppliers.length} موردين معتمدين
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            مقارنة عروض أسعار قطع الغيار واختيار المورد الأفضل لتقليل تكلفة المشتريات وتفادي الشراء المكرر
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedItemId(items[0]?.id || '');
              setSelectedSupplierId(suppliers[0]?.id || '');
              setNewPrice('');
              setPriceNotes('');
              setIsAddPriceOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow transition-all active:scale-95"
          >
            <DollarSign className="h-4 w-4" />
            <span>تسجيل سعر توريد</span>
          </button>

          <button
            onClick={() => setIsAddSupplierOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs shadow transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة مورد</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-purple-100 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('LOWEST_PRICES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'LOWEST_PRICES'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-purple-900 hover:bg-purple-50'
            }`}
          >
            <TrendingDown className="h-4 w-4" />
            <span>مقارنة أقل أسعار الشراء للأصناف</span>
          </button>

          <button
            onClick={() => setActiveSubTab('SUPPLIERS_LIST')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'SUPPLIERS_LIST'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-purple-900 hover:bg-purple-50'
            }`}
          >
            <Building className="h-4 w-4" />
            <span>دليل بيانات الموردين</span>
          </button>
        </div>

        {activeSubTab === 'LOWEST_PRICES' && (
          <div className="relative w-72">
            <Search className="absolute right-3 top-2.5 h-3.5 w-3.5 text-purple-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالصنف أو كود القطعة أو المورد..."
              className="w-full pr-9 pl-3 py-1.5 rounded-xl bg-purple-50/50 border border-purple-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
        )}
      </div>

      {/* View 1: Lowest Prices Grid */}
      {activeSubTab === 'LOWEST_PRICES' && (
        <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-purple-50/70 text-purple-950 font-bold border-b border-purple-200">
                <tr>
                  <th className="py-3.5 px-4">كود الصنف</th>
                  <th className="py-3.5 px-4">اسم القطعة والمواصفات</th>
                  <th className="py-3.5 px-4">التصنيف</th>
                  <th className="py-3.5 px-4">أفضل مورد (أقل سعر)</th>
                  <th className="py-3.5 px-4">أقل سعر شراء</th>
                  <th className="py-3.5 px-4">متوسط التكلفة بالمخزن</th>
                  <th className="py-3.5 px-4">عدد عروض الأسعار</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredItems.map((itm) => (
                  <tr key={itm.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-900">
                      <span className="bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {itm.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{itm.name}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-semibold">{itm.categoryName}</td>
                    <td className="py-3.5 px-4">
                      {itm.lowestPrice ? (
                        <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <span>{itm.bestSupplier}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">لا توجد أسعار مسجلة</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-emerald-700 text-sm">
                      {itm.lowestPrice ? (
                        <span>
                          {itm.lowestPrice.toFixed(2)} {currency}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 font-semibold">
                      {itm.avgCost.toFixed(2)} {currency}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[11px]">
                        {itm.supplierPrices.length} عروض مسجلة
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 2: Suppliers Directory */}
      {activeSubTab === 'SUPPLIERS_LIST' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {suppliers.map((sup) => (
            <div
              key={sup.id}
              className="bg-white p-5 rounded-3xl border border-purple-100 shadow-sm hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-base">{sup.name}</h3>
                  <p className="text-xs text-purple-700 font-semibold mt-0.5">
                    مسؤول الاتصال: {sup.contactPerson}
                  </p>
                </div>
                <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
                  <Building className="h-5 w-5" />
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-purple-50">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-purple-500" />
                  <span className="font-mono">{sup.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-purple-500" />
                  <span>{sup.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-purple-500" />
                  <span>{sup.address}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Supplier Modal */}
      {isAddSupplierOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 space-y-4">
            <h3 className="text-base font-black text-purple-950">إضافة مورد قطع غيار جديد</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">اسم المورد / الشركة *</label>
                <input
                  type="text"
                  value={newSupName}
                  onChange={(e) => setNewSupName(e.target.value)}
                  placeholder="مثال: مؤسسة النور الهندسية للتوريدات"
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الشخص المسؤول</label>
                <input
                  type="text"
                  value={newSupPerson}
                  onChange={(e) => setNewSupPerson(e.target.value)}
                  placeholder="مثال: م. وائل القحطاني"
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={newSupPhone}
                    onChange={(e) => setNewSupPhone(e.target.value)}
                    placeholder="+966 ..."
                    className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={newSupEmail}
                    onChange={(e) => setNewSupEmail(e.target.value)}
                    placeholder="sales@..."
                    className="w-full p-2.5 rounded-xl border border-purple-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">العنوان والموقع</label>
                <input
                  type="text"
                  value={newSupAddress}
                  onChange={(e) => setNewSupAddress(e.target.value)}
                  placeholder="مثال: الرياض - المدينة الصناعية"
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-100">
              <button
                onClick={() => setIsAddSupplierOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  const res = addSupplier({
                    name: newSupName,
                    contactPerson: newSupPerson,
                    phone: newSupPhone,
                    email: newSupEmail,
                    address: newSupAddress,
                  });
                  if (res.success) {
                    setIsAddSupplierOpen(false);
                    setNewSupName('');
                  }
                }}
                className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow"
              >
                حفظ المورد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Price Modal */}
      {isAddPriceOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 space-y-4">
            <h3 className="text-base font-black text-purple-950">تسجيل سعر شراء لصنف من مورد</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الصنف المطلوب *</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-bold"
                >
                  {items.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.code} — {it.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">المورد *</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-bold"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">السعر المعتمد ({currency}) *</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">ملاحظات العرض</label>
                <input
                  type="text"
                  value={priceNotes}
                  onChange={(e) => setPriceNotes(e.target.value)}
                  placeholder="مثال: خصم كمية 50 قطعة أو أكثر"
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-100">
              <button
                onClick={() => setIsAddPriceOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  if (selectedItemId && selectedSupplierId && Number(newPrice) > 0) {
                    addSupplierPrice(selectedItemId, selectedSupplierId, Number(newPrice), priceNotes);
                    setIsAddPriceOpen(false);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow"
              >
                تثبيت السعر
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
