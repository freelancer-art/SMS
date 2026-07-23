import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Droplet, 
  Building, 
  Vote, 
  Wrench, 
  Users2, 
  FileCheck2, 
  FolderLock, 
  Car, 
  Sliders, 
  Check, 
  Power,
  Sparkles
} from 'lucide-react';
import { FeatureFlags, Society } from '../types';

interface FeatureCatalogModalProps {
  society: Society;
  onUpdateFeatures: (updatedFeatures: FeatureFlags) => void;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

export const FeatureCatalogModal: React.FC<FeatureCatalogModalProps> = ({
  society,
  onUpdateFeatures,
  onClose,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';

  const currentFeatures: FeatureFlags = {
    gatekeeper: true,
    waterMeters: false,
    tenantRegister: true,
    amenities: true,
    assetAMC: false,
    parkingRegister: true,
    documentVault: true,
    polls: true,
    staffDirectory: true,
    vendorManagement: true,
    ...(society.FeaturesEnabled || {})
  };

  const handleToggle = (key: keyof FeatureFlags) => {
    const nextFeatures: FeatureFlags = {
      ...currentFeatures,
      [key]: !currentFeatures[key]
    };
    onUpdateFeatures(nextFeatures);
  };

  const modules = [
    {
      key: 'gatekeeper' as keyof FeatureFlags,
      title: 'Gatekeeper Security & Visitor Pass',
      category: 'Core Security',
      desc: 'Real-time main gate check-in, host approval notifications, delivery partner validation, and pre-approved QR visitor passes.',
      icon: ShieldCheck,
      color: 'emerald'
    },
    {
      key: 'waterMeters' as keyof FeatureFlags,
      title: 'Automated Water Meter Billing',
      category: 'Utilities & Billing',
      desc: 'Individual flat sub-meter reading entries, automated consumption rate tiering, and instant line-item addition to monthly invoices.',
      icon: Droplet,
      color: 'blue'
    },
    {
      key: 'amenities' as keyof FeatureFlags,
      title: 'Facility & Amenity Booking',
      category: 'Resident Amenities',
      desc: 'Clubhouse, Swimming Pool, Tennis Court, and Banquet Hall time-slot reservations with online fee collection.',
      icon: Building,
      color: 'purple'
    },
    {
      key: 'polls' as keyof FeatureFlags,
      title: 'Digital AGM Resolutions & Polling',
      category: 'Governance & E-Voting',
      desc: 'Tamper-proof digital elections, annual general meeting quorum verification, and real-time voting result charts.',
      icon: Vote,
      color: 'cyan'
    },
    {
      key: 'vendorManagement' as keyof FeatureFlags,
      title: 'Vendor & AMC Management',
      category: 'Assets & Contracts',
      desc: 'Track Annual Maintenance Contracts for lifts, DG sets, water pumps, and fire safety systems with service due alerts.',
      icon: Wrench,
      color: 'amber'
    },
    {
      key: 'staffDirectory' as keyof FeatureFlags,
      title: 'Staff & Maid Directory',
      category: 'Community Services',
      desc: 'Domestic help register, gatekeeper check-in logs, emergency contact verification, and police verification badges.',
      icon: Users2,
      color: 'teal'
    },
    {
      key: 'tenantRegister' as keyof FeatureFlags,
      title: 'Tenant & KYC Register',
      category: 'Compliance & Verification',
      desc: 'Digital lease agreement storage, identity document verification, police clearance checks, and move-in/out logging.',
      icon: FileCheck2,
      color: 'indigo'
    },
    {
      key: 'documentVault' as keyof FeatureFlags,
      title: 'Society Document Vault',
      category: 'Record Keeping',
      desc: 'Central repository for financial audits, AGM minutes, circulars, and bye-laws with public/committee access rules.',
      icon: FolderLock,
      color: 'rose'
    },
    {
      key: 'parkingRegister' as keyof FeatureFlags,
      title: 'Vehicle & Guest Parking Register',
      category: 'Security & Parking',
      desc: 'Resident vehicle stickers, assigned parking slot mapping, and temporary guest parking pass allocation.',
      icon: Car,
      color: 'slate'
    }
  ];

  const activeCount = Object.values(currentFeatures).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-4xl ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}>
        
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'} flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl text-white shadow-md">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">Module Settings & Feature Catalog</h2>
                <span className="text-[10px] font-bold bg-purple-900/40 text-purple-300 border border-purple-700/50 px-2 py-0.5 rounded-full">
                  {society.Name}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Toggle features ON or OFF to dynamically show or hide navigation items for this society.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className={`p-3.5 px-5 text-xs border-b ${isDark ? 'bg-purple-950/20 border-purple-900/30 text-purple-300' : 'bg-purple-50 border-purple-100 text-purple-800'} flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              <strong>Instant Live Updates:</strong> Changes apply immediately across resident web portals and mobile app navigation bars.
            </span>
          </div>
          <span className="font-mono font-extrabold shrink-0 bg-purple-900/30 px-2 py-0.5 rounded text-[11px]">
            {activeCount} of {modules.length} Modules Active
          </span>
        </div>

        {/* Modules Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((mod) => {
            const IconComp = mod.icon;
            const isActive = Boolean(currentFeatures[mod.key]);

            return (
              <div
                key={mod.key}
                className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between gap-3 ${
                  isActive
                    ? isDark
                      ? 'bg-slate-900/90 border-purple-800/60 shadow-sm'
                      : 'bg-white border-purple-200 shadow-sm'
                    : isDark
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-70'
                      : 'bg-slate-50/60 border-slate-200 opacity-70'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg shrink-0 ${
                        isActive
                          ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                          : 'bg-slate-800/50 text-slate-500 border border-slate-700/50'
                      }`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                          {mod.category}
                        </span>
                        <h3 className="text-sm font-bold leading-tight">
                          {mod.title}
                        </h3>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <button
                      type="button"
                      onClick={() => handleToggle(mod.key)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      <Power className={`w-3 h-3 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span>{isActive ? 'Active' : 'Disabled'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pl-1">
                    {mod.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/40 flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">
                    {isActive ? 'Visible in navigation' : 'Hidden from residents'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggle(mod.key)}
                    className="text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer"
                  >
                    {isActive ? 'Turn Off' : 'Activate Module'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-slate-50'} flex justify-between items-center shrink-0`}>
          <span className="text-xs text-slate-500">
            Feature configuration saved automatically
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
          >
            Done & Apply
          </button>
        </div>

      </div>
    </div>
  );
};

export default FeatureCatalogModal;
