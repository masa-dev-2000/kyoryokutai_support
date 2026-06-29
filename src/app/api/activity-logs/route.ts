import { ok, bad, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { requireAppUser } from "@/lib/api/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const sess = await requireAppUser();
  if (sess instanceof Response) return sess;
  return ok(await getRepos().activityLogs.listByUser(sess.userId));
}

type CreateBody = {
  dailyLogId?: string;
  type: string;
  topic: string;
  hours: number;
  body: string;
  date?: string;
  time?: string;
};

export async function POST(req: Request) {
  const sess = await requireAppUser();
  if (sess instanceof Response) return sess;
  const b = await readJson<CreateBody>(req);
  if (!b.type || !b.topic || !(b.hours > 0)) return bad("type / topic / hours は必須です");
  const userId = sess.userId;
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
