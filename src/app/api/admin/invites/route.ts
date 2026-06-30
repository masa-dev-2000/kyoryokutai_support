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
  const cleanEmail = email?.trim();
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
  } catch {
    return bad("DB error", 500);
  }

  const url = `${new URL(req.url).origin}/signup?token=${token}`;
  return ok({ token, url, expiresAt });
}
