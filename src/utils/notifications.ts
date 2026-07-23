// Expo Push Notification Utility Module
// Supports Expo SDK 51, Firebase Cloud Messaging (FCM) on Android & APNs on iOS

import { PushToken } from '../types';

export interface PushNotificationPayload {
  to: string | string[]; // Expo Push Token or array of tokens (ExponentPushToken[xxx])
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | null;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
  badge?: number;
}

/**
 * Registers device for Expo Push Notifications
 * Obtains device token and configures Android Notification Channel
 */
export async function registerForPushNotificationsAsync(userId: string, societyId: string, flatNo: string): Promise<PushToken | null> {
  let token = '';
  let os: 'android' | 'ios' | 'web' = 'web';

  // Check if running inside React Native / Expo environment
  try {
    // Dynamic import to support both Expo React Native runtime and Web fallback
    if (typeof window !== 'undefined' && (window as any).Expo) {
      const pkgNotifications = 'expo-notifications';
      const pkgDevice = 'expo-device';
      const pkgConstants = 'expo-constants';
      const Notifications = await import(/* @vite-ignore */ pkgNotifications);
      const Device = await import(/* @vite-ignore */ pkgDevice);
      const Constants = await import(/* @vite-ignore */ pkgConstants);

      if (!Device.isDevice) {
        console.warn('Must use physical device for Push Notifications');
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return null;
      }

      const projectId = Constants.default?.expoConfig?.extra?.eas?.projectId || 'society-connect-app-id';
      const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
      token = tokenResponse.data;
      os = (Device.osName?.toLowerCase() as 'android' | 'ios' | 'web') || 'android';

      if (os === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Housing Society Alerts',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#059669',
        });
      }
    } else {
      // Web / Simulator Fallback Token Generation
      os = 'web';
      token = `ExponentPushToken[WebSim_${flatNo}_${Date.now().toString(36)}]`;
    }
  } catch (err) {
    console.warn('Expo Notifications fallback mode activated:', err);
    token = `ExponentPushToken[Simulated_${flatNo}_${Date.now().toString(36)}]`;
  }

  const newToken: PushToken = {
    id: `TOK-${Date.now()}`,
    UserId: userId,
    SocietyId: societyId,
    FlatNo: flatNo,
    ExpoPushToken: token,
    DeviceOS: os,
    CreatedAt: new Date().toISOString(),
    LastUsedAt: new Date().toISOString(),
  };

  return newToken;
}

/**
 * Dispatches Expo Push Notification payload directly to Expo's Push API backend
 * (https://exp.host/--/api/v2/push/send)
 */
export async function sendExpoPushNotification(payload: PushNotificationPayload): Promise<{ success: boolean; result?: any; error?: string }> {
  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sound: 'default',
        priority: 'high',
        channelId: 'default',
        ...payload,
      }),
    });

    const data = await response.json();
    return { success: response.ok, result: data };
  } catch (error: any) {
    console.error('Failed to send Expo Push Notification:', error);
    return { success: false, error: error.message || 'Push dispatch failed' };
  }
}

/**
 * Helper to dispatch visitor gatepass check-in push alert to a target flat
 */
export async function notifyVisitorCheckIn(
  tokens: PushToken[],
  societyId: string,
  flatNo: string,
  visitorName: string,
  purpose: string
) {
  const targetTokens = tokens.filter(t => t.SocietyId === societyId && (t.FlatNo === flatNo || t.FlatNo === 'All Flats'));
  const tokenStrings = targetTokens.map(t => t.ExpoPushToken).filter(Boolean);

  const payload: PushNotificationPayload = {
    to: tokenStrings.length > 0 ? tokenStrings : [`ExponentPushToken[Simulated_${flatNo}]`],
    title: `🚨 Visitor at Main Gate - Flat ${flatNo}`,
    body: `${visitorName} (${purpose}) has just checked in at the main gate.`,
    data: {
      type: 'VISITOR_CHECK_IN',
      flatNo,
      visitorName,
      purpose,
      timestamp: new Date().toISOString(),
    },
    priority: 'high',
    channelId: 'default',
  };

  return await sendExpoPushNotification(payload);
}

/**
 * Helper to dispatch urgent society notice push broadcast to residents
 */
export async function notifyNoticePublished(
  tokens: PushToken[],
  societyId: string,
  noticeTitle: string,
  category: string
) {
  const targetTokens = tokens.filter(t => t.SocietyId === societyId);
  const tokenStrings = targetTokens.map(t => t.ExpoPushToken).filter(Boolean);

  const payload: PushNotificationPayload = {
    to: tokenStrings.length > 0 ? tokenStrings : ['ExponentPushToken[Simulated_Broadcast]'],
    title: `📢 Society Announcement: ${noticeTitle}`,
    body: `[${category}] A new notice has been published on the society noticeboard.`,
    data: {
      type: 'NEW_NOTICE',
      title: noticeTitle,
      category,
      timestamp: new Date().toISOString(),
    },
    priority: 'high',
    channelId: 'default',
  };

  return await sendExpoPushNotification(payload);
}
