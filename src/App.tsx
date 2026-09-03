import React, { useEffect, useState, useMemo } from 'react';
import { useA11yStore } from './store/a11yStore';
import { registerCoreTools, mountEphemeralCommitTool, registerDiagnosticTools } from './lib/webmcp/tools';
import { Fixtures } from './components/Fixtures';
import { 
  Cpu, 
  ShieldCheck, 
  ShieldAlert, 
  Crosshair, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  Layers, 
  ListFilter, 
  Eye, 
  Lock, 
  Code2, 
  AlertTriangle, 
  Search, 
  Download, 
  Check, 
  Copy,
  Info,
  Shield
} from 'lucide-react';

export const App: React.FC = () => {
  const {
    activeFixture,
    loadFixture,
    currentEpoch,
    stagedPatch,
    highlightedSelector,
    activityLog,
    isCommitMounted,
    approvePatch,
    clearStagedPatch,
    epochConflict,
    incrementEpoch
  } = useA11yStore();

  const [toolCount, setToolCount] = useState(6);
  const [logFilter, setLogFilter] = useState('');
  const [copiedPatch, setCopiedPatch] = useState(false);

  useEffect(() => {
    const initWebMCP = async () => {
      if (!document.modelContext) return;
      
      try {
        await registerCoreTools();
        
        const updateToolCount = async () => {
          try {
            if (document.modelContext?.getTools) {
              const tools = await document.modelContext.getTools();
              setToolCount(tools.length);
            } else {
              setToolCount(6);
            }
          } catch (e) {
            console.error("Failed to fetch tools:", e);
          }
        };

        await updateToolCount();
        
        if (document.modelContext) {
          document.modelContext.ontoolchange = () => updateToolCount();
        }
      } catch (err) {
        console.error("WebMCP Registration Error:", err);
      }
    };

    initWebMCP();
  }, []);

  const handleApprove = () => {
    if (!stagedPatch) return;
    approvePatch();
    mountEphemeralCommitTool(stagedPatch.id);
  };

  const handleCopyPatch = () => {
    if (!stagedPatch) return;
    navigator.clipboard.writeText(JSON.stringify(stagedPatch.attributes, null, 2));
    setCopiedPatch(true);
    setTimeout(() => setCopiedPatch(false), 2000);
  };

  // Filter real activity log
  const filteredLogs = useMemo(() => {
    if (!logFilter) return activityLog;
    const query = logFilter.toLowerCase();
    return activityLog.filter(log => 
      log.toolName.toLowerCase().includes(query) ||
      JSON.stringify(log.input).toLowerCase().includes(query) ||
      (log.alert && log.alert.toLowerCase().includes(query))
    );
  }, [activityLog, logFilter]);

  const targetSelectorDisplay = useMemo(() => {
    if (activeFixture === 'combobox') return '#custom-combobox';
    if (activeFixture === 'modal') return '#modal-box';
    if (activeFixture === 'contrast') return '#contrast-fail-text';
    return '#fixture-container';
  }, [activeFixture]);

  const fixtureDescription = useMemo(() => {
    if (activeFixture === 'combobox') return 'WCAG 2.2 § 4.1.2: Unsemantic <div> dropdown missing role="combobox", aria-expanded, and keyboard active-descendant focus.';
    if (activeFixture === 'modal') return 'WCAG 2.2 § 2.1.2: Modal overlay missing role="dialog", aria-modal="true", and leaking Tab navigation to background controls.';
    if (activeFixture === 'contrast') return 'WCAG 2.2 § 1.4.3: Alpha-composited foreground text with measured contrast ratio below the 4.5:1 AA compliance threshold.';
    return 'Interactive testing target sandbox for real-time WebMCP accessibility auditing.';
  }, [activeFixture]);

  return (
    <div className="h-screen max-h-screen w-screen bg-[#08090d] text-zinc-100 flex flex-col font-sans overflow-hidden antialiased select-none">
      
      {/* 1. TOP HEADER (Vibrant Dark Studio Navigation) */}
      <header className="h-13 flex-shrink-0 border-b border-white/[0.08] bg-[#0c0e14]/95 backdrop-blur-xl px-4 flex items-center justify-between z-50">
        
        {/* Left: Branding & Studio Label */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-600/30 border border-indigo-400/40">
              <span className="text-white font-black text-xs tracking-tighter">AL</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-sm font-extrabold text-white tracking-tight">AriaLens</h1>
              <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
                WebMCP Studio
              </span>
            </div>
          </div>
        </div>

        {/* Center: Interactive Target Tabs (Sleek Postman / Linear Strip) */}
        <div className="flex items-center bg-[#050608] p-1 rounded-xl border border-white/[0.08] shadow-inner">
          <button
            onClick={() => loadFixture('combobox')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
              activeFixture === 'combobox'
                ? 'bg-[#151824] text-white shadow-md border border-white/[0.12] text-indigo-300'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5 text-indigo-400" />
            Combobox
          </button>

          <button
            onClick={() => loadFixture('modal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
              activeFixture === 'modal'
                ? 'bg-[#151824] text-white shadow-md border border-white/[0.12] text-purple-300'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            Modal Trap
          </button>

          <button
            onClick={() => loadFixture('contrast')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
              activeFixture === 'contrast'
                ? 'bg-[#151824] text-white shadow-md border border-white/[0.12] text-emerald-300'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            Contrast Grid
          </button>
        </div>

        {/* Right: Telemetry Chips & Controls with Rich Tooltips */}
        <div className="flex items-center gap-2">
          
          {/* Active Bridge Indicator Tooltip */}
          <div className="tooltip-trigger relative">
            <div className="flex items-center gap-2 bg-[#10121a] hover:bg-[#161824] px-2.5 py-1.5 rounded-lg border border-white/[0.08] text-xs font-mono transition cursor-pointer">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-zinc-200 font-medium">Live Bridge</span>
            </div>
            <div className="tooltip-content absolute top-full right-0 mt-2 w-64 bg-[#141722] border border-white/15 p-2.5 rounded-xl shadow-2xl text-[11px] font-sans text-zinc-300 z-50">
              <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                W3C WebMCP Connected
              </div>
              Running inside live browser runtime. Exposes dynamic inspection tools via <code className="text-indigo-300 font-mono text-[10px]">document.modelContext</code>.
            </div>
          </div>

          {/* Epoch Concurrency Tooltip */}
          <div className="tooltip-trigger relative">
            <div className="flex items-center gap-1.5 bg-[#10121a] hover:bg-[#161824] px-2.5 py-1.5 rounded-lg border border-white/[0.08] text-xs font-mono transition cursor-pointer">
              <Cpu className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-zinc-400">Epoch:</span>
              <span className="text-emerald-400 font-bold tabular-nums">#{currentEpoch}</span>
            </div>
            <div className="tooltip-content absolute top-full right-0 mt-2 w-72 bg-[#141722] border border-white/15 p-2.5 rounded-xl shadow-2xl text-[11px] font-sans text-zinc-300 z-50">
              <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                Optimistic Concurrency Lock
              </div>
              Prevents TOCTOU race conditions. Patches audited against older epochs are rejected if the live DOM state changes before commit.
            </div>
          </div>

          {/* Tools Count Tooltip */}
          <div className="tooltip-trigger relative">
            <div className="flex items-center gap-1.5 bg-[#10121a] hover:bg-[#161824] px-2.5 py-1.5 rounded-lg border border-white/[0.08] text-xs font-mono transition cursor-pointer">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-zinc-400">Tools:</span>
              <span className="text-indigo-300 font-bold tabular-nums">{toolCount}</span>
            </div>
            <div className="tooltip-content absolute top-full right-0 mt-2 w-72 bg-[#141722] border border-white/15 p-2.5 rounded-xl shadow-2xl text-[11px] font-sans text-zinc-300 z-50">
              <div className="font-bold text-white mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Mounted WebMCP Capabilities
              </div>
              <ul className="space-y-1 font-mono text-[10px] text-zinc-300">
                <li className="text-indigo-300">• audit_accessibility_tree</li>
                <li className="text-amber-300">• stage_aria_remediation</li>
                <li className="text-purple-300">• trace_keyboard_trap</li>
                <li className="text-blue-300">• check_contrast_ratios</li>
                <li className="text-emerald-300">• preview_screen_reader</li>
                <li className="text-rose-300 font-semibold">• bulk_apply_all_fixes (Honeypot)</li>
              </ul>
            </div>
          </div>

          {/* Bump Epoch Button with Tooltip */}
          <div className="tooltip-trigger relative">
            <button
              onClick={() => incrementEpoch()}
              className="px-3 py-1.5 rounded-lg bg-[#12141e] hover:bg-[#1a1e2d] text-zinc-300 hover:text-white border border-white/[0.1] text-xs font-mono font-medium transition focus:outline-none flex items-center gap-1.5 shadow-sm"
            >
              <span>Bump Epoch</span>
              <span className="text-indigo-400 font-bold">+1</span>
            </button>
            <div className="tooltip-content absolute top-full right-0 mt-2 w-64 bg-[#141722] border border-white/15 p-2.5 rounded-xl shadow-2xl text-[11px] font-sans text-zinc-300 z-50">
              <div className="font-bold text-white mb-1">Simulate Human Drift</div>
              Increments the current epoch counter. If an agent tries applying a patch formulated before this click, the system blocks it with a <span className="text-rose-400 font-mono text-[10px]">STALE_EPOCH_CONFLICT</span>.
            </div>
          </div>

        </div>
      </header>

      {/* 2. MAIN WORKSPACE (Split Studio Canvas) */}
      <main className="flex-1 min-h-0 p-3.5 grid grid-cols-12 gap-3.5 overflow-hidden">
        
        {/* LEFT COLUMN: INTERACTIVE DOM TARGET SANDBOX (7 COLS) */}
        <div className="col-span-7 flex flex-col h-full min-h-0 bg-[#0d0f16] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
          
          {/* Target Address & Selector Bar */}
          <div className="h-11 flex-shrink-0 border-b border-white/[0.06] bg-[#11141e] px-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <span className="px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold font-mono tracking-wider">
                DOM TARGET
              </span>
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-300 bg-[#07080c] px-3 py-1 rounded-lg border border-white/[0.08] flex-1 max-w-sm truncate shadow-inner">
                <span className="text-zinc-500 select-none">selector:</span>
                <span className="text-white font-bold">{targetSelectorDisplay}</span>
              </div>
            </div>

            {/* Target Crosshair Badge */}
            {highlightedSelector ? (
              <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded-lg text-[10px] font-mono animate-pulse">
                <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                <span>Auditing: {highlightedSelector}</span>
              </div>
            ) : (
              <div className="tooltip-trigger relative">
                <div className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 cursor-pointer">
                  <Info className="w-3.5 h-3.5" />
                  <span>Target Details</span>
                </div>
                <div className="tooltip-content absolute top-full right-0 mt-2 w-72 bg-[#141722] border border-white/15 p-2.5 rounded-xl shadow-2xl text-[11px] font-sans text-zinc-300 z-50">
                  <div className="font-bold text-white mb-1">Target Description</div>
                  {fixtureDescription}
                </div>
              </div>
            )}
          </div>

          {/* Canvas Area */}
          <div className="flex-1 min-h-0 p-4 flex flex-col justify-center relative overflow-hidden bg-gradient-to-b from-[#090b10] via-[#0b0d14] to-[#08090d]">
            
            {/* EPOCH CONFLICT ALERT BANNER */}
            {epochConflict && (
              <div className="absolute top-3 left-3 right-3 z-40 bg-rose-950/95 border border-rose-500/60 text-rose-200 px-4 py-2.5 rounded-xl text-xs shadow-2xl backdrop-blur-md flex items-center justify-between animate-in slide-in-from-top">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <div>
                    <strong className="font-bold text-rose-300">⛔ STALE_EPOCH_CONFLICT:</strong> Live DOM changed during agent analysis. Staged mutation rejected to preserve consistency.
                  </div>
                </div>
                <button 
                  onClick={() => useA11yStore.getState().setEpochConflict(false)}
                  className="px-2.5 py-1 bg-rose-900 hover:bg-rose-800 text-rose-200 rounded-lg text-xs font-medium transition"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Preserved Fixture Sandbox */}
            <div className="flex-1 min-h-0 flex flex-col justify-center overflow-y-auto">
              <Fixtures
                activeFixture={activeFixture as 'none' | 'modal' | 'combobox' | 'contrast'}
                appliedPatches={useA11yStore.getState().appliedPatches}
              />
            </div>
          </div>

          {/* Sandbox Footer */}
          <div className="h-9 flex-shrink-0 border-t border-white/[0.06] bg-[#0c0e14] px-4 flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Runtime: <strong className="text-zinc-400 font-medium">axe-core 4.10 + AccName 1.1 + WCAG 2.2</strong>
            </span>
            <span className="text-zinc-400">Sandbox Ready</span>
          </div>
        </div>

        {/* RIGHT COLUMN: AUTHORITY GATE & WEBMCP LIVE LOG (5 COLS) */}
        <div className="col-span-5 flex flex-col h-full min-h-0 gap-3.5 overflow-hidden">
          
          {/* 1. HITL AUTHORITY BOUNDARY CARD (Diff Inspector Style) */}
          <div className="flex-shrink-0 bg-[#0d0f16] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Header */}
            <div className="h-11 flex-shrink-0 border-b border-white/[0.06] bg-[#11141e] px-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Authority Boundary
                </h3>
              </div>
              
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 ${
                stagedPatch 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                  : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              }`}>
                {stagedPatch ? 'Awaiting Human Approval' : 'HITL Gate Armed'}
              </span>
            </div>

            {/* Staged Content Body */}
            <div className="p-3.5">
              {stagedPatch ? (
                <div className="space-y-3">
                  {/* Diff Inspector Card */}
                  <div className="bg-[#07080c] border border-white/[0.08] rounded-xl overflow-hidden font-mono text-xs shadow-inner">
                    <div className="bg-[#11141e] px-3 py-2 border-b border-white/[0.06] flex items-center justify-between text-[11px]">
                      <span className="text-indigo-300 font-semibold flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                        Patch: {stagedPatch.id.slice(0, 8)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500">Epoch #{currentEpoch}</span>
                        <button 
                          onClick={handleCopyPatch}
                          title="Copy patch JSON"
                          className="p-1 hover:bg-white/[0.08] rounded text-zinc-400 hover:text-white transition"
                        >
                          {copiedPatch ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Diff Body with Vibrant Green Additions */}
                    <div className="p-3 space-y-1.5 bg-[#050608] max-h-36 overflow-y-auto">
                      <div className="text-zinc-500 text-[10px] pb-1 border-b border-white/[0.04]">
                        target selector: <span className="text-zinc-300 font-bold">{stagedPatch.selector}</span>
                      </div>
                      {Object.entries(stagedPatch.attributes).map(([attr, val]) => (
                        <div key={attr} className="flex items-center gap-2 text-emerald-300 bg-emerald-950/25 px-2.5 py-1 rounded-lg border border-emerald-500/30 text-[11px]">
                          <span className="text-emerald-400 font-bold select-none">+</span>
                          <span className="font-semibold text-emerald-200">{attr}=</span>
                          <span className="text-emerald-400">"{val}"</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Decision Buttons */}
                  <div className="flex gap-2.5">
                    <button
                      onClick={handleApprove}
                      disabled={isCommitMounted}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 focus:outline-none ${
                        isCommitMounted
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 cursor-not-allowed shadow-inner'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/80 border border-emerald-400/30'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {isCommitMounted ? 'Commit Tool Mounted (Waiting Agent)' : 'Approve & Mount Commit Tool'}
                    </button>
                    <button
                      onClick={() => {
                        clearStagedPatch();
                        registerDiagnosticTools();
                      }}
                      className="px-4 py-2.5 bg-[#141620] hover:bg-[#1c202e] text-zinc-300 border border-white/[0.08] rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4 text-zinc-400" />
                      Reject
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-5 px-4 text-center border border-dashed border-white/[0.08] rounded-xl bg-[#06070a] flex flex-col items-center justify-center gap-1.5">
                  <ShieldCheck className="w-6 h-6 text-emerald-400 mb-0.5" />
                  <span className="text-zinc-200 font-semibold text-xs">No active staged mutation</span>
                  <span className="text-[11px] text-zinc-500 font-sans max-w-xs leading-relaxed">
                    Diagnostic read tools run freely across the runtime. Destructive DOM mutation tools stay unmounted until you explicitly approve a staged patch.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 2. WEBMCP LIVE LOG (Real Tool Execution Console) */}
          <div className="flex-1 min-h-0 bg-[#0d0f16] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Console Header */}
            <div className="h-11 flex-shrink-0 border-b border-white/[0.06] bg-[#11141e] px-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">WebMCP Live Log</h3>
                <span className="text-[10px] font-mono bg-white/[0.06] text-zinc-300 px-2 py-0.5 rounded-md font-medium">
                  {activityLog.length} events
                </span>
              </div>

              {/* Filter and Download Controls */}
              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={logFilter}
                    onChange={(e) => setLogFilter(e.target.value)}
                    className="bg-[#07080c] border border-white/10 rounded-lg pl-6 pr-2.5 py-1 text-[11px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 font-mono w-28 shadow-inner"
                  />
                </div>

                {activityLog.length > 0 && (
                  <button
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(activityLog, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `arialens-log-epoch-${currentEpoch}.json`;
                      a.click();
                    }}
                    title="Export log as JSON"
                    className="p-1.5 rounded-lg bg-[#07080c] border border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Event Feed */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5 font-mono">
              {filteredLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-600">
                  <Terminal className="w-7 h-7 text-zinc-700 mb-2" />
                  <p className="text-xs font-semibold text-zinc-400">Awaiting WebMCP invocations...</p>
                  <span className="text-[10px] text-zinc-600 mt-1 font-sans">
                    Ask ChatGPT to audit or stage patches to see live tool calls appear here.
                  </span>
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const isHoneypot = log.alert?.includes('HONEYPOT');
                  const isStaging = log.toolName === 'stage_aria_remediation';
                  const isCommit = log.toolName === 'commit_a11y_fix';

                  return (
                    <div 
                      key={log.id} 
                      className={`p-2.5 rounded-xl text-xs transition border ${
                        isHoneypot
                          ? 'bg-rose-950/20 border-rose-800/40 hover:border-rose-700/60'
                          : isStaging
                          ? 'bg-amber-950/20 border-amber-800/40 hover:border-amber-700/60'
                          : isCommit
                          ? 'bg-emerald-950/20 border-emerald-800/40 hover:border-emerald-700/60'
                          : 'bg-[#07080c] border-white/[0.06] hover:border-white/15'
                      }`}
                    >
                      {/* Top Header Row */}
                      <div className="flex items-center justify-between text-zinc-400 mb-1.5">
                        <span className={`font-bold text-[11px] flex items-center gap-1.5 ${
                          isHoneypot ? 'text-rose-400' : isStaging ? 'text-amber-400' : isCommit ? 'text-emerald-400' : 'text-indigo-400'
                        }`}>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.08] uppercase tracking-wider font-semibold">
                            CALL
                          </span>
                          {log.toolName}
                        </span>
                        <span className="text-[10px] text-zinc-600 tabular-nums">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      {/* Formatted Input Payload */}
                      <div className="text-zinc-400 text-[10px] bg-black/60 p-2 rounded-lg border border-white/5 break-all shadow-inner">
                        {JSON.stringify(log.input)}
                      </div>

                      {/* Security Warning Badge */}
                      {log.alert && (
                        <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${
                          isHoneypot 
                            ? 'bg-rose-950/80 border-rose-800/80 text-rose-300' 
                            : 'bg-amber-950/80 border-amber-800/80 text-amber-300'
                        }`}>
                          <AlertTriangle className="w-2.5 h-2.5" />
                          {log.alert}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
