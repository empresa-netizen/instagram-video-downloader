import React from "react";

import { cn } from "@/lib/utils";

export function LogoText({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "text-lg font-extrabold tracking-[0.14em] uppercase select-none",
        className
      )}
      {...props}
    >
      MGTEAM
    </div>
  );
}

export function LogoImage({
  className,
  ...props
}: React.ComponentProps<"svg">) {
  return (
    <svg
      role="img"
      viewBox="0 0 877 647"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("fill-current", className)}
      {...props}
    >
      <title>MGTEAM</title>
      <path d="M876,0 L414,646 L876,644 L874,437 L748,437 L747,511 L777,513 L776,555 L589,555 L774,293 L778,334 L876,332 Z" />
      <path d="M675,0 L220,646 L330,645 L680,149 Z" />
      <path d="M457,0 L1,646 L114,642 L462,149 Z" />
    </svg>
  );
}
