/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LifeBuoy,
  Database,
  CloudUpload,
  HardDrive,
  Download,
  Upload,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Send,
  Building2,
  RefreshCw,
  PhoneCall,
  Mail,
  MessageSquare,
  Server,
  Calendar,
  Lock,
  Layers,
  FileCode2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Wifi,
  FileCheck2,
  Check
} from 'lucide-react';
import { SupportCategory, SupportTicket } from '../types';

export const SupportBackupView: React.FC = () => {
  const {
    companyProfile,
    updateCompanyProfile,
    backupConfig,
    updateBackupConfig,
    backupLogs,
    triggerInstantBackup,
    generateDatabaseBackup,
    restoreDatabaseBackup,
    supportTickets,
    createSupportTicket,
    updateSupportTicketStatus,
    currentUser,
    items,
    movements,
    adjustments,
    purchaseRequisitions
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'BACKUP' | 'SUPPORT' | 'COMPANY'>('BACKUP');

  // Company Profile Form State
  const [companyName, setCompanyName] = useState(companyProfile.companyName);
  const [factoryName, setFactoryName] = useState(companyProfile.factoryName);
  const [code, setCode] = useState(companyProfile.code);
  const [commercialRegister, setCommercialRegister] = useState(companyProfile.commercialRegister);
  const [taxNumber, setTaxNumber] = useState(companyProfile.taxNumber);
  const [address, setAddress] = useState(companyProfile.address);
  const [phone, setPhone] = useState(companyProfile.phone);
  const [email, setEmail] = useState(companyProfile.email);
  const [managerName, setManagerName] = useState(companyProfile.managerName);

  // New Support Ticket Modal State
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<SupportCategory>('technical_issue');
  const [ticketPriority, setTicketPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('high');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketPhone, setTicketPhone] = useState(companyProfile.phone || '+20 100 234 5678');
  const [ticketEmail, setTicketEmail] = useState(companyProfile.email || 'support@elnasr-ind.com');

  // Cloud test simulation state
  const [isTestingCloud, setIsTestingCloud] = useState(false);
  const [cloudTestResult, setCloudTestResult] = useState<string | null>(null);

  // Handle Save Company Profile
  const handleSaveCompanyProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyProfile({
      companyName,
      factoryName,
      code,
      commercialRegister,
      taxNumber,
      address,
      phone,
      email,
      managerName,
    });
  };

  // Handle Download JSON Database Snapshot
  const handleDownloadBackup = () => {
    const { jsonString, filename } = generateDatabaseBackup();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerInstantBackup('تنزيل محلي فوري (Instant JSON Download)');
  };

  // Handle Download SQL Dump
  const handleDownloadSqlDump = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const sqlContent = `-- ===================================================
-- SmartStock Industrial Database Dump
-- Beneficiary: ${companyProfile.companyName} (${companyProfile.factoryName})
-- Generated At: ${new Date().toISOString()}
-- ===================================================

CREATE TABLE IF NOT EXISTS items (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    total_stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 0,
    unit_cost DECIMAL(12, 2) NOT NULL DEFAULT 0.00
);

-- Insert current items
${items
  .map(
    (itm) =>
      `INSERT INTO items (id, code, name, total_stock, min_stock, unit_cost) VALUES ('${itm.id}', '${itm.code}', '${itm.name.replace(/'/g, "''")}', ${itm.totalQuantity ?? 0}, ${itm.minStock}, ${itm.avgCost || 0}) ON CONFLICT (code) DO NOTHING;`
  )
  .join('\n')}

