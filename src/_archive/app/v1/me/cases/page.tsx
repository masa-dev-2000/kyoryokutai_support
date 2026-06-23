"use client";

import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockCases, caseTags } from "@/lib/mock/data";
import { Search, Sparkles, ChevronLeft, MapPin, Tag as TagIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CasesPage() {
  const [keyword, setKeyword] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("全て");

  const filtered = mockCases.filter((c) => {
    const kwMatch =
      !keyword ||
      c.title.includes(keyword) ||
      c.summary.includes(keyword) ||
      c.body.includes(keyword) ||
      c.tags.some((t) => t.includes(keyword));
    const tagMatch = selectedTag === "全て" || c.tags.includes(selectedTag);
    return kwMatch && tagMatch;
  });

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-slate-100 bg-white px-5 py-4">
        <div className="flex items-center gap-2">
          <Link href="/v1/me" className="-ml-1 text-slate-600">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-bold text-slate-900">事例を探す</h1>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          全国の協力隊・OBの活動を検索。役場への提案材料にも。
        </p>

        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="キーワードで検索(地域・活動・悩み)"
            className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="-mx-5 mt-3 overflow-x-auto px-5">
          <div className="flex gap-2 pb-1">
            {caseTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition",
                  selectedTag === tag
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600",
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
          <span>{filtered.length} 件ヒット</span>
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-violet-500" />
            匿名化済・ご本人同意あり
          </span>
        </div>

        <div className="space-y-3">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/v1/me/cases/${c.id}` as Route}
              className="block"
            >
              <Card>
                <CardBody>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <MapPin className="h-3 w-3" />
                    <span>{c.region}</span>
                    <span className="mx-1">·</span>
                    <span>{c.authorAnon}</span>
                    <span className="mx-1">·</span>
                    <span>{c.period}</span>
                  </div>
                  <h3 className="mt-1 text-sm font-bold text-slate-900">
                    {c.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">
                    {c.summary}
                  </p>
                  <div className="mt-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs text-emerald-900">
                    ✨ 成果: {c.outcome}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {c.tags.map((t) => (
                      <Badge
                        key={t}
                        className="bg-slate-100 text-slate-600"
                      >
                        <TagIcon className="mr-1 h-3 w-3" />
                        {t}
                      </Badge>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="py-10 text-center text-sm text-slate-500">
              該当する事例が見つかりませんでした。
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-center text-xs text-slate-500">
          あなたの事例も共有しませんか?
          <br />
          匿名化された形で他の隊員の役に立ちます。
        </div>
      </div>
    </div>
  );
}
