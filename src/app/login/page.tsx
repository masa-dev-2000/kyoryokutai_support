export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">ログイン</h1>
        <p className="mt-2 text-sm text-slate-600">
          登録済みのメールアドレスにマジックリンクを送ります。
        </p>
        <p className="mt-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          ベータ開発中。招待制です。準備中の機能です。
        </p>
      </div>
    </main>
  );
}
