import React, { useState, useEffect } from 'react';
import { Camera, QrCode, X, CheckCircle2, XCircle, AlertCircle, RefreshCw, Zap, UserCheck, Search, ShieldCheck } from 'lucide-react';
import { Visitor } from '../types';

interface GatekeeperQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  visitors: Visitor[];
  onCheckInVisitor: (visitorId: string) => void;
  theme?: 'light' | 'dark';
}

export const GatekeeperQrScannerModal: React.FC<GatekeeperQrScannerModalProps> = ({
  isOpen,
  onClose,
  visitors,
  onCheckInVisitor,
  theme = 'dark'
}) => {
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(true);
  const [scanResult, setScanResult] = useState<{
    status: 'valid' | 'invalid' | 'expired' | 'already_checked_in';
    visitor?: Visitor;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsScanning(true);
      setScanResult(null);
      setManualCode('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulateScan = (visitor: Visitor) => {
    setIsScanning(false);

    if (visitor.Status === 'Checked In') {
      setScanResult({
        status: 'already_checked_in',
        visitor,
        message: `${visitor.VisitorName} is already checked in to Flat ${visitor.FlatNo}.`
      });
      return;
    }

    if (visitor.Status === 'Denied') {
      setScanResult({
        status: 'invalid',
        visitor,
        message: `PASS DENIED by Resident for Flat ${visitor.FlatNo}. Do NOT allow entry!`
      });
      return;
    }

    // Check pass validity / status
    setScanResult({
      status: 'valid',
      visitor,
      message: `VALID GUEST PASS — Entry Approved for Flat ${visitor.FlatNo}`
    });
  };

  const handleManualSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    const matched = visitors.find(v => 
      v.id.toLowerCase() === manualCode.trim().toLowerCase() ||
      v.VisitorName.toLowerCase().includes(manualCode.trim().toLowerCase()) ||
      v.ContactNo.includes(manualCode.trim()) ||
      v.FlatNo === manualCode.trim()
    );

    if (matched) {
      handleSimulateScan(matched);
    } else {
      setIsScanning(false);
      setScanResult({
        status: 'invalid',
        message: `NO MATCHING VISITOR RECORD FOUND for token/code "${manualCode}"`
      });
    }
  };

  const handleConfirmEntry = () => {
    if (scanResult?.visitor) {
      onCheckInVisitor(scanResult.visitor.id);
    }
    setScanResult(null);
    setIsScanning(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4 overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Camera className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">Gatekeeper QR Scanner</h3>
              <p className="text-[11px] text-slate-400">Scan Resident Pre-Approved Visitor Passes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewport Simulator */}
        <div className="relative aspect-square w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center">
          {/* Simulated Camera Feed Grid Lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

          {/* Scanning Reticle Frame */}
          <div className="relative w-56 h-56 border-2 border-emerald-500/60 rounded-2xl flex flex-col items-center justify-center p-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            {/* Top-left Corner Marker */}
            <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

            {/* Scanning Laser Line */}
            {isScanning && (
              <div className="absolute left-2 right-2 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-bounce" />
            )}

            <QrCode className="w-20 h-20 text-emerald-400/40" />
            <span className="text-[10px] text-emerald-400 font-mono mt-2 animate-pulse">
              {isScanning ? 'ALIGN QR CODE IN FRAME' : 'SCAN PAUSED'}
            </span>
          </div>

          <div className="absolute top-3 left-3 bg-black/60 px-2.5 py-1 rounded-full text-[10px] font-mono text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>EXPO CAMERA LIVE (1080p)</span>
          </div>
        </div>

        {/* Scan Result Overlay / Verification Modal */}
        {scanResult && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 animate-fade-in">
            {scanResult.status === 'valid' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                  <span>{scanResult.message}</span>
                </div>

                {scanResult.visitor && (
                  <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Visitor:</span>
                      <span className="font-bold text-slate-100">{scanResult.visitor.VisitorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Destination Flat:</span>
                      <span className="font-bold text-emerald-400">Flat {scanResult.visitor.FlatNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Purpose:</span>
                      <span className="text-slate-200">{scanResult.visitor.Purpose}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Phone:</span>
                      <span className="text-slate-200">{scanResult.visitor.ContactNo}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setIsScanning(true)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Rescan
                  </button>
                  <button
                    onClick={handleConfirmEntry}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm Gate Entry</span>
                  </button>
                </div>
              </div>
            )}

            {(scanResult.status === 'invalid' || scanResult.status === 'already_checked_in') && (
              <div className="space-y-3">
                <div className={`flex items-center gap-2 font-bold text-sm ${scanResult.status === 'already_checked_in' ? 'text-amber-400' : 'text-rose-400'}`}>
                  {scanResult.status === 'already_checked_in' ? (
                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 flex-shrink-0" />
                  )}
                  <span>{scanResult.message}</span>
                </div>

                <button
                  onClick={() => setIsScanning(true)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
                >
                  Back to Scanner
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick Simulator Test Tokens */}
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Simulate Quick Scans (Registered Pass Tokens)
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {visitors.slice(0, 3).map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => handleSimulateScan(v)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-500/50 rounded-xl text-slate-200 whitespace-nowrap transition-colors"
              >
                <Zap className="w-3 h-3 text-emerald-400" />
                <span>{v.VisitorName.split(' ')[0]} (Flat {v.FlatNo})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Pass Code Search */}
        <form onSubmit={handleManualSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Enter Flat No / Pass Token / Phone"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
          >
            Validate
          </button>
        </form>
      </div>
    </div>
  );
};

export default GatekeeperQrScannerModal;
