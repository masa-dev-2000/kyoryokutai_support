import { getAIProvider } from "@/lib/ai";
import { ok, bad, readJson } from "@/lib/api/http";
import { requireSession } from "@/lib/api/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { current?: string };

// 音声/テキストの活動メモに対し、記録の質を上げる「次の一問」を返す(AI 質問補完)。
// 整理案ではなく短い質問 1 つだけを返すのがポイント(現場で素早く答えられる)。
export async function POST(req: Request) {
  const sess = await requireSession();
  if (sess instanceof Response) return sess;
  const { current = "" } = await readJson<Body>(req);

  const provider = getAIProvider();
  let question: string;
  try {
    question = await provider.generate({
      task: "consult-daily-write",
      temperature: 0.5,
      maxTokens: 120,
      messages: [
        {
          role: "system",
          content:
            "あなたは地域おこし協力隊員の活動記録を深掘りする支援 AI。" +
            "メモを読み、記録として最も足りない情報を補うための質問を 1 つだけ、" +
            "30 文字以内の口語で返す。前置き・記号・複数質問は禁止。質問文だけを返す。",
        },
        { role: "user", content: current.trim() || "(まだメモが空です)" },
      ],
    });
  } catch (e) {
    return bad(`AI 呼び出し失敗(${provider.name}): ${(e as Error).message}`, 502);
  }

  return ok({ question: question.trim().replace(/^[「『]|[」』]$/g, ""), provider: provider.name });
}
