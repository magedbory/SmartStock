/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  FileText
} from 'lucide-react';
import { Item } from '../types';

interface ParsedRow {
  rowNumber: number;
  code: string;
  name: string;
  categoryName: string;
  categoryId: string;
  unitName: string;
  unitId: string;
  minStock: number;
  avgCost: number;
  isCritical: boolean;
  tracksExpiry: boolean;
  description: string;
  isValid: boolean;
  errors: string[];
}

export const ImportExcelView: React.FC = () => {
  const { items, categories, units, importItems, showToast, setActiveTab, currency } = useApp();

  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(false);

  // Download sample CSV template in Arabic UTF-8
  const downloadTemplate = () => {
    const templateContent =
      '\uFEFFكود الصنف,اسم الصنف والمواصفات,التصنيف,وحدة القياس,الحد الأدنى,متوسط التكلفة,صنف حرج (نعم/لا),تتبع الصلاحية (نعم/لا),الوصف\n' +
      'MTR-AC-1.5KW,محرك كهربائي 1.5 كيلوواط 1400RPM,مكونات تحكم وكهرباء,قطعة,3,450.00,نعم,لا,محرك سير التغذية الرئيسي\n' +
      'SEAL-OIL-45X65,مانع تسرب زيت دبل لباد 45x65x10,موانع تسرب وجوانات,قطعة,10,18.00,لا,لا,جوانات عمود الدوران لمضخة الهيدروليك\n' +
      'GREASE-FOOD-GR,شحم صناعي مخصص للمصانع الغذائية H1,زيوت وشحوم صناعية,علبة,8,95.00,لا,نعم,شحم آمن للملامسة الغذائية لخطوط العصير\n';

    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'SmartStock_نموذج_استيراد_قطع_الغيار.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('تم تنزيل نموذج الاستيراد بنجاح.');
  };

  // Simulate loading sample data from an excel file
  const handleSimulateUpload = () => {
    setIsProcessing(true);
    setTimeout(() => {
      // Mock rows representing uploaded data, including 1 deliberate duplicate to demonstrate validation!
      const mockRawRows = [
        {
          code: 'PMP-GEAR-08',
          name: 'طلمبة تروس هيدروليكية 8cc/rev',
          categoryName: 'صمامات ومعدات نيوماتيك',
          unitName: 'قطعة',
          minStock: 2,
          avgCost: 320,
          isCritical: true,
          tracksExpiry: false,
          description: 'مضخة تروس للمنظومة الهيدروليكية للمكابس',
        },
        {
          code: 'FUSE-10A-GG',
          name: 'فيوز كهربائي سيراميك سريع القطع 10A 500V',
          categoryName: 'مكونات تحكم وكهرباء',
          unitName: 'قطعة',
          minStock: 20,
          avgCost: 8.5,
          isCritical: false,
          tracksExpiry: false,
          description: 'فيوزات حماية الدوائر الحساسة وكروت PLC',
        },
        {
          code: 'BRG-6204-2RS', // Duplicate code error test!
          name: 'محمل كريات مكرر (محاولة إدخال غير صالحة)',
          categoryName: 'رولمانات ومحامل دوران',
          unitName: 'قطعة',
          minStock: 5,
          avgCost: 40,
          isCritical: false,
          tracksExpiry: false,
          description: 'صنف يحمل نفس الكود المسجل مسبقاً لاختبار التحقق',
        },
        {
          code: 'BELT-SPA-1600',
          name: 'سير محرك ناقل للحركة SPA-1600 أوبتي بيلت',
          categoryName: 'سيور نقل الحركة',
          unitName: 'قطعة',
          minStock: 6,
          avgCost: 55,
          isCritical: true,
          tracksExpiry: false,
          description: 'سير ضواغط الهواء والشفاطات المركزية',
        },
        {
          code: 'OIL-COMP-ISO46',
          name: 'زيت كمبروسر هواء حلزوني تركيبي ISO VG 46',
          categoryName: 'زيوت وشحوم صناعية',
          unitName: 'لتر',
          minStock: 60,
          avgCost: 24,
          isCritical: false,
          tracksExpiry: true,
          description: 'زيت تشحيم وتبريد ضواغط الهواء اللولبية',
        },
      ];

      const evaluated: ParsedRow[] = mockRawRows.map((raw, index) => {
        const errors: string[] = [];
        const trimmedCode = raw.code.trim().toUpperCase();

        if (!trimmedCode) errors.push('كود الصنف مفقود');
        if (!raw.name) errors.push('اسم الصنف مفقود');

        // Check if code already exists in catalog
        if (items.some((it) => it.code.toUpperCase() === trimmedCode)) {
          errors.push(`كود الصنف "${trimmedCode}" مسجل مسبقاً بالنظام`);
        }

        const cat = categories.find((c) => c.name === raw.categoryName) || categories[0];
        const unit = units.find((u) => u.name.includes(raw.unitName) || u.symbol.includes(raw.unitName)) || units[0];

        return {
          rowNumber: index + 2,
          code: trimmedCode,
          name: raw.name,
          categoryName: cat.name,
          categoryId: cat.id,
          unitName: unit.symbol,
          unitId: unit.id,
          minStock: raw.minStock,
          avgCost: raw.avgCost,
          isCritical: raw.isCritical,
          tracksExpiry: raw.tracksExpiry,
          description: raw.description,
          isValid: errors.length === 0,
          errors,
        };
      });

      setParsedRows(evaluated);
      setIsProcessing(false);
      setHasUploaded(true);
      showToast('تم فحص ملف الإكسل والتحقق من الحقول الإلزامية وتكرار الأكواد.');
    }, 600);
  };

  const validRows = parsedRows.filter((r) => r.isValid);
  const invalidRows = parsedRows.filter((r) => !r.isValid);

  const confirmImport = () => {
    if (validRows.length === 0) return;

    const newItems: Item[] = validRows.map((r) => ({
      id: `ITM-IMP-${Date.now()}-${r.code}`,
      code: r.code,
      name: r.name,
      categoryId: r.categoryId,
      categoryName: r.categoryName,
      unitId: r.unitId,
      unitName: r.unitName,
      description: r.description,
      tracksExpiry: r.tracksExpiry,
      minStock: r.minStock,
      isCritical: r.isCritical,
      avgCost: r.avgCost,
      barcode: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      isActive: true,
      totalQuantity: 0,
      locations: [],
      batches: [],
      supplierPrices: [],
    }));

    importItems(newItems);
    setHasUploaded(false);
    setParsedRows([]);
    setActiveTab('items');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-purple-950">
              استيراد الأصناف المجمع من إكسل (Excel Item Import)
            </h1>
            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              P1-F005
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إدخال آلاف قطع الغيار والمستهلكات دفعة واحدة عبر نموذج إكسل موحد مع تدقيق أوتوماتيكي للأخطاء وتكرار الأكواد
          </p>
        </div>

        <button
          onClick={downloadTemplate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs border border-purple-200 transition-colors"
        >
          <Download className="h-4 w-4 text-purple-700" />
          <span>تنزيل نموذج إكسل الفارغ (.CSV)</span>
        </button>
      </div>

      {/* Upload Box */}
      {!hasUploaded && (
        <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-purple-200 hover:border-purple-500 transition-colors text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-purple-50 text-purple-700 mx-auto flex items-center justify-center">
            <FileSpreadsheet className="h-8 w-8" />
          </div>

          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-black text-purple-950">اسحب وأفلت ملف إكسل أو انقر للاختيار</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              يدعم الملفات بتنسيق .xlsx أو .csv حتى 10 ميغابايت. يمكنك تجربة ملف محاكاة جاهز بنقرة واحدة.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleSimulateUpload}
              disabled={isProcessing}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              <span>{isProcessing ? 'جارٍ فحص الملف...' : 'رفع وفحص ملف إكسل نموذجي للورشة'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Preview & Validation Results */}
      {hasUploaded && (
        <div className="space-y-4 animate-in fade-in">
          
          {/* Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100 text-purple-800">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold block">إجمالي السجلات المفحوصة</span>
                <span className="text-xl font-black text-purple-950">{parsedRows.length} صنف</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs text-emerald-800 font-bold block">سجلات صالحة للاستيراد</span>
                <span className="text-xl font-black text-emerald-700">{validRows.length} صنف</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-100 text-rose-800">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs text-rose-800 font-bold block">سجلات مرفوضة (تحتوي أخطاء)</span>
                <span className="text-xl font-black text-rose-700">{invalidRows.length} أخطاء</span>
              </div>
            </div>
          </div>

          {/* Action Confirmation Banner */}
          <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-600">
              سيتم إنشاء <span className="font-bold text-emerald-700">{validRows.length}</span> أصناف جديدة في دليل قطع الغيار فوراً، مع استبعاد السجلات غير الصالحة وتوثيق العملية في سجل التدقيق.
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setHasUploaded(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                إلغاء والعودة
              </button>
              <button
                onClick={confirmImport}
                disabled={validRows.length === 0}
                className="px-6 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-bold text-xs shadow transition-all"
              >
                تأكيد واعتماد الاستيراد ({validRows.length} صنف)
              </button>
            </div>
          </div>

          {/* Validation Table */}
          <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-purple-50/70 text-purple-950 font-bold border-b border-purple-200">
                  <tr>
                    <th className="py-3 px-4">رقم السطر</th>
                    <th className="py-3 px-4">الحالة</th>
                    <th className="py-3 px-4">كود الصنف</th>
                    <th className="py-3 px-4">اسم القطعة</th>
                    <th className="py-3 px-4">التصنيف</th>
                    <th className="py-3 px-4">الحد الأدنى</th>
                    <th className="py-3 px-4">متوسط التكلفة</th>
                    <th className="py-3 px-4">تقرير التحقق / سبب الرفض</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {parsedRows.map((row) => (
                    <tr
                      key={row.rowNumber}
                      className={row.isValid ? 'hover:bg-purple-50/30' : 'bg-rose-50/40'}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">{row.rowNumber}</td>
                      <td className="py-3 px-4">
                        {row.isValid ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <CheckCircle className="h-3 w-3" /> صالح
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                            <AlertCircle className="h-3 w-3" /> مرفوض
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-purple-900">{row.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{row.name}</td>
                      <td className="py-3 px-4 text-slate-500">{row.categoryName}</td>
                      <td className="py-3 px-4 font-mono">{row.minStock} {row.unitName}</td>
                      <td className="py-3 px-4 font-mono">{row.avgCost} {currency}</td>
                      <td className="py-3 px-4">
                        {row.isValid ? (
                          <span className="text-emerald-700 font-semibold text-[11px]">مكتمل الشروط</span>
                        ) : (
                          <div className="space-y-0.5">
                            {row.errors.map((err, eIdx) => (
                              <span key={eIdx} className="text-rose-700 font-bold text-[11px] block">
                                • {err}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
