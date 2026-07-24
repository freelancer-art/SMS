import React, { useState } from 'react';
import { SocietyAsset, VendorContract, Society } from '../types';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  Calendar, 
  Clock, 
  DollarSign, 
  ExternalLink, 
  Building2, 
  ShieldAlert, 
  Sparkles,
  Tag,
  ShieldCheck
} from 'lucide-react';

interface AssetInventoryModuleProps {
  assets?: SocietyAsset[];
  vendorContracts?: VendorContract[];
  society?: Society;
  activeRole?: string;
  userRole?: string;
  activeSocietyId?: string;
  enabledModules?: any;
  isDark?: boolean;
  societyName?: string;
  onAddAsset?: (newAsset: Partial<SocietyAsset>) => void;
  onUpdateAssetStatus?: (assetId: string, status: 'operational' | 'under_maintenance' | 'decommissioned') => void;
}

export const AssetInventoryModule: React.FC<AssetInventoryModuleProps> = ({
  assets: propAssets,
  vendorContracts = [],
  society,
  activeRole,
  userRole = 'Admin',
  activeSocietyId = 'greenwood',
  isDark = false,
  societyName = 'Housing Society',
  onAddAsset,
  onUpdateAssetStatus
}) => {
  const effectiveRole = activeRole || userRole;
  const [localAssets, setLocalAssets] = useState<SocietyAsset[]>(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('society_assets_list') : null;
    return saved ? JSON.parse(saved) : (propAssets || []);
  });

  const assets = propAssets || localAssets;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [assetName, setAssetName] = useState('');
  const [category, setCategory] = useState('Elevator');
  const [location, setLocation] = useState('Tower A');
  const [serialNumber, setSerialNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [warrantyExpiry, setWarrantyExpiry] = useState('');
  const [purchaseCost, setPurchaseCost] = useState(50000);
  const [vendorName, setVendorName] = useState('');
  const [nextServiceDate, setNextServiceDate] = useState('');

  const isAdminOrCommittee = effectiveRole === 'SOCIETY_ADMIN' || effectiveRole === 'Admin' || effectiveRole === 'Committee Member' || effectiveRole === 'TREASURER' || effectiveRole === 'SECRETARY';

  const categories = ['All', 'Elevator', 'Generator', 'Water Pump', 'CCTV & Gate', 'Gym Equipment', 'Fire Safety', 'Electrical'];

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.AssetName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (asset.SerialNumber && asset.SerialNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (asset.Location && asset.Location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = filterCategory === 'All' || asset.Category === filterCategory;
    const matchesStat = filterStatus === 'All' || asset.Status === filterStatus;
    return matchesSearch && matchesCat && matchesStat;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName || !category) return;

    onAddAsset({
      AssetName: assetName,
      Category: category,
      Location: location || 'Common Area',
      SerialNumber: serialNumber || `SN-${Math.floor(10000 + Math.random() * 90000)}`,
      PurchaseDate: purchaseDate,
      WarrantyExpiry: warrantyExpiry || undefined,
      PurchaseCost: Number(purchaseCost) || 0,
      VendorName: vendorName || undefined,
      NextServiceDate: nextServiceDate || undefined,
      Status: 'operational',
      CreatedAt: new Date().toISOString()
    });

    setAssetName('');
    setShowAddModal(false);
  };

  const totalAssetValue = assets.reduce((sum, a) => sum + (a.PurchaseCost || 0), 0);
  const operationalCount = assets.filter(a => a.Status === 'operational').length;
  const maintenanceCount = assets.filter(a => a.Status === 'under_maintenance').length;

  return (
    <div id="asset-inventory-module" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-zinc-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Package className="w-64 h-64 text-amber-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-amber-500/30">
              <Package className="w-3.5 h-3.5" /> Society Capital Asset Register
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Asset & AMC Maintenance Register
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Track elevators, DG sets, hydro pumps & CCTV assets with AMC vendor warranty tracking & scheduled service logs.
            </p>
          </div>

          {isAdminOrCommittee && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" /> Register New Asset
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Registered Assets</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{assets.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Operational Status</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">{operationalCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Under Maintenance</p>
            <p className="text-xl font-bold text-amber-600 mt-1">{maintenanceCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Capital Asset Value</p>
            <p className="text-xl font-bold text-slate-900 mt-1">₹{(totalAssetValue / 100000).toFixed(1)}L</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100/60 text-amber-800 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Asset List Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by asset name, location or serial..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-700 font-medium focus:outline-none"
            >
              {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-700 font-medium focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="operational">Operational</option>
              <option value="under_maintenance">Under Maintenance</option>
              <option value="decommissioned">Decommissioned</option>
            </select>
          </div>
        </div>

        {/* Asset Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium">No society assets match the query.</p>
            </div>
          ) : (
            filteredAssets.map(asset => (
              <div 
                key={asset.id} 
                className={`p-5 rounded-2xl border transition-all bg-white flex flex-col justify-between space-y-4 ${
                  asset.Status === 'under_maintenance' 
                    ? 'border-amber-300 bg-amber-50/20 shadow-sm' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <Tag className="w-3 h-3" /> {asset.Category}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      asset.Status === 'operational' ? 'bg-emerald-100 text-emerald-800' :
                      asset.Status === 'under_maintenance' ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {asset.Status === 'operational' && <CheckCircle2 className="w-3 h-3" />}
                      {asset.Status === 'under_maintenance' && <Wrench className="w-3 h-3" />}
                      {asset.Status === 'operational' ? 'Operational' : asset.Status === 'under_maintenance' ? 'Under Service' : 'Decommissioned'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">{asset.AssetName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">SN: {asset.SerialNumber || 'N/A'}</p>
                </div>

                <div className="text-xs text-slate-600 space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Location:</span>
                    <strong className="text-slate-800">{asset.Location || 'Common Area'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">AMC / Vendor:</span>
                    <strong className="text-slate-800 truncate max-w-[160px]">{asset.VendorName || 'In-House'}</strong>
                  </div>
                  {asset.NextServiceDate && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Next Service:</span>
                      <strong className="text-indigo-700 font-mono">{asset.NextServiceDate}</strong>
                    </div>
                  )}
                  {asset.PurchaseCost && (
                    <div className="flex justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-400">Purchase Value:</span>
                      <strong className="text-slate-900 font-mono">₹{asset.PurchaseCost.toLocaleString('en-IN')}</strong>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                {isAdminOrCommittee && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">Status Toggle:</span>
                    <select
                      value={asset.Status}
                      onChange={e => onUpdateAssetStatus(asset.id, e.target.value as any)}
                      className="text-[11px] border border-slate-300 rounded-lg px-2 py-1 bg-white text-slate-800 font-bold focus:outline-none"
                    >
                      <option value="operational">Operational</option>
                      <option value="under_maintenance">Under Service</option>
                      <option value="decommissioned">Decommissioned</option>
                    </select>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Add New Asset */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-600" /> Register Capital Asset
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Asset Name *</label>
                <input
                  type="text"
                  required
                  value={assetName}
                  onChange={e => setAssetName(e.target.value)}
                  placeholder="e.g. Tower B Hydro-Pneumatic Pump #2"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-bold"
                  >
                    <option value="Elevator">Elevator</option>
                    <option value="Generator">Generator</option>
                    <option value="Water Pump">Water Pump</option>
                    <option value="CCTV & Gate">CCTV & Gate</option>
                    <option value="Gym Equipment">Gym Equipment</option>
                    <option value="Fire Safety">Fire Safety</option>
                    <option value="Electrical">Electrical</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Basement 2"
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={e => setSerialNumber(e.target.value)}
                    placeholder="e.g. SCH-MUM-9910"
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Purchase Cost (₹)</label>
                  <input
                    type="number"
                    value={purchaseCost}
                    onChange={e => setPurchaseCost(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">AMC Vendor / Supplier</label>
                <input
                  type="text"
                  value={vendorName}
                  onChange={e => setVendorName(e.target.value)}
                  placeholder="e.g. Schindler India Pvt Ltd"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={e => setPurchaseDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Next Service Date</label>
                  <input
                    type="date"
                    value={nextServiceDate}
                    onChange={e => setNextServiceDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
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
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold shadow-md shadow-amber-500/20"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetInventoryModule;
