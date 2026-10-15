/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BellRing,
  AlertTriangle,
  Clock,
  ShieldAlert,
  CheckCircle,
  PackagePlus,
  SlidersHorizontal,
  Calendar,
  Settings,
  Sparkles
} from 'lucide-react';
import { InventoryAlert } from '../types';

export const AlertsExpiryView: React.FC = () => {
  const {
    alerts,
    items,
    expiryWindowDays,
    setExpiryWindowDays,
    acknowledgeAlert,
    setIsMovementModalOpen,
    setMovementModalDefaultType,
    setMovementModalDefaultItemId
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ALL' | 'LOW_STOCK' | 'EXPIRY'>('ALL');
  const [showSettings, setShowSettings] = useState(false);
  const [tempDays, setTempDays] = useState(expiryWindowDays);

  const filteredAlerts = alerts.filter((alert) => {
    if (activeTab === 'LOW_STOCK') return alert.type === 'low_stock';
    if (activeTab === 'EXPIRY') return alert.type === 'expiry';
    return true;
  });

  const lowStockAlerts = alerts.filter((a) => a.type === 'low_stock' && a.status === 'open');
  const expiryAlerts = alerts.filter((a) => a.type === 'expiry' && a.status === 'open');

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-purple-950">
              مركز التنبيهات وتتبع تواريخ الصلاحية (Alerts & Expiry)
            </h1>
            <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {alerts.filter((a) => a.status === 'open').length} تنبيهات مفتوحة
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            مراقبة الحدود الدنيا للأصناف الحرجة، وتتبع صلاحية الزيوت والشحوم والجوانات الحساسة لتفادي تلفها
          </p>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs border border-purple-200 transition-colors"
        >
          <Settings className="h-4 w-4 text-purple-700" />
          <span>إعدادات نافذة فحص الصلاحية ({expiryWindowDays} يوماً)</span>
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-purple-50/70 p-5 rounded-3xl border border-purple-200 animate-in fade-in space-y-3">
          <h3 className="text-sm font-black text-purple-950 flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-700" />
            <span>تخصيص نافذة التنبيه المسبق قبل انتهاء الصلاحية</span>
          </h3>
          <p className="text-xs text-slate-600">
            حدد عدد الأيام المسبقة التي يقوم فيها النظام بإطلاق تنبيه قبل وصول دفعة الصنف لتاريخ انتهائها (الافتراضي 30 يوماً).
          </p>
          <div className="flex items-center gap-3 max-w-xs">
            <input
              type="number"
              min="1"
              max="365"
              value={tempDays}
              onChange={(e) => setTempDays(Number(e.target.value))}
              className="p-2 rounded-xl border border-purple-200 bg-white text-xs font-bold w-28 text-center"
            />
            <span className="text-xs font-bold text-purple-950">يوم</span>
            <button
              onClick={() => {
                setExpiryWindowDays(tempDays);
                setShowSettings(false);
              }}
              className="px-4 py-2 rounded-xl bg-purple-700 text-white font-bold text-xs"
            >
              حفظ
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-purple-100 shadow-sm flex items-center gap-2">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ALL' ? 'bg-purple-700 text-white shadow-sm' : 'text-slate-600 hover:text-purple-900 hover:bg-purple-50'
          }`}
        >
          كافة التنبيهات ({alerts.length})
        </button>

        <button
          onClick={() => setActiveTab('LOW_STOCK')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'LOW_STOCK' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>نواقص وحدود دنيا ({lowStockAlerts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('EXPIRY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'EXPIRY' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-purple-900 hover:bg-purple-50'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>تواريخ الصلاحية والدفعات ({expiryAlerts.length})</span>
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-purple-100 text-center text-slate-500 space-y-2">
            <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto" />
            <p className="font-bold text-slate-700">لا توجد تنبيهات حالية</p>
            <p className="text-xs text-slate-400">كافة الأرصدة أعلى من الحدود الدنيا وصلاحيات الدفعات سارية</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isLowStock = alert.type === 'low_stock';
            const isCritical = alert.severity === 'critical';
            const isAcknowledged = alert.status === 'acknowledged';

            return (
              <div
                key={alert.id}
                className={`bg-white p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isAcknowledged
                    ? 'border-slate-200 opacity-60 bg-slate-50'
                    : isCritical
                    ? 'border-rose-200 bg-rose-50/20 shadow-xs'
                    : 'border-amber-200 bg-amber-50/20 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-3 rounded-2xl shrink-0 mt-0.5 ${
                      isCritical ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {isLowStock ? <AlertTriangle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-purple-50 text-purple-900 px-2 py-0.5 rounded border border-purple-200">
                        {alert.itemCode}
                      </span>
                      <h3 className="font-black text-sm text-slate-900">{alert.itemName}</h3>
                      {isCritical && (
                        <span className="text-[10px] font-black bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200">
                          حرج جداً
                        </span>
                      )}
                      {isAcknowledged && (
                        <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                          تم التأكيد
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 font-medium">{alert.message}</p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono pt-1">
                      <span>تاريخ التنبيه: {alert.createdAt}</span>
                      {alert.batchNumber && <span>رقم الدفعة: {alert.batchNumber}</span>}
                      {alert.expiryDate && <span>تاريخ الانتهاء: {alert.expiryDate}</span>}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {!isAcknowledged && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                    >
                      تأكيد الاستلام
                    </button>
                  )}

                  {isLowStock ? (
                    <button
                      onClick={() => {
                        setMovementModalDefaultType('receipt');
                        setMovementModalDefaultItemId(alert.itemId);
                        setIsMovementModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow transition-all active:scale-95"
                    >
                      <PackagePlus className="h-4 w-4" />
                      <span>تسجيل توريد</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setMovementModalDefaultType('adjustment');
                        setMovementModalDefaultItemId(alert.itemId);
                        setIsMovementModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow transition-all active:scale-95"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      <span>تسوية واستبعاد الدفعة</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
