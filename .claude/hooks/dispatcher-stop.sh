#!/bin/bash
# Stop hook: 未着手(status:ready かつ role:*)issueを自動claimして次の実装サイクルへ継続させる。
# DISPATCHER_ACTIVE=1 を明示的に立てたセッションだけで動作する(通常の対話セッションには一切影響しない)。

[ -z "$DISPATCHER_ACTIVE" ] && exit 0

INPUT=$(cat /dev/stdin)

if command -v jq &>/dev/null; then
  TRANSCRIPT_PATH=$(echo "$INPUT" | jq -r '.transcript_path // ""')
else
  exit 0  # jq が無ければ安全側に倒して何もしない
fi

STATE_DIR="$(dirname "${BASH_SOURCE[0]}")/.."
STATE_FILE="$STATE_DIR/.dispatcher-state.json"
MAX_CONTINUATIONS=20

# === 二重チェック: 直前のツール呼び出しがAskUserQuestion/ExitPlanModeなら継続をブロックしない ===
if [ -n "$TRANSCRIPT_PATH" ] && [ -f "$TRANSCRIPT_PATH" ]; then
  LAST_TOOL=$(tail -n 30 "$TRANSCRIPT_PATH" | jq -rs '
    [.[] | select(.type=="assistant") | .message.content[]? | select(.type=="tool_use") | .name] | last // ""
  ' 2>/dev/null)
  if [ "$LAST_TOOL" = "AskUserQuestion" ] || [ "$LAST_TOOL" = "ExitPlanMode" ]; then
    exit 0
  fi
fi

# === 暴走防止: 連続継続回数のカウント ===
COUNT=0
if [ -f "$STATE_FILE" ]; then
  COUNT=$(jq -r '.count // 0' "$STATE_FILE" 2>/dev/null)
  [ -z "$COUNT" ] && COUNT=0
fi

if [ "$COUNT" -ge "$MAX_CONTINUATIONS" ]; then
  echo "ディスパッチャー: 連続継続回数が上限(${MAX_CONTINUATIONS}回)に達したため自動継続を停止しました。再開するには ${STATE_FILE} を削除してください。" >&2
  exit 0
fi

# === KIO設定からpr_accountを取得 ===
PR_ACCOUNT=$(grep -oP '`pr_account`:\s*`\K[^`]+' CLAUDE.md 2>/dev/null | head -1)
[ -z "$PR_ACCOUNT" ] && PR_ACCOUNT="masa-dev-2000"

# === 段階1: rework対象PR(自分作成・CHANGES_REQUESTED・status:blocked無し・却下2回未満) ===
REWORK=$(gh pr list --author "$PR_ACCOUNT" --search "is:open review:changes_requested" --json number,headRefName,labels,reviews --jq '
  [.[] | select(
    ([.labels[].name] | contains(["status:blocked"]) | not)
    and (([.reviews[] | select(.state=="CHANGES_REQUESTED")] | length) < 2)
  )] | sort_by(.number) | first
' 2>/dev/null)

if [ -n "$REWORK" ] && [ "$REWORK" != "null" ]; then
  NUM=$(echo "$REWORK" | jq -r '.number')
  BRANCH=$(echo "$REWORK" | jq -r '.headRefName')
  ROLE=$(echo "$BRANCH" | grep -oP '^feat/\K(super|admin|manager|member)(?=-)')

  if [ -n "$ROLE" ]; then
    NEW_COUNT=$((COUNT + 1))
    echo "{\"count\": $NEW_COUNT}" > "$STATE_FILE"
    REASON="PR #${NUM}(branch: ${BRANCH} / role:${ROLE})がCHANGES_REQUESTEDのreworkが対象です。Agent({subagent_type:'coding-loop-dev', isolation:'worktree', prompt:'role=${ROLE}, target=PR #${NUM}(rework)'})で修正させてください。完了したら次の未着手issue/PRを確認してください。"
    jq -n --arg reason "$REASON" '{"decision":"block","reason":$reason}'
    exit 0
  fi
fi

# === 段階2: 未着手issueの検索: status:ready かつ role:{member,admin,super,manager} かつ assignee無し ===
TARGET=$(gh issue list --state open --json number,title,labels,assignees --jq '
  [.[] | select(
    (.assignees | length) == 0
    and ([.labels[].name] | contains(["status:ready"]))
    and ([.labels[].name] | any(. == "role:member" or . == "role:admin" or . == "role:super" or . == "role:manager"))
  )] | sort_by(.number) | first
' 2>/dev/null)

if [ -z "$TARGET" ] || [ "$TARGET" = "null" ]; then
  exit 0
fi

NUM=$(echo "$TARGET" | jq -r '.number')
TITLE=$(echo "$TARGET" | jq -r '.title')
ROLE=$(echo "$TARGET" | jq -r '[.labels[].name] | map(select(startswith("role:"))) | first | sub("role:";"")')

gh issue edit "$NUM" --add-assignee "$PR_ACCOUNT" >&2 2>&1

NEW_COUNT=$((COUNT + 1))
echo "{\"count\": $NEW_COUNT}" > "$STATE_FILE"

REASON="issue #${NUM}(${TITLE} / role:${ROLE})をclaimしました。Agent({subagent_type:'coding-loop-dev', isolation:'worktree', prompt:'role=${ROLE}, target=issue #${NUM}'})で実装させてPRを作成してください。完了したら次の未着手issue/PRを確認してください。"

jq -n --arg reason "$REASON" '{"decision":"block","reason":$reason}'
exit 0
