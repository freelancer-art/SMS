import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Sparkles, 
  Shield, 
  CreditCard, 
  Users, 
  HelpCircle, 
  ChevronRight, 
  CheckCircle2, 
  Droplet, 
  Vote, 
  Smartphone, 
  Database, 
  Bell, 
  FileText,
  Workflow,
  Search,
  AlertTriangle
} from 'lucide-react';

interface HowToHelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

export const HowToHelpDrawer: React.FC<HowToHelpDrawerProps> = ({
  isOpen,
  onClose,
  theme = 'dark'
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const [activeCategory, setActiveCategory] = useState<'guides' | 'config' | 'workflows' | 'troubleshooting'>('guides');
  const [activeGuideId, setActiveGuideId] = useState<string>('admin-guide');
  const [faqSearchQuery, setFaqSearchQuery] = useState<string>('');

  const configurableSettings = [
    {
      category: '🏢 Society Metadata & Onboarding',
      items: [
        { name: 'Society Name', expected: 'Greenwood Residency Co-Op Housing Society Ltd.', type: 'String (Max 120 chars)', desc: 'Official registered name. Auto-generates unique SocietyCode (e.g., OMRE1) & Slug.' },
        { name: 'GSTIN', expected: '27AAACG1234H1Z5', type: 'String (15-char Regex)', desc: '15-character statutory GST identification number for tax invoice headers.' },
        { name: 'Structure Type', expected: 'wings | standalone | towers_wings', type: 'Enum', desc: 'Defines flat directory hierarchy (e.g. Wing A, Tower 1).' }
      ]
    },
    {
      category: '💳 Maintenance Billing & Financial Engine',
      items: [
        { name: 'Billing Mode', expected: 'Flat Rate | SqFt Rate | Hybrid', type: 'Enum', desc: 'Calculation strategy for monthly unit maintenance dues.' },
        { name: 'RatePerSqFt / FlatRateAmount', expected: '₹3.50 per SqFt OR ₹2,500 Flat Rate', type: 'Numeric (Positive)', desc: 'Base unit charge applied during automated monthly batch invoicing.' },
        { name: 'Due Date Day', expected: '1 to 28 (Default: 15)', type: 'Integer (1-28)', desc: 'Monthly payment cutoff day. Values > 28 strictly blocked by system validation.' },
        { name: 'Late Fee Interest Percent', expected: '12% per annum (Default: 12)', type: 'Numeric (0% - 50%)', desc: 'Annual interest percentage for overdue balances accrued pro-rata.' }
      ]
    },
    {
      category: '⚡ Module Catalog & Feature Toggles (JSONB)',
      items: [
        { name: 'enabled_modules JSONB', expected: '{"gatekeeper": true, "billing": true, "voting": true, "water_meters": true}', type: 'JSONB Object', desc: 'Tenant discretion toggles. Disabling a module hides tabs & blocks RLS API access.' },
        { name: 'module_settings.gatekeeper', expected: '{"autoApproveGuests": true, "passExpiryHours": 12}', type: 'JSONB Object', desc: 'Controls guest QR pass expiration and auto-approval thresholds.' }
      ]
    },
    {
      category: '🛡️ Committee Roles & Granular RBAC Permissions',
      items: [
        { name: 'SOCIETY_ADMIN', expected: '["*"] (Full System Rights)', type: 'Role Enum', desc: 'Access to Society settings, financial ledgers, committee RBAC, and audit logs.' },
        { name: 'TREASURER', expected: '["billing:write", "expenses:write", "audit:read"]', type: 'Role Enum', desc: 'Financial invoice publishing and payouts. Blocked from Gatekeeper security logs.' },
        { name: 'SECRETARY', expected: '["voting:write", "notices:write", "helpdesk:write"]', type: 'Role Enum', desc: 'AGM poll creation & broadcasts. Blocked from modifying financial settings.' }
      ]
    }
  ];

  const guides = [
    {
      id: 'admin-guide',
      title: '🚀 Admin Onboarding & Setup',
      desc: 'Step-by-step walkthrough to configure your housing society from scratch.',
      steps: [
        'Open Society Settings to enter your society name, postal address, and wing configuration (or standalone structure).',
        'Import Resident Directory using the CSV template or manually add flat numbers, owner contacts, and tenants.',
        'Set up Maintenance Billing Rules in Financial Settings (flat rate, SqFt rate, or water sub-meter add-ons).',
        'Configure Security Gatekeeper Passcode and train security staff on visitor check-ins.',
        'Activate or deactivate modules in the Module Settings / Feature Catalog.'
      ]
    },
    {
      id: 'gatekeeper-guide',
      title: '🛡️ Gatekeeper Security & Passcode Guide',
      desc: 'How security guards manage visitors, delivery partners, and pre-approved passes.',
      steps: [
        'Security guard logs into the Gatekeeper Terminal or Mobile App using the society security passcode (default: admin123).',
        'When a visitor arrives, the guard inputs Visitor Name, Flat Number, Contact, and Purpose (Delivery/Cab/Guest).',
        'An instant Expo Push Notification alert is sent to the resident\'s mobile app.',
        'Resident approves or rejects entry on their phone. Approved entry logs check-in time automatically.',
        'For pre-approved visitors, the resident generates an OTP or QR pass in advance for 1-tap gate entry.'
      ]
    },
    {
      id: 'resident-guide',
      title: '📱 Resident Mobile App Walkthrough',
      desc: 'How residents pay dues, log tickets, and pre-approve guests.',
      steps: [
        'Resident logs in using registered Email or Phone number + custom passcode.',
        'View outstanding maintenance invoices and tap "Pay Now" via UPI, Credit Card, or Netbanking.',
        'Log maintenance complaints (plumbing, electrical, elevator) with photos and urgency levels.',
        'Pre-approve guest visits so visitors bypass gate verification delays.',
        'Participate in AGM Resolution Polling and book society facilities (clubhouse, pool).'
      ]
    },
    {
      id: 'billing-guide',
      title: '💳 Maintenance Billing & Gateway Setup',
      desc: 'Automating monthly invoice creation and payment gateway reconciliation.',
      steps: [
        'Set invoice generation date and due dates (e.g. 5th of every month).',
        'Provide your Society UPI ID or Razorpay API Credentials in Admin Settings.',
        'When residents pay, payments auto-reconcile with status moving from "Unpaid" to "Paid".',
        'Download 1-Click PDF/CSV Ledger Statements for society audits and GST filings.'
      ]
    }
  ];

  const workflows = [
    {
      id: 'visitor-flow',
      title: '🔄 Gatekeeper Visitor Verification Flow',
      diagram: [
        '1. Visitor arrives at Main Gate ➔ Gatekeeper logs entry on tablet',
        '2. System triggers Expo Push Notification ➔ Resident receives smartphone alert',
        '3. Resident taps "Approve Entry" ➔ Gatekeeper screen shows green confirmation',
        '4. Visitor enters society ➔ Check-out time logged when leaving gate'
      ]
    },
    {
      id: 'water-flow',
      title: '💧 Water Meter Consumption & Billing Cycle',
      diagram: [
        '1. Sub-meter reader enters current month reading for Flat No',
        '2. System subtracts previous reading to calculate net units consumed',
        '3. Multiplies by rate per unit (e.g. ₹15/unit)',
        '4. Adds water charge automatically to Flat\'s monthly maintenance invoice'
      ]
    },
    {
      id: 'polling-flow',
      title: '🗳️ AGM Digital Voting & Quorum Calculation',
      diagram: [
        '1. Committee drafts AGM Resolution Poll (e.g. Painting Works Approval)',
        '2. Open voting period set for 7 days with push notifications to all flats',
        '3. 1 Flat = 1 Vote rule enforced automatically via flat registry',
        '4. Live bar chart results generated with quorum % verification'
      ]
    }
  ];

  const troubleshooting = [
    {
      error: 'Resident unable to log in / Phone number not found',
      question: '🔑 Error: "Resident unable to log in / Phone number not found"',
      cause: 'The resident\'s phone number is either not registered in the Resident Directory or formatted without the proper country code prefix.',
      answer: '1. Admin opens Resident Directory.\n2. Search for target flat number.\n3. Verify phone number format (+91 XXXXX XXXXX).\n4. Ensure member status is set to "Active".\n5. Click "Resend Login Invite" to trigger SMS/Email credentials.'
    },
    {
      error: 'Duplicate flat entry error during CSV import',
      question: '📄 Error: "Duplicate flat entry error during CSV import"',
      cause: 'The CSV file contains duplicate flat numbers, or the flat already exists in the society directory.',
      answer: '1. Open the CSV file in Excel/Google Sheets.\n2. Run "Remove Duplicates" on the FlatNo column.\n3. In Admin Console, verify if flats are already registered under another Wing.\n4. Re-upload clean CSV file.'
    },
    {
      error: 'Maintenance invoice generated with incorrect amount',
      question: '💰 Error: "Maintenance invoice generated with incorrect amount"',
      cause: 'Inaccurate flat area (SqFt) setting in flat profile or incorrect base rate configuration in Billing Rules.',
      answer: '1. Navigate to Billing Rules and check flat rate vs per SqFt rate.\n2. Verify flat details under Resident Directory to ensure correct SqFt area.\n3. Delete draft batch invoice, update flat rates, and regenerate batch.'
    },
    {
      error: 'Payment receipt submitted but invoice status still shows Overdue',
      question: '🧾 Error: "Payment receipt submitted but invoice status still shows Overdue"',
      cause: 'Offline bank transfer pending Treasurer manual approval or payment gateway webhook callback failed.',
      answer: '1. Treasurer opens Payments Ledger ➔ Pending Approvals.\n2. Verify transaction reference number against society bank statement.\n3. Click "Approve Payment" to flip invoice status to "Paid".'
    },
    {
      error: 'Gatekeeper push notification not received by resident',
      question: '🔔 Error: "Gatekeeper push notification not received by resident"',
      cause: 'Mobile device lacks Expo Push Token registration or notifications disabled in phone OS settings.',
      answer: '1. Ensure resident has logged into the mobile app on a physical device.\n2. Verify notification permissions in phone OS Settings.\n3. Check token status in Admin Console ➔ Push Tokens Register.'
    },
    {
      error: 'Water meter reading entry fails or displays negative consumption',
      question: '💧 Error: "Water meter reading entry fails or displays negative consumption"',
      cause: 'Current meter reading entered is less than the previous recorded reading.',
      answer: '1. Verify physical meter dial reading.\n2. Ensure current reading is greater than previous month reading.\n3. If meter was replaced, log a "Meter Replacement Entry" in Water Meter module to reset baseline.'
    },
    {
      error: 'Poll vote rejected (\'You have already voted for this flat\')',
      question: '🗳️ Error: "Poll vote rejected (\'You have already voted for this flat\')"',
      cause: 'Another registered member/co-owner from the same flat number has already submitted a ballot for this motion.',
      answer: '1. Platform strictly enforces 1-Flat = 1-Vote policy as per Bye-Law 114.\n2. Admin can inspect voting audit trail to view timestamp and member who cast the flat\'s vote.'
    },
    {
      error: 'Supabase Database Connection errors',
      question: '⚡ How to fix Supabase Database Connection errors?',
      cause: 'Incorrect Supabase configuration or missing table schemas.',
      answer: 'Ensure your Supabase URL and Anon Key are correctly saved in the Cloud Sync Modal. Verify that table schemas (Members, Complaints, Invoices) are created using SupabaseSchema.sql.'
    },
    {
      error: 'India DPDP Act 2023 Compliance',
      question: '🛡️ How is India DPDP Act 2023 Compliance ensured?',
      cause: 'Data privacy audit requirement.',
      answer: 'Every resident consent for data processing (email, phone, visitor log) is recorded in the UserConsents database table with IP address, timestamp, and policy version under India DPDP Act 2023.'
    }
  ];

  const filteredFaqs = troubleshooting.filter((faq) => {
    if (!faqSearchQuery.trim()) return true;
    const q = faqSearchQuery.toLowerCase();
    return (
      faq.question.toLowerCase().includes(q) ||
      faq.answer.toLowerCase().includes(q) ||
      faq.cause.toLowerCase().includes(q) ||
      faq.error.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-xl h-full ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} border-l shadow-2xl flex flex-col justify-between overflow-hidden`}
      >
        {/* Header */}
        <div className={`p-5 border-b ${isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-slate-50'} flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl text-white shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight flex items-center gap-2">
                In-App Knowledge Base & Guides
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Quick setup guides, visual workflows, and troubleshooting tips.
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

        {/* Category Navigation Bar */}
        <div className={`flex border-b ${isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-100/50'} p-1.5 gap-1 shrink-0`}>
          <button
            onClick={() => setActiveCategory('guides')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeCategory === 'guides'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Setup Guides</span>
          </button>
          <button
            onClick={() => setActiveCategory('config')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeCategory === 'config'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Config & Formats</span>
          </button>
          <button
            onClick={() => setActiveCategory('workflows')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeCategory === 'workflows'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>Workflows</span>
          </button>
          <button
            onClick={() => setActiveCategory('troubleshooting')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeCategory === 'troubleshooting'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FAQs & Fixes</span>
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeCategory === 'guides' && (
            <div className="space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {guides.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setActiveGuideId(g.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                      activeGuideId === g.id
                        ? 'bg-purple-900/40 border border-purple-500/50 text-purple-300'
                        : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {g.title.split(' ')[0]} {g.title.split(' ')[1]}
                  </button>
                ))}
              </div>

              {guides
                .filter((g) => g.id === activeGuideId)
                .map((guide) => (
                  <div
                    key={guide.id}
                    className={`p-4 rounded-xl border ${
                      isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                    } space-y-4`}
                  >
                    <div>
                      <h3 className="text-base font-extrabold text-purple-400">
                        {guide.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {guide.desc}
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-2 border-t border-slate-800/60">
                      {guide.steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs">
                          <span className="w-5 h-5 rounded-full bg-purple-950 text-purple-400 border border-purple-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-slate-300 leading-relaxed">
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {activeCategory === 'config' && (
            <div className="space-y-4">
              {configurableSettings.map((group, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border ${
                    isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  } space-y-3`}
                >
                  <h3 className="text-xs font-extrabold text-purple-400 uppercase tracking-wider">
                    {group.category}
                  </h3>
                  <div className="space-y-2.5">
                    {group.items.map((item, i) => (
                      <div key={i} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-200">{item.name}</span>
                          <span className="px-2 py-0.5 rounded-md bg-purple-950/80 text-purple-300 border border-purple-800/60 text-[10px] font-mono font-semibold">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-sans">
                          {item.desc}
                        </p>
                        <div className="text-[11px] font-mono text-emerald-400 bg-slate-950 p-2 rounded-md border border-slate-800/80 mt-1">
                          <span className="text-slate-500 font-extrabold text-[9px] block uppercase">Expected Value / Example:</span>
                          {item.expected}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeCategory === 'workflows' && (
            <div className="space-y-4">
              {workflows.map((wf) => (
                <div
                  key={wf.id}
                  className={`p-4 rounded-xl border ${
                    isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  } space-y-3`}
                >
                  <h3 className="text-sm font-extrabold text-indigo-400">
                    {wf.title}
                  </h3>
                  <div className="space-y-2 pl-2 border-l-2 border-indigo-500/40">
                    {wf.diagram.map((item, idx) => (
                      <p key={idx} className="text-xs text-slate-300 font-sans leading-relaxed">
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeCategory === 'troubleshooting' && (
            <div className="space-y-4">
              {/* Search Bar for Troubleshooting */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search errors, causes, or resolutions (e.g. invoice, login, water)..."
                  value={faqSearchQuery}
                  onChange={(e) => setFaqSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                    isDark 
                      ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500' 
                      : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'
                  }`}
                />
                {faqSearchQuery && (
                  <button
                    onClick={() => setFaqSearchQuery('')}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Clear
                  </button>
                )}
              </div>

              {filteredFaqs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto opacity-60" />
                  <p className="text-xs font-semibold">No matching troubleshooting solutions found</p>
                  <p className="text-[10px] text-slate-400">Try searching for keywords like "login", "invoice", "CSV", or "gatekeeper"</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFaqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border ${
                        isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                      } space-y-2.5 transition-all hover:border-purple-500/30`}
                    >
                      <h4 className="text-xs font-extrabold text-amber-400 flex items-start gap-2 leading-snug">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span>{faq.question}</span>
                      </h4>

                      {faq.cause && (
                        <div className={`p-2 rounded-lg text-[11px] font-medium ${
                          isDark ? 'bg-amber-950/30 text-amber-200/90 border border-amber-900/40' : 'bg-amber-50 text-amber-900 border border-amber-200/60'
                        }`}>
                          <span className="font-extrabold uppercase text-[9px] block text-amber-500 tracking-wider">Root Cause:</span>
                          {faq.cause}
                        </div>
                      )}

                      <div className="text-xs text-slate-300 leading-relaxed space-y-1 pt-1">
                        <span className="font-extrabold text-[10px] uppercase text-purple-400 tracking-wider block">Step-By-Step Resolution:</span>
                        <div className="whitespace-pre-line font-mono text-[11px] text-slate-300 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-slate-50'} flex justify-between items-center shrink-0`}>
          <span className="text-xs text-slate-500">
            Smart Housing Society SaaS Docs v2.5
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs border border-slate-700 transition-all cursor-pointer"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};

export default HowToHelpDrawer;
