"use client";

import Link from "next/link";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { tagOptions } from "@/lib/mock/data";
import { ChevronLeft, Mic, Camera, Sparkles } from "lucide-react";

const suggestedTags = ["移住促進", "空き家バンク", "農業"];

export default function NewLogPage() {
  const [body, setBody] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(suggestedTags);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
        <Link href="/me" className="flex items-center gap-1 text-sm text-slate-600">
          <ChevronLeft className="h-5 w-5" />
          戻る
        </Link>
        <div className="text-sm font-semibold">今日の日報</div>
        <button className="text-sm font-medium text-brand-600">下書き</button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        <div>
          <div className="text-xs text-slate-500">
            {new Date().toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "short",
            })}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            活動メモ
          </label>
          <Textarea
            className="mt-2 h-44 resize-none"
            placeholder="今日やったことを自由に。Markdown も使えます。"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="mt-1 text-right text-xs text-slate-400">
            {body.length} 文字
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button className="flex flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-slate-300 py-5 text-sm text-slate-600 hover:bg-slate-50">
            <Mic className="h-6 w-6" />
            音声で入力
          </button>
          <button className="flex flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-slate-300 py-5 text-sm text-slate-600 hover:bg-slate-50">
            <Camera className="h-6 w-6" />
            写真を添付
          </button>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-violet-500" />
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              AI 提案タグ
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {tagOptions.map((tag) => {
              const selected = selectedTags.includes(tag);
              const suggested = suggestedTags.includes(tag);
              return (
                <Chip
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "border",
                    selected
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-white text-slate-600 border-slate-200",
                    suggested && !selected && "border-violet-200 bg-violet-50 text-violet-700",
                  )}
                >
                  {selected ? "✓ " : suggested ? "✨ " : "+ "}
                  {tag}
                </Chip>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white px-5 py-3">
        <Button size="lg">保存する</Button>
      </div>
    </div>
  );
}
