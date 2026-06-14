import { getAIProvider } from "@/lib/ai";
import type { AIGenerateOptions } from "@/lib/ai";
import { ok, bad, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  context: "daily-write" | "report-plan" | "expense-purpose" | "case-find";
  payload?: { current?: string; title?: string; amount?: string };
  userId?: string;
};

const SYSTEM: Record<Body["context"], string> = {
  "daily-write":
    "あなたは地域おこし協力隊員の活動メモを 5W1H に沿って整理する支援 AI。判定はせず、書き方の視点と例だけを示す。簡潔な箇条書きで。",
  "report-plan":
    "あなたは協力隊員の来月計画を整理する支援 AI。継続/新規/振り返りの 3 分類で提案する。判定はしない。",
  "expense-purpose":
    "あなたは活動費の用途文を整理する支援 AI。目的/必要性/効果/前例の構造で整える。可否判定はしない。",
  "case-find":
    "あなたは全国の協力隊事例から近いものを探す支援 AI。候補を数件、地域名と一言で提示する。",
};

const TASK: Record<Body["context"], AIGenerateOptions["task"]> = {
  "daily-write": "consult-daily-write",
  "report-plan": "consult-report-plan",
  "expense-purpose": "consult-expense-purpose",
  "case-find": "consult-case-find",
};

export async function POST(req: Request) {
  const body = await readJson<Body>(req);
  if (!body.context || !SYSTEM[body.context]) return bad("context が不正です");

  const cur = body.payload?.current?.trim() ?? "";
  const extra =
    body.context === "expense-purpose" && (body.payload?.title || body.payload?.amount)
      ? `\n参考: タイトル=${body.payload?.title ?? ""} / 金額=${body.payload?.amount ?? ""}`
      : "";

  const provider = getAIProvider();
  let reply: string;
  try {
    reply = await provider.generate({
      task: TASK[body.context],
      temperature: 0.5,
      maxTokens: 700,
      messages: [
        { role: "system", content: SYSTEM[body.context] },
        { role: "user", content: `${cur || "(まだ入力なし)"}${extra}` },
      ],
    });
  } catch (e) {
    return bad(`AI 呼び出し失敗(${provider.name}): ${(e as Error).message}`, 502);
  }

  try {
    await getRepos().consultations.log({ userId: body.userId ?? "m1", contextKind: body.context, input: cur, output: reply });
  } catch {
    /* ログ失敗は無視 */
  }

  return ok({ reply, provider: provider.name, model: provider.model });
}
