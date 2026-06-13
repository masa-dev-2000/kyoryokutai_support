import type { AIProvider, AIGenerateOptions } from "./types";

// Mock プロバイダ。外部依存ゼロで動く決定論的フォールバック。
// Ollama を入れられない環境(このサンドボックス等)でも end-to-end が動くようにする。
// task 別にそれらしい日本語を返すので、UI の見た目は実プロバイダと変わらない。

function lastUser(opts: AIGenerateOptions): string {
  const u = [...opts.messages].reverse().find((m) => m.role === "user");
  return u?.content ?? "";
}

export class MockProvider implements AIProvider {
  readonly name = "mock";
  readonly model = "mock-1";

  async generate(opts: AIGenerateOptions): Promise<string> {
    const input = lastUser(opts);
    const head = input.slice(0, 60);

    switch (opts.task) {
      case "consult-daily-write":
        return [
          "【整理案】",
          input ? `元の文章: ${head}...\n` : "",
          "・When: 日付・時間帯を明示",
          "・Where: 場所(具体的な施設名 / 地区名)",
          "・Who: 同席者・キーパーソン",
          "・What: 何をやったか(動詞で)",
          "・Why: 目的・背景",
          "・How: 次に繋げる方向",
          "",
          "例:「6/11 午後、A 邸で移住希望の家族と内覧を実施。築 80 年だが構造良好。次回 6/15 に再訪し改修範囲を確定」",
        ].filter(Boolean).join("\n");

      case "consult-report-plan":
        return [
          "【来月計画の提案】",
          input ? `元の計画: ${head}...\n` : "",
          "・継続: 進行中プロジェクトのマイルストーンを明示(空き家バンク累計目標 等)",
          "・新規: 今月の手応えから次に試す施策(移住者向け体験ツアー 等)",
          "・振り返り: 中間レビュー / KPI 確認の時期を 1 つ入れる",
          "",
          "各 2 行ずつだと役場側が読みやすいです。",
        ].filter(Boolean).join("\n");

      case "consult-expense-purpose":
        return [
          "【用途の整理案】",
          input ? `元の文章: ${head}...\n` : "",
          "・目的: 何を達成したいか(KPI に対応する形で)",
          "・必要性: なぜ別の手段ではダメか",
          "・効果: 数値で見込みを書く(参加者 N 名 / 相談 N 件 等)",
          "・前例: 類似事例で承認実績があるかに触れる",
          "",
          "類似事例:「海士町 古民家コワーキング(2024)」が JOIN の Q&A に掲載されています。",
        ].filter(Boolean).join("\n");

      case "consult-case-find":
        return [
          "【見つけた候補】",
          input ? `相談内容: ${head}...\n` : "",
          "・養父市:「空き家バンクで 1 年目 12 件登録」",
          "・海士町:「空き家清掃ボランティアの定着」",
          "・JOIN:「DIY 補助金との組み合わせ」",
          "",
          "事例タブの検索から詳細を確認できます。",
        ].filter(Boolean).join("\n");

      case "monthly-report": {
        return [
          "## 活動サマリ",
          "今月は現場訪問と関係機関との連携を中心に活動した。空き家対応と移住相談が主軸。",
          "",
          "## 個別活動の詳細",
          "・空き家:内覧・所有者調整を複数件実施",
          "・移住相談:Web 会議および現地調整",
          "・広報:町報の特集記事ドラフト",
          "",
          "## 成果物",
          "・町報特集記事ドラフト",
          "・空き家内覧記録",
          "",
          "## 来月計画",
          "・夏祭り当日の運営",
          "・移住者向け体験ツアー初回開催",
          "",
          "## 所感・課題",
          "現地での移動手段に課題。レンタカー手配のサポートを検討したい。",
          "",
          "_(mock provider が活動ログから生成。Ollama 接続時は実モデルが生成します)_",
        ].join("\n");
      }

      case "expense-title": {
        // 用途文の先頭から短いタイトルを作る(コミットメッセージ流)
        const cleaned = input.replace(/^用途\s*[::]\s*/, "").replace(/\n[\s\S]*$/, "");
        const firstLine = cleaned.split(/[。、]/)[0]?.trim() ?? "";
        const title = firstLine.length > 0 ? firstLine.slice(0, 15) : "活動経費";
        return title;
      }

      case "expense-check":
        return JSON.stringify({
          aiNote:
            "活動費の趣旨に沿う可能性が高い申請です。目的・必要性は明確。金額は過去の類似申請の範囲内。最終判断は担当課で。",
          citations: [
            { source: "新温泉町 活動費ガイドライン v2.1", quote: "広報物・活動拠点に関わる費用は活動費の対象に含まれます。" },
          ],
        });

      default:
        return input ? `(mock 応答)\n${head}...` : "(mock 応答)";
    }
  }

  async health(): Promise<{ ok: boolean; detail: string }> {
    return { ok: true, detail: "mock provider(外部依存なし)" };
  }
}
