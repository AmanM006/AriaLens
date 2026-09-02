import axe from 'axe-core';

export interface AuditResult {
  selector: string;
  violations: Array<{
    id: string;
    impact: string;
    description: string;
    helpUrl: string;
    nodes: string[];
  }>;
  computedAccessibleName?: string;
  role?: string;
  contrastRatio?: number;
}

export class A11yEngine {
  /**
   * Evaluates the accessibility tree of a given subtree using axe-core
   */
  static async auditSubtree(selector: string = '#fixture-container', signal?: AbortSignal): Promise<AuditResult[]> {
    signal?.throwIfAborted();

    const container = document.querySelector(selector);
    if (!container) {
      throw new Error(`Target container "${selector}" not found in DOM.`);
    }

    const results = await axe.run(container, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']
      }
    });

    signal?.throwIfAborted();

    return results.violations.map(v => ({
      selector,
      violations: [{
        id: v.id,
        impact: v.impact || 'moderate',
        description: v.description,
        helpUrl: v.helpUrl,
        nodes: v.nodes.map(n => n.target.join(' '))
      }]
    }));
  }

  /**
   * Traces focusable elements to detect focus escape or lack of circular containment
   */
  static traceFocusTrap(containerSelector: string): { isTrapped: boolean; focusableCount: number; elements: string[]; leakDetected: boolean } {
    const container = document.querySelector(containerSelector) as HTMLElement;
    if (!container) {
      throw new Error(`Container "${containerSelector}" not found.`);
    }

    const focusableSelectors = 'a[href], button, input, select, textarea, [tabindex]';
    const allDocFocusables = Array.from(document.querySelectorAll(focusableSelectors)) as HTMLElement[];

    let leakDetected = false;
    const trulyFocusableContainerElements: HTMLElement[] = [];

    // Real focus trace
    const originalActive = document.activeElement as HTMLElement;

    for (const el of allDocFocusables) {
      // Skip obviously inert stuff or disabled elements
      if (el.hasAttribute('disabled') || el.closest('[inert]')) continue;
      
      // Try to focus
      el.focus({ preventScroll: true });
      if (document.activeElement === el) {
        if (container.contains(el)) {
          trulyFocusableContainerElements.push(el);
        } else {
          // If we can focus something outside the container, it's a leak!
          leakDetected = true;
        }
      }
    }

    // Restore original focus
    if (originalActive) {
      originalActive.focus({ preventScroll: true });
    } else {
      (document.activeElement as HTMLElement)?.blur();
    }

    return {
      isTrapped: !leakDetected && trulyFocusableContainerElements.length > 0,
      focusableCount: trulyFocusableContainerElements.length,
      elements: trulyFocusableContainerElements.map(el => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className ? '.' + el.className.split(' ')[0] : ''}`),
      leakDetected
    };
  }

  /**
   * Computes WCAG relative luminance and contrast ratio
   */
  static getContrastRatio(selector: string): { ratio: number; passesAA: boolean; fgColor: string; bgColor: string } {
    const el = document.querySelector(selector) as HTMLElement;
    if (!el) throw new Error(`Element "${selector}" not found.`);

    const fgStyle = window.getComputedStyle(el);
    const fgColor = fgStyle.color;
    
    // Recursive alpha blending up the parent stack to <html>
    const parseRgba = (colorStr: string) => {
      const m = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (!m) return { r: 0, g: 0, b: 0, a: 0 };
      return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a: m[4] ? Number(m[4]) : 1 };
    };

    let currentEl: HTMLElement | null = el;
    let accumulatedBg = { r: 0, g: 0, b: 0, a: 0 };

    while (currentEl && accumulatedBg.a < 1) {
      const style = window.getComputedStyle(currentEl);
      const bg = parseRgba(style.backgroundColor);
      
      if (bg.a > 0) {
        // Porter-Duff source-over composite
        const outA = bg.a + accumulatedBg.a * (1 - bg.a);
        if (outA > 0) {
          accumulatedBg.r = (bg.r * bg.a + accumulatedBg.r * accumulatedBg.a * (1 - bg.a)) / outA;
          accumulatedBg.g = (bg.g * bg.a + accumulatedBg.g * accumulatedBg.a * (1 - bg.a)) / outA;
          accumulatedBg.b = (bg.b * bg.a + accumulatedBg.b * accumulatedBg.a * (1 - bg.a)) / outA;
        }
        accumulatedBg.a = outA;
      }
      currentEl = currentEl.parentElement;
    }

    // Blend any remaining transparency against white root
    if (accumulatedBg.a < 1) {
      const whiteA = 1 - accumulatedBg.a;
      accumulatedBg.r = accumulatedBg.r * accumulatedBg.a + 255 * whiteA;
      accumulatedBg.g = accumulatedBg.g * accumulatedBg.a + 255 * whiteA;
      accumulatedBg.b = accumulatedBg.b * accumulatedBg.a + 255 * whiteA;
    }

    const finalBgColor = `rgb(${Math.round(accumulatedBg.r)}, ${Math.round(accumulatedBg.g)}, ${Math.round(accumulatedBg.b)})`;

    const lum1 = this.getLuminance(fgColor);
    const lum2 = this.getLuminance(finalBgColor);
    const ratio = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);

    return {
      ratio: Number(ratio.toFixed(2)),
      passesAA: ratio >= 4.5,
      fgColor,
      bgColor: finalBgColor
    };
  }

  /**
   * Auditory Screen-Reader Simulation via Web Speech API
   */
  static speakScreenReaderOutput(text: string): Promise<string> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve(text);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => resolve(text);
      utterance.onerror = () => resolve(text);
      window.speechSynthesis.speak(utterance);
    });
  }

  private static getLuminance(rgbStr: string): number {
    const match = rgbStr.match(/\d+/g);
    if (!match || match.length < 3) return 0;
    const [r, g, b] = match.slice(0, 3).map(Number).map(v => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
}
