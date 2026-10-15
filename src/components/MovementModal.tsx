/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  PackagePlus,
  ArrowDownLeft,
  ArrowRightLeft,
  SlidersHorizontal,
  RotateCcw,
  X,
  AlertTriangle,
  MapPin,
  Clock
} from 'lucide-react';
import { MovementType } from '../types';

export const MovementModal: React.FC = () => {
  const {
    isMovementModalOpen,
    setIsMovementModalOpen,
    movementModalDefaultType,
    movementModalDefaultItemId,
    items,
    warehouses,
    suppliers,
    recordMovement,
    currency
  } = useApp();

  const [type, setType] = useState<MovementType>(movementModalDefaultType);
  const [selectedItemId, setSelectedItemId] = useState<string>(movementModalDefaultItemId || (items[0]?.id || ''));
  const [quantity, setQuantity] = useState<string>('1');
  const [fromLocId, setFromLocId] = useState<string>('');
  const [toLocId, setToLocId] = useState<string>('');
  const [unitCost, setUnitCost] = useState<string>('');
  const [supplierId, setSupplierId] = useState<string>('');
  const [batchNumber, setBatchNumber] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Flatten all spots for selection
  const allSpots: { id: string; fullPath: string }[] = [];
  warehouses.forEach((w) => {
    w.shelves.forEach((sh) => {
      sh.spots.forEach((sp) => {
        allSpots.push({ id: sp.id, fullPath: sp.fullPath });
      });
    });
  });

  useEffect(() => {
    if (isMovementModalOpen) {
      setType(movementModalDefaultType);
      const chosenItem = items.find((i) => i.id === movementModalDefaultItemId) || items[0];
      setSelectedItemId(chosenItem ? chosenItem.id : '');
      setUnitCost(chosenItem ? chosenItem.avgCost.toString() : '');
      setFromLocId(chosenItem?.locations[0]?.locationId || allSpots[0]?.id || '');
      setToLocId(allSpots[1]?.id || allSpots[0]?.id || '');
      setSupplierId(suppliers[0]?.id || '');
      setQuantity('1');
      setReason('');
      setErrorMessage('');
      setBatchNumber(`BTH-${new Date().toISOString().slice(0, 10)}`);
      setExpiryDate('');
    }
  }, [isMovementModalOpen, movementModalDefaultType, movementModalDefaultItemId]);

  if (!isMovementModalOpen) return null;

  const currentItem = items.find((i) => i.id === selectedItemId);
  const fromLocationBalance = currentItem?.locations.find((l) => l.locationId === fromLocId)?.quantity || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const res = recordMovement({
      type,
      itemId: selectedItemId,
      quantity: Number(quantity),
      fromLocationId: (type === 'issue' || type === 'transfer' || type === 'adjustment') ? fromLocId : undefined,
      toLocationId: (type === 'receipt' || type === 'transfer' || type === 'return') ? toLocId : undefined,
      unitCost: unitCost ? Number(unitCost) : undefined,
      supplierId: type === 'receipt' ? supplierId : undefined,
      batchNumber: currentItem?.tracksExpiry && type === 'receipt' ? batchNumber : undefined,
      expiryDate: currentItem?.tracksExpiry && type === 'receipt' ? expiryDate : undefined,
      reason: reason || undefined,
    });

    if (res.success) {
      setIsMovementModalOpen(false);
    } else {
      setErrorMessage(res.error || 'حدث خطأ أثناء تسجيل الحركة.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div
        className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-purple-100 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-800">
              {type === 'receipt' ? <PackagePlus className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-base font-black text-purple-950">تسجيل حركة مخزنية جديدة</h3>
              <p className="text-xs text-slate-500">تحديث تلقائي وفوري للأرصدة مع إنشاء سجل تدقيق</p>
            </div>
          </div>
          <button
            onClick={() => setIsMovementModalOpen(false)}
            className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Movement Type Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setType('receipt')}
            className={`py-2 px-1 rounded-xl transition-all ${
              type === 'receipt' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            توريد واستلام
          </button>
          <button
            type="button"
            onClick={() => setType('issue')}
            className={`py-2 px-1 rounded-xl transition-all ${
              type === 'issue' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-rose-700'
            }`}
          >
            صرف صيانة
          </button>
          <button
            type="button"
            onClick={() => setType('transfer')}
            className={`py-2 px-1 rounded-xl transition-all ${
              type === 'transfer' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-indigo-700'
            }`}
          >
            نقل مواقع
          </button>
          <button
            type="button"
            onClick={() => setType('return')}
            className={`py-2 px-1 rounded-xl transition-all ${
              type === 'return' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:text-teal-700'
            }`}
          >
            إرجاع
          </button>
          <button
            type="button"
            onClick={() => setType('adjustment')}
            className={`py-2 px-1 rounded-xl transition-all ${
              type === 'adjustment' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-amber-700'
            }`}
          >
            تسوية جرد
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Item Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">قطعة الغيار / الصنف *</label>
            <select
              value={selectedItemId}
              onChange={(e) => {
                setSelectedItemId(e.target.value);
                const itm = items.find((i) => i.id === e.target.value);
                if (itm) {
                  setUnitCost(itm.avgCost.toString());
                  if (itm.locations[0]) setFromLocId(itm.locations[0].locationId);
                }
              }}
              className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-bold text-purple-950 focus:ring-2 focus:ring-purple-600"
            >
              {items.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.code} — {it.name} (الرصيد: {it.totalQuantity} {it.unitName})
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock Preview */}
          {currentItem && (
            <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 font-medium">الرصيد الكلي الحالي:</span>
                <span className="font-mono font-black text-purple-950 mr-1.5 text-sm">
                  {currentItem.totalQuantity} {currentItem.unitName}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">متوسط التكلفة:</span>
                <span className="font-mono font-bold text-slate-800 mr-1.5">
                  {currentItem.avgCost.toFixed(2)} {currency}
                </span>
              </div>
            </div>
          )}

          {/* Quantity & Unit Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                الكمية ({currentItem?.unitName || 'وحدة'}) *
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-mono font-bold"
              />
            </div>

            {type === 'receipt' && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  سعر توريد الوحدة ({currency})
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-mono font-bold"
                />
              </div>
            )}
          </div>

          {/* Location Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(type === 'issue' || type === 'transfer' || type === 'adjustment') && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  من موقع التخزين (المصدر) *
                </label>
                <select
                  value={fromLocId}
                  onChange={(e) => setFromLocId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-bold"
                >
                  {allSpots.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.fullPath}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  الرصيد المتاح بهذا الموقع: <span className="font-mono font-bold text-purple-700">{fromLocationBalance}</span>
                </span>
              </div>
            )}

            {(type === 'receipt' || type === 'transfer' || type === 'return') && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  إلى موقع التخزين (الوجهة) *
                </label>
                <select
                  value={toLocId}
                  onChange={(e) => setToLocId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-bold"
                >
                  {allSpots.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.fullPath}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Supplier for Receipt */}
          {type === 'receipt' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">المورد المعتمد للتوريد</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-bold"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Expiry & Batch if Tracks Expiry */}
          {currentItem?.tracksExpiry && type === 'receipt' && (
            <div className="bg-purple-50/80 p-3 rounded-2xl border border-purple-200 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-950">
                <Clock className="h-4 w-4 text-purple-700" />
                <span>بيانات الدفعة وتاريخ الصلاحية (صنف حساس):</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">رقم الدفعة (تشغيلة)</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="BTH-2026-..."
                    className="w-full p-2 rounded-xl border border-purple-200 text-xs font-mono font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">تاريخ انتهاء الصلاحية *</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    required
                    className="w-full p-2 rounded-xl border border-purple-200 text-xs font-mono font-bold bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Reason / Reference */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              السبب أو رقم إذن الفحص / الفاتورة {type === 'adjustment' && <span className="text-rose-600">* (إلزامي 5 أحرف فأكثر)</span>}
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                type === 'adjustment'
                  ? 'مثال: جرد دوري ربع سنوي وتصحيح العجز الفعلي الناتج عن تلف العبوة'
                  : 'مثال: فاتورة توريد رقم #4502 أو صيانة ماكينة تعبئة'
              }
              className="w-full p-2.5 rounded-xl border border-purple-200 text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-purple-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsMovementModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              تأكيد وتسجيل الحركة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
