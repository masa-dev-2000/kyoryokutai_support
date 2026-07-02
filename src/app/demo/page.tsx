import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Flag,
  Megaphone,
  MessageCircle,
  Mic,
  Receipt,
  Search,
  ShieldCheck,
  Sparkles,
  TimerReset,
  TrendingDown,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";

export const metadata: Metadata = {
  title: "説明用デモ | 地域おこし協力隊サポート",
  description: "地域おこし協力隊の活動記録、月報、経費、職員確認をつなぐ説明用デモページ",
};

const painPoints = [
  {
    title: "月末に記憶を掘り起こす",
    body: "日々の活動がメモ、写真、チャット、紙に散り、月報作成が後回しになる。",
    icon: TimerReset,
  },
  {
    title: "職員が状況を追いきれない",
    body: "未提出、承認待ち、声かけが必要な隊員を個別の報告から探している。",
    icon: Search,
  },
  {
    title: "成果が説明資料にならない",
    body: "活動量や地域への接点が蓄積されず、予算説明や引き継ぎに使いにくい。",
    icon: AlertTriangle,
  },
];

const outcomes = [
  { value: "5分", label: "1日の記録目安", sub: "活動・時間・経費をまとめて保存" },
  { value: "1画面", label: "職員の確認導線", sub: "未提出、承認待ち、声かけ候補を集約" },
  { value: "月末", label: "報告作成の山場を平準化", sub: "日々の記録から月報の材料を生成" },
];

const memberLogs = [
  { label: "活動メモ", value: "空き家候補を2件訪問", icon: FileText },
  { label: "活動時間", value: "3.5時間", icon: CalendarDays },
  { label: "経費", value: "移動費 1,280円", icon: Receipt },
];

const staffRows = [
  { name: "田中 あかり", area: "移住促進", status: "月報提出済", tone: "emerald" },
  { name: "山本 健一", area: "農業支援", status: "承認待ち", tone: "amber" },
  { name: "佐藤 美咲", area: "観光", status: "声かけ候補", tone: "rose" },
];

const storySteps = [
  {
    title: "隊員は現場で残す",
    body: "活動直後にスマホで記録。経費も同じ流れで残すため、月末に探し直さない。",
    icon: Mic,
  },
  {
    title: "AIは材料を整える",
    body: "活動記録を月報の下書き、確認メモ、類似事例探しの材料に変える。",
    icon: Sparkles,
  },
  {
    title: "職員は支援に集中する",
    body: "提出状況と変化を見て、承認・差し戻し・声かけを優先度順に進める。",
    icon: ShieldCheck,
  },
];

