import type { AIProvider } from "./types";
import { OllamaProvider } from "./ollama";
import { AnthropicProvider } from "./anthropic";
import { BedrockProvider } from "./bedrock";
import { MockProvider } from "./mock";

export type { AIProvider, AIMessage, AIGenerateOptions } from "./types";

// AI_PROVIDER で実装を差し替え(ADR-016)。
//   ollama   = ローカル開発(既定)
//   bedrock  = 本番(AWS Bedrock Tokyo、ADR-018)
//   anthropic= 開発時の直接 API(本番では使わない)
//   mock     = 外部依存ゼロ(CI / Vercel デモ / Ollama 非導入環境)
export function getAIProvider(): AIProvider {
  const kind = (process.env.AI_PROVIDER ?? "ollama").toLowerCase();
  switch (kind) {
    case "bedrock":
      return new BedrockProvider();
    case "anthropic":
      return new AnthropicProvider();
    case "mock":
      return new MockProvider();
    case "ollama":
    default:
      return new OllamaProvider();
  }
}
