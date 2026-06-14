/** @type {import('next').NextConfig} */

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
  ...(staticExport ? { output: "export" } : {}),
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  images: { unoptimized: true },
  trailingSlash: true,
  // node:sqlite を使う Route Handler をバンドル対象から外す
  serverExternalPackages: ["node:sqlite"],
};

export default nextConfig;
