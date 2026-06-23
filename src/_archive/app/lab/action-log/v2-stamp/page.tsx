"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Send } from "lucide-react";

const stamps = [
  { icon: "🏠", label: "訪問", tag: "訪問" },
  { icon: "🌾", label: "農作業", tag: "農業" },
  { icon: "🤝", label: "打合せ", tag: "行政連携" },
  { icon: "📞", label: "相談対応", tag: "相談対応" },
  { icon: "📸", label: "現地確認", tag: "現地確認" },
  { icon: "🏛️", label: "市役所", tag: "行政連携" },
  { icon: "🚗", label: "移動", tag: "移動" },
  { icon: "📚", label: "研修・学習", tag: "研修・学習" },
  { icon: "📢", label: "イベント", tag: "地域イベント" },
  { icon: "✍️", label: "事務", tag: "事務" },
  { icon: "💡", label: "企画・提案", tag: "企画" },
  { icon: "🍽️", label: "会食", tag: "ネットワーク" },
];

export default function V2Stamp() {
  const [selected, setSelected] = useState<string | null>(null);
  const [memo, setMemo] = useState("");

  return (
    <div className="px-5 py-4 space-y-4">
      <Link
        href="/lab/action-log"
        className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        バリアント一覧
      </Link>

      <header>
        <h1 className="text-lg font-bold text-slate-900">
          v2. スタンプ型
        </h1>
        <p className="mt-1 text-xs text-slate-600">
          活動をワンタップ + 一言で記録。摩擦最小。
        </p>
      </header>

      <Card>
        <CardBody>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            何をしましたか?
          </h2>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {stamps.map((s) => {
              const active = selected === s.label;
              return (
                <button
                  key={s.label}
                  onClick={() => setSelected(s.label)}
                  className={`flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-3 transition ${
                    active
                      ? "border-brand-500 bg-brand-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-[10px] font-medium text-slate-700">
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="mt-4 space-y-2">
              <Badge className="bg-brand-100 text-brand-700">
                選択中: {selected}
              </Badge>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="一言メモ(任意): 例「篠山の田中さん訪問」"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <button className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white">
                <Send className="h-4 w-4" />
                記録する
              </button>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <p className="text-xs text-slate-600">
            <strong>狙い</strong>:
            タップだけで分類が自動でつくので、AI 要約の精度が上がる。
            一方、定型カテゴリにない活動は v1 (ミニポスト) や v3 (音声) を併用。
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
