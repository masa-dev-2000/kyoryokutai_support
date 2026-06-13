/** @type {import('next').NextConfig} */

// BUILD_STATIC=1 のときだけ静的エクスポート(GitHub Pages 用、バックエンドなし)。
// 既定はサーバモード(API Routes + SQLite を動かすローカル/本番用)。
const staticExport = process.env.BUILD_STATIC === "1";
const basePath = staticExport ? "/kyoryokutai_support" : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  ...(staticExport ? { output: "export" } : {}),
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  trailingSlash: true,
  // node:sqlite を使う Route Handler をバンドル対象から外す
  serverExternalPackages: ["node:sqlite"],
};

export default nextConfig;
