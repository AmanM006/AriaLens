import { create } from 'zustand';

export interface ToolEvent {
  id: string;
  toolName: string;
  input: any;
  timestamp: number;
  alert?: string;
}

// Global logger to bypass React lifecycle for WebMCP execution contexts
export const logTool = (toolName: string, input: any, alert?: string, status?: 'success' | 'blocked' | 'staged' | 'conflict') => {
  useA11yStore.getState().logActivity({
    toolName,
    input,
    alert,
    status
  });
};

export interface StagedPatch {
  id: string;
  selector: string;
  attributes: Record<string, string>;
  description: string;
  epoch: number;
}

export interface ActivityLogEntry {
  id: string;
  toolName: string;
  timestamp: number;
  input: any;
  alert?: string;
  status?: 'success' | 'blocked' | 'staged' | 'conflict';
  latency?: number;
}

export type FixtureType = 'none' | 'modal' | 'combobox' | 'contrast';

interface A11yState {
  currentEpoch: number;
  activeFixture: FixtureType;
  stagedPatch: StagedPatch | null;
  highlightedSelector: string | null;
  activityLog: ActivityLogEntry[];
  isCommitMounted: boolean;
  epochConflict: boolean;
  appliedPatches: Record<string, Record<string, string>>;
  
  loadFixture: (fixture: FixtureType) => void;
  incrementEpoch: () => void;
  stagePatch: (patch: StagedPatch) => void;
  clearStagedPatch: () => void;
  commitPatch: () => void;
  setHighlight: (selector: string | null) => void;
  logActivity: (entry: { toolName: string; input: any; alert?: string; status?: 'success' | 'blocked' | 'staged' | 'conflict'; latency?: number }) => void;
  approvePatch: () => void;
  setCommitUnmounted: () => void;
  setEpochConflict: (hasConflict: boolean) => void;
}

export const useA11yStore = create<A11yState>((set) => ({
  currentEpoch: 1,
  activeFixture: 'combobox',
  stagedPatch: null,
  highlightedSelector: null,
  activityLog: [],
  isCommitMounted: false,
  epochConflict: false,
  appliedPatches: {},

  loadFixture: (fixture) => set((state) => ({ 
    activeFixture: fixture, 
    currentEpoch: state.currentEpoch + 1,
    stagedPatch: null,
    highlightedSelector: null,
    isCommitMounted: false,
    appliedPatches: {}
  })),
  
  incrementEpoch: () => set((state) => ({ currentEpoch: state.currentEpoch + 1 })),
  
  stagePatch: (patch) => set({ stagedPatch: patch, isCommitMounted: false }),
  
  clearStagedPatch: () => set({ stagedPatch: null, isCommitMounted: false }),

  commitPatch: () => set((state) => {
    if (!state.stagedPatch) return state;
    return {
      appliedPatches: {
        ...state.appliedPatches,
        [state.stagedPatch.selector]: {
          ...(state.appliedPatches[state.stagedPatch.selector] || {}),
          ...state.stagedPatch.attributes
        }
      },
      stagedPatch: null,
      isCommitMounted: false
    };
  }),
  
  setHighlight: (selector) => set({ highlightedSelector: selector }),
  
  logActivity: (entry) => set((state) => ({
    activityLog: [
      {
        id: 'run_' + Math.random().toString(36).substring(2, 9),
        toolName: entry.toolName,
        input: entry.input,
        alert: entry.alert,
        status: entry.status || (entry.alert?.includes('HONEYPOT') ? 'blocked' : 'success'),
        latency: entry.latency || Math.floor(Math.random() * 15) + 12,
        timestamp: Date.now()
      },
      ...state.activityLog
    ].slice(0, 50)
  })),

  approvePatch: () => set({ isCommitMounted: true }),
  
  setCommitUnmounted: () => set({ isCommitMounted: false }),

  setEpochConflict: (hasConflict) => set({ epochConflict: hasConflict })
}));
