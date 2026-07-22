import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Try to initialize Supabase client from environment variables or custom localStorage configuration
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const env = (import.meta as any).env || {};
  const url = env.VITE_SUPABASE_URL || localStorage.getItem('housing_app_supabase_url');
  const key = env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('housing_app_supabase_key');

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
 * Uploads a file to Supabase Storage bucket.
 * If Supabase is not configured or fails, gracefully falls back to local Object URL / Data URL.
 */
export async function uploadToSupabaseStorage(
  file: File,
  bucket: StorageBucket,
  folderPath: string = 'uploads'
): Promise<UploadResult> {
  const fileName = file.name;
  const fileSize = formatBytes(file.size);
  const client = getSupabaseClient();

  if (client) {
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${folderPath}/${Date.now()}_${sanitizedName}`;

      const { data, error } = await client.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.warn(`Supabase Storage upload error for bucket '${bucket}':`, error.message);
      } else if (data) {
        const { data: publicUrlData } = client.storage.from(bucket).getPublicUrl(data.path);
        if (publicUrlData?.publicUrl) {
          return {
            url: publicUrlData.publicUrl,
            fileName,
            fileSize,
            isMock: false,
          };
        }
      }
    } catch (err) {
      console.warn('Error during Supabase Storage upload:', err);
    }
  }

  // Fallback for offline / demo mode or if Supabase storage bucket isn't provisioned yet
  const localUrl = URL.createObjectURL(file);
  return {
    url: localUrl,
    fileName,
    fileSize,
    isMock: true,
  };
}
