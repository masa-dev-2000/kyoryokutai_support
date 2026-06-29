"use client";

import * as React from "react";
import { apiGet, apiPost } from "@/lib/api/client";
import { Building2, Users, Activity, ShieldCheck, Loader2, LogOut, Plus, UserPlus, Copy, Check, X } from "lucide-react";

/* ============================================================
   super 運営者ダッシュボード(#64 / #65)
   全自治体横断のサマリ + 自治体作成・admin 招待オンボーディング。
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

export function SuperApp() {
  const [data, setData] = React.useState<Overview | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [muniModal, setMuniModal] = React.useState(false);
  const [inviteFor, setInviteFor] = React.useState<{ id: string; name: string } | null>(null);

  const load = React.useCallback(() => {
    apiGet<Overview>("/api/super/overview")
      .then((d) => { setData(d); setError(null); })
      .catch(() => setError("データの取得に失敗しました(super 権限が必要です)"));
  }, []);

  React.useEffect(() => { load(); }, [load]);

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

            {/* 自治体一覧 + 操作 */}
            <div className="mt-8 mb-3 flex items-center justify-between">
              <h2 className="text-[13px] font-bold text-slate-700">契約自治体</h2>
              <button
                onClick={() => setMuniModal(true)}
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
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => setInviteFor({ id: m.id, name: m.name })}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          <UserPlus className="h-3 w-3" /> 管理者を招待
                        </button>
                      </td>
                    </tr>
                  ))}
                  {data.municipalities.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">契約自治体がありません</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {muniModal && (
        <MuniModal
          onClose={() => setMuniModal(false)}
          onCreated={() => { setMuniModal(false); load(); }}
        />
      )}
      {inviteFor && (
        <InviteModal muni={inviteFor} onClose={() => setInviteFor(null)} />
      )}
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
