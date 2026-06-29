import { getAIProvider } from "@/lib/ai";
import { ok, bad, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { requireAppUser } from "@/lib/api/auth";
import type { WeekPlan, CycleIntake } from "@/lib/db/repositories/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { ym?: string; vision?: string; intake?: CycleIntake };

// ```json フェンスや前後の語を許容して JSON を取り出す
function extractJson<T>(s: string): T | null {
  try { return JSON.parse(s) as T; } catch { /* fallthrough */ }
  const a = s.indexOf("{");
  const b = s.lastIndexOf("}");
  if (a >= 0 && b > a) {
    try { return JSON.parse(s.slice(a, b + 1)) as T; } catch { /* noop */ }
  }
  return null;
}

/** POST /api/ai/cycle-plan-gen — 目標 + 週次アクションプラン(W1〜W4)を生成 */
export async function POST(req: Request) {
  const sess = await requireAppUser();
  if (sess instanceof Response) return sess;
  const b = await readJson<Body>(req);
  const userId = sess.userId;
  const intake = b.intake;
  if (!intake?.theme) return bad("intake.theme が必要です");

  // 過去の活動内容(疎結合: 読み取りのみ)を素材として渡す
  const topics = await getRepos().topics.list(userId, "topic").catch(() => [] as string[]);

  const provider = getAIProvider();
  let raw: string;
  try {
    raw = await provider.generate({
      task: "cycle-plan-gen",
      temperature: 0.5,
      maxTokens: 1200,
      json: true,
      messages: [
        {
          role: "system",
          content:
            "あなたは地域おこし協力隊員の月次計画を作る支援 AI。入力をもとに、現実的で具体的な" +
            "『今月の目標(1 文)』と『週次アクションプラン(W1〜W4)』を作る。判定はしない。" +
            "出張や多忙の週は負荷を下げる。必ず次の JSON だけを返す(説明文なし):\n" +
            '{"monthlyGoal":"string","actionPlan":[{"week":1,"title":"string","actions":["string"],"expectedOutcome":"string","checkPoint":"string"}]}',
        },
        {
          role: "user",
          content:
            `任期ビジョン: ${b.vision || "(未設定)"}\n` +
            `テーマ: ${intake.theme}\n` +
            `到達レベル: ${intake.level}\n` +
            `週に動ける日数: ${intake.daysPerWeek}\n` +
            `特別な予定: ${(intake.specialPlans ?? []).join("、") || "なし"}\n` +
            `過去の活動内容: ${topics.join("、") || "(履歴なし)"}`,
        },
      ],
    });
  } catch (e) {
    return bad(`AI 呼び出し失敗(${provider.name}): ${(e as Error).message}`, 502);
  }

  const parsed = extractJson<{ monthlyGoal?: string; actionPlan?: WeekPlan[] }>(raw);
  if (!parsed?.actionPlan?.length) {
    return bad("AI の応答を解釈できませんでした。もう一度お試しください。", 502);
  }
  return ok({
    monthlyGoal: parsed.monthlyGoal ?? "",
    actionPlan: parsed.actionPlan,
    provider: provider.name,
    model: provider.model,
  });
}
