"use client";

import { useState } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { currentMember } from "@/lib/mock/data";
import { Bell, Shield, Download, LogOut, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [anonymize, setAnonymize] = useState(false);
  const [push, setPush] = useState(true);

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-slate-100 bg-white px-5 py-4">
        <h1 className="text-lg font-bold text-slate-900">設定</h1>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
        <Card>
          <CardBody className="flex items-center gap-3">
            <Avatar
              initials={currentMember.initials}
              className={`h-12 w-12 ${currentMember.avatarColor}`}
            />
            <div className="flex-1">
              <div className="font-semibold text-slate-900">
                {currentMember.fullName}
              </div>
              <div className="text-xs text-slate-500">
                {currentMember.municipality} / 着任 {currentMember.assignedAt}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </CardBody>
        </Card>

        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            通知
          </h2>
          <Card>
            <CardBody className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-slate-500" />
                <div>
                  <div className="text-sm font-medium text-slate-900">
                    プッシュ通知
                  </div>
                  <div className="text-xs text-slate-500">
                    お知らせ・チャット
                  </div>
                </div>
              </div>
              <Toggle value={push} onChange={setPush} />
            </CardBody>
          </Card>
        </section>

        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            プライバシー
          </h2>
          <Card>
            <CardBody className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-slate-500" />
                <div>
                  <div className="text-sm font-medium text-slate-900">
                    匿名化した活動共有
                  </div>
                  <div className="text-xs text-slate-500">
                    他地域の事例共有に協力する(OFF デフォルト)
                  </div>
                </div>
              </div>
              <Toggle value={anonymize} onChange={setAnonymize} />
            </CardBody>
          </Card>
          <p className="mt-2 px-1 text-xs text-slate-500">
            ON にすると、氏名・所属を削除したうえで活動内容が他市町村の隊員にも参照されます。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            データ
          </h2>
          <Card>
            <button className="flex w-full items-center justify-between px-5 py-4 text-left">
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-slate-500" />
                <div>
                  <div className="text-sm font-medium text-slate-900">
                    自分のデータをエクスポート
                  </div>
                  <div className="text-xs text-slate-500">
                    PDF / CSV でダウンロード
                  </div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          </Card>
        </section>

        <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white py-3 text-sm font-semibold text-rose-600">
          <LogOut className="h-4 w-4" />
          ログアウト
        </button>

        <p className="text-center text-xs text-slate-400">
          地域おこし協力隊サポート v0.1.0 (β)
        </p>
      </div>
    </div>
  );
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={cn(
        "relative h-6 w-11 rounded-full transition",
        value ? "bg-brand-600" : "bg-slate-300",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition",
          value && "translate-x-5",
        )}
      />
    </button>
  );
}
