import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Trash2, 
  ShieldAlert, 
  Megaphone, 
  CreditCard, 
  AlertTriangle, 
  Info, 
  ExternalLink,
  PlusCircle,
  Filter
} from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearNotification: (id: string) => void;
  onClearAll: () => void;
  onNavigateAction?: (type: string, metadata?: Record<string, any>) => void;
  onSendSimulatedNotification?: (type: 'gate' | 'notice' | 'billing' | 'emergency') => void;
  theme?: 'dark' | 'light';
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearNotification,
  onClearAll,
  onNavigateAction,
  onSendSimulatedNotification,
  theme = 'dark'
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(item => {
    if (filterType === 'all') return true;
    return item.Type === filterType;
  });

  const unreadCount = notifications.filter(n => !n.IsRead).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'gate':
        return <ShieldAlert className="w-4 h-4 text-emerald-400" />;
      case 'notice':
        return <Megaphone className="w-4 h-4 text-blue-400" />;
      case 'billing':
        return <CreditCard className="w-4 h-4 text-purple-400" />;
      case 'emergency':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'gate':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
      case 'notice':
        return 'bg-blue-950/80 text-blue-300 border-blue-800/80';
      case 'billing':
        return 'bg-purple-950/80 text-purple-300 border-purple-800/80';
      case 'emergency':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/80';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm transition-opacity">
      <div 
        className={`w-full max-w-md h-full ${
          isDark ? 'bg-slate-900 border-l border-slate-800 text-white' : 'bg-white border-l border-slate-200 text-slate-900'
        } shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300`}
      >
        {/* Header */}
        <div>
          <div className={`p-4 border-b ${isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-slate-50'} flex items-center justify-between`}>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  Notification Center
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-purple-600 text-white rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Real-time alerts, gate arrivals & billing notices
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-200 text-slate-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Controls & Filter Bar */}
          <div className={`p-3 border-b ${isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-100'} space-y-2.5`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter by Type:</span>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear all</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'gate', label: 'Gate Pass' },
                { id: 'billing', label: 'Billing' },
                { id: 'notice', label: 'Notices' },
                { id: 'emergency', label: 'Alerts' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    filterType === tab.id
                      ? 'bg-purple-600 text-white shadow-sm'
                      : isDark
                      ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notification Feed List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filteredNotifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className={`p-4 rounded-full ${isDark ? 'bg-slate-800/80 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                <Bell className="w-8 h-8 stroke-1" />
              </div>
              <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                No notifications found
              </p>
              <p className={`text-xs max-w-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                You are all caught up! New gate arrivals, billing invoices, and society circulars will appear here in real time.
              </p>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.IsRead) onMarkAsRead(n.id);
                  if (onNavigateAction) onNavigateAction(n.Type, n.Metadata);
                }}
                className={`group p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                  !n.IsRead
                    ? isDark
                      ? 'bg-slate-800/90 border-purple-500/40 shadow-md shadow-purple-900/10'
                      : 'bg-purple-50/70 border-purple-300 shadow-sm'
                    : isDark
                    ? 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-850'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {!n.IsRead && (
                  <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-purple-500 ring-4 ring-purple-500/20 animate-pulse" />
                )}

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex-shrink-0">
                    {getTypeIcon(n.Type)}
                  </div>

                  <div className="flex-1 min-w-0 pr-4 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${getTypeBadgeClass(n.Type)}`}>
                        {n.Type}
                      </span>
                      <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {new Date(n.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className={`text-xs font-bold leading-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                      {n.Title}
                    </h4>

                    <p className={`text-xs line-clamp-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {n.Message}
                    </p>

                    <div className="pt-1.5 flex items-center justify-between text-[11px]">
                      <span className="text-purple-400 group-hover:text-purple-300 font-semibold flex items-center gap-1">
                        <span>View details</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onClearNotification(n.id);
                        }}
                        className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                          isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-rose-400' : 'hover:bg-slate-200 text-slate-500 hover:text-rose-600'
                        }`}
                        title="Dismiss notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Simulation Controls */}
        {onSendSimulatedNotification && (
          <div className={`p-3 border-t ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'} space-y-2`}>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
              <span className="flex items-center gap-1">
                <PlusCircle className="w-3.5 h-3.5 text-purple-400" />
                <span>Simulate Push Dispatch:</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Supabase Real-Time</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                onClick={() => onSendSimulatedNotification('gate')}
                className="py-1.5 px-2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[11px] font-semibold hover:bg-emerald-900 transition-colors cursor-pointer text-center"
              >
                + Gate
              </button>
              <button
                onClick={() => onSendSimulatedNotification('billing')}
                className="py-1.5 px-2 rounded bg-purple-950/80 text-purple-300 border border-purple-800 text-[11px] font-semibold hover:bg-purple-900 transition-colors cursor-pointer text-center"
              >
                + Bill
              </button>
              <button
                onClick={() => onSendSimulatedNotification('notice')}
                className="py-1.5 px-2 rounded bg-blue-950/80 text-blue-300 border border-blue-800 text-[11px] font-semibold hover:bg-blue-900 transition-colors cursor-pointer text-center"
              >
                + Notice
              </button>
              <button
                onClick={() => onSendSimulatedNotification('emergency')}
                className="py-1.5 px-2 rounded bg-amber-950/80 text-amber-300 border border-amber-800 text-[11px] font-semibold hover:bg-amber-900 transition-colors cursor-pointer text-center"
              >
                + Alert
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenterModal;
