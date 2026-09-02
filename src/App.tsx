import React, { useEffect, useState } from 'react';
import { useA11yStore } from './store/a11yStore';
import { registerCoreTools, mountEphemeralCommitTool } from './lib/webmcp/tools';
import { Fixtures } from './components/Fixtures';
import { 
  Radio, 
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
  Code2
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
    clearStagedPatch
  } = useA11yStore();

  const [toolCount, setToolCount] = useState(5);

  useEffect(() => {
    const initWebMCP = async () => {
      if (!document.modelContext) return;
      
      try {
        // 1. Register the tools
        await registerCoreTools();
        
        // 2. Safely get the tool count
        const updateToolCount = async () => {
          try {
            if (document.modelContext?.getTools) {
              const tools = await document.modelContext.getTools();
              setToolCount(tools.length);
            } else {
              setToolCount(5);
            }
          } catch (e) {
            console.error("Failed to fetch tools:", e);
          }
        };

        await updateToolCount();
        
        // 3. Listen for changes
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

  return (
    <div className="h-screen max-h-screen w-screen bg-black text-zinc-100 flex flex-col font-sans overflow-hidden antialiased select-none">
      {/* HEADER BAR */}
      <header className="h-14 flex-shrink-0 border-b border-white/10 bg-zinc-950/90 backdrop-blur-xl px-5 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-indigo-500 animate-ping absolute opacity-75" />
            <div className="h-3 w-3 rounded-full bg-indigo-600 relative flex items-center justify-center">
              <Radio className="w-2 h-2 text-white" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-extrabold tracking-tight text-white">
              AriaLens
            </h1>
            <span className="text-[10px] bg-indigo-950/80 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-800/60 font-mono">
              WebMCP Studio
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Epoch Counter */}
          <div className="flex items-center gap-1.5 bg-[#0e1017] px-3 py-1 rounded-lg border border-white/10 text-xs font-mono">
            <Cpu className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-400 text-[11px]">Epoch:</span>
            <span className="text-emerald-400 font-bold">{currentEpoch}</span>
          </div>

          {/* WebMCP Live Badge */}
          <div className="flex items-center gap-2 bg-[#0e1017] px-3 py-1 rounded-lg border border-white/10 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-zinc-200 text-[11px] font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Live Tools: <strong className="text-emerald-300">{toolCount}</strong>
            </span>
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT - STRICT 100VH GRID */}
      <main className="flex-1 min-h-0 p-4 grid grid-cols-12 gap-4 overflow-hidden">
        {/* LEFT COLUMN: LIVE CANVAS (7 COLS) */}
        <div className="col-span-7 flex flex-col h-full min-h-0 overflow-hidden">
          {/* Fixture Selector Header */}
          <div className="flex-shrink-0 flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Active Test Target
              </h2>
            </div>
            
            <div className="flex items-center gap-1.5 bg-[#090b10] p-1 rounded-lg border border-white/10">
              <button
                onClick={() => loadFixture('combobox')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  activeFixture === 'combobox'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <ListFilter className="w-3 h-3" />
                Combobox
              </button>

              <button
                onClick={() => loadFixture('modal')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  activeFixture === 'modal'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Layers className="w-3 h-3" />
                Modal Trap
              </button>

              <button
                onClick={() => loadFixture('contrast')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  activeFixture === 'contrast'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Eye className="w-3 h-3" />
                Contrast
              </button>

              {/* Dev-only debug button for manual staging verification */}
              {import.meta.env.DEV && (
                <button
                  onClick={() => {
                    useA11yStore.getState().stagePatch({
                      id: 'debug-patch-123',
                      selector: '#contrast-fail-text',
                      attributes: { role: 'button', 'aria-label': 'debug' }
                    });
                  }}
                  className="px-3 py-1 ml-2 rounded-md text-xs font-semibold bg-rose-900/40 text-rose-300 border border-rose-500/30 hover:bg-rose-800/60 transition flex items-center gap-1.5 focus:outline-none"
                >
                  <Code2 className="w-3 h-3" />
                  Debug: Stage Patch
                </button>
              )}
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="flex-1 min-h-0 relative rounded-2xl overflow-hidden border border-white/10 bg-[#06070a] shadow-2xl flex flex-col">
            {/* Target Crosshair Badge */}
            {highlightedSelector && (
              <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-rose-950/90 border border-rose-500/60 text-rose-200 px-3 py-1 rounded-full text-xs font-mono shadow-lg backdrop-blur-md">
                <Crosshair className="w-3 h-3 text-rose-400 animate-spin" />
                <span className="font-semibold text-[11px]">Target: {highlightedSelector}</span>
              </div>
            )}
            
            <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col justify-center">
              <Fixtures
                activeFixture={activeFixture as 'none' | 'modal' | 'combobox' | 'contrast'}
                appliedPatches={useA11yStore.getState().appliedPatches}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: HITL AUTHORITY & LIVE TOOL LOG (5 COLS) */}
        <div className="col-span-5 flex flex-col h-full min-h-0 gap-3.5 overflow-hidden">
          {/* HITL AUTHORITY CARD */}
          <div className="flex-shrink-0 bg-[#090b10] border border-white/10 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Authority Boundary</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                HITL Gate
              </span>
            </div>

            {stagedPatch ? (
              <div className="space-y-3">
                <div className="bg-[#0e1118] border border-white/10 p-3 rounded-xl text-xs font-mono space-y-1.5">
                  <div className="flex items-center justify-between text-indigo-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Code2 className="w-3.5 h-3.5" />
                      Patch: {stagedPatch.id.slice(0, 8)}
                    </span>
                    <span className="text-zinc-500 text-[10px]">Epoch #{currentEpoch}</span>
                  </div>
                  <div className="text-zinc-300 text-[11px] truncate">
                    Selector: <span className="text-white font-bold">{stagedPatch.selector}</span>
                  </div>
                  <div className="text-emerald-400 text-[10px] bg-black/50 p-2 rounded-lg border border-white/5 max-h-20 overflow-y-auto">
                    <pre>{JSON.stringify(stagedPatch.attributes, null, 2)}</pre>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleApprove}
                    disabled={isCommitMounted}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black ${
                      isCommitMounted
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 cursor-not-allowed shadow-inner'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/60'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isCommitMounted ? 'Commit Tool Mounted (Waiting Agent)' : 'Approve & Mount Commit Tool'}
                  </button>
                  <button
                    onClick={clearStagedPatch}
                    className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 rounded-xl text-xs font-semibold transition flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-black"
                  >
                    <XCircle className="w-3.5 h-3.5 text-zinc-400" />
                    Reject
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-zinc-500 text-xs py-5 text-center border border-dashed border-white/10 rounded-xl bg-black/30 flex flex-col items-center justify-center gap-1">
                <span className="text-zinc-400 font-medium text-xs">No active staged mutation</span>
                <span className="text-[10px] text-zinc-600 font-mono">Diagnostic read tools run freely across runtime</span>
              </div>
            )}
          </div>

          {/* AUDIT & ACTIVITY TIMELINE */}
          <div className="flex-1 min-h-0 bg-[#090b10] border border-white/10 rounded-2xl p-4 flex flex-col shadow-2xl overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">WebMCP Live Log</h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                {activityLog.length} events
              </span>
            </div>

            {/* Scrollable event log */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
              {activityLog.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-600">
                  <Terminal className="w-8 h-8 text-zinc-800 mb-2" />
                  <p className="text-xs font-medium">Awaiting agent invocations...</p>
                  <span className="text-[10px] text-zinc-700 font-mono mt-1">Tools dynamically stream execution telemetry here</span>
                </div>
              ) : (
                activityLog.map((log, idx) => (
                  <div key={idx} className="bg-[#0d0f17] border border-white/[0.08] hover:border-white/20 p-2.5 rounded-xl text-xs font-mono transition">
                    <div className="flex items-center justify-between text-zinc-400 mb-1">
                      <span className="text-indigo-400 font-bold text-[11px] flex items-center gap-1">
                        <ArrowRight className="w-2.5 h-2.5 text-indigo-500" />
                        {log.toolName}
                      </span>
                      <span className="text-[10px] text-zinc-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-zinc-300 text-[10px] bg-black/40 px-2 py-1 rounded border border-white/5 truncate">
                      {JSON.stringify(log.input)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