export default function DemoPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-14rem] top-[-14rem] h-[34rem] w-[34rem] rounded-full bg-sky-500/25 blur-3xl" />
        <div className="absolute right-[-10rem] top-40 h-[30rem] w-[30rem] rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute bottom-[-12rem] left-1/4 h-[28rem] w-[28rem] rounded-full bg-amber-300/15 blur-3xl" />
      </div>

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-black text-white backdrop-blur transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-sky-300"
        >
          <Flag className="h-4 w-4 text-sky-300" />
          地域おこし協力隊サポート
        </Link>
        <nav className="hidden items-center gap-2 text-sm font-bold text-slate-300 md:flex">
          <a className="rounded-full px-4 py-2 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-300" href="#story">
            何が変わるか
          </a>
          <a className="rounded-full px-4 py-2 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-300" href="#demo">
            デモ画面
          </a>
          <a className="rounded-full px-4 py-2 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-300" href="#talk">
            説明台本
          </a>
        </nav>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-5 pb-16 pt-8 md:grid-cols-[0.95fr_1.05fr] md:px-8 md:pb-24 md:pt-12">
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-2 text-sm font-black text-sky-100">
            <Megaphone className="h-4 w-4 text-sky-300" />
            自治体説明・提案用デモ
          </div>
          <h1 className="text-balance text-4xl font-black tracking-tight md:text-6xl">
            月末の報告作業を、
            <span className="mt-2 block text-sky-300">日々の支援データに変える。</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            隊員の活動記録、経費、月報、職員確認をひとつの流れにします。
            「入力して終わり」ではなく、職員が早く気づき、支援し、成果を説明できる状態をつくるためのデモです。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#demo"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-300 px-6 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              デモ画面を見る
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#talk"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-black text-white transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              30秒で説明する
            </a>
          </div>
        </div>

        <HeroBoard />
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-12 md:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {painPoints.map(({ title, body, icon: Icon }) => (
            <div key={title} className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-5">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-400/15 text-rose-200">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-black">{title}</h2>
              <p className="mt-3 leading-7 text-slate-300">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="story" className="mx-auto w-full max-w-7xl px-5 py-16 md:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-white text-slate-950">
          <div className="grid gap-0 overflow-hidden rounded-[2rem] lg:grid-cols-[0.9fr_1.1fr]">
            <div className="bg-slate-100 p-6 md:p-10">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-sky-700">Before / After</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
                報告を集める仕組みから、
                <span className="block text-sky-700">支援が回る仕組みへ。</span>
              </h2>
              <p className="mt-5 leading-8 text-slate-700">
                デモでは、隊員と職員の画面を分けて見せつつ、裏側では同じ活動データが月報・承認・声かけに使われることを強調します。
              </p>
            </div>
            <div className="grid gap-3 p-6 md:p-10">
              {storySteps.map(({ title, body, icon: Icon }, index) => (
                <div key={title} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[auto_1fr]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sky-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">STEP {index + 1}</div>
                    <h3 className="mt-1 text-xl font-black">{title}</h3>
                    <p className="mt-2 leading-7 text-slate-600">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-12 md:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {outcomes.map((item) => (
            <div key={item.label} className="rounded-[1.75rem] border border-sky-300/20 bg-sky-300/10 p-6">
              <div className="text-5xl font-black tracking-tight text-sky-200">{item.value}</div>
              <div className="mt-3 text-lg font-black">{item.label}</div>
              <p className="mt-2 leading-7 text-slate-300">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="demo" className="mx-auto w-full max-w-7xl px-5 py-16 md:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-sky-300">Product Demo</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">隊員と職員の画面を、同じストーリーで見せる。</h2>
          <p className="mt-4 leading-8 text-slate-300">
            左は隊員のスマホ入力、右は職員の確認画面です。説明では「この入力が、そのまま月報・承認・声かけに回る」とつなげて見せます。
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <MemberMock />
          <StaffMock />
        </div>
      </section>

      <section id="talk" className="mx-auto w-full max-w-7xl px-5 py-16 md:px-8 md:pb-24">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 md:p-10">
          <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-sky-300">Talk Track</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">30秒で刺すなら、この順番。</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                機能名ではなく、相手が困っている運用の変化として話します。AIは「判断するもの」ではなく「材料を整えるもの」と明確に置きます。
              </p>
            </div>
            <div className="grid gap-3">
              <TalkCard index={1} body="隊員は、活動直後にスマホで記録します。月末に思い出して書くのではなく、日々の材料が自然に残ります。" />
              <TalkCard index={2} body="職員は、未提出・承認待ち・声かけ候補を一覧で見られます。報告を集める作業から、支援する作業に時間を戻します。" />
              <TalkCard index={3} body="AIは判定者ではありません。月報や確認メモの下書きを整え、最後は職員と隊員が確認する設計です。" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function HeroBoard() {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.08] p-4 shadow-2xl shadow-black/30 backdrop-blur md:p-6">
      <div className="rounded-[1.5rem] bg-slate-900 p-5">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>運用ダッシュボード</span>
          <span>2026年7月</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <HeroMetric label="記録済み" value="18/24" trend="75%" icon={Users} />
          <HeroMetric label="承認待ち" value="7件" trend="要確認" icon={ClipboardCheck} />
          <HeroMetric label="声かけ候補" value="3人" trend="早期対応" icon={MessageCircle} />
        </div>
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-black">月末作業の変化</div>
            <div className="rounded-full bg-emerald-300/15 px-3 py-1 text-xs font-black text-emerald-200">支援に時間を戻す</div>
          </div>
          <div className="space-y-3">
            <ProgressRow label="記録の収集" before={80} after={24} />
            <ProgressRow label="月報の下書き" before={90} after={36} />
            <ProgressRow label="確認・声かけ" before={35} after={70} positive />
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroMetric({ label, value, trend, icon: Icon }: { label: string; value: string; trend: string; icon: typeof Users }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400">{label}</span>
        <Icon className="h-4 w-4 text-sky-300" />
      </div>
      <div className="mt-3 text-3xl font-black">{value}</div>
      <div className="mt-1 text-xs font-black text-sky-200">{trend}</div>
    </div>
  );
}

function ProgressRow({ label, before, after, positive = false }: { label: string; before: number; after: number; positive?: boolean }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-bold text-slate-400">
        <span>{label}</span>
        <span>{positive ? "増やしたい時間" : "減らしたい時間"}</span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="h-3 overflow-hidden rounded-full bg-rose-400/15">
          <div className="h-full rounded-full bg-rose-300" style={{ width: `${before}%` }} />
        </div>
        {positive ? <TrendingUp className="h-4 w-4 text-emerald-300" /> : <TrendingDown className="h-4 w-4 text-sky-300" />}
        <div className="h-3 overflow-hidden rounded-full bg-sky-300/15">
          <div className="h-full rounded-full bg-sky-300" style={{ width: `${after}%` }} />
        </div>
      </div>
    </div>
  );
}

function MemberMock() {
  return (
    <div className="mx-auto w-full max-w-[430px] rounded-[2.25rem] border border-white/10 bg-slate-900 p-3 shadow-2xl shadow-black/30">
      <div className="overflow-hidden rounded-[1.75rem] bg-white text-slate-950">
        <div className="flex items-center justify-between bg-slate-50 px-5 py-3 text-xs font-bold text-slate-500">
          <span>9:41</span>
          <span>100%</span>
        </div>
        <div className="border-b border-slate-100 px-5 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500">2026年7月1日</p>
              <h3 className="mt-1 text-2xl font-black">今日の活動を残す</h3>
            </div>
            <button className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-sky-50 text-sky-700 transition-colors hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500">
              <Bell className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-black text-emerald-950">18日連続で記録中</div>
                <div className="text-xs font-semibold text-emerald-700">月報の材料が自動でたまっています</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div>
            <label className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">活動メモ</label>
            <div className="mt-2 min-h-32 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-800">
              午前は空き家バンク候補を2件訪問。午後は移住相談のオンライン面談を1件実施。次回は現地案内の日程調整を行う。
            </div>
          </div>

          <div className="grid gap-2">
            {memberLogs.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500">{label}</div>
                  <div className="text-sm font-black text-slate-900">{value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 py-3 text-sm font-bold text-slate-600 transition-colors hover:border-sky-500 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500">
              <Mic className="h-4 w-4" />
              音声入力
            </button>
            <button className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 py-3 text-sm font-bold text-slate-600 transition-colors hover:border-sky-500 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500">
              <Receipt className="h-4 w-4" />
              領収書
            </button>
          </div>

          <button className="w-full cursor-pointer rounded-2xl bg-slate-950 py-4 text-sm font-black text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2">
            保存して月報に反映
          </button>
        </div>
      </div>
    </div>
  );
}

function StaffMock() {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white p-4 text-slate-950 shadow-2xl shadow-black/20 md:p-5">
      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50">
        <div className="flex flex-col gap-4 border-b border-slate-200 bg-white p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-500">職員ダッシュボード</p>
            <h3 className="mt-1 text-2xl font-black">提出・承認・声かけを確認</h3>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-500">
            <Search className="h-4 w-4" />
            隊員名で検索
          </div>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-3">
          <MetricCard label="隊員数" value="24" icon={Users} />
          <MetricCard label="月報提出済" value="18" icon={FileText} />
          <MetricCard label="承認待ち" value="7" icon={ClipboardCheck} />
        </div>

        <div className="grid gap-5 p-5 pt-0 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-black">隊員別ステータス</h4>
              <span className="text-xs font-bold text-slate-500">2026年7月</span>
            </div>
            <div className="space-y-2">
              {staffRows.map((row) => (
                <div key={row.name} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-black text-white">
                    {row.name.slice(0, 1)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black text-slate-900">{row.name}</div>
                    <div className="text-xs font-semibold text-slate-500">{row.area}</div>
                  </div>
                  <StatusBadge tone={row.tone}>{row.status}</StatusBadge>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <InsightCard icon={WalletCards} title="経費と活動のつながり" body="経費申請が、どの活動に紐づくかを確認しやすくします。" tone="emerald" />
            <InsightCard icon={MessageCircle} title="声かけ候補" body="記録が少ない、差し戻しが続く、相談メモが増えている隊員を早めに見つけます。" tone="sky" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof FileText }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500">{label}</span>
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <div className="mt-3 text-3xl font-black tracking-tight text-slate-950">{value}</div>
    </div>
  );
}

function InsightCard({ icon: Icon, title, body, tone }: { icon: typeof FileText; title: string; body: string; tone: "emerald" | "sky" }) {
  const classes = tone === "emerald" ? "border-emerald-200 bg-emerald-50 text-emerald-950" : "border-sky-200 bg-sky-50 text-sky-950";

  return (
    <div className={`rounded-2xl border p-4 ${classes}`}>
      <div className="flex items-center gap-2 text-sm font-black">
        <Icon className="h-4 w-4" />
        {title}
      </div>
      <p className="mt-3 text-sm leading-7">{body}</p>
    </div>
  );
}

function StatusBadge({ tone, children }: { tone: string; children: React.ReactNode }) {
  const className =
    tone === "emerald"
      ? "bg-emerald-100 text-emerald-800"
      : tone === "amber"
        ? "bg-amber-100 text-amber-800"
        : "bg-rose-100 text-rose-800";

  return <span className={`rounded-full px-2.5 py-1 text-xs font-black ${className}`}>{children}</span>;
}

function TalkCard({ index, body }: { index: number; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
      <div className="mb-2 text-sm font-black text-sky-300">POINT {index}</div>
      <p className="leading-7 text-slate-100">{body}</p>
    </div>
  );
}
