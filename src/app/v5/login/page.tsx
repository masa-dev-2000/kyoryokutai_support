"use client";

import React from "react";
import { createSupabaseClient } from "@/lib/auth/client";
import { useSearchParams } from "next/navigation";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/v5/member";

  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = React.useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");

    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          ログイン
        </h1>
        <p className="mt-1.5 text-[12px] text-slate-500">
          登録済みのメールアドレスにログインリンクを送ります
        </p>
      </div>

      {status === "sent" ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          <p className="text-[14px] font-semibold text-slate-800">
            メールを送信しました
          </p>
          <p className="text-[12px] text-slate-500">
            <span className="font-medium text-slate-700">{email}</span>{" "}
            に届いたリンクをタップしてください。
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[12px] font-medium text-slate-700">
              メールアドレス
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-[14px] text-slate-900 placeholder-slate-400 outline-none ring-0 transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          {status === "error" && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-600">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-[14px] font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            ログインリンクを送る
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-[11px] text-slate-400">
        地域おこし協力隊サポートシステム
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <React.Suspense fallback={<div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />}>
        <LoginForm />
      </React.Suspense>
    </main>
  );
}
