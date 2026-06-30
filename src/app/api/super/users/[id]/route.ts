import { ok, bad, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { requireSuper } from "@/lib/api/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROLES = ["member", "manager", "admin", "super"];
const STATUSES = ["active", "retired", "suspended"];

type PatchBody = { role?: string; status?: string; municipalityId?: string };

/** PATCH /api/super/users/[id] — role/status/所属自治体の更新(super 専用) */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sess = await requireSuper();
  if (sess instanceof Response) return sess;
  const { id } = await params;
  const b = await readJson<PatchBody>(req);

  if (b.role !== undefined && !ROLES.includes(b.role)) return bad("role の値が不正です", 400);
  if (b.status !== undefined && !STATUSES.includes(b.status)) return bad("status の値が不正です", 400);

  // 事故防止: super 自身の降格 / 無効化をブロック
  if (sess.userId && sess.userId === id) {
    if ((b.role !== undefined && b.role !== "super") || b.status === "suspended") {
      return bad("自分自身は変更できません", 400);
    }
  }

  const updated = await getRepos().super.updateUser(id, b);
  if (!updated) return bad("ユーザーが見つかりません", 404);
  return ok(updated);
}

/** DELETE /api/super/users/[id] — ユーザーを削除(super 専用) */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sess = await requireSuper();
  if (sess instanceof Response) return sess;
  const { id } = await params;

  // 事故防止: super 自身の削除をブロック
  if (sess.userId && sess.userId === id) {
    return bad("自分自身は削除できません", 400);
  }

  await getRepos().super.deleteUser(id);
  // 204(null body)は NextResponse.json / クライアントの res.json() 双方で例外になるため 200+body を返す
  return ok({ ok: true });
}
