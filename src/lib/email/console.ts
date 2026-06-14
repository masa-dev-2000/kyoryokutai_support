import type { EmailProvider, EmailMessage } from "./types";

// 開発 / デモ用。実送信せずサーバログに出力する(外部依存なし)。
export class ConsoleEmailProvider implements EmailProvider {
  readonly name = "console";

  async send(msg: EmailMessage): Promise<{ id: string }> {
    const id = `console_${Date.now()}`;
    // eslint-disable-next-line no-console
    console.log("[email:console]", {
      id,
      to: msg.to,
      subject: msg.subject,
      preview: (msg.text ?? msg.html ?? "").slice(0, 120),
    });
    return { id };
  }

  async health(): Promise<{ ok: boolean; detail: string }> {
    return { ok: true, detail: "console email(実送信なし)" };
  }
}
