import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider, AIGenerateOptions } from "./types";

// Anthropic (Claude) プロバイダ。本番想定。
// 切替: .env.local の AI_PROVIDER=anthropic / ANTHROPIC_API_KEY=sk-ant-... 。

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic";
  readonly model = MODEL;
  private client: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY 未設定");
    this.client = new Anthropic({ apiKey });
  }

  async generate(opts: AIGenerateOptions): Promise<string> {
    const system = opts.messages
      .filter((m) => m.role === "system")
      .map((m) => m.content)
      .join("\n\n");
    const messages = opts.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const res = await this.client.messages.create({
      model: MODEL,
      max_tokens: opts.maxTokens ?? 2048,
      temperature: opts.temperature ?? 0.4,
      system: system || undefined,
      messages,
    });

    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    if (!text) throw new Error("Anthropic: 空の応答");
    return text;
  }

  async health(): Promise<{ ok: boolean; detail: string }> {
    if (!process.env.ANTHROPIC_API_KEY) return { ok: false, detail: "ANTHROPIC_API_KEY 未設定" };
    return { ok: true, detail: `Anthropic 設定済 / model=${MODEL}` };
  }
}
