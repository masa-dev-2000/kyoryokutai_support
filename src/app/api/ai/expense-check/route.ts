import { getAIProvider } from "@/lib/ai";
import { ok, bad, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { title?: string; amount?: number; purpose?: string; municipalityId?: string };

export async function POST(req: Request) {
  const { title = "", amount, purpose = "", municipalityId = process.env.NEXT_PUBLIC_DEMO_MUNI_ID ?? "10000000-0000-4000-8000-000000000001" } = await readJson<Body>(req);
  if (!purpose.trim()) return bad("purpose が必要です");

  // 簡易 RAG: 自治体ガイドラインを文脈に渡す(Year 2 で pgvector 化)
  const guidelines = await getRepos().guidelines.listByMuni(municipalityId);
  const glText = guidelines.map((g) => `【${g.section}】${g.body}(出典: ${g.source})`).join("\n");

  const provider = getAIProvider();
  let raw: string;
  try {
    raw = await provider.generate({
      task: "expense-check",
      temperature: 0.3,
      maxTokens: 600,
      json: true,
      messages: [
        {
          role: "system",
          content:
            "あなたは協力隊の経費が活動費の趣旨に沿うかの『判定材料』を整理する AI。可否は決めず視点と引用のみ。" +
            'JSON のみで返す: {"aiNote": string, "citations": [{"source": string, "quote": string}]}。' +
            "ガイドラインから関連する条文を引用に含める。",
        },
        {
          role: "user",
          content: `申請:\nタイトル: ${title}\n金額: ¥${amount ?? "?"}\n用途: ${purpose}\n\nガイドライン:\n${glText}`,
        },
      ],
    });
  } catch (e) {
    return bad(`AI 呼び出し失敗(${provider.name}): ${(e as Error).message}`, 502);
  }

  let parsed: { aiNote: string; citations: { source: string; quote: string }[] };
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = { aiNote: raw.slice(0, 400), citations: guidelines.slice(0, 1).map((g) => ({ source: g.source as string, quote: g.body as string })) };
  }
  return ok({ ...parsed, provider: provider.name });
}
