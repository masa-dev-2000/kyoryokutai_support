import { getAIProvider } from "@/lib/ai";
import type { AIMessage } from "@/lib/ai";
import { ok, bad, readJson } from "@/lib/api/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 任期ビジョンの壁打ち。情報不足・やりたいこと不明確を、対話で言語化する支援。
const SYSTEM =
  "あなたは地域おこし協力隊員の『任期で成し遂げたいこと(ビジョン)』を一緒に言語化するコーチ AI。" +
  "判定や評価はしない。短く、やさしく、1〜2 個の問いで掘り下げる。" +
  "やりたいことが曖昧な相手でも答えられるよう、選択肢や具体例を添える。" +
  "十分に固まったら『任期ビジョン案: …』の 1 文を提案する。";

type Body = { messages?: AIMessage[] };

export async function POST(req: Request) {
  const b = await readJson<Body>(req);
  const history = (b.messages ?? []).filter((m) => m.role === "user" || m.role === "assistant");

  const convo: AIMessage[] = history.length
    ? history
    : [{ role: "user", content: "(まだ何も書いていません。何から考えればいい?)" }];

  const provider = getAIProvider();
  try {
    const reply = await provider.generate({
      task: "vision-coach",
      temperature: 0.6,
      maxTokens: 600,
      messages: [{ role: "system", content: SYSTEM }, ...convo],
    });
    return ok({ reply, provider: provider.name, model: provider.model });
  } catch (e) {
    return bad(`AI 呼び出し失敗(${provider.name}): ${(e as Error).message}`, 502);
  }
}
