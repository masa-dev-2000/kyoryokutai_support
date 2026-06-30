"use client";

import * as React from "react";
import { apiGet, apiPost, apiPatch } from "@/lib/api/client";
import {
  Building2,
  Users,
  Activity,
  ShieldCheck,
  Loader2,
  LogOut,
  Plus,
  UserPlus,
  Copy,
  Check,
  X,
  ClipboardCheck,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type {
  SuperMuniDetail,
  SuperUserRow,
  SuperAnalytics,
} from "@/lib/db/repositories/types";

/* ============================================================
   super 運営者ダッシュボード(#64 / #65 / #66)
   全自治体横断のサマリ + 自治体作成・admin 招待オンボーディング(#65)
   + 自治体ドリルダウン・アカウント管理・分析(#66)。
   ※ 契約・課金管理 UI は Phase 2 へ延期(#72/#73, ADR-30)。API/Repos は温存。
   super ロールのみアクセス可。
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

type Tab = "overview" | "accounts" | "analytics";

export function SuperApp() {
  const [data, setData] = React.useState<Overview | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<Tab>("overview");

  // #65 オンボーディング モーダル
  const [muniModal, setMuniModal] = React.useState(false);
  const [inviteFor, setInviteFor] = React.useState<{ id: string; name: string } | null>(null);

  // #66 自治体詳細(スライドオーバー)
  const [detailId, setDetailId] = React.useState<string | null>(null);
  const [detail, setDetail] = React.useState<SuperMuniDetail | null>(null);
  const [detailErr, setDetailErr] = React.useState<string | null>(null);

  const loadOverview = React.useCallback(() => {
    apiGet<Overview>("/api/super/overview")
      .then((d) => { setData(d); setError(null); })
      .catch(() => setError("データの取得に失敗しました(super 権限が必要です)"));
  }, []);

  React.useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  function openDetail(id: string) {
    setDetailId(id);
    setDetail(null);
    setDetailErr(null);
    apiGet<SuperMuniDetail>(`/api/super/municipalities/${id}`)
      .then(setDetail)
      .catch(() => setDetailErr("詳細の取得に失敗しました"));
  }

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

      {/* タブ */}
      <div className="border-b border-slate-200 bg-white px-6">
        <div className="mx-auto flex max-w-5xl gap-1">
          {([
            ["overview", "概要"],
            ["accounts", "アカウント"],
            ["analytics", "分析"],
          ] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`-mb-px border-b-2 px-3 py-2.5 text-[13px] font-medium ${
                tab === key ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

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

        {data && tab === "overview" && (
          <OverviewTab
            data={data}
            onAddMuni={() => setMuniModal(true)}
            onInvite={(m) => setInviteFor(m)}
            onOpenDetail={openDetail}
          />
        )}
        {data && tab === "accounts" && <AccountsTab municipalities={data.municipalities} />}
        {data && tab === "analytics" && <AnalyticsTab />}
      </div>

      {/* #65 自治体追加モーダル */}
      {muniModal && (
        <MuniModal
          onClose={() => setMuniModal(false)}
          onCreated={() => { setMuniModal(false); loadOverview(); }}
        />
      )}
      {/* #65 管理者招待モーダル */}
      {inviteFor && (
        <InviteModal muni={inviteFor} onClose={() => setInviteFor(null)} />
      )}

      {/* #66 自治体ドリルダウン スライドオーバー */}
      {detailId && (
        <DetailSheet
          detail={detail}
          error={detailErr}
          onClose={() => setDetailId(null)}
        />
      )}
    </main>
  );
}

/* ---------------- 概要タブ ---------------- */

function OverviewTab({
  data,
  onAddMuni,
  onInvite,
  onOpenDetail,
}: {
  data: Overview;
  onAddMuni: () => void;
  onInvite: (m: { id: string; name: string }) => void;
  onOpenDetail: (id: string) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={<Building2 className="h-4 w-4" />} label="自治体" value={data.totals.municipalities} />
        <StatCard icon={<Users className="h-4 w-4" />} label="隊員" value={data.totals.members} />
        <StatCard icon={<Users className="h-4 w-4" />} label="役場職員" value={data.totals.managers + data.totals.admins} />
        <StatCard icon={<ShieldCheck className="h-4 w-4" />} label="運営者(super)" value={data.totals.supers} />
      </div>

      <div className="mt-8 mb-3 flex items-center justify-between">
        <h2 className="text-[13px] font-bold text-slate-700">自治体</h2>
        <button
          onClick={onAddMuni}
          className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-[12px] font-bold text-white hover:bg-slate-800"
        >
          <Plus className="h-3.5 w-3.5" /> 自治体を追加
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-[13px]">
          <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2.5 text-left">自治体</th>
              <th className="px-4 py-2.5 text-left">都道府県</th>
              <th className="px-4 py-2.5 text-right">隊員</th>
              <th className="px-4 py-2.5 text-right">職員</th>
              <th className="px-4 py-2.5 text-right">活動記録</th>
              <th className="px-4 py-2.5 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.municipalities.map((m) => (
              <tr
                key={m.id}
                className="cursor-pointer hover:bg-slate-50"
                onClick={() => onOpenDetail(m.id)}
              >
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
                <td className="px-4 py-2.5 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onInvite({ id: m.id, name: m.name });
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <UserPlus className="h-3 w-3" /> 管理者を招待
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {data.municipalities.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">自治体がありません</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ---------------- 自治体詳細 スライドオーバー(#66) ---------------- */

function DetailSheet({
  detail,
  error,
  onClose,
}: {
  detail: SuperMuniDetail | null;
  error: string | null;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div className="relative z-50 h-full w-full max-w-xl overflow-y-auto bg-slate-50 shadow-xl">
        {!detail && !error && (
          <div className="flex h-40 items-center justify-center gap-2 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            読み込み中…
          </div>
        )}
        {error && (
          <div className="m-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</div>
        )}
        {detail && (
          <div className="p-6">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="text-[17px] font-bold">{detail.municipality.name}</div>
                <div className="mt-0.5 text-[12px] text-slate-500">
                  {detail.municipality.prefecture}・年間予算 {detail.municipality.annualBudget.toLocaleString()} 円
                </div>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-900">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard icon={<Users className="h-4 w-4" />} label="隊員" value={detail.members.length} />
              <StatCard icon={<Building2 className="h-4 w-4" />} label="職員" value={detail.staff.length} />
              <StatCard icon={<Activity className="h-4 w-4" />} label="活動記録" value={detail.activity.totalLogs} />
              <StatCard icon={<ClipboardCheck className="h-4 w-4" />} label="保留承認" value={detail.pendingApprovals.total} />
            </div>

            {/* 隊員一覧 */}
            <h3 className="mt-6 mb-2 text-[13px] font-bold text-slate-700">隊員一覧</h3>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-[13px]">
                <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">名前</th>
                    <th className="px-3 py-2 text-left">役割</th>
                    <th className="px-3 py-2 text-left">任期</th>
                    <th className="px-3 py-2 text-left">着任日</th>
                    <th className="px-3 py-2 text-left">状態</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detail.members.map((m) => (
                    <tr key={m.id}>
                      <td className="px-3 py-2 font-medium">{m.name}</td>
                      <td className="px-3 py-2 text-slate-500">{m.role}</td>
                      <td className="px-3 py-2 text-slate-500">{m.term}</td>
                      <td className="px-3 py-2 text-slate-500">{m.startedAt}</td>
                      <td className="px-3 py-2">
                        <StatusBadge status={m.status} />
                      </td>
                    </tr>
                  ))}
                  {detail.members.length === 0 && (
                    <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-400">隊員がいません</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 職員一覧 */}
            <h3 className="mt-6 mb-2 text-[13px] font-bold text-slate-700">職員一覧</h3>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-[13px]">
                <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">名前</th>
                    <th className="px-3 py-2 text-left">役職</th>
                    <th className="px-3 py-2 text-left">所属課</th>
                    <th className="px-3 py-2 text-left">role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detail.staff.map((s) => (
                    <tr key={s.id}>
                      <td className="px-3 py-2 font-medium">{s.name}</td>
                      <td className="px-3 py-2 text-slate-500">{s.title}</td>
                      <td className="px-3 py-2 text-slate-500">{s.dept}</td>
                      <td className="px-3 py-2 text-slate-500">{s.role}</td>
                    </tr>
                  ))}
                  {detail.staff.length === 0 && (
                    <tr><td colSpan={4} className="px-3 py-6 text-center text-slate-400">職員がいません</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 最近の保留承認 */}
            <h3 className="mt-6 mb-2 text-[13px] font-bold text-slate-700">最近の保留承認</h3>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <ul className="divide-y divide-slate-100">
                {detail.pendingApprovals.recent.map((a) => (
                  <li key={a.id} className="flex items-center gap-2 px-4 py-2.5 text-[13px]">
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">{a.kind}</span>
                    <span className="text-slate-500">{a.member}</span>
                    <span className="truncate font-medium">{a.title}</span>
                  </li>
                ))}
                {detail.pendingApprovals.recent.length === 0 && (
                  <li className="px-4 py-6 text-center text-slate-400">保留中の承認はありません</li>
                )}
                {detail.pendingApprovals.total > detail.pendingApprovals.recent.length && (
                  <li className="px-4 py-2 text-center text-[12px] text-slate-400">
                    他 {detail.pendingApprovals.total - detail.pendingApprovals.recent.length} 件
                  </li>
                )}
              </ul>
            </div>

            {/* 活動メタ */}
            <div className="mt-6 flex gap-6 text-[12px] text-slate-500">
              <span>今月の活動記録: <span className="font-semibold text-slate-700">{detail.activity.logsThisMonth}</span></span>
              <span>最終活動日: <span className="font-semibold text-slate-700">{detail.activity.lastActivityDate ?? "—"}</span></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- アカウント管理タブ(#66) ---------------- */

const ROLE_OPTS = ["member", "manager", "admin", "super"];
const STATUS_OPTS = ["active", "retired", "suspended"];

function AccountsTab({ municipalities }: { municipalities: MuniRow[] }) {
  const [users, setUsers] = React.useState<SuperUserRow[] | null>(null);
  const [fMuni, setFMuni] = React.useState("");
  const [fRole, setFRole] = React.useState("");
  const [fStatus, setFStatus] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    const qs = new URLSearchParams();
    if (fMuni) qs.set("municipalityId", fMuni);
    if (fRole) qs.set("role", fRole);
    if (fStatus) qs.set("status", fStatus);
    const q = qs.toString();
    apiGet<SuperUserRow[]>(`/api/super/users${q ? `?${q}` : ""}`)
      .then(setUsers)
      .catch(() => setErr("ユーザーの取得に失敗しました"));
  }, [fMuni, fRole, fStatus]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function patch(id: string, body: { role?: string; status?: string; municipalityId?: string }) {
    try {
      const updated = await apiPatch<SuperUserRow>(`/api/super/users/${id}`, body);
      setUsers((prev) => (prev ? prev.map((u) => (u.id === id ? updated : u)) : prev));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "更新に失敗しました");
      load(); // 失敗時(自己変更ブロック等)はサーバ状態に戻す
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        <Select value={fMuni} onChange={setFMuni} label="全自治体">
          {municipalities.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </Select>
        <Select value={fRole} onChange={setFRole} label="全ロール">
          {ROLE_OPTS.map((r) => <option key={r} value={r}>{r}</option>)}
        </Select>
        <Select value={fStatus} onChange={setFStatus} label="全状態">
          {STATUS_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>

      {err && <div className="mb-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[12px] text-red-700">{err}</div>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-[13px]">
          <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2.5 text-left">氏名</th>
              <th className="px-3 py-2.5 text-left">メール</th>
              <th className="px-3 py-2.5 text-left">自治体</th>
              <th className="px-3 py-2.5 text-left">role</th>
              <th className="px-3 py-2.5 text-left">status</th>
              <th className="px-3 py-2.5 text-right">活動記録</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(users ?? []).map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-3 py-2 font-medium">{u.name}</td>
                <td className="px-3 py-2 text-slate-500">{u.email}</td>
                <td className="px-3 py-2">
                  <select
                    value={u.municipalityId ?? ""}
                    onChange={(e) => patch(u.id, { municipalityId: e.target.value })}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[12px] disabled:opacity-50"
                  >
                    <option value="">(未所属)</option>
                    {municipalities.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <select
                    value={u.role}
                    onChange={(e) => patch(u.id, { role: e.target.value })}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[12px] disabled:opacity-50"
                  >
                    {ROLE_OPTS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <select
                    value={u.status}
                    onChange={(e) => patch(u.id, { status: e.target.value })}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[12px] disabled:opacity-50"
                  >
                    {STATUS_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{u.activityLogs}</td>
              </tr>
            ))}
            {users && users.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-slate-400">該当ユーザーがいません</td></tr>
            )}
            {!users && !err && (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-slate-400">読み込み中…</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ---------------- 分析タブ(#66) ---------------- */

function AnalyticsTab() {
  const [a, setA] = React.useState<SuperAnalytics | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    apiGet<SuperAnalytics>("/api/super/analytics")
      .then(setA)
      .catch(() => setErr("分析データの取得に失敗しました"));
  }, []);

  if (err) return <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-700">{err}</div>;
  if (!a) return (
    <div className="flex items-center gap-2 text-slate-500">
      <Loader2 className="h-5 w-5 animate-spin" />
      読み込み中…
    </div>
  );

  const diff = a.totals.logsThisMonth - a.totals.logsPrevMonth;
  const maxTrend = Math.max(1, ...a.trend.map((t) => t.logs));

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={<TrendingUp className="h-4 w-4" />} label="週あたり日報/人" value={a.totals.logsPerMemberPerWeek} decimals />
        <StatCard icon={<Activity className="h-4 w-4" />} label="活動記録総数" value={a.totals.activityLogs} />
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Activity className="h-4 w-4" />
            今月の活動記録
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums">{a.totals.logsThisMonth}</span>
            <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${diff >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {diff >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {diff >= 0 ? "+" : ""}{diff}
            </span>
          </div>
        </div>
        <StatCard icon={<Users className="h-4 w-4" />} label="隊員数" value={a.totals.members} />
      </div>

      {/* 直近6ヶ月トレンド */}
      <h2 className="mt-8 mb-3 text-[13px] font-bold text-slate-700">直近6ヶ月の活動記録</h2>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="space-y-2">
          {a.trend.map((t) => (
            <div key={t.ym} className="flex items-center gap-3 text-[12px]">
              <span className="w-16 shrink-0 text-slate-500 tabular-nums">{t.ym}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{ width: `${Math.round((t.logs / maxTrend) * 100)}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right tabular-nums text-slate-700">{t.logs}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 自治体別活動量 */}
      <h2 className="mt-8 mb-3 text-[13px] font-bold text-slate-700">自治体別活動量</h2>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-[13px]">
          <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2.5 text-left">自治体</th>
              <th className="px-3 py-2.5 text-left">都道府県</th>
              <th className="px-3 py-2.5 text-right">隊員</th>
              <th className="px-3 py-2.5 text-right">活動記録</th>
              <th className="px-3 py-2.5 text-right">今月</th>
              <th className="px-3 py-2.5 text-right">週/人</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {a.byMunicipality.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50">
                <td className="px-3 py-2 font-medium">{m.name}</td>
                <td className="px-3 py-2 text-slate-500">{m.prefecture}</td>
                <td className="px-3 py-2 text-right tabular-nums">{m.members}</td>
                <td className="px-3 py-2 text-right tabular-nums">{m.activityLogs}</td>
                <td className="px-3 py-2 text-right tabular-nums">{m.logsThisMonth}</td>
                <td className="px-3 py-2 text-right tabular-nums">{m.logsPerMemberPerWeek.toFixed(1)}</td>
              </tr>
            ))}
            {a.byMunicipality.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-slate-400">データがありません</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ---------------- #65 自治体追加 / 管理者招待モーダル ---------------- */

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[14px] font-bold">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function MuniModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = React.useState("");
  const [prefecture, setPrefecture] = React.useState("");
  const [budget, setBudget] = React.useState("2000000");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");

  async function submit() {
    if (!name.trim() || !prefecture.trim()) { setErr("自治体名・都道府県は必須です"); return; }
    setBusy(true); setErr("");
    try {
      await apiPost("/api/super/municipalities", { name: name.trim(), prefecture: prefecture.trim(), annualBudget: Number(budget) || undefined });
      onCreated();
    } catch (e) { setErr((e as Error).message); setBusy(false); }
  }

  return (
    <Modal title="自治体を追加" onClose={onClose}>
      <div className="space-y-3">
        <Field label="自治体名"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="例: 新温泉町" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></Field>
        <Field label="都道府県"><input value={prefecture} onChange={(e) => setPrefecture(e.target.value)} placeholder="例: 兵庫県" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></Field>
        <Field label="年間活動費枠(円)"><input value={budget} onChange={(e) => setBudget(e.target.value)} inputMode="numeric" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></Field>
        {err && <p className="text-[12px] text-rose-500">{err}</p>}
        <button onClick={submit} disabled={busy} className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40">
          {busy ? "作成中…" : "作成する"}
        </button>
      </div>
    </Modal>
  );
}

