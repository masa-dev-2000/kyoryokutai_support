import { getAIProvider } from "@/lib/ai";
import { ok, bad, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { requireSession } from "@/lib/api/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { ym?: string };

// 自治体の担当隊員全員の当月活動ログを束ね、AI で「自治体 月次活動報告」を 1 回で生成する。
// per-member の /api/ai/monthly-report と対になる、役場側の集約版(役場の議会向け下書き等を想定)。
export async function POST(req: Request) {
  const sess = await requireSession();
  if (sess instanceof Response) return sess;
  const { ym } = await readJson<Body>(req);
  if (!ym) return bad("ym(YYYY-MM)が必要です");

  const repos = getRepos();
  const members = await repos.members.list();

  // 隊員ごとに当月ログを集約(ログのある隊員のみ)
  const sections: string[] = [];
  let logCount = 0;
  for (const m of members) {
    const logs = await repos.activityLogs.listForAI(m.id, ym);
    if (logs.length === 0) continue;
    logCount += logs.length;
    const text = logs
      .map(
        (l) =>
          `  - ${l.log_date} [${l.activity_type}/${l.topic}] ${l.hours}h ${l.body}${
            l.expense_amount ? ` (経費¥${l.expense_amount})` : ""
          }`
      )
      .join("\n");
    sections.push(`### ${m.name}(${m.role})\n${text}`);
  }

  if (sections.length === 0) return bad("対象月の活動記録がありません", 404);

  const provider = getAIProvider();
  let markdown: string;
  try {
    markdown = await provider.generate({
      task: "monthly-report",
      temperature: 0.4,
      maxTokens: 2500,
      messages: [
        {
          role: "system",
          content:
            "あなたは地域おこし協力隊を所管する自治体担当者向けに、当月の活動を束ねた『自治体 月次活動報告』を作成する支援 AI。" +
            "各隊員の活動ログの事実だけを使い、創作しない。" +
            "構成は ## 全体総括 / ## 隊員別の活動(隊員ごとに小見出し + 要点) / ## 来月に向けて の 3 章。" +
            "住民個人を特定する情報は含めない。自治体の対外文書として通用する敬体で記述する。",
        },
        { role: "user", content: `対象月: ${ym}\n\n${sections.join("\n\n")}` },
      ],
    });
  } catch (e) {
    return bad(`AI 呼び出し失敗(${provider.name}): ${(e as Error).message}`, 502);
  }

  return ok({ markdown, provider: provider.name, model: provider.model, memberCount: sections.length, logCount });
}
