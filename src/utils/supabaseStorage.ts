import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { compressImage } from './imageCompression';

// Try to initialize Supabase client strictly from environment variables or custom localStorage fallback
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const env = (import.meta as any).env || process.env || {};
  const url = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || localStorage.getItem('housing_app_supabase_url') || localStorage.getItem('society_supabase_url');
  const key = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('housing_app_supabase_key') || localStorage.getItem('society_supabase_anon_key');

  if (url && key) {
    try {
      supabaseInstance = createClient(url, key);
      return supabaseInstance;
    } catch (err) {
      console.warn('Could not initialize Supabase client:', err);
    }
  }
  return null;
}

export type StorageBucket = 'society-docs' | 'tenant-kyc' | 'notice-attachments';

export interface UploadResult {
  url: string;
  fileName: string;
  fileSize: string;
  isMock: boolean;
  filePath?: string;
}

/**
 * Utility to format file size into human readable KB / MB
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Requests a Signed Short-Lived URL (default: 3600s / 1 hour) for private storage preview or download.
 */
export async function getSignedFileUrl(
  bucket: StorageBucket,
  pathOrUrl: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  if (!pathOrUrl) return '';

  // Local object URLs, data URLs, or non-supabase external URLs returned as is
  if (
    pathOrUrl.startsWith('blob:') ||
    pathOrUrl.startsWith('data:') ||
    (!pathOrUrl.includes('supabase.co') && !pathOrUrl.includes('/storage/v1/'))
  ) {
    return pathOrUrl;
  }

  const client = getSupabaseClient();
  if (!client) return pathOrUrl;

  try {
    let relativePath = pathOrUrl;
    if (pathOrUrl.includes(`/storage/v1/object/public/${bucket}/`)) {
      relativePath = pathOrUrl.split(`/storage/v1/object/public/${bucket}/`)[1];
    } else if (pathOrUrl.includes(`/storage/v1/object/sign/${bucket}/`)) {
      relativePath = pathOrUrl.split(`/storage/v1/object/sign/${bucket}/`)[1].split('?')[0];
    } else if (pathOrUrl.includes(`/${bucket}/`)) {
      relativePath = pathOrUrl.split(`/${bucket}/`)[1].split('?')[0];
    }

    const { data, error } = await client.storage
      .from(bucket)
      .createSignedUrl(relativePath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      console.warn(`Could not generate signed URL for bucket '${bucket}':`, error?.message);
      return pathOrUrl;
    }

    return data.signedUrl;
  } catch (err) {
    console.warn('Failed to fetch signed URL from Supabase:', err);
    return pathOrUrl;
  }
}

/**
 * Uploads a file to a PRIVATE Supabase Storage bucket and returns a Signed Short-Lived URL.
 * Falls back to local blob URL if client is offline or not provisioned.
 */
export async function uploadToSupabaseStorage(
  file: File,
  bucket: StorageBucket,
  folderPath: string = 'uploads'
): Promise<UploadResult> {
  // Compress image client-side before uploading (max width 1280px / JPEG quality 0.8)
  const compressedFile = await compressImage(file, 1280, 1280, 0.8);
  const fileName = compressedFile.name;
  const fileSize = formatBytes(compressedFile.size);
  const client = getSupabaseClient();

  if (client) {
    try {
      const sanitizedName = compressedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${folderPath}/${Date.now()}_${sanitizedName}`;

      const { data, error } = await client.storage
        .from(bucket)
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.warn(`Supabase Storage upload error for private bucket '${bucket}':`, error.message);
      } else if (data) {
        // Request a short-lived temporary signed URL for private document access (3600s)
        const { data: signedData, error: signedError } = await client.storage
          .from(bucket)
          .createSignedUrl(data.path, 3600);

        if (signedError) {
          console.warn('Error fetching signed URL for uploaded file:', signedError.message);
        }

        const signedUrl = signedData?.signedUrl || client.storage.from(bucket).getPublicUrl(data.path).data.publicUrl;

        return {
          url: signedUrl,
          fileName,
          fileSize,
          isMock: false,
          filePath: data.path,
        };
      }
    } catch (err) {
      console.warn('Error during Supabase Storage upload:', err);
    }
  }

  // Fallback for offline / demo mode
  const localUrl = URL.createObjectURL(file);
  return {
    url: localUrl,
    fileName,
    fileSize,
    isMock: true,
  };
}

