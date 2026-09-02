import { globalRegistry } from './registry';
import { useA11yStore } from '../../store/a11yStore';
import { A11yEngine } from '../a11y/engine';

const getEpoch = () => useA11yStore.getState().currentEpoch;
const logTool = (toolName: string, input: any) => useA11yStore.getState().logActivity({ toolName, input });

export function registerDiagnosticTools() {
  globalRegistry.register({
    name: "audit_accessibility_tree",
    title: "Audit Accessibility Tree",
    description: "Evaluates the live computed accessibility tree, ARIA roles, and accessible names.",
    inputSchema: {
      type: "object",
      properties: { selector: { type: "string" } },
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: async (input: any, { signal }: { signal: AbortSignal }) => {
      signal.throwIfAborted();
      logTool('audit_accessibility_tree', input);
      useA11yStore.getState().setEpochConflict(false);
      useA11yStore.getState().setHighlight(input.selector || '#fixture-container');
      const results = await A11yEngine.auditSubtree(input.selector || '#fixture-container', signal);
      return { epoch: getEpoch(), results };
    }
  });

  globalRegistry.register({
    name: "trace_keyboard_trap",
    title: "Trace Keyboard Focus Trap",
    description: "Simulates Tab traversal to detect focus escapes.",
    inputSchema: {
      type: "object",
      properties: { containerSelector: { type: "string" } },
      required: ["containerSelector"],
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    execute: async (input: any, { signal }: { signal: AbortSignal }) => {
      signal.throwIfAborted();
      logTool('trace_keyboard_trap', input);
      useA11yStore.getState().setHighlight(input.containerSelector);
      return { epoch: getEpoch(), ...A11yEngine.traceFocusTrap(input.containerSelector) };
    }
  });
  
  globalRegistry.register({
    name: "check_contrast_ratios",
    title: "Check Contrast Ratios",
    description: "Computes WCAG relative luminance and contrast ratio for an element.",
    inputSchema: {
      type: "object",
      properties: { selector: { type: "string" } },
      required: ["selector"],
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: async (input: any, { signal }: { signal: AbortSignal }) => {
      signal.throwIfAborted();
      logTool('check_contrast_ratios', input);
      useA11yStore.getState().setHighlight(input.selector);
      return { epoch: getEpoch(), ...A11yEngine.getContrastRatio(input.selector) };
    }
  });

  globalRegistry.register({
    name: "preview_screen_reader",
    title: "Preview Screen Reader Output",
    description: "Generates spoken screen-reader audio via SpeechSynthesis.",
    inputSchema: {
      type: "object",
      properties: {
        selector: { type: "string" },
        mode: { type: "string", enum: ["current", "staged"] }
      },
      required: ["selector", "mode"],
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: async (input: any, { signal }: { signal: AbortSignal }) => {
      signal.throwIfAborted();
      logTool('preview_screen_reader', input);
      const text = input.mode === 'staged' ? 'Dialog: Confirm Action. Cancel button. Delete Item button.' : 'Unlabeled container, clickable item.';
      const spokenText = await A11yEngine.speakScreenReaderOutput(text);
      return { epoch: getEpoch(), spokenText };
    }
  });
}

export function registerStagingTool() {
  globalRegistry.register({
    name: "stage_aria_remediation",
    title: "Stage ARIA Remediation",
    description: "Proposes accessible attribute patches to a staged virtual DOM layer.",
    inputSchema: {
      type: "object",
      properties: {
        selector: { type: "string" },
        attributes: { type: "object" },
        description: { type: "string" }
      },
      required: ["selector", "attributes", "description"],
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute: async (input: any, { signal }: { signal: AbortSignal }) => {
      signal.throwIfAborted();
      logTool('stage_aria_remediation', input);

      const state = useA11yStore.getState();
      if (state.epochConflict) {
        return { success: false, errorCode: "EPOCH_CONFLICT", message: "Cannot stage patch while epoch conflict is unresolved. Call audit_accessibility_tree first to re-sync." };
      }

      const allowedKeyRegex = /^(aria-|role$|tabindex$)/;
      const safeAttributes: Record<string, string> = {};
      
      for (const [key, value] of Object.entries(input.attributes || {})) {
        if (allowedKeyRegex.test(key)) {
          safeAttributes[key] = String(value);
        } else {
          console.warn(`Blocked unsafe attribute injection attempt: ${key}`);
        }
      }

      const patchId = Math.random().toString(36).substring(7);
      state.stagePatch({
        id: patchId,
        selector: input.selector,
        attributes: safeAttributes,
        description: input.description
      });
      
      // CAPABILITY FSM: Abort diagnostic tools to enforce sequential workflow
      globalRegistry.unregister("audit_accessibility_tree");
      globalRegistry.unregister("trace_keyboard_trap");
      globalRegistry.unregister("check_contrast_ratios");
      globalRegistry.unregister("preview_screen_reader");
      
      return { success: true, patchId, currentEpoch: getEpoch() };
    }
  });
}

export function registerCoreTools() {
  registerDiagnosticTools();
  registerStagingTool();
}

export function mountEphemeralCommitTool(patchId: string) {
  const expectedEpoch = useA11yStore.getState().currentEpoch;
  globalRegistry.registerEphemeral({
    name: "commit_a11y_fix",
    title: "Commit Accessibility Fix",
    description: "Applies the approved staged patch to the live DOM.",
    inputSchema: {
      type: "object",
      properties: { patchId: { type: "string" }, expectedEpoch: { type: "number" } },
      required: ["patchId", "expectedEpoch"],
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute: async (input: any) => {
      const state = useA11yStore.getState();
      logTool('commit_a11y_fix', input);
      state.setCommitUnmounted();
      
      if (state.currentEpoch !== input.expectedEpoch || state.currentEpoch !== expectedEpoch) {
        state.setEpochConflict(true);
        state.clearStagedPatch();
        registerDiagnosticTools(); // Remount diagnostic tools since patch is cleared
        return { 
          success: false, 
          errorCode: "STALE_EPOCH_CONFLICT",
          message: "Human modified the DOM during evaluation. Epoch mismatch. Re-run audit."
        };
      }
      if (input.patchId !== patchId) {
         return { success: false, message: "Invalid patch ID" };
      }
      
      state.commitPatch();
      state.incrementEpoch();
      state.setHighlight(null);
      registerDiagnosticTools(); // Remount diagnostic tools post-commit
      
      return { success: true, newEpoch: state.currentEpoch };
    }
  });
}
