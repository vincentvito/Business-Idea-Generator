export type PipelineEvent =
  | { type: "stage_start"; stage: string; message: string }
  | { type: "stage_progress"; stage: string; progress: number; data?: unknown }
  | { type: "stage_complete"; stage: string; data: unknown; warning?: string }
  | { type: "stream_text"; stage: string; delta: string }
  | { type: "error"; stage: string; message: string; recoverable: boolean }
  | { type: "pipeline_complete"; summary: unknown };
