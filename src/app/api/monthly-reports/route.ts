import { ok } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { requireAppUser } from "@/lib/api/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const sess = await requireAppUser();
  if (sess instanceof Response) return sess;
  return ok(await getRepos().monthlyReports.listByUser(sess.userId));
}
