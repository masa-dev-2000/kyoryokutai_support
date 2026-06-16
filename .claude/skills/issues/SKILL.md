---
name: issues
description: アイデア・疑問・修正依頼を素早くGitHub issueに登録する。「issueに残したい」「メモしておきたい」「あとで考えたい」などで自動ロード。
---

# Issues スキル — 軽量 issue 登録

思いついたことをすぐ issue に残す。ヒアリングや詳細設計はしない。

---

## フロー

### 1. 内容を1文で確認

ユーザーの入力から以下を抽出:
- **title**: 何をしたいか / 何が問題か(1行)
- **種別**: idea(アイデア) / question(疑問) / fix(修正依頼) / todo(作業メモ)

不明点があれば **1問だけ** AskUserQuestion で確認する。詳細は聞かない。

### 2. `mcp__github__issue_write` で登録

```
method: "create"
owner: "masa-dev-2000"
repo: "kyoryokutai_support"
title: <タイトル>
body: <本文>
```

### body テンプレート

```markdown
## 概要

<ユーザーの言葉をそのまま or 1〜2行で整理>

## メモ

<補足があれば。なければ省略>
```

### ラベル

| 種別 | label |
|---|---|
| アイデア・機能提案 | `enhancement` |
| 疑問・議論 | `question` |
| バグ・修正 | `bug` |
| 設計 | `design` |

### 3. 登録後

issue 番号と URL を返す。深堀りが必要なら「`/deepen #<番号>` で詳細を詰められます」と一言添える。

---

## 原則

- **速さ優先**: ヒアリングは最小限。登録してから考える。
- 完璧な issue より「あとで `/deepen` できる issue」を目指す。
