import React, { useEffect, useState } from 'react';
import { useA11yStore } from './store/a11yStore';
import { registerCoreTools, mountEphemeralCommitTool } from './lib/webmcp/tools';
import { Fixtures } from './components/Fixtures';

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

  const [toolCount, setToolCount] = useState(0);

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-indigo-500 animate-pulse" />
          <h1 className="text-xl font-bold tracking-tight">AriaLens</h1>
          <span className="text-xs bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-800 font-mono">
            WebMCP Studio
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono">
            <span className="text-slate-400">Epoch:</span>
            <span className="text-emerald-400 font-bold">{currentEpoch}</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            <span>WebMCP Live: {toolCount} tools</span>
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: LIVE CANVAS */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Active Test Target</h2>
            <div className="flex gap-2">
              {(['modal', 'combobox', 'contrast'] as const).map((fixture) => (
                <button
                  key={fixture}
                  onClick={() => loadFixture(fixture)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                    activeFixture === fixture
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {fixture.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Canvas Wrapper with Visual Target Overlay */}
          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900/40 p-1">
            {highlightedSelector && (
              <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-rose-950/80 border border-rose-500/50 text-rose-300 px-2.5 py-1 rounded text-xs font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping" />
                Targeting: {highlightedSelector}
              </div>
            )}
            <Fixtures
              activeFixture={activeFixture as 'none' | 'modal' | 'combobox' | 'contrast'}
              stagedAttributes={stagedPatch?.attributes}
              stagedSelector={stagedPatch?.selector}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: AGENT ACTIVITY & HUMAN AUTHORITY CONTROL */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* HUMAN IN THE LOOP APPROVAL CARD */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Authority Boundary</span>
              <span className="text-xs font-normal text-slate-500 font-mono">HITL Gate</span>
            </h3>

            {stagedPatch ? (
              <div className="space-y-4">
                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg text-xs font-mono space-y-2">
                  <div className="text-indigo-400 font-semibold">Staged Patch ID: {stagedPatch.id.slice(0, 8)}</div>
                  <div className="text-slate-300">Target: <span className="text-slate-100">{stagedPatch.selector}</span></div>
                  <div className="text-emerald-400">
                    Attributes: {JSON.stringify(stagedPatch.attributes, null, 2)}
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={handleApprove}
                    disabled={isCommitMounted}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                      isCommitMounted
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                    }`}
                  >
                    {isCommitMounted ? '? Commit Tool Mounted' : 'Approve & Mount Commit Tool'}
                  </button>
                  <button
                    onClick={clearStagedPatch}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-xs py-6 text-center border border-dashed border-slate-800 rounded-lg">
                No active staged mutation. Diagnostic reads run freely.
              </div>
            )}
          </div>

          {/* AUDIT & ACTIVITY TIMELINE */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex-1 flex flex-col min-h-[260px]">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3">Live Tool Log</h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[320px]">
              {activityLog.length === 0 ? (
                <div className="text-slate-500 text-xs py-8 text-center">Awaiting agent invocations...</div>
              ) : (
                activityLog.map((log, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800/80 p-2.5 rounded text-xs font-mono">
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span className="text-indigo-400 font-bold">{log.toolName}</span>
                      <span className="text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-slate-300 truncate">{JSON.stringify(log.input)}</div>
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
