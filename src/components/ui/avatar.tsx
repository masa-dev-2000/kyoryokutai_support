"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

const AvatarRoot = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className,
    )}
    {...props}
  />
));
AvatarRoot.displayName = "AvatarRoot";

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full text-sm font-bold",
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

// 既存コードとの互換: 文字列だけ渡したい簡易版
type SimpleAvatarProps = {
  initials: string;
  className?: string;
  src?: string;
};

const Avatar = React.forwardRef<HTMLDivElement, SimpleAvatarProps>(
  ({ initials, className, src }, ref) => {
    return (
      <AvatarRoot ref={ref} className={className}>
        {src && <AvatarImage src={src} alt={initials} />}
        <AvatarFallback className={className}>{initials}</AvatarFallback>
      </AvatarRoot>
    );
  },
);
Avatar.displayName = "Avatar";

export { Avatar, AvatarRoot, AvatarImage, AvatarFallback };
