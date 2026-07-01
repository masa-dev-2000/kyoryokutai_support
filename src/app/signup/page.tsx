"use client";

import React from "react";
import { createSupabaseClient } from "@/lib/auth/client";
import { homePathForRole, safeRelativePath } from "@/lib/auth/role-path";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Mail, Lock, User, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

type InviteInfo = { email: string | null; role: string; municipalityName: string };

function SignupForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const next = safeRelativePath(searchParams.get("next"));

  const [invite, setInvite] = React.useState<InviteInfo | null>(null);
  const [tokenError, setTokenError] = React.useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = React.useState(true);

  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = React.useState("");

  // トークン検証
  React.useEffect(() => {
    if (!token) {
      setTokenError("招待リンクが必要です。管理者に招待を依頼してください。");
      setTokenLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/admin/invites/${token}`);
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          setTokenError((j as { error?: string }).error ?? "招待リンクが無効です");
        } else {
          const info = await res.json() as InviteInfo;
          setInvite(info);
          if (info.email) setEmail(info.email);
        }
      } catch {
        setTokenError("招待リンクの確認に失敗しました");
      } finally {
        setTokenLoading(false);
      }
    })();
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!invite || !name.trim() || !email.trim() || !password) return;
    setStatus("loading");

    const supabase = createSupabaseClient();
    const callbackUrl = new URL("/api/auth/callback", location.origin);
    if (next) callbackUrl.searchParams.set("next", next);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: name.trim(),
          municipality: invite.municipalityName,
          role: invite.role,
          invite_token: token,
        },
        emailRedirectTo: callbackUrl.toString(),
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
      return;
    }

    // トークンを使用済みにする
    await fetch(`/api/admin/invites/${token}`, { method: "PATCH" }).catch(() => {});

    if (data.session) {
      let role = invite.role;
      const res = await fetch("/api/auth/me").catch(() => null);
      if (res?.ok) {
        const me = await res.json().catch(() => ({})) as { role?: string };
        role = me.role ?? role;
      }
      const dest = next ?? homePathForRole(role);
      router.push(dest as Parameters<typeof router.push>[0]);
      router.refresh();
    } else {
      setStatus("done");
    }
  }

  if (tokenLoading) {
    return (
      <div className="flex items-center gap-2 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        招待リンクを確認中…
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
          <AlertCircle className="h-10 w-10 text-red-400" />
          <p className="text-[14px] font-semibold text-red-800">招待リンクエラー</p>
          <p className="text-[13px] text-red-600">{tokenError}</p>
        </div>
        <p className="mt-6 text-center text-[12px] text-slate-500">
          すでにアカウントをお持ちの方は{" "}
          <Link href={`/login` as never} className="font-semibold text-slate-900 underline underline-offset-2">
            ログイン
          </Link>
        </p>
      </div>
    );
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
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">アカウント登録</h1>
        <p className="mt-1.5 text-[12px] text-slate-500">地域おこし協力隊サポートシステム</p>
      </div>

      {/* 招待情報バッジ */}
      <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-800">
        <span className="font-semibold">{invite?.municipalityName || "自治体"}</span> の{" "}
        <span className="font-semibold">
          {invite?.role === "manager" ? "役場職員" : invite?.role === "admin" ? "管理者" : "協力隊員"}
        </span>{" "}
        として招待されています
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
              readOnly={!!invite?.email}
              className={`w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-[14px] text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 ${invite?.email ? "cursor-not-allowed bg-slate-50 text-slate-500" : ""}`}
            />
          </div>
          {invite?.email && (
            <p className="text-[12px] text-slate-400">招待メールアドレスに固定されています</p>
          )}
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
        <Link href={(next ? `/login?next=${encodeURIComponent(next)}` : "/login") as never} className="font-semibold text-slate-900 underline underline-offset-2">
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
