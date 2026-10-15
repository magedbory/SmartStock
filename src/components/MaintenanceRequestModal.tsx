/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wrench,
  AlertOctagon,
  Plus,
  Trash2,
  X,
  AlertTriangle,
  Boxes
} from 'lucide-react';
import { MaintenanceRequestType } from '../types';

export const MaintenanceRequestModal: React.FC = () => {
  const { isRequestModalOpen, setIsRequestModalOpen, items, createMaintenanceRequest } = useApp();

  const [type, setType] = useState<MaintenanceRequestType>('breakdown');
  const [equipmentRef, setEquipmentRef] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedLines, setSelectedLines] = useState<{ itemId: string; requestedQty: number }[]>([
    { itemId: items[0]?.id || '', requestedQty: 1 },
  ]);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isRequestModalOpen) return null;

  const handleAddLine = () => {
    setSelectedLines((prev) => [...prev, { itemId: items[0]?.id || '', requestedQty: 1 }]);
  };

  const handleRemoveLine = (index: number) => {
    setSelectedLines((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateLine = (index: number, itemId: string, requestedQty: number) => {
    setSelectedLines((prev) =>
      prev.map((line, idx) => (idx === index ? { itemId, requestedQty } : line))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const res = createMaintenanceRequest({
      type,
      equipmentReference: equipmentRef,
      items: selectedLines,
      notes: notes || undefined,
    });

    if (res.success) {
      setIsRequestModalOpen(false);
      setEquipmentRef('');
      setNotes('');
      setSelectedLines([{ itemId: items[0]?.id || '', requestedQty: 1 }]);
    } else {
      setErrorMessage(res.error || 'حدث خطأ أثناء رفع الطلب.');
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
            <div className="p-2.5 rounded-2xl bg-indigo-100 text-indigo-800">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-purple-950">طلب صرف قطع غيار للصيانة</h3>
              <p className="text-xs text-slate-500">تقديم طلب موجه لمدير الصيانة للاعتماد ثم إحالته للمستودع</p>
            </div>
          </div>
          <button
            onClick={() => setIsRequestModalOpen(false)}
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
          {/* Request Type */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">نوع أمر العمل *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('breakdown')}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  type === 'breakdown'
                    ? 'bg-rose-50 border-rose-300 text-rose-800 ring-2 ring-rose-500/20'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <AlertOctagon className="h-4 w-4 text-rose-600" />
                <span>عطل طارئ (Breakdown Repair)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('routine')}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  type === 'routine'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-800 ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <Wrench className="h-4 w-4 text-indigo-600" />
                <span>صيانة دورية وقائية (Routine)</span>
              </button>
            </div>
          </div>

          {/* Equipment Reference */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              اسم المعدة / الماكينة / خط الإنتاج *
            </label>
            <input
              type="text"
              required
              value={equipmentRef}
              onChange={(e) => setEquipmentRef(e.target.value)}
              placeholder="مثال: خط الإنتاج 3 - محرك السير الناقل الرئيسي"
              className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-bold"
            />
          </div>

          {/* Parts Request Lines */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">قطع الغيار والكميات المطلوبة *</label>
              <button
                type="button"
                onClick={handleAddLine}
                className="text-xs text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>إضافة قطعة أخرى</span>
              </button>
            </div>

            <div className="space-y-2">
              {selectedLines.map((line, idx) => {
                const selectedItem = items.find((i) => i.id === line.itemId);
                return (
                  <div
                    key={idx}
                    className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100 flex items-center gap-2"
                  >
                    <div className="flex-1">
                      <select
                        value={line.itemId}
                        onChange={(e) => handleUpdateLine(idx, e.target.value, line.requestedQty)}
                        className="w-full p-2 rounded-xl bg-white border border-purple-200 text-xs font-bold"
                      >
                        {items.map((it) => (
                          <option key={it.id} value={it.id}>
                            {it.code} — {it.name} (المتاح: {it.totalQuantity} {it.unitName})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-24">
                      <input
                        type="number"
                        min="1"
                        value={line.requestedQty}
                        onChange={(e) => handleUpdateLine(idx, line.itemId, Number(e.target.value))}
                        className="w-full p-2 rounded-xl bg-white border border-purple-200 text-xs font-mono font-bold text-center"
                      />
                    </div>

                    <span className="text-[11px] text-slate-500 font-bold w-12 text-center">
                      {selectedItem?.unitName || 'قطعة'}
                    </span>

                    {selectedLines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">وصف العطل أو مبررات الصيانة</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: اهتزاز في عمود المحرك مع صوت احتكاك غير طبيعي أثناء تشغيل وردية الصباح..."
              className="w-full p-2.5 rounded-xl border border-purple-200 text-xs"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-purple-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsRequestModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-700 to-purple-700 hover:from-indigo-600 hover:to-purple-600 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              إرسال الطلب للاعتماد
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
