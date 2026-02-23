import type { PipelineEvent } from "@/types/pipeline";

export function createSSEStream(
  runner: (emit: (event: PipelineEvent) => void) => Promise<void>
): Response {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: PipelineEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        await runner(emit);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const isConfigError = message.includes("ANTHROPIC_API_KEY");
        emit({
          type: "error",
          stage: "pipeline",
          message: isConfigError
            ? "AI service is not configured. Set ANTHROPIC_API_KEY in your environment variables."
            : message,
          recoverable: false,
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
