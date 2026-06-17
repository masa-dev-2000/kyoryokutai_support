"use client";

import React from "react";
import { createSupabaseClient } from "@/lib/auth/client";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Mail, Lock, User, Building2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

function SignupForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const next = searchParams.get("next") ?? "/v5/member";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [municipality, setMunicipality] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = React.useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password || !name.trim() || !municipality.trim()) return;
    setStatus("loading");

    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { name: name.trim(), municipality: municipality.trim() },
        emailRedirectTo: `${location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
      return;
    }

    // メール確認不要の場合はそのまま遷移
    if (data.session) {
      router.push(next as Parameters<typeof router.push>[0]);
      router.refresh();
    } else {
      setStatus("done");
    }
  }

  if (status === "done") {
    return (
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          <p className="text-[14px] font-semibold text-slate-800">確認メールを送信しました</p>
          <p className="text-[12px] text-slate-500">
            <span className="font-medium text-slate-700">{email}</span> に届いたリンクをタップして登録を完了してください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">新規登録</h1>
        <p className="mt-1.5 text-[12px] text-slate-500">地域おこし協力隊サポートシステム</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-[12px] font-medium text-slate-700">お名前</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="田中 さくら"
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-[14px] text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="municipality" className="text-[12px] font-medium text-slate-700">配属自治体</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="municipality"
              type="text"
              required
              value={municipality}
              onChange={(e) => setMunicipality(e.target.value)}
              placeholder="兵庫県 新温泉町"
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-[14px] text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-[12px] font-medium text-slate-700">メールアドレス</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-[14px] text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-[12px] font-medium text-slate-700">パスワード(6文字以上)</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-[14px] text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>

        {status === "error" && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-600">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-[14px] font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
        >
          {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
          登録する
        </button>
      </form>

      <p className="mt-6 text-center text-[12px] text-slate-500">
        すでにアカウントをお持ちの方は{" "}
        <Link href={`/v5/login?next=${encodeURIComponent(next)}` as never} className="font-semibold text-slate-900 underline underline-offset-2">
          ログイン
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <React.Suspense fallback={<div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />}>
        <SignupForm />
      </React.Suspense>
    </main>
  );
}
