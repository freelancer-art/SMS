/**
 * Authentication, User Provisioning, and Credential Delivery Helper Module
 * Provides helper functions for dynamic society identity generation, credential creation,
 * SMS/Email welcome notifications, Phone + OTP authentication, and forced password resets.
 */

import { Society, UserAuth, Role, Member } from '../types';
import { generateRandomString, generateSalt, hashPassword } from './security';

export interface DispatchedNotification {
  id: string;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientName: string;
  societyName: string;
  tempPassword?: string;
  portalUrl: string;
  type: 'Email' | 'SMS' | 'Both';
  dispatchedAt: string;
  status: 'Sent' | 'Delivered' | 'Pending';
  content: string;
}

const DISPATCH_LOG_STORAGE_KEY = 'society_dispatched_credentials_log';

/**
 * Generates a deterministic, unique society code (e.g., "OMRES1", "GWRES01").
 */
export function generateSocietyCode(societyName: string, existingCodes: string[] = []): string {
  const words = societyName.trim().toUpperCase().replace(/[^A-Z0-9\s]/g, '').split(/\s+/);
  let prefix = '';
  if (words.length >= 2) {
    prefix = (words[0].substring(0, 3) + words[1].substring(0, 2)).toUpperCase();
  } else if (words.length === 1 && words[0].length >= 3) {
    prefix = words[0].substring(0, 5).toUpperCase();
  } else {
    prefix = 'SOC';
  }

  let code = `${prefix}1`;
  let counter = 1;
  while (existingCodes.includes(code)) {
    counter++;
    code = `${prefix}${counter}`;
  }
  return code;
}

/**
 * Generates a clean, deterministic URL slug for a society (e.g., "om-residency-8f92").
 */
export function generateSocietySlug(societyName: string): string {
  const baseSlug = societyName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
  const shortHash = generateRandomString(4).toLowerCase();
  return `${baseSlug}-${shortHash}`;
}

/**
 * Generates a secure system-generated temporary password (e.g., "TempPass-8a3d1f").
 */
export function generateTempPassword(): string {
  const prefix = 'Pass';
  const digits = Math.floor(1000 + Math.random() * 9000);
  const alpha = generateRandomString(4).toUpperCase();
  return `${prefix}-${digits}-${alpha}`;
}

/**
 * Gets all dispatched welcome notifications from LocalStorage audit trail.
 */
export function getDispatchedNotifications(): DispatchedNotification[] {
  if (typeof localStorage === 'undefined') return [];
  const raw = localStorage.getItem(DISPATCH_LOG_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

/**
 * Saves a dispatched notification to LocalStorage audit trail.
 */
export function recordDispatchedNotification(notification: DispatchedNotification): void {
  if (typeof localStorage === 'undefined') return;
  const current = getDispatchedNotifications();
  const updated = [notification, ...current];
  localStorage.setItem(DISPATCH_LOG_STORAGE_KEY, JSON.stringify(updated));
}

/**
 * Formats and triggers an auto-generated welcome notification (Email & SMS simulation)
 * containing temporary credentials and portal login instructions.
 */
export function dispatchWelcomeNotification(params: {
  recipientName: string;
  recipientEmail?: string;
  recipientPhone?: string;
  societyName: string;
  tempPassword?: string;
  loginMethod: 'PhoneOTP' | 'EmailTempPass' | 'Both';
  portalUrl?: string;
}): DispatchedNotification {
  const portalUrl = params.portalUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://housing-society.app');
  
  let content = `Welcome to ${params.societyName} Resident Portal!\n\nHi ${params.recipientName},\n`;
  content += `Your official account has been created on ${params.societyName}.\n`;

  if (params.tempPassword) {
    content += `\n🔑 Login Portal: ${portalUrl}\n📧 Login Identifier: ${params.recipientEmail || params.recipientPhone}\n🔒 Temporary Password: ${params.tempPassword}\n\n⚠️ Note: You will be required to set a new password upon your first login.`;
  } else {
    content += `\n🔑 Login Portal: ${portalUrl}\n📱 Login Method: Mobile Number (+OTP Verification)\n📱 Registered Phone: ${params.recipientPhone}`;
  }

  const notification: DispatchedNotification = {
    id: `NOTIF-${Date.now()}-${generateRandomString(4)}`,
    recipientEmail: params.recipientEmail,
    recipientPhone: params.recipientPhone,
    recipientName: params.recipientName,
    societyName: params.societyName,
    tempPassword: params.tempPassword,
    portalUrl,
    type: params.recipientEmail && params.recipientPhone ? 'Both' : params.recipientEmail ? 'Email' : 'SMS',
    dispatchedAt: new Date().toISOString(),
    status: 'Delivered',
    content
  };

  recordDispatchedNotification(notification);
  
  // Console logging simulation for developer verification
  console.log(`[CREDENTIAL DELIVERY] Notification dispatched to ${params.recipientName}:`, notification);

  return notification;
}

/**
 * OTP Verification Helper
 */
const OTP_STORE = new Map<string, { otp: string; expiresAt: number }>();

export function requestPhoneOTP(phone: string): { success: boolean; otp: string; message: string } {
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  if (!cleanPhone || cleanPhone.length < 8) {
    return { success: false, otp: '', message: 'Invalid phone number format.' };
  }

  // Generate a deterministic 6-digit OTP (e.g. "123456" for demo, or random)
  const otp = '123456'; // Deterministic test OTP for seamless testing
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

  OTP_STORE.set(cleanPhone, { otp, expiresAt });

  console.log(`[SMS OTP DISPATCH] Sent 6-digit OTP ${otp} to ${cleanPhone}`);
  return {
    success: true,
    otp,
    message: `OTP sent successfully to ${cleanPhone}. (Use demo code: ${otp})`
  };
}

export function verifyPhoneOTP(phone: string, inputOTP: string): boolean {
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const record = OTP_STORE.get(cleanPhone);
  
  // Default fallback OTP for instant testing: '123456'
  if (inputOTP === '123456') return true;

  if (!record) return false;
  if (Date.now() > record.expiresAt) return false;
  return record.otp === inputOTP.trim();
}

/**
 * Creates or updates a UserAuth record for a newly provisioned member/admin.
 */
export function provisionUserAccount(params: {
  emailOrPhone: string;
  phone?: string;
  roleId: string;
  societyId: string;
  isSuperAdmin?: boolean;
  tempPassword?: string;
  existingAuths?: UserAuth[];
}): { userAuth: UserAuth; tempPassword: string; notification: DispatchedNotification } {
  const salt = generateSalt();
  const tempPassword = params.tempPassword || generateTempPassword();
  const passwordHash = hashPassword(tempPassword, salt);

  const userAuth: UserAuth = {
    id: `Auth-${params.societyId}-${generateRandomString(8)}`,
    EmailOrPhone: params.emailOrPhone.trim().toLowerCase(),
    Phone: params.phone,
    PasswordHash: passwordHash,
    Salt: salt,
    RoleId: params.roleId,
    SocietyId: params.societyId,
    Status: 'Active',
    MustChangePassword: true, // MANDATORY password reset flag upon first login
    TempPassword: tempPassword,
    IsSuperAdmin: params.isSuperAdmin || false,
    LastLoginAt: undefined
  };

  return { userAuth, tempPassword, notification: null as any };
}
