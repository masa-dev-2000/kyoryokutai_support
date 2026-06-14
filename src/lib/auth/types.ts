// 認証抽象(載せ替え 10 か条 #1)── Phase 2 載せ替えの最大の地雷を吸収する層。
// Supabase Auth → Cognito 移行を「新ファイル 1 つ追加」で済ませる(ADR-018 / docs/24 §15.3)。

export type AuthUser = { userId: string; email: string };

export interface AuthProvider {
  readonly name: string;
  /** Magic Link を送信(メール送信は内部で email 抽象 or プロバイダ標準を使う)。 */
  sendMagicLink(email: string, redirectTo: string): Promise<void>;
  /** JWT を検証してユーザーを返す。無効なら null。 */
  verifySession(jwt: string): Promise<AuthUser | null>;
  /** 現在のリクエストのユーザー(cookie 経由)。サーバ専用。 */
  getCurrentUser(): Promise<AuthUser | null>;
  signOut(): Promise<void>;
  health(): Promise<{ ok: boolean; detail: string }>;
}
