import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import type { StorageProvider } from "./types";

// ローカル開発 / Vercel デモ用のファイルシステムストレージ。
// 外部認証不要。署名 URL は /api/files 経由の擬似 URL を返す(本番では S3 に切替)。
// 注意: Vercel serverless では揮発するため恒久保管には使えない(デモ用途のみ)。

const ROOT = resolve(process.cwd(), process.env.LOCAL_STORAGE_DIR ?? ".data/storage");

export class LocalStorageProvider implements StorageProvider {
  readonly name = "local";

  async put(key: string, body: Uint8Array | Buffer): Promise<void> {
    const path = resolve(ROOT, key);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, body);
  }

  async getSignedDownloadUrl(key: string): Promise<string> {
    return `/api/files/${encodeURIComponent(key)}`;
  }

  async getSignedUploadUrl(key: string): Promise<string> {
    return `/api/files/${encodeURIComponent(key)}`;
  }

  async delete(key: string): Promise<void> {
    const path = resolve(ROOT, key);
    if (existsSync(path)) rmSync(path);
  }

  async health(): Promise<{ ok: boolean; detail: string }> {
    return { ok: true, detail: `local storage @ ${ROOT}` };
  }
}
