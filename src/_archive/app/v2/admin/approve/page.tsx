import Link from "next/link";
import { AmbientBubbles } from "@/components/bubble/ambient-bubbles";
import { mockMembers, statusBadge } from "@/lib/mock/data";
import {
  ChevronLeft,
  ClipboardCheck,
  Receipt,
  Sparkles,
  Check,
} from "lucide-react";

const monthlyPending = mockMembers.filter(
  (m) => m.currentMonthStatus === "submitted" || m.currentMonthStatus === "draft",
);

const expensePending = [
  {
    id: "ex1",
    member: "田中 あかり",
    amount: 24500,
    purpose: "空き家視察 旅費(篠山〜養父)",
    date: "2026-04-22",
  },
  {
    id: "ex2",
    member: "山本 健一",
    amount: 8200,
    purpose: "農業研修参加費",
    date: "2026-04-20",
  },
];

function formatJpy(n: number) {
  return `¥${n.toLocaleString("ja-JP")}`;
}

export default function ApprovePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <AmbientBubbles count={8} />

      <div className="relative mx-auto max-w-4xl px-6 py-8">
        <Link
          href="/v2/admin"
          className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          役場ホームへ
        </Link>

        <header className="mt-4">
          <h1 className="text-2xl font-bold text-slate-900">申請承認</h1>
          <p className="text-xs text-slate-600">
            月次報告と経費を 1 画面で承認
          </p>
        </header>

        {/* Monthly Reports */}
        <section className="mt-8">
          <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <ClipboardCheck className="h-3.5 w-3.5" />
            月次報告({monthlyPending.length} 件)
          </h2>

          <div className="rounded-3xl bg-amber-50/80 p-3 ring-1 ring-amber-200 backdrop-blur mb-3">
            <div className="flex items-start gap-2 text-xs text-amber-900">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" />
              <p>
                <strong>承認時は「評価できる点」のコメントが必須</strong>です。
                隊員のモチベーションを支える役場フィードバック設計。
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {monthlyPending.map((m) => {
              const b = statusBadge(m.currentMonthStatus);
              return (
                <div
                  key={m.id}
                  className="relative rounded-3xl bg-white/80 p-4 shadow-md ring-1 ring-slate-200 backdrop-blur"
                >
                  <span className="pointer-events-none absolute left-[8%] top-[10%] h-[12%] w-[20%] rounded-full bg-white/60 blur-sm" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ring-2 ring-white ${m.avatarColor}`}
                      >
                        {m.initials}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {m.fullName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          2026 年 4 月分 / AI 生成済
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${b.className}`}
                      >
                        {b.label}
                      </span>
                      <button className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 px-4 py-2 text-xs font-bold text-white shadow-md ring-2 ring-white/40">
                        <Check className="h-3.5 w-3.5" />
                        レビュー
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Expense */}
        <section className="mt-10">
          <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Receipt className="h-3.5 w-3.5" />
            経費申請({expensePending.length} 件)
          </h2>

          <div className="space-y-3">
            {expensePending.map((e) => (
              <div
                key={e.id}
                className="relative rounded-3xl bg-white/80 p-4 shadow-md ring-1 ring-slate-200 backdrop-blur"
              >
                <span className="pointer-events-none absolute left-[8%] top-[10%] h-[12%] w-[20%] rounded-full bg-white/60 blur-sm" />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">
                      {e.member} さん
                    </div>
                    <div className="text-sm text-slate-700">{e.purpose}</div>
                    <div className="text-[11px] text-slate-500">{e.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-900">
                      {formatJpy(e.amount)}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button className="rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] text-slate-700">
                        差戻し
                      </button>
                      <button className="rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 px-3 py-1 text-[11px] font-bold text-white shadow ring-2 ring-white/40">
                        承認
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
