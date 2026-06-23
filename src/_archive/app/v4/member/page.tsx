import Link from "next/link";
import {
  ChevronLeft,
  Bot,
  Mic,
  UserCircle2,
  Building2,
  Users,
  Sparkles,
  Quote,
  EyeOff,
  Lightbulb,
  ChevronRight,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Perspective = "municipality" | "community" | "member" | "small_start";
type Citation = { title: string; excerpt: string; url: string };

type Advice = {
  perspective: Perspective;
  body: string;
  citations: Citation[];
  visibility: "all" | "member_only";
};

const demoQuestion =
  "古民家を借りて隊員仲間とコワーキングスペースを試作したい。活動費で家賃の一部を出せる?";

const demoAdvices: Advice[] = [
  {
    perspective: "municipality",
    body: "役場目線では、活動費の家賃支出は『隊員の活動拠点』と認定できれば可。ただし営利性が強いと『副業との切り分け』を問われる可能性あり。事前に企画課へ相談 + ミッションとの紐付けが必須。",
    citations: [
      {
        title: "JOIN お役立ちツール 活動費の使い方 Q&A",
        excerpt: "活動拠点としての賃借料は対象になり得るが、事前協議が原則。",
        url: "https://www.iju-join.jp/chiikiokoshi/oyakudachi/",
      },
    ],
    visibility: "all",
  },
  {
    perspective: "community",
    body: "地域目線では『空き家活用 + 移住者の集まる場所』はプラス材料。一方で『隊員仲間だけで使う閉じた空間』に見えると地域から距離を置かれる懸念。地元自治会への事前説明と『地域住民も使える日』設計が肝。",
    citations: [
      {
        title: "海士町 古民家コワーキング事例(2024)",
        excerpt: "週 1 で地域開放日を設けたことで自治会の信頼を得た。",
        url: "https://example.com/ama-coworking",
      },
    ],
    visibility: "all",
  },
  {
    perspective: "member",
    body: "あなた目線では、3 年任期内での『成果物として残せるもの』にしたい場合、 (1) 試作期間と (2) 本格運用期間を切り分け、任期 1 年目で試作→2 年目で地域住民巻き込み→3 年目で運営移譲、という段階設計が現実的。",
    citations: [],
    visibility: "all",
  },
  {
    perspective: "small_start",
    body: "1 週間でできること: ① 月 2 回・3 時間だけ古民家を借りる(短期賃借)② SNS で参加者募集 ③ 終わったら写真 + 来場者数を記録。これなら家賃も最小、役場相談も「お試し」として通りやすい。",
    citations: [],
    visibility: "all",
  },
];

const recentMentorChats = [
  {
    id: "c1",
    title: "観光協会との連携、どこから始めればいい?",
    excerpt: "まずは月例会議の傍聴から。事例: 養父市 山本さん…",
    date: "3 日前",
  },
  {
    id: "c2",
    title: "卒業後に法人化したい。何から動くと?",
    excerpt: "兵庫県内 OB 12 名のキャリア事例から…",
    date: "1 週間前",
  },
  {
    id: "c3",
    title: "副業で農産物を売っていい?",
    excerpt: "事前申請 + 月 20h 以内 + 主たる活動への支障なし…",
    date: "2 週間前",
  },
];

export default function V4MemberHome() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <Link
          href="/v4"
          className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          v4 ホームへ
        </Link>

        <header className="mt-4 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">
              <UserCircle2 className="mr-1 h-3 w-3" />
              隊員モード
            </Badge>
            <Badge variant="outline" className="border-slate-300 bg-white text-slate-600">
              新温泉町 / 移住促進担当 / 任期 2 年目
            </Badge>
          </div>
          <h1 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
            田中 あかり さん、おはようございます
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            AI メンター「<strong>あおい</strong>」(設定変更可) と一緒に動きます
          </p>
        </header>

        {/* AI Mentor:質問入力 */}
        <section className="mt-6">
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 shadow-sm">
            <CardContent className="px-5 py-5">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-white p-1.5 text-emerald-700 shadow-sm">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="text-sm font-semibold text-emerald-950">
                  AI メンターに聞く
                </div>
                <Badge
                  variant="outline"
                  className="ml-auto border-emerald-200 bg-white text-[10px] text-emerald-700"
                >
                  RAG + 3 視点
                </Badge>
              </div>
              <p className="mt-1 text-xs text-emerald-900">
                やりたいこと・迷っていることを書くと、<strong>役場目線 / 地域目線 / あなた目線 + スモールスタート案</strong>で材料を提示します。判定はしません ─ 決めるのはあなたと役場。
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    defaultValue={demoQuestion}
                    className="w-full rounded-xl border border-emerald-200 bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  助言を見る
                </Button>
              </div>
              <p className="mt-2 text-[11px] text-emerald-700/80">
                ※ 上はデモの例文。下に AI の回答プレビューが表示されています。
              </p>
            </CardContent>
          </Card>

          {/* 3 視点回答プレビュー */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <Bot className="h-3 w-3" />
              あおい からの 4 視点(デモ)
            </div>
            {demoAdvices.map((a) => (
              <PerspectiveCard key={a.perspective} advice={a} />
            ))}
          </div>
        </section>

        {/* 記録 + メンター履歴 */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50">
            <CardContent className="px-5 py-5">
              <div className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-violet-700" />
                <div className="text-sm font-semibold text-violet-950">
                  話して記録する
                </div>
              </div>
              <p className="mt-1 text-xs text-violet-800">
                3 分話すと AI が:日報整形 / タグ付け / プロジェクト自動分類 / 月末に月報自動生成。
              </p>
              <Button className="mt-3 w-full bg-violet-600 hover:bg-violet-700">
                <Mic className="mr-1.5 h-4 w-4" />
                録音を始める
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardContent className="px-5 py-5">
              <div className="mb-2 flex items-center gap-2">
                <Quote className="h-4 w-4 text-slate-500" />
                <div className="text-sm font-semibold text-slate-900">
                  最近のメンター履歴
                </div>
              </div>
              <ul className="space-y-2">
                {recentMentorChats.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-xs font-semibold text-slate-900">
                          {c.title}
                        </div>
                        <div className="mt-0.5 truncate text-[11px] text-slate-500">
                          {c.excerpt}
                        </div>
                      </div>
                      <span className="shrink-0 text-[10px] text-slate-400">
                        {c.date}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 卒業後ビジョン */}
        <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-white p-2 text-amber-700 shadow-sm">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div className="flex-1 text-sm leading-relaxed text-amber-950">
              <div className="font-semibold">
                卒業後のビジョン形成(OB/OG 事例)
              </div>
              <p className="mt-1 text-amber-900">
                あなたと似た「移住促進担当・3 年任期」の OB 12 名のキャリア事例があります。
                <strong className="text-amber-950">
                  「法人化して観光業に進んだ人」「自治体職員になった人」「地域商社を立ち上げた人」
                </strong>
                など。今のうちから準備できることをメンターに聞いてみますか?
              </p>
              <Link
                href={"/v4/member" as never}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900"
              >
                OB/OG 事例を見る <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </section>

        <footer className="mt-8 text-center text-[11px] text-slate-500">
          ※ AI の助言には「役場側 UI からは見えない」もの(<EyeOff className="-mt-0.5 inline h-3 w-3" />) があります。
          それでも記録は監査ログに残り、後で検証可能です。
        </footer>
      </div>
    </main>
  );
}

function PerspectiveCard({ advice }: { advice: Advice }) {
  const meta = perspectiveMeta(advice.perspective);
  return (
    <Card className={`border ${meta.border}`}>
      <CardContent className="px-4 py-3">
        <div className="flex items-start gap-3">
          <div className={`rounded-lg p-1.5 ${meta.iconBg}`}>{meta.icon}</div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                {meta.label}
              </span>
              {advice.visibility === "member_only" && (
                <Badge
                  variant="outline"
                  className="gap-1 border-rose-200 bg-rose-50 text-[10px] text-rose-700"
                >
                  <EyeOff className="h-3 w-3" />
                  役場には非表示
                </Badge>
              )}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-700">
              {advice.body}
            </p>
            {advice.citations.length > 0 && (
              <div className="mt-2 space-y-1">
                {advice.citations.map((c, i) => (
                  <div
                    key={i}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px]"
                  >
                    <div className="flex items-center gap-1 font-semibold text-slate-700">
                      <Quote className="h-3 w-3" />
                      {c.title}
                    </div>
                    <div className="mt-0.5 text-slate-600">「{c.excerpt}」</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function perspectiveMeta(p: Perspective) {
  switch (p) {
    case "municipality":
      return {
        label: "役場目線",
        icon: <Building2 className="h-4 w-4 text-violet-700" />,
        iconBg: "bg-violet-100",
        border: "border-violet-200",
      };
    case "community":
      return {
        label: "地域目線",
        icon: <Users className="h-4 w-4 text-emerald-700" />,
        iconBg: "bg-emerald-100",
        border: "border-emerald-200",
      };
    case "member":
      return {
        label: "あなた目線",
        icon: <UserCircle2 className="h-4 w-4 text-sky-700" />,
        iconBg: "bg-sky-100",
        border: "border-sky-200",
      };
    case "small_start":
      return {
        label: "スモールスタート案",
        icon: <Sparkles className="h-4 w-4 text-amber-700" />,
        iconBg: "bg-amber-100",
        border: "border-amber-200",
      };
  }
}
