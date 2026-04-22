import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * デスクトップでアクセスされた際にスマホフレーム内に表示する。
 * モバイル幅(< 480px)ではフルスクリーン。
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-200 sm:py-6">
      <div
        className={cn(
          "mx-auto flex min-h-screen flex-col bg-slate-50",
          "sm:min-h-[844px] sm:max-w-[390px] sm:overflow-hidden sm:rounded-[2.5rem] sm:shadow-2xl sm:ring-8 sm:ring-slate-900",
        )}
      >
        {children}
      </div>
    </div>
  );
}
