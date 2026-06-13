import type { AIProvider } from "./types";
import { OllamaProvider } from "./ollama";
import { AnthropicProvider } from "./anthropic";
import { MockProvider } from "./mock";

export type { AIProvider, AIMessage, AIGenerateOptions } from "./types";

// AI_PROVIDER で実装を差し替え(ADR-016)。既定は ollama。
// ollama を入れられない環境では AI_PROVIDER=mock にフォールバックできる。
export function getAIProvider(): AIProvider {
  const kind = (process.env.AI_PROVIDER ?? "ollama").toLowerCase();
  switch (kind) {
    case "anthropic":
      return new AnthropicProvider();
    case "mock":
      return new MockProvider();
    case "ollama":
    default:
      return new OllamaProvider();
  }
}
