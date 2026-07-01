"use client";

import React from "react";
import { LogOut } from "lucide-react";
import { apiGet } from "@/lib/api/client";

type Me = { authenticated?: boolean; authMode?: string };

/**
 * 全ロール共通のログアウト導線(#116)。
 * ヘッダー右上に常時アイコン → 確認ダイアログ → POST /api/auth/logout → /login。
 * ローカル開発(AUTH_PROVIDER=none)は実セッションが無いため非表示にする。
 */
export function LogoutButton() {
  const [visible, setVisible] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    apiGet<Me>("/api/auth/me")
      .then((me) => {
        if (alive) setVisible(me?.authenticated === true && me?.authMode !== "none");
      })
      .catch(() => {
        /* 未認証/取得失敗時は導線を出さない */
      });
    return () => {
      alive = false;
    };
  }, []);

  async function doLogout() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* 失敗してもログイン画面へ送る */
    }
    window.location.href = "/login";
  }

  if (!visible) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label="ログアウト"
        title="ログアウト"
        className="p-1 text-slate-400 transition hover:text-slate-700"
      >
        <LogOut className="h-4 w-4" />
      </button>

      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6"
          onClick={() => {
            if (!busy) setConfirming(false);
          }}
        >
          <div
            className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[15px] font-bold text-slate-900">ログアウトしますか?</p>
            <p className="mt-1 text-[12px] text-slate-500">
              再度ログインするにはメールアドレスとパスワードが必要です。
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={busy}
                className="rounded-xl border border-slate-300 px-4 py-2 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={doLogout}
                disabled={busy}
                className="rounded-xl bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
