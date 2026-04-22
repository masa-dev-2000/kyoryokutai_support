/**
 * スマホのステータスバー風の装飾(デスクトップでのモック表示用)。
 */
export function StatusBar() {
  return (
    <div className="hidden items-center justify-between px-6 py-2 text-xs font-medium text-slate-700 sm:flex">
      <span>9:41</span>
      <span>●●●●● 100%</span>
    </div>
  );
}
