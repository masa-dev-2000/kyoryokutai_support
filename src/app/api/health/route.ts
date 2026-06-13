import { getAIProvider } from "@/lib/ai";
import { ok } from "@/lib/api/http";
import { get } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const users = (get<{ c: number }>("SELECT COUNT(*) c FROM users")?.c) ?? 0;
  const provider = getAIProvider();
  const ai = await provider.health().catch((e) => ({ ok: false, detail: (e as Error).message }));
  return ok({
    ok: true,
    db: { users },
    ai: { provider: provider.name, model: provider.model, ...ai },
  });
}
