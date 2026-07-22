import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, X, Loader2, AlertCircle, Eye } from 'lucide-react';
import { uploadToSupabaseStorage, StorageBucket, UploadResult } from '../utils/supabaseStorage';

interface FileUploadProps {
  label: string;
  bucket: StorageBucket;
  accept?: string;
  currentUrl?: string;
  currentFileName?: string;
  onUploadSuccess: (result: UploadResult) => void;
  onClear?: () => void;
  helperText?: string;
  isDark?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  bucket,
  accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx',
  currentUrl,
  currentFileName,
  onUploadSuccess,
  onClear,
  helperText,
  isDark = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedInfo, setUploadedInfo] = useState<{ name: string; size?: string; isMock?: boolean } | null>(
    currentFileName ? { name: currentFileName } : null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const result = await uploadToSupabaseStorage(file, bucket);
      setUploadedInfo({
        name: result.fileName,
        size: result.fileSize,
        isMock: result.isMock,
      });
      onUploadSuccess(result);
    } catch (err: any) {
      setError(err?.message || 'File upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedInfo(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onClear) onClear();
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
          {label}
        </label>
        <span className="text-[8px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800">
          Bucket: {bucket}
        </span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept={accept}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {currentUrl || uploadedInfo ? (
        <div
          className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
            isDark
              ? 'bg-purple-950/20 border-purple-800/60 text-purple-200'
              : 'bg-purple-50/80 border-purple-200 text-purple-900'
          }`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-[11px] truncate">
                  {uploadedInfo?.name || currentFileName || 'Uploaded Document'}
                </span>
                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
              </div>
              <div className="flex items-center gap-2 text-[8.5px] text-slate-400">
                {uploadedInfo?.size && <span>{uploadedInfo.size}</span>}
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {uploadedInfo?.isMock ? 'Local Storage Synced' : 'Supabase Storage Ready'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {currentUrl && (
              <a
                href={currentUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-800 text-purple-700 dark:text-purple-300 hover:bg-white text-[9px] font-bold flex items-center gap-1 shadow-3xs"
                title="Preview Uploaded File"
              >
                <Eye className="w-3 h-3" />
                <span>View</span>
              </a>
            )}
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-200 text-[9px] font-bold"
              title="Remove File"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-3 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center relative overflow-hidden ${
            isDragging
              ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40'
              : isDark
              ? 'border-slate-700 hover:border-purple-500 bg-slate-800/40 hover:bg-slate-800'
              : 'border-slate-200 hover:border-purple-400 bg-slate-50/80 hover:bg-purple-50/40'
          }`}
        >
          {uploading ? (
            <div className="py-2 flex flex-col items-center justify-center gap-1 text-purple-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-[10px] font-bold">Uploading to Supabase Storage...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                <Upload className="w-4 h-4" />
              </div>
              <p className="text-[10.5px] font-extrabold text-slate-700 dark:text-slate-200">
                Click to browse or drop file here
              </p>
              <p className="text-[8.5px] text-slate-400 font-medium">
                {helperText || `Supports PDF, JPG, PNG up to 10MB (${accept})`}
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1 text-rose-600 text-[9px] font-bold mt-1">
          <AlertCircle className="w-3 h-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
