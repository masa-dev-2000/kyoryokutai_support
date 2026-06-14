import type { StorageProvider } from "./types";
import { S3StorageProvider } from "./s3";
import { LocalStorageProvider } from "./local";

export type { StorageProvider } from "./types";

// STORAGE_PROVIDER で差し替え(載せ替え 10 か条 #4)。
//   local(既定)        = 開発 / デモ(FS、外部依存なし)
//   r2 / s3 / supabase  = S3 互換(endpoint で切替、本番 ADR-018 は r2)
export function getStorageProvider(): StorageProvider {
  const kind = (process.env.STORAGE_PROVIDER ?? "local").toLowerCase();
  switch (kind) {
    case "r2":
    case "s3":
    case "supabase":
      return new S3StorageProvider();
    case "local":
    default:
      return new LocalStorageProvider();
  }
}
