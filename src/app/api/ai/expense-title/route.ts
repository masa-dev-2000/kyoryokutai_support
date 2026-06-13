import { getAIProvider } from "@/lib/ai";
import { ok, bad, readJson } from "@/lib/api/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { purpose?: string; amount?: number };

export async function POST(req: Request) {
  const { purpose = "", amount } = await readJson<Body>(req);
  if (!purpose.trim()) return bad("purpose が必要です");

  const provider = getAIProvider();
  let title: string;
  try {
    title = await provider.generate({
      task: "expense-title",
      temperature: 0.2,
      maxTokens: 40,
      messages: [
        {
          role: "system",
          content:
            "経費の用途文から 15 文字以内の短いタイトルを 1 つだけ返す。説明や記号は付けず、タイトル文字列のみ。",
        },
        { role: "user", content: `用途: ${purpose}${amount ? `\n金額: ¥${amount}` : ""}` },
      ],
    });
  } catch (e) {
    return bad(`AI 呼び出し失敗(${provider.name}): ${(e as Error).message}`, 502);
  }

  // 余計な引用符・改行を除去し 15 文字に丸める
  title = title.replace(/^["「『]|["」』]$/g, "").split("\n")[0].trim().slice(0, 15);
  return ok({ title, provider: provider.name });
}
