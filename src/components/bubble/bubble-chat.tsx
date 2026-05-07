import { cn } from "@/lib/utils";

type BubbleChatProps = {
  speaker: "ai" | "user";
  body: string;
  hint?: string;
};

export function BubbleChat({ speaker, body, hint }: BubbleChatProps) {
  if (speaker === "ai") {
    return (
      <div className="flex items-start gap-2 animate-in fade-in slide-in-from-left-2 duration-500">
        <div className="relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-300 to-indigo-500 shadow-lg ring-2 ring-white/60">
          <span className="absolute left-[20%] top-[15%] h-[28%] w-[28%] rounded-full bg-white/80 blur-[1px]" />
          <span className="relative text-sm">✨</span>
        </div>
        <div className="relative max-w-[85%]">
          <div
            className={cn(
              "rounded-[28px] rounded-tl-md bg-gradient-to-br from-white to-violet-50",
              "border border-violet-200/60 px-4 py-3 text-sm leading-relaxed",
              "shadow-lg shadow-violet-200/40 backdrop-blur",
            )}
          >
            {/* shine */}
            <span className="pointer-events-none absolute left-[10%] top-[15%] h-[18%] w-[24%] rounded-full bg-white/70 blur-[2px]" />
            <p className="relative whitespace-pre-line text-slate-800">{body}</p>
          </div>
          {hint && (
            <p className="mt-1 px-2 text-[10px] text-violet-700/80">💡 {hint}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end animate-in fade-in slide-in-from-right-2 duration-500">
      <div className="relative max-w-[80%]">
        <div
          className={cn(
            "rounded-[28px] rounded-br-md bg-gradient-to-br from-emerald-400 to-teal-500",
            "px-4 py-2.5 text-sm text-white",
            "shadow-lg shadow-emerald-300/50 ring-2 ring-white/40",
          )}
        >
          <span className="pointer-events-none absolute left-[12%] top-[18%] h-[22%] w-[22%] rounded-full bg-white/60 blur-[1px]" />
          <p className="relative whitespace-pre-line">{body}</p>
        </div>
      </div>
    </div>
  );
}
