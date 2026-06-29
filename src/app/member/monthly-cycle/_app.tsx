"use client";

import React from "react";

// ADR-024 月次サイクル(目標 + 週次アクションプラン)。
// 独立フィーチャー: 既存 member/_app.tsx には依存しない自己完結コンポーネント。
// データは /api/visions, /api/monthly-cycles, /api/ai/* のみを叩く。

type WeekPlan = {
  week: number;
  title: string;
  actions: string[];
  expectedOutcome: string;
  checkPoint: string;
};
type Intake = { theme: string; level: string; daysPerWeek: number; specialPlans: string[] };
type Cycle = {
  monthlyGoal: string;
  actionPlan: WeekPlan[];
  intake: Intake | null;
  reflection: string;
  status: string;
};

const LEVELS = [
  { key: "start", label: "まず動き出す", hint: "下調べ・人に会うところから" },
  { key: "shape", label: "形にし始める", hint: "試しに小さくやってみる" },
  { key: "result", label: "成果を出す", hint: "イベント開催・◯件達成など" },
];
const SPECIAL = ["出張あり", "別業務で多忙", "特になし"];
const FALLBACK_THEMES = ["空き家の活用", "移住相談の体制づくり", "地域イベントの企画", "広報・情報発信"];

function todayYm(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function ymLabel(ym: string): string {
  const m = ym.split("-")[1];
  return `${Number(m)}月`;
}

async function jget<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url);
    return r.ok ? ((await r.json()) as T) : null;
  } catch {
    return null;
  }
}
async function jpost<T>(url: string, body: unknown): Promise<T | null> {
  try {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return r.ok ? ((await r.json()) as T) : null;
  } catch {
    return null;
  }
}

type View = "loading" | "empty" | "vision" | "hearing" | "draft" | "home";

