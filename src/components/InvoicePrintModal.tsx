import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Building2, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  FileText,
  CreditCard,
  QrCode
} from 'lucide-react';
import { Invoice, Society, Member, Payment } from '../types';
import { convertNumberToIndianRupees } from '../utils/numberToWords';

interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  society: Society;
  member?: Member;
  payment?: Payment;
  theme?: 'dark' | 'light';
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  isOpen,
  onClose,
  invoice,
  society,
  member,
  payment,
  theme = 'dark'
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !invoice) return null;

  const isPaid = invoice.Status === 'Paid';
  const isGstEnabled = society.ModuleSettings?.billing?.enableGST || false;
  const gstRatePercent = society.ModuleSettings?.billing?.gstRatePercent || 18;

  // Breakdown calculations
  const baseCharge = invoice.BaseAmount || (invoice.AreaSqFtUsed ? (invoice.AreaSqFtUsed * (society.RatePerSqFt || 3.5)) : (society.FlatRateAmount || 2500));
  const sinkingFund = Math.round(baseCharge * 0.15); // Standard 15% sinking fund
  const waterCharges = invoice.WaterCharges || 150;
  const securityCharges = invoice.SecurityCharges || 500;
  const parkingCharges = invoice.ParkingCharges || 0;
  const lateFeeCharges = invoice.LateFeeCharges || 0;

  const subtotalBeforeTax = baseCharge + sinkingFund + waterCharges + securityCharges + parkingCharges + lateFeeCharges;
  
  const sgstAmount = isGstEnabled ? Math.round((subtotalBeforeTax * (gstRatePercent / 2)) / 100) : 0;
  const cgstAmount = isGstEnabled ? Math.round((subtotalBeforeTax * (gstRatePercent / 2)) / 100) : 0;
  const totalAmountCalculated = invoice.TotalAmount || (subtotalBeforeTax + sgstAmount + cgstAmount);

  const amountInWords = convertNumberToIndianRupees(totalAmountCalculated);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Container Card */}
      <div className="w-full max-w-3xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 print:my-0 print:shadow-none print:border-none print:rounded-none">
        
        {/* Modal Action Bar (Hidden during printing) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-sm">Official Society Tax Invoice & Receipt</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Content Area */}
        <div ref={printRef} className="p-8 space-y-6 print:p-6 bg-white" id="invoice-print-area">
          
          {/* Header Section: Society Credentials & Logo */}
          <div className="border-b-2 border-slate-900 pb-5 flex items-start justify-between">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-purple-900 text-white flex items-center justify-center font-black text-lg">
                  {society.Name ? society.Name.charAt(0) : 'S'}
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight uppercase">
                    {society.Name || 'Housing Society Ltd.'}
                  </h1>
                  <p className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
                    Co-Operative Housing Society Ltd. • Reg No: MUM/HSG/12345/2021
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 pt-1 leading-relaxed">
                {society.PostalAddress || '123 Greenwood Road, Sector 5, Mumbai, MH - 400001'}
              </p>

              <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono pt-1">
                {society.GSTIN && <span>GSTIN: <strong className="text-slate-800">{society.GSTIN}</strong></span>}
                <span>PAN: <strong className="text-slate-800">AAACG1234H</strong></span>
                {society.SocietyCode && <span>Code: <strong className="text-slate-800">{society.SocietyCode}</strong></span>}
              </div>
            </div>

            {/* Official Status Badge & Seal Placeholder */}
            <div className="text-right space-y-2 flex-shrink-0">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                isPaid 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                  : 'bg-rose-100 text-rose-800 border-rose-300'
              }`}>
                {isPaid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-rose-600" />}
                <span>{isPaid ? 'PAID & RECEIPTED' : 'UNPAID / OUTSTANDING'}</span>
              </div>

              <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-full flex flex-col items-center justify-center text-center p-1 text-[9px] font-extrabold text-slate-400 uppercase tracking-tighter mx-auto print:border-slate-400">
                <span>OFFICIAL</span>
                <span>SOCIETY</span>
                <span>SEAL</span>
              </div>
            </div>
          </div>

          {/* Invoice Document Title Banner */}
          <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase text-slate-800 tracking-wider">
              TAX INVOICE & MAINTENANCE BILL RECEIPT
            </h2>
            <span className="text-xs font-mono font-bold text-slate-600">
              Bill No: <span className="text-purple-700">{invoice.id || 'INV-202607-101'}</span>
            </span>
          </div>

          {/* Metadata Grid (Invoice Meta & Member Info) */}
          <div className="grid grid-cols-2 gap-6 text-xs">
            {/* Left: Member & Flat Info */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <h3 className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider text-purple-800 border-b border-slate-200 pb-1">
                Billed To (Unit Details)
              </h3>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500 font-semibold">Flat No:</span>
                <span className="col-span-2 font-bold text-slate-900">{invoice.FlatNo || member?.FlatNo || '101'}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500 font-semibold">Owner Name:</span>
                <span className="col-span-2 font-bold text-slate-900">{invoice.OwnerName || member?.OwnerName || 'Amit Sharma'}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500 font-semibold">Wing / Tower:</span>
                <span className="col-span-2 font-medium text-slate-800">{member?.Wing || 'Wing A'}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500 font-semibold">Carpet Area:</span>
                <span className="col-span-2 font-medium text-slate-800">{invoice.AreaSqFtUsed || member?.AreaSqFt || 850} SqFt</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500 font-semibold">Contact:</span>
                <span className="col-span-2 font-mono text-slate-800">{member?.ContactNo || '+91 98765 43210'}</span>
              </div>
            </div>

            {/* Right: Invoice Billing Meta */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <h3 className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider text-purple-800 border-b border-slate-200 pb-1">
                Billing Cycle Metadata
              </h3>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500 font-semibold">Bill Month:</span>
                <span className="col-span-2 font-bold text-slate-900">{invoice.BillMonth || 'July 2026'}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500 font-semibold">Issued Date:</span>
                <span className="col-span-2 font-mono text-slate-800">{invoice.IssuedDate || '01-Jul-2026'}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500 font-semibold">Payment Cutoff:</span>
                <span className="col-span-2 font-mono text-slate-800 text-rose-700 font-bold">{invoice.DueDate || '15-Jul-2026'}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500 font-semibold">Calculation Mode:</span>
                <span className="col-span-2 font-semibold text-slate-800">{invoice.BillingModeUsed || society.BillingMode || 'SqFt Rate'}</span>
              </div>
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-2.5 w-12 text-center">#</th>
                  <th className="p-2.5">Particulars / Charge Description</th>
                  <th className="p-2.5 text-center">Calculation Basis</th>
                  <th className="p-2.5 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                <tr>
                  <td className="p-2.5 text-center font-mono text-slate-500">1</td>
                  <td className="p-2.5 font-bold">Base Society Maintenance Charge</td>
                  <td className="p-2.5 text-center font-mono text-slate-500">
                    {society.BillingMode === 'Flat Rate' ? 'Fixed Flat Rate' : `₹${society.RatePerSqFt || 3.5}/SqFt × ${invoice.AreaSqFtUsed || member?.AreaSqFt || 850}`}
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold">₹{baseCharge.toLocaleString('en-IN')}</td>
                </tr>

                <tr>
                  <td className="p-2.5 text-center font-mono text-slate-500">2</td>
                  <td className="p-2.5">Sinking Fund & Major Repair Reserve (15%)</td>
                  <td className="p-2.5 text-center font-mono text-slate-500">Statutory Bye-Law 13(a)</td>
                  <td className="p-2.5 text-right font-mono">₹{sinkingFund.toLocaleString('en-IN')}</td>
                </tr>

                <tr>
                  <td className="p-2.5 text-center font-mono text-slate-500">3</td>
                  <td className="p-2.5">Sub-Metered Water Consumption Charges</td>
                  <td className="p-2.5 text-center font-mono text-slate-500">Actual Meter Usage</td>
                  <td className="p-2.5 text-right font-mono">₹{waterCharges.toLocaleString('en-IN')}</td>
                </tr>

                <tr>
                  <td className="p-2.5 text-center font-mono text-slate-500">4</td>
                  <td className="p-2.5">Security, Common Electricity & Housekeeping</td>
                  <td className="p-2.5 text-center font-mono text-slate-500">Equal Apportionment</td>
                  <td className="p-2.5 text-right font-mono">₹{securityCharges.toLocaleString('en-IN')}</td>
                </tr>

                {parkingCharges > 0 && (
                  <tr>
                    <td className="p-2.5 text-center font-mono text-slate-500">5</td>
                    <td className="p-2.5">Designated Parking Slot Charge</td>
                    <td className="p-2.5 text-center font-mono text-slate-500">Vehicle Slot A-101</td>
                    <td className="p-2.5 text-right font-mono">₹{parkingCharges.toLocaleString('en-IN')}</td>
                  </tr>
                )}

                {lateFeeCharges > 0 && (
                  <tr className="bg-rose-50/50">
                    <td className="p-2.5 text-center font-mono text-rose-500">6</td>
                    <td className="p-2.5 font-bold text-rose-700">Overdue Late Fee Interest Penalty</td>
                    <td className="p-2.5 text-center font-mono text-rose-600">{society.LateFeeValue || 12}% p.a. Pro-rata</td>
                    <td className="p-2.5 text-right font-mono font-bold text-rose-700">₹{lateFeeCharges.toLocaleString('en-IN')}</td>
                  </tr>
                )}

                {isGstEnabled && (
                  <>
                    <tr className="bg-slate-50 font-mono">
                      <td className="p-2.5 text-center text-slate-500">7</td>
                      <td className="p-2.5 font-semibold">State GST (SGST @ 9%)</td>
                      <td className="p-2.5 text-center text-slate-500">9.00%</td>
                      <td className="p-2.5 text-right">₹{sgstAmount.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr className="bg-slate-50 font-mono">
                      <td className="p-2.5 text-center text-slate-500">8</td>
                      <td className="p-2.5 font-semibold">Central GST (CGST @ 9%)</td>
                      <td className="p-2.5 text-center text-slate-500">9.00%</td>
                      <td className="p-2.5 text-right">₹{cgstAmount.toLocaleString('en-IN')}</td>
                    </tr>
                  </>
                )}
              </tbody>

              {/* Total Row */}
              <tfoot className="bg-slate-900 text-white font-extrabold">
                <tr>
                  <td colSpan={3} className="p-3 text-right uppercase tracking-wider text-xs">
                    Total Payable Maintenance Amount:
                  </td>
                  <td className="p-3 text-right text-sm font-mono text-emerald-400">
                    ₹{totalAmountCalculated.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Total Amount In Words */}
          <div className="p-3 rounded-lg bg-slate-100 border border-slate-300 text-xs font-semibold text-slate-800">
            <span className="text-slate-500 font-bold uppercase text-[10px] block tracking-wider">Amount in Words:</span>
            <span className="text-purple-900 font-bold text-sm tracking-wide">{amountInWords}</span>
          </div>

          {/* Payment Settlement Box (If Paid) */}
          {isPaid && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <span className="font-extrabold uppercase text-xs tracking-wider flex items-center gap-1.5 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Payment Settlement Clearance Certificate</span>
                </span>
                <span className="text-xs font-mono font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded">
                  CLEARED & SETTLED
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <span className="text-emerald-700 block text-[10px] font-sans font-semibold">Payment Mode:</span>
                  <strong className="text-slate-900">{payment?.Mode || 'UPI / Online'}</strong>
                </div>
                <div>
                  <span className="text-emerald-700 block text-[10px] font-sans font-semibold">Transaction / Ref ID:</span>
                  <strong className="text-slate-900">{payment?.ReferenceNo || 'UPI/618293049182'}</strong>
                </div>
                <div>
                  <span className="text-emerald-700 block text-[10px] font-sans font-semibold">Settled Date:</span>
                  <strong className="text-slate-900">{payment?.Date || '05-Jul-2026'}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Bank / UPI Payment Remittance Details (If Unpaid) */}
          {!isPaid && (
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-purple-900">
                  Direct Bank Remittance / UPI QR Payment
                </h4>
                <p className="text-xs font-mono text-purple-800">
                  UPI ID: <strong className="text-slate-900">{society.UPI_ID || 'greenwood.society@upi'}</strong>
                </p>
                <p className="text-[11px] text-purple-700">
                  Bank: HDFC Bank • A/C: 501002938401 • IFSC: HDFC0000123
                </p>
              </div>
              <div className="p-2 bg-white rounded-lg border border-purple-200 shadow-sm flex flex-col items-center">
                <QrCode className="w-10 h-10 text-purple-900" />
                <span className="text-[9px] font-mono font-bold text-slate-600 mt-1">SCAN TO PAY</span>
              </div>
            </div>
          )}

          {/* Terms & Signatures Block */}
          <div className="pt-6 grid grid-cols-2 gap-8 border-t border-slate-300 text-xs">
            {/* Notes */}
            <div className="text-[11px] text-slate-500 space-y-1 leading-relaxed">
              <p className="font-bold text-slate-700 uppercase text-[10px]">Important Terms & Disclaimers:</p>
              <p>1. Please pay on or before the due date ({invoice.DueDate || '15-Jul-2026'}) to avoid late interest fees.</p>
              <p>2. Cheques subject to realization. Computer-generated receipt requires no physical signature when stamped digitally.</p>
            </div>

            {/* Signatures */}
            <div className="flex items-end justify-between pt-8 text-center text-xs">
              <div className="space-y-1">
                <div className="w-32 border-b border-slate-400 mx-auto" />
                <p className="font-bold text-slate-900 text-[11px]">Hon. Treasurer</p>
                <p className="text-[9px] text-slate-500">Managing Committee</p>
              </div>

              <div className="space-y-1">
                <div className="w-32 border-b border-slate-400 mx-auto" />
                <p className="font-bold text-slate-900 text-[11px]">Hon. Secretary</p>
                <p className="text-[9px] text-slate-500">Managing Committee</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default InvoicePrintModal;
