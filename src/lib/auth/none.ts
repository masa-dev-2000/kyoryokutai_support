import type { AuthProvider, AuthUser } from "./types";

// 認証なし(開発 / Vercel デモ)。固定ユーザーを返す。
// 現行モックの MEMBER_ID="m1" 相当の挙動を抽象に載せたもの。
const DEMO_USER: AuthUser = {
  userId: process.env.DEMO_USER_ID ?? "m1",
  email: process.env.DEMO_USER_EMAIL ?? "demo@member.example.jp",
};

export class NoneAuthProvider implements AuthProvider {
  readonly name = "none";
  async sendMagicLink(): Promise<void> {
    /* デモではログイン不要 */
  }
  async verifySession(): Promise<AuthUser | null> {
    return DEMO_USER;
  }
  async getCurrentUser(): Promise<AuthUser | null> {
    return DEMO_USER;
  }
  async signOut(): Promise<void> {
    /* noop */
  }
  async health(): Promise<{ ok: boolean; detail: string }> {
    return { ok: true, detail: `none(デモ固定ユーザー ${DEMO_USER.userId})` };
  }
}
