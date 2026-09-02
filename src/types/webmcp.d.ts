export interface ToolAnnotations {
  readOnlyHint?: boolean;
  untrustedContentHint?: boolean;
}

export interface ModelContextTool {
  name: string;
  title?: string;
  description: string;
  inputSchema: any;
  annotations?: ToolAnnotations;
  execute: (input: any, options: { signal: AbortSignal }) => Promise<any>;
}

export interface ModelContext {
  registerTool(
    tool: ModelContextTool,
    options?: { signal?: AbortSignal }
  ): void;
  getTools?(): Promise<ModelContextTool[]>;
  ontoolchange?: () => void;
}

declare global {
  interface Document {
    modelContext?: ModelContext;
  }
  interface Navigator {
    modelContext?: ModelContext;
  }
}
