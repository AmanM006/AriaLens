# AriaLens

> **Agent-Native Live Accessibility & Screen-Reader Remediation Studio**  
> *Built for The WebMCP Challenge (OpenAI x W3C WebMCP Hackathon)*

[![WebMCP Draft Spec](https://img.shields.io/badge/WebMCP-W3C_Draft_Spec-blue.svg)](https://github.com/w3c/web-machine-learning)
[![WCAG 2.2](https://img.shields.io/badge/WCAG-2.2_AA%2FAAA-emerald.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![axe-core](https://img.shields.io/badge/axe--core-v4.10-orange.svg)](https://github.com/dequelabs/axe-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

---

## Executive Summary

Server-side AI coding agents fail catastrophically at web accessibility. When inspecting static HTML/JSX ASTs, LLMs hallucinate ARIA tags, miscalculate contrast ratios across layered alpha-blended CSS backgrounds, and cannot verify whether a modal actually traps keyboard focus or leaks to background content.

**AriaLens** is an agent-native accessibility and screen-reader remediation studio running **100% inside the browser runtime**. Powered by the emerging **W3C WebMCP draft standard** (`document.modelContext`), AriaLens equips AI agents with direct, real-time diagnostic tools to audit computed accessibility trees, walk live keyboard focus paths, measure rendered relative luminance, test acoustic screen-reader speech synthesis, and propose remediations through a strict **Human-in-the-Loop (HITL) Authority Boundary**.

---

## Why WebMCP? (The Runtime-Exclusivity Principle)

Remote backend MCP servers structurally **cannot** perform high-consequence accessibility remediation:

1. **Live AccName 1.1 Computation**: Accessible names depend on live computed styles, `aria-labelledby` reference chains, and hidden visibility states that do not exist in static source files.
2. **True Visual Contrast Calculation**: CSS class names do not reveal real rendered contrast. AriaLens measures live computed styles (`window.getComputedStyle`) accounting for alpha-blended parent stacks and fallbacks against the WCAG relative luminance formula:
   $$\text{Ratio} = \frac{L_1 + 0.05}{L_2 + 0.05}$$
3. **Runtime Focus-Trap Simulation**: Keyboard trapping cannot be guessed from markup—it requires testing tab-traversal loops against non-inert background nodes.
4. **Auditory Proof via Web Speech API**: AriaLens uses native `window.speechSynthesis` so the agent and user can literally *hear* the acoustic difference between a broken element and a staged ARIA remediation before committing any DOM mutation.

---

## Spec-Native Security & Architecture

AriaLens implements the deepest edges of the **W3C WebMCP draft specification**, specifically addressing the security and lifecycle vectors outlined in **Section 6**:

```
+-----------------------------------------------------------------------------+
|                             AI AGENT (LLM)                                  |
+-----------------------------------------------------------------------------+
                | WebMCP Protocol                             |
                v                                             v
+--------------------------------------+     +--------------------------------+
|        Diagnostic Read Tools         |     |     Staging Mutation Tool      |
|  (untrustedContentHint: true/false)  |     |   (readOnlyHint: false)        |
|  - audit_accessibility_tree          |     |   - stage_aria_remediation     |
|  - trace_keyboard_trap               |     +----------------+---------------+
|  - check_contrast_ratios             |                      |
|  - preview_screen_reader             |                      v
+-------------------+------------------+     +--------------------------------+
                    |                        |       Virtual Staged Layer     |
                    v                        +----------------+---------------+
+--------------------------------------+                      |
|        Live Browser Runtime          |                      v
|  - axe-core WCAG 2.2 engine          |     +--------------------------------+
|  - Computed Style & Luminance        |     |    Human Authority Boundary    |
|  - window.speechSynthesis Audio      |     |      (HITL Approval Gate)      |
|  - Active Tab Sequence Walking       |     +----------------+---------------+
+--------------------------------------+                      |
                                                              | Human Click: "Approve"
                                                              v
                                             +--------------------------------+
                                             | Ephemeral Commit Tool Mounted  |
                                             |   - commit_a11y_fix            |
                                             |   (Single-use AbortController) |
                                             |   (Optimistic Epoch Locking)   |
                                             +----------------+---------------+
                                                              |
                                                              v Live DOM Mutated
                                             +--------------------------------+
                                             | State Epoch Bumped (epoch + 1) |
                                             | Tool Automatically Unmounted   |
                                             +--------------------------------+
```

### 1. Section 6.4.3 Untrusted Content Mitigation
Any diagnostic tool reading user-generated DOM content (`audit_accessibility_tree`, `preview_screen_reader`) explicitly declares:
```typescript
annotations: {
  readOnlyHint: true,
  untrustedContentHint: true
}
```
This instructs the agent runtime to treat retrieved values as untrusted strings, neutralizing indirect prompt injection attacks.

### 2. Section 6.3.2.3 Ambiguous Finalization & Ephemeral Tooling
Mutating the live DOM is high-consequence. The destructive `commit_a11y_fix` tool is **never exposed upfront** in `document.modelContext`. Instead:
- The agent calls `stage_aria_remediation` to propose a patch.
- The UI renders the staged attributes in the **Authority Boundary** tray.
- Only when the human reviews and clicks **Approve & Mount Commit Tool** is `commit_a11y_fix` dynamically registered with a dedicated `AbortController`.
- The commit tool unregisters itself immediately upon execution (single-use ephemeral lifecycle) or when rejected.

### 3. Optimistic Epoch Concurrency Locking
To eliminate stale overwrite race conditions (e.g. human edits the page while the agent is formulating a patch), each commit requires matching the `currentEpoch`:
```typescript
if (state.currentEpoch !== input.expectedEpoch) {
  return {
    success: false,
    errorCode: "STALE_EPOCH_CONFLICT",
    message: "Human modified the DOM during evaluation. Re-run audit."
  };
}
```

---

## WebMCP Tool Catalog

| Tool Name | Type | Spec Annotations | Description |
| :--- | :---: | :---: | :--- |
| `audit_accessibility_tree` | Query | `readOnlyHint: true`<br>`untrustedContentHint: true` | Evaluates live computed accessibility tree, ARIA roles, and accessible names via axe-core. |
| `trace_keyboard_trap` | Query | `readOnlyHint: true`<br>`untrustedContentHint: false` | Traces active tab traversal sequence to detect focus escapes or missing circular containment. |
| `check_contrast_ratios` | Query | `readOnlyHint: true`<br>`untrustedContentHint: true` | Computes live WCAG 2.2 relative luminance contrast ratio against parent background stacks. |
| `preview_screen_reader` | Query / Audio | `readOnlyHint: true`<br>`untrustedContentHint: true` | Speaks computed screen-reader text over native `window.speechSynthesis` for acoustic verification. |
| `stage_aria_remediation` | Mutation (Stage) | `readOnlyHint: false`<br>`untrustedContentHint: false` | Proposes accessible attribute patches into a staged virtual DOM layer without modifying live state. |
| `commit_a11y_fix` | Ephemeral (Commit) | `readOnlyHint: false`<br>`untrustedContentHint: false` | **Mounted ephemerally on human approval.** Applies staged patch to live DOM; validates epoch lock. |

---

## 60-Second Judging Reproduction Fixtures

AriaLens includes three deterministic 1-click test fixtures designed for rapid hackathon evaluation:

1. **Inert Modal Trap (`MODAL`)**:
   - *Failure*: Custom modal open without `role="dialog"`, `aria-modal="true"`, or focus trapping. Tab key escapes to background buttons.
   - *Agent Remediation*: Identifies focus leak, stages `role="dialog"` + `aria-modal="true"` + `aria-labelledby="#modal-title"`, previews audio, and requests approval.
2. **Silent Custom Combobox (`COMBOBOX`)**:
   - *Failure*: Plain clickable `<div>` dropdown missing `role="combobox"`, `aria-expanded`, and keyboard focusability. Screen readers announce only raw text.
   - *Agent Remediation*: Stages interactive combobox roles, active-descendant pointers, and expansion state bindings.
3. **Low-Contrast Grid (`CONTRAST`)**:
   - *Failure*: Subdued `#94a3b8` text on white background failing WCAG AA (measured at ~2.3:1 vs required 4.5:1).
   - *Agent Remediation*: Computes luminance failure delta and stages compliant color tokens.

---

## Quickstart

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation
```bash
# 1. Clone repository
git clone https://github.com/AmanM006/AriaLens.git
cd AriaLens

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```
Open **http://localhost:5173** in your browser.

### Verification Suite
```bash
# Verify TypeScript strict type-safety
npm run typecheck

# Verify production bundle compilation
npm run build
```

---

## Repository Structure

```
AriaLens/
├── src/
│   ├── components/
│   │   └── Fixtures.tsx         # Deterministic broken UI targets (Modal, Combobox, Contrast)
│   ├── lib/
│   │   ├── a11y/
│   │   │   └── engine.ts        # axe-core evaluator, WCAG luminance math, focus tracer & SpeechSynthesis
│   │   └── webmcp/
│   │       ├── registry.ts      # Dynamic tool registry with AbortController lifecycle & toolchange dispatch
│   │       └── tools.ts         # 5 W3C WebMCP tools + ephemeral single-use commit tool
│   ├── store/
│   │   └── a11yStore.ts         # Zustand state engine with optimistic epoch locking & HITL staged layer
│   ├── types/
│   │   └── webmcp.d.ts          # W3C Model Context protocol TypeScript definitions
│   ├── App.tsx                  # Production studio shell, target overlays & HITL Authority Boundary
│   └── main.tsx                 # Application entry point
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Hackathon Evaluation Alignment

| Evaluation Pillar | How AriaLens Delivers |
| :--- | :--- |
| **Deterministic Core** | State is governed by an integer epoch counter (`currentEpoch`). AI agents never touch live state directly—mutations are staged, locked by epoch, and gated by human authorization. |
| **Spec-Native Fidelity** | Leverages imperative `document.modelContext.registerTool`, dynamic `AbortController` unmounting, `toolchange` notifications, and strict `untrustedContentHint` / `readOnlyHint` annotations. |
| **High-Consequence Domain** | Accessibility (WCAG 2.2 AA / Section 508 / ADA compliance) directly impacts millions of disabled users. Inaccessible apps face major legal liability and exclusion. |
| **Zero-Latency In-Browser Execution** | Zero backend latency. Contrast math, focus-path tracing, axe-core AST audits, and speech synthesis run 100% client-side in the user's browser. |

---

## License

MIT (c) 2026 Aman & AriaLens Contributors. Built for The WebMCP Challenge.