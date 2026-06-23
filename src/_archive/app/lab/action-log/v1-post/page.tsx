"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Send, Pencil } from "lucide-react";
import { mockActions } from "@/lib/mock/data";

export default function V1MiniPost() {
  const [body, setBody] = useState("");

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
          v1. ミニポスト型
        </h1>
        <p className="mt-1 text-xs text-slate-600">
          Twitter ライク。10 秒で投稿。
        </p>
      </header>

      <Card>
        <CardBody>
          <textarea
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="今やってること・今あったことを 1 行で"
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">{body.length} / 280</span>
            <button
              disabled={!body.trim()}
              className="flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white disabled:bg-slate-200 disabled:text-slate-400"
            >
              <Send className="h-3.5 w-3.5" />
              投稿
            </button>
          </div>
        </CardBody>
      </Card>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          タイムライン
        </h2>
        <div className="space-y-2">
          {mockActions.map((a) => (
            <Card key={a.id}>
              <CardBody>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <Pencil className="h-3 w-3" />
                  <span className="font-mono font-semibold text-slate-700">
                    {a.timestamp.slice(11, 16)}
                  </span>
                  <span>·</span>
                  <span>{a.timestamp.slice(5, 10)}</span>
                </div>
                <p className="mt-1 text-sm text-slate-800">{a.bodyMd}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {a.tags.map((t) => (
                    <Badge
                      key={t}
                      className="bg-slate-100 text-slate-600 text-[10px]"
                    >
                      #{t}
                    </Badge>
                  ))}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
