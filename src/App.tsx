import React, { useEffect, useState, useMemo } from 'react';
import { useA11yStore } from './store/a11yStore';
import { registerCoreTools, mountEphemeralCommitTool, registerDiagnosticTools } from './lib/webmcp/tools';
import { Fixtures } from './components/Fixtures';
import { 
  Cpu, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Layers, 
  ListFilter, 
  Eye, 
  Lock, 
  Code2,
  Search,
  SlidersHorizontal,
  Download,
  AlertTriangle,
  Zap,
  Activity,
  Check,
  X,
  Crosshair,
  Sparkles
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'runs' | 'traces' | 'approvals' | 'security'>('runs');
  const [activeBarHover, setActiveBarHover] = useState<number | null>(null);

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

  // Telemetry streams for stacked chart
  const telemetryBars = useMemo(() => [
    { time: '09:00', diagnostic: 14, staging: 6, honeypot: 2, latency: 12 },
    { time: '10:00', diagnostic: 18, staging: 8, honeypot: 4, latency: 15 },
    { time: '11:00', diagnostic: 28, staging: 14, honeypot: 5, latency: 18 },
    { time: '12:00', diagnostic: 42, staging: 22, honeypot: 8, latency: 22 },
    { time: '13:00', diagnostic: 36, staging: 18, honeypot: 6, latency: 17 },
    { time: '14:00', diagnostic: 48, staging: 26, honeypot: 9, latency: 24 },
    { time: '15:00', diagnostic: 56, staging: 32, honeypot: 12, latency: 29 },
    { time: '16:00', diagnostic: 62, staging: 38, honeypot: 15, latency: 31 },
    { time: '17:00', diagnostic: 44, staging: 20, honeypot: 7, latency: 19 },
    { time: '18:00', diagnostic: 68, staging: 42, honeypot: 18, latency: 34 },
    { time: '19:00', diagnostic: 52, staging: 28, honeypot: 11, latency: 26 },
    { time: '20:00', diagnostic: 38, staging: 19, honeypot: 5, latency: 16 },
    { time: '21:00', diagnostic: 24, staging: 12, honeypot: 3, latency: 14 },
    { time: '22:00', diagnostic: 16, staging: 7, honeypot: 1, latency: 11 }
  ], []);

  // Filter activity log
  const filteredLog = useMemo(() => {
    if (!searchQuery) return activityLog;
    return activityLog.filter(log => 
      log.toolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(log.input).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.alert && log.alert.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [activityLog, searchQuery]);

  return (
    <div className="h-screen max-h-screen w-screen bg-[#090a0d] text-zinc-100 flex flex-col font-sans overflow-hidden antialiased select-none">
      
      {/* 1. ULTRA-SLEEK TOP NAVIGATION BAR */}
      <header className="h-13 flex-shrink-0 border-b border-white/[0.07] bg-[#0c0d12]/90 backdrop-blur-xl px-5 flex items-center justify-between z-50">
        {/* Left: Breadcrumbs & Branding */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-white/10">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">AriaLens</span>
                <span className="text-zinc-600 text-xs">/</span>
                <span className="text-xs text-zinc-400 font-medium">dashboard</span>
                <span className="text-[10px] bg-purple-500/10 text-purple-300 font-semibold px-2 py-0.5 rounded-full border border-purple-500/20 font-mono">
                  Pro+
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Status Pills & Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Active Bridge Pill */}
          <div className="flex items-center gap-2 bg-[#12141c] px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-zinc-300 text-xs font-medium">Active</span>
          </div>

          {/* Epoch Counter */}
          <div className="flex items-center gap-1.5 bg-[#12141c] px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs font-mono">
            <Cpu className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-400 text-xs">Epoch</span>
            <span className="text-emerald-400 font-bold">#{currentEpoch}</span>
          </div>

          {/* Live Tools Pill */}
          <div className="flex items-center gap-1.5 bg-[#12141c] px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-zinc-400 text-xs">Tools</span>
            <span className="text-indigo-300 font-bold">{toolCount}</span>
          </div>

          {/* Reset Session Button */}
          <button 
            onClick={() => {
              clearStagedPatch();
              registerDiagnosticTools();
            }}
            className="px-3 py-1.5 rounded-lg border border-white/[0.08] bg-[#12141c] hover:bg-white/[0.05] text-zinc-400 hover:text-zinc-200 text-xs font-medium transition"
          >
            Disconnect
          </button>

          {/* Debug Bump Epoch */}
          <button
            onClick={() => incrementEpoch()}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition flex items-center gap-1.5"
          >
            <Zap className="w-3 h-3" />
            Bump Epoch
          </button>
        </div>
      </header>

      {/* 2. BODY LAYOUT: SIDEBAR + MAIN OBSERVABILITY CANVAS */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        
        {/* LEFT COMPACT SIDEBAR */}
        <aside className="w-56 flex-shrink-0 border-r border-white/[0.07] bg-[#0a0b10] flex flex-col justify-between p-3">
          <div className="space-y-6">
            {/* User Profile / Status */}
            <div className="flex items-center gap-3 px-2 py-1.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-xs font-bold text-white border border-white/20">
                AL
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">Agent Oversight</div>
                <div className="text-[10px] text-zinc-500 truncate">Production Stream</div>
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="space-y-1">
              <button 
                onClick={() => setSelectedTab('runs')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  selectedTab === 'runs' 
                    ? 'bg-white/[0.08] text-white shadow-sm border border-white/[0.05]' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  Agent Runs
                </span>
                <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">
                  {activityLog.length}
                </span>
              </button>

              <button 
                onClick={() => setSelectedTab('approvals')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  selectedTab === 'approvals' 
                    ? 'bg-white/[0.08] text-white shadow-sm border border-white/[0.05]' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-amber-400" />
                  Approvals
                </span>
                {stagedPatch && (
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded animate-pulse">
                    1 Pending
                  </span>
                )}
              </button>

              <button 
                onClick={() => setSelectedTab('security')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  selectedTab === 'security' 
                    ? 'bg-white/[0.08] text-white shadow-sm border border-white/[0.05]' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Gauntlet Defense
                </span>
                <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded">
                  Active
                </span>
              </button>
            </nav>

            {/* Test Targets Picker */}
            <div className="pt-2 border-t border-white/[0.06]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-2 mb-2">
                Live Fixture Targets
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => loadFixture('combobox')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    activeFixture === 'combobox'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <ListFilter className="w-3.5 h-3.5 text-indigo-400" />
                    Combobox
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500">WCAG 2.2</span>
                </button>

                <button
                  onClick={() => loadFixture('modal')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    activeFixture === 'modal'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    Modal Trap
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500">Focus Leak</span>
                </button>

                <button
                  onClick={() => loadFixture('contrast')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    activeFixture === 'contrast'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    Contrast Grid
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500">Alpha Blend</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="pt-3 border-t border-white/[0.06] text-[11px] text-zinc-500 flex items-center justify-between px-2">
            <span>WebMCP Draft Spec</span>
            <span className="text-emerald-400 font-mono">v0.2.1</span>
          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT */}
        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto p-4 space-y-4">
          
          {/* EPOCH CONFLICT ALERT BANNER */}
          {epochConflict && (
            <div className="bg-rose-950/90 border border-rose-500/60 text-rose-200 px-4 py-2.5 rounded-xl text-xs shadow-xl backdrop-blur-md flex items-center justify-between animate-in slide-in-from-top">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>
                  <strong className="font-bold text-rose-300">STALE_EPOCH_CONFLICT:</strong> Live DOM state modified during agent evaluation. Mutation blocked to protect consistency.
                </span>
              </div>
              <button 
                onClick={() => useA11yStore.getState().setEpochConflict(false)}
                className="px-2.5 py-1 bg-rose-900/60 hover:bg-rose-800 text-rose-200 rounded-lg text-xs font-medium transition"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* 3. RUNAGENT-STYLE TOP ROW: 4 KPI STAT CARDS + 1 TELEMETRY CHART */}
          <div className="grid grid-cols-12 gap-3.5 flex-shrink-0">
            
            {/* 4 Stat Cards (Col 5) */}
            <div className="col-span-5 grid grid-cols-2 gap-3">
              {/* Card 1: Total Audits */}
              <div className="bg-[#0f1118] border border-white/[0.08] p-3.5 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-xl">
                <div className="flex items-center justify-between text-zinc-400 mb-1">
                  <span className="text-xs font-semibold flex items-center gap-1.5 text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    Audited Elements
                  </span>
                  <span className="text-zinc-600 text-xs">...</span>
                </div>
                <div className="text-2xl font-bold text-white tracking-tight mt-1">
                  1,428
                </div>
                <div className="text-[11px] text-zinc-500 mt-2 flex items-center gap-1 font-mono">
                  <span className="text-emerald-400 font-semibold">+8.2%</span> vs prev epoch
                </div>
              </div>

              {/* Card 2: Success Rate */}
              <div className="bg-[#0f1118] border border-white/[0.08] p-3.5 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-xl">
                <div className="flex items-center justify-between text-zinc-400 mb-1">
                  <span className="text-xs font-semibold flex items-center gap-1.5 text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Success Rate
                  </span>
                  <span className="text-zinc-600 text-xs">...</span>
                </div>
                <div className="text-2xl font-bold text-white tracking-tight mt-1">
                  94.3<span className="text-sm font-normal text-zinc-500">%</span>
                </div>
                <div className="text-[11px] text-zinc-500 mt-2 flex items-center gap-1 font-mono">
                  <span className="text-emerald-400 font-semibold">+1.4 pts</span> WCAG 2.2
                </div>
              </div>

              {/* Card 3: P95 Latency */}
              <div className="bg-[#0f1118] border border-white/[0.08] p-3.5 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-xl">
                <div className="flex items-center justify-between text-zinc-400 mb-1">
                  <span className="text-xs font-semibold flex items-center gap-1.5 text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    P95 Latency
                  </span>
                  <span className="text-zinc-600 text-xs">...</span>
                </div>
                <div className="text-2xl font-bold text-white tracking-tight mt-1">
                  18<span className="text-sm font-normal text-zinc-500">ms</span>
                </div>
                <div className="text-[11px] text-zinc-500 mt-2 flex items-center gap-1 font-mono">
                  <span className="text-indigo-400 font-semibold">-12ms</span> zero-backend
                </div>
              </div>

              {/* Card 4: Blocked Injections */}
              <div className="bg-[#0f1118] border border-white/[0.08] p-3.5 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-xl">
                <div className="flex items-center justify-between text-zinc-400 mb-1">
                  <span className="text-xs font-semibold flex items-center gap-1.5 text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    Security Gate
                  </span>
                  <span className="text-zinc-600 text-xs">...</span>
                </div>
                <div className="text-2xl font-bold text-white tracking-tight mt-1">
                  100<span className="text-sm font-normal text-zinc-500">%</span>
                </div>
                <div className="text-[11px] text-zinc-500 mt-2 flex items-center gap-1 font-mono">
                  <span className="text-rose-400 font-semibold">Gauntlet</span> Protected
                </div>
              </div>
            </div>

            {/* Main Telemetry Chart (Col 7) */}
            <div className="col-span-7 bg-[#0f1118] border border-white/[0.08] p-4 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white tracking-wide">WebMCP Telemetry & Latency Stream</span>
                  <span className="text-[10px] bg-white/[0.06] text-zinc-400 px-2 py-0.5 rounded font-mono">
                    Live
                  </span>
                </div>
                <span className="text-zinc-600 text-xs cursor-pointer">...</span>
              </div>

              {/* Interactive Stacked Bar Visualizer */}
              <div className="h-28 w-full flex items-end gap-2 pt-2 px-1 relative">
                {telemetryBars.map((bar, i) => {
                  const isHovered = activeBarHover === i;
                  return (
                    <div 
                      key={i} 
                      className="flex-1 flex flex-col justify-end h-full relative group cursor-pointer"
                      onMouseEnter={() => setActiveBarHover(i)}
                      onMouseLeave={() => setActiveBarHover(null)}
                    >
                      {/* Floating Tooltip */}
                      {isHovered && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#1b1e2a] border border-white/20 p-2 rounded-lg shadow-2xl text-[10px] font-mono z-30 pointer-events-none whitespace-nowrap space-y-0.5">
                          <div className="text-zinc-400 font-bold">{bar.time} - {bar.latency}ms</div>
                          <div className="text-purple-300">Staging: {bar.staging}ms</div>
                          <div className="text-indigo-300">Diagnostic: {bar.diagnostic}ms</div>
                          <div className="text-rose-300">Defense: {bar.honeypot}ms</div>
                        </div>
                      )}

                      {/* Stacked Bars */}
                      <div className="w-full flex flex-col rounded-t overflow-hidden transition-all duration-300 group-hover:brightness-125">
                        <div style={{ height: `${bar.honeypot}px` }} className="bg-gradient-to-t from-purple-600 to-indigo-500 w-full" />
                        <div style={{ height: `${bar.staging}px` }} className="bg-gradient-to-t from-indigo-500 to-blue-400 w-full" />
                        <div style={{ height: `${bar.diagnostic}px` }} className="bg-blue-400/80 w-full" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Legend */}
              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-white/[0.05] mt-2 font-mono">
                <div className="flex items-center gap-3">
                  <span className="text-zinc-300 font-bold">Total $0.00 / Localhost</span>
                  <span className="flex items-center gap-1 text-blue-400">
                    <span className="w-2 h-2 rounded bg-blue-400 inline-block" /> Diagnostic
                  </span>
                  <span className="flex items-center gap-1 text-indigo-400">
                    <span className="w-2 h-2 rounded bg-indigo-500 inline-block" /> Staging Mutation
                  </span>
                  <span className="flex items-center gap-1 text-purple-400">
                    <span className="w-2 h-2 rounded bg-purple-600 inline-block" /> Security Intercept
                  </span>
                </div>
                <span>P95 &lt; 20ms</span>
              </div>
            </div>
          </div>

          {/* 4. SPLIT INTERACTIVE WORKSPACE: TARGET SANDBOX + AUTHORITY GATE */}
          <div className="grid grid-cols-12 gap-3.5 flex-shrink-0 min-h-[360px]">
            
            {/* LEFT 7 COLS: INTERACTIVE FIXTURE SANDBOX */}
            <div className="col-span-7 bg-[#0f1118] border border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden shadow-2xl">
              
              {/* Fixture Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Interactive DOM Target
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.04] px-2 py-0.5 rounded">
                    target: {activeFixture}
                  </span>
                </div>

                {highlightedSelector && (
                  <div className="flex items-center gap-1.5 bg-indigo-950/70 border border-indigo-500/40 text-indigo-200 px-2.5 py-1 rounded-md text-[10px] font-mono animate-pulse">
                    <Crosshair className="w-3 h-3 text-indigo-400" />
                    {highlightedSelector}
                  </div>
                )}
              </div>

              {/* The Live Interactive Sandbox with Preserved DOM IDs */}
              <div className="flex-1 min-h-0 flex flex-col justify-center">
                <Fixtures
                  activeFixture={activeFixture as 'none' | 'modal' | 'combobox' | 'contrast'}
                  appliedPatches={useA11yStore.getState().appliedPatches}
                />
              </div>

              {/* Fixture Footer */}
              <div className="pt-3 border-t border-white/[0.06] text-[11px] text-zinc-500 flex items-center justify-between">
                <span>Direct Client-Side Accessibility Evaluation</span>
                <span className="text-indigo-400 font-mono font-medium">Ready for WebMCP queries</span>
              </div>
            </div>

            {/* RIGHT 5 COLS: HITL AUTHORITY BOUNDARY GATE */}
            <div className="col-span-5 bg-[#0f1118] border border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden shadow-2xl">
              
              {/* Header */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Authority Boundary
                    </h3>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                    stagedPatch 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                      : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                  }`}>
                    {stagedPatch ? 'Awaiting Human Approval' : 'Standby / Secure'}
                  </span>
                </div>

                {/* Staged Content */}
                {stagedPatch ? (
                  <div className="space-y-3">
                    <div className="bg-[#090a0f] border border-white/10 p-3.5 rounded-xl text-xs font-mono space-y-2 shadow-inner">
                      <div className="flex items-center justify-between text-indigo-400 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Code2 className="w-3.5 h-3.5" />
                          Patch ID: {stagedPatch.id.slice(0, 8)}
                        </span>
                        <span className="text-zinc-500 text-[10px]">Locked to Epoch #{currentEpoch}</span>
                      </div>
                      <div className="text-zinc-300 text-[11px] truncate">
                        Target Selector: <span className="text-white font-bold">{stagedPatch.selector}</span>
                      </div>
                      <div className="text-emerald-400 text-[11px] bg-black/60 p-2.5 rounded-lg border border-white/5 max-h-28 overflow-y-auto">
                        <pre className="font-mono">{JSON.stringify(stagedPatch.attributes, null, 2)}</pre>
                      </div>
                    </div>

                    {/* Human Action Buttons */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleApprove}
                        disabled={isCommitMounted}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 focus:outline-none ${
                          isCommitMounted
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 cursor-not-allowed shadow-inner'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/60'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        {isCommitMounted ? 'Commit Tool Mounted (Waiting Agent)' : 'Approve & Mount Commit Tool'}
                      </button>
                      <button
                        onClick={() => {
                          clearStagedPatch();
                          registerDiagnosticTools();
                        }}
                        className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5 text-zinc-400" />
                        Reject
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center flex flex-col items-center justify-center gap-2 border border-dashed border-white/[0.08] rounded-xl bg-black/20">
                    <ShieldCheck className="w-8 h-8 text-zinc-700" />
                    <span className="text-zinc-400 font-medium text-xs">No active staged mutation</span>
                    <span className="text-[11px] text-zinc-600 max-w-xs leading-relaxed">
                      The agent has read-only diagnostic access. Destructive mutation tools remain unmounted until you review a proposal.
                    </span>
                  </div>
                )}
              </div>

              {/* Status Note */}
              <div className="pt-3 border-t border-white/[0.06] text-[11px] text-zinc-500 flex items-center justify-between">
                <span>W3C Section 6.3 Concurrency Control</span>
                <span className="text-amber-400 font-mono">HITL Enforced</span>
              </div>
            </div>
          </div>

          {/* 5. RUNAGENT-STYLE RUN FEED TABLE (Full Width) */}
          <div className="bg-[#0f1118] border border-white/[0.08] rounded-2xl p-4 flex flex-col shadow-2xl">
            
            {/* Table Header Controls */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
              <div className="flex items-center gap-3">
                <h3 className="text-xs font-bold text-white tracking-wide">Run Feed</h3>
                <span className="text-[11px] bg-white/[0.06] text-zinc-400 px-2 py-0.5 rounded font-mono font-medium">
                  {activityLog.length} runs recorded
                </span>
              </div>

              {/* Search & Export Buttons */}
              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search runs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#090a0f] border border-white/10 rounded-lg pl-8 pr-3 py-1 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 font-mono w-48"
                  />
                </div>
                <button className="p-1.5 bg-[#090a0f] border border-white/10 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(activityLog, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `arialens-telemetry-epoch-${currentEpoch}.json`;
                    a.click();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#090a0f] border border-white/10 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Data
                </button>
              </div>
            </div>

            {/* Run Feed Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-zinc-500 border-b border-white/[0.04] text-[10px] uppercase tracking-wider">
                    <th className="pb-2.5 pl-2 font-semibold">Run ID</th>
                    <th className="pb-2.5 font-semibold">Tool Name</th>
                    <th className="pb-2.5 font-semibold">Status</th>
                    <th className="pb-2.5 font-semibold">Category</th>
                    <th className="pb-2.5 font-semibold">Latency</th>
                    <th className="pb-2.5 font-semibold">Payload</th>
                    <th className="pb-2.5 font-semibold">Started</th>
                    <th className="pb-2.5 pr-2 font-semibold text-right">Approval</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {filteredLog.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-zinc-600">
                        No agent activity recorded yet. Run a prompt in ChatGPT to stream live WebMCP tool executions.
                      </td>
                    </tr>
                  ) : (
                    filteredLog.map((log) => {
                      const isHoneypot = log.alert?.includes('HONEYPOT');
                      const isStaging = log.toolName === 'stage_aria_remediation';
                      const isCommit = log.toolName === 'commit_a11y_fix';

                      return (
                        <tr key={log.id} className="hover:bg-white/[0.02] transition">
                          {/* Run ID */}
                          <td className="py-3 pl-2 text-zinc-400 font-medium">
                            {log.id}
                          </td>

                          {/* Tool Name */}
                          <td className="py-3 font-semibold">
                            <span className={`inline-flex items-center gap-1.5 ${
                              isHoneypot 
                                ? 'text-rose-400' 
                                : isStaging 
                                ? 'text-amber-400' 
                                : isCommit
                                ? 'text-emerald-400'
                                : 'text-indigo-400'
                            }`}>
                              {isHoneypot ? (
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                              ) : isStaging ? (
                                <Code2 className="w-3.5 h-3.5 text-amber-500" />
                              ) : isCommit ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Zap className="w-3.5 h-3.5 text-indigo-500" />
                              )}
                              {log.toolName}
                            </span>
                            {log.alert && (
                              <div className="mt-1 text-[9px] text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                {log.alert}
                              </div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3">
                            {isHoneypot ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Blocked
                              </span>
                            ) : isStaging ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Awaiting
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Executed
                              </span>
                            )}
                          </td>

                          {/* Category */}
                          <td className="py-3 text-zinc-400">
                            {isHoneypot ? 'Security Bait' : isStaging ? 'Staging Mutation' : isCommit ? 'Live Commit' : 'Diagnostic Read'}
                          </td>

                          {/* Latency */}
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-14 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                                <div 
                                  style={{ width: `${Math.min(100, (log.latency || 15) * 3)}%` }} 
                                  className="h-full bg-indigo-500 rounded-full" 
                                />
                              </div>
                              <span className="text-[10px] text-zinc-400">{log.latency || 16}ms</span>
                            </div>
                          </td>

                          {/* Payload Snippet */}
                          <td className="py-3 max-w-xs truncate text-zinc-400 text-[10px]">
                            {JSON.stringify(log.input)}
                          </td>

                          {/* Started */}
                          <td className="py-3 text-zinc-500 text-[10px]">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </td>

                          {/* Approval Controls */}
                          <td className="py-3 pr-2 text-right">
                            {isStaging ? (
                              <div className="inline-flex items-center gap-1">
                                <button 
                                  onClick={() => {
                                    clearStagedPatch();
                                    registerDiagnosticTools();
                                  }}
                                  className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
                                  title="Reject"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={handleApprove}
                                  className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
                                  title="Approve"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-zinc-600 text-[10px]">Auto</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;
