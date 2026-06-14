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
  userId?: string;
};

async function revertMonthlyReport(repos: ReturnType<typeof getRepos>, userId: string, date: string) {
  const ym = date.slice(0, 7); // YYYY-MM
  await repos.monthlyReports.revertToSubmitted(userId, ym);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await readJson<PatchBody>(req);
  const repos = getRepos();
  const updated = await repos.activityLogs.update(id, b);
  if (!updated) return bad("Not found", 404);
  // 同月に承認済み月報があれば「提出済」に差し戻す(ADR 設計)
  await revertMonthlyReport(repos, b.userId ?? "m1", updated.date);
  return ok(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = new URL(req.url).searchParams.get("userId") ?? "m1";
  const repos = getRepos();
  // 削除前に date を取得して差し戻し判定
  const logs = await repos.activityLogs.listByUser(userId);
  const target = logs.find((l) => l.id === id);
  await repos.activityLogs.delete(id);
  if (target) await revertMonthlyReport(repos, userId, target.date);
  return ok(null);
}
