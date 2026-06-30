import { ok, bad } from "@/lib/api/http";
import { getStorageProvider } from "@/lib/storage";
import { requireSession } from "@/lib/api/auth";
import { genId } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB

/** POST /api/files — multipart の file を保存し { key, url } を返す(領収書アップロード等) */
export async function POST(req: Request) {
  const sess = await requireSession();
  if (sess instanceof Response) return sess;

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return bad("file が必要です");
  if (file.size === 0) return bad("空のファイルです");
  if (file.size > MAX_BYTES) return bad("ファイルが大きすぎます(上限 8MB)");

  const prefix = (form.get("prefix")?.toString() || "receipts").replace(/[^a-z0-9_-]/gi, "");
  const ext = (file.name.split(".").pop() || "bin").replace(/[^a-z0-9]/gi, "").slice(0, 8);
  const key = `${prefix}/${genId("f")}.${ext}`;

  const bytes = new Uint8Array(await file.arrayBuffer());
  const storage = getStorageProvider();
  await storage.put(key, bytes, file.type || "application/octet-stream");
  const url = await storage.getSignedDownloadUrl(key);

  return ok({ key, url }, 201);
}
