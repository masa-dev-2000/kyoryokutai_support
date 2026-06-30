import { getStorageProvider } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/files/<key...> — local ストレージのファイルを配信(署名 URL がこのパスを指す)。
// s3/r2 では署名 URL が外部を指すため通常ここは経由しない。
export async function GET(_req: Request, ctx: { params: Promise<{ key: string[] }> }) {
  const { key } = await ctx.params;
  const storageKey = key.map((k) => decodeURIComponent(k)).join("/");
  const bytes = await getStorageProvider().getBytes(storageKey);
  if (!bytes) return new Response("Not Found", { status: 404 });

  const ext = storageKey.split(".").pop()?.toLowerCase() ?? "";
  const ctype =
    ext === "png" ? "image/png" :
    ext === "jpg" || ext === "jpeg" ? "image/jpeg" :
    ext === "webp" ? "image/webp" :
    ext === "gif" ? "image/gif" :
    ext === "pdf" ? "application/pdf" :
    "application/octet-stream";

  return new Response(Buffer.from(bytes), {
    headers: { "Content-Type": ctype, "Cache-Control": "private, max-age=3600" },
  });
}
