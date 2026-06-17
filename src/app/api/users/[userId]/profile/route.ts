import { ok, bad } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const profile = await getRepos().users.getProfile(userId);
  if (!profile) return bad("not found", 404);
  return ok(profile);
}
