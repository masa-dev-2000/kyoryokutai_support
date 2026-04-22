"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { mockMessages, formatJstDate } from "@/lib/mock/data";
import { cn } from "@/lib/utils";
import { Send, Plus } from "lucide-react";

export default function ChatPage() {
  const [input, setInput] = useState("");

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-slate-100 bg-white px-5 py-3">
        <Avatar
          initials="山"
          className="h-10 w-10 bg-slate-200 text-slate-700"
        />
        <div className="flex-1">
          <div className="text-sm font-semibold text-slate-900">
            山田 総務課長
          </div>
          <div className="text-xs text-slate-500">
            丹波篠山市 総務課 / 担当者
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {mockMessages.map((m) => {
          const mine = m.senderId === "m1";
          return (
            <div
              key={m.id}
              className={cn(
                "flex",
                mine ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                  mine
                    ? "rounded-br-md bg-brand-600 text-white"
                    : "rounded-bl-md bg-white text-slate-800 shadow-sm",
                )}
              >
                <p className="whitespace-pre-line">{m.body}</p>
                <div
                  className={cn(
                    "mt-1 text-[10px]",
                    mine ? "text-emerald-100" : "text-slate-400",
                  )}
                >
                  {formatJstDate(m.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-slate-200 bg-white px-3 py-2">
        <div className="flex items-end gap-2">
          <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100">
            <Plus className="h-5 w-5" />
          </button>
          <div className="flex-1 rounded-2xl bg-slate-100 px-3 py-2">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="メッセージを入力"
              className="w-full resize-none bg-transparent text-sm outline-none"
            />
          </div>
          <button
            disabled={!input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white shadow-md shadow-brand-600/20 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
