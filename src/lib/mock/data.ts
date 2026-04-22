import type { Route } from "next";

export type MockMember = {
  id: string;
  fullName: string;
  municipality: string;
  assignedAt: string;
  termEndAt: string;
  role: string;
  lastLogDate: string;
  thisMonthLogCount: number;
  currentMonthStatus: "submitted" | "approved" | "draft" | "none";
  avatarColor: string;
  initials: string;
};

export type MockDailyLog = {
  id: string;
  date: string;
  weekday: string;
  bodyMd: string;
  tags: string[];
  imageCount: number;
  hasVoice: boolean;
};

export type MockMonthlyReport = {
  yearMonth: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  aiGeneratedAt?: string;
  sourceLogCount: number;
  body: string;
};

export type MockAnnouncement = {
  id: string;
  title: string;
  body: string;
  authorName: string;
  createdAt: string;
  read: boolean;
};

export type MockMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
};

export const currentMember: MockMember = {
  id: "m1",
  fullName: "田中 あかり",
  municipality: "丹波篠山市",
  assignedAt: "2025-04-01",
  termEndAt: "2028-03-31",
  role: "移住促進・空き家バンク担当",
  lastLogDate: "2026-04-18",
  thisMonthLogCount: 18,
  currentMonthStatus: "draft",
  avatarColor: "bg-emerald-200 text-emerald-900",
  initials: "あか",
};

export const mockMembers: MockMember[] = [
  currentMember,
  {
    id: "m2",
    fullName: "山本 健一",
    municipality: "養父市",
    assignedAt: "2024-10-01",
    termEndAt: "2027-09-30",
    role: "農業支援",
    lastLogDate: "2026-04-17",
    thisMonthLogCount: 15,
    currentMonthStatus: "draft",
    avatarColor: "bg-amber-200 text-amber-900",
    initials: "健",
  },
  {
    id: "m3",
    fullName: "佐藤 美咲",
    municipality: "朝来市",
    assignedAt: "2025-07-01",
    termEndAt: "2028-06-30",
    role: "観光・インバウンド",
    lastLogDate: "2026-04-15",
    thisMonthLogCount: 12,
    currentMonthStatus: "submitted",
    avatarColor: "bg-sky-200 text-sky-900",
    initials: "美",
  },
  {
    id: "m4",
    fullName: "鈴木 悠人",
    municipality: "丹波篠山市",
    assignedAt: "2023-04-01",
    termEndAt: "2026-03-31",
    role: "教育・子育て連携",
    lastLogDate: "2026-04-05",
    thisMonthLogCount: 4,
    currentMonthStatus: "none",
    avatarColor: "bg-rose-200 text-rose-900",
    initials: "悠",
  },
  {
    id: "m5",
    fullName: "木村 桜",
    municipality: "丹波篠山市",
    assignedAt: "2024-04-01",
    termEndAt: "2027-03-31",
    role: "広報・情報発信",
    lastLogDate: "2026-04-18",
    thisMonthLogCount: 20,
    currentMonthStatus: "approved",
    avatarColor: "bg-violet-200 text-violet-900",
    initials: "桜",
  },
];

export const mockDailyLogs: MockDailyLog[] = [
  {
    id: "l1",
    date: "2026-04-18",
    weekday: "金",
    bodyMd: [
      "午前: 空き家バンク登録2件の現地確認(篠山地区)",
      "午後: 地元農家3軒と山の芋の販路打合せ",
      "夕方: 移住相談(大阪在住30代夫婦)1件",
    ].join("\n"),
    tags: ["移住促進", "空き家バンク", "農業"],
    imageCount: 3,
    hasVoice: false,
  },
  {
    id: "l2",
    date: "2026-04-17",
    weekday: "木",
    bodyMd: [
      "空き家バンクシート更新4件分",
      "神戸市内レストランへの山の芋サンプル発送",
    ].join("\n"),
    tags: ["空き家バンク", "販路開拓"],
    imageCount: 0,
    hasVoice: true,
  },
  {
    id: "l3",
    date: "2026-04-16",
    weekday: "水",
    bodyMd: [
      "移住者向け地域オリエンテーション準備",
      "市役所と次月の広報誌寄稿について打合せ",
    ].join("\n"),
    tags: ["移住促進", "行政連携", "広報・情報発信"],
    imageCount: 1,
    hasVoice: false,
  },
  {
    id: "l4",
    date: "2026-04-15",
    weekday: "火",
    bodyMd: "終日 外部研修(神戸)に参加。空き家活用事例の情報収集。",
    tags: ["研修・学習", "空き家バンク"],
    imageCount: 0,
    hasVoice: false,
  },
  {
    id: "l5",
    date: "2026-04-14",
    weekday: "月",
    bodyMd: [
      "空き家所有者3軒訪問、内2軒で登録同意取得",
      "夕方から移住検討者のオンライン相談 45 分",
    ].join("\n"),
    tags: ["空き家バンク", "移住促進", "相談対応"],
    imageCount: 2,
    hasVoice: false,
  },
];

