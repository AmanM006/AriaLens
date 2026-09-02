import { ModelContextTool } from '../../types/webmcp';

export class ToolRegistry {
  private activeControllers: Map<string, AbortController> = new Map();

  /**
   * Registers a tool dynamically. If a tool with the same name exists, it aborts the old one.
   */
  register(tool: ModelContextTool): void {
    this.unregister(tool.name);

    const controller = new AbortController();
    this.activeControllers.set(tool.name, controller);

    const context = document.modelContext || navigator.modelContext;
    if (context) {
      try {
        context.registerTool(tool, { signal: controller.signal });
      } catch (err) {
        console.error(`WebMCP registerTool error for "${tool.name}":`, err);
      }
    } else {
      console.warn('WebMCP not supported in this browser.');
    }
  }

  /**
   * Unregisters a tool by aborting its controller, triggering a native toolchange event.
   */
  unregister(toolName: string): void {
    const controller = this.activeControllers.get(toolName);
    if (controller) {
      controller.abort();
      this.activeControllers.delete(toolName);
    }
  }

  /**
   * Registers an ephemeral tool that unregisters itself immediately after execution.
   */
  registerEphemeral(tool: ModelContextTool): void {
    const originalExecute = tool.execute;
    const ephemeralTool: ModelContextTool = {
      ...tool,
      execute: async (input, options) => {
        try {
          return await originalExecute(input, options);
        } finally {
          this.unregister(tool.name);
        }
      }
    };
    this.register(ephemeralTool);
  }

  unregisterAll(): void {
    for (const name of this.activeControllers.keys()) {
      this.unregister(name);
    }
  }
}

export const globalRegistry = new ToolRegistry();
