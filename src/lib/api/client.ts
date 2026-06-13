"use client";

// ブラウザ用 API クライアント。trailingSlash: true に合わせて末尾スラッシュで叩く
// (308 リダイレクトの往復を避ける)。

function url(path: string): string {
  // "/api/x" + 任意クエリ → "/api/x/?q" に正規化
  const [p, q] = path.split("?");
  const withSlash = p.endsWith("/") ? p : `${p}/`;
  return q ? `${withSlash}?${q}` : withSlash;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(url(path), { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

async function send<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(url(path), {
    method,
    headers: { "content-type": "application/json", accept: "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    let msg = `${method} ${path} → ${res.status}`;
    try {
      const j = (await res.json()) as { error?: string };
      if (j.error) msg = j.error;
    } catch {
      /* noop */
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export const apiPost = <T>(path: string, body?: unknown) => send<T>("POST", path, body);
export const apiPatch = <T>(path: string, body?: unknown) => send<T>("PATCH", path, body);
export const apiPut = <T>(path: string, body?: unknown) => send<T>("PUT", path, body);
export const apiDelete = <T>(path: string) => send<T>("DELETE", path);
