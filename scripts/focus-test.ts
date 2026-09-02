import { JSDOM } from 'jsdom';
import assert from 'node:assert/strict';
import { A11yEngine } from '../src/lib/a11y/engine';

console.log("==================================================");
console.log("  AriaLens - Focus Restore Test (JSDOM)");
console.log("==================================================\n");

function runFocusTest() {
  const dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
    <body>
      <button id="outside-btn">Outside</button>
      <div id="modal">
        <button id="inside-btn-1">Inside 1</button>
        <button id="inside-btn-2">Inside 2</button>
      </div>
    </body>
    </html>
  `);

  (global as any).window = dom.window;
  (global as any).document = dom.window.document;
  (global as any).HTMLElement = dom.window.HTMLElement;

  const outsideBtn = dom.window.document.getElementById('outside-btn') as any;
  const insideBtn1 = dom.window.document.getElementById('inside-btn-1') as any;

  // Simulate user focusing the outside button before the trace begins
  outsideBtn.focus();
  
  console.log("[TEST] Initial document.activeElement:", dom.window.document.activeElement?.id);
  assert.strictEqual(dom.window.document.activeElement?.id, 'outside-btn', "Outside button should be focused initially.");

  console.log("  -> Running A11yEngine.traceFocusTrap('#modal')...");
  const result = A11yEngine.traceFocusTrap('#modal');

  console.log("  -> Trace Results:", result);
  
  console.log("[TEST] Verifying focus was restored...");
  console.log("  -> Post-trace document.activeElement:", dom.window.document.activeElement?.id);
  
  assert.strictEqual(dom.window.document.activeElement?.id, 'outside-btn', "Focus MUST be restored to the outside button after trace!");
  
  console.log("\n  [PASS] Focus perfectly restored to original activeElement!");
}

runFocusTest();
