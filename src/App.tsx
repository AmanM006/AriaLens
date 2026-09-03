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
  ArrowRight,
  Code2,
  AlertTriangle,
  Zap,
  Search,
  Download
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

  return (
    <div className="h-screen max-h-screen w-screen bg-[#07080b] text-zinc-100 flex flex-col font-sans overflow-hidden antialiased select-none">
      
      {/* TOP HEADER */}
      <header className="h-14 flex-shrink-0 border-b border-white/[0.08] bg-[#0c0d12]/95 backdrop-blur-xl px-5 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 border border-indigo-400/30">
              <span className="text-white font-bold text-xs tracking-tighter">AL</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-sm font-bold text-white tracking-tight">AriaLens</h1>
              <span className="text-[10px] bg-indigo-950/80 text-indigo-300 font-semibold px-2 py-0.5 rounded border border-indigo-800/60 font-mono">
                WebMCP Studio
              </span>
            </div>
          </div>
        </div>

        {/* Real Status Controls */}
        <div className="flex items-center gap-2.5">
          {/* Active Status Pill */}
          <div className="flex items-center gap-2 bg-[#12141d] px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-zinc-300 text-xs font-medium">Live Bridge</span>
          </div>

          {/* Epoch Counter */}
          <div className="flex items-center gap-1.5 bg-[#12141d] px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs font-mono">
            <Cpu className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-400 text-xs">Epoch</span>
            <span className="text-emerald-400 font-bold">#{currentEpoch}</span>
          </div>

          {/* Live Tools Pill */}
          <div className="flex items-center gap-1.5 bg-[#12141d] px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-zinc-400 text-xs">Tools</span>
            <span className="text-indigo-300 font-bold">{toolCount}</span>
          </div>

          {/* Debug Bump Epoch Button */}
          <button
            onClick={() => incrementEpoch()}
            className="px-3 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-semibold shadow-lg shadow-indigo-900/30 transition flex items-center gap-1.5 focus:outline-none"
            title="Simulate human DOM edit (increments epoch to trigger TOCTOU conflict on stale agent patches)"
          >
            <Zap className="w-3 h-3 text-indigo-200" />
            Debug: Bump Epoch
          </button>
        </div>
      </header>

      {/* MAIN VIEWPORT - STRICT 100VH 2-COLUMN STUDIO GRID */}
      <main className="flex-1 min-h-0 p-4 grid grid-cols-12 gap-4 overflow-hidden">
        
        {/* LEFT COLUMN: LIVE TEST TARGET CANVAS (7 COLS) */}
        <div className="col-span-7 flex flex-col h-full min-h-0 overflow-hidden">
          
          {/* Target Tabs Header */}
          <div className="flex-shrink-0 flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Interactive DOM Target
              </h2>
            </div>
            
            <div className="flex items-center gap-1.5 bg-[#0e1017] p-1 rounded-xl border border-white/[0.08]">
              <button
                onClick={() => loadFixture('combobox')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeFixture === 'combobox'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/60'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <ListFilter className="w-3 h-3" />
                Combobox
              </button>

              <button
                onClick={() => loadFixture('modal')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeFixture === 'modal'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/60'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <Layers className="w-3 h-3" />
                Modal Trap
              </button>

              <button
                onClick={() => loadFixture('contrast')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeFixture === 'contrast'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/60'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <Eye className="w-3 h-3" />
                Contrast
              </button>

              {highlightedSelector && (
                <div className="ml-1 flex items-center gap-1.5 bg-indigo-950/70 border border-indigo-500/40 text-indigo-200 px-2.5 py-1 rounded-lg text-[10px] font-mono">
                  <Crosshair className="w-3 h-3 text-indigo-400" />
                  Target: {highlightedSelector}
                </div>
              )}
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="flex-1 min-h-0 relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0c0e14] shadow-2xl flex flex-col justify-between p-4">
            
            {/* EPOCH CONFLICT BANNER */}
            {epochConflict && (
              <div className="absolute top-0 left-0 right-0 z-40 bg-rose-950/95 border-b border-rose-500/60 text-rose-200 px-4 py-2 text-xs shadow-lg backdrop-blur-md flex items-center justify-between animate-in slide-in-from-top">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <div>
                    <strong className="font-bold">⛔ STALE_EPOCH_CONFLICT:</strong> Live DOM modified during agent formulation. Staged patch aborted. Agent must re-audit.
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

            {/* Interactive Sandbox Target (Preserved IDs) */}
            <div className="flex-1 min-h-0 flex flex-col justify-center overflow-y-auto">
              <Fixtures
                activeFixture={activeFixture as 'none' | 'modal' | 'combobox' | 'contrast'}
                appliedPatches={useA11yStore.getState().appliedPatches}
              />
            </div>

            {/* Canvas Footer */}
            <div className="pt-3 border-t border-white/[0.06] text-[11px] text-zinc-500 flex items-center justify-between font-mono">
              <span>Runtime AccName 1.1 & axe-core Evaluator</span>
              <span className="text-zinc-400">Target: #{activeFixture === 'combobox' ? 'custom-combobox' : activeFixture === 'modal' ? 'modal-box' : 'contrast-target'}</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: HITL AUTHORITY & LIVE TOOL LOG (5 COLS) */}
        <div className="col-span-5 flex flex-col h-full min-h-0 gap-3.5 overflow-hidden">
          
          {/* HITL AUTHORITY BOUNDARY CARD */}
          <div className="flex-shrink-0 bg-[#0c0e14] border border-white/[0.08] rounded-2xl p-4 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Authority Boundary</h3>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                stagedPatch 
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse'
                  : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
              }`}>
                {stagedPatch ? 'Awaiting Human Approval' : 'HITL Gate Active'}
              </span>
            </div>

            {stagedPatch ? (
              <div className="space-y-3">
                <div className="bg-[#08090d] border border-white/[0.08] p-3 rounded-xl text-xs font-mono space-y-1.5 shadow-inner">
                  <div className="flex items-center justify-between text-indigo-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Code2 className="w-3.5 h-3.5" />
                      Patch: {stagedPatch.id.slice(0, 8)}
                    </span>
                    <span className="text-zinc-500 text-[10px]">Locked to Epoch #{currentEpoch}</span>
                  </div>
                  <div className="text-zinc-300 text-[11px] truncate">
                    Selector: <span className="text-white font-bold">{stagedPatch.selector}</span>
                  </div>
                  <div className="text-emerald-400 text-[10px] bg-black/60 p-2 rounded-lg border border-white/5 max-h-24 overflow-y-auto">
                    <pre>{JSON.stringify(stagedPatch.attributes, null, 2)}</pre>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleApprove}
                    disabled={isCommitMounted}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 focus:outline-none ${
                      isCommitMounted
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 cursor-not-allowed shadow-inner'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/60'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isCommitMounted ? 'Commit Tool Mounted (Waiting Agent)' : 'Approve & Mount Commit Tool'}
                  </button>
                  <button
                    onClick={() => {
                      clearStagedPatch();
                      registerDiagnosticTools();
                    }}
                    className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 rounded-xl text-xs font-semibold transition flex items-center gap-1 focus:outline-none"
                  >
                    <XCircle className="w-3.5 h-3.5 text-zinc-400" />
                    Reject
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-zinc-500 text-xs py-5 text-center border border-dashed border-white/[0.08] rounded-xl bg-black/30 flex flex-col items-center justify-center gap-1">
                <span className="text-zinc-400 font-medium text-xs">No active staged mutation</span>
                <span className="text-[10px] text-zinc-600 font-mono">
                  Diagnostic read tools run freely · Mutation tools gated until review
                </span>
              </div>
            )}
          </div>

          {/* WEBMCP LIVE TOOL LOG (Real Event Stream) */}
          <div className="flex-1 min-h-0 bg-[#0c0e14] border border-white/[0.08] rounded-2xl p-4 flex flex-col shadow-2xl overflow-hidden">
            
            {/* Header with Search & Clear */}
            <div className="flex-shrink-0 flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">WebMCP Live Log</h3>
                <span className="text-[10px] font-mono bg-white/[0.06] text-zinc-400 px-1.5 py-0.5 rounded">
                  {activityLog.length}
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <Search className="w-3 h-3 text-zinc-500 absolute left-2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={logFilter}
                    onChange={(e) => setLogFilter(e.target.value)}
                    className="bg-[#08090d] border border-white/10 rounded-md pl-6 pr-2 py-0.5 text-[11px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 font-mono w-24"
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

            {/* Scrollable event log */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
              {filteredLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-600">
                  <Terminal className="w-8 h-8 text-zinc-800 mb-2" />
                  <p className="text-xs font-medium">Awaiting agent invocations...</p>
                  <span className="text-[10px] text-zinc-700 font-mono mt-1">Tools dynamically stream execution telemetry here</span>
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const isHoneypot = log.alert?.includes('HONEYPOT');
                  const isStaging = log.toolName === 'stage_aria_remediation';
                  const isCommit = log.toolName === 'commit_a11y_fix';

                  return (
                    <div 
                      key={log.id} 
                      className={`p-2.5 rounded-xl text-xs font-mono transition border ${
                        isHoneypot
                          ? 'bg-rose-950/20 border-rose-800/40'
                          : isStaging
                          ? 'bg-amber-950/20 border-amber-800/30'
                          : isCommit
                          ? 'bg-emerald-950/20 border-emerald-800/30'
                          : 'bg-[#08090d] border-white/[0.06] hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center justify-between text-zinc-400 mb-1">
                        <span className={`font-bold text-[11px] flex items-center gap-1 ${
                          isHoneypot ? 'text-rose-400' : isStaging ? 'text-amber-400' : isCommit ? 'text-emerald-400' : 'text-indigo-400'
                        }`}>
                          <ArrowRight className="w-2.5 h-2.5" />
                          {log.toolName}
                        </span>
                        <span className="text-[10px] text-zinc-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>

                      <div className="text-zinc-400 font-mono text-[9px] mt-1 break-all bg-black/40 p-1.5 rounded border border-white/5">
                        {JSON.stringify(log.input)}
                      </div>

                      {log.alert && (
                        <div className={`mt-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                          isHoneypot 
                            ? 'bg-rose-950/70 border-rose-800/60 text-rose-300' 
                            : 'bg-amber-950/70 border-amber-800/60 text-amber-300'
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
