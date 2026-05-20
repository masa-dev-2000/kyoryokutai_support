import Link from "next/link";
import {
  ChevronLeft,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Mic,
  Sparkles,
  Search,
  ChevronRight,
  UserCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const guardrailExamples = [
  {
    id: "q1",
    question: "自分の SNS で活動を紹介していい?",
    verdict: "go" as const,
    summary: "個人 SNS での紹介は OK。市の公式アカウント名乗りはダメ。",
  },
  {
    id: "q2",
    question: "副業で農産物を販売していい?",
    verdict: "gray" as const,
    summary: "事前申請が必要。月 20h 以内かつ本業に支障なきこと。",
  },
  {
    id: "q3",
    question: "活動費でカフェのコーヒー代を払っていい?",
    verdict: "stop" as const,
    summary: "個人飲食は対象外。打合せ目的でも上限 ¥500/回・月 3 回まで。",
  },
];

const todayActions = [
  { id: "t1", time: "10:00", text: "空き家見学(A 邸)同行" },
  { id: "t2", time: "13:30", text: "地域おこし協議会 月例会" },
  { id: "t3", time: "16:00", text: "夕方の振り返り音声入力" },
];

export default function V3MemberHome() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:max-w-3xl sm:px-6">
        <Link
          href="/v3"
          className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          v3 ホームへ
        </Link>

        <header className="mt-4 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">
              <UserCircle2 className="mr-1 h-3 w-3" />
              隊員モード
            </Badge>
            <Badge
              variant="outline"
              className="border-slate-300 bg-white text-slate-600"
            >
              新温泉町 / 移住促進担当
            </Badge>
          </div>
          <h1 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
            田中 あかり さん、おはようございます
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            2026-05-20 火 / 任期 2 年目 / このツールに従えば「役場に怒られない」設計です
          </p>
        </header>

        {/* ガードレール質問ボックス */}
        <section className="mt-6">
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
            <CardContent className="px-5 py-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-700" />
                <div className="text-sm font-semibold text-emerald-950">
                  これってやっていい?
                </div>
              </div>
              <p className="mt-1 text-xs text-emerald-800">
                やりたいことを書くと、ガードレール内かどうか AI が即答します。役場に聞かなくて大丈夫。
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="例:活動費で打合せのコーヒー代を払いたい"
                    className="w-full rounded-xl border border-emerald-200 bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  AI に聞く
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              よくある質問
            </div>
            {guardrailExamples.map((g) => (
              <GuardrailCard key={g.id} {...g} />
            ))}
          </div>
        </section>

        {/* 今日のアクション */}
        <section className="mt-8">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">
            今日の予定
          </h2>
          <Card className="border-slate-200 bg-white">
            <CardContent className="px-4 py-3">
              <ul className="divide-y divide-slate-100">
                {todayActions.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center gap-3 py-2 text-sm"
                  >
                    <span className="w-12 text-xs font-mono text-slate-500">
                      {a.time}
                    </span>
                    <span className="flex-1 text-slate-800">{a.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* 音声日報入力 */}
        <section className="mt-8">
          <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50">
            <CardContent className="px-5 py-5">
              <div className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-violet-700" />
                <div className="text-sm font-semibold text-violet-950">
                  話すだけで日報・月報が完成
                </div>
              </div>
              <p className="mt-1 text-xs text-violet-800">
                3 分話せば AI が整形 → 月末に月次報告も自動生成。
                <br />
                書く文化はもう不要です。
              </p>
              <Button className="mt-3 w-full bg-violet-600 hover:bg-violet-700 sm:w-auto">
                <Mic className="mr-1.5 h-4 w-4" />
                音声で今日を記録
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* AI コーチング */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="text-sm leading-relaxed text-slate-700">
              <div className="font-semibold text-slate-900">
                AI からの今週のひと言
              </div>
              <p className="mt-1">
                今週は空き家関連の活動が前月比 +40%。
                <strong className="text-slate-900">
                  「空き家バンク事業の進捗まとめ」
                </strong>
                を任期報告書に追記しておきましょう(AI が下書きを用意済)。
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-8 text-center text-[11px] text-slate-500">
          このツールの方針に従っていれば、役場とのトラブルは起きません。
        </footer>
      </div>
    </main>
  );
}

function GuardrailCard({
  question,
  verdict,
  summary,
}: {
  question: string;
  verdict: "go" | "gray" | "stop";
  summary: string;
}) {
  const style = {
    go: {
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
      label: "やってよい",
      labelClass: "bg-emerald-100 text-emerald-800",
      border: "border-emerald-200",
    },
    gray: {
      icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
      label: "条件付き",
      labelClass: "bg-amber-100 text-amber-800",
      border: "border-amber-200",
    },
    stop: {
      icon: <XCircle className="h-4 w-4 text-rose-600" />,
      label: "やらないで",
      labelClass: "bg-rose-100 text-rose-800",
      border: "border-rose-200",
    },
  }[verdict];

  return (
    <Card className={`border bg-white ${style.border}`}>
      <CardContent className="px-4 py-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5">{style.icon}</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">
                {question}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${style.labelClass}`}
              >
                {style.label}
              </span>
            </div>
            <div className="mt-1 text-xs leading-relaxed text-slate-600">
              {summary}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
        </div>
      </CardContent>
    </Card>
  );
}
