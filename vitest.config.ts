import { defineConfig, configDefaults } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// ユニットテスト基盤。
// - sqlite(node:sqlite) + シードに対してリポジトリ/ロジック層を検証する。
// - AUTH_PROVIDER=none で固定の開発ユーザーになりすませるため実アカウント不要。
// - 各ロールは DEV_USER_ROLE を切り替えて自分のドメインを検証する。
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    env: {
      AUTH_PROVIDER: "none",
      DB_PROVIDER: "sqlite",
      // .data 配下はリポジトリ管理外(.gitignore)。テスト専用DBを使う。
      DATABASE_PATH: ".data/test-vitest.db",
    },
    // node:sqlite 等の重い初期化を考慮し直列実行(共有DBファイルの競合回避)。
    fileParallelism: false,
    // .claude/worktrees 配下は他セッションの作業ツリー。リポジトリ内に存在するため
    // 既定の glob が拾ってしまう → 除外する。e2e(別ツール)も対象外にする。
    exclude: [...configDefaults.exclude, ".claude/worktrees/**", "**/e2e/**"],
  },
});