export function MonthlyCycleApp({ userId }: { userId?: string }) {
  const ym = React.useMemo(todayYm, []);
  const [view, setView] = React.useState<View>("loading");
  const [vision, setVision] = React.useState("");
  const [cycle, setCycle] = React.useState<Cycle | null>(null);
  const [topics, setTopics] = React.useState<string[]>([]);

  const q = userId ? `?userId=${encodeURIComponent(userId)}` : "";

  React.useEffect(() => {
    (async () => {
      const [v, c, t] = await Promise.all([
        jget<{ body: string } | null>(`/api/visions${q}`),
        jget<Cycle | null>(`/api/monthly-cycles${userId ? `?userId=${encodeURIComponent(userId)}&` : "?"}ym=${ym}`),
        jget<string[]>(`/api/topics${q}`),
      ]);
      setVision(v?.body ?? "");
      setTopics(Array.isArray(t) ? t : []);
      if (c && c.actionPlan && c.actionPlan.length > 0) {
        setCycle(c);
        setView("home");
      } else {
        setView("empty");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const themes = React.useMemo(() => {
    const base = topics.length ? topics.slice(0, 4) : FALLBACK_THEMES;
    return base;
  }, [topics]);

  function startFlow() {
    if (!vision.trim()) setView("vision");
    else setView("hearing");
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <h1 className="text-base font-bold">{ymLabel(ym)}の活動サイクル</h1>
          <a href="/member" className="text-xs text-slate-400">← メンバー</a>
        </header>

        {view === "loading" && <Centered>読み込み中…</Centered>}

        {view === "empty" && (
          <EmptyView ymLabel={ymLabel(ym)} hasVision={!!vision.trim()} onStart={startFlow} onEditVision={() => setView("vision")} />
        )}

        {view === "vision" && (
          <VisionView
            initial={vision}
            onSave={async (body) => {
              setVision(body);
              await jpost(`/api/visions`, { userId, body });
              setView("hearing");
            }}
            onSkip={() => setView("hearing")}
          />
        )}

        {view === "hearing" && (
          <HearingView
            themes={themes}
            onCancel={() => setView("empty")}
            onDone={(draft) => {
              setCycle({ monthlyGoal: draft.monthlyGoal, actionPlan: draft.actionPlan, intake: draft.intake, reflection: "", status: "planning" });
              setView("draft");
            }}
            vision={vision}
            userId={userId}
          />
        )}

        {view === "draft" && cycle && (
          <DraftView
            cycle={cycle}
            setCycle={setCycle}
            userId={userId}
            onConfirm={async () => {
              await jpost(`/api/monthly-cycles`, {
                userId,
                ym,
                monthlyGoal: cycle.monthlyGoal,
                actionPlan: cycle.actionPlan,
                intake: cycle.intake,
                status: "active",
              });
              setCycle({ ...cycle, status: "active" });
              setView("home");
            }}
          />
        )}

        {view === "home" && cycle && (
          <HomeView
            ym={ym}
            vision={vision}
            cycle={cycle}
            setCycle={setCycle}
            userId={userId}
            onEditVision={() => setView("vision")}
          />
        )}
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 items-center justify-center p-8 text-sm text-slate-400">{children}</div>;
}

function PrimaryBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
    >
      {children}
    </button>
  );
}

// ── 空状態 ────────────────────────────────────────────────
function EmptyView({ ymLabel, hasVision, onStart, onEditVision }: { ymLabel: string; hasVision: boolean; onStart: () => void; onEditVision: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <div>
        <p className="text-lg font-bold">まだ{ymLabel}の目標がありません</p>
        <p className="mt-2 text-sm text-slate-500">
          いくつか選ぶだけで、AI が目標と
          <br />
          週ごとの動き方まで下書きします
        </p>
      </div>
      <div className="w-full">
        <PrimaryBtn onClick={onStart}>＋ {ymLabel}の目標を立てる</PrimaryBtn>
      </div>
      <button onClick={onEditVision} className="text-xs text-slate-400 underline">
        {hasVision ? "任期で成し遂げたいこと（ビジョン）を見直す" : "先に任期で成し遂げたいことを決める"}
      </button>
    </div>
  );
}

// ── 任期ビジョン(壁打ち) ──────────────────────────────────
function VisionView({ initial, onSave, onSkip }: { initial: string; onSave: (body: string) => void; onSkip: () => void }) {
  const [text, setText] = React.useState(initial);
  const [msgs, setMsgs] = React.useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function ask() {
    const userMsg = input.trim() || text.trim();
    if (!userMsg) return;
    const next = [...msgs, { role: "user" as const, content: userMsg }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    const res = await jpost<{ reply: string }>(`/api/ai/vision-coach`, { messages: next });
    setBusy(false);
    if (res?.reply) setMsgs([...next, { role: "assistant", content: res.reply }]);
  }

  return (
    <div className="flex flex-1 flex-col px-5 py-4">
      <p className="text-sm font-bold">任期で成し遂げたいこと</p>
      <p className="mt-1 text-xs text-slate-500">曖昧でも OK。AI と話しながら 1 文にしていきます。</p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="例: 空き家を活かして、移住者が住み続けられる仕組みを1つ残す"
        className="mt-3 h-24 w-full resize-none rounded-xl border border-slate-300 p-3 text-sm"
      />

      <div className="mt-3 flex-1 space-y-2 overflow-y-auto">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : ""}>
            <div
              className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-xs ${
                m.role === "user" ? "bg-slate-900 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              {m.content}
            </div>
            {m.role === "assistant" && (
              <button onClick={() => setText(m.content.replace(/^.*ビジョン案[:：]\s*/s, ""))} className="mt-1 block text-[11px] text-sky-600 underline">
                この内容を反映
              </button>
            )}
          </div>
        ))}
        {busy && <p className="text-xs text-slate-400">AI が考えています…</p>}
      </div>

      <div className="mt-2 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="AI に相談（例: 何から考えればいい?）"
          className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs"
        />
        <button onClick={ask} disabled={busy} className="rounded-xl bg-sky-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-40">
          相談
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        <button onClick={onSkip} className="rounded-xl px-4 py-3 text-sm text-slate-500">
          あとで
        </button>
        <div className="flex-1">
          <PrimaryBtn onClick={() => onSave(text.trim())} disabled={!text.trim()}>
            保存して目標づくりへ
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

// ── ヒアリング(3 ステップ) ────────────────────────────────
function HearingView({
  themes,
  vision,
  userId,
  onDone,
  onCancel,
}: {
  themes: string[];
  vision: string;
  userId?: string;
  onDone: (d: { monthlyGoal: string; actionPlan: WeekPlan[]; intake: Intake }) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = React.useState(1);
  const [theme, setTheme] = React.useState("");
  const [customTheme, setCustomTheme] = React.useState("");
  const [level, setLevel] = React.useState("");
  const [days, setDays] = React.useState(2);
  const [special, setSpecial] = React.useState("特になし");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");

  const effTheme = theme === "__custom" ? customTheme.trim() : theme;

  async function generate() {
    setBusy(true);
    setErr("");
    const intake: Intake = { theme: effTheme, level: LEVELS.find((l) => l.key === level)?.label ?? level, daysPerWeek: days, specialPlans: special === "特になし" ? [] : [special] };
    const res = await jpost<{ monthlyGoal: string; actionPlan: WeekPlan[] }>(`/api/ai/cycle-plan-gen`, { userId, ym: todayYm(), vision, intake });
    setBusy(false);
    if (!res?.actionPlan?.length) {
      setErr("うまく作れませんでした。もう一度お試しください。");
      return;
    }
    onDone({ monthlyGoal: res.monthlyGoal, actionPlan: res.actionPlan, intake });
  }

  return (
    <div className="flex flex-1 flex-col px-5 py-4">
      <div className="flex items-center justify-between">
        <button onClick={step === 1 ? onCancel : () => setStep(step - 1)} className="text-xs text-slate-400">
          ← 戻る
        </button>
        <span className="text-xs text-slate-400">{step} / 3</span>
      </div>

      {step === 1 && (
        <div className="flex flex-1 flex-col">
          <p className="mt-3 text-base font-bold">① 今月、力を入れるのは?</p>
          <div className="mt-4 flex-1 space-y-2">
            {themes.map((t) => (
              <Choice key={t} active={theme === t} onClick={() => setTheme(t)} label={t} />
            ))}
            <Choice active={theme === "__custom"} onClick={() => setTheme("__custom")} label="✏️ 自分で書く" />
            {theme === "__custom" && (
              <input
                value={customTheme}
                onChange={(e) => setCustomTheme(e.target.value)}
                placeholder="例: 子育て世帯の移住サポート"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            )}
          </div>
          <PrimaryBtn onClick={() => setStep(2)} disabled={!effTheme}>
            次へ
          </PrimaryBtn>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-1 flex-col">
          <p className="mt-3 text-base font-bold">② 今月はどこまで?</p>
          <p className="mt-1 text-xs text-slate-500">テーマ: {effTheme}</p>
          <div className="mt-4 flex-1 space-y-2">
            {LEVELS.map((l) => (
              <Choice key={l.key} active={level === l.key} onClick={() => setLevel(l.key)} label={l.label} sub={l.hint} />
            ))}
          </div>
          <PrimaryBtn onClick={() => setStep(3)} disabled={!level}>
            次へ
          </PrimaryBtn>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-1 flex-col">
          <p className="mt-3 text-base font-bold">③ 今月の動きやすさは?</p>
          <div className="mt-5">
            <p className="text-xs font-bold text-slate-500">週に動ける日数</p>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setDays(n)}
                  className={`h-10 flex-1 rounded-xl text-sm font-bold ${days === n ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 flex-1">
            <p className="text-xs font-bold text-slate-500">特別な予定</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SPECIAL.map((s) => (
                <button
                  key={s}
                  onClick={() => setSpecial(s)}
                  className={`rounded-full px-4 py-2 text-xs font-bold ${special === s ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          {err && <p className="mb-2 text-xs text-rose-500">{err}</p>}
          <PrimaryBtn onClick={generate} disabled={busy}>
            {busy ? "AI が作成中…" : "作成する"}
          </PrimaryBtn>
        </div>
      )}
    </div>
  );
}

function Choice({ active, onClick, label, sub }: { active: boolean; onClick: () => void; label: string; sub?: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl px-4 py-3 text-left ${active ? "bg-slate-900 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"}`}
    >
      <span className="text-sm font-bold">{label}</span>
      {sub && <span className={`mt-0.5 block text-xs ${active ? "text-slate-300" : "text-slate-400"}`}>{sub}</span>}
    </button>
  );
}

// ── ドラフト + 壁打ち ─────────────────────────────────────
function DraftView({
  cycle,
  setCycle,
  userId,
  onConfirm,
}: {
  cycle: Cycle;
  setCycle: (c: Cycle) => void;
  userId?: string;
  onConfirm: () => void;
}) {
  void userId;
  const [consult, setConsult] = React.useState(false);
  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-5 py-4">
      <p className="text-xs text-slate-400">AI の下書きです。気になるところは相談で直せます。</p>
      <div className="mt-3 rounded-xl bg-white p-4 ring-1 ring-slate-200">
        <p className="text-xs font-bold text-slate-400">今月の目標</p>
        <p className="mt-1 text-sm font-bold leading-relaxed">{cycle.monthlyGoal}</p>
      </div>

      <div className="mt-4 space-y-2">
        {cycle.actionPlan.map((w) => (
          <WeekCard key={w.week} w={w} />
        ))}
      </div>

      <button onClick={() => setConsult(true)} className="mt-4 w-full rounded-xl bg-sky-50 px-4 py-3 text-sm font-bold text-sky-700 ring-1 ring-sky-200">
        💬 AI に相談して直す（壁打ち）
      </button>

      <div className="mt-4 pb-2">
        <PrimaryBtn onClick={onConfirm}>この内容で確定する</PrimaryBtn>
      </div>

      {consult && (
        <ConsultSheet
          cycle={cycle}
          onClose={() => setConsult(false)}
          onApply={(plan) => setCycle({ ...cycle, actionPlan: plan })}
        />
      )}
    </div>
  );
}

function WeekCard({ w, onAdjust }: { w: WeekPlan; onAdjust?: () => void }) {
  return (
    <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold">
          <span className="text-slate-400">W{w.week}</span>　{w.title}
        </p>
        {onAdjust && (
          <button onClick={onAdjust} className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">
            調整
          </button>
        )}
      </div>
      <ul className="mt-1.5 space-y-0.5">
        {w.actions.map((a, i) => (
          <li key={i} className="text-xs text-slate-600">・{a}</li>
        ))}
      </ul>
      {w.checkPoint && <p className="mt-1.5 text-[11px] text-slate-400">✓ {w.checkPoint}</p>}
    </div>
  );
}

// ── 確定後ホーム ───────────────────────────────────────────
function HomeView({
  ym,
  vision,
  cycle,
  setCycle,
  userId,
  onEditVision,
}: {
  ym: string;
  vision: string;
  cycle: Cycle;
  setCycle: (c: Cycle) => void;
  userId?: string;
  onEditVision: () => void;
}) {
  const [editGoal, setEditGoal] = React.useState(false);
  const [goalText, setGoalText] = React.useState(cycle.monthlyGoal);
  const [adjustWeek, setAdjustWeek] = React.useState<number | null>(null);
  const [consult, setConsult] = React.useState(false);
  const [reflection, setReflection] = React.useState(cycle.reflection);

  async function save(patch: Partial<Cycle>) {
    const next = { ...cycle, ...patch };
    setCycle(next);
    await jpost(`/api/monthly-cycles`, { userId, ym, ...patch });
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-5 py-4">
      {vision && (
        <button onClick={onEditVision} className="mb-3 w-full rounded-lg bg-slate-100 px-3 py-2 text-left text-[11px] text-slate-500">
          🎯 任期: {vision}
        </button>
      )}

      <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400">{ymLabel(ym)}の目標</p>
          <button onClick={() => setEditGoal(!editGoal)} className="text-[11px] text-sky-600">
            {editGoal ? "閉じる" : "✏️ 編集"}
          </button>
        </div>
        {editGoal ? (
          <div className="mt-2">
            <textarea value={goalText} onChange={(e) => setGoalText(e.target.value)} className="h-20 w-full resize-none rounded-lg border border-slate-300 p-2 text-sm" />
            <button
              onClick={() => {
                save({ monthlyGoal: goalText });
                setEditGoal(false);
              }}
              className="mt-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white"
            >
              保存
            </button>
          </div>
        ) : (
          <p className="mt-1 text-sm font-bold leading-relaxed">{cycle.monthlyGoal}</p>
        )}
      </div>

      <button onClick={() => setConsult(true)} className="mt-3 w-full rounded-xl bg-sky-50 px-4 py-2.5 text-sm font-bold text-sky-700 ring-1 ring-sky-200">
        💬 プランを相談する（壁打ち）
      </button>

      <p className="mt-4 mb-2 text-xs font-bold text-slate-400">週ごとの動き</p>
      <div className="space-y-2">
        {cycle.actionPlan.map((w) => (
          <WeekCard key={w.week} w={w} onAdjust={() => setAdjustWeek(w.week)} />
        ))}
      </div>

      <div className="mt-5 border-t border-slate-200 pt-4">
        <p className="text-xs font-bold text-slate-400">月末の振り返り</p>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="今月どうだった? 来月に活かすことは?"
          className="mt-2 h-24 w-full resize-none rounded-xl border border-slate-300 p-3 text-sm"
        />
        <button
          onClick={() => save({ reflection, status: "done" })}
          className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white"
        >
          振り返りを保存
        </button>
      </div>

      {adjustWeek !== null && (
        <WeekSheet
          plan={cycle.actionPlan}
          week={adjustWeek}
          onClose={() => setAdjustWeek(null)}
          onSave={(plan) => {
            save({ actionPlan: plan });
            setAdjustWeek(null);
          }}
          onConsult={() => {
            setAdjustWeek(null);
            setConsult(true);
          }}
        />
      )}

      {consult && (
        <ConsultSheet cycle={cycle} onClose={() => setConsult(false)} onApply={(plan) => save({ actionPlan: plan })} />
      )}
    </div>
  );
}

// ── 週カード調整シート(手編集 + 入れ替え) ─────────────────
function WeekSheet({
  plan,
  week,
  onClose,
  onSave,
  onConsult,
}: {
  plan: WeekPlan[];
  week: number;
  onClose: () => void;
  onSave: (plan: WeekPlan[]) => void;
  onConsult: () => void;
}) {
  const idx = plan.findIndex((w) => w.week === week);
  const [draft, setDraft] = React.useState<WeekPlan>({ ...plan[idx] });

  function setActions(actions: string[]) {
    setDraft({ ...draft, actions });
  }
  function commit(reordered?: WeekPlan[]) {
    const base = reordered ?? plan.map((w) => (w.week === week ? draft : w));
    onSave(base);
  }
  // 隣の週と中身を入れ替える(日程をずらす)
  function swap(dir: -1 | 1) {
    const arr = plan.map((w) => (w.week === week ? draft : { ...w }));
    const i = arr.findIndex((w) => w.week === week);
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    const wi = arr[i].week;
    const wj = arr[j].week;
    arr[i].week = wj;
    arr[j].week = wi;
    arr.sort((a, b) => a.week - b.week);
    commit(arr);
  }

  return (
    <Overlay onClose={onClose}>
      <p className="text-sm font-bold">W{week} を調整</p>
      <input
        value={draft.title}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold"
      />

      <p className="mt-3 text-xs font-bold text-slate-400">やること</p>
      <div className="mt-1 space-y-1.5">
        {draft.actions.map((a, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={a}
              onChange={(e) => setActions(draft.actions.map((x, k) => (k === i ? e.target.value : x)))}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            />
            <button onClick={() => setActions(draft.actions.filter((_, k) => k !== i))} className="px-2 text-slate-400">
              ×
            </button>
          </div>
        ))}
        <button onClick={() => setActions([...draft.actions, ""])} className="text-xs text-sky-600">
          ＋ やることを追加
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={() => swap(-1)} disabled={idx === 0} className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 disabled:opacity-30">
          ↑ 前の週へ
        </button>
        <button onClick={() => swap(1)} disabled={idx === plan.length - 1} className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 disabled:opacity-30">
          ↓ 次の週へ
        </button>
      </div>

      <button onClick={onConsult} className="mt-2 w-full rounded-lg bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700 ring-1 ring-sky-200">
        💬 AI に相談（壁打ち）
      </button>

      <div className="mt-4 flex gap-2">
        <button onClick={onClose} className="rounded-xl px-4 py-3 text-sm text-slate-500">
          閉じる
        </button>
        <div className="flex-1">
          <PrimaryBtn onClick={() => commit()}>保存</PrimaryBtn>
        </div>
      </div>
    </Overlay>
  );
}

// ── プラン壁打ちシート ─────────────────────────────────────
function ConsultSheet({ cycle, onClose, onApply }: { cycle: Cycle; onClose: () => void; onApply: (plan: WeekPlan[]) => void }) {
  const [msgs, setMsgs] = React.useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [pending, setPending] = React.useState<WeekPlan[] | null>(null);

  async function send() {
    const msg = input.trim();
    if (!msg) return;
    setMsgs((m) => [...m, { role: "user", content: msg }]);
    setInput("");
    setBusy(true);
    const res = await jpost<{ reply: string; actionPlan: WeekPlan[] | null }>(`/api/ai/cycle-adjust-suggest`, {
      monthlyGoal: cycle.monthlyGoal,
      actionPlan: cycle.actionPlan,
      message: msg,
    });
    setBusy(false);
    if (res) {
      setMsgs((m) => [...m, { role: "assistant", content: res.reply }]);
      if (res.actionPlan && res.actionPlan.length) setPending(res.actionPlan);
    }
  }

  return (
    <Overlay onClose={onClose}>
      <p className="text-sm font-bold">プランを相談</p>
      <p className="mt-1 text-[11px] text-slate-400">例:「来週から出張。後ろ倒しにして」「W3 が重すぎる」</p>

      <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : ""}>
            <span
              className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-xs ${
                m.role === "user" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {m.content}
            </span>
          </div>
        ))}
        {busy && <p className="text-xs text-slate-400">AI が考えています…</p>}
      </div>

      {pending && (
        <button
          onClick={() => {
            onApply(pending);
            setPending(null);
            onClose();
          }}
          className="mt-2 w-full rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white"
        >
          この修正をプランに反映する
        </button>
      )}

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="相談を入力"
          className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs"
        />
        <button onClick={send} disabled={busy} className="rounded-xl bg-sky-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-40">
          送る
        </button>
      </div>
      <button onClick={onClose} className="mt-3 w-full text-center text-xs text-slate-400">
        閉じる
      </button>
    </Overlay>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={onClose}>
      <div className="mx-auto w-full max-w-md rounded-t-2xl bg-white p-5 pb-7" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
