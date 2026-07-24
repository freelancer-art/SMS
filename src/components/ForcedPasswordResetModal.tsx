import React, { useState } from 'react';
import { ShieldAlert, KeyRound, Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { UserAuth } from '../types';
import { hashPassword, generateSalt } from '../utils/security';

interface ForcedPasswordResetModalProps {
  userAuth: UserAuth;
  societyName?: string;
  onPasswordUpdated: (updatedAuth: UserAuth) => void;
  theme?: 'light' | 'dark';
}

export default function ForcedPasswordResetModal({
  userAuth,
  societyName = 'Housing Society',
  onPasswordUpdated,
  theme = 'light'
}: ForcedPasswordResetModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDark = theme === 'dark';

  // Password validation rules
  const hasMinLength = newPassword.length >= 8;
  const hasDigit = /\d/.test(newPassword);
  const hasUppercase = /[A-Z]/.test(newPassword);
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isValid = hasMinLength && hasDigit && hasUppercase && isMatch;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isValid) {
      setErrorMsg('Please ensure all password security criteria are met.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newSalt = generateSalt();
      const newHash = hashPassword(newPassword, newSalt);

      const updatedAuth: UserAuth = {
        ...userAuth,
        PasswordHash: newHash,
        Salt: newSalt,
        MustChangePassword: false, // Clear mandatory reset flag
        TempPassword: undefined, // Clear temporary password
        LastLoginAt: new Date().toISOString()
      };

      setTimeout(() => {
        setIsSubmitting(false);
        onPasswordUpdated(updatedAuth);
      }, 600);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg('An error occurred while updating password. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 transition-all ${
        isDark ? 'bg-slate-900 border-amber-500/30 text-slate-100' : 'bg-white border-amber-200 text-slate-900'
      }`}>
        {/* Header Badge */}
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-amber-500/20">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center shadow-inner">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight flex items-center gap-2">
              Mandatory First-Login Password Reset
            </h2>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              Security Policy Enforced for {societyName}
            </p>
          </div>
        </div>

        {/* Security Warning Banner */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 mb-5 text-left">
          <p className="text-xs text-amber-800 dark:text-amber-200 font-bold flex items-center gap-1.5 mb-1">
            <Lock className="w-4 h-4 text-amber-500 shrink-0" />
            Temporary Credential Protection
          </p>
          <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium leading-relaxed">
            You are currently logged in with a system-generated temporary password for{' '}
            <span className="font-extrabold">{userAuth.EmailOrPhone}</span>. To protect your profile and financial ledger access, you must set a new permanent password.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Temporary/Current Password input (if temp password available) */}
          {userAuth.TempPassword && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-400">
                Confirm Current / Temp Password
              </label>
              <input
                type="text"
                readOnly
                value={userAuth.TempPassword}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-mono font-bold text-slate-500"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase text-slate-400">
              New Secure Password *
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="Enter new strong password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase text-slate-400">
              Confirm New Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          {/* Password Strength Checklist */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50 space-y-1.5 text-[11px]">
            <div className={`flex items-center gap-1.5 font-semibold ${hasMinLength ? 'text-emerald-500' : 'text-slate-400'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>At least 8 characters long</span>
            </div>
            <div className={`flex items-center gap-1.5 font-semibold ${hasUppercase ? 'text-emerald-500' : 'text-slate-400'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Includes at least one uppercase letter (A-Z)</span>
            </div>
            <div className={`flex items-center gap-1.5 font-semibold ${hasDigit ? 'text-emerald-500' : 'text-slate-400'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Includes at least one number (0-9)</span>
            </div>
            <div className={`flex items-center gap-1.5 font-semibold ${isMatch ? 'text-emerald-500' : 'text-slate-400'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Passwords match</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <span>Updating Credentials & Encrypting...</span>
            ) : (
              <>
                <span>Update Password & Unlock App</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
