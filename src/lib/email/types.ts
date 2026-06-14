// メール送信抽象(載せ替え 10 か条 #5)。
// nodemailer SMTP インタフェース経由で AWS SES SMTP / Supabase SMTP / 任意 SMTP を吸収。

export type EmailMessage = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
};

export interface EmailProvider {
  readonly name: string;
  send(msg: EmailMessage): Promise<{ id: string }>;
  health(): Promise<{ ok: boolean; detail: string }>;
}
