import { ok, bad, readJson } from "@/lib/api/http";
import { requireAdmin } from "@/lib/api/auth";
import { getRepos } from "@/lib/db/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CreateBody = {
  email?: string;
  name?: string;
  role?: string;
  municipalityName?: string;
};

// 招待で発行してよいロール。users.role に書き込むため super 等への昇格を防ぐ(#74)。
const INVITABLE_ROLES = ["member", "manager", "admin"];

/** POST /api/admin/invites — 招待トークン発行(招待先 users 行を pre-provision) */
export async function POST(req: Request) {
  const sess = await requireAdmin();
  if (sess instanceof Response) return sess;

  const { email, name, role = "member", municipalityName = "" } = await readJson<CreateBody>(req);
  // Supabase Auth は email を小文字化して保持し、/api/auth/me は完全一致で紐づける。
  // pre-provision する users.email も小文字に正規化しないと大文字を含む招待で 403 が再発する(#74)。
  const cleanEmail = email?.trim().toLowerCase();
  const cleanName = name?.trim();

  // pre-provision には email と氏名が必須(email が無いと /api/auth/me で紐づけられず 403 になる)。
  if (!cleanEmail) return bad("メールアドレスは必須です", 400);
  if (!cleanName) return bad("お名前は必須です", 400);
  if (!INVITABLE_ROLES.includes(role)) return bad("不正なロールです", 400);

  let token: string;
  let expiresAt: string;
  try {
    ({ token, expiresAt } = await getRepos().invites.createProvisioned({
      email: cleanEmail,
      name: cleanName,
      role,
      municipalityName,
      createdBy: sess.userId,
    }));
  } catch (e) {
    // 同じ email が別ロールで登録済み → サイレントに権限を取り違えないよう明示エラー。
    if (e instanceof Error && e.message === "ROLE_CONFLICT") {
      return bad("このメールアドレスは既に別の権限で登録されています", 409);
    }
    return bad("DB error", 500);
  }

  const url = `${new URL(req.url).origin}/signup?token=${token}`;
  return ok({ token, url, expiresAt });
}
