import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { SCHEMA_SQL } from "./schema";
import { seed } from "./seed";

// SQLite 接続シングルトン(node:sqlite / Node 22 内蔵)。
// Next dev のホットリロードで再オープンしないよう globalThis にキャッシュ。

type DB = DatabaseSync;

const g = globalThis as unknown as { __appDb?: DB };

function open(): DB {
  const path = process.env.DATABASE_PATH ?? ".data/app.db";
  const abs = resolve(process.cwd(), path);
  mkdirSync(dirname(abs), { recursive: true });
  const db = new DatabaseSync(abs);
  db.exec(SCHEMA_SQL);
  // 既存 DB への後方互換マイグレーション(列が既にあれば例外を握り潰す)
  for (const sql of [
    "ALTER TABLE expenses ADD COLUMN receipt_key TEXT",
    "ALTER TABLE municipalities ADD COLUMN settings TEXT NOT NULL DEFAULT '{}'",
  ]) {
    try { db.exec(sql); } catch { /* 既に存在 */ }
  }
  // users が空なら初期データ投入
  const row = db.prepare("SELECT COUNT(*) AS c FROM users").get() as { c: number };
  if (row.c === 0) seed(db);
  return db;
}

export function getDb(): DB {
  if (!g.__appDb) g.__appDb = open();
  return g.__appDb;
}

// 便利ヘルパ
export function all<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T[] {
  return getDb().prepare(sql).all(...(params as never[])) as T[];
}
export function get<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T | undefined {
  return getDb().prepare(sql).get(...(params as never[])) as T | undefined;
}
export function run(sql: string, params: unknown[] = []): void {
  getDb().prepare(sql).run(...(params as never[]));
}
export function genId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
