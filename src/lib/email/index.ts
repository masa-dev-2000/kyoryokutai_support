import type { EmailProvider } from "./types";
import { SmtpEmailProvider } from "./smtp";
import { ConsoleEmailProvider } from "./console";

export type { EmailProvider, EmailMessage } from "./types";

// EMAIL_PROVIDER で差し替え(載せ替え 10 か条 #5)。
//   console(既定) = 開発 / デモ(ログ出力のみ)
//   smtp          = 本番(AWS SES SMTP Tokyo、ADR-018)
export function getEmailProvider(): EmailProvider {
  const kind = (process.env.EMAIL_PROVIDER ?? "console").toLowerCase();
  switch (kind) {
    case "smtp":
      return new SmtpEmailProvider();
    case "console":
    default:
      return new ConsoleEmailProvider();
  }
}
