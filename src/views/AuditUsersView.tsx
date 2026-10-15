/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Users,
  History,
  Lock,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  UserPlus,
  Edit,
  X,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { RoleType, User } from '../types';

export const AuditUsersView: React.FC = () => {
  const {
    users,
    auditLogs,
    currentUser,
    requestUserSwitch,
    addUser,
    updateUserRole,
    updateUser,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'AUDIT' | 'USERS' | 'ROLES'>('USERS');

  // Add User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState<RoleType>('WAREHOUSE_MANAGER');
  const [newDepartment, setNewDepartment] = useState('إدارة المستودعات');
  const [newPassword, setNewPassword] = useState('123456');
  const [addUserError, setAddUserError] = useState('');

  // Edit Role Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<RoleType>('WAREHOUSE_MANAGER');
  const [editDepartment, setEditDepartment] = useState('');
  const [editError, setEditError] = useState('');

  const rolePermissionsMap: Record<RoleType, string[]> = {
    ADMIN: [
      'الوصول الكامل لكافة شاشات ووظائف النظام',
      'إدارة المستخدمين والأدوار وتعيين الصلاحيات',
      'تهيئة وتعديل المستودعات والرفوف والمواقع',
      'اعتماد وصرف كافة طلبات الصيانة',
      'إجراء تسويات الجرد المخزني والاستيراد والتصدير',
    ],
    WAREHOUSE_MANAGER: [
      'إدارة دليل قطع الغيار والمستهلكات والأسعار',
      'تسجيل كافة حركات المخزون (توريد، إرجاع، نقل، صرف، تسوية)',
      'تنفيذ وصرف طلبات الصيانة المعتمدة وخصم الأرصدة',
      'إدارة المستودعات والرفوف والخانات التخزينية',
      'طباعة ملصقات الباركود وتصدير تقارير الجرد',
    ],
    MAINTENANCE_ENGINEER: [
      'إنشاء ورفع طلبات قطع الصيانة (دورية أو عطل طارئ)',
      'استعراض دليل الأصناف والأرصدة المتاحة ومواقع التخزين',
      'متابعة حالة وسجل طلبات الصيانة الخاصة به',
      'لا يمكنه اعتماد أو صرف الطلبات (فصل المهام)',
    ],
    MAINTENANCE_MANAGER: [
      'مراجعة واعتماد أو رفض طلبات الصيانة مع تدوين السبب',
      'استعراض مخزون قطع الغيار ومراقبة النواقص الحرجة',
      'متابعة تقارير استهلاك قطع الغيار وسجل الأعطال',
      'لا يمكنه اعتماد طلباته الخاصة (فصل الصلاحيات)',
    ],
    PROCUREMENT_OFFICER: [
      'متابعة تنبيهات الحدود الدنيا والنواقص الحرجة',
      'استعلام ومقارنة أسعار الموردين واختيار أقل سعر شراء',
      'تصدير كشوف طلبات الشراء إلى إكسل',
      'تسجيل وتحديث عروض أسعار الموردين',
    ],
    PLANT_MANAGER: [
      'الاطلاع الشامل على لوحة المؤشرات وقيمة المخزون',
      'تصدير التقارير المالية وسجلات الحركات إلى إكسل',
      'مراقبة مخاطر توقف الإنتاج والأصناف الحرجة',
      'صلاحية استعراض ومراقبة (Viewer)',
    ],
  };

  const roleOptions: { key: RoleType; title: string; defaultDept: string }[] = [
    { key: 'ADMIN', title: 'مسؤول النظام (Full Access)', defaultDept: 'تقنية المعلومات وإدارة النظام' },
    { key: 'WAREHOUSE_MANAGER', title: 'مدير المستودع (Warehouse Manager)', defaultDept: 'إدارة المستودعات' },
    { key: 'MAINTENANCE_ENGINEER', title: 'مهندس صيانة (Maintenance Engineer)', defaultDept: 'قسم الصيانة والتشغيل' },
    { key: 'MAINTENANCE_MANAGER', title: 'مدير الصيانة (Maintenance Manager)', defaultDept: 'إدارة الصيانة' },
    { key: 'PROCUREMENT_OFFICER', title: 'مسؤولة المشتريات (Procurement Officer)', defaultDept: 'إدارة المشتريات وسلاسل الإمداد' },
    { key: 'PLANT_MANAGER', title: 'مدير المصنع / المراقب المالي (Plant Manager)', defaultDept: 'الإدارة العليا والمالية' },
  ];

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError('');

    const res = addUser({
      fullName: newFullName,
      username: newUsername,
      role: newRole,
      department: newDepartment,
      password: newPassword || '123456',
    });

    if (res.success) {
      setIsAddUserOpen(false);
      setNewFullName('');
      setNewUsername('');
      setNewPassword('123456');
    } else {
      setAddUserError(res.error || 'حدث خطأ أثناء إضافة الموظف.');
    }
  };

  const handleEditRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError('');

    const res = updateUser(editingUser.id, {
      role: selectedRoleForEdit,
      department: editDepartment || editingUser.department,
    });

    if (res.success) {
      setEditingUser(null);
    } else {
      setEditError(res.error || 'حدث خطأ أثناء تعديل الصلاحية.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-purple-950">
              إدارة المستخدمين والصلاحيات وسجل التدقيق (Users & RBAC)
            </h1>
            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {users.length} موظفين مسجلين
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إضافة موظفين جدد، تخصيص وتعديل الصلاحيات والأدوار، وحماية التبديل بكلمة مرور مع سجل تدقيق غير قابل للتعديل
          </p>
        </div>

        <button
          onClick={() => {
            setAddUserError('');
            setIsAddUserOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-sm shadow-md transition-all active:scale-95"
        >
          <UserPlus className="h-4 w-4" />
          <span>إضافة موظف جديد وتعيين صلاحياته</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-purple-100 shadow-sm flex items-center gap-2">
        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'USERS'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-purple-900 hover:bg-purple-50'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>قائمة الموظفين والصلاحيات ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'AUDIT'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-purple-900 hover:bg-purple-50'
          }`}
        >
          <History className="h-4 w-4" />
          <span>سجل التدقيق الرقمي (Audit Log)</span>
        </button>

        <button
          onClick={() => setActiveTab('ROLES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'ROLES'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-purple-900 hover:bg-purple-50'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>مصفوفة الصلاحيات (RBAC Matrix)</span>
        </button>
      </div>

      {/* Tab: Users List */}
      {activeTab === 'USERS' && (
        <div className="space-y-4">
          <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 flex items-center justify-between text-xs text-purple-950 font-medium">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-purple-700 shrink-0" />
              <span>
                لضمان الأمان والامتثال لمتطلبات التدقيق: لا يمكن التبديل لأي مستخدم إلا بإدخال كلمة المرور (<strong>123456</strong>).
              </span>
            </div>
            <span className="text-[11px] text-purple-700 font-bold hidden sm:block">
              كلمة المرور الموحدة: 123456
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {users.map((u) => {
              const isCurrent = u.id === currentUser.id;
              return (
                <div
                  key={u.id}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                    isCurrent
                      ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-500/20 shadow-md'
                      : 'bg-white border-purple-100 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* User Card Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-2xl ${u.avatarColor} text-white font-bold flex items-center justify-center text-base shadow ring-2 ring-purple-200/50`}>
                          {u.fullName.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-black text-slate-900 text-base">{u.fullName}</h3>
                            {isCurrent && (
                              <span className="text-[10px] bg-purple-700 text-white font-bold px-2 py-0.2 rounded-full">
                                الحساب الحالي
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-purple-800 font-bold block mt-0.5">
                            {u.roleTitleAr}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono block">
                            @{u.username}
                          </span>
                        </div>
                      </div>

                      {/* Edit Role Button */}
                      <button
                        onClick={() => {
                          setEditingUser(u);
                          setSelectedRoleForEdit(u.role);
                          setEditDepartment(u.department);
                          setEditError('');
                        }}
                        className="p-2 rounded-xl text-purple-700 hover:bg-purple-100 transition-colors"
                        title="تعديل صلاحية الموظف"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Department & Status */}
                    <div className="mt-4 pt-3 border-t border-purple-100 text-xs text-slate-600 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">القسم / الإدارة:</span>
                        <span className="font-semibold text-slate-800">{u.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">حالة الحساب:</span>
                        <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> نشط ومفعل
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">كلمة المرور:</span>
                        <span className="font-mono font-bold text-slate-700">•••••• (123456)</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-purple-100 flex items-center gap-2">
                    <button
                      onClick={() => requestUserSwitch(u)}
                      disabled={isCurrent}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all disabled:opacity-50 bg-purple-700 hover:bg-purple-800 text-white shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      {isCurrent ? (
                        <>
                          <UserCheck className="h-4 w-4" />
                          <span>أنت تتصفح بهذا الحساب</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5" />
                          <span>تسجيل الدخول والتبديل</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setEditingUser(u);
                        setSelectedRoleForEdit(u.role);
                        setEditDepartment(u.department);
                        setEditError('');
                      }}
                      className="py-2 px-3 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold transition-colors"
                    >
                      تعديل الصلاحية
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Audit Log */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-purple-50/70 text-purple-950 font-bold border-b border-purple-200">
                <tr>
                  <th className="py-3.5 px-4">رقم السجل</th>
                  <th className="py-3.5 px-4">الإجراء</th>
                  <th className="py-3.5 px-4">العنصر المتأثر</th>
                  <th className="py-3.5 px-4">التفاصيل والتغييرات</th>
                  <th className="py-3.5 px-4">المسؤول عن الإجراء</th>
                  <th className="py-3.5 px-4">التاريخ والوقت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-900">{log.id}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          log.action === 'CREATE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.action === 'APPROVE'
                            ? 'bg-indigo-100 text-indigo-800'
                            : log.action === 'FULFILL'
                            ? 'bg-teal-100 text-teal-800'
                            : log.action === 'REJECT'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{log.entity}</td>
                    <td className="py-3.5 px-4 text-slate-700">{log.details}</td>
                    <td className="py-3.5 px-4 text-purple-900 font-semibold">{log.actorName}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {log.createdAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Roles & Permissions Matrix */}
      {activeTab === 'ROLES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Object.entries(rolePermissionsMap).map(([roleKey, perms]) => (
            <div key={roleKey} className="bg-white p-5 rounded-3xl border border-purple-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                <div>
                  <h3 className="font-black text-purple-950 text-sm">{roleKey}</h3>
                  <span className="text-xs text-purple-700 font-semibold">
                    {roleOptions.find((r) => r.key === roleKey)?.title || roleKey}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
                  <KeyRound className="h-4 w-4" />
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700">
                {perms.map((perm, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{perm}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add New Employee */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-800">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-purple-950">إضافة موظف جديد للمنظومة</h3>
                  <p className="text-xs text-slate-500">إنشاء حساب جديد وتعيين الصلاحيات والقسم</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {addUserError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{addUserError}</span>
              </div>
            )}

            <form onSubmit={handleAddUserSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">اسم الموظف الكامل *</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="مثال: م. إبراهيم كمال"
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">اسم المستخدم (Username) *</label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                    placeholder="ibrahim_kamal"
                    className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">كلمة المرور *</label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="123456"
                    className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">الافتراضي: 123456</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الدور والصلاحيات الممنوحة *</label>
                <select
                  value={newRole}
                  onChange={(e) => {
                    const r = e.target.value as RoleType;
                    setNewRole(r);
                    const opt = roleOptions.find((o) => o.key === r);
                    if (opt) setNewDepartment(opt.defaultDept);
                  }}
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-bold text-purple-950"
                >
                  {roleOptions.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">القسم / الإدارة</label>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="مثال: قسم الصيانة والتشغيل"
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-medium"
                />
              </div>

              <div className="pt-3 border-t border-purple-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  حفظ وإضافة الموظف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Existing User Role & Department */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-800">
                  <Edit className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-purple-950">
                    تعديل صلاحيات الموظف: {editingUser.fullName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    تغيير الدور الوظيفي ومستوى الوصول الأمني
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {editError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditRoleSubmit} className="space-y-4">
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-xs space-y-1">
                <div>اسم المستخدم: <span className="font-mono font-bold text-purple-950">@{editingUser.username}</span></div>
                <div>الصلاحية الحالية: <span className="font-bold text-purple-700">{editingUser.roleTitleAr}</span></div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  اختر الصلاحية / الدور الجديد *
                </label>
                <select
                  value={selectedRoleForEdit}
                  onChange={(e) => {
                    const r = e.target.value as RoleType;
                    setSelectedRoleForEdit(r);
                    const opt = roleOptions.find((o) => o.key === r);
                    if (opt) setEditDepartment(opt.defaultDept);
                  }}
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-bold text-purple-950"
                >
                  {roleOptions.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">القسم / الإدارة</label>
                <input
                  type="text"
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-medium"
                />
              </div>

              <div className="pt-3 border-t border-purple-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  حفظ وتطبيق الصلاحيات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
