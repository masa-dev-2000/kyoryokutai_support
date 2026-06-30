import { rmSync } from "node:fs";

// 各テスト実行の前にテスト専用 sqlite を破棄し、毎回まっさらなシード状態から始める。
// getDb() は users が空のとき seed() を投入するため、削除→初回アクセスで再シードされる。
for (const suffix of ["", "-shm", "-wal"]) {
  try {
    rmSync(`.data/test-vitest.db${suffix}`, { force: true });
  } catch {
    /* 存在しなければ無視 */
  }
}
