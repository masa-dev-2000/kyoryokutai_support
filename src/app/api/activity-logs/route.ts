import { ok, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get("userId") ?? "m1";
  return ok(await getRepos().activityLogs.listByUser(userId));
}

type CreateBody = {
  userId?: string;
  type: string;
  topic: string;
  hours: number;
  distanceKm?: number;
  body: string;
  date?: string;
  time?: string;
  expense?: number;
};

export async function POST(req: Request) {
  const b = await readJson<CreateBody>(req);
  const created = await getRepos().activityLogs.create({ ...b, userId: b.userId ?? "m1" });
  return ok(created, 201);
}
