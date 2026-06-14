import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { StorageProvider } from "./types";

// S3 互換ストレージ実装。endpoint で R2 / S3 / Supabase Storage を切り替える。
//   R2:       STORAGE_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
//   AWS S3:   STORAGE_ENDPOINT 未設定(リージョン既定)
//   Supabase: STORAGE_ENDPOINT=https://<ref>.supabase.co/storage/v1/s3

const REGION = process.env.STORAGE_REGION ?? process.env.AWS_REGION ?? "ap-northeast-1";
const ENDPOINT = process.env.STORAGE_ENDPOINT || undefined;
const BUCKET = process.env.STORAGE_BUCKET ?? "kyoryokutai-receipts";
const ACCESS_KEY = process.env.STORAGE_ACCESS_KEY_ID ?? process.env.R2_ACCESS_KEY_ID;
const SECRET_KEY = process.env.STORAGE_SECRET_ACCESS_KEY ?? process.env.R2_SECRET_ACCESS_KEY;

let _client: S3Client | null = null;
function client(): S3Client {
  if (!_client) {
    _client = new S3Client({
      region: REGION,
      ...(ENDPOINT ? { endpoint: ENDPOINT, forcePathStyle: true } : {}),
      ...(ACCESS_KEY && SECRET_KEY
        ? { credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY } }
        : {}),
    });
  }
  return _client;
}

export class S3StorageProvider implements StorageProvider {
  readonly name = ENDPOINT?.includes("r2.cloudflarestorage") ? "r2" : ENDPOINT?.includes("supabase") ? "supabase-s3" : "s3";

  async put(key: string, body: Uint8Array | Buffer, contentType?: string): Promise<void> {
    await client().send(
      new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType })
    );
  }

  async getSignedDownloadUrl(key: string, expiresSec = 3600): Promise<string> {
    return getSignedUrl(client(), new GetObjectCommand({ Bucket: BUCKET, Key: key }), {
      expiresIn: expiresSec,
    });
  }

  async getSignedUploadUrl(key: string, contentType: string, expiresSec = 600): Promise<string> {
    return getSignedUrl(
      client(),
      new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
      { expiresIn: expiresSec }
    );
  }

  async delete(key: string): Promise<void> {
    await client().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  }

  async health(): Promise<{ ok: boolean; detail: string }> {
    if (!ACCESS_KEY || !SECRET_KEY) {
      return { ok: false, detail: "ストレージ認証情報未設定(STORAGE_ACCESS_KEY_ID 等)" };
    }
    try {
      await client().send(new HeadBucketCommand({ Bucket: BUCKET }));
      return { ok: true, detail: `${this.name} OK / bucket=${BUCKET}` };
    } catch (e) {
      return { ok: false, detail: `${this.name} 失敗 / bucket=${BUCKET}: ${(e as Error).message}` };
    }
  }
}
