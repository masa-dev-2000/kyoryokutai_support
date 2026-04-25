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
  icon: "home" | "log" | "report" | "bell" | "chat" | "settings" | "dashboard" | "users" | "megaphone" | "phone" | "cases" | "assistant";
};

export const memberNav: NavLink[] = [
  { href: "/me", label: "ホーム", icon: "home" },
  { href: "/me/logs", label: "日報", icon: "log" },
  { href: "/me/reports", label: "レポート", icon: "report" },
  { href: "/me/chat", label: "連絡", icon: "phone" },
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

// ================== 担当課ハブ(Issue #11) ==================
export type MockContact = {
  id: string;
  name: string;
  department: string;
  role: string;
  phone: string;
  email: string;
  avatarColor: string;
  initials: string;
};

export const mockContacts: MockContact[] = [
  {
    id: "staff1",
    name: "山田 総務課長",
    department: "総務課",
    role: "主担当 / 活動費・勤務管理",
    phone: "079-123-4567",
    email: "yamada@example.lg.jp",
    avatarColor: "bg-slate-200 text-slate-700",
    initials: "山",
  },
  {
    id: "staff2",
    name: "佐藤 係長",
    department: "農林振興課",
    role: "活動連携 / 事業調整",
    phone: "079-123-4568",
    email: "sato@example.lg.jp",
    avatarColor: "bg-teal-200 text-teal-900",
    initials: "佐",
  },
  {
    id: "staff3",
    name: "鈴木 主事",
    department: "企画防災課",
    role: "広報・イベント連携",
    phone: "079-123-4569",
    email: "suzuki@example.lg.jp",
    avatarColor: "bg-indigo-200 text-indigo-900",
    initials: "鈴",
  },
];

// ================== 活動費(Issue #16) ==================
export type MockBudget = {
  fiscalYear: string;
  totalBudget: number;
  used: number;
  categories: { name: string; budget: number; used: number }[];
};

export const mockBudget: MockBudget = {
  fiscalYear: "2026",
  totalBudget: 2_000_000,
  used: 456_000,
  categories: [
    { name: "研修費", budget: 200_000, used: 85_000 },
    { name: "旅費・交通費", budget: 500_000, used: 152_000 },
    { name: "事務経費", budget: 300_000, used: 78_000 },
    { name: "事業費", budget: 1_000_000, used: 141_000 },
  ],
};

// ================== 事例DB(Issue #6) ==================
export type MockCase = {
  id: string;
  title: string;
  summary: string;
  region: string;
  authorAnon: string;
  period: string;
  tags: string[];
  outcome: string;
  body: string;
};

export const mockCases: MockCase[] = [
  {
    id: "c1",
    title: "地域猫活動を協力隊業務化した交渉の記録",
    summary: "「直接業務化」で却下 → 「住民活動の支援」として再提案で承認を得た事例。",
    region: "兵庫県南部",
    authorAnon: "Iさん(任期2年目)",
    period: "2024年",
    tags: ["行政交渉", "住民活動支援", "地域猫"],
    outcome: "月 4 時間の業務として認定、カフェ併設の拠点整備へ",
    body: "最初の提案は『協力隊として地域猫保護活動をやりたい』と伝えたが、『公の業務としては認められない』と却下。その後、地域住民(高齢者)で猫の世話をしている方がいるのを知り、『その住民活動の支援』として再提案。業務として週 1 時間 × 月 4 回が認められた。",
  },
  {
    id: "c2",
    title: "島の特産品を都市部レストランと直接取引",
    summary: "高級スーパーや展示会を活用して、生産者 12 軒と首都圏 2 店舗の契約を仲介。",
    region: "兵庫県南部",
    authorAnon: "Oさん(任期3年目)",
    period: "2023-2025年",
    tags: ["販路開拓", "農業", "展示会"],
    outcome: "年商 800 万円規模の取引、生産者の平均単価 1.4 倍",
    body: "ハイエース 1 台で幕張メッセの展示会に出展。試食 500 食を配布、名刺交換 120 件。そのうち 2 件が月次注文につながった。ロスを減らすため、直売所・レストランでの余剰消費ルートも確保。",
  },
  {
    id: "c3",
    title: "空き家バンクへの登録交渉(高齢所有者向け)",
    summary: "司法書士と連携し、登記・相続の相談窓口を同時提供することで登録数を倍増。",
    region: "兵庫県中部",
    authorAnon: "Aさん(任期1年目)",
    period: "2025年",
    tags: ["空き家バンク", "移住促進", "行政連携"],
    outcome: "半年で登録 15 件(前年比 +200%)",
    body: "空き家所有者の高齢化に合わせ、単なる登録依頼ではなく『相続・登記の専門家同席』をセットにした。所有者の心理的ハードルが下がり、登録率が大幅に向上。",
  },
  {
    id: "c4",
    title: "SNS 発信を専属隊員に切り出して本業負担軽減",
    summary: "週 1 以上の投稿ノルマを、SNS 特化の 2 年目隊員に集約し、プレイヤーは現場活動に集中。",
    region: "兵庫県南部",
    authorAnon: "Iさん(任期2年目)",
    period: "2024年",
    tags: ["広報・情報発信", "役割分担", "運用改善"],
    outcome: "フォロワー 3 倍・プレイヤー稼働時間 +30%",
    body: "プレイヤーが発信業務も兼ねると両方が中途半端になる。2 年目加入の隊員に SNS 専業で任せ、現場隊員は写真素材だけ提供する運用に。結果として発信の質と現場活動の密度が両立。",
  },
  {
    id: "c5",
    title: "第3セクター勤務中の労務トラブル回避",
    summary: "業務委託のはずが実態は社員的な働き方に。社労士相談を早期に実施し契約見直しへ。",
    region: "兵庫県西部",
    authorAnon: "Kさん(任期3年目)",
    period: "2023-2024年",
    tags: ["労務", "業務委託", "契約見直し"],
    outcome: "労働時間の可視化、契約条項の明文化",
    body: "出発・帰着時間が固定されシフトが組まれる実態。社労士への相談で『偽装請負の恐れ』を指摘され、役場に労務改善を要請。最終的に裁量の確保と時間管理の分離を実現。",
  },
  {
    id: "c6",
    title: "北海道東川町モデルから学んだデザイン思考による地域ブランド",
    summary: "研修参加で得た『写真の町』のブランディングを自地域向けに翻案。",
    region: "北海道・兵庫",
    authorAnon: "Sさん(任期1年目)",
    period: "2025年",
    tags: ["研修", "ブランディング", "移住促進"],
    outcome: "地域 PR イベント 3 件企画・実施",
    body: "東川町の『子育て × 写真 × デザイン』の一貫性に学び、自地域では『猫 × カフェ × 島』を軸にした情報発信へ。単発イベントではなく継続したブランドストーリーを重視。",
  },
  {
    id: "c7",
    title: "コミュニティカフェの改修計画と資金調達",
    summary: "補助金と自己資金の組み合わせで、任期中に物件改修を完了。",
    region: "兵庫県南部",
    authorAnon: "Sさん(任期3年目)",
    period: "2025-2026年",
    tags: ["任期後", "起業", "補助金", "空き家"],
    outcome: "物件改修完了・開店準備中",
    body: "民泊規制エリアだったため、シェアカフェ + シェアキッチン機能にピボット。地域ファンド+中小企業庁の交付金+自己資金で改修。任期終了後もその地に住み続ける拠点に。",
  },
  {
    id: "c8",
    title: "78歳の養蜂家師匠への弟子入り(技術継承)",
    summary: "無給で通い、1 年で独立できるレベルに。高齢生産者の技術を地域に残す試み。",
    region: "兵庫県西部",
    authorAnon: "Kさん(任期2年目)",
    period: "2024年",
    tags: ["技術継承", "農業", "第一次産業"],
    outcome: "独立養蜂 2 群、師匠の技術をドキュメント化",
    body: "師匠に『弟子にしてください』と直接頼み込み、週 2 日通い詰め。技術は口頭伝承だったため、作業を動画と文章で記録。地域財産として残す意識。",
  },
  {
    id: "c9",
    title: "市長提案で『観光特区(民泊特区)』構想を動かす",
    summary: "現場からのボトムアップで首長案件に昇格させたプロセス。",
    region: "兵庫県南部",
    authorAnon: "Sさん(任期3年目)",
    period: "2025年",
    tags: ["行政交渉", "民泊", "特区", "首長"],
    outcome: "特区検討会議の設置(現在進行中)",
    body: "現場の需要(空き家 + 観光客)を数値化して市長秘書に提出。市長判断で検討会議が設置され、制度変更の俎上に乗った。小さな声を届ける筋道の実例。",
  },
  {
    id: "c10",
    title: "活動費の内訳を役場に聞いて可視化",
    summary: "1 年目は内訳不明だったが、交渉で初めて 200 万円の配分を把握。",
    region: "兵庫県南部",
    authorAnon: "Sさん(任期2年目)",
    period: "2024年",
    tags: ["活動費", "行政交渉", "透明化"],
    outcome: "隊員が予算を自主管理できる体制へ",
    body: "他隊員の試作品作りに予算が回されそうになったことがきっかけ。役場に活動費の内訳を問い合わせ、研修費・事業費・事務経費の配分を把握。自分の事業計画と予算を紐付けて管理できるように。",
  },
];

export const caseTags = [
  "全て",
  "行政交渉",
  "移住促進",
  "空き家バンク",
  "農業",
  "販路開拓",
  "広報・情報発信",
  "研修",
  "任期後",
  "労務",
  "活動費",
];

// ================== AI 相談モード(Issue #4) ==================
export type AssistantMode = {
  id: string;
  label: string;
  description: string;
  icon: string;
  accentClass: string;
  sampleQuestion: string;
};

export const assistantModes: AssistantMode[] = [
  {
    id: "strategy",
    label: "戦略レビュー",
    description: "事業計画が「地域のためになるか」AI が批判的に評価",
    icon: "🎯",
    accentClass: "from-violet-500 to-indigo-500",
    sampleQuestion: "次の事業計画を戦略視点でレビューしてほしい: ...",
  },
  {
    id: "proposal",
    label: "提案準備",
    description: "役場への提案を整理、却下リスクと別アプローチを提示",
    icon: "🏛",
    accentClass: "from-emerald-500 to-teal-500",
    sampleQuestion: "役場に提案したいけど通らなそうな案がある",
  },
  {
    id: "career",
    label: "キャリア相談",
    description: "任期後の道筋、起業・転職・残留を整理",
    icon: "💼",
    accentClass: "from-amber-500 to-orange-500",
    sampleQuestion: "任期まであと 1 年半、どう動くべきか",
  },
  {
    id: "worry",
    label: "悩み相談",
    description: "今の課題を整理、次の一歩を一緒に考える",
    icon: "💭",
    accentClass: "from-sky-500 to-cyan-500",
    sampleQuestion: "最近活動の方向性に迷っている",
  },
];

// ================== 活動プロジェクト(Issue #22) ==================
export type MockProject = {
  id: string;
  name: string;
  summary: string;
  status: "active" | "completed" | "paused";
  periodStart: string;
  periodEnd: string;
  progress: number;
  tags: string[];
  milestones: { label: string; done: boolean }[];
  outcomes: string[];
  linkedLogCount: number;
};

export const mockProjects: MockProject[] = [
  {
    id: "p1",
    name: "空き家バンク登録促進プロジェクト",
    summary: "篠山地区と大山地区で空き家所有者との登録交渉を進め、半年で登録数を倍増させる。",
    status: "active",
    periodStart: "2026-01-01",
    periodEnd: "2026-06-30",
    progress: 65,
    tags: ["移住促進", "空き家バンク"],
    milestones: [
      { label: "エリア調査・所有者リスト化", done: true },
      { label: "司法書士との連携体制", done: true },
      { label: "登録 10 件達成", done: false },
      { label: "移住案内キット制作", done: false },
    ],
    outcomes: ["登録 6 件(篠山 4・大山 2)", "移住確定 1 組(6 月予定)"],
    linkedLogCount: 14,
  },
  {
    id: "p2",
    name: "山の芋 販路開拓プロジェクト",
    summary: "生産者 12 軒と連携し、神戸市内レストラン・高級スーパーへの直接取引を開拓。",
    status: "active",
    periodStart: "2026-02-01",
    periodEnd: "2026-08-31",
    progress: 40,
    tags: ["農業", "販路開拓"],
    milestones: [
      { label: "生産者ヒアリング 12 軒", done: true },
      { label: "サンプル発送", done: true },
      { label: "レストラン本契約 1 店舗", done: false },
      { label: "生産者マップ完成", done: false },
    ],
    outcomes: ["仮決定 1 店舗", "生産者マップ初稿完成"],
    linkedLogCount: 9,
  },
  {
    id: "p3",
    name: "移住相談オンライン窓口",
    summary: "大阪・神戸圏の若年層向けに定期オンライン相談会を実施。",
    status: "paused",
    periodStart: "2025-10-01",
    periodEnd: "2026-03-31",
    progress: 80,
    tags: ["移住促進", "相談対応"],
    milestones: [
      { label: "告知チラシ制作", done: true },
      { label: "相談会 4 回開催", done: true },
      { label: "移住 2 組確定", done: true },
      { label: "Year 2 継続判断", done: false },
    ],
    outcomes: ["相談 4 回開催・14 組参加", "移住 2 組確定"],
    linkedLogCount: 11,
  },
];

// ================== 全国イベント情報(Issue #21) ==================
export type MockEvent = {
  id: string;
  title: string;
  host: string;
  location: string;
  region: string;
  startDate: string;
  endDate: string;
  description: string;
  tags: string[];
  deadline: string;
  isOnline: boolean;
  joined?: boolean;
};

export const mockEvents: MockEvent[] = [
  {
    id: "e1",
    title: "兵庫県 地域おこし協力隊 交流会(春)",
    host: "兵庫県地域振興課",
    location: "神戸ハーバーランド",
    region: "兵庫県",
    startDate: "2026-06-07",
    endDate: "2026-06-07",
    description: "県内協力隊員の活動共有と OB ネットワーキング。昼食付き。",
    tags: ["交流会", "県内"],
    deadline: "2026-05-25",
    isOnline: false,
    joined: true,
  },
  {
    id: "e2",
    title: "空き家活用・定住促進フォーラム 2026",
    host: "総務省 / 全国移住者受入連絡協議会",
    location: "東京 + オンライン",
    region: "全国",
    startDate: "2026-05-22",
    endDate: "2026-05-22",
    description: "全国の空き家バンク担当者・関連事業者が集まる事例共有・議論の場。",
    tags: ["空き家バンク", "移住促進", "研修"],
    deadline: "2026-05-15",
    isOnline: true,
  },
  {
    id: "e3",
    title: "北海道東川町視察研修(写真の町モデル)",
    host: "JOIN / 東川町",
    location: "北海道東川町",
    region: "北海道",
    startDate: "2026-07-10",
    endDate: "2026-07-12",
    description: "デザイン × 定住促進の先進事例を 3 日間で学ぶ現地研修。",
    tags: ["研修", "ブランディング"],
    deadline: "2026-06-15",
    isOnline: false,
  },
  {
    id: "e4",
    title: "中山間地域 販路開拓オンラインサミット",
    host: "兵庫県農政課",
    location: "オンライン",
    region: "全国",
    startDate: "2026-05-18",
    endDate: "2026-05-18",
    description: "農産物の直接販売・EC・レストラン契約の事例 5 件。",
    tags: ["販路開拓", "農業", "研修"],
    deadline: "2026-05-10",
    isOnline: true,
  },
  {
    id: "e5",
    title: "協力隊 OB 起業家ミートアップ",
    host: "OB 有志",
    location: "大阪市内",
    region: "近畿",
    startDate: "2026-06-15",
    endDate: "2026-06-15",
    description: "任期後に起業した OB 8 名がトーク。事例紹介と個別相談タイム。",
    tags: ["任期後", "起業", "OB"],
    deadline: "2026-06-01",
    isOnline: false,
  },
  {
    id: "e6",
    title: "地域 DX 勉強会(kintone vs 最新 SaaS)",
    host: "総務省 地域社会DX推進室",
    location: "オンライン",
    region: "全国",
    startDate: "2026-05-28",
    endDate: "2026-05-28",
    description: "自治体 DX の最前線。kintone 運用事例と新興 SaaS の比較。",
    tags: ["研修", "行政連携"],
    deadline: "2026-05-24",
    isOnline: true,
  },
];

export function formatPeriod(start: string, end: string) {
  if (start === end) return start;
  return `${start} 〜 ${end}`;
}

// ================== Lab: 行動ベース記録(action-log) ==================
export type MockAction = {
  id: string;
  timestamp: string;
  type: "voice" | "post" | "stamp";
  bodyMd: string;
  tags: string[];
  duration?: string;
  hasFollowUp?: boolean;
  aiCompleted?: boolean;
};

export const mockActions: MockAction[] = [
  {
    id: "ac1",
    timestamp: "2026-04-23T16:42:00+09:00",
    type: "voice",
    bodyMd: "篠山地区の空き家所有者(田中さん 78歳)を訪問。登録に前向き。司法書士の同席を希望されたので来週改めて訪問予定。",
    tags: ["空き家バンク", "移住促進"],
    duration: "1m 18s",
    aiCompleted: true,
  },
  {
    id: "ac2",
    timestamp: "2026-04-23T14:05:00+09:00",
    type: "voice",
    bodyMd: "山の芋生産者の岡田さん宅。今期収穫予定 800kg、神戸市内レストランへの試作品発送について承諾を得る。",
    tags: ["農業", "販路開拓"],
    duration: "0m 47s",
    aiCompleted: true,
  },
  {
    id: "ac3",
    timestamp: "2026-04-23T11:30:00+09:00",
    type: "post",
    bodyMd: "市役所打合せ。来月の広報誌寄稿の件、原稿締切は 5/10 と確定。",
    tags: ["行政連携", "広報・情報発信"],
  },
  {
    id: "ac4",
    timestamp: "2026-04-23T09:12:00+09:00",
    type: "stamp",
    bodyMd: "移動: 篠山地区 → 大山地区",
    tags: ["移動"],
    duration: "32 分",
  },
  {
    id: "ac5",
    timestamp: "2026-04-22T17:55:00+09:00",
    type: "voice",
    bodyMd: "移住相談オンライン(大阪在住 30 代夫婦)。家島の物件と暮らしについて 30 分。来月現地案内の予定を組む。",
    tags: ["移住促進", "相談対応"],
    duration: "2m 03s",
    hasFollowUp: true,
    aiCompleted: true,
  },
];

export type AiQuestion = {
  id: string;
  question: string;
  hint?: string;
};

export const sampleAiFollowUps: AiQuestion[] = [
  {
    id: "q1",
    question: "誰と会いましたか?(任意)",
    hint: "お名前 or 役職でも OK",
  },
  {
    id: "q2",
    question: "成果や決まったことはありますか?",
    hint: "次のアクションがあれば一緒に",
  },
  {
    id: "q3",
    question: "関連するプロジェクトを紐付けますか?",
    hint: "「空き家バンク登録促進」など",
  },
];
