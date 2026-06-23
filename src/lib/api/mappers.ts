// DB 行(snake_case)→ フロント既存の型(camelCase)へ変換。
// 既存コンポーネントを書き換えずに済むよう、形を完全一致させる。

type Row = Record<string, unknown>;
const j = <T>(s: unknown, fallback: T): T => {
  if (typeof s !== "string" || !s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
};

export function mapLog(r: Row) {
  return {
    id: r.id as string,
    type: r.activity_type as string,
    topic: r.topic as string,
    hours: r.hours as number,
    startTime: (r.start_time as string | null) ?? undefined,
    endTime: (r.end_time as string | null) ?? undefined,
    body: r.body as string,
    date: r.log_date as string,
    time: r.log_time as string,
  };
}

export function mapDailyLog(r: Row) {
  return {
    id: r.id as string,
    date: r.log_date as string,
    note: (r.note as string) ?? undefined,
    distanceKm: (r.distance_km as number | null) ?? undefined,
    expenseAmount: (r.expense_amount as number | null) ?? undefined,
    feelingScore: (r.feeling_score as number | null) ?? undefined,
  };
}

export function mapReport(r: Row) {
  const status = r.status as string;
  const ym = r.year_month as string;
  const [y, m] = ym.split("-");
  return {
    id: r.id as string,
    yearMonth: `${y} 年 ${Number(m)} 月`,
    ym,
    status,
    statusLabel: (r.status_label as string) ?? "",
  };
}

export function mapExpense(r: Row) {
  const citations = j<{ source: string; quote: string }[]>(r.citations, []);
  return {
    id: r.id as string,
    title: r.title as string,
    amount: r.amount_requested as number,
    purpose: r.purpose as string,
    status: r.status as string,
    category: (r.category as string | null) ?? "活動費",  // ADR-021
    aiNote: (r.ai_note as string) ?? "",
    citation: citations[0] ?? { source: "", quote: "" },
    createdAt: (r.created_at as string)?.slice(0, 10) ?? "",
    hasReceipt: !!(r.has_receipt as number),
    expenseKind: r.expense_kind as string,
    parentExpenseId: (r.parent_expense_id as string | null) ?? undefined,
  };
}

export function mapCase(r: Row) {
  return {
    id: r.id as string,
    title: r.title as string,
    area: r.area as string,
    year: r.year as string,
    author: r.author as string,
    sourceUserId: (r.source_user_id as string) ?? null,
    summary: r.summary as string,
    kpi: (r.kpi as string) ?? "",
    effect: (r.effect as string) ?? "",
    process: j<{ phase: string; body: string }[]>(r.process, []),
    learning: (r.learning as string) ?? "",
  };
}

export function mapApproval(r: Row) {
  return {
    id: r.id as string,
    kind: r.kind as "経費" | "月次報告" | "活動相談",
    member: r.member_name as string,
    title: r.title as string,
    ai: (r.ai as string) ?? "",
    citations: j<{ source: string; quote: string }[]>(r.citations, []),
    detail: j<Record<string, unknown>>(r.detail, {}),
    routeName: r.route_name as string,
    steps: j<unknown[]>(r.steps, []),
    currentStep: r.current_step as number,
  };
}

export function mapNotice(r: Row) {
  return {
    id: r.id as string,
    title: r.title as string,
    body: r.body as string,
    date: (r.sent_at as string)?.slice(5) ?? "",
    kind: r.kind as string,
    isPinned: !!(r.is_pinned as number),
    sender: (r.sender_name as string) ?? "",
    targets: r.target_count as number,
    read: (r.read_count as number) ?? 0,
  };
}

export function mapMember(r: Row) {
  return {
    id: r.id as string,
    name: r.name as string,
    role: (r.role_label as string) ?? "",
    startedAt: (r.started_at as string) ?? "未設定",
    term: (r.term as string) ?? "1 年目",
  };
}

export function mapStaff(r: Row) {
  return {
    id: r.id as string,
    name: r.name as string,
    title: (r.title as string) ?? "職員",
    dept: (r.department as string) ?? "",
    email: (r.email as string) ?? "",
  };
}
