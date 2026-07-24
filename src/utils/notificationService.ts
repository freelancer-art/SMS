/**
 * Mock Notification Service
 * Simulates sending welcome Email and SMS notifications containing system-generated
 * temporary passwords, login portal URLs, and account credentials to new residents & committee members.
 */

import { DispatchedNotification, recordDispatchedNotification, getDispatchedNotifications } from './authHelpers';

export interface SendWelcomeNotificationParams {
  recipientName: string;
  recipientEmail?: string;
  recipientPhone?: string;
  societyName: string;
  tempPassword?: string;
  portalUrl?: string;
  loginMethod?: 'PhoneOTP' | 'EmailTempPass' | 'Both';
}

/**
 * Sends a welcome notification (Email and/or SMS) to a newly provisioned user.
 */
export function sendWelcomeNotification(params: SendWelcomeNotificationParams): DispatchedNotification {
  const portalUrl = params.portalUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://housing-society.app');
  const loginMethod = params.loginMethod || (params.tempPassword ? 'EmailTempPass' : 'PhoneOTP');

  let content = `Welcome to ${params.societyName} Resident Portal!\n\nHi ${params.recipientName},\n`;
  content += `Your official housing society account has been created on ${params.societyName}.\n`;

  if (params.tempPassword) {
    content += `\n🌐 Portal URL: ${portalUrl}\n📧 Login Identifier: ${params.recipientEmail || params.recipientPhone}\n🔑 Temporary Password: ${params.tempPassword}\n\n⚠️ Note: You will be required to set a new password upon your first login.`;
  } else {
    content += `\n🌐 Portal URL: ${portalUrl}\n📱 Login Method: Mobile Number (+OTP Verification)\n📱 Registered Phone: ${params.recipientPhone}`;
  }

  const notificationType: 'Email' | 'SMS' | 'Both' = 
    params.recipientEmail && params.recipientPhone ? 'Both' : params.recipientEmail ? 'Email' : 'SMS';

  const notification: DispatchedNotification = {
    id: `NOTIF-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    recipientEmail: params.recipientEmail,
    recipientPhone: params.recipientPhone,
    recipientName: params.recipientName,
    societyName: params.societyName,
    tempPassword: params.tempPassword,
    portalUrl,
    type: notificationType,
    dispatchedAt: new Date().toISOString(),
    status: 'Delivered',
    content
  };

  recordDispatchedNotification(notification);

  console.log(`[WELCOME NOTIFICATION SERVICE] Sent ${notificationType} to ${params.recipientName}:`, notification);

  return notification;
}

/**
 * Simulates dispatching welcome SMS with portal URL and temp password.
 */
export function sendSmsWelcome(phone: string, name: string, societyName: string, tempPassword?: string, portalUrl?: string): DispatchedNotification {
  return sendWelcomeNotification({
    recipientName: name,
    recipientPhone: phone,
    societyName,
    tempPassword,
    portalUrl,
    loginMethod: tempPassword ? 'EmailTempPass' : 'PhoneOTP'
  });
}

/**
 * Simulates dispatching welcome Email with portal URL and temp password.
 */
export function sendEmailWelcome(email: string, name: string, societyName: string, tempPassword?: string, portalUrl?: string): DispatchedNotification {
  return sendWelcomeNotification({
    recipientName: name,
    recipientEmail: email,
    societyName,
    tempPassword,
    portalUrl,
    loginMethod: tempPassword ? 'EmailTempPass' : 'PhoneOTP'
  });
}

/**
 * Fetch all dispatched welcome notifications for audit logging UI.
 */
export function fetchNotificationLogs(): DispatchedNotification[] {
  return getDispatchedNotifications();
}
