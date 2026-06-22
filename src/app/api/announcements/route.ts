import { ok, readJson } from "@/lib/api/http";
import { getRepos } from "@/lib/db/repositories";
import { requireSession } from "@/lib/api/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MUNI = process.env.NEXT_PUBLIC_DEMO_MUNI_ID ?? "10000000-0000-4000-8000-000000000001";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const muni = sp.get("muni") ?? MUNI;
  const kinds = sp.get("kinds")?.split(",").map((k) => k.trim()).filter(Boolean);
  return ok(await getRepos().announcements.list(muni, kinds));
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
  const sess = await requireSession();
  if (sess instanceof Response) return sess;
  const b = await readJson<CreateBody>(req);
  return ok(await getRepos().announcements.create(b), 201);
}
