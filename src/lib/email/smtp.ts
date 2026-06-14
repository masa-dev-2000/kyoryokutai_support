import nodemailer, { type Transporter } from "nodemailer";
import type { EmailProvider, EmailMessage } from "./types";

// SMTP 経由メール送信。AWS SES SMTP / Supabase SMTP / 任意 SMTP に対応。
//   SMTP_HOST=email-smtp.ap-northeast-1.amazonaws.com(SES Tokyo)
//   SMTP_PORT=587 / SMTP_USER / SMTP_PASS
//   SMTP_FROM=noreply@kyoryokutai.example.jp

const HOST = process.env.SMTP_HOST;
const PORT = Number(process.env.SMTP_PORT ?? 587);
const USER = process.env.SMTP_USER;
const PASS = process.env.SMTP_PASS;
const FROM = process.env.SMTP_FROM ?? process.env.SES_FROM_EMAIL ?? "noreply@example.jp";
const REPLY_TO = process.env.SES_REPLY_TO;

let _tx: Transporter | null = null;
function transporter(): Transporter {
  if (!_tx) {
    _tx = nodemailer.createTransport({
      host: HOST,
      port: PORT,
      secure: PORT === 465,
      auth: USER && PASS ? { user: USER, pass: PASS } : undefined,
    });
  }
  return _tx;
}

export class SmtpEmailProvider implements EmailProvider {
  readonly name = "smtp";

  async send(msg: EmailMessage): Promise<{ id: string }> {
    const info = await transporter().sendMail({
      from: FROM,
      to: Array.isArray(msg.to) ? msg.to.join(",") : msg.to,
      subject: msg.subject,
      text: msg.text,
      html: msg.html,
      replyTo: msg.replyTo ?? REPLY_TO,
    });
    return { id: info.messageId };
  }

  async health(): Promise<{ ok: boolean; detail: string }> {
    if (!HOST) return { ok: false, detail: "SMTP_HOST 未設定" };
    try {
      await transporter().verify();
      return { ok: true, detail: `SMTP OK / host=${HOST}:${PORT} / from=${FROM}` };
    } catch (e) {
      return { ok: false, detail: `SMTP 失敗 / ${HOST}:${PORT}: ${(e as Error).message}` };
    }
  }
}
