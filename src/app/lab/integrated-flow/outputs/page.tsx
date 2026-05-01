import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  Sparkles,
  FileText,
  TrendingUp,
  Bookmark,
  Presentation,
  Download,
  Edit,
  Send,
} from "lucide-react";

export default function OutputsPage() {
  return (
    <div className="px-5 py-4 space-y-4">
      <Button variant="link" size="sm" className="-ml-2 px-2" asChild>
        <Link href="/lab/integrated-flow">
          <ChevronLeft />
          統合フローへ戻る
        </Link>
      </Button>

      <header>
        <Badge variant="secondary" className="bg-violet-100 text-violet-800">
          ✨ 自動生成物のショーケース
        </Badge>
        <h1 className="mt-2 text-xl font-bold">
          ユーザー入力 3 つから、これらが自動で揃う
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          下のタブで、生成された各アウトプットのサンプルを確認できます
        </p>
      </header>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="daily" className="flex-1 text-xs">
            日報
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex-1 text-xs">
            月報
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex-1 text-xs">
            進捗
          </TabsTrigger>
          <TabsTrigger value="case" className="flex-1 text-xs">
            事例
          </TabsTrigger>
          <TabsTrigger value="outcome" className="flex-1 text-xs">
            成果
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <Card>
            <CardContent>
              <Header icon={FileText} label="日報(自動生成)" date="2026-04-23" />
              <article className="mt-3 space-y-2 text-sm leading-relaxed">
                <p>
                  午前は篠山地区での空き家現地確認(2 件)。所有者(田中さん 78 歳)は登録に前向きで、来週司法書士同席で再訪問予定。
                </p>
                <p>
                  午後は山の芋生産者の岡田さん宅。今期収穫予定 800kg。神戸市内レストランへ試作品発送の承諾を得る。
                </p>
                <p>
                  夕方、市役所で広報誌寄稿の打合せ。原稿締切は 5/10 と確定。
                </p>
                <p className="text-xs text-muted-foreground">
                  プロジェクト進捗: 空き家バンク登録 6/10、内覧 18/20。
                </p>
              </article>
              <FootActions />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardContent>
              <Header icon={FileText} label="月次報告(自動生成)" date="2026-04 (4 月分)" />
              <article className="mt-3 space-y-3 text-sm leading-relaxed">
                <Section title="1. 活動サマリ">
                  4 月は移住促進と地場農産物の販路開拓を軸に活動。空き家バンク登録 6 件、移住相談 4 件、農家ヒアリング 12 軒を実施。
                </Section>
                <Section title="2. 個別活動">
                  <ul className="list-disc pl-5 space-y-0.5 text-xs">
                    <li>空き家バンク新規登録: 6 件(篠山 4・大山 2)</li>
                    <li>移住相談対応: 4 件(大阪 2、東京 1、神戸 1)</li>
                    <li>山の芋生産者: 12 軒訪問、首都圏 2 店舗と取引打診</li>
                  </ul>
                </Section>
                <Section title="3. 来月計画">
                  <ul className="list-disc pl-5 space-y-0.5 text-xs">
                    <li>レストラン本契約(5 月中旬)</li>
                    <li>移住 1 組の受け入れ準備</li>
                    <li>地域イベント(5/18)での販路告知</li>
                  </ul>
                </Section>
              </article>
              <FootActions />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardContent>
              <Header icon={TrendingUp} label="プロジェクト進捗(リアルタイム)" date="自動更新" />
              <div className="mt-3 space-y-3">
                <ProgressItem
                  name="空き家バンク登録促進"
                  pct={60}
                  detail="登録 6/10 件・内覧 18/20 件・移住確定 1/3 組"
                />
                <ProgressItem
                  name="山の芋 販路開拓"
                  pct={40}
                  detail="生産者 12/12・契約 1/2 店舗"
                />
                <ProgressItem
                  name="移住相談オンライン窓口"
                  pct={80}
                  detail="相談 4 回・移住 2 組確定"
                />
              </div>
              <Separator className="my-4" />
              <p className="text-xs text-muted-foreground">
                日々の行動 + 振り返り回答が KPI に自動集計され、グラフは常時更新されます。
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="case">
          <Card>
            <CardContent>
              <Header icon={Bookmark} label="事例(節目で AI が下書き)" date="2026-04 抽出" />
              <article className="mt-3 space-y-2">
                <h3 className="text-sm font-bold">
                  司法書士同席で空き家登録率を倍増させた取り組み
                </h3>
                <p className="text-xs text-muted-foreground">
                  Iさん(任期 1 年目)・兵庫県中部・2026 年
                </p>
                <p className="text-sm leading-relaxed">
                  高齢所有者の登録交渉では「相続・登記の不安」が壁になる。
                  司法書士の同席をセットにすることで心理的ハードルが下がり、
                  半年で登録 6 件(前年比 +200%)を達成。
                </p>
                <div className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs text-emerald-900">
                  ✨ 成果: 登録 6 件 / 移住確定 1 組
                </div>
              </article>
              <Separator className="my-3" />
              <p className="text-xs text-muted-foreground">
                AI が「これは事例にする価値あり」と判定したものを下書き。
                公開するかは隊員の opt-in。
              </p>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  公開しない
                </Button>
                <Button size="sm" className="flex-1">
                  <Send />
                  匿名化して公開
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outcome">
          <Card>
            <CardContent>
              <Header
                icon={Presentation}
                label="成果発表(プロジェクト終了時に自動生成)"
                date="2026-09 完了想定"
              />
              <article className="mt-3 space-y-3 text-sm">
                <Section title="プロジェクト概要">
                  空き家バンク登録促進プロジェクト
                  <br />
                  期間: 2026 年 1 月 - 6 月(半年)
                </Section>
                <Section title="達成">
                  <ul className="list-disc pl-5 space-y-0.5 text-xs">
                    <li>登録 12 件(目標 10 件・120% 達成)</li>
                    <li>内覧 25 件(目標 20 件・125% 達成)</li>
                    <li>移住確定 4 組(目標 3 組・133% 達成)</li>
                  </ul>
                </Section>
                <Section title="学び・横展開可能性">
                  <ul className="list-disc pl-5 space-y-0.5 text-xs">
                    <li>司法書士同席は登録率向上の決め手</li>
                    <li>所有者高齢化エリアでは相続相談セットが有効</li>
                    <li>近隣自治体への横展開を提案中</li>
                  </ul>
                </Section>
              </article>
              <Separator className="my-3" />
              <div className="rounded-lg bg-violet-50 px-3 py-2 text-xs text-violet-900">
                <Sparkles className="mr-1 inline h-3 w-3" />
                AI が「議会報告 PDF」「次年度プロポーザル」「事例として匿名公開」の各バージョンを 1 クリックで生成可能
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit />
                  編集
                </Button>
                <Button size="sm" className="flex-1">
                  <Download />
                  PDF 出力
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent>
          <div className="flex items-start gap-2 text-xs text-amber-900">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              これらすべてが、ユーザーは
              <strong>
                「① プロジェクト計画 / ② タスク実行 / ③ 夜の振り返り」
              </strong>
              に答えるだけで自動生成されます。情報の棄損なく、入力負担は 1/5 程度に。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Header({
  icon: Icon,
  label,
  date,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  date: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon className="h-3.5 w-3.5 text-violet-600" />
      <span className="font-semibold">{label}</span>
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground">{date}</span>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs font-semibold text-foreground">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{children}</div>
    </div>
  );
}

function ProgressItem({
  name,
  pct,
  detail,
}: {
  name: string;
  pct: number;
  detail: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold">{name}</span>
        <span className="text-emerald-700 font-semibold">{pct}%</span>
      </div>
      <Progress value={pct} className="mt-1 h-1.5" />
      <div className="mt-0.5 text-[11px] text-muted-foreground">{detail}</div>
    </div>
  );
}

function FootActions() {
  return (
    <>
      <Separator className="my-3" />
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm">
          <Edit />
          編集
        </Button>
        <Button size="sm">
          <Send />
          確定
        </Button>
      </div>
    </>
  );
}
