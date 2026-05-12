"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  FolderSearch,
  BarChart3,
  Building2,
  LogOut,
} from "lucide-react";
import type { Route } from "next";

const navItems: { href: Route; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
  { href: "/v1/admin", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/v1/admin/members", label: "隊員一覧", icon: Users },
  { href: "/v1/admin/announcements", label: "お知らせ配信", icon: Megaphone },
  { href: "/v1/admin/analytics", label: "活動サマリー", icon: BarChart3 },
  { href: "/v1/admin/cases", label: "事例ライブラリ", icon: FolderSearch },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-slate-900 text-slate-100">
      <div className="border-b border-slate-800 px-5 py-5">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-brand-500" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400">
              兵庫県
            </div>
            <div className="text-sm font-bold">丹波篠山市 総務課</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 text-sm">
        <div className="px-5 pb-2 text-[10px] uppercase tracking-wider text-slate-500">
          メニュー
        </div>
        {navItems.map((item) => {
          const active =
            item.href === "/v1/admin"
              ? pathname === "/v1/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-5 py-2.5 transition",
                active
                  ? "bg-slate-800 text-white border-l-2 border-brand-500"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={active ? 2.4 : 1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 px-5 py-4">
        <div className="flex items-center gap-2 text-xs">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 font-bold">
            山
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">山田 課長</div>
            <div className="truncate text-[11px] text-slate-400">
              総務課
            </div>
          </div>
          <button className="text-slate-400 hover:text-white">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
