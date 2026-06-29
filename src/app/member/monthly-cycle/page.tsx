import { MonthlyCycleApp } from "./_app";

// ADR-024: 月次サイクル(目標 + アクションプラン)。
// 独立フィーチャーとして単体完結。後で member タブへ統合する。
export default function MonthlyCyclePage() {
  return <MonthlyCycleApp />;
}
