import type { AIProvider, AIGenerateOptions } from "./types";
import { resolveModel } from "./model-config";

// OpenAI 互換プロバイダ(ADR-016)。
// OpenAI 本家だけでなく、OpenAI Chat Completions 互換の API すべてに対応:
//   - OpenAI       : OPENAI_BASE_URL 既定(https://api.openai.com/v1)
//   - OpenRouter   : https://openrouter.ai/api/v1(多モデルをトークン1個で横断)
//   - Groq/Together/ローカル vLLM 等: それぞれの base URL
// 「base URL + model + トークン」を差し替えるだけで複数モデルを使い回せる。
const BASE = (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
// コスパ既定(2026): GPT-5.4 nano。機能別/全体は env で上書き(resolveModel 参照)。
const DEFAULT_MODEL = "gpt-5.4-nano";

export class OpenAIProvider implements AIProvider {
  readonly name = "openai";
  readonly model = process.env.OPENAI_MODEL ?? DEFAULT_MODEL;

  async generate(opts: AIGenerateOptions): Promise<string> {
    // 汎用 AI_API_KEY をフォールバックに(provider 共通の1キー運用を許可)
    const apiKey = process.env.OPENAI_API_KEY ?? process.env.AI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY / AI_API_KEY 未設定");

    // 機能(task)ごとにモデルを解決(OPENAI_MODEL_<TASK> > OPENAI_MODEL > 既定)
    const model = resolveModel("OPENAI_MODEL", opts.task, DEFAULT_MODEL);

    // 新世代(gpt-5系 / o系)は max_completion_tokens 必須・temperature は既定固定。
    // 旧世代(gpt-4o 系)は max_tokens + temperature。両系で 400 を出さないよう切替。
    const newGen = /^(gpt-5|o\d)/i.test(model);
    const maxTokens = opts.maxTokens ?? 2048;

    const body: Record<string, unknown> = {
      model,
      // OpenAI は system/user/assistant をそのまま受け取れる
      messages: opts.messages.map((m) => ({ role: m.role, content: m.content })),
      ...(newGen
        ? { max_completion_tokens: maxTokens }
        : { max_tokens: maxTokens, temperature: opts.temperature ?? 0.4 }),
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    };

    const res = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`OpenAI 互換 API ${res.status}: ${detail.slice(0, 200)}`);
    }

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = (data.choices?.[0]?.message?.content ?? "").trim();
    if (!text) throw new Error("OpenAI 互換: 空の応答");
    return text;
  }

  async health(): Promise<{ ok: boolean; detail: string }> {
    if (!process.env.OPENAI_API_KEY && !process.env.AI_API_KEY) return { ok: false, detail: "OPENAI_API_KEY / AI_API_KEY 未設定" };
    return { ok: true, detail: `OpenAI 互換 設定済 / base=${BASE} / model=${this.model}(既定。機能別は OPENAI_MODEL_<TASK> で上書き)` };
  }
}
