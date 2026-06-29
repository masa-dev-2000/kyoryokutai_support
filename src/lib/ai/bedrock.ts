import {
  BedrockRuntimeClient,
  ConverseCommand,
  type Message,
  type SystemContentBlock,
} from "@aws-sdk/client-bedrock-runtime";
import type { AIProvider, AIGenerateOptions } from "./types";

// AWS Bedrock Tokyo プロバイダ(ADR-018 本番 AI)。
// データは jp 地理境界(東京 + 大阪)で完結。Anthropic と直接契約しない。
// 切替: .env の AI_PROVIDER=bedrock / AWS_REGION=ap-northeast-1 等。

const REGION = process.env.AWS_REGION ?? "ap-northeast-1";
// Sonnet 4.6 は ap-northeast-1 native、Haiku 4.5 は jp.* CRIS(地理境界内ルーティング)
const SONNET = process.env.BEDROCK_SONNET_MODEL_ID ?? "anthropic.claude-sonnet-4-6-v1:0";
const HAIKU = process.env.BEDROCK_HAIKU_MODEL_ID ?? "jp.anthropic.claude-haiku-4-5-v1:0";
// プロンプトキャッシュ(対応リージョン/モデルでのみ有効化。既定 OFF で安全側)
const PROMPT_CACHE = process.env.BEDROCK_PROMPT_CACHE === "1";

// 軽量タスクは Haiku、重量タスクは Sonnet にルーティング(docs/24 §7.2)
const HAIKU_TASKS = new Set<NonNullable<AIGenerateOptions["task"]>>([
  "consult-daily-write",
  "consult-report-plan",
  "consult-expense-purpose",
  "consult-case-find",
  "expense-title",
  "vision-coach",
  "cycle-adjust-suggest",
]);

let _client: BedrockRuntimeClient | null = null;
function client(): BedrockRuntimeClient {
  if (!_client) _client = new BedrockRuntimeClient({ region: REGION });
  return _client;
}

export class BedrockProvider implements AIProvider {
  readonly name = "bedrock";
  readonly model = SONNET;

  private pickModel(task?: AIGenerateOptions["task"]): string {
    return task && HAIKU_TASKS.has(task) ? HAIKU : SONNET;
  }

  async generate(opts: AIGenerateOptions): Promise<string> {
    const modelId = this.pickModel(opts.task);

    const systemText = opts.messages
      .filter((m) => m.role === "system")
      .map((m) => m.content)
      .join("\n\n");

    const system: SystemContentBlock[] | undefined = systemText
      ? PROMPT_CACHE
        ? [{ text: systemText }, { cachePoint: { type: "default" } }]
        : [{ text: systemText }]
      : undefined;

    const messages: Message[] = opts.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: [{ text: m.content }],
      }));

    const res = await client().send(
      new ConverseCommand({
        modelId,
        system,
        messages,
        inferenceConfig: {
          maxTokens: opts.maxTokens ?? 2048,
          temperature: opts.temperature ?? 0.4,
        },
      })
    );

    const text =
      res.output?.message?.content
        ?.map((b) => ("text" in b ? b.text : ""))
        .join("")
        .trim() ?? "";
    if (!text) throw new Error("Bedrock: 空の応答");
    return text;
  }

  async health(): Promise<{ ok: boolean; detail: string }> {
    if (!process.env.AWS_ACCESS_KEY_ID && !process.env.AWS_PROFILE) {
      return { ok: false, detail: "AWS 認証情報未設定(AWS_ACCESS_KEY_ID / AWS_PROFILE)" };
    }
    try {
      await this.generate({ task: "generic", messages: [{ role: "user", content: "ping" }], maxTokens: 5 });
      return { ok: true, detail: `Bedrock Tokyo OK / sonnet=${SONNET} / haiku=${HAIKU} / cache=${PROMPT_CACHE}` };
    } catch (e) {
      return { ok: false, detail: `Bedrock 失敗 @ ${REGION}: ${(e as Error).message}` };
    }
  }
}
