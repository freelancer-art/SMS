import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, X, Bell, ShieldAlert, Plus, Check } from 'lucide-react';
import { EmergencyAlert } from '../types';

interface EmergencyAlertBannerProps {
  alerts: EmergencyAlert[];
  activeSocietyId: string;
  userRole?: string;
  onAddAlert?: (alert: Omit<EmergencyAlert, 'id' | 'CreatedAt'>) => void;
  theme?: 'light' | 'dark';
}

export const EmergencyAlertBanner: React.FC<EmergencyAlertBannerProps> = ({
  alerts,
  activeSocietyId,
  userRole = 'Member',
  onAddAlert,
  theme = 'dark'
}) => {
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const stored = sessionStorage.getItem('dismissed_emergency_alerts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newSeverity, setNewSeverity] = useState<'critical' | 'warning' | 'info'>('critical');
  const [newActiveUntil, setNewActiveUntil] = useState('');

  const activeAlerts = alerts.filter(alert => {
    if (alert.SocietyId && alert.SocietyId !== activeSocietyId) return false;
    if (dismissedIds.includes(alert.id)) return false;
    if (alert.ActiveUntil) {
      const expiry = new Date(alert.ActiveUntil);
      if (expiry < new Date()) return false;
    }
    return true;
  });

  const handleDismiss = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    try {
      sessionStorage.setItem('dismissed_emergency_alerts', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    if (onAddAlert) {
      onAddAlert({
        SocietyId: activeSocietyId,
        AlertTitle: newTitle,
        Message: newMessage,
        Severity: newSeverity,
        ActiveUntil: newActiveUntil || new Date(Date.now() + 86400000 * 2).toISOString(),
        CreatedBy: userRole
      });
    }
    setNewTitle('');
    setNewMessage('');
    setShowCreateModal(false);
  };

  const isAdmin = userRole === 'Admin' || userRole === 'SuperAdmin' || userRole === 'Committee Member';

  return (
    <div className="w-full mb-4 space-y-2">
      {activeAlerts.map(alert => {
        const isCritical = alert.Severity === 'critical';
        const isWarning = alert.Severity === 'warning';

        return (
          <div
            key={alert.id}
            id={`emergency-alert-banner-${alert.id}`}
            className={`relative overflow-hidden rounded-2xl border p-4 shadow-lg transition-all duration-300 animate-fade-in ${
              isCritical
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-100 shadow-rose-950/40 ring-1 ring-rose-500/30'
                : isWarning
                ? 'bg-amber-950/90 border-amber-500/50 text-amber-100 shadow-amber-950/40 ring-1 ring-amber-500/30'
                : 'bg-sky-950/90 border-sky-500/50 text-sky-100 ring-1 ring-sky-500/30'
            }`}
          >
            {/* Pulsing indicator line */}
            <div
              className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                isCritical ? 'bg-rose-500 animate-pulse' : isWarning ? 'bg-amber-500' : 'bg-sky-500'
              }`}
            />

            <div className="flex items-start justify-between gap-3 pl-2">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-xl flex-shrink-0 ${
                    isCritical
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : isWarning
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-sky-500/20 text-sky-400'
                  }`}
                >
                  {isCritical ? (
                    <ShieldAlert className="w-6 h-6 animate-bounce" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-6 h-6" />
                  ) : (
                    <AlertCircle className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isCritical
                          ? 'bg-rose-500 text-white'
                          : isWarning
                          ? 'bg-amber-500 text-black'
                          : 'bg-sky-500 text-white'
                      }`}
                    >
                      {alert.Severity.toUpperCase()} EMERGENCY
                    </span>
                    <span className="text-[11px] opacity-75">
                      {new Date(alert.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm mt-1 leading-snug">{alert.AlertTitle}</h4>
                  {alert.Message && <p className="text-xs opacity-90 mt-1 leading-relaxed">{alert.Message}</p>}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDismiss(alert.id)}
                title="Dismiss alert for current session"
                className="p-1.5 hover:bg-white/10 rounded-xl transition-colors opacity-80 hover:opacity-100 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}

      {/* Admin Quick Publish Action Button if no active alerts or to broadcast a new emergency */}
      {isAdmin && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all duration-200"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Publish Emergency Alert</span>
          </button>
        </div>
      )}

      {/* Create Emergency Alert Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <ShieldAlert className="w-5 h-5" />
                <span>Broadcast Emergency Alert</span>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Alert Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 🚨 Elevator Cable Inspection in Progress"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Severity Level</label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500"
                >
                  <option value="critical">Critical (Red Banner - High Priority)</option>
                  <option value="warning">Warning (Amber Banner - Medium Priority)</option>
                  <option value="info">Informational (Blue Banner - Normal Priority)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Detailed Message</label>
                <textarea
                  rows={3}
                  placeholder="Provide instructions for residents..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Active Until (Optional Expiry)</label>
                <input
                  type="datetime-local"
                  value={newActiveUntil}
                  onChange={(e) => setNewActiveUntil(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Publish Alert</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyAlertBanner;
