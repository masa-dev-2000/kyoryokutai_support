import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockCases } from "@/lib/mock/data";
import { ChevronLeft, MapPin, Download, MessageCirclePlus, Bookmark, Sparkles } from "lucide-react";

export function generateStaticParams() {
  return mockCases.map((c) => ({ id: c.id }));
}

type Props = { params: Promise<{ id: string }> };

export default async function CaseDetailPage({ params }: Props) {
  const { id } = await params;
  const c = mockCases.find((x) => x.id === id);
  if (!c) notFound();

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
        <Link
          href="/me/cases"
          className="flex items-center gap-1 text-sm text-slate-600"
        >
          <ChevronLeft className="h-5 w-5" />
          一覧
        </Link>
        <div className="text-xs text-slate-500">事例</div>
        <button className="text-slate-500">
          <Bookmark className="h-5 w-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="h-3 w-3" />
          <span>{c.region}</span>
          <span className="mx-1">·</span>
          <span>{c.authorAnon}</span>
          <span className="mx-1">·</span>
          <span>{c.period}</span>
        </div>
        <h1 className="mt-2 text-lg font-bold leading-tight text-slate-900">
          {c.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          {c.summary}
        </p>

        <Card className="mt-4 border-emerald-200 bg-emerald-50">
          <CardBody>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900">
              <Sparkles className="h-3.5 w-3.5" />
              成果
            </div>
            <p className="mt-1 text-sm text-emerald-900">{c.outcome}</p>
          </CardBody>
        </Card>

        <section className="mt-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            詳細
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-800">
            {c.body}
          </p>
        </section>

        <div className="mt-4 flex flex-wrap gap-1">
          {c.tags.map((t) => (
            <Badge key={t} className="bg-slate-100 text-slate-600">
              #{t}
            </Badge>
          ))}
        </div>

        <Card className="mt-6">
          <CardBody className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">
              この事例を活用する
            </h3>
            <div className="space-y-2">
              <Button variant="secondary">
                <Download className="h-4 w-4" />
                役場提案用 PDF に書き出す
              </Button>
              <Button variant="secondary">
                <MessageCirclePlus className="h-4 w-4" />
                AI で自分の地域向けにカスタマイズ
              </Button>
            </div>
          </CardBody>
        </Card>

        <p className="mt-6 text-center text-xs text-slate-400">
          本事例は匿名化され、投稿者の同意を得て掲載されています。
        </p>
      </div>
    </div>
  );
}
