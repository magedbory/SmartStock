/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Lock,
  UserCheck,
  KeyRound,
  ShieldAlert,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';

export const AuthSwitchModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authTargetUser,
    verifyAndSwitchUser,
  } = useApp();

  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthModalOpen && authTargetUser) {
      setPassword('123456');
      setError('');
      setShowPassword(false);
    }
  }, [isAuthModalOpen, authTargetUser]);

  if (!isAuthModalOpen || !authTargetUser) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = verifyAndSwitchUser(password);
    if (!res.success) {
      setError(res.error || 'فشل التحقق من كلمة المرور.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-purple-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-800">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-purple-950">
                التحقق من الهوية لتسجيل الدخول
              </h3>
              <p className="text-xs text-slate-500">
                قيد أمان: يلزم إدخال كلمة المرور للانتقال بين حسابات الموظفين
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Target User Info Badge */}
        <div className="p-3.5 bg-gradient-to-r from-purple-50 to-indigo-50/50 rounded-2xl border border-purple-200 flex items-center gap-3">
          <div className={`h-11 w-11 rounded-xl ${authTargetUser.avatarColor} text-white font-bold flex items-center justify-center text-sm shadow`}>
            {authTargetUser.fullName.slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-black text-sm text-purple-950 truncate">
              {authTargetUser.fullName}
            </h4>
            <span className="text-xs text-purple-700 font-bold block truncate">
              {authTargetUser.roleTitleAr}
            </span>
            <span className="text-[10px] text-slate-500 block truncate font-medium">
              {authTargetUser.department}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {/* Username (Auto-filled) */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              اسم المستخدم (مكتوب تلقائياً)
            </label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={authTargetUser.username}
                className="w-full p-2.5 rounded-xl border border-purple-200 bg-slate-100/80 font-mono text-xs font-bold text-slate-800 focus:outline-none cursor-not-allowed"
              />
              <span className="absolute left-3 top-2.5 text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                تم التعبئة آلياً
              </span>
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">كلمة المرور *</label>
              <button
                type="button"
                onClick={() => setPassword('123456')}
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" />
                <span>إعادة تعبئة 123456</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور..."
                className="w-full pr-3.5 pl-10 py-2.5 rounded-xl border border-purple-200 font-mono text-xs font-bold text-purple-950 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
              <KeyRound className="h-3 w-3 text-purple-600" />
              <span>كلمة المرور الموحدة لجميع المستخدمين هي: <strong className="font-mono text-purple-900">123456</strong></span>
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-purple-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <UserCheck className="h-4 w-4" />
              <span>تأكيد تسجيل الدخول والتبديل</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
