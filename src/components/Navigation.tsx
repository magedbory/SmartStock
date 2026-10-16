/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Boxes,
  ArrowRightLeft,
  Wrench,
  MapPin,
  Truck,
  BellRing,
  FileSpreadsheet,
  Upload,
  ShieldCheck,
  ClipboardCheck,
  ShoppingCart,
  LifeBuoy,
  Building2
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    alerts,
    maintenanceRequests,
    adjustments,
    currentUser,
    companyProfile,
    purchaseRequisitions
  } = useApp();

  const openAlertsCount = alerts.filter((a) => a.status === 'open').length;
  const pendingRequestsCount = maintenanceRequests.filter((r) => r.status === 'submitted' || r.status === 'approved').length;
  const pendingPurchasesCount = purchaseRequisitions.filter((p) => p.status === 'sent_to_purchasing' || p.status === 'draft').length;

  const tabs = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'items', label: 'دليل قطع الغيار', icon: Boxes },
    { id: 'movements', label: 'حركات المخزون', icon: ArrowRightLeft },
    {
      id: 'count',
      label: 'جرد المخزن والتسويات',
      icon: ClipboardCheck,
      badge: adjustments.length > 0 ? adjustments.length : undefined,
      badgeColor: 'bg-purple-800',
    },
    {
      id: 'procurement',
      label: 'طلبات واقتراحات الشراء',
      icon: ShoppingCart,
      badge: pendingPurchasesCount > 0 ? pendingPurchasesCount : undefined,
      badgeColor: 'bg-emerald-700',
    },
    {
      id: 'requests',
      label: 'طلبات الصيانة والصرف',
      icon: Wrench,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
      badgeColor: 'bg-indigo-600',
    },
    { id: 'locations', label: 'المواقع والتخزين', icon: MapPin },
    { id: 'suppliers', label: 'الموردون وأقل الأسعار', icon: Truck },
    {
      id: 'alerts',
      label: 'التنبيهات والصلاحية',
      icon: BellRing,
      badge: openAlertsCount > 0 ? openAlertsCount : undefined,
      badgeColor: 'bg-rose-600',
    },
    { id: 'reports', label: 'تقارير الإدارات واتخاذ القرارات', icon: FileSpreadsheet },
    { id: 'import', label: 'استيراد الأصناف', icon: Upload },
    { id: 'audit', label: 'التدقيق والصلاحيات', icon: ShieldCheck },
    { id: 'support-backup', label: 'الدعم الفني والنسخ الاحتياطي', icon: LifeBuoy },
  ];

  return (
    <nav className="bg-white border-b border-purple-100 shadow-sm sticky top-20 z-30 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 space-x-reverse min-w-max py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 ${
                  isActive
                    ? 'bg-purple-100/90 text-purple-950 shadow-sm shadow-purple-200/50'
                    : 'text-slate-600 hover:text-purple-900 hover:bg-purple-50/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-purple-700' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] text-white font-bold px-1.5 py-0.2 rounded-full ${tab.badgeColor}`}
                  >
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <div className="absolute bottom-0 right-3 left-3 h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Role Notice & Beneficiary Company Banner */}
      <div className="bg-purple-50/70 border-t border-purple-100/60 py-1.5 px-4 text-xs text-purple-900 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-semibold text-purple-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              أنت تتصفح بصلاحيات:
            </span>
            <span className="bg-white px-2 py-0.5 rounded-md font-bold text-purple-950 border border-purple-200">
              {currentUser.fullName} — {currentUser.roleTitleAr}
            </span>
          </div>

          {/* Beneficiary Company & Factory Name Display */}
          <div className="flex items-center gap-2 text-purple-900 text-xs font-medium">
            <Building2 className="h-4 w-4 text-purple-700 shrink-0" />
            <span className="text-purple-700 font-bold hidden sm:inline">الجهة المستفيدة من النظام:</span>
            <span className="font-bold text-purple-950 bg-white/90 px-2.5 py-0.5 rounded-lg border border-purple-200/80 shadow-xs">
              {companyProfile.companyName} — {companyProfile.factoryName}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};
