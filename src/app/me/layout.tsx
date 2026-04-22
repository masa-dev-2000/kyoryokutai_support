import { PhoneFrame } from "@/components/member/phone-frame";
import { StatusBar } from "@/components/member/status-bar";
import { MemberBottomNav } from "@/components/member/bottom-nav";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PhoneFrame>
      <StatusBar />
      <main className="flex flex-1 flex-col overflow-y-auto">{children}</main>
      <MemberBottomNav />
    </PhoneFrame>
  );
}
