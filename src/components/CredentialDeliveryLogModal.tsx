import React, { useState, useEffect } from 'react';
import { Mail, Phone, Key, Send, Copy, Check, ShieldCheck, X, RefreshCw, Smartphone } from 'lucide-react';
import { DispatchedNotification, getDispatchedNotifications, requestPhoneOTP } from '../utils/authHelpers';

interface CredentialDeliveryLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  societyName: string;
  theme?: 'light' | 'dark';
}

export default function CredentialDeliveryLogModal({
  isOpen,
  onClose,
  societyName,
  theme = 'light'
}: CredentialDeliveryLogModalProps) {
  const [logs, setLogs] = useState<DispatchedNotification[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [testPhone, setTestPhone] = useState('+91 98765 43210');
  const [otpSentMsg, setOtpSentMsg] = useState<string | null>(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (isOpen) {
      setLogs(getDispatchedNotifications());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResend = (notification: DispatchedNotification) => {
    setResendingId(notification.id);
    setTimeout(() => {
      setResendingId(null);
      alert(`Welcome credentials re-sent successfully to ${notification.recipientEmail || notification.recipientPhone}!`);
    }, 800);
  };

  const handleTestOTP = () => {
    const res = requestPhoneOTP(testPhone);
    setOtpSentMsg(res.message);
    setTimeout(() => setOtpSentMsg(null), 6000);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-all ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-200/50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight">Credential Provisioning & Delivery Log</h3>
              <p className="text-[10px] text-slate-400 font-medium">{societyName} • SMS & Email Audit Trail</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* OTP Test Simulator Banner */}
        <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/50 px-6 flex flex-wrap items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200">Phone + OTP Authentication Simulator</p>
              <p className="text-[10px] text-indigo-700 dark:text-indigo-300">Test dispatching instant OTP codes to member mobile numbers</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg w-36 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              onClick={handleTestOTP}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-lg transition-all cursor-pointer shadow-sm"
            >
              Send OTP
            </button>
          </div>
          {otpSentMsg && (
            <div className="w-full text-[11px] font-bold text-emerald-600 dark:text-emerald-400 animate-fadeIn">
              ✓ {otpSentMsg}
            </div>
          )}
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-3.5 text-left flex-1">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Mail className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-bold">No credentials dispatched yet.</p>
              <p className="text-[10px]">Import members via CSV or register new users to trigger auto-generated welcome notifications.</p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 hover:border-purple-300 dark:hover:border-purple-800/50 transition-all space-y-2.5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100">{log.recipientName}</span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium mt-0.5">
                      {log.recipientEmail && <span>📧 {log.recipientEmail}</span>}
                      {log.recipientPhone && <span>📱 {log.recipientPhone}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black">
                      {log.status}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(log.dispatchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {log.tempPassword && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-purple-500/5 border border-purple-500/20 text-xs">
                    <div className="flex items-center gap-2">
                      <Key className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                      <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase">Temp Password:</span>
                      <span className="font-mono font-black text-purple-700 dark:text-purple-300">{log.tempPassword}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(log.tempPassword!, log.id)}
                      className="p-1 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200 transition-colors cursor-pointer"
                      title="Copy Temporary Password"
                    >
                      {copiedId === log.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}

                <div className="flex justify-between items-center pt-1 border-t border-slate-200/40 dark:border-slate-800 text-[10px]">
                  <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Forced First-Login Password Reset Flag: Active
                  </span>
                  <button
                    onClick={() => handleResend(log)}
                    disabled={resendingId === log.id}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${resendingId === log.id ? 'animate-spin' : ''}`} />
                    <span>Re-send Credentials</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
