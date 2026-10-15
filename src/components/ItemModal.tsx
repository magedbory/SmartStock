/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Boxes,
  X,
  AlertTriangle,
  ShieldAlert,
  Clock,
  Sparkles
} from 'lucide-react';

export const ItemModal: React.FC = () => {
  const {
    isItemModalOpen,
    setIsItemModalOpen,
    editingItem,
    categories,
    units,
    addItem,
    updateItem,
    movements,
    currency
  } = useApp();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [description, setDescription] = useState('');
  const [minStock, setMinStock] = useState('5');
  const [avgCost, setAvgCost] = useState('0');
  const [barcode, setBarcode] = useState('');
  const [isCritical, setIsCritical] = useState(false);
  const [tracksExpiry, setTracksExpiry] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const hasMovements = editingItem ? movements.some((m) => m.itemId === editingItem.id) : false;

  useEffect(() => {
    if (isItemModalOpen) {
      if (editingItem) {
        setCode(editingItem.code);
        setName(editingItem.name);
        setCategoryId(editingItem.categoryId);
        setUnitId(editingItem.unitId);
        setDescription(editingItem.description);
        setMinStock(editingItem.minStock.toString());
        setAvgCost(editingItem.avgCost.toString());
        setBarcode(editingItem.barcode);
        setIsCritical(editingItem.isCritical);
        setTracksExpiry(editingItem.tracksExpiry);
      } else {
        setCode('');
        setName('');
        setCategoryId(categories[0]?.id || '');
        setUnitId(units[0]?.id || '');
        setDescription('');
        setMinStock('5');
        setAvgCost('0');
        setBarcode(`${Math.floor(1000000000 + Math.random() * 9000000000)}`);
        setIsCritical(false);
        setTracksExpiry(false);
      }
      setErrorMessage('');
    }
  }, [isItemModalOpen, editingItem, categories, units]);

  if (!isItemModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (editingItem) {
      const res = updateItem(editingItem.id, {
        code,
        name,
        categoryId,
        unitId,
        description,
        minStock: Number(minStock),
        avgCost: Number(avgCost),
        barcode,
        isCritical,
        tracksExpiry,
      });

      if (res.success) {
        setIsItemModalOpen(false);
      } else {
        setErrorMessage(res.error || 'حدث خطأ أثناء تعديل الصنف.');
      }
    } else {
      const res = addItem({
        code,
        name,
        categoryId,
        unitId,
        description,
        minStock: Number(minStock),
        avgCost: Number(avgCost),
        barcode,
        isCritical,
        tracksExpiry,
      });

      if (res.success) {
        setIsItemModalOpen(false);
      } else {
        setErrorMessage(res.error || 'حدث خطأ أثناء إضافة الصنف.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div
        className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-purple-100 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-purple-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-800">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-purple-950">
                {editingItem ? 'تعديل بيانات قطعة الغيار' : 'إضافة قطعة غيار ومستهلك جديد'}
              </h3>
              <p className="text-xs text-slate-500">كتالوج قطع الغيار المعتمد بالمصنع</p>
            </div>
          </div>
          <button
            onClick={() => setIsItemModalOpen(false)}
            className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                كود الصنف (فريد) *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="مثال: BRG-6305-ZZ"
                className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                رقم الباركود *
              </label>
              <input
                type="text"
                required
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="628100..."
                className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              اسم الصنف والمواصفات الفنية *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: رولمان بلي (محمل كريات) 6305 عالي السرعة"
              className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-bold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">التصنيف *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-bold"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                وحدة القياس * {hasMovements && <span className="text-slate-400 text-[10px]">(مقفلة لوجود حركات)</span>}
              </label>
              <select
                value={unitId}
                disabled={hasMovements}
                onChange={(e) => setUnitId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-bold disabled:bg-slate-100"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                حد الأمان الأدنى للمخزون (Min Stock) *
              </label>
              <input
                type="number"
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                متوسط التكلفة التقديري ({currency})
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={avgCost}
                onChange={(e) => setAvgCost(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-mono font-bold"
              />
            </div>
          </div>

          {/* Critical & Expiry Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <label className="flex items-start gap-2.5 p-3 rounded-2xl border border-purple-200 bg-purple-50/40 cursor-pointer hover:bg-purple-50">
              <input
                type="checkbox"
                checked={isCritical}
                onChange={(e) => setIsCritical(e.target.checked)}
                className="mt-1 rounded text-purple-700 focus:ring-purple-600 h-4 w-4"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                  صنف حرج لخطوط الإنتاج
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  يتسبب نقصه في توقف فوري لعمليات التصنيع وتكون له الأولوية القصوى في التنبيهات
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-2xl border border-purple-200 bg-purple-50/40 cursor-pointer hover:bg-purple-50">
              <input
                type="checkbox"
                checked={tracksExpiry}
                onChange={(e) => setTracksExpiry(e.target.checked)}
                className="mt-1 rounded text-purple-700 focus:ring-purple-600 h-4 w-4"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-purple-700" />
                  تتبع تاريخ الصلاحية
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  للزيوت والشحوم والجوانات والمواد الكيميائية ذات العمر التشغيلي المحدود
                </span>
              </div>
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              الوصف وملاحظات الاستخدام
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثال: يركب على محركات مراوح التبريد للفرن الحراري رقم 2..."
              className="w-full p-2.5 rounded-xl border border-purple-200 text-xs"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-purple-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsItemModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              {editingItem ? 'حفظ التعديلات' : 'إضافة الصنف للدليل'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
