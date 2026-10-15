/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  QrCode,
  Camera,
  Search,
  CheckCircle2,
  AlertCircle,
  MapPin,
  TrendingDown,
  PackagePlus,
  ArrowDownLeft,
  X,
  Sparkles
} from 'lucide-react';
import { Item } from '../types';

export const BarcodeScannerModal: React.FC = () => {
  const {
    isScannerOpen,
    setIsScannerOpen,
    items,
    currency,
    setIsMovementModalOpen,
    setMovementModalDefaultType,
    setMovementModalDefaultItemId,
    setIsLabelModalOpen,
    setLabelModalItem
  } = useApp();

  const [scanCode, setScanCode] = useState('');
  const [matchedItem, setMatchedItem] = useState<Item | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isScanningActive, setIsScanningActive] = useState(true);

  if (!isScannerOpen) return null;

  const handleLookup = (codeToSearch: string) => {
    const clean = codeToSearch.trim();
    if (!clean) return;

    setHasSearched(true);
    const found = items.find(
      (i) =>
        i.barcode === clean ||
        i.code.toLowerCase() === clean.toLowerCase() ||
        i.id.toLowerCase() === clean.toLowerCase()
    );
    setMatchedItem(found || null);
  };

  const sampleScan = (item: Item) => {
    setScanCode(item.barcode);
    handleLookup(item.barcode);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-purple-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-800">
              <QrCode className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-purple-950">
                قارئ الباركود ورمز الاستجابة السريعة (QR Scanner)
              </h3>
              <p className="text-xs text-slate-500">
                استعلام فوري لموقع التخزين، الرصيد المتاح، وأقل سعر شراء
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsScannerOpen(false);
              setMatchedItem(null);
              setHasSearched(false);
              setScanCode('');
            }}
            className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Camera Viewfinder Simulator */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-white h-48 flex flex-col items-center justify-center border border-purple-800/40">
          {/* Animated Scanning Laser Line */}
          <div className="absolute inset-x-8 top-1/2 h-0.5 bg-gradient-to-r from-purple-500 via-rose-500 to-purple-500 shadow-lg shadow-rose-500/50 animate-pulse pointer-events-none" />
          
          <div className="w-48 h-32 border-2 border-dashed border-purple-400/70 rounded-2xl flex flex-col items-center justify-center relative p-3">
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-purple-300" />
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-purple-300" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-purple-300" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-purple-300" />
            
            <Camera className="h-7 w-7 text-purple-300/80 mb-1" />
            <span className="text-[11px] text-purple-200 text-center font-medium">
              وجّه الكاميرا أو قارئ الباركود نحو الملصق
            </span>
          </div>

          <div className="absolute bottom-2 text-[10px] text-purple-300/80 font-mono">
            كاميرا المستودع متصلة وجاهزة للمسح
          </div>
        </div>

        {/* Manual Barcode Input or Quick Barcode Pick */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">
            أو أدخل رقم الباركود / كود القطعة يدوياً:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={scanCode}
              onChange={(e) => setScanCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup(scanCode)}
              placeholder="مثال: 6281000101 أو BRG-6204-2RS"
              className="flex-1 p-2.5 rounded-xl border border-purple-200 text-xs font-mono font-bold focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
            <button
              onClick={() => handleLookup(scanCode)}
              className="px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow transition-colors"
            >
              استعلام
            </button>
          </div>

          {/* Quick test buttons */}
          <div className="pt-1">
            <span className="text-[10px] text-slate-400 block mb-1">نقرة سريعة لتجربة مسح أصناف من المستودع:</span>
            <div className="flex flex-wrap gap-1.5">
              {items.slice(0, 3).map((it) => (
                <button
                  key={it.id}
                  onClick={() => sampleScan(it)}
                  className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 text-[10px] font-mono border border-purple-200 transition-colors"
                >
                  {it.code}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lookup Result Card */}
        {hasSearched && (
          <div className="pt-2">
            {matchedItem ? (
              <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200 space-y-3 animate-in fade-in">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold bg-white text-purple-900 px-2 py-0.5 rounded border border-purple-200">
                      {matchedItem.code}
                    </span>
                    <h4 className="font-black text-slate-900 text-sm mt-1">{matchedItem.name}</h4>
                    <p className="text-xs text-slate-500">{matchedItem.categoryName}</p>
                  </div>
                  <span className="text-sm font-mono font-black text-purple-950 bg-white px-2.5 py-1 rounded-xl border border-purple-200">
                    {matchedItem.totalQuantity} {matchedItem.unitName}
                  </span>
                </div>

                {/* Locations list */}
                <div className="bg-white p-2.5 rounded-xl border border-purple-100 text-xs space-y-1">
                  <div className="flex items-center gap-1 font-bold text-purple-950">
                    <MapPin className="h-3.5 w-3.5 text-purple-600" />
                    <span>موقع التخزين الفعلي:</span>
                  </div>
                  {matchedItem.locations.map((loc) => (
                    <div key={loc.locationId} className="flex justify-between text-[11px] text-slate-700 pr-4">
                      <span>{loc.locationPath}</span>
                      <span className="font-mono font-bold">{loc.quantity} {matchedItem.unitName}</span>
                    </div>
                  ))}
                  {matchedItem.locations.length === 0 && (
                    <p className="text-[11px] text-slate-400 italic pr-4">لا توجد كميات بموقع محدد</p>
                  )}
                </div>

                {/* Lowest Supplier Price */}
                {matchedItem.supplierPrices.length > 0 && (
                  <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-950 p-2.5 rounded-xl border border-emerald-200">
                    <span className="font-semibold">أقل سعر شراء مسجل:</span>
                    <span className="font-mono font-black text-emerald-700">
                      {Math.min(...matchedItem.supplierPrices.map((p) => p.price)).toFixed(2)} {currency} ({matchedItem.supplierPrices[0].supplierName})
                    </span>
                  </div>
                )}

                {/* Quick actions for scanned item */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => {
                      setLabelModalItem(matchedItem);
                      setIsLabelModalOpen(true);
                      setIsScannerOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-100 text-purple-900 hover:bg-purple-200 text-xs font-bold"
                  >
                    طباعة الملصق
                  </button>
                  <button
                    onClick={() => {
                      setMovementModalDefaultType('receipt');
                      setMovementModalDefaultItemId(matchedItem.id);
                      setIsMovementModalOpen(true);
                      setIsScannerOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow"
                  >
                    تسجيل توريد
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 text-center text-xs text-rose-800 space-y-1">
                <AlertCircle className="h-5 w-5 text-rose-600 mx-auto" />
                <p className="font-bold">لم يتم العثور على صنف يطابق هذا الكود</p>
                <p className="text-[11px] text-rose-600">تأكد من كود الباركود المدخل أو ابحث بالاسم في دليل الأصناف</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
