// Repository パターン(載せ替え 10 か条 #2)。
// API Route / Server Action は SQL を書かず、この Repos 経由でのみ DB に触れる。
// Phase 2 で DB_PROVIDER=supabase に切り替えれば全ルート無改修で RDS/Supabase へ移行できる。
//
// 返り値はフロント既存の DTO(mappers の戻り値型)に揃える。

import type {
  mapLog,
  mapDailyLog,
  mapReport,
  mapExpense,
  mapCase,
  mapApproval,
  mapNotice,
  mapMember,
  mapStaff,
  mapVision,
  mapMonthlyCycle,
  WeekPlan,
  CycleIntake,
} from "@/lib/api/mappers";

export type ActivityLogDTO = ReturnType<typeof mapLog>;
export type DailyLogDTO = ReturnType<typeof mapDailyLog>;
export type ReportDTO = ReturnType<typeof mapReport>;
export type ExpenseDTO = ReturnType<typeof mapExpense>;
export type CaseDTO = ReturnType<typeof mapCase>;
export type ApprovalDTO = ReturnType<typeof mapApproval>;
export type NoticeDTO = ReturnType<typeof mapNotice>;
export type MemberDTO = ReturnType<typeof mapMember>;
export type StaffDTO = ReturnType<typeof mapStaff>;
export type VisionDTO = ReturnType<typeof mapVision>;
export type MonthlyCycleDTO = ReturnType<typeof mapMonthlyCycle>;
export type { WeekPlan, CycleIntake };

export type TrendDTO = { id: string; title: string; count: number };
export type HostOrgDTO = { id: string; name: string; kind?: string; contactUserId?: string };
export type RouteStepDTO = {
  id?: string;
  stepNo: number;
  approverType: "dept" | "host_org" | "admin";
  approverLabel: string;
  department?: string;
  hostOrganizationId?: string;
};
export type RouteDTO = { id: string; name: string; kind: string; isDefault: boolean; steps: RouteStepDTO[] };

// AI 月報生成プロンプト用の生ログ
export type LogForAI = {
  activity_type: string;
  topic: string;
  hours: number;
  body: string;
  log_date: string;
  expense_amount: number | null;
};

// 承認の状態遷移に必要な生フィールド
export type ApprovalRaw = {
  id: string;
  kind: string;
  steps: string; // JSON
  current_step: number;
  status: string;
  target_table: string | null;
  target_id: string | null;
};

export type GuidelineRow = { source: string; section: string; body: string };

export type SuperMuniRow = {
  id: string;
  name: string;
  prefecture: string;
  members: number;
  managers: number;
  admins: number;
  activityLogs: number;
};
export type SuperOverview = {
  municipalities: SuperMuniRow[];
  totals: { municipalities: number; members: number; managers: number; admins: number; supers: number };
};

