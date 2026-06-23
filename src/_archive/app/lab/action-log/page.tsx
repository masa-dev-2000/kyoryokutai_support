import Link from "next/link";
import type { Route } from "next";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Mic, Pencil, Stamp, Star } from "lucide-react";

type Variant = {
  id: string;
  href: Route;
  label: string;
  approach: string;
  pros: string[];
  cons: string[];
  status: "primary" | "experimental";
  icon: typeof Mic;
};

const variants: Variant[] = [
  {
    id: "v3-voice",
    href: "/lab/action-log/v3-voice",
    label: "v3. 音声ファースト + AI 質問補完",
    approach:
      "話すだけでその場で記録。AI が不足情報を聞き返して完成度を上げる。",
    pros: [
      "現場・運転中・農作業後でも記録可能",
      "AI が補完するので完成度が高い",
      "従来できなかった『労なく完成度の高い記録』を実現",
    ],
    cons: [
      "Whisper API の方言精度",
      "AI 質問の的確さで体験が決まる",
    ],
    status: "primary",
    icon: Mic,
  },
  {
    id: "v1-post",
    href: "/lab/action-log/v1-post",
    label: "v1. ミニポスト型(Twitter ライク)",
    approach: "テキストを時系列で蓄積。10 秒で投稿完了。",
    pros: ["最シンプル", "書くのが好きな層に合う"],
    cons: ["手が空かないと書けない"],
    status: "experimental",
    icon: Pencil,
  },
  {
    id: "v2-stamp",
    href: "/lab/action-log/v2-stamp",
    label: "v2. スタンプ型(ワンタップ選択)",
    approach: "活動種類をタップ + 一言。摩擦最小。",
    pros: ["入力負担が最も低い", "分類が自動でつく"],
    cons: ["事前定義カテゴリに依存", "詳細記述には不向き"],
    status: "experimental",
    icon: Stamp,
  },
];

export default function ActionLogIndex() {
  return (
    <div className="px-5 py-4 space-y-4">
      <Link
        href="/lab"
        className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        ラボへ戻る
      </Link>

      <header>
        <h1 className="text-xl font-bold text-slate-900">
          🎙️ 行動ベース記録
        </h1>
        <p className="mt-1 text-xs text-slate-600">
          人間の記憶は揮発する。1 日の終わりに全行動を書き起こすのは不可能。
          行動ごとに記録する方式を 3 バリアントで検証する。
        </p>
      </header>

      <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50">
        <CardBody>
          <h2 className="text-sm font-semibold text-violet-900">
            戦略上の位置付け
          </h2>
          <ul className="mt-1 space-y-0.5 text-xs text-violet-900">
            <li>
              ・**v3 音声ファースト + AI 質問**を MVP コア記録方式に格上げ(2026-04-23)
            </li>
            <li>・v1, v2 は比較検証用、ヒアリングで反応確認</li>
            <li>・採用バリアントは <code>/me/logs</code> 系へ統合</li>
          </ul>
        </CardBody>
      </Card>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          バリアント
        </h2>
        <div className="space-y-3">
          {variants.map((v) => {
            const Icon = v.icon;
            return (
              <Link key={v.id} href={v.href} className="block">
                <Card
                  className={
                    v.status === "primary"
                      ? "border-2 border-brand-400 ring-1 ring-brand-100"
                      : ""
                  }
                >
                  <CardBody>
                    <div className="flex items-start gap-3">
                      <div
                        className={`shrink-0 rounded-xl p-2 ${
                          v.status === "primary"
                            ? "bg-brand-100 text-brand-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">
                            {v.label}
                          </h3>
                          {v.status === "primary" && (
                            <Badge className="bg-brand-100 text-brand-700">
                              <Star className="mr-1 h-3 w-3" />
                              MVP 候補
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-600">
                          {v.approach}
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <div className="font-semibold text-emerald-700">
                              ◯
                            </div>
                            <ul className="text-slate-600">
                              {v.pros.map((p, i) => (
                                <li key={i}>・{p}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div className="font-semibold text-rose-700">
                              ×
                            </div>
                            <ul className="text-slate-600">
                              {v.cons.map((c, i) => (
                                <li key={i}>・{c}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                    </div>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
