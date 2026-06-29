import type { AIProvider } from "./types";
import { OllamaProvider } from "./ollama";
import { AnthropicProvider } from "./anthropic";
import { BedrockProvider } from "./bedrock";
import { OpenAIProvider } from "./openai";
import { MockProvider } from "./mock";

export type { AIProvider, AIMessage, AIGenerateOptions } from "./types";

// AI_PROVIDER で実装を差し替え(ADR-016)。トークン1個入れれば動く。
//   anthropic = Claude API(ANTHROPIC_API_KEY)
//   openai    = OpenAI 互換(OPENAI_API_KEY ＋ 任意で OPENAI_BASE_URL / OPENAI_MODEL)
//               → OpenAI / OpenRouter / Groq / ローカル等を横断
//   bedrock   = 本番(AWS Bedrock Tokyo、ADR-018)
//   ollama    = ローカル LLM(既定)
//   mock      = 外部依存ゼロ(CI / ローカル / Ollama 非導入環境)
export function getAIProvider(): AIProvider {
  const kind = (process.env.AI_PROVIDER ?? "ollama").toLowerCase();
  switch (kind) {
    case "bedrock":
      return new BedrockProvider();
    case "anthropic":
      return new AnthropicProvider();
    case "openai":
      return new OpenAIProvider();
    case "mock":
      return new MockProvider();
    case "ollama":
    default:
      return new OllamaProvider();
  }
}
