"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { memberNav } from "@/lib/mock/data";
import {
  Home,
  NotebookPen,
  FileText,
  MessageCircle,
  Phone,
} from "lucide-react";

const iconMap = {
  home: Home,
  log: NotebookPen,
  report: FileText,
  chat: MessageCircle,
  phone: Phone,
} as const;

export function MemberBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-10 grid grid-cols-4 border-t border-slate-200 bg-white/95 pb-safe backdrop-blur">
      {memberNav.map((item) => {
        const Icon = iconMap[item.icon as keyof typeof iconMap];
        const active =
          item.href === "/me"
            ? pathname === "/me"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center py-2 text-xs",
              active ? "text-brand-600" : "text-slate-400",
            )}
          >
            <Icon className="h-6 w-6" strokeWidth={active ? 2.4 : 1.8} />
            <span className={cn("mt-0.5", active && "font-semibold")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
