import { ok, bad, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { requireSession } from "@/lib/api/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_USER = process.env.NEXT_PUBLIC_DEMO_MEMBER_ID ?? "a1000000-0000-4000-8000-000000000001";

export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get("userId") ?? DEFAULT_USER;
  return ok(await getRepos().activityLogs.listByUser(userId));
}

type CreateBody = {
  userId?: string;
  dailyLogId?: string;
  type: string;
  topic: string;
  hours: number;
  body: string;
  date?: string;
  time?: string;
};

export async function POST(req: Request) {
  const sess = await requireSession();
  if (sess instanceof Response) return sess;
  const b = await readJson<CreateBody>(req);
  if (!b.type || !b.topic || !(b.hours > 0)) return bad("type / topic / hours は必須です");
  const userId = b.userId ?? DEFAULT_USER;
  const repos = getRepos();
  const created = await repos.activityLogs.create({
    userId,
    dailyLogId: b.dailyLogId,
    type: b.type,
    topic: b.topic,
    hours: b.hours,
    body: b.body,
    date: b.date,
    time: b.time,
  });
  return ok(created, 201);
}
