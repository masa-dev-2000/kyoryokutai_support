/** @type {import('next').NextConfig} */
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// BUILD_STATIC=1 のときだけ静的エクスポート(古い GitHub Pages 互換、バックエンドなし)。
// 既定はサーバモード(API Routes + SQLite を動かすローカル/Vercel 用)。
// basePath は不要(Vercel / Cloudflare Pages はルートからサーブ)。
const staticExport = process.env.BUILD_STATIC === "1";
// 旧 GitHub Pages 互換が必要な場合のみ PAGES_BASE_PATH を設定
const basePath = process.env.PAGES_BASE_PATH ?? "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  // 静的=export、それ以外=standalone(Docker / App Runner 移植可能、ADR-018 / 載せ替え #8)
  output: staticExport ? "export" : "standalone",
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  images: { unoptimized: true },
  trailingSlash: true,
  turbopack: { root: __dirname },
  // node:sqlite を使う Route Handler をバンドル対象から外す
  serverExternalPackages: ["node:sqlite"],
};

export default nextConfig;
