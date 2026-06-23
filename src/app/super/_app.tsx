"use client";

import * as React from "react";
import { apiGet } from "@/lib/api/client";
import { Building2, Users, Activity, ShieldCheck, Loader2, LogOut } from "lucide-react";

/* ============================================================
   super 運営者ダッシュボード(#64)
   全自治体横断のサマリ。super ロールのみアクセス可。
   ============================================================ */

type MuniRow = {
  id: string;
  name: string;
  prefecture: string;
  members: number;
  managers: number;
  admins: number;
  activityLogs: number;
};
type Overview = {
  municipalities: MuniRow[];
  totals: { municipalities: number; members: number; managers: number; admins: number; supers: number };
};

export function SuperApp() {
  const [data, setData] = React.useState<Overview | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    apiGet<Overview>("/api/super/overview")
      .then(setData)
      .catch(() => setError("データの取得に失敗しました(super 権限が必要です)"));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    location.href = "/login";
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-indigo-600" />
          <span className="text-[15px] font-bold">運営者ダッシュボード</span>
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">super</span>
        </div>
        <button onClick={handleLogout} className="inline-flex items-center gap-1 text-[12px] text-slate-500 hover:text-slate-900">
          <LogOut className="h-3.5 w-3.5" />
          ログアウト
        </button>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</div>
        )}

        {!data && !error && (
          <div className="flex items-center gap-2 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            読み込み中…
          </div>
        )}

        {data && (
          <>
            {/* サマリカード */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard icon={<Building2 className="h-4 w-4" />} label="自治体" value={data.totals.municipalities} />
              <StatCard icon={<Users className="h-4 w-4" />} label="隊員" value={data.totals.members} />
              <StatCard icon={<Users className="h-4 w-4" />} label="役場職員" value={data.totals.managers + data.totals.admins} />
              <StatCard icon={<ShieldCheck className="h-4 w-4" />} label="運営者(super)" value={data.totals.supers} />
            </div>

            {/* 自治体一覧 */}
            <h2 className="mt-8 mb-3 text-[13px] font-bold text-slate-700">契約自治体</h2>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-[13px]">
                <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5 text-left">自治体</th>
                    <th className="px-4 py-2.5 text-left">都道府県</th>
                    <th className="px-4 py-2.5 text-right">隊員</th>
                    <th className="px-4 py-2.5 text-right">職員</th>
                    <th className="px-4 py-2.5 text-right">活動記録</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.municipalities.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-medium">{m.name}</td>
                      <td className="px-4 py-2.5 text-slate-500">{m.prefecture}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{m.members}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{m.managers + m.admins}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        <span className="inline-flex items-center gap-1 text-slate-600">
                          <Activity className="h-3 w-3 text-slate-400" />
                          {m.activityLogs}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {data.municipalities.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">契約自治体がありません</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}
