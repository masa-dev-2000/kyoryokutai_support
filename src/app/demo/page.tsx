import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  MessageCircle,
  Mic,
  Receipt,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "説明用デモ | 地域おこし協力隊サポート",
  description: "隊員画面と職員画面を説明するためのデモページ",
};

const memberLogs = [
  { label: "活動メモ", value: "空き家バンク登録候補を2件訪問", icon: FileText },
  { label: "活動時間", value: "3.5時間", icon: CalendarDays },
  { label: "経費メモ", value: "移動費 1,280円", icon: Receipt },
];

const staffRows = [
  { name: "田中 あかり", area: "移住促進", status: "月報提出済", tone: "emerald" },
  { name: "山本 健一", area: "農業支援", status: "下書き中", tone: "amber" },
  { name: "佐藤 美咲", area: "観光", status: "声かけ候補", tone: "rose" },
];

const talkTracks = [
  "隊員はスマホで日々の活動と経費を残すだけ。月末に思い出して書き直す負担を減らします。",
  "職員は提出状況、承認待ち、活動の偏りを一覧で確認できます。個別フォローの優先順位が見えます。",
  "AIは判定者ではなく下書き支援です。月報や確認メモを作る材料を整理し、最後は人が確認します。",
];

export default function DemoPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f3ea] text-slate-950">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-12rem] top-[-10rem] h-[28rem] w-[28rem] rounded-full bg-emerald-200/60 blur-3xl" />
        <div className="absolute right-[-10rem] top-24 h-[30rem] w-[30rem] rounded-full bg-indigo-200/60 blur-3xl" />
        <div className="absolute bottom-[-16rem] left-1/3 h-[28rem] w-[28rem] rounded-full bg-amber-200/50 blur-3xl" />
      </div>

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/80 px-4 py-2 text-sm font-bold text-slate-800 backdrop-blur transition-colors hover:border-slate-900/30 hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          地域おこし協力隊サポート
        </Link>
        <nav className="hidden items-center gap-2 text-sm font-semibold text-slate-600 md:flex">
          <a className="rounded-full px-4 py-2 transition-colors hover:bg-white/70 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500" href="#member">
            隊員画面
          </a>
          <a className="rounded-full px-4 py-2 transition-colors hover:bg-white/70 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500" href="#staff">
            職員画面
          </a>
          <a className="rounded-full px-4 py-2 transition-colors hover:bg-white/70 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500" href="#script">
            説明の流れ
          </a>
        </nav>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-5 pb-16 pt-8 md:grid-cols-[1.02fr_0.98fr] md:px-8 md:pb-24 md:pt-14">
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-900/10 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-900">
            <Sparkles className="h-4 w-4" />
            説明会・商談用デモ
          </div>
          <h1 className="text-balance text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
            隊員の記録と、
            <span className="block text-emerald-700">職員の確認をつなぐ。</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
            日々の活動、経費、月次報告、承認、声かけまでを一つの流れとして説明するためのデモページです。
            実データやログインに依存せず、画面の価値を短時間で共有できます。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#member"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
            >
              隊員画面を見る
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#staff"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-900/15 bg-white/80 px-6 py-3 text-sm font-bold text-slate-900 transition-colors hover:border-slate-900/30 hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              職員画面を見る
            </a>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-900/10 bg-white/75 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur md:p-6">
          <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>説明の全体像</span>
              <span>3分デモ</span>
            </div>
            <div className="mt-6 grid gap-3">
              <FlowCard icon={FileText} title="1. 隊員が記録" body="活動・時間・経費をスマホで残す" />
              <FlowCard icon={Sparkles} title="2. AIが整理" body="月報や確認メモの下書きを作る" />
              <FlowCard icon={ClipboardCheck} title="3. 職員が確認" body="提出状況、承認、フォローを進める" />
            </div>
          </div>
        </div>
      </section>

      <section id="member" className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-16 md:grid-cols-[0.9fr_1.1fr] md:px-8">
        <SectionIntro
          eyebrow="隊員向け"
          title="現場で迷わず、あとから困らない記録画面。"
          body="隊員は活動直後にスマホで記録します。活動メモ、活動時間、経費を同じ流れで残せるため、月末の報告作成が軽くなります。"
          points={["音声入力や写真添付を想定", "経費は活動と紐づけて保存", "月次報告の材料として自動整理"]}
        />
        <MemberMock />
      </section>

      <section id="staff" className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-16 md:grid-cols-[1.12fr_0.88fr] md:px-8">
        <StaffMock />
        <SectionIntro
          eyebrow="職員向け"
          title="提出状況と支援の優先順位が見える画面。"
          body="職員は隊員ごとの提出状況、承認待ち、活動量、声かけが必要そうな人をまとめて確認できます。個別の報告を探し回る時間を減らします。"
          points={["未提出・承認待ちを一覧化", "活動カテゴリや経費を俯瞰", "声かけ候補を早めに発見"]}
        />
      </section>

      <section id="script" className="mx-auto w-full max-w-7xl px-5 py-16 md:px-8 md:pb-24">
        <div className="rounded-[2rem] border border-slate-900/10 bg-slate-950 p-6 text-white md:p-10">
          <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-300">Talk Track</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">30秒で説明するなら</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                画面を見せながら、入力負担の軽減、職員側の見える化、AIの位置づけの順で話すと伝わりやすい構成です。
              </p>
            </div>
            <div className="grid gap-3">
              {talkTracks.map((track, index) => (
                <div key={track} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 text-sm font-black text-emerald-300">POINT {index + 1}</div>
                  <p className="leading-7 text-slate-100">{track}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function FlowCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof FileText;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="font-black">{title}</div>
        <div className="mt-0.5 text-sm text-slate-300">{body}</div>
      </div>
    </div>
  );
}

function SectionIntro({
  eyebrow,
  title,
  body,
  points,
}: {
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
}) {
  return (
    <div className="flex flex-col justify-center">
      <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">{title}</h2>
      <p className="mt-5 text-base leading-8 text-slate-700">{body}</p>
      <ul className="mt-7 grid gap-3">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-3 rounded-2xl border border-slate-900/10 bg-white/70 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
            <span className="font-bold text-slate-800">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MemberMock() {
  return (
    <div className="mx-auto w-full max-w-[430px] rounded-[2.25rem] border border-slate-900/10 bg-slate-950 p-3 shadow-2xl shadow-slate-900/20">
      <div className="overflow-hidden rounded-[1.75rem] bg-white">
        <div className="flex items-center justify-between bg-slate-50 px-5 py-3 text-xs font-bold text-slate-500">
          <span>9:41</span>
          <span>100%</span>
        </div>
        <div className="border-b border-slate-100 px-5 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500">2026年7月1日</p>
              <h3 className="mt-1 text-2xl font-black">今日の活動</h3>
            </div>
            <button className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 transition-colors hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500">
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
                <div className="text-xs font-semibold text-emerald-700">月報に使える材料が増えています</div>
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
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 py-3 text-sm font-bold text-slate-600 transition-colors hover:border-emerald-500 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <Mic className="h-4 w-4" />
              音声入力
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 py-3 text-sm font-bold text-slate-600 transition-colors hover:border-emerald-500 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <Receipt className="h-4 w-4" />
              領収書
            </button>
          </div>

          <button className="w-full rounded-2xl bg-slate-950 py-4 text-sm font-black text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2">
            保存して月報に反映
          </button>
        </div>
      </div>
    </div>
  );
}

function StaffMock() {
  return (
    <div className="rounded-[2rem] border border-slate-900/10 bg-white p-4 shadow-2xl shadow-slate-900/10 md:p-5">
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

        <div className="grid gap-5 p-5 pt-0 lg:grid-cols-[1.1fr_0.9fr]">
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
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-sm font-black text-emerald-900">
                <ShieldCheck className="h-4 w-4" />
                確認ポイント
              </div>
              <p className="mt-3 text-sm leading-7 text-emerald-950">
                経費申請と活動内容のつながり、月報の未提出、活動量の急な変化をまとめて確認できます。
              </p>
            </div>
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
              <div className="flex items-center gap-2 text-sm font-black text-indigo-900">
                <MessageCircle className="h-4 w-4" />
                声かけ候補
              </div>
              <p className="mt-3 text-sm leading-7 text-indigo-950">
                2週間記録が少ない隊員、差し戻しが続く申請、相談メモが増えている隊員を優先表示します。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof FileText;
}) {
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

function StatusBadge({ tone, children }: { tone: string; children: React.ReactNode }) {
  const className =
    tone === "emerald"
      ? "bg-emerald-100 text-emerald-800"
      : tone === "amber"
        ? "bg-amber-100 text-amber-800"
        : "bg-rose-100 text-rose-800";

  return <span className={`rounded-full px-2.5 py-1 text-xs font-black ${className}`}>{children}</span>;
}
