import { getAIProvider } from "@/lib/ai";
import { ok, bad, readJson } from "@/lib/api/http";
import type { WeekPlan } from "@/lib/db/repositories/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { monthlyGoal?: string; actionPlan?: WeekPlan[]; message?: string };

function extractJson<T>(s: string): T | null {
  try { return JSON.parse(s) as T; } catch { /* fallthrough */ }
  const a = s.indexOf("{");
  const b = s.lastIndexOf("}");
  if (a >= 0 && b > a) {
    try { return JSON.parse(s.slice(a, b + 1)) as T; } catch { /* noop */ }
  }
  return null;
}

/** POST /api/ai/cycle-adjust-suggest — プランの壁打ち。修正後プラン(任意)+ 一言を返す */
export async function POST(req: Request) {
  const b = await readJson<Body>(req);
  if (!b.message?.trim()) return bad("message が必要です");

  const provider = getAIProvider();
  let raw: string;
  try {
    raw = await provider.generate({
      task: "cycle-adjust-suggest",
      temperature: 0.5,
      maxTokens: 1200,
      json: true,
      messages: [
        {
          role: "system",
          content:
            "あなたは協力隊員の月次アクションプランの調整を手伝う支援 AI。判定はしない。" +
            "ユーザーの事情(予定変更・現実とのズレ等)に合わせ、必要ならプランを書き換える。" +
            "プランを変える場合は actionPlan に W1〜W4 全体を返し、助言だけなら actionPlan は null。" +
            "必ず次の JSON だけを返す:\n" +
            '{"reply":"string","actionPlan":null か [{"week":1,"title":"string","actions":["string"],"expectedOutcome":"string","checkPoint":"string"}]}',
        },
        {
          role: "user",
          content:
            `今月の目標: ${b.monthlyGoal || "(未設定)"}\n` +
            `現在のプラン: ${JSON.stringify(b.actionPlan ?? [])}\n` +
            `相談: ${b.message.trim()}`,
        },
      ],
    });
  } catch (e) {
    return bad(`AI 呼び出し失敗(${provider.name}): ${(e as Error).message}`, 502);
  }

  const parsed = extractJson<{ reply?: string; actionPlan?: WeekPlan[] | null }>(raw);
  return ok({
    reply: parsed?.reply ?? raw,
    actionPlan: parsed?.actionPlan ?? null,
    provider: provider.name,
    model: provider.model,
  });
}
