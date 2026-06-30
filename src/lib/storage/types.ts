// ストレージ抽象(載せ替え 10 か条 #4)。
// R2 / AWS S3 / Supabase Storage はすべて S3 互換 API なので、
// 単一の S3Provider を endpoint 差し替えで共通化できる。

export interface StorageProvider {
  readonly name: string;
  /** バイト列を保存。content-type 任意。 */
  put(key: string, body: Uint8Array | Buffer, contentType?: string): Promise<void>;
  /** バイト列を取得(/api/files 経由の配信用)。存在しなければ null。 */
  getBytes(key: string): Promise<Uint8Array | null>;
  /** 読み取り用の署名付き URL(既定 1 時間)。 */
  getSignedDownloadUrl(key: string, expiresSec?: number): Promise<string>;
  /** アップロード用の署名付き URL(クライアント直アップロード用)。 */
  getSignedUploadUrl(key: string, contentType: string, expiresSec?: number): Promise<string>;
  delete(key: string): Promise<void>;
  health(): Promise<{ ok: boolean; detail: string }>;
}
