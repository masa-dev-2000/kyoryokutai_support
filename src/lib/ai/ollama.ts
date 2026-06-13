import type { AIProvider, AIGenerateOptions } from "./types";

// Ollama プロバイダ(ローカル LLM 既定)。
// `ollama serve` が http://localhost:11434 で動いている前提。
// 切替: .env.local の AI_PROVIDER=ollama / OLLAMA_MODEL=llama3.2 等。

const BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const MODEL = process.env.OLLAMA_MODEL ?? "llama3.2";

export class OllamaProvider implements AIProvider {
  readonly name = "ollama";
  readonly model = MODEL;

  async generate(opts: AIGenerateOptions): Promise<string> {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: opts.messages,
        stream: false,
        format: opts.json ? "json" : undefined,
        options: {
          temperature: opts.temperature ?? 0.4,
          ...(opts.maxTokens ? { num_predict: opts.maxTokens } : {}),
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Ollama ${res.status}: ${text || res.statusText}`);
    }

    const data = (await res.json()) as { message?: { content?: string } };
    const content = data.message?.content?.trim();
    if (!content) throw new Error("Ollama: 空の応答");
    return content;
  }

  async health(): Promise<{ ok: boolean; detail: string }> {
    try {
      const res = await fetch(`${BASE_URL}/api/tags`, { method: "GET" });
      if (!res.ok) return { ok: false, detail: `Ollama ${res.status} @ ${BASE_URL}` };
      const data = (await res.json()) as { models?: { name: string }[] };
      const names = (data.models ?? []).map((m) => m.name);
      const hasModel = names.some((n) => n === MODEL || n.startsWith(`${MODEL}:`));
      return {
        ok: hasModel,
        detail: hasModel
          ? `Ollama OK @ ${BASE_URL} / model=${MODEL}`
          : `Ollama 起動中だが model=${MODEL} 未取得。'ollama pull ${MODEL}' を実行(取得済: ${names.join(", ") || "なし"})`,
      };
    } catch (e) {
      return { ok: false, detail: `Ollama 未起動 @ ${BASE_URL}: ${(e as Error).message}` };
    }
  }
}
