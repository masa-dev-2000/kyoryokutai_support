import { ok, bad, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PatchBody = {
  type?: string;
  topic?: string;
  hours?: number;
  distanceKm?: number | null;
  body?: string;
  date?: string;
  time?: string;
};

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await readJson<PatchBody>(req);
  const updated = await getRepos().activityLogs.update(id, b);
  if (!updated) return bad("Not found", 404);
  return ok(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await getRepos().activityLogs.delete(id);
  return ok(null);
}
