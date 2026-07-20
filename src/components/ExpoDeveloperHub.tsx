import React, { useState } from 'react';
import { 
  BookOpen, 
  Code2, 
  Copy, 
  Check, 
  Database,
  ExternalLink, 
  Flame, 
  Settings, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { EXPO_APP_TSX, EXPO_API_TS, EXPO_PACKAGE_JSON, SUPABASE_SQL_SCHEMA } from '../data/expoCode';

interface ExpoDeveloperHubProps {
  onSetSupabase: (url: string, anonKey: string) => void;
  supabaseUrl: string;
  supabaseAnonKey: string;
  onPushMockData: () => Promise<{ success: boolean; error?: string }>;
}

export default function ExpoDeveloperHub({ 
  onSetSupabase, 
  supabaseUrl, 
  supabaseAnonKey, 
  onPushMockData 
}: ExpoDeveloperHubProps) {
  const [activeHubTab, setActiveHubTab] = useState<'guide' | 'code'>('guide');
  const [activeCodeFile, setActiveCodeFile] = useState<'app' | 'api' | 'package' | 'schema'>('app');
  const [copied, setCopied] = useState<string | null>(null);
  
  const [inputUrl, setInputUrl] = useState(supabaseUrl);
  const [inputKey, setInputKey] = useState(supabaseAnonKey);
  
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);

  const getCodeString = () => {
    switch (activeCodeFile) {
      case 'app': return EXPO_APP_TSX;
      case 'api': return EXPO_API_TS;
      case 'package': return EXPO_PACKAGE_JSON;
      case 'schema': return SUPABASE_SQL_SCHEMA;
    }
  };

  const getFileName = () => {
    switch (activeCodeFile) {
      case 'app': return 'App.js / App.tsx';
      case 'api': return 'api.js / api.ts';
      case 'package': return 'package.json';
      case 'schema': return 'SupabaseSchema.sql';
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    onSetSupabase(inputUrl, inputKey);
  };

  const handlePushMock = async () => {
    if (seeding) return;
    setSeeding(true);
    setSeedSuccess(false);
    setSeedError(null);
    try {
      const res = await onPushMockData();
      if (res && !res.success) {
        setSeedError(res.error || 'Failed to seed database.');
      } else {
        setSeedSuccess(true);
        setTimeout(() => setSeedSuccess(false), 4000);
      }
    } catch (err: any) {
      setSeedError(err.message || String(err));
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-100 overflow-hidden font-sans">
      {/* Dev Hub Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-purple-600/30 text-purple-400 border border-purple-500/30 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Expo Developer Hub
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-100 mt-1">Greenwood Society Connect</h2>
        </div>

        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveHubTab('guide')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeHubTab === 'guide'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Setup Guide
          </button>
          <button
            onClick={() => setActiveHubTab('code')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeHubTab === 'code'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Source Code
          </button>
        </div>
      </div>

      {/* Connection Endpoint Configuration Panel */}
      <div className="p-4 bg-slate-950/60 border-b border-slate-800 font-sans">
        <form onSubmit={handleSaveCredentials} className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Settings className="w-3.5 h-3.5 text-purple-400" />
            Supabase Connection Settings
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Project URL</span>
              <input
                type="url"
                placeholder="https://your-project.supabase.co"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">API Anon Key</span>
              <input
                type="text"
                placeholder="eyJhbGciOi..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none font-mono"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center gap-2 mt-1">
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 transition-colors text-white font-medium px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow"
            >
              <Database className="w-3.5 h-3.5" />
              Update Simulator Backend
            </button>
            
            {supabaseUrl && supabaseAnonKey && (
              <button
                type="button"
                onClick={handlePushMock}
                disabled={seeding}
                className={`text-[11px] font-bold px-3 py-2 rounded-lg border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  seedSuccess 
                    ? 'bg-green-950 border-green-500/30 text-green-400' 
                    : 'bg-purple-950/40 border-purple-500/30 hover:bg-purple-900/50 text-purple-300'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
                {seeding ? 'Syncing...' : seedSuccess ? 'Mock Data Seeding Complete!' : 'Seed Supabase with Mock Data'}
              </button>
            )}
          </div>

          {supabaseUrl && supabaseAnonKey ? (
            <div className="text-[11px] text-green-400 flex items-center gap-1.5 mt-1 bg-green-950/30 border border-green-500/20 px-3 py-2 rounded-lg">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span><strong>Live Connected!</strong> The mobile simulator is now reading/writing directly to your Supabase tables.</span>
            </div>
          ) : (
            <div className="text-[11px] text-amber-400 flex items-center gap-1.5 mt-1 bg-amber-950/30 border border-amber-500/20 px-3 py-2 rounded-lg">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span><strong>Offline Sandbox Mode:</strong> Enter your Supabase credentials above to sync with your real cloud database!</span>
            </div>
          )}

          {seedError && (
            <div className="text-[11px] text-red-400 flex flex-col gap-1.5 mt-1 bg-red-950/40 border border-red-500/30 px-3 py-2.5 rounded-lg">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span>Seeding Failed (Supabase Schema Mismatch)!</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans font-medium text-[11px]">
                {seedError}
              </p>
              <div className="text-slate-400 text-[10px] bg-slate-900/50 p-2 rounded border border-slate-800/80 mt-1">
                <strong>How to fix:</strong> Your database tables are likely missing columns or have the old schema. Go to the <strong>Source Code &gt; SupabaseSchema.sql</strong> tab, copy the script, uncomment the <code>DROP TABLE</code> lines at the very top, and run it in your <strong>Supabase SQL Editor</strong> to recreate them cleanly.
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Main Area based on Tab */}
      <div className="flex-1 overflow-y-auto">
        {activeHubTab === 'guide' ? (
          <div className="p-5 max-w-3xl space-y-6">
            {/* Step 1 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-purple-500 text-white text-xs font-bold font-mono">1</span>
                <h3 className="font-semibold text-slate-200 text-sm">Create Tables in Supabase</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed pl-7 font-sans">
                Go to your <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline hover:text-purple-300">Supabase Dashboard</a>, select your project, open the <strong>SQL Editor</strong> tab on the left sidebar, click <strong>New Query</strong>, paste the complete DDL schema script, and click <strong>Run</strong>.
              </p>
              <div className="pl-7 pt-1">
                <button
                  onClick={() => {
                    setActiveHubTab('code');
                    setActiveCodeFile('schema');
                  }}
                  className="bg-slate-950 hover:bg-slate-800 text-[11px] font-semibold text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 font-sans"
                >
                  <Database className="w-3.5 h-3.5" /> Go to SupabaseSchema.sql File
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-purple-500 text-white text-xs font-bold font-mono">2</span>
                <h3 className="font-semibold text-slate-200 text-sm">Retrieve Project Credentials</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed pl-7 font-sans">
                In your Supabase project, go to <strong>Project Settings &gt; API</strong>. Copy the <strong>Project URL</strong> and the public <strong>anon</strong> key, and enter them in the connection box above.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-purple-500 text-white text-xs font-bold font-mono">3</span>
                <h3 className="font-semibold text-slate-200 text-sm">Run App in Expo Snack or Locally</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed pl-7 font-sans">
                To launch the mobile application immediately on your physical iOS or Android phone, follow these steps:
              </p>
              <div className="pl-7 space-y-3 mt-2 font-sans">
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-500 animate-pulse" /> Option A: Run in Expo Snack (Easiest)
                  </h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    1. Open <a href="https://snack.expo.dev" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline hover:text-purple-300">Expo Snack</a> in your browser.<br />
                    2. In the file list, copy & replace the content of <strong>App.js</strong> (or <strong>App.tsx</strong>) with the code from the source code tab.<br />
                    3. Create a file named <strong>api.js</strong> (or <strong>api.ts</strong>) and paste the code from the <strong>api.js / api.ts</strong> source tab. Put your Supabase keys directly inside the variables.<br />
                    4. Add <code className="text-purple-300 font-mono">lucide-react-native</code>, <code className="text-purple-300 font-mono">axios</code>, and <code className="text-purple-300 font-mono">@react-native-async-storage/async-storage</code> to the package list in Snack.<br />
                    5. Scan the QR code on your phone with the <strong>Expo Go</strong> app!
                  </p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <h4 className="text-xs font-bold text-slate-200">Option B: Run Locally on Terminal</h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    1. Run <code className="text-purple-300 font-mono bg-slate-900 px-1 py-0.5 rounded">npx create-expo-app society-app</code><br />
                    2. Install required packages:<br />
                    <code className="text-purple-400 font-mono block bg-slate-900 p-2 rounded text-[11px] my-1 overflow-x-auto whitespace-nowrap">
                      npx expo install @react-native-async-storage/async-storage lucide-react-native axios
                    </code>
                    3. Copy <strong>App.js</strong> and <strong>api.js</strong> into the project folder.<br />
                    4. Run <code className="text-purple-300 font-mono bg-slate-900 px-1 py-0.5 rounded">npx expo start</code> and scan the terminal QR code!
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            {/* File selection tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950 overflow-x-auto whitespace-nowrap">
              {(['app', 'api', 'package', 'schema'] as const).map((file) => (
                <button
                  key={file}
                  onClick={() => setActiveCodeFile(file)}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors font-sans ${
                    activeCodeFile === file
                      ? 'border-purple-500 text-purple-400 bg-slate-900'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {file === 'app' && 'App.js / App.tsx'}
                  {file === 'api' && 'api.js / api.ts'}
                  {file === 'package' && 'package.json'}
                  {file === 'schema' && 'SupabaseSchema.sql'}
                </button>
              ))}
            </div>

            {/* Code container with Copy Button */}
            <div className="flex-1 flex flex-col min-h-0 bg-slate-950 relative font-sans">
              <div className="absolute right-4 top-4 z-20">
                <button
                  onClick={() => handleCopy(getCodeString(), activeCodeFile)}
                  className="bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-medium flex items-center gap-1.5 shadow transition-all"
                >
                  {copied === activeCodeFile ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Title Header bar */}
              <div className="px-4 py-2.5 bg-slate-900 text-slate-500 text-[11px] font-mono border-b border-slate-800 flex items-center justify-between">
                <span>File: {getFileName()}</span>
                <span className="text-purple-400">
                  {activeCodeFile === 'schema' ? 'Supabase SQL Setup Query' : 'JS & TypeScript Dual-Compatible'}
                </span>
              </div>

              {/* Code Pre Block */}
              <div className="flex-1 overflow-auto p-4 font-mono text-[11px] leading-relaxed text-purple-300/90 selection:bg-purple-900 selection:text-white">
                <pre className="whitespace-pre">{getCodeString()}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
