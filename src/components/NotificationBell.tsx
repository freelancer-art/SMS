import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { AppNotification } from '../types';
import { getSupabaseClient } from '../utils/supabaseStorage';

export interface NotificationBellProps {
  notifications: AppNotification[];
  onClick: () => void;
  className?: string;
  theme?: 'dark' | 'light';
  userId?: string;
  societyId?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  onNewRealtimeNotification?: (notification: AppNotification) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  onClick,
  className = '',
  theme = 'dark',
  userId,
  societyId,
  supabaseUrl,
  supabaseAnonKey,
  onNewRealtimeNotification
}) => {
  const [realtimeCount, setRealtimeCount] = useState(0);
  const [isPulsing, setIsPulsing] = useState(false);
  const pulseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync realtime counter when base notifications array changes (e.g. read status updated)
  useEffect(() => {
    setRealtimeCount(0);
  }, [notifications]);

  const propsUnread = notifications.filter(n => !n.IsRead).length;
  const unreadCount = propsUnread + realtimeCount;
  const isDark = theme === 'dark';

  // Supabase Realtime Subscription Listener
  useEffect(() => {
    let client = getSupabaseClient();
    if (!client && supabaseUrl && supabaseAnonKey) {
      try {
        client = createClient(supabaseUrl, supabaseAnonKey);
      } catch (err) {
        console.warn('Failed to initialize Supabase client for NotificationBell:', err);
      }
    }

    if (!client) return;

    const handleNewNotification = (payload: any) => {
      const newRecord = payload.new;
      if (!newRecord) return;

      // Filter by user_id and society_id if specified
      if (userId && newRecord.user_id && newRecord.user_id !== userId) return;
      if (societyId && newRecord.society_id && newRecord.society_id !== societyId) return;

      // 1. Increment unreadCount badge immediately
      setRealtimeCount((prev) => prev + 1);

      // 2. Trigger subtle visual pulse animation on the bell icon
      setIsPulsing(true);
      if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
      pulseTimeoutRef.current = setTimeout(() => {
        setIsPulsing(false);
      }, 2500);

      // Trigger optional callback for parent state updates
      if (onNewRealtimeNotification) {
        onNewRealtimeNotification({
          id: newRecord.id || `rt-${Date.now()}`,
          SocietyId: newRecord.society_id || societyId || '',
          UserId: newRecord.user_id || userId || '',
          Title: newRecord.title || 'New Notification',
          Message: newRecord.message || '',
          Category: newRecord.category || 'general',
          IsRead: false,
          CreatedAt: newRecord.created_at || new Date().toISOString()
        });
      }
    };

    // Construct postgres_changes filter parameter
    let filterStr: string | undefined = undefined;
    if (userId) {
      filterStr = `user_id=eq.${userId}`;
    } else if (societyId) {
      filterStr = `society_id=eq.${societyId}`;
    }

    const channelConfig: any = {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications'
    };
    if (filterStr) {
      channelConfig.filter = filterStr;
    }

    const channel = client
      .channel('realtime_notifications')
      .on('postgres_changes', channelConfig, handleNewNotification)
      .subscribe();

    // 3. Clean up subscription channel when component unmounts
    return () => {
      if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
      client?.removeChannel(channel);
    };
  }, [userId, societyId, supabaseUrl, supabaseAnonKey, onNewRealtimeNotification]);

  const handleClick = () => {
    setRealtimeCount(0);
    setIsPulsing(false);
    onClick();
  };

  return (
    <button
      onClick={handleClick}
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
      {/* Subtle pulse animation overlay when a realtime notification arrives */}
      {isPulsing && (
        <span className="absolute inset-0 rounded-xl bg-purple-500/40 animate-ping pointer-events-none" />
      )}

      <Bell
        className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
          isPulsing
            ? 'text-amber-400 scale-125 rotate-12 animate-bounce'
            : unreadCount > 0
            ? 'text-purple-400 animate-bounce-short'
            : ''
        }`}
      />

      {unreadCount > 0 && (
        <span
          className={`absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 flex items-center justify-center text-[10px] font-extrabold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full border-2 border-slate-900 shadow-md ${
            isPulsing ? 'scale-125 bg-amber-500 animate-bounce' : 'animate-pulse'
          }`}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;