-- Database dump completed successfully.
`;

    const blob = new Blob([sqlContent], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smartstock_${companyProfile.code || 'database'}_dump_${timestamp}.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerInstantBackup('تصدير تفريغ SQL (PostgreSQL Dump)');
  };

  // Handle Restore Database from File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        if (window.confirm('تحذير: هل أنت متأكد من استعادة قاعدة البيانات بالكامل؟ سيتم تحديث الجداول بالسجلات الموجودة في الملف.')) {
          restoreDatabaseBackup(content);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Test Cloud Connection
  const handleTestCloudConnection = () => {
    setIsTestingCloud(true);
    setCloudTestResult(null);

    setTimeout(() => {
      setIsTestingCloud(false);
      setCloudTestResult('تم الاتصال بنجاح مع Google Cloud Storage و Google Drive (زمن الاستجابة: 28ms). التشفير AES-256 نشط.');
    }, 1200);
  };

  // Handle New Ticket Submit
  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketDescription) return;

    createSupportTicket({
      subject: ticketSubject,
      category: ticketCategory,
      priority: ticketPriority,
      description: ticketDescription,
      contactPhone: ticketPhone,
      contactEmail: ticketEmail,
    });

    setIsTicketModalOpen(false);
    setTicketSubject('');
    setTicketDescription('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-purple-800/40">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full border border-emerald-400/30 font-bold flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                حماية البيانات واستمرارية الأعمال 99.98%
              </span>
              <span className="bg-purple-800/60 text-purple-200 text-xs px-2.5 py-1 rounded-full border border-purple-700/50">
                تشفير AES-256
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <LifeBuoy className="h-8 w-8 text-purple-300" />
              الدعم الفني والنسخ الاحتياطي المتعدد لقاعدة البيانات
            </h1>
            <p className="text-purple-200 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
              إدارة خطط وجدولة النسخ الاحتياطي السحابي والمحلي، أخذ وتنزيل نسخ فورية من قاعدة البيانات، إرسال تذاكر وبلاغات الدعم الفني، وضبط بيانات المنشأة المستفيدة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsTicketModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-950/40 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Send className="h-4 w-4" />
              <span>طلب دعم فني فوري</span>
            </button>
            <button
              onClick={handleDownloadBackup}
              className="px-4 py-2.5 rounded-xl bg-purple-800/70 hover:bg-purple-700/80 text-purple-100 font-bold text-xs sm:text-sm border border-purple-600/40 flex items-center gap-2 transition-all"
            >
              <Download className="h-4 w-4 text-purple-300" />
              <span>أخذ نسخة فورية JSON</span>
            </button>
          </div>
        </div>

        {/* Status Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-purple-800/50">
          <div className="bg-purple-950/50 rounded-2xl p-3 border border-purple-800/40">
            <div className="text-[11px] text-purple-300 font-medium">حالة الربط السحابي</div>
            <div className="text-sm sm:text-base font-black text-emerald-300 mt-1 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              متصل وجاهز (Active)
            </div>
          </div>

          <div className="bg-purple-950/50 rounded-2xl p-3 border border-purple-800/40">
            <div className="text-[11px] text-purple-300 font-medium">آخر نسخة احتياطية تمت</div>
            <div className="text-sm sm:text-base font-black text-purple-100 mt-1 font-mono">
              {backupConfig.lastBackupAt}
            </div>
          </div>

          <div className="bg-purple-950/50 rounded-2xl p-3 border border-purple-800/40">
            <div className="text-[11px] text-purple-300 font-medium">حجم قاعدة البيانات</div>
            <div className="text-sm sm:text-base font-black text-purple-100 mt-1 font-mono">
              {backupConfig.lastBackupSizeKB} KB
            </div>
          </div>

          <div className="bg-purple-950/50 rounded-2xl p-3 border border-purple-800/40">
            <div className="text-[11px] text-purple-300 font-medium">النسخة القادمة المجدولة</div>
            <div className="text-sm sm:text-base font-black text-amber-300 mt-1 font-mono">
              {backupConfig.nextScheduledAt}
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-purple-200/80 pb-3">
        <button
          onClick={() => setActiveSubTab('BACKUP')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
            activeSubTab === 'BACKUP'
              ? 'bg-purple-900 text-white shadow-md shadow-purple-950/20'
              : 'bg-white text-slate-700 hover:bg-purple-50 border border-slate-200'
          }`}
        >
          <Database className="h-4 w-4 text-purple-300" />
          <span>خطة وجدولة النسخ الاحتياطي في أكثر من مكان</span>
        </button>

        <button
          onClick={() => setActiveSubTab('SUPPORT')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
            activeSubTab === 'SUPPORT'
              ? 'bg-purple-900 text-white shadow-md shadow-purple-950/20'
              : 'bg-white text-slate-700 hover:bg-purple-50 border border-slate-200'
          }`}
        >
          <LifeBuoy className="h-4 w-4 text-purple-300" />
          <span>مركز الدعم الفني وتذاكر المساعدة ({supportTickets.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('COMPANY')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
            activeSubTab === 'COMPANY'
              ? 'bg-purple-900 text-white shadow-md shadow-purple-950/20'
              : 'bg-white text-slate-700 hover:bg-purple-50 border border-slate-200'
          }`}
        >
          <Building2 className="h-4 w-4 text-purple-300" />
          <span>بيانات المصنع والشركة المستفيدة</span>
        </button>
      </div>

      {/* -------------------- TAB 1: BACKUP & MULTI-DESTINATION SCHEDULE -------------------- */}
      {activeSubTab === 'BACKUP' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Quick Snapshot Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Download JSON Card */}
            <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-3">
                  <Database className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">أخذ وتنزيل نسخة JSON شاملة</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  تفريغ فوري لكافة جداول النظام (الأصناف، الحركات، التسويات، طلبات الشراء، والمستخدمين).
                </p>
              </div>
              <button
                onClick={handleDownloadBackup}
                className="mt-4 w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Download className="h-4 w-4" />
                <span>تنزيل نسخة احتياطية الآن</span>
              </button>
            </div>

            {/* Export SQL Dump Card */}
            <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center mb-3">
                  <FileCode2 className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">تصدير تفريغ SQL (PostgreSQL / MySQL)</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  توليد سكريبت أوامر SQL مهيأ لقواعد البيانات العلائقية لاستخدامها في خوادم المصنع.
                </p>
              </div>
              <button
                onClick={handleDownloadSqlDump}
                className="mt-4 w-full py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Download className="h-4 w-4" />
                <span>تصدير سكريبت SQL</span>
              </button>
            </div>

            {/* Restore Database Card */}
            <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                  <Upload className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">استعادة قاعدة البيانات من ملف</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  رفع ملف نسخة سابقة بصيغة JSON مع فحص دقة المخطط وتحديث البيانات فوراً.
                </p>
              </div>
              <label className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer">
                <Upload className="h-4 w-4" />
                <span>اختيار ملف للاستعادة</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

          </div>

          {/* Multi-Destination Scheduled Backup Plan */}
          <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <CloudUpload className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-purple-950">
                    خطة الجدولة والتوزيع في أكثر من مكان (Multi-Destination Redundancy)
                  </h3>
                  <p className="text-xs text-slate-500">
                    تأمين نسخ تلقائية مشفرة ومتزامنة على السحابة، التخزين الداخلي، والخوادم الاحتياطية.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestCloudConnection}
                  disabled={isTestingCloud}
                  className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold border border-purple-200 flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className={`h-3.5 w-3.5 text-purple-700 ${isTestingCloud ? 'animate-spin' : ''}`} />
                  <span>{isTestingCloud ? 'جاري الفحص...' : 'اختبار الاتصال بالسحابة'}</span>
                </button>

                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                  <span className="text-xs font-bold px-2 text-slate-700">الجدولة التلقائية:</span>
                  <button
                    type="button"
                    onClick={() => updateBackupConfig({ autoBackupEnabled: !backupConfig.autoBackupEnabled })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      backupConfig.autoBackupEnabled
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-300 text-slate-600'
                    }`}
                  >
                    {backupConfig.autoBackupEnabled ? 'مفعلة' : 'معطلة'}
                  </button>
                </div>
              </div>
            </div>

            {cloudTestResult && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{cloudTestResult}</span>
              </div>
            )}

            {/* Schedule Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تكرار الجدولة التلقائية</label>
                <select
                  value={backupConfig.frequency}
                  onChange={(e) => updateBackupConfig({ frequency: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 font-bold"
                >
                  <option value="hourly">كل ساعة (للمصانع ذات خطوط الإنتاج المستمرة 24/7)</option>
                  <option value="daily">يومياً عند الساعة 02:00 صباحاً (موصى به)</option>
                  <option value="weekly">أسبوعياً (نهاية كل أسبوع عمل)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">وقت التنفيذ اليومي</label>
                <input
                  type="time"
                  value={backupConfig.timeOfDay}
                  onChange={(e) => updateBackupConfig({ timeOfDay: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">مدة الاحتفاظ بالنسخ (Retention)</label>
                <select
                  value={backupConfig.retentionDays}
                  onChange={(e) => updateBackupConfig({ retentionDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 font-bold"
                >
                  <option value={30}>الاحتفاظ بآخر 30 يوماً</option>
                  <option value={60}>الاحتفاظ بآخر 60 يوماً (المعيار الصناعي)</option>
                  <option value={90}>الاحتفاظ بآخر 90 يوماً</option>
                  <option value={365}>أرشفة سنوية كاملة (365 يوماً)</option>
                </select>
              </div>
            </div>

            {/* Destinations Matrix */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                وجهات التوزيع والحفظ المتعدد المعتمدة:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* 1. Cloud Storage */}
                <div
                  onClick={() =>
                    updateBackupConfig({
                      destinations: {
                        ...backupConfig.destinations,
                        cloudStorage: !backupConfig.destinations.cloudStorage,
                      },
                    })
                  }
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    backupConfig.destinations.cloudStorage
                      ? 'bg-purple-50/70 border-purple-300 shadow-xs'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-purple-200 text-purple-900 flex items-center justify-center">
                      <CloudUpload className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-purple-950">1. سحابة Google Cloud Storage / AWS S3</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{backupConfig.cloudBucketName}</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={backupConfig.destinations.cloudStorage}
                    readOnly
                    className="h-4 w-4 text-purple-600 rounded"
                  />
                </div>

                {/* 2. Google Drive / Workspace */}
                <div
                  onClick={() =>
                    updateBackupConfig({
                      destinations: {
                        ...backupConfig.destinations,
                        googleDrive: !backupConfig.destinations.googleDrive,
                      },
                    })
                  }
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    backupConfig.destinations.googleDrive
                      ? 'bg-purple-50/70 border-purple-300 shadow-xs'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-indigo-200 text-indigo-900 flex items-center justify-center">
                      <ExternalLink className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-purple-950">2. مزامنة سحابية على Google Drive / Workspace</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">مجلد النسخ الاحتياطية المشترك للشركة</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={backupConfig.destinations.googleDrive}
                    readOnly
                    className="h-4 w-4 text-purple-600 rounded"
                  />
                </div>

                {/* 3. Local Factory Server Vault */}
                <div
                  onClick={() =>
                    updateBackupConfig({
                      destinations: {
                        ...backupConfig.destinations,
                        localServerVault: !backupConfig.destinations.localServerVault,
                      },
                    })
                  }
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    backupConfig.destinations.localServerVault
                      ? 'bg-purple-50/70 border-purple-300 shadow-xs'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center">
                      <Server className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-purple-950">3. خادم المصنع المحلي وقرص الشبكة الداخلي (Local Vault)</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">NAS Storage / On-Premise Drive</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={backupConfig.destinations.localServerVault}
                    readOnly
                    className="h-4 w-4 text-purple-600 rounded"
                  />
                </div>

                {/* 4. Remote Disaster Recovery Site */}
                <div
                  onClick={() =>
                    updateBackupConfig({
                      destinations: {
                        ...backupConfig.destinations,
                        remoteMirrorSite: !backupConfig.destinations.remoteMirrorSite,
                      },
                    })
                  }
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    backupConfig.destinations.remoteMirrorSite
                      ? 'bg-purple-50/70 border-purple-300 shadow-xs'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-teal-200 text-teal-900 flex items-center justify-center">
                      <Wifi className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-purple-950">4. موقع احتياطي بعيد جغرافياً (Disaster Recovery Site)</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">موقع التخزين البارد الآمن للحالات الطارئة</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={backupConfig.destinations.remoteMirrorSite}
                    readOnly
                    className="h-4 w-4 text-purple-600 rounded"
                  />
                </div>

              </div>
            </div>

          </div>

          {/* Backup Logs Table */}
          <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
            <div className="p-4 bg-purple-50/50 border-b border-purple-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-purple-950 flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-700" />
                <span>سجل النسخ الاحتياطية السابقة والمزامنة السحابية</span>
              </h3>
              <span className="text-xs text-slate-500">
                إجمالي النسخ: <strong className="text-purple-900">{backupLogs.length}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="p-3 font-bold">التاريخ والتوقيت</th>
                    <th className="p-3 font-bold">نوع النسخ</th>
                    <th className="p-3 font-bold">الوجهات ومكان التخزين</th>
                    <th className="p-3 font-bold">ملخص السجلات المنسوخة</th>
                    <th className="p-3 font-bold text-center">الحجم</th>
                    <th className="p-3 font-bold text-center">الحالة</th>
                    <th className="p-3 font-bold text-center">تنزيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {backupLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-purple-50/20">
                      <td className="p-3 font-mono font-bold text-purple-900">{log.timestamp}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            log.type === 'scheduled_auto'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {log.type === 'scheduled_auto' ? 'جدولة آلية' : 'نسخة يدوية فورية'}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">{log.destinationAr}</td>
                      <td className="p-3 text-slate-600">{log.recordsSummary}</td>
                      <td className="p-3 text-center font-mono font-bold text-slate-700">{log.sizeKB} KB</td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                          <Check className="h-3 w-3" />
                          ناجحة
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={handleDownloadBackup}
                          className="p-1.5 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
                          title="تنزيل ملف النسخة"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* -------------------- TAB 2: TECHNICAL SUPPORT & HELPDESK -------------------- */}
      {activeSubTab === 'SUPPORT' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Support Channels Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <PhoneCall className="h-6 w-6" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-bold">الخط الساخن المباشر للدعم الصناعي</div>
                <div className="text-base font-black text-slate-900 font-mono mt-0.5">+20 100 234 5678</div>
                <div className="text-[10px] text-emerald-600 font-medium">متاح 24/7 للحالات الطارئة وتوقف الإنتاج</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-bold">البريد الإلكتروني للدعم الفني</div>
                <div className="text-xs font-black text-slate-900 font-mono mt-0.5">support@smartstock.tech</div>
                <div className="text-[10px] text-purple-600 font-medium">استجابة خلال 30 دقيقة كحد أقصى</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-500 font-bold">طلب مساعدة أو بلاغ عطل</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">فتح تذكرة دعم فني جديدة</div>
                <div className="text-[10px] text-slate-500 font-medium">متابعة فورية مع المهندس المختص</div>
              </div>
              <button
                onClick={() => setIsTicketModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
                <span>فتح تذكرة</span>
              </button>
            </div>

          </div>

          {/* Tickets Tracker Table */}
          <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
            <div className="p-4 bg-purple-50/50 border-b border-purple-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LifeBuoy className="h-5 w-5 text-purple-700" />
                <h3 className="text-sm font-bold text-purple-950">سجل تذاكر وبلاغات الدعم الفني للمصنع</h3>
              </div>
              <button
                onClick={() => setIsTicketModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1"
              >
                <Send className="h-3.5 w-3.5" />
                <span>إرسال طلب جديد</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="p-3 font-bold">رقم التذكرة</th>
                    <th className="p-3 font-bold">موضوع البلاغ والتصنيف</th>
                    <th className="p-3 font-bold">الوصف والتفاصيل</th>
                    <th className="p-3 font-bold text-center">الأهمية</th>
                    <th className="p-3 font-bold text-center">الحالة</th>
                    <th className="p-3 font-bold">المهندس المسؤول والملاحظات</th>
                    <th className="p-3 font-bold">التاريخ ومقدم البلاغ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {supportTickets.map((tkt) => (
                    <tr key={tkt.id} className="hover:bg-purple-50/20">
                      <td className="p-3 font-mono font-bold text-purple-900">{tkt.ticketNumber}</td>
                      <td className="p-3 font-medium">
                        <div className="font-bold text-slate-900">{tkt.subject}</div>
                        <div className="text-[10px] text-purple-700 mt-0.5">
                          {tkt.category === 'scanner_hardware'
                            ? 'أجهزة وماسحات الباركود'
                            : tkt.category === 'backup_cloud'
                            ? 'النسخ السحابي وقواعد البيانات'
                            : tkt.category === 'technical_issue'
                            ? 'عطل فني في النظام'
                            : tkt.category === 'inventory_inquiry'
                            ? 'استفسار عن مطابقة المخزون'
                            : 'طلب ميزة جديدة'}
                        </div>
                      </td>

                      <td className="p-3 text-slate-600 max-w-xs">{tkt.description}</td>

                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            tkt.priority === 'critical'
                              ? 'bg-rose-100 text-rose-800'
                              : tkt.priority === 'high'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {tkt.priority === 'critical' ? 'حرج' : tkt.priority === 'high' ? 'مرتفع' : 'متوسط'}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            tkt.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : tkt.status === 'in_progress'
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {tkt.status === 'resolved'
                            ? 'تم الحل بنجاح'
                            : tkt.status === 'in_progress'
                            ? 'قيد المعالجة'
                            : 'تذكرة مفتوحة'}
                        </span>
                      </td>

                      <td className="p-3 text-slate-700">
                        <div className="font-bold text-xs">{tkt.assignedEngineer}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{tkt.responseNotes}</div>
                      </td>

                      <td className="p-3 text-slate-600">
                        <div>{tkt.createdAt}</div>
                        <div className="text-[10px] text-purple-700 font-medium">{tkt.createdByUserName}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* -------------------- TAB 3: BENEFICIARY COMPANY & FACTORY PROFILE -------------------- */}
      {activeSubTab === 'COMPANY' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-purple-100 shadow-sm space-y-6 animate-in fade-in">
          
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-purple-950">
                بيانات المنشأة والمصنع المستفيد من نظام SmartStock
              </h2>
              <p className="text-xs text-slate-500">
                تظهر هذه البيانات رسمياً في أعلى البرنامج، في عنوان المتصفح Title، وفي كافة محاضر الجرد، طلبات الشراء، وأوامر الصرف والتوريد.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveCompanyProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الشركة المستفيدة من البرنامج *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 font-bold"
                  placeholder="مثال: شركة النصر للصناعات الهندسية والتصنيع الذكي"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المصنع أو مجمع الإنتاج *</label>
                <input
                  type="text"
                  required
                  value={factoryName}
                  onChange={(e) => setFactoryName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 font-bold"
                  placeholder="مثال: مجمع مصانع العاشر من رمضان — خطوط الإنتاج والتشغيل الآلي"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">كود المصنع / الفرع</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 font-mono"
                  placeholder="FAC-EGY-10TH"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المدير التنفيذي / مدير المصنع</label>
                <input
                  type="text"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  placeholder="م. حسام الدين نبيل (المدير التنفيذي ومدير المصنع)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم السجل التجاري</label>
                <input
                  type="text"
                  value={commercialRegister}
                  onChange={(e) => setCommercialRegister(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  placeholder="س.ت: 489201"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم البطاقة الضريبية</label>
                <input
                  type="text"
                  value={taxNumber}
                  onChange={(e) => setTaxNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  placeholder="ب.ض: 382-910-442"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف والتواصل الميداني</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 font-mono"
                  placeholder="+20 100 234 5678"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني الرسمي لإدارة المخزون</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  placeholder="stock.management@elnasr-ind.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان المنشأة / المصنع بالتفصيل</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  placeholder="المنطقة الصناعية الثالثة B4، الكيلو 54، العاشر من رمضان، مصر"
                />
              </div>

            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                عند حفظ التعديلات يتم تحديث اسم الشركة والمصنع فوراً في كافة شاشات ومطبوعات النظام.
              </span>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                <span>حفظ وتحديث بيانات المنشأة فوراً</span>
              </button>
            </div>
          </form>

        </div>
      )}

      {/* -------------------- MODAL: CREATE SUPPORT TICKET -------------------- */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-200 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-purple-950 mb-4 flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-purple-700" />
              طلب دعم فني أو بلاغ مساعدة فورية
            </h3>

            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">موضوع التذكرة / البلاغ *</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="مثال: استفسار حول مزامنة النسخ السحابية التلقائية"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تصنيف البلاغ *</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 font-medium"
                  >
                    <option value="technical_issue">عطل فني في النظام</option>
                    <option value="backup_cloud">النسخ الاحتياطي والسحابة</option>
                    <option value="scanner_hardware">قارئ الباركود والماسحات</option>
                    <option value="inventory_inquiry">استفسار عن مطابقة المخزون</option>
                    <option value="permission_access">الصلاحيات والحسابات</option>
                    <option value="feature_request">طلب ميزة جديدة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">درجة الأهمية والاستعجال *</label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 font-bold"
                  >
                    <option value="critical">🔴 حرج جداً (توقف خط الإنتاج)</option>
                    <option value="high">🟠 مرتفع</option>
                    <option value="medium">🔵 متوسط</option>
                    <option value="low">⚪ منخفض / استفسار عادي</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">شرح المشكلة والتفاصيل *</label>
                <textarea
                  rows={3}
                  required
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  placeholder="اشرح المشكلة بالتفصيل، الخطوات التي أدت لظهورها، ورسائل الخطأ إن وجدت..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف للتواصل</label>
                  <input
                    type="text"
                    value={ticketPhone}
                    onChange={(e) => setTicketPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني للرد</label>
                  <input
                    type="email"
                    value={ticketEmail}
                    onChange={(e) => setTicketEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>إرسال التذكرة لفريق الدعم</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
