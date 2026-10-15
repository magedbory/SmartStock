/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wrench,
  AlertOctagon,
  Clock,
  CheckCircle2,
  XCircle,
  PackageCheck,
  Plus,
  Search,
  Filter,
  FileText,
  UserCheck,
  ChevronDown,
  History
} from 'lucide-react';
import { MaintenanceRequest, MaintenanceRequestStatus } from '../types';

export const MaintenanceWorkflowView: React.FC = () => {
  const {
    maintenanceRequests,
    currentUser,
    setIsRequestModalOpen,
    approveMaintenanceRequest,
    rejectMaintenanceRequest,
    fulfillMaintenanceRequest,
    cancelMaintenanceRequest
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const filteredRequests = maintenanceRequests.filter((req) => {
    if (statusFilter === 'ALL') return true;
    return req.status === statusFilter;
  });

  const getStatusBadge = (status: MaintenanceRequestStatus) => {
    switch (status) {
      case 'draft':
        return <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-bold">مسودة</span>;
      case 'submitted':
        return (
          <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>بانتظار الاعتماد</span>
          </span>
        );
      case 'approved':
        return (
          <span className="bg-indigo-100 text-indigo-800 border border-indigo-200 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>معتمد — جاهز للصرف</span>
          </span>
        );
      case 'fulfilled':
        return (
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <PackageCheck className="h-3.5 w-3.5" />
            <span>تم الصرف بالكامل</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <XCircle className="h-3.5 w-3.5" />
            <span>مرفوض</span>
          </span>
        );
      case 'cancelled':
        return <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-xs font-bold">ملغي</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-purple-950">
              دورة طلبات الصيانة وصرف قطع الغيار (Workflow)
            </h1>
            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {filteredRequests.length} طلب
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ربط بلاغات الأعطال والصيانة الدورية بأذونات الصرف المخزني مع تدفق الاعتماد والصرف الموثق
          </p>
        </div>

        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-sm shadow-md transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>طلب قطع صيانة جديد</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-purple-100 shadow-sm flex flex-wrap items-center gap-2">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            statusFilter === 'ALL' ? 'bg-purple-700 text-white shadow-sm' : 'text-slate-600 hover:text-purple-900 hover:bg-purple-50'
          }`}
        >
          جميع الطلبات
        </button>
        <button
          onClick={() => setStatusFilter('submitted')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            statusFilter === 'submitted' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
          }`}
        >
          بانتظار الاعتماد (مدير الصيانة)
        </button>
        <button
          onClick={() => setStatusFilter('approved')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            statusFilter === 'approved' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-indigo-700 hover:bg-indigo-50'
          }`}
        >
          معتمدة وجاهزة للصرف (المستودع)
        </button>
        <button
          onClick={() => setStatusFilter('fulfilled')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            statusFilter === 'fulfilled' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          تم صرفها
        </button>
        <button
          onClick={() => setStatusFilter('rejected')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            statusFilter === 'rejected' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
          }`}
        >
          مرفوضة
        </button>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRequests.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-purple-100 text-center text-slate-500">
            لا توجد طلبات صيانة مسجلة في هذا القسم حالياً
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isBreakdown = req.type === 'breakdown';
            return (
              <div
                key={req.id}
                className="bg-white rounded-3xl border border-purple-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top card bar */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-xs bg-purple-50 text-purple-900 px-2 py-0.5 rounded border border-purple-200">
                      {req.requestNumber}
                    </span>
                    {getStatusBadge(req.status)}
                  </div>

                  {/* Type badge */}
                  <div className="mt-2 flex items-center gap-2">
                    {isBreakdown ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full border border-rose-200">
                        <AlertOctagon className="h-3.5 w-3.5" />
                        عطل طارئ (أولوية قصوى)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">
                        <Wrench className="h-3.5 w-3.5" />
                        صيانة وقائية دورية
                      </span>
                    )}
                  </div>

                  {/* Equipment */}
                  <div className="mt-3">
                    <span className="text-[11px] text-slate-600 font-semibold block">المعدة / خط الإنتاج:</span>
                    <h3 className="font-black text-slate-900 text-sm">{req.equipmentReference}</h3>
                  </div>

                  {/* Notes if any */}
                  {req.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl mt-2 line-clamp-2">
                      {req.notes}
                    </p>
                  )}

                  {/* Rejection reason if any */}
                  {req.rejectionReason && (
                    <p className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl mt-2 border border-rose-100 font-medium">
                      سبب الرفض: {req.rejectionReason}
                    </p>
                  )}

                  {/* Required items preview */}
                  <div className="mt-3 pt-3 border-t border-purple-50 space-y-1.5">
                    <span className="text-[11px] font-bold text-purple-950 block">قطع الغيار المطلوبة:</span>
                    {req.items.map((line) => (
                      <div
                        key={line.itemId}
                        className="flex items-center justify-between text-xs bg-purple-50/40 p-2 rounded-lg"
                      >
                        <span className="font-semibold text-slate-800 truncate max-w-[180px]">{line.itemName}</span>
                        <span className="font-mono font-bold text-purple-900">
                          {line.requestedQty} {line.unitName}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Requester & Date */}
                  <div className="mt-3 text-[11px] text-slate-500 space-y-0.5">
                    <div>طُلب بواسطة: <span className="font-semibold text-slate-700">{req.requestedByUserName}</span></div>
                    <div>التاريخ: <span className="font-mono">{req.requestedAt}</span></div>
                    {req.approvedByUserName && (
                      <div className="text-indigo-800">اعتماد: <span className="font-semibold">{req.approvedByUserName}</span></div>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-purple-100 flex flex-wrap items-center gap-2">
                  
                  {/* View Details / History */}
                  <button
                    onClick={() => setSelectedRequest(req)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <History className="h-3.5 w-3.5" />
                    <span>التفاصيل والسجل</span>
                  </button>

                  {/* Approve / Reject buttons for Maintenance Manager (or Admin) */}
                  {req.status === 'submitted' && (
                    <>
                      <button
                        onClick={() => approveMaintenanceRequest(req.id)}
                        className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow transition-all active:scale-95"
                      >
                        اعتماد الطلب
                      </button>
                      <button
                        onClick={() => {
                          setRejectingRequestId(req.id);
                          setRejectionReason('');
                        }}
                        className="py-1.5 px-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs transition-colors"
                      >
                        رفض
                      </button>
                    </>
                  )}

                  {/* Fulfill button for Warehouse Manager (or Admin) */}
                  {req.status === 'approved' && (
                    <button
                      onClick={() => fulfillMaintenanceRequest(req.id)}
                      className="py-1.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-all flex items-center gap-1 active:scale-95"
                    >
                      <PackageCheck className="h-3.5 w-3.5" />
                      <span>صرف من المستودع</span>
                    </button>
                  )}

                  {/* Cancel button if draft or submitted */}
                  {(req.status === 'submitted' || req.status === 'draft') && (
                    <button
                      onClick={() => {
                        if (confirm(`إلغاء الطلب ${req.requestNumber}؟`)) {
                          cancelMaintenanceRequest(req.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                      title="إلغاء الطلب"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject Modal */}
      {rejectingRequestId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-4">
            <h3 className="text-base font-black text-rose-950">رفض طلب الصيانة</h3>
            <p className="text-xs text-slate-600">
              يرجى إدخال سبب الرفض التوضيحي لإشعار مهندس الصيانة (5 أحرف على الأقل):
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="مثال: يرجى فحص إمكانية إعادة ضبط السير القديم أو التنسيق مع خطة توقف الوردية..."
              className="w-full p-3 rounded-xl border border-rose-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingRequestId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
              >
                تراجع
              </button>
              <button
                onClick={() => {
                  const res = rejectMaintenanceRequest(rejectingRequestId, rejectionReason);
                  if (res.success) setRejectingRequestId(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow"
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail / Timeline History Modal */}
      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-purple-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-purple-100 pb-3">
              <div>
                <span className="font-mono font-bold text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  {selectedRequest.requestNumber}
                </span>
                <h3 className="text-base font-black text-purple-950 mt-1">
                  {selectedRequest.equipmentReference}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Status History Timeline */}
            <div>
              <h4 className="text-xs font-bold text-purple-950 mb-3 flex items-center gap-1.5">
                <History className="h-4 w-4 text-purple-700" />
                <span>سجل تتبع ومراحل الطلب (Audit Trail):</span>
              </h4>
              <div className="space-y-3 relative before:absolute before:top-2 before:bottom-2 before:right-2.5 before:w-0.5 before:bg-purple-100">
                {selectedRequest.statusHistory.map((step, idx) => (
                  <div key={idx} className="relative pr-7 text-xs">
                    <div className="absolute right-1 top-1 w-3.5 h-3.5 rounded-full bg-purple-600 ring-4 ring-purple-100" />
                    <div className="font-bold text-slate-800">
                      الحالة: {step.toStatus}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">{step.timestamp} — بواسطة: {step.changedByUserName}</div>
                    {step.notes && (
                      <div className="text-[11px] text-purple-900 bg-purple-50 p-2 rounded-lg mt-1">
                        {step.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-purple-100 flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-5 py-2 rounded-xl bg-purple-700 text-white font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
