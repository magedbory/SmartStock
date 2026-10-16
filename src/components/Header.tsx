/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Boxes,
  Bell,
  QrCode,
  UserCheck,
  ChevronDown,
  RotateCcw,
  AlertTriangle,
  Clock,
  Sparkles,
  ShieldCheck,
  PackagePlus,
  ArrowRightLeft,
  Lock
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    users,
    alerts,
    setIsScannerOpen,
    setIsMovementModalOpen,
    setMovementModalDefaultType,
    setIsRequestModalOpen,
    setActiveTab,
    resetToDefaultData,
    requestUserSwitch,
    companyProfile
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  const openAlerts = alerts.filter((a) => a.status === 'open');
  const criticalCount = openAlerts.filter((a) => a.severity === 'critical').length;

  return (
    <header className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white shadow-xl sticky top-0 z-40 border-b border-purple-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center shadow-lg shadow-purple-900/50 ring-2 ring-purple-300/30">
              <Boxes className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl tracking-wide bg-gradient-to-l from-purple-200 via-white to-purple-100 bg-clip-text text-transparent">
                  SmartStock
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-400/30 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  نظام تشغيلي معتمد
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-purple-200/95 font-medium mt-0.5">
                <span className="font-bold text-white truncate max-w-[200px] sm:max-w-xs">{companyProfile.companyName}</span>
                <span className="text-purple-400 hidden sm:inline">•</span>
                <span className="text-purple-300 text-[11px] hidden md:inline truncate max-w-[180px]">{companyProfile.factoryName}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-800/60 hover:bg-purple-700/80 text-purple-100 text-sm font-semibold border border-purple-600/50 transition-all shadow-sm hover:shadow"
              title="مسح كود الباركود أو QR"
            >
              <QrCode className="h-4 w-4 text-purple-300" />
              <span>مسح باركود / QR</span>
            </button>

            {/* Role-adaptive quick buttons */}
            {(currentUser.role === 'WAREHOUSE_MANAGER' || currentUser.role === 'ADMIN') && (
              <button
                onClick={() => {
                  setMovementModalDefaultType('receipt');
                  setIsMovementModalOpen(true);
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-md shadow-purple-950/40 transition-all hover:scale-[1.02]"
              >
                <PackagePlus className="h-4 w-4" />
                <span>حركة توريد / صرف</span>
              </button>
            )}

            {(currentUser.role === 'MAINTENANCE_ENGINEER' || currentUser.role === 'MAINTENANCE_MANAGER') && (
              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-semibold shadow-md shadow-purple-950/40 transition-all hover:scale-[1.02]"
              >
                <ArrowRightLeft className="h-4 w-4" />
                <span>طلب قطع صيانة</span>
              </button>
            )}
          </div>

          {/* User Persona & Alerts */}
          <div className="flex items-center gap-3">
            
            {/* Mobile Scan Button */}
            <button
              onClick={() => setIsScannerOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-purple-800/60 text-purple-200 border border-purple-700"
              title="مسح باركود"
            >
              <QrCode className="h-5 w-5" />
            </button>

            {/* Notifications / Alerts Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsAlertsOpen(!isAlertsOpen)}
                className="relative p-2.5 rounded-xl bg-purple-950/70 hover:bg-purple-800/60 border border-purple-800 text-purple-200 hover:text-white transition-colors"
                title="التنبيهات"
              >
                <Bell className="h-5 w-5" />
                {openAlerts.length > 0 && (
                  <span className={`absolute -top-1 -right-1 text-[11px] font-bold px-1.5 py-0.2 rounded-full border border-purple-900 ${
                    criticalCount > 0 ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-400 text-purple-950'
                  }`}>
                    {openAlerts.length}
                  </span>
                )}
              </button>

              {/* Alerts dropdown menu */}
              {isAlertsOpen && (
                <div
                  className="absolute left-0 mt-2 w-80 sm:w-96 bg-white text-slate-800 rounded-2xl shadow-2xl border border-purple-100 py-3 z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={() => setIsAlertsOpen(false)}
                >
                  <div className="px-4 pb-2 border-b border-purple-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-purple-950 text-sm">
                      <AlertTriangle className="h-4 w-4 text-purple-600" />
                      <span>تنبيهات المخزون النشطة ({openAlerts.length})</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('alerts')}
                      className="text-xs text-purple-700 hover:text-purple-900 font-semibold"
                    >
                      عرض الكل
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {openAlerts.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-500">
                        لا توجد تنبيهات حالية، كافة الأرصدة أعلى من الحدود الدنيا وصلاحيات الأصناف سارية.
                      </div>
                    ) : (
                      openAlerts.slice(0, 5).map((alert) => (
                        <div
                          key={alert.id}
                          className="p-3.5 hover:bg-purple-50/60 transition-colors cursor-pointer"
                          onClick={() => setActiveTab('alerts')}
                        >
                          <div className="flex items-start gap-2.5">
                            <span
                              className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                                alert.severity === 'critical'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {alert.type === 'low_stock' ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-slate-900 truncate">{alert.itemName}</p>
                                <span className="text-[10px] text-slate-600 shrink-0 font-mono">{alert.itemCode}</span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1 line-clamp-2">{alert.message}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Persona / User Switcher (PRD Personas) */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-3 rounded-2xl bg-purple-950/80 hover:bg-purple-800/60 border border-purple-700/60 transition-all text-right group"
              >
                <div className={`h-9 w-9 rounded-xl ${currentUser.avatarColor} text-white font-bold flex items-center justify-center text-sm shadow ring-2 ring-purple-300/20`}>
                  {currentUser.fullName.slice(0, 2)}
                </div>
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-bold text-white group-hover:text-purple-200 flex items-center gap-1">
                    <span>{currentUser.fullName}</span>
                    <ShieldCheck className="h-3 w-3 text-purple-300" />
                  </div>
                  <div className="text-[10px] text-purple-300 font-medium">
                    {currentUser.roleTitleAr}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-purple-300 transition-transform group-hover:translate-y-0.5" />
              </button>

              {/* Persona Selector Dropdown */}
              {isUserMenuOpen && (
                <div
                  className="absolute left-0 mt-2 w-80 bg-white text-slate-800 rounded-2xl shadow-2xl border border-purple-100 py-3 z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-4 pb-2 border-b border-purple-50">
                    <p className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                      <span>تبديل شخصية المستخدم (اختبار تدفق الـ PRD)</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <Lock className="h-3 w-3 text-purple-600 shrink-0" />
                      <span>يتطلب إدخال كلمة المرور (123456) للأمان</span>
                    </p>
                  </div>

                  <div className="py-1">
                    {users.map((u) => {
                      const isSelected = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            if (!isSelected) {
                              requestUserSwitch(u);
                            }
                          }}
                          className={`w-full text-right px-4 py-2.5 flex items-center gap-3 transition-colors ${
                            isSelected ? 'bg-purple-50 text-purple-950 font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className={`h-8 w-8 rounded-lg ${u.avatarColor} text-white font-bold flex items-center justify-center text-xs shrink-0`}>
                            {u.fullName.slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold truncate">{u.fullName}</span>
                              {isSelected ? (
                                <UserCheck className="h-4 w-4 text-purple-600 shrink-0" />
                              ) : (
                                <Lock className="h-3.5 w-3.5 text-slate-400 group-hover:text-purple-600 shrink-0" />
                              )}
                            </div>
                            <span className="text-[11px] text-purple-700 block truncate font-medium">
                              {u.roleTitleAr}
                            </span>
                            <span className="text-[10px] text-slate-600 block">{u.department}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-2 pt-2 border-t border-purple-50 px-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        resetToDefaultData();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-purple-700 py-1.5 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>إعادة تعيين البيانات النموذجية الأولية</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
