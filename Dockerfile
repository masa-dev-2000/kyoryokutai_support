# 載せ替え 10 か条 #8: Vercel → AWS App Runner / ECS への移植を Docker push だけで済ませる。
# Next.js standalone 出力(next.config.mjs の output: "standalone")を使う。

FROM node:22-slim AS base
WORKDIR /app

# ---- 依存インストール ----
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ---- ビルド ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- 実行(standalone)----
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# node:sqlite は Node 22 内蔵。DB は本番では Supabase/RDS に向くため .data は使わない想定。
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