export const mockMonthlyReport: MockMonthlyReport = {
  yearMonth: "2026-04",
  status: "draft",
  aiGeneratedAt: "2026-04-20T13:22:00+09:00",
  sourceLogCount: 18,
  body: `## 1. 活動サマリ

4月は移住促進と地場農産物の販路開拓を軸に活動した。空き家バンク登録6件、移住相談4件(うち現地案内2件)、農家ヒアリング12軒を実施。

## 2. 個別活動の詳細

### 移住促進
- 空き家バンク新規登録: 6件(篠山地区4件、大山地区2件)
- 移住相談対応: 4件(大阪2、東京1、神戸1)
- 現地案内: 2組実施。うち1組は6月移住予定

### 農業・販路
- 山の芋生産者12軒訪問、販路と価格の現状ヒアリング
- 神戸市内レストラン2店舗と直接取引打診(1店舗仮決定)

## 3. 成果物
- 空き家バンク情報シート × 6
- 山の芋生産者マップ(初稿)

## 4. 来月計画
- レストラン取引の本契約(5月中旬)
- 移住1組の受け入れ準備
- 地域イベント(5/18)での販路告知

## 5. 所感・課題
空き家所有者の高齢化により、登録交渉に時間がかかるケースが増加。司法書士との連携体制を整えたい。`,
};

export const mockAnnouncements: MockAnnouncement[] = [
  {
    id: "a1",
    title: "5月の全体ミーティングについて",
    body: "5月22日(金) 14:00〜 市役所4階大会議室で開催します。議題は上半期活動方針。",
    authorName: "山田 総務課長",
    createdAt: "2026-04-19T10:30:00+09:00",
    read: false,
  },
  {
    id: "a2",
    title: "月次報告様式の一部変更について",
    body: "活動費の内訳シートを新様式に差し替えました。5月分からの適用となります。",
    authorName: "山田 総務課長",
    createdAt: "2026-04-16T14:00:00+09:00",
    read: false,
  },
  {
    id: "a3",
    title: "兵庫県主催 協力隊交流会のご案内",
    body: "6月7日(土) 神戸ハーバーランドで開催。県内隊員の参加希望者はフォームからお申込ください。",
    authorName: "山田 総務課長",
    createdAt: "2026-04-10T09:15:00+09:00",
    read: true,
  },
];

export const mockMessages: MockMessage[] = [
  {
    id: "c1",
    senderId: "staff1",
    body: "今月の中間レポート、共有ありがとうございます。今週のどこかでキャッチアップしませんか?",
    createdAt: "2026-04-18T09:12:00+09:00",
  },
  {
    id: "c2",
    senderId: "m1",
    body: "ありがとうございます。金曜日の午前中でしたら、いつでも大丈夫です。",
    createdAt: "2026-04-18T09:20:00+09:00",
  },
  {
    id: "c3",
    senderId: "staff1",
    body: "了解です。10時から30分ほどいかがでしょう?",
    createdAt: "2026-04-18T09:25:00+09:00",
  },
];

export const tagOptions: string[] = [
  "移住促進",
  "空き家バンク",
  "農業",
  "林業",
  "観光",
  "教育・子育て",
  "地域イベント",
  "行政連携",
  "販路開拓",
  "広報・情報発信",
  "相談対応",
  "研修・学習",
];

export type NavLink = {
  href: Route;
  label: string;
  icon: "home" | "log" | "report" | "bell" | "chat" | "settings" | "dashboard" | "users" | "megaphone";
};

export const memberNav: NavLink[] = [
  { href: "/me", label: "ホーム", icon: "home" },
  { href: "/me/logs", label: "日報", icon: "log" },
  { href: "/me/reports", label: "レポート", icon: "report" },
  { href: "/me/chat", label: "連絡", icon: "chat" },
];

export function formatJstDate(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export function statusBadge(status: MockMember["currentMonthStatus"]) {
  switch (status) {
    case "approved":
      return { label: "承認済", className: "bg-emerald-100 text-emerald-800" };
    case "submitted":
      return { label: "提出済", className: "bg-sky-100 text-sky-800" };
    case "draft":
      return { label: "ドラフト", className: "bg-amber-100 text-amber-800" };
    case "none":
      return { label: "未着手", className: "bg-rose-100 text-rose-800" };
  }
}
