import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    if (!apiKey) {
      throw new Error(
        "AI service is not configured. Please contact the administrator."
      );
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}
