import { ok, readJson } from "@/lib/api/http";
import { all, run, genId } from "@/lib/db";
import { mapNotice } from "@/lib/api/mappers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MUNI = "muni_shinonsen";

// 既読数を集計して返す。kind フィルタ(rule/qa)に対応。
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const muni = sp.get("muni") ?? MUNI;
  const kinds = sp.get("kinds"); // 例: "rule,qa"
  let sql =
    `SELECT a.*, (SELECT COUNT(*) FROM announcement_reads r WHERE r.announcement_id=a.id) AS read_count
     FROM announcements a WHERE a.municipality_id=?`;
  const args: unknown[] = [muni];
  if (kinds) {
    const list = kinds.split(",").map((k) => k.trim());
    sql += ` AND a.kind IN (${list.map(() => "?").join(",")})`;
    args.push(...list);
  }
  sql += " ORDER BY a.is_pinned DESC, a.sent_at DESC";
  const rows = all(sql, args);
  return ok(rows.map(mapNotice));
}

type CreateBody = {
  senderId?: string;
  senderName?: string;
  kind?: "info" | "rule" | "qa";
  isPinned?: boolean;
  title?: string;
  body: string;
  targets?: number;
};

export async function POST(req: Request) {
  const b = await readJson<CreateBody>(req);
  const id = genId("an");
  const title = (b.title || b.body.slice(0, 24) || "(無題)").trim();
  run(
    `INSERT INTO announcements (id,municipality_id,sender_id,sender_name,kind,is_pinned,title,body,target_count,sent_at)
     VALUES (?,?,?,?,?,?,?,?,?,datetime('now'))`,
    [
      id,
      MUNI,
      b.senderId ?? "s1",
      b.senderName ?? "谷本 拓海",
      b.kind ?? "info",
      b.isPinned ? 1 : 0,
      title,
      b.body,
      b.targets ?? 0,
    ]
  );
  const row = all(
    `SELECT a.*, 0 AS read_count FROM announcements a WHERE a.id=?`,
    [id]
  )[0];
  return ok(mapNotice(row), 201);
}
