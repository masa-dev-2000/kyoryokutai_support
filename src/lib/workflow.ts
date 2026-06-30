// 多段階承認の展開・遷移ロジック(ADR-012 / ADR-015)。
// クライアント状態機械をサーバへ移植したもの。

import type { RouteDTO } from "@/lib/db/repositories/types";

export type ApproverType = "dept" | "host_org" | "admin";
export type StepStatus = "waiting" | "pending" | "approved" | "rejected";
export type ApprovalStep = {
  approverType: ApproverType;
  approverLabel: string;
  status: StepStatus;
  comment?: string;
  decidedAt?: string;
};

// kind ごとの既定ルートを展開(隊員ごとのカスタムは Year 2)。
export function expandRoute(kind: string, deptLabel = "担当課"): { routeName: string; steps: ApprovalStep[] } {
  if (kind === "月次報告") {
    return {
      routeName: `${deptLabel} → 企画課`,
      steps: [
        { approverType: "dept", approverLabel: deptLabel, status: "pending" },
        { approverType: "admin", approverLabel: "企画課", status: "waiting" },
      ],
    };
  }
  if (kind === "経費") {
    return {
      routeName: `${deptLabel} → 企画課`,
      steps: [
        { approverType: "dept", approverLabel: deptLabel, status: "pending" },
        { approverType: "admin", approverLabel: "企画課", status: "waiting" },
      ],
    };
  }
  // 活動相談 等
  return {
    routeName: "企画課のみ",
    steps: [{ approverType: "admin", approverLabel: "企画課", status: "pending" }],
  };
}

/** 隊員に割り当てられたルート(RouteDTO)を承認ステップ列に展開(ADR-012 隊員ごと割当)。 */
export function expandAssignedRoute(route: RouteDTO): { routeName: string; steps: ApprovalStep[] } {
  const sorted = [...route.steps].sort((a, b) => a.stepNo - b.stepNo);
  const steps: ApprovalStep[] = sorted.map((s, i) => ({
    approverType: s.approverType,
    approverLabel: s.approverLabel,
    status: i === 0 ? "pending" : "waiting",
  }));
  return { routeName: sorted.map((s) => s.approverLabel).join(" → "), steps };
}

const today = () =>
  new Date().toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });

// 承認:現ステップを approved に。次があれば pending、無ければ全体 approved。
export function applyApprove(steps: ApprovalStep[], currentStep: number) {
  const next = steps.map((s, i) =>
    i === currentStep ? { ...s, status: "approved" as StepStatus, decidedAt: today() } : s
  );
  if (currentStep + 1 < next.length) {
    next[currentStep + 1] = { ...next[currentStep + 1], status: "pending" };
    return { steps: next, currentStep: currentStep + 1, status: "pending" as const };
  }
  return { steps: next, currentStep: next.length, status: "approved" as const };
}

// 差戻し:現ステップを rejected(コメント必須)→ 全体差戻し。
export function applyReject(steps: ApprovalStep[], currentStep: number, comment: string) {
  const next = steps.map((s, i) =>
    i === currentStep ? { ...s, status: "rejected" as StepStatus, comment, decidedAt: today() } : s
  );
  return { steps: next, currentStep, status: "rejected" as const };
}
