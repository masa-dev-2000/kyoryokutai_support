import { cn } from "@/lib/utils";

type AvatarProps = {
  initials: string;
  className?: string;
};

export function Avatar({ initials, className }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full text-sm font-bold",
        className,
      )}
    >
      {initials}
    </div>
  );
}
