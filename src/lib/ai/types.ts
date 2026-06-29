// AI プロバイダ抽象(ADR-016)
// Ollama / Anthropic / Mock を同一インタフェースで差し替え可能にする。

export type AIRole = "system" | "user" | "assistant";

export type AIMessage = { role: AIRole; content: string };

export type AIGenerateOptions = {
  /** mock プロバイダがそれらしい返答を返すためのタスク識別子。実プロバイダは無視。 */
  task?:
    | "consult-daily-write"
    | "consult-report-plan"
    | "consult-expense-purpose"
    | "consult-case-find"
    | "polish-memo"
    | "monthly-report"
    | "expense-title"
    | "expense-check"
    | "vision-coach"
    | "cycle-plan-gen"
    | "cycle-adjust-suggest"
    | "generic";
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  /** JSON 出力を期待する場合 true(プロバイダが対応していれば format を指定) */
  json?: boolean;
};

export interface AIProvider {
  /** "ollama" | "anthropic" | "mock" */
  readonly name: string;
  /** モデル識別子(ログ・デバッグ用) */
  readonly model: string;
  generate(opts: AIGenerateOptions): Promise<string>;
  /** プロバイダの疎通確認(Ollama 起動チェック等)。失敗時は理由を投げる。 */
  health(): Promise<{ ok: boolean; detail: string }>;
}
