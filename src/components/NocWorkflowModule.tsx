import React, { useState } from 'react';
import { NocRequest, Society } from '../types';
import { 
  FileCheck, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  Download, 
  Printer, 
  DollarSign, 
  ArrowRight,
  Sparkles,
  Building,
  UserCheck,
  FileText
} from 'lucide-react';

interface NocWorkflowModuleProps {
  nocRequests?: NocRequest[];
  society?: Society;
  activeRole?: string;
  userRole?: string;
  activeSocietyId?: string;
  enabledModules?: any;
  isDark?: boolean;
  societyName?: string;
  activeFlatNo?: string;
  activeUserName?: string;
  onApplyNoc?: (newRequest: Partial<NocRequest>) => void;
  onTreasurerApprove?: (nocId: string, treasurerName: string) => void;
  onSecretaryIssue?: (nocId: string, secretaryName: string) => void;
  onRejectNoc?: (nocId: string, reason: string) => void;
  onToggleRefund?: (nocId: string, refunded: boolean) => void;
}

export const NocWorkflowModule: React.FC<NocWorkflowModuleProps> = ({
  nocRequests: propNocRequests,
  society,
  activeRole,
  userRole = 'Admin',
  activeSocietyId = 'greenwood',
  isDark = false,
  societyName = 'Housing Society',
  activeFlatNo = '101',
  activeUserName = 'Amit Sharma',
  onApplyNoc,
  onTreasurerApprove,
  onSecretaryIssue,
  onRejectNoc,
  onToggleRefund
}) => {
  const effectiveRole = activeRole || userRole;
  const [localRequests, setLocalRequests] = useState<NocRequest[]>(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('society_noc_requests_list') : null;
    return saved ? JSON.parse(saved) : (propNocRequests || [
      {
        id: 'NOC-101',
        SocietyId: activeSocietyId,
        FlatNo: 'A-101',
        ApplicantName: 'Rajesh Sharma',
        ApplicantEmail: 'rajesh@example.com',
        ApplicantPhone: '+91 98765 43210',
        RequestType: 'move_in',
        ShiftDate: '2026-08-01',
        MoveDepositAmount: 5000,
        DepositRefunded: false,
        Status: 'pending',
        Remarks: 'Move-in request for Flat A-101',
        CreatedAt: new Date().toISOString()
      },
      {
        id: 'NOC-102',
        SocietyId: activeSocietyId,
        FlatNo: 'A-102',
        ApplicantName: 'Priya Patel',
        ApplicantEmail: 'priya@example.com',
        ApplicantPhone: '+91 98765 11223',
        RequestType: 'move_out',
        ShiftDate: '2026-08-05',
        MoveDepositAmount: 5000,
        DepositRefunded: false,
        Status: 'treasurer_approved',
        TreasurerApprovedBy: 'Treasurer (Amit)',
        TreasurerApprovedAt: new Date().toISOString(),
        Remarks: 'Move-out request. Dues clear.',
        CreatedAt: new Date().toISOString()
      }
    ]);
  });

  const nocRequests = propNocRequests || localRequests;
  const [filterType, setFilterType] = useState<'all' | 'move_in' | 'move_out'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'treasurer_approved' | 'issued' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<NocRequest | null>(null);
  const [rejectionModalId, setRejectionModalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Apply Form State
  const [requestType, setRequestType] = useState<'move_in' | 'move_out'>('move_in');
  const [flatNoInput, setFlatNoInput] = useState(activeFlatNo);
  const [applicantNameInput, setApplicantNameInput] = useState(activeUserName);
  const [applicantEmailInput, setApplicantEmailInput] = useState('resident@example.com');
  const [applicantPhoneInput, setApplicantPhoneInput] = useState('+91 98765 43210');
  const [shiftDateInput, setShiftDateInput] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const [depositAmountInput, setDepositAmountInput] = useState(5000);
  const [remarksInput, setRemarksInput] = useState('');

  const isTreasurer = effectiveRole === 'TREASURER' || effectiveRole === 'SOCIETY_ADMIN' || effectiveRole === 'Admin' || effectiveRole === 'Committee Member';
  const isSecretary = effectiveRole === 'SECRETARY' || effectiveRole === 'SOCIETY_ADMIN' || effectiveRole === 'Admin' || effectiveRole === 'Committee Member';

  const filteredRequests = nocRequests.filter(req => {
    const matchesSearch = req.FlatNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          req.ApplicantName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || req.RequestType === filterType;
    const matchesStatus = filterStatus === 'all' || req.Status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantNameInput || !flatNoInput || !shiftDateInput) return;

    onApplyNoc({
      FlatNo: flatNoInput,
      ApplicantName: applicantNameInput,
      ApplicantEmail: applicantEmailInput,
      ApplicantPhone: applicantPhoneInput,
      RequestType: requestType,
      ShiftDate: shiftDateInput,
      MoveDepositAmount: Number(depositAmountInput) || 5000,
      DepositRefunded: false,
      Status: 'pending',
      Remarks: remarksInput || `${requestType === 'move_in' ? 'Move-In' : 'Move-Out'} NOC requested for Flat ${flatNoInput}`,
      CreatedAt: new Date().toISOString()
    });

    setShowApplyModal(false);
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionModalId || !rejectionReason) return;
    onRejectNoc(rejectionModalId, rejectionReason);
    setRejectionModalId(null);
    setRejectionReason('');
  };

  return (
    <div id="noc-workflow-module" className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <FileCheck className="w-64 h-64 text-indigo-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-indigo-500/30">
              <Building className="w-3.5 h-3.5" /> Society Move-In / Move-Out Clearance
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              NOC Approval Workflow & Certificate Generator
            </h1>
            <p className="text-indigo-100/80 text-sm mt-1 max-w-2xl">
              Sequential approval queue: Treasurer verifies dues & move deposit, Secretary issues final signed NOC certificate.
            </p>
          </div>

          <button
            onClick={() => setShowApplyModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 font-medium text-sm transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" /> Apply for NOC
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Pending Dues Check</p>
            <p className="text-xl font-bold text-amber-600 mt-1">
              {nocRequests.filter(r => r.Status === 'pending').length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Treasurer Cleared</p>
            <p className="text-xl font-bold text-blue-600 mt-1">
              {nocRequests.filter(r => r.Status === 'treasurer_approved').length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">NOC Issued</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              {nocRequests.filter(r => r.Status === 'issued').length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Move Deposits Held</p>
            <p className="text-xl font-bold text-slate-900 mt-1">
              ₹{nocRequests.filter(r => r.Status === 'issued' && !r.DepositRefunded).reduce((sum, r) => sum + (r.MoveDepositAmount || 0), 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by flat number or applicant..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as any)}
              className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-700 font-medium focus:outline-none"
            >
              <option value="all">All Request Types</option>
              <option value="move_in">Move-In NOC</option>
              <option value="move_out">Move-Out NOC</option>
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-700 font-medium focus:outline-none"
            >
              <option value="all">All Approval Statuses</option>
              <option value="pending">Pending Dues Review</option>
              <option value="treasurer_approved">Treasurer Cleared</option>
              <option value="issued">NOC Certificate Issued</option>
              <option value="rejected">Rejected / Hold</option>
            </select>
          </div>
        </div>

        {/* List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3">Ref ID & Flat</th>
                <th className="p-3">Applicant Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Shift Date</th>
                <th className="p-3">Deposit & Dues</th>
                <th className="p-3">Workflow Status</th>
                <th className="p-3 text-right">Actions / Approvals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">No NOC requests match the selected filters.</td>
                </tr>
              ) : (
                filteredRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono">
                      <span className="font-bold text-slate-900 block">{req.id}</span>
                      <span className="text-[11px] text-slate-500">Flat #{req.FlatNo}</span>
                    </td>
                    <td className="p-3">
                      <strong className="text-slate-900 block">{req.ApplicantName}</strong>
                      <span className="text-[11px] text-slate-500">{req.ApplicantPhone}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        req.RequestType === 'move_in' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.RequestType === 'move_in' ? 'Move-In' : 'Move-Out'}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-medium">{req.ShiftDate}</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900">₹{req.MoveDepositAmount?.toLocaleString('en-IN')}</span>
                      <span className="block text-[10px] text-slate-400">
                        {req.DepositRefunded ? 'Refunded' : 'Deposit Held'}
                      </span>
                    </td>
                    <td className="p-3">
                      {req.Status === 'pending' && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold text-[11px] inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Step 1: Pending Treasurer Review
                        </span>
                      )}
                      {req.Status === 'treasurer_approved' && (
                        <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold text-[11px] inline-flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> Step 2: Treasurer Approved (Awaiting Secretary)
                        </span>
                      )}
                      {req.Status === 'issued' && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> NOC Certificate Issued
                        </span>
                      )}
                      {req.Status === 'rejected' && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-semibold text-[11px] inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-right space-x-2">
                      {/* Step 1: Treasurer Approval */}
                      {req.Status === 'pending' && isTreasurer && (
                        <button
                          onClick={() => onTreasurerApprove(req.id, activeUserName || 'Vikram Singh (Treasurer)')}
                          className="px-2.5 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-[11px] font-bold"
                        >
                          Approve Deposit & Dues
                        </button>
                      )}

                      {/* Step 2: Secretary Final Issuance */}
                      {req.Status === 'treasurer_approved' && isSecretary && (
                        <button
                          onClick={() => onSecretaryIssue(req.id, activeUserName || 'Amit Sharma (Secretary)')}
                          className="px-2.5 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 text-[11px] font-bold"
                        >
                          Issue Official NOC
                        </button>
                      )}

                      {/* Reject Option for Committee */}
                      {(req.Status === 'pending' || req.Status === 'treasurer_approved') && (isTreasurer || isSecretary) && (
                        <button
                          onClick={() => setRejectionModalId(req.id)}
                          className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 text-[11px] font-semibold border border-rose-200"
                        >
                          Reject
                        </button>
                      )}

                      {/* Download/Print Official Certificate */}
                      {req.Status === 'issued' && (
                        <button
                          onClick={() => setSelectedCertificate(req)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-[11px] font-bold shadow-sm"
                        >
                          <FileText className="w-3.5 h-3.5" /> View / Download NOC
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: NOC Certificate Print View */}
      {selectedCertificate && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 text-slate-900 space-y-6 relative my-8">
            <button 
              onClick={() => setSelectedCertificate(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg font-bold"
            >
              ✕
            </button>

            {/* Official Letterhead */}
            <div className="border-b-2 border-slate-900 pb-6 text-center space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-1">
                Official Document
              </div>
              <h2 className="text-2xl font-black uppercase tracking-wide text-slate-900">{society.Name || 'Greenwood Residency Cooperative Housing Society'}</h2>
              <p className="text-xs text-slate-500">{society.PostalAddress || 'Plot No. 42, Sector 15, Palm Beach Road, Navi Mumbai - 400706'}</p>
              <p className="text-xs text-slate-400 font-mono">Reg No: MUM/HSG/2018/109282 • Society Code: {society.SocietyCode || 'GWRES01'}</p>
            </div>

            {/* NOC Header */}
            <div className="text-center space-y-1">
              <h3 className="text-xl font-extrabold uppercase text-indigo-900 tracking-wider">NO OBJECTION CERTIFICATE (NOC)</h3>
              <p className="text-xs font-mono text-slate-500">Certificate Ref: NOC-{selectedCertificate.id} • Issued Date: {new Date(selectedCertificate.SecretaryApprovedAt || Date.now()).toLocaleDateString()}</p>
            </div>

            {/* Certificate Body */}
            <div className="text-sm leading-relaxed text-slate-800 space-y-4 bg-slate-50/80 p-6 rounded-2xl border border-slate-200">
              <p>
                This is to certify that <strong>{society.Name}</strong> has <strong>NO OBJECTION</strong> regarding the proposed {selectedCertificate.RequestType === 'move_in' ? 'Move-In' : 'Move-Out'} shift for:
              </p>

              <div className="grid grid-cols-2 gap-4 text-xs bg-white p-4 rounded-xl border border-slate-200 font-mono">
                <div>
                  <span className="text-slate-400 block uppercase">Flat Number</span>
                  <strong className="text-slate-900 text-base">#{selectedCertificate.FlatNo}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase">Applicant Name</span>
                  <strong className="text-slate-900 text-base">{selectedCertificate.ApplicantName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase">Scheduled Shift Date</span>
                  <strong className="text-indigo-700">{selectedCertificate.ShiftDate}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase">Shift Security Deposit</span>
                  <strong className="text-slate-900">₹{selectedCertificate.MoveDepositAmount?.toLocaleString('en-IN')} (Cleared)</strong>
                </div>
              </div>

              <p className="text-xs text-slate-600">
                All maintenance dues, utility arrears, and shift deposit requirements for Flat #{selectedCertificate.FlatNo} have been audited and verified by the Society Treasurer.
              </p>
            </div>

            {/* Signatures */}
            <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs">
              <div className="space-y-1 border-t border-slate-300 pt-3">
                <p className="font-bold text-slate-900">{selectedCertificate.TreasurerApprovedBy || 'Treasurer'}</p>
                <p className="text-slate-500">Treasurer, Managing Committee</p>
                <span className="text-[10px] text-emerald-600 font-semibold block">✓ Dues & Deposit Verified</span>
              </div>

              <div className="space-y-1 border-t border-slate-300 pt-3">
                <p className="font-bold text-slate-900">{selectedCertificate.SecretaryApprovedBy || 'Secretary'}</p>
                <p className="text-slate-500">Secretary, Managing Committee</p>
                <span className="text-[10px] text-indigo-600 font-semibold block">✓ Official Seal & NOC Issued</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t flex justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs"
              >
                <Printer className="w-4 h-4" /> Print Certificate
              </button>
              <button
                onClick={() => setSelectedCertificate(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-medium text-xs hover:bg-slate-800"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Apply NOC */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" /> Apply for Move NOC
              </h3>
              <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Request Type *</label>
                  <select
                    value={requestType}
                    onChange={e => setRequestType(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-bold text-indigo-900"
                  >
                    <option value="move_in">Move-In NOC</option>
                    <option value="move_out">Move-Out NOC</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Flat Number *</label>
                  <input
                    type="text"
                    required
                    value={flatNoInput}
                    onChange={e => setFlatNoInput(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Applicant Name *</label>
                <input
                  type="text"
                  required
                  value={applicantNameInput}
                  onChange={e => setApplicantNameInput(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={applicantPhoneInput}
                    onChange={e => setApplicantPhoneInput(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Proposed Shift Date *</label>
                  <input
                    type="date"
                    required
                    value={shiftDateInput}
                    onChange={e => setShiftDateInput(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Refundable Shift Security Deposit (₹)</label>
                <input
                  type="number"
                  value={depositAmountInput}
                  onChange={e => setDepositAmountInput(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Additional Remarks</label>
                <textarea
                  rows={2}
                  value={remarksInput}
                  onChange={e => setRemarksInput(e.target.value)}
                  placeholder="e.g. Requesting protective lift padding on shift date..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold shadow-md shadow-indigo-500/20"
                >
                  Submit NOC Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Rejection Reason */}
      {rejectionModalId && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Reject NOC Request</h3>
            <form onSubmit={handleRejectSubmit} className="space-y-3 text-xs">
              <label className="block font-semibold text-slate-700">Reason for Rejection / Dues Hold</label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="e.g. Unpaid maintenance dues outstanding (₹4,500)..."
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectionModalId(null)}
                  className="px-3 py-1.5 rounded-lg border text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-rose-600 text-white font-bold"
                >
                  Confirm Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NocWorkflowModule;
