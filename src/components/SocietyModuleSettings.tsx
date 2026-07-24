import React, { useState } from 'react';
import { SlidersHorizontal, Settings, Shield, CreditCard, Users, CheckCircle2, Building2, Save, Sparkles, ToggleLeft, ToggleRight, Lock, HelpCircle, AlertCircle } from 'lucide-react';
import { Society, EnabledModules, ModuleSettings, GatekeeperSettings, BillingModuleSettings, SocietyCoreSettings } from '../types';
import { DEFAULT_ENABLED_MODULES } from '../hooks/useFeatureToggle';

interface SocietyModuleSettingsProps {
  society: Society;
  onUpdateSocietySettings: (updatedSociety: Society) => void;
  theme?: 'light' | 'dark';
}

export default function SocietyModuleSettings({
  society,
  onUpdateSocietySettings,
  theme = 'light'
}: SocietyModuleSettingsProps) {
  const [activeTab, setActiveTab] = useState<'toggles' | 'core' | 'gatekeeper' | 'billing'>('toggles');

  // Enabled Modules state
  const [enabledModules, setEnabledModules] = useState<EnabledModules>(() => ({
    ...DEFAULT_ENABLED_MODULES,
    ...(society.EnabledModules || {})
  }));

  // Module settings state
  const [gatekeeperSettings, setGatekeeperSettings] = useState<GatekeeperSettings>(() => ({
    autoApproveGuests: true,
    passExpiryHours: 12,
    gateGuardPhone: '+91 98765 00000',
    ...(society.ModuleSettings?.gatekeeper || {})
  }));

  const [billingSettings, setBillingSettings] = useState<BillingModuleSettings>(() => ({
    enableGST: false,
    gstRatePercent: 18,
    autoInvoiceDay: 1,
    defaultBillingMode: society.BillingMode || 'Flat Rate',
    ...(society.ModuleSettings?.billing || {})
  }));

  const [coreSettings, setCoreSettings] = useState<SocietyCoreSettings>(() => ({
    logoUrl: society.LogoUrl || '',
    societyCode: society.SocietyCode || 'GWRES01',
    dueDateDay: society.DueDateDay || 15,
    lateFeeInterestPercent: society.LateFeeValue || 12,
    noticeEmailAlerts: true,
    ...(society.ModuleSettings?.society || {})
  }));

  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const isDark = theme === 'dark';

  const handleToggleModule = (key: keyof EnabledModules) => {
    setEnabledModules(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveAllSettings = () => {
    const updatedModuleSettings: ModuleSettings = {
      gatekeeper: gatekeeperSettings,
      billing: billingSettings,
      society: coreSettings
    };

    const updatedSociety: Society = {
      ...society,
      SocietyCode: coreSettings.societyCode,
      LogoUrl: coreSettings.logoUrl,
      DueDateDay: coreSettings.dueDateDay,
      LateFeeValue: coreSettings.lateFeeInterestPercent,
      EnabledModules: enabledModules,
      ModuleSettings: updatedModuleSettings,
      FeaturesEnabled: {
        gatekeeper: enabledModules.gatekeeper,
        waterMeters: enabledModules.water_meters,
        tenantRegister: enabledModules.tenants,
        amenities: enabledModules.facility_booking,
        assetAMC: society.FeaturesEnabled?.assetAMC ?? true,
        parkingRegister: society.FeaturesEnabled?.parkingRegister ?? true,
        documentVault: enabledModules.document_vault
      }
    };

    onUpdateSocietySettings(updatedSociety);
    setSavedMsg('All module settings and feature toggles updated successfully!');
    setTimeout(() => setSavedMsg(null), 3000);
  };

  return (
    <div className={`p-4 sm:p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} shadow-sm space-y-6 text-left`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
              Configurable Module Catalog & Feature Toggles
            </h2>
            <p className="text-xs text-slate-400">
              Tenant Discretion Toggles & Module Settings ({society.Name} • Code: {society.SocietyCode})
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveAllSettings}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Module Configuration</span>
        </button>
      </div>

      {savedMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('toggles')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'toggles'
              ? 'bg-purple-600 text-white shadow-sm'
              : isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tenant Feature Toggles ({Object.values(enabledModules).filter(Boolean).length}/8)</span>
        </button>

        <button
          onClick={() => setActiveTab('core')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'core'
              ? 'bg-purple-600 text-white shadow-sm'
              : isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Society Core Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('gatekeeper')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'gatekeeper'
              ? 'bg-purple-600 text-white shadow-sm'
              : isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Gatekeeper Module</span>
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'billing'
              ? 'bg-purple-600 text-white shadow-sm'
              : isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Billing & Invoicing</span>
        </button>
      </div>

      {/* TAB 1: Tenant Discretion Feature Toggles */}
      {activeTab === 'toggles' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Enable or disable modules at society discretion. Disabled modules are dynamically hidden from navigation menus and user interfaces.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                key: 'gatekeeper' as keyof EnabledModules,
                title: 'Gatekeeper Security & Visitor Logs',
                desc: 'Digital visitor check-in, pre-approved guest passes, QR gate validation & panic alerts.',
                icon: '🛡️'
              },
              {
                key: 'billing' as keyof EnabledModules,
                title: 'Financial Accounting & Batch Invoicing',
                desc: 'Maintenance bill generation, online UPI/Gateway receipts, late fee interest, & ledger statements.',
                icon: '💳'
              },
              {
                key: 'helpdesk' as keyof EnabledModules,
                title: 'Helpdesk Complaints & Service Tickets',
                desc: 'Resident grievance tracking, auto-assignment, technician replies & resolution SLAs.',
                icon: '🎫'
              },
              {
                key: 'voting' as keyof EnabledModules,
                title: 'AGM Voting & Digital Polls',
                desc: 'Democratic resolution voting, single-vote per flat verification & live audit results.',
                icon: '🗳️'
              },
              {
                key: 'facility_booking' as keyof EnabledModules,
                title: 'Clubhouse & Facility Booking',
                desc: 'Reserve community hall, gym slots, tennis court, and guest parking slots.',
                icon: '🏊'
              },
              {
                key: 'water_meters' as keyof EnabledModules,
                title: 'Smart Water Meter Sub-Metering',
                desc: 'Track individual flat water readings, calculate consumption charges & leak alerts.',
                icon: '💧'
              },
              {
                key: 'tenants' as keyof EnabledModules,
                title: 'Tenant Directory & Lease Vault',
                desc: 'Tenant onboarding, agreement validity tracking, police verification & NOC approvals.',
                icon: '🔑'
              },
              {
                key: 'document_vault' as keyof EnabledModules,
                title: 'Document Vault & Bylaws Repository',
                desc: 'Store society conveyance deeds, AGM minutes, audit reports & resident forms.',
                icon: '📂'
              }
            ].map((item) => {
              const isEnabled = enabledModules[item.key];
              return (
                <div
                  key={item.key}
                  onClick={() => handleToggleModule(item.key)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    isEnabled
                      ? 'border-purple-500/50 bg-purple-500/5 dark:bg-purple-950/20 shadow-xs'
                      : isDark ? 'border-slate-800 bg-slate-800/30 opacity-60' : 'border-slate-200 bg-slate-50 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{item.icon}</span>
                      <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100">{item.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{item.desc}</p>
                  </div>

                  <div className="shrink-0 mt-0.5">
                    {isEnabled ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black flex items-center gap-1">
                        ✓ Enabled
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-500/10 border border-slate-500/30 text-slate-400 text-[10px] font-black">
                        Disabled
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Society Core Settings */}
      {activeTab === 'core' && (
        <div className="space-y-4 max-w-2xl">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase text-slate-400">Society Code (Deterministic)</label>
            <input
              type="text"
              value={coreSettings.societyCode}
              onChange={(e) => setCoreSettings({ ...coreSettings, societyCode: e.target.value.toUpperCase() })}
              className={`w-full p-2.5 rounded-xl border text-xs font-mono font-bold ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase text-slate-400">Society Logo URL</label>
            <input
              type="url"
              placeholder="https://example.com/logo.png"
              value={coreSettings.logoUrl}
              onChange={(e) => setCoreSettings({ ...coreSettings, logoUrl: e.target.value })}
              className={`w-full p-2.5 rounded-xl border text-xs font-medium ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase text-slate-400">Maintenance Due Day of Month</label>
              <input
                type="number"
                min={1}
                max={28}
                value={coreSettings.dueDateDay}
                onChange={(e) => setCoreSettings({ ...coreSettings, dueDateDay: Number(e.target.value) })}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase text-slate-400">Late Fee Interest Penalty (%)</label>
              <input
                type="number"
                min={0}
                max={36}
                value={coreSettings.lateFeeInterestPercent}
                onChange={(e) => setCoreSettings({ ...coreSettings, lateFeeInterestPercent: Number(e.target.value) })}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Gatekeeper Module Settings */}
      {activeTab === 'gatekeeper' && (
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            <div>
              <p className="text-xs font-extrabold">Auto-Approve Pre-Registered Guests</p>
              <p className="text-[11px] text-slate-400">Allow instant entry when visitor presents valid resident QR pass.</p>
            </div>
            <input
              type="checkbox"
              checked={gatekeeperSettings.autoApproveGuests}
              onChange={(e) => setGatekeeperSettings({ ...gatekeeperSettings, autoApproveGuests: e.target.checked })}
              className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase text-slate-400">Visitor Pass Expiry Duration (Hours)</label>
            <select
              value={gatekeeperSettings.passExpiryHours}
              onChange={(e) => setGatekeeperSettings({ ...gatekeeperSettings, passExpiryHours: Number(e.target.value) })}
              className={`w-full p-2.5 rounded-xl border text-xs font-bold ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value={4}>4 Hours (Short Delivery Pass)</option>
              <option value={12}>12 Hours (Standard Guest Pass)</option>
              <option value={24}>24 Hours (Full Day Pass)</option>
              <option value={48}>48 Hours (Weekend Visitor Pass)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase text-slate-400">Gate Guard Helpline Phone</label>
            <input
              type="text"
              value={gatekeeperSettings.gateGuardPhone}
              onChange={(e) => setGatekeeperSettings({ ...gatekeeperSettings, gateGuardPhone: e.target.value })}
              className={`w-full p-2.5 rounded-xl border text-xs font-mono font-bold ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>
        </div>
      )}

      {/* TAB 4: Billing & Invoicing Settings */}
      {activeTab === 'billing' && (
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            <div>
              <p className="text-xs font-extrabold">Default GST Calculation Toggle</p>
              <p className="text-[11px] text-slate-400">Apply 18% GST tax automatically on monthly maintenance bills.</p>
            </div>
            <input
              type="checkbox"
              checked={billingSettings.enableGST}
              onChange={(e) => setBillingSettings({ ...billingSettings, enableGST: e.target.checked })}
              className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase text-slate-400">Auto-Invoice Generation Day of Month</label>
              <input
                type="number"
                min={1}
                max={28}
                value={billingSettings.autoInvoiceDay}
                onChange={(e) => setBillingSettings({ ...billingSettings, autoInvoiceDay: Number(e.target.value) })}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase text-slate-400">Default Billing Mode Calculation</label>
              <select
                value={billingSettings.defaultBillingMode}
                onChange={(e) => setBillingSettings({ ...billingSettings, defaultBillingMode: e.target.value as any })}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value="Flat Rate">Flat Rate (Equal fee per unit)</option>
                <option value="SqFt Rate">SqFt Rate (Carpet area multiplier)</option>
                <option value="Hybrid">Hybrid Rate (Flat + Utility Area)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
