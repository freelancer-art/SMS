import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Building2, 
  Users, 
  CreditCard, 
  ShieldCheck, 
  Sliders, 
  ArrowRight, 
  Sparkles,
  ClipboardList,
  Save,
  RotateCcw,
  Check
} from 'lucide-react';
import { Society, Member } from '../types';

interface SetupChecklistProps {
  society: Society;
  members: Member[];
  onOpenSocietySettings?: () => void;
  onOpenAddMember?: () => void;
  onOpenBillingRules?: () => void;
  onOpenSecuritySetup?: () => void;
  onOpenFeatureCatalog?: () => void;
  theme?: 'light' | 'dark';
}

export const SetupChecklist: React.FC<SetupChecklistProps> = ({
  society,
  members,
  onOpenSocietySettings,
  onOpenAddMember,
  onOpenBillingRules,
  onOpenSecuritySetup,
  onOpenFeatureCatalog,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  const storageKey = `society_setup_checklist_${society.id}`;

  // Local state for step overrides and save status
  const [localCompletedSteps, setLocalCompletedSteps] = useState<Record<number, boolean>>({});
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Load saved progress from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setLocalCompletedSteps(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load saved setup progress from localStorage:', e);
    }
  }, [storageKey]);

  // Calculate step completions from society data OR local overrides
  const autoStep1 = Boolean(society.PostalAddress && (society.HasWings ? society.Wings.length > 0 : true));
  const autoStep2 = members.filter(m => m.SocietyId === society.id).length > 0;
  const autoStep3 = Boolean(society.BillingMode || society.FlatRateAmount || society.RatePerSqFt);
  const autoStep4 = Boolean(society.UPI_ID || society.FeaturesEnabled?.gatekeeper);
  const autoStep5 = Boolean(society.FeaturesEnabled);

  const isStep1Done = localCompletedSteps[1] !== undefined ? localCompletedSteps[1] : autoStep1;
  const isStep2Done = localCompletedSteps[2] !== undefined ? localCompletedSteps[2] : autoStep2;
  const isStep3Done = localCompletedSteps[3] !== undefined ? localCompletedSteps[3] : autoStep3;
  const isStep4Done = localCompletedSteps[4] !== undefined ? localCompletedSteps[4] : autoStep4;
  const isStep5Done = localCompletedSteps[5] !== undefined ? localCompletedSteps[5] : autoStep5;

  const stepStatusArray = [
    { id: 1, done: isStep1Done, auto: autoStep1 },
    { id: 2, done: isStep2Done, auto: autoStep2 },
    { id: 3, done: isStep3Done, auto: autoStep3 },
    { id: 4, done: isStep4Done, auto: autoStep4 },
    { id: 5, done: isStep5Done, auto: autoStep5 }
  ];

  const completedCount = stepStatusArray.filter(s => s.done).length;
  const progressPercent = Math.round((completedCount / 5) * 100);

  const handleSaveProgress = () => {
    const currentState = {
      1: isStep1Done,
      2: isStep2Done,
      3: isStep3Done,
      4: isStep4Done,
      5: isStep5Done,
      lastSaved: new Date().toISOString()
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(currentState));
      setSaveMessage('Progress saved locally! You can resume setup anytime.');
      setTimeout(() => setSaveMessage(null), 3500);
    } catch (e) {
      setSaveMessage('Failed to write to browser storage.');
      setTimeout(() => setSaveMessage(null), 3500);
    }
  };

  const handleToggleStep = (stepId: number) => {
    const newStatus = !stepStatusArray.find(s => s.id === stepId)?.done;
    const updated = { ...localCompletedSteps, [stepId]: newStatus };
    setLocalCompletedSteps(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleResetProgress = () => {
    localStorage.removeItem(storageKey);
    setLocalCompletedSteps({});
    setSaveMessage('Checklist reset to default data state.');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const steps = [
    {
      id: 1,
      title: 'Complete Society & Wing Profile',
      desc: 'Set address, postal code, structure type (Wings / Standalone / Towers).',
      icon: Building2,
      isDone: isStep1Done,
      actionText: 'Configure Profile',
      action: onOpenSocietySettings
    },
    {
      id: 2,
      title: 'Import Flats & Resident Directory',
      desc: 'Add owner & tenant details, flat numbers, and emergency contacts.',
      icon: Users,
      isDone: isStep2Done,
      actionText: 'Add / Import Residents',
      action: onOpenAddMember
    },
    {
      id: 3,
      title: 'Configure Maintenance Billing Rules & Due Dates',
      desc: 'Set flat-rate or SqFt maintenance fees, late penalty rules, and due dates.',
      icon: CreditCard,
      isDone: isStep3Done,
      actionText: 'Set Billing Rules',
      action: onOpenBillingRules
    },
    {
      id: 4,
      title: 'Add Gatekeepers & Security Personnel',
      desc: 'Configure main gate access codes, visitor check-in logs, and security staff.',
      icon: ShieldCheck,
      isDone: isStep4Done,
      actionText: 'Configure Gatekeeper',
      action: onOpenSecuritySetup
    },
    {
      id: 5,
      title: 'Configure Feature Toggles & Module Catalog',
      desc: 'Activate or deactivate Water Meters, Amenity Booking, AGM Polling & AMC tracking.',
      icon: Sliders,
      isDone: isStep5Done,
      actionText: 'Open Feature Catalog',
      action: onOpenFeatureCatalog
    }
  ];

  return (
    <div className={`w-full max-w-3xl mx-auto ${isDark ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'} rounded-2xl border shadow-xl p-5 md:p-6 space-y-6 my-4 transition-all duration-300`}>
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 p-5 text-white shadow-lg">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="flex items-start gap-3.5 relative z-10">
          <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl text-white shrink-0 mt-0.5">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest text-purple-200 uppercase bg-black/20 px-2 py-0.5 rounded-full border border-white/20">
              Fresh Society Workspace
            </span>
            <h2 className="text-xl md:text-2xl font-black mt-1 leading-tight">
              Welcome to {society.Name}!
            </h2>
            <p className="text-xs md:text-sm text-purple-100 mt-1 leading-relaxed">
              Follow this interactive setup guide to configure your platform step-by-step.
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-4 border-t border-white/15 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-purple-100">Setup Progress</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-mono">
              {completedCount} of 5 Completed ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-black/30 rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Visual Step Progress Tracker */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-3`}>
        <div className="flex justify-between items-center text-xs">
          <span className="font-extrabold text-purple-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Interactive Onboarding Stepper</span>
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">
            Auto-syncs with society database & browser cache
          </span>
        </div>

        {/* Step Node Tracker Graph */}
        <div className="relative pt-2 pb-1">
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-700/50 -translate-y-1/2 z-0" />
          <div className="flex justify-between items-center relative z-10">
            {steps.map((st) => {
              return (
                <button
                  key={st.id}
                  onClick={() => handleToggleStep(st.id)}
                  title={`Click to mark Step ${st.id} as ${st.isDone ? 'Incomplete' : 'Complete'}`}
                  className="flex flex-col items-center gap-1 group cursor-pointer"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs transition-all border-2 shadow-md ${
                    st.isDone
                      ? 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-900/30'
                      : 'bg-slate-800 border-slate-600 text-slate-400 group-hover:border-purple-400 group-hover:text-purple-300'
                  }`}>
                    {st.isDone ? <Check className="w-4 h-4" /> : st.id}
                  </div>
                  <span className={`text-[9px] font-bold tracking-tight max-w-[55px] text-center truncate ${
                    st.isDone ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}>
                    Step {st.id}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Save Progress Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveProgress}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Progress Locally</span>
            </button>
            <button
              onClick={handleResetProgress}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer border border-slate-700"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {saveMessage && (
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-lg animate-fadeIn">
              ✔ {saveMessage}
            </span>
          )}
        </div>
      </div>

      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-purple-500" />
          <h3 className="font-extrabold text-base">Society Setup Checklist</h3>
        </div>
        <span className="text-xs text-slate-500">
          Complete steps below to unlock full SaaS features
        </span>
      </div>

      {/* Checklist Steps */}
      <div className="space-y-3">
        {steps.map((step) => {
          const StepIcon = step.icon;
          return (
            <div
              key={step.id}
              className={`p-4 rounded-xl border transition-all ${
                step.isDone
                  ? isDark 
                    ? 'bg-emerald-950/20 border-emerald-800/40' 
                    : 'bg-emerald-50/50 border-emerald-200'
                  : isDark 
                    ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700' 
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              } flex flex-col md:flex-row md:items-center justify-between gap-3`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggleStep(step.id)}
                  className="mt-0.5 shrink-0 hover:scale-110 transition-transform cursor-pointer"
                  title="Click to toggle step completion"
                >
                  {step.isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">Step {step.id}</span>
                    <h4 className={`text-sm font-bold ${step.isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                      {step.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {step.desc}
                  </p>
                </div>
              </div>

              {step.action && (
                <button
                  type="button"
                  onClick={step.action}
                  className={`shrink-0 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    step.isDone
                      ? isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm'
                  }`}
                >
                  <span>{step.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SetupChecklist;
