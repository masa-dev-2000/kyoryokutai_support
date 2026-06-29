import { ok, bad, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { requireSuper } from "@/lib/api/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { name?: string; prefecture?: string; annualBudget?: number };

/** POST /api/super/municipalities — 運営者が自治体を新規作成(#65) */
export async function POST(req: Request) {
  const sess = await requireSuper();
  if (sess instanceof Response) return sess;
  const b = await readJson<Body>(req);
  if (!b.name?.trim() || !b.prefecture?.trim()) return bad("name / prefecture は必須です");
  const m = await getRepos().super.createMunicipality({
    name: b.name.trim(),
    prefecture: b.prefecture.trim(),
    annualBudget: b.annualBudget,
  });
  return ok(m, 201);
}
