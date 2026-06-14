import { getAIProvider } from "@/lib/ai";
import { getAuthProvider } from "@/lib/auth";
import { getStorageProvider } from "@/lib/storage";
import { getEmailProvider } from "@/lib/email";
import { ok } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 全プロバイダ抽象の疎通確認(載せ替え 10 か条の動作保証 / T-28)。
export async function GET() {
  const users = await getRepos().users.count();

  const ai = getAIProvider();
  const auth = getAuthProvider();
  const storage = getStorageProvider();
  const email = getEmailProvider();

  const safe = async (p: { name: string; health: () => Promise<{ ok: boolean; detail: string }> }) => {
    try {
      const h = await p.health();
      return { provider: p.name, ...h };
    } catch (e) {
      return { provider: p.name, ok: false, detail: (e as Error).message };
    }
  };

  const [aiH, authH, storageH, emailH] = await Promise.all([safe(ai), safe(auth), safe(storage), safe(email)]);

  return ok({
    ok: true,
    db: { users },
    ai: { model: ai.model, ...aiH },
    auth: authH,
    storage: storageH,
    email: emailH,
  });
}
