---
name: github-issue
description: GitHub に issue を作成する。「issueを作って」「issueを登録」「バグを報告」などで自動ロード。
---

# GitHub Issue 作成スキル

リポジトリ: `masa-dev-2000/kyoryokutai_support`

## 使い方

ユーザーが issue の内容(タイトル・説明)を伝えたら、以下の手順で登録する。

### 1. 内容を整理する

会話から以下を抽出・補完する:

| 項目 | 内容 |
|---|---|
| **title** | 1行で問題/要望を表す日本語タイトル |
| **body** | 背景・現状・提案・実装メモを Markdown で記述 |
| **labels** | `bug` / `enhancement` / `design` / `question` から選択(任意) |

### 2. `mcp__github__issue_write` で作成する

```
method: "create"
owner: "masa-dev-2000"
repo: "kyoryokutai_support"
title: <タイトル>
body: <本文>
labels: [<ラベル>]
```

### body のテンプレート

```markdown
## 背景・課題

<なぜこの変更が必要か>

## 現状

<今どうなっているか>

## 提案

<どう変えるか>

## 実装メモ

<技術的な詳細・影響範囲>
```

### ラベルの選び方

| ラベル | 使う場面 |
|---|---|
| `bug` | 動作がおかしい |
| `enhancement` | 機能追加・改善 |
| `design` | UI/UX・データモデル設計 |
| `question` | 議論・確認事項 |

## 注意

- issue 番号は作成後に返ってくる URL から確認できる
- ラベルが存在しない場合はエラーになるので省略する
