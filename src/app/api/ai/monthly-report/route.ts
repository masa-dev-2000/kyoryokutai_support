import { getAIProvider } from "@/lib/ai";
import { ok, bad, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { userId?: string; ym?: string };

export async function POST(req: Request) {
  const { userId = "m1", ym } = await readJson<Body>(req);
  if (!ym) return bad("ym(YYYY-MM)が必要です");

  const logs = await getRepos().activityLogs.listForAI(userId, ym);
  if (logs.length === 0) return bad("対象月の活動記録がありません", 404);

  const logText = logs
    .map(
      (l) =>
        `- ${l.log_date} [${l.activity_type}/${l.topic}] ${l.hours}h ${l.body}${
          l.expense_amount ? ` (経費¥${l.expense_amount})` : ""
        }`
    )
    .join("\n");

  const provider = getAIProvider();
  let markdown: string;
  try {
    markdown = await provider.generate({
      task: "monthly-report",
      temperature: 0.4,
      maxTokens: 1500,
      messages: [
        {
          role: "system",
          content:
            "あなたは地域おこし協力隊の月次報告を作成する支援 AI。活動ログの事実だけを使い創作しない。" +
            "5 章構成(## 活動サマリ / ## 個別活動の詳細 / ## 成果物 / ## 来月計画 / ## 所感・課題)。" +
            "住民個人を特定する情報は含めない。自治体提出文書として通用する敬体で 800〜1200 字。",
        },
        { role: "user", content: `対象月: ${ym}\n活動ログ:\n${logText}` },
      ],
    });
  } catch (e) {
    return bad(`AI 呼び出し失敗(${provider.name}): ${(e as Error).message}`, 502);
  }

  return ok({ markdown, provider: provider.name, model: provider.model, logCount: logs.length });
}
