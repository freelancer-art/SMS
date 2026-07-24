import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Calendar, Mail, Phone, Plus, X, RefreshCw, Send, CheckCircle2, Clock, FileText } from 'lucide-react';
import { VendorContract } from '../types';

interface VendorContractManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  contracts: VendorContract[];
  activeSocietyId: string;
  onAddContract: (contract: Omit<VendorContract, 'id'>) => void;
  onSendRenewalReminder: (contract: VendorContract) => void;
  theme?: 'light' | 'dark';
}

export const VendorContractManagementModal: React.FC<VendorContractManagementModalProps> = ({
  isOpen,
  onClose,
  contracts,
  activeSocietyId,
  onAddContract,
  onSendRenewalReminder,
  theme = 'dark'
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [sentReminderId, setSentReminderId] = useState<string | null>(null);

  // Form states
  const [vendorName, setVendorName] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [annualValue, setAnnualValue] = useState(100000);

  if (!isOpen) return null;

  const societyContracts = contracts.filter(c => !c.SocietyId || c.SocietyId === activeSocietyId);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName || !serviceType || !endDate || !email) return;

    onAddContract({
      SocietyId: activeSocietyId,
      VendorName: vendorName,
      ServiceType: serviceType,
      ContractStartDate: startDate || new Date().toISOString().split('T')[0],
      ContractEndDate: endDate,
      ContactEmail: email,
      ContactPhone: phone,
      AnnualValue: Number(annualValue),
      Status: 'Active'
    });

    setVendorName('');
    setServiceType('');
    setEndDate('');
    setEmail('');
    setPhone('');
    setShowAddModal(false);
  };

  const handleSendReminderClick = (contract: VendorContract) => {
    onSendRenewalReminder(contract);
    setSentReminderId(contract.id);
    setTimeout(() => setSentReminderId(null), 3000);
  };

  const calculateDaysRemaining = (endDateStr: string) => {
    const end = new Date(endDateStr);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl w-full max-w-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-2xl border border-purple-500/30">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100">Vendor AMC Contracts & Renewal Workflow</h3>
              <p className="text-xs text-slate-400">Automated 30-Day Expiry Scanning & Committee Notifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>Active Contracts: <strong className="text-slate-100">{societyContracts.length}</strong></span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add New AMC Contract</span>
          </button>
        </div>

        {/* Contract List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {societyContracts.map((contract) => {
            const daysRemaining = calculateDaysRemaining(contract.ContractEndDate);
            const isExpiringSoon = daysRemaining <= 30 && daysRemaining >= 0;
            const isExpired = daysRemaining < 0;

            return (
              <div
                key={contract.id}
                className={`p-4 rounded-2xl border transition-all duration-200 space-y-3 ${
                  isExpiringSoon
                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-100'
                    : isExpired
                    ? 'bg-rose-950/20 border-rose-500/40 text-rose-100'
                    : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-base text-slate-100">{contract.VendorName}</span>
                      {isExpiringSoon && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500 text-black flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>EXPIRING IN {daysRemaining} DAYS</span>
                        </span>
                      )}
                      {isExpired && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500 text-white">
                          EXPIRED ({Math.abs(daysRemaining)} DAYS AGO)
                        </span>
                      )}
                      {!isExpiringSoon && !isExpired && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          ACTIVE ({daysRemaining} DAYS REMAINING)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-purple-400 font-semibold mt-0.5">{contract.ServiceType}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Annual Value</span>
                    <span className="text-sm font-bold text-slate-100">₹{contract.AnnualValue?.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span>Expires: <strong>{contract.ContractEndDate}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-purple-400" />
                    <span className="truncate">{contract.ContactEmail}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-purple-400" />
                    <span>{contract.ContactPhone || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    Cron Trigger: Auto-scan enabled every 24 hrs
                  </span>

                  <button
                    type="button"
                    onClick={() => handleSendReminderClick(contract)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 rounded-xl text-xs font-semibold transition-all duration-200"
                  >
                    {sentReminderId === contract.id ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Renewal Reminder Sent!</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Automated 30-Day Renewal Reminder</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add AMC Contract Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-bold text-sm text-purple-400">Register New AMC Contract</h4>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Vendor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Otis Elevator India"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Service Type *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lift AMC, Water Tank Disinfection"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Contact Email *</label>
                <input
                  type="email"
                  required
                  placeholder="vendor@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Contact Phone</label>
                <input
                  type="text"
                  placeholder="+91 98200 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Annual Contract Value (₹)</label>
                <input
                  type="number"
                  value={annualValue}
                  onChange={(e) => setAnnualValue(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold"
                >
                  Save Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorContractManagementModal;