function InviteModal({ muni, onClose }: { muni: { id: string; name: string }; onClose: () => void }) {
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");
  const [url, setUrl] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  async function submit() {
    if (!email.trim() || !name.trim()) { setErr("メール・氏名は必須です"); return; }
    setBusy(true); setErr("");
    try {
      const res = await apiPost<{ url: string }>(`/api/super/municipalities/${muni.id}/admins`, { email: email.trim(), name: name.trim() });
      setUrl(res.url);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }

  async function copy() {
    if (!url) return;
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Modal title={`${muni.name} の管理者を招待`} onClose={onClose}>
      {url ? (
        <div className="space-y-3">
          <p className="text-[13px] text-slate-600">招待リンクを発行しました。この URL を管理者に渡してください(7日間有効)。</p>
          <div className="flex items-center gap-2">
            <input readOnly value={url} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-[12px]" />
            <button onClick={copy} className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-[12px] font-bold text-white">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? "コピー済" : "コピー"}
            </button>
          </div>
          <button onClick={onClose} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700">閉じる</button>
        </div>
      ) : (
        <div className="space-y-3">
          <Field label="管理者の氏名"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="例: 山田 太郎" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></Field>
          <Field label="メールアドレス"><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="admin@example.jp" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></Field>
          {err && <p className="text-[12px] text-rose-500">{err}</p>}
          <button onClick={submit} disabled={busy} className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40">
            {busy ? "発行中…" : "招待リンクを発行"}
          </button>
        </div>
      )}
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold text-slate-500">{label}</span>
      {children}
    </label>
  );
}

/* ---------------- 共通ヘルパー ---------------- */

function StatCard({
  icon,
  label,
  value,
  decimals,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  decimals?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{decimals ? value.toFixed(1) : value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700",
    retired: "bg-slate-100 text-slate-500",
    suspended: "bg-red-50 text-red-700",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${map[status] ?? "bg-slate-100 text-slate-500"}`}>
      {status}
    </span>
  );
}

function Select({
  value,
  onChange,
  label,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] text-slate-700"
    >
      <option value="">{label}</option>
      {children}
    </select>
  );
}
