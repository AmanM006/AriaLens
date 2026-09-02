import { create } from 'zustand';

export interface StagedPatch {
  id: string;
  selector: string;
  attributes: Record<string, string>;
  description: string;
}

export interface ActivityLogEntry {
  toolName: string;
  timestamp: number;
  input: any;
}

export type FixtureType = 'none' | 'modal' | 'combobox' | 'contrast';

interface A11yState {
  currentEpoch: number;
  activeFixture: FixtureType;
  stagedPatch: StagedPatch | null;
  highlightedSelector: string | null;
  activityLog: ActivityLogEntry[];
  isCommitMounted: boolean;
  appliedPatches: Record<string, Record<string, string>>;
  
  loadFixture: (fixture: FixtureType) => void;
  incrementEpoch: () => void;
  stagePatch: (patch: StagedPatch) => void;
  clearStagedPatch: () => void;
  commitPatch: () => void;
  setHighlight: (selector: string | null) => void;
  logActivity: (entry: Omit<ActivityLogEntry, 'timestamp'>) => void;
  approvePatch: () => void;
  setCommitUnmounted: () => void;
}

export const useA11yStore = create<A11yState>((set) => ({
  currentEpoch: 1,
  activeFixture: 'modal',
  stagedPatch: null,
  highlightedSelector: null,
  activityLog: [],
  isCommitMounted: false,
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
    activityLog: [{ ...entry, timestamp: Date.now() }, ...state.activityLog].slice(0, 50)
  })),

  approvePatch: () => set({ isCommitMounted: true }),
  
  setCommitUnmounted: () => set({ isCommitMounted: false })
}));
