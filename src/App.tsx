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
  Zap, 
  Search, 
  Download, 
  Check,
  Copy
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

  return (
    <div className="h-screen max-h-screen w-screen bg-[#0a0c10] text-zinc-100 flex flex-col font-sans overflow-hidden antialiased select-none">
      
      {/* 1. TOP HEADER (Postman / Cursor Studio Header) */}
      <header className="h-12 flex-shrink-0 border-b border-white/[0.08] bg-[#0f1117] px-4 flex items-center justify-between z-50">
        
        {/* Left: Branding & Breadcrumb */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30 border border-indigo-400/30">
              <span className="text-white font-bold text-[11px] tracking-tight">AL</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-white tracking-tight">AriaLens</span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-400 font-mono text-[11px]">studio</span>
            </div>
          </div>
        </div>

        {/* Center: Editor-Style Fixture Tabs (Cursor / Postman Tab Strip) */}
        <div className="flex items-center bg-[#08090d] p-0.5 rounded-lg border border-white/[0.08]">
          <button
            onClick={() => loadFixture('combobox')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
              activeFixture === 'combobox'
                ? 'bg-[#181a24] text-white shadow-sm border border-white/[0.08] font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5 text-indigo-400" />
            Combobox
          </button>

          <button
            onClick={() => loadFixture('modal')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
              activeFixture === 'modal'
                ? 'bg-[#181a24] text-white shadow-sm border border-white/[0.08] font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            Modal Trap
          </button>

          <button
            onClick={() => loadFixture('contrast')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
              activeFixture === 'contrast'
                ? 'bg-[#181a24] text-white shadow-sm border border-white/[0.08] font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            Contrast Grid
          </button>
        </div>

        {/* Right: Runtime Telemetry Status Controls */}
        <div className="flex items-center gap-2">
          {/* Active Bridge Indicator */}
          <div className="flex items-center gap-1.5 bg-[#14161f] px-2.5 py-1 rounded-md border border-white/[0.08] text-[11px] font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-zinc-300 font-medium">WebMCP Live</span>
          </div>

          {/* Epoch Counter */}
          <div className="flex items-center gap-1 bg-[#14161f] px-2.5 py-1 rounded-md border border-white/[0.08] text-[11px] font-mono">
            <Cpu className="w-3 h-3 text-zinc-400" />
            <span className="text-zinc-400">Epoch</span>
            <span className="text-emerald-400 font-bold">#{currentEpoch}</span>
          </div>

          {/* Tools Count */}
          <div className="flex items-center gap-1 bg-[#14161f] px-2.5 py-1 rounded-md border border-white/[0.08] text-[11px] font-mono">
            <ShieldCheck className="w-3 h-3 text-indigo-400" />
            <span className="text-zinc-400">Tools:</span>
            <span className="text-indigo-300 font-bold">{toolCount}</span>
          </div>

          {/* Debug Bump Epoch Button */}
          <button
            onClick={() => incrementEpoch()}
            className="px-2.5 py-1 rounded-md bg-indigo-600/90 hover:bg-indigo-600 text-white text-[11px] font-semibold shadow-sm transition flex items-center gap-1 focus:outline-none"
            title="Increment epoch to simulate concurrent human edit"
          >
            <Zap className="w-3 h-3 text-indigo-200" />
            Bump Epoch
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE (Split IDE / Playground Layout) */}
      <main className="flex-1 min-h-0 p-3 grid grid-cols-12 gap-3 overflow-hidden">
        
        {/* LEFT PANE: INTERACTIVE DOM TARGET SANDBOX (7 COLS) */}
        <div className="col-span-7 flex flex-col h-full min-h-0 bg-[#0d0f14] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl">
          
          {/* Postman-Style Request / Target Address Bar */}
          <div className="h-10 flex-shrink-0 border-b border-white/[0.06] bg-[#12141c] px-3 flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold font-mono uppercase tracking-wider">
                DOM TARGET
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-300 bg-[#08090d] px-3 py-1 rounded-md border border-white/[0.08] flex-1 max-w-md truncate">
                <span className="text-zinc-500">selector:</span>
                <span className="text-white font-semibold">{targetSelectorDisplay}</span>
              </div>
            </div>

            {/* Live Inspector Crosshair Badge */}
            {highlightedSelector && (
              <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded text-[10px] font-mono animate-pulse">
                <Crosshair className="w-3 h-3 text-amber-400" />
                <span>Auditing: {highlightedSelector}</span>
              </div>
            )}
          </div>

          {/* Interactive Playground Canvas */}
          <div className="flex-1 min-h-0 p-4 flex flex-col justify-center relative overflow-hidden bg-gradient-to-b from-[#0a0c10] to-[#08090d]">
            
            {/* STALE EPOCH CONFLICT ALERT BANNER */}
            {epochConflict && (
              <div className="absolute top-3 left-3 right-3 z-40 bg-rose-950/95 border border-rose-500/60 text-rose-200 px-3.5 py-2 rounded-lg text-xs shadow-xl backdrop-blur-md flex items-center justify-between animate-in slide-in-from-top">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <div>
                    <strong className="font-bold">⛔ STALE_EPOCH_CONFLICT:</strong> Live DOM modified during agent analysis. Patch rejected to preserve authority boundary.
                  </div>
                </div>
                <button 
                  onClick={() => useA11yStore.getState().setEpochConflict(false)}
                  className="px-2 py-0.5 bg-rose-900 hover:bg-rose-800 text-rose-200 rounded text-[10px] font-medium"
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

          {/* Sandbox Footer Bar */}
          <div className="h-8 flex-shrink-0 border-t border-white/[0.06] bg-[#0f1117] px-3 flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Runtime AccName 1.1 · axe-core 4.10 · WCAG 2.2 Level AA
            </span>
            <span className="text-zinc-400">Interactive DOM Sandbox</span>
          </div>
        </div>

        {/* RIGHT PANE: AUTHORITY GATE & WEBMCP LIVE LOG (5 COLS) */}
        <div className="col-span-5 flex flex-col h-full min-h-0 gap-3 overflow-hidden">
          
          {/* 1. HITL AUTHORITY BOUNDARY GATE (Cursor Code Diff Style) */}
          <div className="flex-shrink-0 bg-[#0d0f14] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Header */}
            <div className="h-10 flex-shrink-0 border-b border-white/[0.06] bg-[#12141c] px-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Authority Boundary</h3>
              </div>
              
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold flex items-center gap-1 ${
                stagedPatch 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                  : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
              }`}>
                {stagedPatch ? 'Awaiting Human Approval' : 'HITL Gate Armed'}
              </span>
            </div>

            {/* Staged Patch Review Pane */}
            <div className="p-3">
              {stagedPatch ? (
                <div className="space-y-2.5">
                  {/* Diff Viewer Card (Cursor / GitHub Style) */}
                  <div className="bg-[#08090d] border border-white/[0.08] rounded-lg overflow-hidden font-mono text-xs shadow-inner">
                    {/* Diff Header */}
                    <div className="bg-[#12141c] px-3 py-1.5 border-b border-white/[0.06] flex items-center justify-between text-[11px]">
                      <span className="text-indigo-300 font-semibold flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                        Patch: {stagedPatch.id.slice(0, 8)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500">Epoch #{currentEpoch}</span>
                        <button 
                          onClick={handleCopyPatch}
                          title="Copy patch JSON"
                          className="p-1 hover:bg-white/[0.06] rounded text-zinc-400 hover:text-white transition"
                        >
                          {copiedPatch ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Diff Body: Green addition lines like Cursor IDE */}
                    <div className="p-2.5 space-y-1 bg-[#090b10] max-h-32 overflow-y-auto">
                      <div className="text-zinc-500 text-[10px] pb-1 border-b border-white/[0.04]">
                        target: <span className="text-zinc-300">{stagedPatch.selector}</span>
                      </div>
                      {Object.entries(stagedPatch.attributes).map(([attr, val]) => (
                        <div key={attr} className="flex items-center gap-2 text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-800/30 text-[11px]">
                          <span className="text-emerald-500 font-bold select-none">+</span>
                          <span className="font-semibold">{attr}=</span>
                          <span className="text-emerald-300">"{val}"</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Human Decision Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleApprove}
                      disabled={isCommitMounted}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 focus:outline-none ${
                        isCommitMounted
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 cursor-not-allowed shadow-inner'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/60'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isCommitMounted ? 'Commit Tool Mounted' : 'Approve & Mount Commit Tool'}
                    </button>
                    <button
                      onClick={() => {
                        clearStagedPatch();
                        registerDiagnosticTools();
                      }}
                      className="px-3.5 py-2 bg-[#181a24] hover:bg-[#202330] text-zinc-300 border border-white/[0.08] rounded-lg text-xs font-semibold transition flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5 text-zinc-400" />
                      Reject
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-4 px-3 text-center border border-dashed border-white/[0.08] rounded-lg bg-[#08090d] flex flex-col items-center justify-center gap-1">
                  <ShieldCheck className="w-5 h-5 text-emerald-500/80 mb-0.5" />
                  <span className="text-zinc-300 font-medium text-xs">No active staged mutation</span>
                  <span className="text-[10px] text-zinc-500 font-mono max-w-xs leading-relaxed">
                    Diagnostic tools run freely across runtime. Destructive mutation tools stay unmounted until you review a staged patch.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 2. WEBMCP LIVE LOG (Postman / Cursor Event Stream Console) */}
          <div className="flex-1 min-h-0 bg-[#0d0f14] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Header with Search Filter and Export */}
            <div className="h-10 flex-shrink-0 border-b border-white/[0.06] bg-[#12141c] px-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">WebMCP Live Log</h3>
                <span className="text-[10px] font-mono bg-white/[0.06] text-zinc-400 px-1.5 py-0.5 rounded">
                  {activityLog.length} events
                </span>
              </div>

              {/* Log Controls */}
              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <Search className="w-3 h-3 text-zinc-500 absolute left-2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={logFilter}
                    onChange={(e) => setLogFilter(e.target.value)}
                    className="bg-[#08090d] border border-white/10 rounded pl-5 pr-2 py-0.5 text-[11px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 font-mono w-24"
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
                    title="Export log"
                    className="p-1 rounded bg-[#08090d] border border-white/10 text-zinc-400 hover:text-zinc-200 transition"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Event Stream */}
            <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-2 font-mono">
              {filteredLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-600">
                  <Terminal className="w-6 h-6 text-zinc-700 mb-2" />
                  <p className="text-xs font-medium">Awaiting agent invocations...</p>
                  <span className="text-[10px] text-zinc-600 mt-1">Tools dynamically stream execution telemetry here</span>
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const isHoneypot = log.alert?.includes('HONEYPOT');
                  const isStaging = log.toolName === 'stage_aria_remediation';
                  const isCommit = log.toolName === 'commit_a11y_fix';

                  return (
                    <div 
                      key={log.id} 
                      className={`p-2 rounded-lg text-xs transition border ${
                        isHoneypot
                          ? 'bg-rose-950/25 border-rose-800/40'
                          : isStaging
                          ? 'bg-amber-950/25 border-amber-800/40'
                          : isCommit
                          ? 'bg-emerald-950/25 border-emerald-800/40'
                          : 'bg-[#08090d] border-white/[0.06] hover:border-white/15'
                      }`}
                    >
                      {/* Top Meta Line */}
                      <div className="flex items-center justify-between text-zinc-400 mb-1">
                        <span className={`font-bold text-[11px] flex items-center gap-1.5 ${
                          isHoneypot ? 'text-rose-400' : isStaging ? 'text-amber-400' : isCommit ? 'text-emerald-400' : 'text-indigo-400'
                        }`}>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/[0.06] uppercase tracking-wider">
                            CALL
                          </span>
                          {log.toolName}
                        </span>
                        <span className="text-[10px] text-zinc-600 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      {/* Payload Content */}
                      <div className="text-zinc-400 text-[10px] bg-black/50 p-1.5 rounded border border-white/5 break-all">
                        {JSON.stringify(log.input)}
                      </div>

                      {/* Security Warning Badge */}
                      {log.alert && (
                        <div className={`mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                          isHoneypot 
                            ? 'bg-rose-950/80 border-rose-800/70 text-rose-300' 
                            : 'bg-amber-950/80 border-amber-800/70 text-amber-300'
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
