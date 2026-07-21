import React, { useState } from 'react';
import { 
  Building2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Plus, 
  Check, 
  Trash2,
  HelpCircle,
  Smartphone,
  Eye,
  Settings
} from 'lucide-react';
import { Society, Member, Tower } from '../types';

interface OnboardingWizardProps {
  onComplete: (society: Society, initialMembers: Member[], adminEmail: string, adminFlat: string) => void;
  onCancel: () => void;
  theme?: 'light' | 'dark';
}

export default function OnboardingWizard({ onComplete, onCancel, theme = 'light' }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);

  // Step 1 States: Basic Details
  const [socName, setSocName] = useState('');
  const [socType, setSocType] = useState('Housing Society');
  const [socAddress, setSocAddress] = useState('');
  const [regNo, setRegNo] = useState('');

  // Step 2 States: Structural Topology
  const [structureType, setStructureType] = useState<'standalone' | 'wings' | 'towers_wings'>('standalone');
  
  // Standalone configuration
  const [standaloneFloors, setStandaloneFloors] = useState(4);
  const [standaloneFlatsPerFloor, setStandaloneFlatsPerFloor] = useState(4);

  // Wings configuration
  const [wingsInput, setWingsInput] = useState('A, B');
  const [wingFloors, setWingFloors] = useState(4);
  const [wingFlatsPerFloor, setWingFlatsPerFloor] = useState(4);

  // Towers with Wings configuration
  const [towersCount, setTowersCount] = useState(2);
  const [towerWingsInput, setTowerWingsInput] = useState('A, B');
  const [towerFloors, setTowerFloors] = useState(4);
  const [towerFlatsPerFloor, setTowerFlatsPerFloor] = useState(4);

  // Step 4 States: Primary Admin Setup
  const [adminName, setAdminName] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminFlatSelection, setAdminFlatSelection] = useState('101');

  // Helper to generate flats preview based on state
  const generateFlatsPreview = (): { flatNo: string; wing?: string; tower?: string }[] => {
    const list: { flatNo: string; wing?: string; tower?: string }[] = [];

    if (structureType === 'standalone') {
      for (let f = 1; f <= standaloneFloors; f++) {
        for (let u = 1; u <= standaloneFlatsPerFloor; u++) {
          const flatNo = `${f}${String(u).padStart(2, '0')}`;
          list.push({ flatNo });
        }
      }
    } else if (structureType === 'wings') {
      const wings = wingsInput.split(',').map(w => w.trim()).filter(w => w !== '');
      wings.forEach(wing => {
        for (let f = 1; f <= wingFloors; f++) {
          for (let u = 1; u <= wingFlatsPerFloor; u++) {
            const flatNo = `${wing}-${f}${String(u).padStart(2, '0')}`;
            list.push({ flatNo, wing });
          }
        }
      });
    } else if (structureType === 'towers_wings') {
      const wings = towerWingsInput.split(',').map(w => w.trim()).filter(w => w !== '');
      for (let t = 1; t <= towersCount; t++) {
        const towerName = `Tower ${t}`;
        wings.forEach(wing => {
          for (let f = 1; f <= towerFloors; f++) {
            for (let u = 1; u <= towerFlatsPerFloor; u++) {
              const flatNo = `${towerName} - ${wing}-${f}${String(u).padStart(2, '0')}`;
              list.push({ flatNo, wing, tower: towerName });
            }
          }
        });
      }
    }
    return list;
  };

  const previewFlats = generateFlatsPreview();

  const handleNext = () => {
    if (step === 1) {
      if (!socName.trim() || !socAddress.trim()) {
        alert('Please fill out all required fields.');
        return;
      }
    }
    if (step === 3) {
      // Set default flat selection to first generated flat
      if (previewFlats.length > 0 && !adminFlatSelection) {
        setAdminFlatSelection(previewFlats[0].flatNo);
      }
    }
    setStep(prev => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName.trim() || !adminPhone.trim() || !adminEmail.trim()) {
      alert('Please provide complete details for the Primary Administrator.');
      return;
    }

    // Prepare society object
    const socId = `soc-${Date.now()}`;
    const generatedWings: string[] = [];
    let generatedTowers: Tower[] = [];

    if (structureType === 'standalone') {
      // standalone
    } else if (structureType === 'wings') {
      const wings = wingsInput.split(',').map(w => w.trim()).filter(w => w !== '');
      generatedWings.push(...wings);
    } else if (structureType === 'towers_wings') {
      const wings = towerWingsInput.split(',').map(w => w.trim()).filter(w => w !== '');
      for (let t = 1; t <= towersCount; t++) {
        const tName = `Tower ${t}`;
        generatedTowers.push({
          id: `t-${t}-${Date.now()}`,
          Name: tName,
          Wings: wings
        });
        wings.forEach(wing => {
          generatedWings.push(`${tName} - ${wing}`);
        });
      }
    }

    const newSociety: Society = {
      id: socId,
      Name: socName,
      BuildingType: socType,
      PostalAddress: `${socAddress} | Reg No: ${regNo || 'PENDING'}`,
      Wings: generatedWings,
      HasWings: generatedWings.length > 0,
      StructureType: structureType,
      Towers: generatedTowers.length > 0 ? generatedTowers : undefined
    };

    // Prepare initial members directory (one per flat)
    const initialMembers: Member[] = previewFlats.map(pf => {
      const isThisAdmin = pf.flatNo === adminFlatSelection;
      return {
        id: `M-${socId}-${pf.flatNo.replace(/\s+/g, '')}`,
        SocietyId: socId,
        FlatNo: pf.flatNo,
        Wing: pf.wing || '',
        Tower: pf.tower || '',
        OwnerName: isThisAdmin ? adminName : 'Vacant Unit',
        ContactNo: isThisAdmin ? adminPhone : '',
        Email: isThisAdmin ? adminEmail.trim().toLowerCase() : '',
        Balance: isThisAdmin ? 0 : 0,
        Status: 'Owner',
        Role: isThisAdmin ? 'Admin' : 'Member'
      };
    });

    onComplete(newSociety, initialMembers, adminEmail, adminFlatSelection);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`p-5 rounded-2xl border max-w-4xl mx-auto shadow-xl transition-all ${
      isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      {/* Wizard Header */}
      <div className="flex justify-between items-center pb-5 border-b border-slate-200/50 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight">Society Ledger Onboarding Wizard</h2>
            <p className="text-[10px] text-slate-400 font-medium">Configure complex hierarchical society topologies step-by-step</p>
          </div>
        </div>
        <button 
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-rose-500 font-bold border border-transparent hover:border-slate-250 rounded-lg px-2.5 py-1.5 transition-all cursor-pointer"
        >
          Skip Wizard
        </button>
      </div>

      {/* Progress Indicators */}
      <div className="grid grid-cols-4 gap-2 mb-8 text-[10px] font-black uppercase tracking-wider text-center">
        {[
          { label: '1. Basic Info', num: 1 },
          { label: '2. Topology Design', num: 2 },
          { label: '3. Flat Preview', num: 3 },
          { label: '4. Admin Setup', num: 4 }
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center gap-1.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] transition-all ${
              step === s.num 
                ? 'bg-purple-600 text-white ring-4 ring-purple-100' 
                : step > s.num 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-slate-100 text-slate-400'
            }`}>
              {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
            </div>
            <span className={`transition-colors hidden sm:inline ${step === s.num ? 'text-purple-600' : 'text-slate-400'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* STEP 1: BASIC DETAILS */}
      {step === 1 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100/50 mb-3 text-left">
            <h4 className="font-extrabold text-purple-900 text-xs flex items-center gap-1.5 mb-1">
              <Building2 className="w-4 h-4 text-purple-600" />
              Society Identity & Location
            </h4>
            <p className="text-[10px] text-purple-700 font-medium leading-relaxed">
              Begin by creating the regulatory identity of your Co-operative Housing Society or apartment project.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-500 text-[10px] uppercase block">Society / Customer Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Greenwood Heights CHS"
                value={socName}
                onChange={(e) => setSocName(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 hover:border-purple-300 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 font-bold text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-500 text-[10px] uppercase block">Property & Building Type</label>
              <select
                value={socType}
                onChange={(e) => setSocType(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 font-bold text-xs cursor-pointer"
              >
                <option value="Housing Society">Housing Society (Co-op)</option>
                <option value="Apartment Complex">Apartment Complex</option>
                <option value="Gated Townhouse Community">Gated Townhouse Community</option>
                <option value="Commercial Complex">Commercial Office Complex</option>
                <option value="Mixed Use Tower">Mixed Use Building</option>
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="font-extrabold text-slate-500 text-[10px] uppercase block">Postal Address *</label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Plot No. 89, Palm Beach Road, Sector 12, Vashi, Navi Mumbai, MH - 400703"
                value={socAddress}
                onChange={(e) => setSocAddress(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 hover:border-purple-300 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium text-xs resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-500 text-[10px] uppercase block">Registering Authority Registration Number (Optional)</label>
              <input
                type="text"
                placeholder="e.g. NMM/MH/HS/10294/2026"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 hover:border-purple-300 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 font-bold text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: STRUCTURAL TOPOLOGY DESIGN */}
      {step === 2 && (
        <div className="space-y-5 animate-fadeIn">
          <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100/50 text-left">
            <h4 className="font-extrabold text-purple-900 text-xs flex items-center gap-1.5 mb-1">
              <Layers className="w-4 h-4 text-purple-600" />
              Hierarchical Architecture Topology
            </h4>
            <p className="text-[10px] text-purple-700 font-medium leading-relaxed">
              Select the layout model of your building structure. Society Ledger generates database nodes matching real-world architectural hierarchies.
            </p>
          </div>

          {/* Interactive Topology Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-left">
            {[
              {
                id: 'standalone',
                title: 'Standalone Tower',
                desc: 'Single building block, 1 to N floors. Flat numbers are numeric (e.g., 101, 102, 201).',
                icon: Building2
              },
              {
                id: 'wings',
                title: 'Multiple Wings',
                desc: 'Single complex divided into Wings (e.g. Wing A, Wing B). Flats contain prefix (A-101, B-101).',
                icon: Layers
              },
              {
                id: 'towers_wings',
                title: 'Towers with Wings',
                desc: 'Large multi-tower projects where each Tower (Tower 1, Tower 2) has individual Wing blocks.',
                icon: Settings
              }
            ].map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.id}
                  onClick={() => setStructureType(card.id as any)}
                  className={`p-4 rounded-xl border text-left transition-all relative flex flex-col gap-2 cursor-pointer ${
                    structureType === card.id 
                      ? 'border-purple-600 bg-purple-50/10 ring-2 ring-purple-600/20' 
                      : 'border-slate-200 hover:border-slate-350 bg-slate-50/20'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    structureType === card.id ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-xs">{card.title}</h3>
                    <p className="text-[10px] text-slate-450 font-medium leading-relaxed mt-1">{card.desc}</p>
                  </div>
                  {structureType === card.id && (
                    <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Topology Specific Inputs */}
          <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/30 text-left text-xs space-y-3">
            <span className="font-extrabold text-slate-600 text-[10px] uppercase tracking-wide block">Configure structural parameters</span>

            {structureType === 'standalone' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 text-[10px] block">Number of Floors</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={standaloneFloors}
                    onChange={(e) => setStandaloneFloors(parseInt(e.target.value) || 1)}
                    className="w-full bg-white border border-slate-200 p-2 rounded-lg font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 text-[10px] block">Flats per Floor</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={standaloneFlatsPerFloor}
                    onChange={(e) => setStandaloneFlatsPerFloor(parseInt(e.target.value) || 1)}
                    className="w-full bg-white border border-slate-200 p-2 rounded-lg font-bold"
                  />
                </div>
              </div>
            )}

            {structureType === 'wings' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 text-[10px] block">Wing Names (comma-separated)</label>
                  <input
                    type="text"
                    value={wingsInput}
                    onChange={(e) => setWingsInput(e.target.value)}
                    placeholder="e.g. Wing A, Wing B, Wing C"
                    className="w-full bg-white border border-slate-200 p-2 rounded-lg font-mono font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 text-[10px] block">Floors per Wing</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={wingFloors}
                      onChange={(e) => setWingFloors(parseInt(e.target.value) || 1)}
                      className="w-full bg-white border border-slate-200 p-2 rounded-lg font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 text-[10px] block">Units/Flats per Floor</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={wingFlatsPerFloor}
                      onChange={(e) => setWingFlatsPerFloor(parseInt(e.target.value) || 1)}
                      className="w-full bg-white border border-slate-200 p-2 rounded-lg font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {structureType === 'towers_wings' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 text-[10px] block">Number of Towers</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={towersCount}
                      onChange={(e) => setTowersCount(parseInt(e.target.value) || 1)}
                      className="w-full bg-white border border-slate-200 p-2 rounded-lg font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 text-[10px] block">Wings inside each Tower (comma-separated)</label>
                    <input
                      type="text"
                      value={towerWingsInput}
                      onChange={(e) => setTowerWingsInput(e.target.value)}
                      placeholder="e.g. A, B"
                      className="w-full bg-white border border-slate-200 p-2 rounded-lg font-mono font-bold"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 text-[10px] block">Floors per Tower-Wing</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={towerFloors}
                      onChange={(e) => setTowerFloors(parseInt(e.target.value) || 1)}
                      className="w-full bg-white border border-slate-200 p-2 rounded-lg font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 text-[10px] block">Units per Floor</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={towerFlatsPerFloor}
                      onChange={(e) => setTowerFlatsPerFloor(parseInt(e.target.value) || 1)}
                      className="w-full bg-white border border-slate-200 p-2 rounded-lg font-bold"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: AUTO FLAT GENERATOR PREVIEW */}
      {step === 3 && (
        <div className="space-y-4 animate-fadeIn text-left">
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50 text-left flex items-start gap-3">
            <div className="w-8 h-8 rounded bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-emerald-950 text-xs mb-1">
                Autogenerated Properties Directory
              </h4>
              <p className="text-[10px] text-emerald-800 font-medium leading-relaxed">
                We successfully simulated and compiled **{previewFlats.length} flats** matching your structural parameters. 
                Below is the preview list of database records ready for deployment.
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-extrabold text-slate-500 text-[10px] uppercase block">Flat Registry Preview ({previewFlats.length} total units)</span>
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[180px] overflow-y-auto bg-slate-50/40 p-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {previewFlats.map((flat, idx) => (
                  <div 
                    key={idx} 
                    className="p-2 bg-white border border-slate-150 rounded-lg text-[9px] font-bold text-slate-700 flex flex-col gap-0.5 justify-center"
                  >
                    <span className="text-[10px] font-black text-purple-700">Flat {flat.flatNo}</span>
                    {flat.tower && (
                      <span className="text-[8px] text-slate-450 font-semibold">{flat.tower}</span>
                    )}
                    {flat.wing && (
                      <span className="text-[8px] text-indigo-500 font-semibold">Wing: {flat.wing}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: PRIMARY ADMIN SETUP */}
      {step === 4 && (
        <form onSubmit={handleComplete} className="space-y-4 animate-fadeIn text-left">
          <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100/50 text-left">
            <h4 className="font-extrabold text-purple-900 text-xs flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              Primary Secretary (Admin) Credentials
            </h4>
            <p className="text-[10px] text-purple-700 font-medium leading-relaxed">
              Every newly onboarded society requires a registered Committee Administrator (typically the Secretary). 
              This account will automatically receive a secure role to issue invoices, post notices, and approve security entries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-500 text-[10px] uppercase block">Admin Secretary Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Amit Sharma"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 hover:border-purple-300 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 font-bold text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-500 text-[10px] uppercase block">Secretary Mobile Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. +91 98765 43210"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 hover:border-purple-300 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 font-bold text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-500 text-[10px] uppercase block">Secure Registering Email *</label>
              <input
                type="email"
                required
                placeholder="e.g. amit.sharma@example.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 hover:border-purple-300 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 font-bold text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-500 text-[10px] uppercase block">Assign Admin to Flat/Unit</label>
              <select
                value={adminFlatSelection}
                onChange={(e) => setAdminFlatSelection(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 font-bold text-xs cursor-pointer"
              >
                {previewFlats.map((flat, idx) => (
                  <option key={idx} value={flat.flatNo}>
                    Flat {flat.flatNo} {flat.wing ? `(Wing ${flat.wing})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black rounded-xl shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <span>Onboard & Launch Society</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* Navigation Buttons (Steps 1 to 3) */}
      {step < 4 && (
        <div className="pt-5 border-t border-slate-100/50 mt-6 flex justify-between items-center">
          <button
            type="button"
            disabled={step === 1}
            onClick={handleBack}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <span>Continue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
