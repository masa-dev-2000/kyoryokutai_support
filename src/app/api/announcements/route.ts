import { ok, bad, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { requireAppUser } from "@/lib/api/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ローカル sqlite のフォールバックは seed/sqlite の自治体 id("muni_shinonsen")に合わせる。
// 以前は UUID 既定で、env 未設定のローカル開発だとお知らせが seed と別自治体になり空表示だった(H5)。
// 本番(Supabase)は NEXT_PUBLIC_DEMO_MUNI_ID を設定するためこの既定は使われない。
const MUNI = process.env.NEXT_PUBLIC_DEMO_MUNI_ID ?? "muni_shinonsen";

// お知らせ閲覧はログイン必須(隊員も自町のお知らせを読む)。未認証アクセスを遮断。
export async function GET(req: Request) {
  const sess = await requireAppUser();
  if (sess instanceof Response) return sess;
  const sp = new URL(req.url).searchParams;
  const muni = sp.get("muni") ?? MUNI;
  const kinds = sp.get("kinds")?.split(",").map((k) => k.trim()).filter(Boolean);
  return ok(await getRepos().announcements.list(muni, kinds));
}

// senderId/senderName は受け付けない(なりすまし防止・サーバ側でセッションから確定)
type CreateBody = {
  kind?: "info" | "rule" | "qa";
  isPinned?: boolean;
  title?: string;
  body: string;
  targets?: number;
};

export async function POST(req: Request) {
  const sess = await requireAppUser();
  if (sess instanceof Response) return sess;
  // 一斉配信は役場職員(manager/admin)のみ。隊員が役場名義で送るのを遮断。
  if (sess.role !== "manager" && sess.role !== "admin") return bad("お知らせの配信権限がありません", 403);
  const b = await readJson<CreateBody>(req);
  if (!b.body?.trim()) return bad("本文が必要です");
  const repos = getRepos();
  const senderName = (await repos.users.nameOf(sess.userId)) ?? "役場";
  return ok(
    await repos.announcements.create({
      senderId: sess.userId,
      senderName,
      kind: b.kind,
      isPinned: b.isPinned,
      title: b.title,
      body: b.body,
      targets: b.targets,
    }),
    201
  );
}
