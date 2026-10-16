/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';

import { DashboardView } from './views/DashboardView';
import { ItemsView } from './views/ItemsView';
import { MovementsView } from './views/MovementsView';
import { MaintenanceWorkflowView } from './views/MaintenanceWorkflowView';
import { LocationsView } from './views/LocationsView';
import { SuppliersPricesView } from './views/SuppliersPricesView';
import { AlertsExpiryView } from './views/AlertsExpiryView';
import { ReportsExportView } from './views/ReportsExportView';
import { ImportExcelView } from './views/ImportExcelView';
import { AuditUsersView } from './views/AuditUsersView';
import { InventoryCountView } from './views/InventoryCountView';

import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { BarcodeLabelModal } from './components/BarcodeLabelModal';
import { MovementModal } from './components/MovementModal';
import { MaintenanceRequestModal } from './components/MaintenanceRequestModal';
import { ItemModal } from './components/ItemModal';
import { AuthSwitchModal } from './components/AuthSwitchModal';

import { CheckCircle2, AlertCircle, Info, Boxes } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, toast } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'items':
        return <ItemsView />;
      case 'movements':
        return <MovementsView />;
      case 'count':
        return <InventoryCountView />;
      case 'requests':
        return <MaintenanceWorkflowView />;
      case 'locations':
        return <LocationsView />;
      case 'suppliers':
        return <SuppliersPricesView />;
      case 'alerts':
        return <AlertsExpiryView />;
      case 'reports':
        return <ReportsExportView />;
      case 'import':
        return <ImportExcelView />;
      case 'audit':
        return <AuditUsersView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold text-white ${
              toast.type === 'error'
                ? 'bg-rose-600'
                : toast.type === 'info'
                ? 'bg-indigo-600'
                : 'bg-gradient-to-r from-purple-800 to-indigo-900'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="h-4 w-4 shrink-0" />
            ) : toast.type === 'info' ? (
              <Info className="h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Navigation Header */}
      <Header />
      <Navigation />

      {/* Page Content Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {renderActiveView()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-purple-100 py-6 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-100 text-purple-800">
              <Boxes className="h-4 w-4" />
            </div>
            <span className="font-bold text-purple-950">SmartStock — نظام إدارة مخزون قطع الغيار والمستهلكات</span>
            <span className="text-slate-400">| مستند المتطلبات PRD v1.0</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600 font-medium">
            <span>واجهة عربية متكاملة RTL</span>
            <span>•</span>
            <span>دقة مخزون مستهدفة 98%</span>
            <span>•</span>
            <span>مراقبة فورية للحدود الدنيا</span>
          </div>
        </div>
      </footer>

      {/* Global Interactive Modals */}
      <BarcodeScannerModal />
      <BarcodeLabelModal />
      <MovementModal />
      <MaintenanceRequestModal />
      <ItemModal />
      <AuthSwitchModal />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
