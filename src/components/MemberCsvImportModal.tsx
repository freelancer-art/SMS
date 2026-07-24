import React, { useState } from 'react';
import { Member } from '../types';
import { Upload, Download, FileText, CheckCircle2, AlertCircle, X, Users, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface MemberCsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportMembers: (newMembers: Member[]) => void;
  existingMembers: Member[];
  activeSocietyId: string;
  wingsList?: string[];
  isDark?: boolean;
}

interface ParsedCsvRow {
  FlatNo: string;
  OwnerName: string;
  ContactNo: string;
  Email: string;
  Wing: string;
  FlatType: string;
  AreaSqFt: number;
  OccupancyStatus: 'Owner' | 'Tenant' | 'Vacant';
  InitialBalance: number;
  isValid: boolean;
  validationError?: string;
}

export const MemberCsvImportModal: React.FC<MemberCsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportMembers,
  existingMembers = [],
  activeSocietyId,
  wingsList = ['A', 'B', 'C'],
  isDark = false,
}) => {
  const [parsedRows, setParsedRows] = useState<ParsedCsvRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSummary, setImportSummary] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Download CSV Sample Template
  const handleDownloadTemplate = () => {
    const headers = 'FlatNo,OwnerName,ContactNo,Email,Wing,FlatType,AreaSqFt,OccupancyStatus,InitialBalance';
    const sampleRows = [
      'A-101,Rajesh Sharma,+91 9876543210,rajesh.sharma@example.com,A,2BHK,1200,Owner,0',
      'A-102,Priya Varma,+91 9876543211,priya.v@example.com,A,3BHK,1500,Tenant,2500',
      'B-201,Amit Patel,+91 9876543212,amit.patel@example.com,B,2BHK,1150,Owner,0',
      'B-202,Sneha Gupta,+91 9876543213,sneha.g@example.com,B,3BHK,1450,Owner,1200'
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...sampleRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'society_members_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Parse CSV File Content
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setImportSummary(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        setIsProcessing(false);
        return;
      }

      const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        setImportSummary('CSV file must contain a header row and at least one member data row.');
        setIsProcessing(false);
        return;
      }

      // Parse headers
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      
      const rows: ParsedCsvRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        if (values.length < 2) continue;

        // Map columns based on standard index or header search
        const getVal = (colName: string, defaultIdx: number) => {
          const idx = headers.findIndex(h => h.toLowerCase() === colName.toLowerCase());
          const targetIdx = idx !== -1 ? idx : defaultIdx;
          return values[targetIdx] || '';
        };

        const flatNo = getVal('FlatNo', 0).trim();
        const ownerName = getVal('OwnerName', 1).trim();
        const contactNo = getVal('ContactNo', 2).trim();
        const email = getVal('Email', 3).trim();
        const wing = getVal('Wing', 4).trim() || (flatNo.includes('-') ? flatNo.split('-')[0] : 'A');
        const flatType = getVal('FlatType', 5).trim() || '2BHK';
        const areaSqFt = parseFloat(getVal('AreaSqFt', 6)) || 1200;
        const occupancyRaw = getVal('OccupancyStatus', 7).trim();
        const occupancyStatus: 'Owner' | 'Tenant' | 'Vacant' =
          occupancyRaw.toLowerCase().includes('tenant') ? 'Tenant' : 'Owner';
        const initialBalance = parseFloat(getVal('InitialBalance', 8)) || 0;

        // Validation
        let isValid = true;
        let validationError = '';

        if (!flatNo) {
          isValid = false;
          validationError = 'Missing Flat No';
        } else if (!ownerName) {
          isValid = false;
          validationError = 'Missing Owner Name';
        } else {
          // Check for duplicate in existing society members
          const isDuplicate = existingMembers.some(
            m => m.SocietyId === activeSocietyId && m.FlatNo.toLowerCase() === flatNo.toLowerCase()
          );
          if (isDuplicate) {
            isValid = false;
            validationError = 'Flat No already exists in society';
          }
        }

        rows.push({
          FlatNo: flatNo,
          OwnerName: ownerName,
          ContactNo: contactNo,
          Email: email,
          Wing: wing,
          FlatType: flatType,
          AreaSqFt: areaSqFt,
          OccupancyStatus: occupancyStatus,
          InitialBalance: initialBalance,
          isValid,
          validationError
        });
      }

      setParsedRows(rows);
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  // 3. Confirm and Commit Import
  const handleCommitImport = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) return;

    const newMemberObjects: Member[] = validRows.map((r) => ({
      id: `MBR-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      SocietyId: activeSocietyId,
      FlatNo: r.FlatNo,
      OwnerName: r.OwnerName,
      ContactNo: r.ContactNo,
      Email: r.Email,
      Wing: r.Wing,
      FlatType: r.FlatType,
      AreaSqFt: r.AreaSqFt,
      Status: r.OccupancyStatus,
      Balance: r.InitialBalance,
      CoOwners: [],
      VehicleNo: ''
    }));

    onImportMembers(newMemberObjects);
    setImportSummary(`Successfully imported ${validRows.length} member records into society directory!`);
    setTimeout(() => {
      onClose();
      setParsedRows([]);
      setFileName('');
      setImportSummary(null);
    }, 1200);
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.filter(r => !r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden transition-all ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-purple-600/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-100">
                Bulk Import Members via CSV
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                Upload CSV directory spreadsheet to onboard residents, flat numbers, and opening balances.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Top Bar: Template Download & File Upload Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Download Template Box */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between ${
              isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-1">
                  Step 1: Download Standard Template
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Get our pre-formatted CSV template file with required headers and example rows.
                </p>
              </div>
              <button
                onClick={handleDownloadTemplate}
                className="mt-3 w-full py-2 px-3 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800/80 hover:border-purple-500 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-3xs cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample CSV</span>
              </button>
            </div>

            {/* Upload Box */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between ${
              isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
                  Step 2: Upload Completed CSV
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed truncate">
                  {fileName ? `File selected: ${fileName}` : 'Drag & drop or select your CSV file to preview.'}
                </p>
              </div>
              <label className="mt-3 w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95">
                <Upload className="w-3.5 h-3.5" />
                <span>Select CSV File</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Success Banner */}
          {importSummary && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{importSummary}</span>
            </div>
          )}

          {/* Parsed CSV Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Data Mapping Preview ({parsedRows.length} rows)
                </span>
                <div className="flex items-center gap-2 text-[10px] font-bold">
                  <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    {validCount} Valid
                  </span>
                  {invalidCount > 0 && (
                    <span className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                      {invalidCount} Invalid/Duplicates
                    </span>
                  )}
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-[220px] overflow-y-auto text-[10px]">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 text-slate-600 dark:text-slate-300 uppercase font-black tracking-wider text-[8px]">
                    <tr>
                      <th className="p-2 border-b border-slate-200 dark:border-slate-700">Status</th>
                      <th className="p-2 border-b border-slate-200 dark:border-slate-700">Flat No</th>
                      <th className="p-2 border-b border-slate-200 dark:border-slate-700">Owner Name</th>
                      <th className="p-2 border-b border-slate-200 dark:border-slate-700">Contact</th>
                      <th className="p-2 border-b border-slate-200 dark:border-slate-700">Opening Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className={row.isValid ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50' : 'bg-rose-50/50 dark:bg-rose-950/20'}>
                        <td className="p-2 font-bold">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" /> Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 truncate max-w-[120px]" title={row.validationError}>
                              <AlertCircle className="w-3 h-3 shrink-0" /> {row.validationError}
                            </span>
                          )}
                        </td>
                        <td className="p-2 font-black text-slate-800 dark:text-slate-100">{row.FlatNo || '-'}</td>
                        <td className="p-2 font-bold text-slate-700 dark:text-slate-300">{row.OwnerName || '-'}</td>
                        <td className="p-2 text-slate-500 dark:text-slate-400">{row.ContactNo || '-'}</td>
                        <td className="p-2 font-extrabold text-slate-800 dark:text-slate-200">₹{row.InitialBalance.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-end items-center gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            disabled={validCount === 0}
            onClick={handleCommitImport}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
              validCount > 0
                ? 'bg-purple-600 hover:bg-purple-700 active:scale-95'
                : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Import {validCount} Valid Residents</span>
          </button>
        </div>
      </div>
    </div>
  );
};
