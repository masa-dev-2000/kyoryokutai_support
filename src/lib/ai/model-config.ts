// 機能(task)ごとのモデル割り当て(ADR-016 拡張)。
//
// 解決の優先順位:
//   1) 機能別 env:  <PREFIX>_<TASK>   例) OPENAI_MODEL_CYCLE_PLAN_GEN=gpt-5
//   2) 全体 env:    <PREFIX>          例) OPENAI_MODEL=gpt-4o-mini
//   3) 既定(安い): fallback
//
// task のハイフンは env キーで _ に変換する(cycle-plan-gen → CYCLE_PLAN_GEN)。
// テスト中は全機能を安いモデル(fallback)で回し、品質を見たい機能だけ
// 機能別 env で上位モデルに上げて比較する、という運用を想定。
export function resolveModel(prefix: string, task: string | undefined, fallback: string): string {
  if (task) {
    const key = `${prefix}_${task.toUpperCase().replace(/-/g, "_")}`;
    const perTask = process.env[key];
    if (perTask) return perTask;
  }
  return process.env[prefix] ?? fallback;
}
