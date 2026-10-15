/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { Printer, X, QrCode } from 'lucide-react';

export const BarcodeLabelModal: React.FC = () => {
  const { isLabelModalOpen, setIsLabelModalOpen, labelModalItem } = useApp();

  if (!isLabelModalOpen || !labelModalItem) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-purple-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-purple-950">
                معاينة ملصق الباركود وQR للقطعة التخزينية
              </h3>
              <p className="text-[11px] text-slate-500">جاهز للطباعة على طابعات الملصقات الحرارية</p>
            </div>
          </div>
          <button
            onClick={() => setIsLabelModalOpen(false)}
            className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Industrial Label Card (Printable Area) */}
        <div className="printable-area border-2 border-slate-900 rounded-2xl p-5 bg-white space-y-3 shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
            <span className="font-black text-xs tracking-wider">SMARTSTOCK INDUSTRIAL</span>
            <span className="font-mono text-xs font-black">{labelModalItem.code}</span>
          </div>

          <div>
            <h4 className="font-black text-sm text-slate-900 leading-snug">{labelModalItem.name}</h4>
            <span className="text-[10px] text-slate-600 block mt-0.5">{labelModalItem.categoryName}</span>
          </div>

          <div className="bg-slate-100 p-2 rounded-lg text-xs font-semibold text-slate-800">
            <span className="text-[10px] text-slate-500 block">الموقع المخصص:</span>
            <span>{labelModalItem.locations[0]?.locationPath || 'المستودع المركزي'}</span>
          </div>

          {/* Barcode Stripes Representation */}
          <div className="text-center pt-2">
            <div className="flex items-end justify-center gap-[2.5px] h-12 w-full px-4 overflow-hidden">
              {[4, 2, 6, 1, 3, 5, 2, 7, 3, 2, 6, 4, 2, 5, 1, 6, 3, 4, 2, 7, 1, 5, 3, 6, 2, 4, 3, 5, 2, 6, 3, 5, 2, 4, 6].map((w, i) => (
                <div
                  key={i}
                  className="bg-black"
                  style={{ width: `${w}px`, height: `${30 + (i % 4) * 4}px` }}
                />
              ))}
            </div>
            <span className="font-mono text-xs font-bold tracking-widest text-slate-900 mt-1 block">
              {labelModalItem.barcode}
            </span>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setIsLabelModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
          >
            إلغاء
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Printer className="h-4 w-4" />
            <span>طباعة الملصق الآن</span>
          </button>
        </div>
      </div>
    </div>
  );
};
