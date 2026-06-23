import type { DatabaseSync } from "node:sqlite";

// 既存モック(member/manager/admin _app.tsx)と同じ初期データを投入。
// 投入後の画面はモック時代と見た目が変わらない。

const MUNI = "muni_shinonsen";

export function seed(db: DatabaseSync) {
  const tx = db.prepare("BEGIN").run();
  void tx;
  try {
    // -- 自治体 --
    db.prepare(
      "INSERT INTO municipalities (id,name,prefecture,annual_budget) VALUES (?,?,?,?)"
    ).run(MUNI, "新温泉町", "兵庫県", 2000000);

    // -- 受入団体 --
    const hostOrgs = [
      ["ho_nogyo", "新温泉町農業公社", "農業法人", "u_host_nogyo"],
      ["ho_kanko", "新温泉町観光協会", "観光協会", null],
    ] as const;
    for (const [id, name, kind, contact] of hostOrgs) {
      db.prepare(
        "INSERT INTO host_organizations (id,municipality_id,name,kind,contact_user_id) VALUES (?,?,?,?,?)"
      ).run(id, MUNI, name, kind, contact);
    }

    // -- 隊員 --
    const members = [
      ["m1", "田中 あかり", "移住促進", "2026-04-01", "1 年目"],
      ["m2", "山本 健一", "農業支援", "2025-04-01", "2 年目"],
      ["m3", "佐藤 美咲", "観光", "2024-04-01", "3 年目"],
      ["m4", "鈴木 悠人", "教育", "2026-04-01", "1 年目"],
      ["m5", "高橋 大輔", "DX", "2025-10-01", "1 年目"],
      ["m6", "中村 さくら", "起業支援", "2026-04-01", "1 年目"],
      ["m7", "藤井 翔太", "林業", "2025-04-01", "2 年目"],
    ];
    const insUser = db.prepare(
      `INSERT INTO users (id,municipality_id,host_organization_id,organization_type,role,name,email,role_label,title,department,term,started_at,status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
    );
    for (const [id, name, role, started, term] of members) {
      insUser.run(id, MUNI, null, "member", "member", name, `${id}@member.example.jp`, role, null, null, term, started, "active");
    }

    // -- 役場職員 --
    const staff = [
      ["s1", "谷本 拓海", "室長", "企画課"],
      ["s2", "森本 千秋", "係長", "企画課"],
      ["s3", "井上 雅人", "主事", "産業振興課"],
    ];
    for (const [id, name, title, dept] of staff) {
      insUser.run(id, MUNI, null, "municipality", "manager", name, `${id}@town.example.jp`, null, title, dept, null, null, "active");
    }
    // 受入団体側の承認者
    insUser.run("u_host_nogyo", MUNI, "ho_nogyo", "host_org", "manager", "西村 組合長", "nogyo@host.example.jp", null, "組合長", null, null, null, "active");
    // 管理者
    insUser.run("adm1", MUNI, null, "municipality", "admin", "管理者", "admin@town.example.jp", null, "管理者", "企画課", null, null, "active");

    // -- 担当割当 --
    const assignments: Record<string, string[]> = {
      s1: ["m1", "m2", "m3", "m4", "m5"],
      s2: ["m6", "m7"],
      s3: [],
    };
    const insAssign = db.prepare(
      "INSERT INTO assignments (id,municipality_id,staff_id,member_id) VALUES (?,?,?,?)"
    );
    let ai = 0;
    for (const [staffId, memberIds] of Object.entries(assignments)) {
      for (const mid of memberIds) insAssign.run(`as_${ai++}`, MUNI, staffId, mid);
    }

    // -- 活動ログ(m1) --
    const logs: [string, string, string, number, string, string, string, number | null][] = [
      ["l1", "現場訪問", "空き家", 2, "A 邸内覧、家族 4 人と現地調整。築 80 年、構造は良好。次回 6/15 に再訪。", "2026-06-11", "14:20", null],
      ["l2", "会議", "観光協会", 1.5, "観光協会 月例会(13:30〜)。夏祭りの出店枠について議論。", "2026-06-11", "11:05", null],
      ["l3", "会議", "移住相談", 1, "名古屋ファミリー Web 会議(60 分)。8 月の現地視察日程を仮押さえ。", "2026-06-10", "16:40", null],
      ["l4", "広報", "町報", 2.5, "町報の特集記事ドラフト、写真選定。締切 6/18。", "2026-06-10", "10:30", null],
      ["l5", "イベント", "夏祭り", 3, "夏祭り実行委員会、出店者リスト確定。次回現地下見 6/22。", "2026-06-08", "19:00", 1200],
      ["l6", "現場訪問", "空き家", 1.5, "B 邸 所有者連絡、内覧日程調整。所有者親族との合意形成が課題。", "2026-06-08", "14:00", null],
      ["l7", "出張", "空き家", 6, "島根県視察。海士町の古民家活用事例を視察。", "2026-06-05", "09:00", 38400],
      ["l8", "内勤", "町報", 2, "町報 6 月号 印刷費精算処理。", "2026-06-03", "10:00", 12800],
      ["m_1", "現場訪問", "空き家", 2, "A 邸 内覧、家族 4 人と現地調整。", "2026-05-02", "10:00", null],
      ["m_2", "会議", "移住相談", 1.5, "GW 体験ツアー振り返り MTG。", "2026-05-04", "13:00", null],
      ["m_3", "広報", "町報", 3, "町報 6 月号 編集作業。", "2026-05-07", "10:00", null],
      ["m_4", "会議", "観光協会", 2, "観光協会 連携協議。", "2026-05-10", "14:00", null],
      ["m_5", "イベント", "夏祭り", 4, "夏祭り実行委員会。", "2026-05-12", "19:00", 1200],
      ["m_6", "現場訪問", "空き家", 1.5, "B 邸 所有者打合せ。", "2026-05-15", "10:00", null],
      ["m_7", "出張", "移住相談", 6, "大阪移住相談会出展。", "2026-05-18", "09:00", 22000],
      ["m_8", "会議", "観光協会", 1, "観光協会 連携協定締結会。", "2026-05-20", "15:00", null],
      ["m_9", "現場訪問", "空き家", 2, "C 邸 解体相談 現地確認。", "2026-05-22", "13:30", null],
      ["m_10", "内勤", "町報", 2, "町報印刷費精算。", "2026-05-25", "10:00", 12800],
      ["m_11", "現場訪問", "空き家", 1.5, "D 邸 内覧 2 回目。", "2026-05-28", "14:00", null],
      ["m_12", "振り返り", "移住相談", 1, "5 月度振り返り。", "2026-05-30", "17:00", null],
      ["a_1", "内勤", "空き家", 4, "既存空き家リスト棚卸し。所有者連絡先整備。", "2026-04-03", "09:00", null],
      ["a_2", "会議", "観光協会", 1.5, "着任挨拶 兼 観光協会への顔出し。", "2026-04-05", "13:00", null],
      ["a_3", "広報", "町報", 3, "町報 5 月号 担当ページ作成。", "2026-04-08", "10:00", null],
      ["a_4", "イベント", "夏祭り", 5, "GW 体験ツアー準備 ・ 行程設計。", "2026-04-15", "10:00", 8500],
      ["a_5", "イベント", "夏祭り", 8, "GW 体験ツアー 1 日目(4/29)。", "2026-04-29", "09:00", 45000],
      ["a_6", "イベント", "夏祭り", 8, "GW 体験ツアー 2 日目(4/30)。", "2026-04-30", "09:00", null],
    ];
    const insLog = db.prepare(
      `INSERT INTO activity_logs (id,user_id,municipality_id,activity_type,topic,hours,body,log_date,log_time,expense_amount)
       VALUES (?,?,?,?,?,?,?,?,?,?)`
    );
    for (const [id, type, topic, hours, body, date, time, exp] of logs) {
      insLog.run(id, "m1", MUNI, type, topic, hours, body, date, time, exp);
    }

    // -- 月報(m1) --
    const reports: [string, string, string, string][] = [
      ["r-2026-06", "2026-06", "draft", "自動生成中"],
      ["r-2026-05", "2026-05", "approved", "役場承認 5/31"],
      ["r-2026-04", "2026-04", "approved", "役場承認 4/30"],
    ];
    const insReport = db.prepare(
      "INSERT INTO monthly_reports (id,user_id,municipality_id,year_month,status,status_label) VALUES (?,?,?,?,?,?)"
    );
    for (const [id, ym, status, label] of reports) insReport.run(id, "m1", MUNI, ym, status, label);

    // -- 経費(m1) --
    const expenses: [string, string, number, string, string, string, string, number][] = [
      ["e1", "町報 印刷費", 12800, "町報 6 月号の印刷費。広報物の制作費として申請。", "精算済", "広報物の印刷費は活動費対象。過去 4 件同様に承認実績あり。", "新温泉町 活動費ガイドライン v2.1|広報物の印刷費は活動費の対象に含まれます。", 1],
      ["e2", "島根県視察 出張費", 38400, "海士町の古民家活用事例を視察し、自地域での運用設計に活かす。", "未精算", "県外出張は事前承認が必要。本件は事前承認済み。", "新温泉町 活動費ガイドライン v2.1|県外出張は事前承認(町長決裁)必須。", 0],
      ["e3", "古民家家賃 月 5 万円", 50000, "活動拠点として A 邸を月 5 万円で賃借。週 1 で地域開放を予定。", "申請中", "拠点賃借料は対象。海士町に類似事例あり(月 4 万円承認)。", "JOIN お役立ちツール Q&A|活動拠点として賃借する家屋の賃料は活動費の対象に含まれます。", 0],
    ];
    const insExp = db.prepare(
      `INSERT INTO expenses (id,user_id,municipality_id,expense_kind,title,amount_requested,purpose,status,ai_note,citations,has_receipt,created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
    );
    for (const [id, title, amount, purpose, status, aiNote, cite, hasReceipt] of expenses) {
      const [src, quote] = cite.split("|");
      insExp.run(id, "m1", MUNI, "single", title, amount, purpose, status, aiNote, JSON.stringify([{ source: src, quote }]), hasReceipt, "2026-06-03");
    }

    // -- 承認ルート(代表 3 種) --
    const routes: [string, string, string, number][] = [
      ["rt_simple", "シンプル(企画課のみ)", "経費", 1],
      ["rt_mid", "中(担当課 → 企画課)", "経費", 0],
      ["rt_complex", "複雑(担当課 → 受入団体 → 企画課)", "経費", 0],
    ];
    for (const [id, name, kind, def] of routes) {
      db.prepare("INSERT INTO approval_routes (id,municipality_id,name,kind,is_default) VALUES (?,?,?,?,?)").run(id, MUNI, name, kind, def);
    }
    const insStep = db.prepare(
      "INSERT INTO approval_route_steps (id,route_id,step_no,approver_type,approver_label,department,host_organization_id) VALUES (?,?,?,?,?,?,?)"
    );
    insStep.run("st_s1", "rt_simple", 1, "admin", "企画課", null, null);
    insStep.run("st_m1", "rt_mid", 1, "dept", "担当課", "担当課", null);
    insStep.run("st_m2", "rt_mid", 2, "admin", "企画課", null, null);
    insStep.run("st_c1", "rt_complex", 1, "dept", "担当課", "担当課", null);
    insStep.run("st_c2", "rt_complex", 2, "host_org", "受入団体", null, "ho_nogyo");
    insStep.run("st_c3", "rt_complex", 3, "admin", "企画課", null, null);

    // -- 承認キュー(manager initialApprovals) --
    const insApproval = db.prepare(
      `INSERT INTO approvals (id,municipality_id,kind,applicant_id,member_name,title,ai,citations,detail,route_name,steps,current_step,status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
    );
    insApproval.run(
      "a1", MUNI, "活動相談", "m1", "田中 あかり", "古民家コワーキング試作の活動費利用",
      "JOIN Q&A の「活動拠点としての賃借料は対象」に該当。海士町に類似事例。スモールスタート案を併記。",
      JSON.stringify([
        { source: "JOIN お役立ちツール Q&A", quote: "活動拠点として賃借する家屋の賃料は活動費の対象に含まれます。" },
        { source: "海士町 古民家コワーキング(2024)", quote: "週 1 地域開放日を条件に承認。月 4 万円まで。" },
      ]),
      JSON.stringify({
        kind: "活動相談",
        goal: "町内に協力隊・移住者・地元住民が混ざる「滞在型の作業拠点」を作り、移住前の体験から定住までの導線をつくる。",
        background: "A 邸の所有者から「使ってくれるなら賃料は月 5 万円で構わない」と提案あり。築 80 年だが構造良好、改修は最小限で済む見込み。",
        plan: "Phase 1(7-9 月):週 2 日の試験運営\nPhase 2(10-12 月):週 4 日に拡張\nPhase 3(2027 年 1 月-):有償化検討",
        kpi: "・移住相談件数 月 5 件以上\n・地元住民の利用 月 10 名以上\n・体験滞在からの移住転換 年 2 家族",
        period: "2026-07-01 〜 2027-03-31(9 ヶ月)",
        budget: "賃料 月 5 万円 × 9 ヶ月 = 45 万円\n備品 5 万円\n光熱費 月 1 万円 × 9 ヶ月 = 9 万円\n合計 59 万円",
        risk: "・利用者が集まらない場合は Phase 1 で撤退判断\n・近隣住民へは着任前に説明会を開催",
      }),
      "担当課 → 企画課", JSON.stringify([
        { approverType: "dept", approverLabel: "商工観光課", status: "pending" },
        { approverType: "admin", approverLabel: "企画課", status: "waiting" },
      ]), 0, "pending"
    );
    insApproval.run(
      "a2", MUNI, "月次報告", "m1", "田中 あかり", "2026 年 5 月 月次報告(AI 生成)",
      "活動 12 件・24.5 時間 から自動生成。プロジェクト「空き家バンク立ち上げ」進捗 60%。",
      JSON.stringify([]),
      JSON.stringify({
        kind: "月次報告", ym: "2026-05",
        summary: "GW を活用した移住体験ツアーを 4/29-5/1 で実施。延べ 4 家族 13 名参加。観光協会との連携協定 5/20 締結。",
        sections: [
          { title: "活動サマリ", body: "GW 移住体験ツアー実施。観光協会連携協定締結。空き家 B/C/D 邸対応。" },
          { title: "個別活動の詳細", body: "・移住体験ツアー:4 家族 13 名\n・観光協会 連携協定:5/20 締結\n・空き家:内覧・解体相談" },
          { title: "成果物", body: "移住体験ツアー報告書 / 観光協会連携協定書" },
          { title: "来月計画", body: "・空き家バンク本格稼働\n・移住相談プロセスの標準化" },
          { title: "所感・課題", body: "現地での移動手段に課題。レンタカー手配のサポートが必要。" },
        ],
      }),
      "担当課 → 企画課", JSON.stringify([
        { approverType: "dept", approverLabel: "移住定住課", status: "approved", decidedAt: "6/10" },
        { approverType: "admin", approverLabel: "企画課", status: "pending" },
      ]), 1, "pending"
    );
    insApproval.run(
      "a3", MUNI, "月次報告", "m5", "高橋 大輔", "2026 年 5 月 月次報告(AI 生成)",
      "活動 4 件・14 時間 から自動生成。DX 推進プロジェクト 2 件の進捗を集約。",
      JSON.stringify([]),
      JSON.stringify({
        kind: "月次報告", ym: "2026-05",
        summary: "業務 DX 設計書を完成、kintone 設定相談会を開催。町民 IT 勉強会を初開催し 18 名参加。",
        sections: [
          { title: "活動サマリ", body: "DX 設計書完成 / kintone 相談会 / 町民 IT 勉強会(初開催)" },
          { title: "個別活動の詳細", body: "・業務 DX 設計書 v1.0 完成\n・kintone 設定相談会 2 回\n・町民 IT 勉強会(18 名)" },
          { title: "成果物", body: "業務 DX 設計書 v1.0 / 勉強会 教材スライド" },
          { title: "来月計画", body: "・kintone 試験運用開始\n・町民 IT 勉強会 第 2 回" },
          { title: "所感・課題", body: "参加者層が想定より高齢。次回は教材難易度を調整する。" },
        ],
      }),
      "企画課のみ", JSON.stringify([
        { approverType: "admin", approverLabel: "企画課", status: "pending" },
      ]), 0, "pending"
    );
    insApproval.run(
      "a4", MUNI, "経費", "m2", "山本 健一", "島根県視察 ¥38,400",
      "ガードレール:県外出張は事前承認が必要(本件は事後申請)。出張目的は隣県農業視察、目的妥当性は高。",
      JSON.stringify([
        { source: "新温泉町 活動費ガイドライン v2.1", quote: "県外出張は事前承認(町長決裁)必須。事後申請は理由書添付。" },
      ]),
      JSON.stringify({
        kind: "経費",
        purpose: "島根県海士町の有機農業事例を視察。新温泉町の遊休農地活用に活かす。",
        amount: 38400, payee: "本人立替(JR + 宿泊 + 視察先入場料)", paidDate: "2026-05-15", receipt: true,
      }),
      "担当課 → 受入団体 → 企画課", JSON.stringify([
        { approverType: "dept", approverLabel: "農林水産課", status: "pending" },
        { approverType: "host_org", approverLabel: "新温泉町農業公社", status: "waiting" },
        { approverType: "admin", approverLabel: "企画課", status: "waiting" },
      ]), 0, "pending"
    );

    // -- お知らせ(manager initialNotices) --
    const notices: [string, string, string, number, number][] = [
      ["n1", "6 月例会の議題について", "6 月例会は 13:30 から、議題は空き家事業の進捗報告です。各自 5 分の持ち時間で。", 5, 5],
      ["n2", "夏季活動費の申請期限", "夏季(7-9 月)の活動費申請は 6/20 まで。プロジェクト単位での起案を推奨。", 5, 4],
      ["n3", "5 月度 月報提出のお願い", "5 月度の月報を 6/10 までに提出してください。AI 下書きでも構いません。", 5, 5],
    ];
    const insNotice = db.prepare(
      `INSERT INTO announcements (id,municipality_id,sender_id,sender_name,kind,is_pinned,title,body,target_count,sent_at)
       VALUES (?,?,?,?,?,?,?,?,?,?)`
    );
    for (const [id, title, body, targets, read] of notices) {
      insNotice.run(id, MUNI, "s1", "谷本 拓海", "info", 0, title, body, targets, "2026-06-05");
      // 既読を read 件ぶん入れる(集計用)
      for (let r = 0; r < read; r++) {
        db.prepare("INSERT INTO announcement_reads (announcement_id,user_id) VALUES (?,?)").run(id, `m${r + 1}`);
      }
    }
    // ルール(ピン留め)サンプル
    insNotice.run("rule1", MUNI, "s1", "谷本 拓海", "rule", 1, "経費ルール v2.1", "・県外出張は事前承認(町長決裁)必須\n・食事/娯楽費は活動費の対象外\n・広報物の印刷費は対象", 5, "2026-04-01");
    insNotice.run("qa1", MUNI, "u_host_nogyo", "西村 組合長", "qa", 1, "領収書の添付について", "Q. 領収書を紛失した場合は?\nA. 支払証明書(様式 3)を添付してください。", 5, "2026-04-10");

    // -- 全国事例 --
    const cases: [string, string, string, string, string, string, string, string, string, number | null][] = [
      ["c1", "空き家バンクで 1 年目 12 件登録", "兵庫県 養父市", "2024", "山本(隊員 1 年目)",
        "自治会連動の DM 配布で空き家所有者にリーチ。1 年目で 12 件の登録、うち 4 件成約。",
        "登録 12 件 / 成約 4 件 / 移住 3 家族", "町外からの移住 7 名増、空き家率 -0.4 pt",
        JSON.stringify([
          { phase: "1-3 月目", body: "既存の空き家リスト棚卸し。所有者連絡先の整備に注力。" },
          { phase: "4-6 月目", body: "自治会経由で所有者に挨拶状を DM 配布(18 件)。返信 9 件。" },
          { phase: "7-9 月目", body: "内覧 7 件、登録 5 件。並行して移住希望者リスト作成。" },
          { phase: "10-12 月目", body: "成約 4 件、移住 3 家族受け入れ。" },
        ]), 34],
      ["c2", "空き家清掃ボランティアの定着", "島根県 海士町", "2023", "中島(隊員 2 年目)",
        "月 1 回の空き家清掃ボランティアを継続開催。地元住民との関係構築の場として機能。",
        "12 回開催 / 延べ参加 84 名 / 清掃完了 8 物件", "地元住民との関係構築 + 物件の早期市場投入",
        JSON.stringify([
          { phase: "1-2 月目", body: "地元自治会と相談、第 1 回は地域住民のみで開催。" },
          { phase: "3-6 月目", body: "SNS で外部にも告知、移住希望者の参加が増える。" },
          { phase: "7-12 月目", body: "月 1 定期化、清掃完了物件は空き家バンクに即登録。" },
        ]), 28],
      ["c3", "DIY 補助金との組み合わせ", "全国(JOIN)", "2024", "JOIN お役立ちツール",
        "空き家物件登録時に DIY 補助金を活用するスキーム例。",
        "補助上限 50 万円 / 申請期間 2 ヶ月", "物件登録のインセンティブ強化",
        JSON.stringify([
          { phase: "申請", body: "市町村窓口で DIY 補助金の交付申請。" },
          { phase: "実施", body: "補助対象工事を実施(壁紙・水回り等)。" },
          { phase: "登録", body: "工事完了後に空き家バンクに登録。" },
        ]), 19],
    ];
    const insCase = db.prepare(
      `INSERT INTO cases_public (id,title,area,year,author,summary,kpi,effect,process,learning,trend_count)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`
    );
    const learnings: Record<string, string> = {
      c1: "自治会経由の DM は反応率が高い(直接送付の 3 倍)。所有者の心理的ハードルが「地域経由」で下がる。",
      c2: "地元 → 外部の順で開いていくと住民の抵抗が少ない。清掃 + 交流の二段構造が効く。",
      c3: "補助金申請のタイミングを物件登録と連動させると、所有者の意思決定が早まる。",
    };
    for (const [id, title, area, year, author, summary, kpi, effect, process, trend] of cases) {
      insCase.run(id, title, area, year, author, summary, kpi, effect, process, learnings[id], trend);
    }

    // -- ガイドライン(経費チェック用) --
    const guidelines: [string, string][] = [
      ["県外出張", "県外出張は事前承認(町長決裁)必須。事後申請は理由書を添付すること。"],
      ["広報物", "広報物の印刷費・制作費は活動費の対象に含まれます。"],
      ["拠点賃借", "活動拠点として賃借する家屋の賃料は活動費の対象に含まれます(地域開放を条件)。"],
      ["対象外", "食事代・娯楽費(映画・観光等)は活動費の対象外です。"],
    ];
    const insGl = db.prepare(
      "INSERT INTO guidelines (id,municipality_id,source,section,body) VALUES (?,?,?,?,?)"
    );
    guidelines.forEach(([section, body], i) =>
      insGl.run(`gl_${i}`, MUNI, "新温泉町 活動費ガイドライン v2.1", section, body)
    );

    db.prepare("COMMIT").run();
  } catch (e) {
    db.prepare("ROLLBACK").run();
    throw e;
  }
}
