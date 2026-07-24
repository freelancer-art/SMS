import React, { useState, useMemo } from 'react';
import { Member, Invoice, Payment } from '../types';
import { CreditCard, FileText, CheckCircle2, AlertTriangle, Clock, ArrowDownRight, ArrowUpRight, DollarSign, X, Filter, Printer, Calendar } from 'lucide-react';

interface MemberDuesHistoryModalProps {
  member: Member | null;
  invoices: Invoice[];
  payments: Payment[];
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
}

export const MemberDuesHistoryModal: React.FC<MemberDuesHistoryModalProps> = ({
  member,
  invoices = [],
  payments = [],
  isOpen,
  onClose,
  isDark = false,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'invoices' | 'payments' | 'unpaid'>('all');

  if (!isOpen || !member) return null;

  // Filter invoices for this flat
  const flatInvoices = useMemo(() => {
    return invoices.filter(inv => inv.FlatNo === member.FlatNo && (!inv.SocietyId || inv.SocietyId === member.SocietyId));
  }, [invoices, member]);

  // Filter payments for this flat
  const flatPayments = useMemo(() => {
    return payments.filter(p => p.FlatNo === member.FlatNo && (!p.SocietyId || p.SocietyId === member.SocietyId));
  }, [payments, member]);

  // Financial summary numbers
  const totalInvoiced = useMemo(() => {
    return flatInvoices.reduce((sum, inv) => sum + (Number(inv.TotalAmount) || 0), 0);
  }, [flatInvoices]);

  const totalPaid = useMemo(() => {
    return flatPayments.reduce((sum, p) => sum + (Number(p.Amount) || 0), 0);
  }, [flatPayments]);

  const currentOutstanding = member.Balance;

  // Combine invoices and payments chronologically
  const timelineRecords = useMemo(() => {
    const combined: Array<{
      type: 'invoice' | 'payment';
      id: string;
      date: string;
      title: string;
      amount: number;
      status: string;
      details: string;
      raw: Invoice | Payment;
    }> = [];

    flatInvoices.forEach((inv) => {
      combined.push({
        type: 'invoice',
        id: inv.id,
        date: inv.InvoiceDate || inv.BillMonth || '2026-01-01',
        title: `Maintenance Bill: ${inv.BillMonth || 'Regular'}`,
        amount: Number(inv.TotalAmount) || 0,
        status: inv.Status || (inv.TotalAmount > 0 ? 'Unpaid' : 'Paid'),
        details: `Due: ${inv.DueDate || 'End of Month'} • Water: ₹${inv.WaterCharges || 0}`,
        raw: inv,
      });
    });

    flatPayments.forEach((pmt) => {
      combined.push({
        type: 'payment',
        id: pmt.id,
        date: pmt.Date || '2026-01-01',
        title: `Payment Received (${pmt.Mode || 'UPI'})`,
        amount: Number(pmt.Amount) || 0,
        status: pmt.Status || 'Paid',
        details: `Ref: ${pmt.ReferenceNo || pmt.id}`,
        raw: pmt,
      });
    });

    // Sort descending by date
    combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (activeFilter === 'invoices') return combined.filter(r => r.type === 'invoice');
    if (activeFilter === 'payments') return combined.filter(r => r.type === 'payment');
    if (activeFilter === 'unpaid') return combined.filter(r => r.type === 'invoice' && r.status.toLowerCase() !== 'paid');

    return combined;
  }, [flatInvoices, flatPayments, activeFilter]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden transition-all ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-purple-600/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-xs font-black text-xs">
              {member.Wing ? `${member.Wing}-${member.FlatNo}` : member.FlatNo}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100">
                  {member.OwnerName}
                </h3>
                <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {member.Status || 'Owner'}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                Complete Maintenance Dues History & Payment Receipts Ledger
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

        {/* Content Body */}
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Top KPI Summary Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className={`p-3 rounded-xl border ${
              isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Total Billed
              </span>
              <div className="text-sm font-black text-slate-800 dark:text-slate-100">
                ₹{totalInvoiced.toLocaleString()}
              </div>
              <span className="text-[8px] text-slate-400 block font-semibold mt-0.5">
                {flatInvoices.length} invoices issued
              </span>
            </div>

            <div className={`p-3 rounded-xl border ${
              isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-0.5">
                Total Cleared
              </span>
              <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                ₹{totalPaid.toLocaleString()}
              </div>
              <span className="text-[8px] text-slate-400 block font-semibold mt-0.5">
                {flatPayments.length} payment receipts
              </span>
            </div>

            <div className={`p-3 rounded-xl border ${
              currentOutstanding > 0
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
            }`}>
              <span className={`text-[9px] font-bold uppercase tracking-wider block mb-0.5 ${
                currentOutstanding > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                Current Dues Balance
              </span>
              <div className={`text-sm font-black ${
                currentOutstanding > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {currentOutstanding > 0 ? `₹${currentOutstanding.toLocaleString()}` : currentOutstanding < 0 ? `-₹${Math.abs(currentOutstanding).toLocaleString()}` : '₹0 (Cleared)'}
              </div>
              <span className="text-[8px] opacity-80 block font-semibold mt-0.5">
                {currentOutstanding > 0 ? 'Payment Pending' : currentOutstanding < 0 ? 'Prepaid Balance' : 'Fully Settled'}
              </span>
            </div>
          </div>

          {/* Ledger Filter Tabs */}
          <div className="flex justify-between items-center px-0.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Dues & Payments Timeline
            </span>

            <div className="inline-flex p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                  activeFilter === 'all' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('invoices')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                  activeFilter === 'invoices' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Invoices ({flatInvoices.length})
              </button>
              <button
                onClick={() => setActiveFilter('payments')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                  activeFilter === 'payments' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Payments ({flatPayments.length})
              </button>
              <button
                onClick={() => setActiveFilter('unpaid')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                  activeFilter === 'unpaid' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Unpaid Only
              </button>
            </div>
          </div>

          {/* Timeline List */}
          <div className="space-y-2">
            {timelineRecords.length > 0 ? (
              timelineRecords.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className={`p-3 rounded-xl border flex justify-between items-center text-xs transition-colors ${
                    item.type === 'invoice'
                      ? 'bg-slate-50/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                      : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl shrink-0 ${
                      item.type === 'invoice'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                    }`}>
                      {item.type === 'invoice' ? <FileText className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-100">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.date} • {item.details}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`font-black text-sm block ${
                      item.type === 'invoice' ? 'text-slate-800 dark:text-slate-100' : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {item.type === 'invoice' ? `₹${item.amount.toLocaleString()}` : `+₹${item.amount.toLocaleString()}`}
                    </span>
                    <span className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-sm inline-block mt-0.5 ${
                      item.status.toLowerCase() === 'paid'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 text-xs">
                No ledger timeline records found for this filter.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-between items-center">
          <span className="text-[10px] text-slate-400 font-semibold">
            Member ID: {member.id}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-extrabold bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-xs cursor-pointer active:scale-95"
          >
            Close Statement
          </button>
        </div>
      </div>
    </div>
  );
};
