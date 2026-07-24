import React from 'react';
import { Bell } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationBellProps {
  notifications: AppNotification[];
  onClick: () => void;
  className?: string;
  theme?: 'dark' | 'light';
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  onClick,
  className = '',
  theme = 'dark'
}) => {
  const unreadCount = notifications.filter(n => !n.IsRead).length;
  const isDark = theme === 'dark';

  return (
    <button
      onClick={onClick}
      className={`relative p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center group ${
        unreadCount > 0
          ? isDark
            ? 'bg-purple-950/40 border-purple-500/50 text-purple-300 hover:bg-purple-900/60 shadow-lg shadow-purple-900/20'
            : 'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100'
          : isDark
          ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
      } ${className}`}
      title={`Notification Center (${unreadCount} unread)`}
      aria-label="Open Notifications"
    >
      <Bell className={`w-5 h-5 transition-transform group-hover:scale-110 ${unreadCount > 0 ? 'text-purple-400 animate-bounce-short' : ''}`} />

      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 flex items-center justify-center text-[10px] font-extrabold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full border-2 border-slate-900 shadow-md animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
