import React, { useState } from 'react';
import { Staff, StaffAttendance, Society } from '../types';
import { 
  UserCheck, 
  QrCode, 
  Search, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  Building2, 
  Phone, 
  ShieldCheck, 
  Smartphone,
  Sparkles,
  ArrowRightLeft,
  User
} from 'lucide-react';

interface StaffTrackingModuleProps {
  staffList?: Staff[];
  attendanceLogs?: StaffAttendance[];
  society?: Society;
  activeRole?: string;
  userRole?: string;
  activeSocietyId?: string;
  enabledModules?: any;
  isDark?: boolean;
  societyName?: string;
  activeFlatNo?: string;
  onCheckInStaff?: (staffId: string, flatNo?: string, gateName?: string) => void;
  onCheckOutStaff?: (staffId: string, gateName?: string) => void;
  onAddStaff?: (newStaff: Partial<Staff>) => void;
}

export const StaffTrackingModule: React.FC<StaffTrackingModuleProps> = ({
  staffList: propStaffList,
  attendanceLogs: propAttendanceLogs,
  society,
  activeRole,
  userRole = 'Admin',
  activeSocietyId = 'greenwood',
  isDark = false,
  societyName = 'Housing Society',
  activeFlatNo = '101',
  onCheckInStaff,
  onCheckOutStaff,
  onAddStaff
}) => {
  const effectiveRole = activeRole || userRole;
  const [localStaffList, setLocalStaffList] = useState<Staff[]>(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('society_staff_list') : null;
    return saved ? JSON.parse(saved) : (propStaffList || [
      {
        id: 'STF-101',
        SocietyId: activeSocietyId,
        Name: 'Sanjay Kumar',
        Phone: '+91 98201 12345',
        Role: 'Maid',
        ServiceType: 'Maid',
        Passcode: '1234',
        QrCodeToken: 'QR-STF-001',
        AssignedFlats: ['101', '102', '201'],
        GateStatus: 'Inside',
        Status: 'Active'
      },
      {
        id: 'STF-102',
        SocietyId: activeSocietyId,
        Name: 'Sunita Devi',
        Phone: '+91 98202 54321',
        Role: 'Cook',
        ServiceType: 'Cook',
        Passcode: '5678',
        QrCodeToken: 'QR-STF-002',
        AssignedFlats: ['101', '302'],
        GateStatus: 'Checked Out',
        Status: 'Active'
      }
    ]);
  });

  const [localAttendance, setLocalAttendance] = useState<StaffAttendance[]>(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('society_staff_attendance_logs') : null;
    return saved ? JSON.parse(saved) : (propAttendanceLogs || [
      {
        id: 'ATT-101',
        SocietyId: activeSocietyId,
        StaffId: 'STF-101',
        StaffName: 'Sanjay Kumar',
        ServiceType: 'Maid',
        AssignedFlats: ['101', '102'],
        GateName: 'Gate 1',
        CheckInTime: new Date(Date.now() - 3 * 3600000).toISOString(),
        Date: new Date().toISOString().split('T')[0],
        Status: 'Inside'
      }
    ]);
  });

  const staffList = propStaffList || localStaffList;
  const attendanceLogs = propAttendanceLogs || localAttendance;
  const [activeTab, setActiveTab] = useState<'guard' | 'resident' | 'directory' | 'logs'>('resident');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [lookupQuery, setLookupQuery] = useState('');
  const [qrModalStaff, setQrModalStaff] = useState<Staff | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffService, setNewStaffService] = useState('Maid');
  const [newStaffFlats, setNewStaffFlats] = useState('101, 102');
  const [newStaffPasscode, setNewStaffPasscode] = useState('');

  const isGuardOrAdmin = effectiveRole === 'GATE_STAFF' || effectiveRole === 'SOCIETY_ADMIN' || effectiveRole === 'Admin' || effectiveRole === 'Committee Member';

  // Filter staff
  const filteredStaff = staffList.filter(s => {
    const matchesSearch = s.Name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.Phone.includes(searchTerm) || 
                          s.ServiceType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'All' || s.ServiceType === filterRole;
    return matchesSearch && matchesRole;
  });

  // Resident's assigned staff
  const residentStaff = staffList.filter(s => s.AssignedFlats?.includes(activeFlatNo));

  // Quick lookup staff for guard
  const lookupStaffResult = staffList.filter(s => 
    lookupQuery.trim() !== '' && (
      s.Phone.includes(lookupQuery.trim()) || 
      s.Name.toLowerCase().includes(lookupQuery.toLowerCase()) ||
      s.Passcode === lookupQuery.trim() ||
      s.QrCodeToken === lookupQuery.trim()
    )
  );

  const handleCreateStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffPhone) return;

    const flatsArray = newStaffFlats.split(',').map(f => f.trim()).filter(Boolean);
    const generatedToken = `QR-STF-${Date.now().toString().slice(-4)}-${newStaffName.slice(0, 3).toUpperCase()}`;

    onAddStaff({
      Name: newStaffName,
      Phone: newStaffPhone,
      ServiceType: newStaffService,
      Role: `${newStaffService}`,
      Passcode: newStaffPasscode || Math.floor(1000 + Math.random() * 9000).toString(),
      QrCodeToken: generatedToken,
      AssignedFlats: flatsArray.length > 0 ? flatsArray : [activeFlatNo],
      PhotoUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      IdVerificationStatus: 'Verified',
      GateStatus: 'Checked Out',
      Status: 'Active'
    });

    setNewStaffName('');
    setNewStaffPhone('');
    setNewStaffPasscode('');
    setShowAddModal(false);
  };

  return (
    <div id="staff-tracking-module" className="space-y-6">
      {/* Module Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <UserCheck className="w-64 h-64 text-emerald-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" /> Staff & Maid Security
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Daily Staff & Helper Register
            </h1>
            <p className="text-emerald-100/80 text-sm mt-1 max-w-xl">
              Real-time gate check-ins, QR pass validation, live status for residents & automated monthly attendance audit.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 font-medium text-sm transition-all shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" /> Add Helper / Maid
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 mt-6 p-1 bg-slate-950/40 backdrop-blur-md rounded-xl border border-white/10 w-fit">
          <button
            onClick={() => setActiveTab('resident')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'resident'
                ? 'bg-emerald-500 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-3.5 h-3.5" /> My Hired Staff
          </button>
          <button
            onClick={() => setActiveTab('guard')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'guard'
                ? 'bg-emerald-500 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" /> Gate Check-In (Guard)
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'directory'
                ? 'bg-emerald-500 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Society Directory
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'logs'
                ? 'bg-emerald-500 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Attendance Logs
          </button>
        </div>
      </div>

      {/* TAB 1: Resident View */}
      {activeTab === 'resident' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" /> Staff Assigned to Flat #{activeFlatNo}
                </h2>
                <p className="text-xs text-slate-500">Live attendance & gate status of domestic help working in your flat.</p>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                {residentStaff.length} Domestic Helpers
              </span>
            </div>

            {residentStaff.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <User className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">No domestic staff registered for Flat #{activeFlatNo}</p>
                <p className="text-xs text-slate-500 mt-1">Add your maid, cook, driver or cleaner to track their entry & exit.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Register Staff
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {residentStaff.map(staff => {
                  const isInside = staff.GateStatus === 'Inside';
                  const recentLog = attendanceLogs.find(a => a.StaffId === staff.id);

                  return (
                    <div 
                      key={staff.id} 
                      className={`p-5 rounded-2xl border transition-all ${
                        isInside 
                          ? 'border-emerald-300 bg-emerald-50/40 shadow-sm' 
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <img 
                          src={staff.PhotoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
                          alt={staff.Name} 
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-base font-bold text-slate-900 truncate">{staff.Name}</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                              isInside 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isInside ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                              {isInside ? 'Inside Society' : 'Outside'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-600">
                            <span className="font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                              {staff.ServiceType}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" /> {staff.Phone}
                            </span>
                          </div>

                          <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                            <div>
                              <span className="text-slate-400">Gate Passcode:</span>{' '}
                              <strong className="text-slate-700 font-mono">{staff.Passcode}</strong>
                            </div>
                            <button
                              onClick={() => setQrModalStaff(staff)}
                              className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                              <QrCode className="w-3.5 h-3.5" /> View QR Code
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Guard Check-In Console */}
      {activeTab === 'guard' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-600" /> Gate Guard Check-In / Out Terminal
              </h2>
              <p className="text-xs text-slate-500">Enter phone number, passcode, or QR token to quickly log staff entrance or exit.</p>
            </div>

            {/* Quick Lookup Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                Quick Lookup (Phone / Passcode / QR Token / Name)
              </label>
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={lookupQuery}
                  onChange={e => setLookupQuery(e.target.value)}
                  placeholder="e.g. 98192, 1234, QR-STF-101, Sita..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-sm"
                />
              </div>
            </div>

            {/* Lookup Results */}
            {lookupQuery.trim() !== '' && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Matching Staff ({lookupStaffResult.length})</h3>
                {lookupStaffResult.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4 text-center">No staff found matching "{lookupQuery}".</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {lookupStaffResult.map(staff => {
                      const isInside = staff.GateStatus === 'Inside';
                      return (
                        <div key={staff.id} className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-sm">
                          <div className="flex items-center gap-3">
                            <img src={staff.PhotoUrl} alt={staff.Name} className="w-12 h-12 rounded-lg object-cover" />
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{staff.Name}</p>
                              <p className="text-xs text-slate-500">{staff.ServiceType} • {staff.Phone}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">Flats: {staff.AssignedFlats?.join(', ')}</p>
                            </div>
                          </div>

                          <div>
                            {isInside ? (
                              <button
                                onClick={() => onCheckOutStaff(staff.id, 'Main Gate')}
                                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold transition shadow-sm"
                              >
                                Check Out
                              </button>
                            ) : (
                              <button
                                onClick={() => onCheckInStaff(staff.id, staff.AssignedFlats?.[0] || '101', 'Main Gate')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition shadow-sm"
                              >
                                Check In
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* All Currently Active Staff Inside Society */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between">
                <span>Currently Inside Society</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  {staffList.filter(s => s.GateStatus === 'Inside').length} Present
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {staffList.filter(s => s.GateStatus === 'Inside').map(staff => (
                  <div key={staff.id} className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={staff.PhotoUrl} alt={staff.Name} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-xs truncate">{staff.Name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{staff.ServiceType}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onCheckOutStaff(staff.id, 'Main Gate')}
                      className="px-2.5 py-1 rounded bg-rose-600 text-white hover:bg-rose-700 text-[11px] font-bold shrink-0"
                    >
                      Check Out
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Directory */}
      {activeTab === 'directory' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search staff by name or service..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
                className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-700 font-medium focus:outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Maid">Maid</option>
                <option value="Cook">Cook</option>
                <option value="Driver">Driver</option>
                <option value="Cleaner">Cleaner</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.map(staff => (
              <div key={staff.id} className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all bg-white space-y-3">
                <div className="flex items-center gap-3">
                  <img src={staff.PhotoUrl} alt={staff.Name} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{staff.Name}</h4>
                    <span className="inline-block text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {staff.ServiceType}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p><strong className="text-slate-500">Phone:</strong> {staff.Phone}</p>
                  <p><strong className="text-slate-500">Verification:</strong> <span className="text-emerald-600 font-semibold">{staff.IdVerificationStatus} ({staff.IdProofType || 'Aadhaar'})</span></p>
                  <p><strong className="text-slate-500">Flats Assigned:</strong> {staff.AssignedFlats?.join(', ') || 'None'}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    staff.GateStatus === 'Inside' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {staff.GateStatus === 'Inside' ? 'Inside Society' : 'Checked Out'}
                  </span>
                  <button
                    onClick={() => setQrModalStaff(staff)}
                    className="text-xs text-emerald-600 hover:underline font-medium flex items-center gap-1"
                  >
                    <QrCode className="w-3.5 h-3.5" /> Passcode & QR
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Attendance Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" /> Historical Attendance Log
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Staff Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Check-In</th>
                  <th className="p-3">Check-Out</th>
                  <th className="p-3">Gate Name</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400">No attendance records logged yet today.</td>
                  </tr>
                ) : (
                  attendanceLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-medium text-slate-800">{log.Date}</td>
                      <td className="p-3 font-bold text-slate-900">{log.StaffName}</td>
                      <td className="p-3">{log.ServiceType}</td>
                      <td className="p-3 font-mono">{new Date(log.CheckInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="p-3 font-mono">
                        {log.CheckOutTime ? new Date(log.CheckOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="p-3">{log.GateName || 'Main Gate'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          log.Status === 'Inside' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {log.Status || (log.CheckOutTime ? 'Checked Out' : 'Inside')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: QR Pass Preview */}
      {qrModalStaff && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Digital Gate Pass</h3>
              <button onClick={() => setQrModalStaff(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <img src={qrModalStaff.PhotoUrl} alt={qrModalStaff.Name} className="w-20 h-20 rounded-2xl mx-auto object-cover border-2 border-emerald-500 shadow-md" />
            
            <div>
              <h4 className="text-lg font-bold text-slate-900">{qrModalStaff.Name}</h4>
              <p className="text-xs text-emerald-700 font-semibold">{qrModalStaff.ServiceType}</p>
            </div>

            {/* QR Code Graphic simulation */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block mx-auto">
              <div className="w-36 h-36 bg-slate-900 rounded-xl p-3 text-white flex flex-col justify-between items-center font-mono text-xs shadow-inner">
                <QrCode className="w-24 h-24 text-white" />
                <span className="text-[10px] text-emerald-400 font-bold tracking-widest">{qrModalStaff.QrCodeToken || 'QR-STF-PASS'}</span>
              </div>
            </div>

            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-slate-700">
              <p><span className="text-slate-500">Security Gate Passcode:</span> <strong className="text-emerald-800 text-base font-mono ml-1">{qrModalStaff.Passcode}</strong></p>
            </div>

            <button
              onClick={() => setQrModalStaff(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-medium text-xs hover:bg-slate-800"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}

      {/* Modal: Add New Staff */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" /> Register New Helper / Maid
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStaffSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newStaffName}
                  onChange={e => setNewStaffName(e.target.value)}
                  placeholder="e.g. Sunita Sharma"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Phone *</label>
                <input
                  type="text"
                  required
                  value={newStaffPhone}
                  onChange={e => setNewStaffPhone(e.target.value)}
                  placeholder="+91 98200 00000"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role / Service</label>
                  <select
                    value={newStaffService}
                    onChange={e => setNewStaffService(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="Maid">Maid</option>
                    <option value="Cook">Cook</option>
                    <option value="Driver">Driver</option>
                    <option value="Cleaner">Cleaner</option>
                    <option value="Electrician">Electrician</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gate Passcode</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={newStaffPasscode}
                    onChange={e => setNewStaffPasscode(e.target.value)}
                    placeholder="Auto 4-digits"
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Flats (Comma Separated)</label>
                <input
                  type="text"
                  value={newStaffFlats}
                  onChange={e => setNewStaffFlats(e.target.value)}
                  placeholder="101, 102, 201"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold shadow-md shadow-emerald-500/20"
                >
                  Save Helper
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffTrackingModule;