export interface Repos {
  users: {
    count(): Promise<number>;
    nameOf(id: string): Promise<string | undefined>;
    getProfile(id: string): Promise<{ name: string; municipality: string; bio?: string; assigned_at?: string } | null>;
  };
  super: {
    overview(): Promise<SuperOverview>;
    /** #65: 運営者が自治体を新規作成 */
    createMunicipality(m: { name: string; prefecture: string; annualBudget?: number }): Promise<{ id: string; name: string; prefecture: string }>;
    /** #65: 指定自治体の admin を pre-provision + 招待トークン発行(url は Route 側で付与) */
    createAdminInvite(a: { municipalityId: string; email: string; name: string; createdBy: string }): Promise<{ token: string; expiresAt: string }>;
  };
  members: {
    list(): Promise<MemberDTO[]>;
    upsert(m: { id?: string; name: string; role: string; startedAt?: string; term?: string }): Promise<MemberDTO>;
    retire(id: string): Promise<void>;
  };
  staff: {
    list(): Promise<StaffDTO[]>;
    upsert(s: { id?: string; name: string; title?: string; dept: string; email?: string }): Promise<StaffDTO>;
    remove(id: string): Promise<void>;
  };
  assignments: {
    map(): Promise<Record<string, string[]>>;
    replace(staffId: string, memberIds: string[]): Promise<void>;
  };
  hostOrgs: {
    list(): Promise<HostOrgDTO[]>;
    upsert(h: { id?: string; name: string; kind?: string; contactUserId?: string }): Promise<HostOrgDTO>;
    remove(id: string): Promise<void>;
  };
  routes: {
    list(): Promise<RouteDTO[]>;
    create(r: { name: string; kind: string; isDefault?: boolean; steps: RouteStepDTO[] }): Promise<RouteDTO | undefined>;
    remove(id: string): Promise<void>;
  };
  topics: {
    list(userId: string, kind?: string): Promise<string[]>;
    add(userId: string, name: string, kind?: string): Promise<string[]>;
    remove(userId: string, name: string, kind?: string): Promise<string[]>;
  };
  activityLogs: {
    listByUser(userId: string): Promise<ActivityLogDTO[]>;
    create(l: {
      userId: string;
      dailyLogId?: string;
      type: string;
      topic: string;
      hours: number;
      startTime?: string;
      endTime?: string;
      body: string;
      date?: string;
      time?: string;
    }): Promise<ActivityLogDTO>;
    update(id: string, patch: {
      type?: string;
      topic?: string;
      hours?: number;
      startTime?: string;
      endTime?: string;
      body?: string;
      date?: string;
      time?: string;
    }): Promise<ActivityLogDTO | undefined>;
    delete(id: string): Promise<void>;
    listForAI(userId: string, ym: string): Promise<LogForAI[]>;
  };
  expenses: {
    listByUser(userId: string): Promise<ExpenseDTO[]>;
    create(e: { userId: string; title: string; amount: number; purpose: string; status?: string; category?: string; dailyLogId?: string }): Promise<ExpenseDTO>;
    /** 日報経由(ADR-014 動線①):activity_log と source_receipt_index で紐付け、二重申請防止 */
    createFromLog(e: {
      userId: string;
      activityLogId: string;
      receiptIndex: number;
      title: string;
      amount: number;
      purpose: string;
      hasReceipt: boolean;
      status?: string;
    }): Promise<ExpenseDTO>;
    update(id: string, patch: { status?: string; amountSettled?: number; hasReceipt?: boolean; settleNote?: string }): Promise<ExpenseDTO | undefined>;
  };
  monthlyReports: {
    listByUser(userId: string): Promise<ReportDTO[]>;
    markApproved(id: string): Promise<void>;
    /** 活動報告を編集/削除した場合、同月の承認済み月報を「提出済」に差し戻す */
    revertToSubmitted(userId: string, ym: string): Promise<void>;
  };
  approvals: {
    listPending(muni: string): Promise<ApprovalDTO[]>;
    getRaw(id: string): Promise<ApprovalRaw | undefined>;
    updateState(id: string, steps: unknown[], currentStep: number, status: string): Promise<void>;
    getById(id: string): Promise<ApprovalDTO | undefined>;
    enqueue(a: {
      muni: string;
      kind: string;
      applicantId: string;
      memberName: string;
      title: string;
      ai: string;
      detail: unknown;
      routeName: string;
      steps: unknown[];
      targetTable: string;
      targetId: string;
    }): Promise<void>;
  };
  announcements: {
    list(muni: string, kinds?: string[]): Promise<NoticeDTO[]>;
    create(a: {
      senderId?: string;
      senderName?: string;
      kind?: string;
      isPinned?: boolean;
      title?: string;
      body: string;
      targets?: number;
    }): Promise<NoticeDTO>;
    markRead(announcementId: string, userId: string): Promise<void>;
  };
  cases: {
    listWithTrend(): Promise<{ cases: CaseDTO[]; trend: TrendDTO[] }>;
  };
  guidelines: {
    listByMuni(muni: string): Promise<GuidelineRow[]>;
  };
  dailyLogs: {
    listByUser(userId: string): Promise<DailyLogDTO[]>;
    upsert(userId: string, date: string, fields?: {
      note?: string;
      distanceKm?: number;
      expenseAmount?: number;
      feelingScore?: number;
    }): Promise<DailyLogDTO>;
    getByDate(userId: string, date: string): Promise<DailyLogDTO | undefined>;
  };
  consultations: {
    log(c: { userId: string; contextKind: string; input: string; output: string }): Promise<void>;
  };
  // ADR-024: 任期ビジョン(隊員 1 人 1 レコード)
  visions: {
    get(userId: string): Promise<VisionDTO | null>;
    upsert(userId: string, body: string): Promise<VisionDTO>;
  };
  // ADR-024: 月次サイクル(目標 + 週次アクションプラン + 振り返り)
  monthlyCycles: {
    getByMonth(userId: string, ym: string): Promise<MonthlyCycleDTO | null>;
    listByUser(userId: string): Promise<MonthlyCycleDTO[]>;
    upsert(userId: string, ym: string, fields: {
      monthlyGoal?: string;
      actionPlan?: WeekPlan[];
      intake?: CycleIntake | null;
      reflection?: string;
      status?: string;
    }): Promise<MonthlyCycleDTO>;
  };
}
