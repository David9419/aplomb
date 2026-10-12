import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-2 whitespace-nowrap rounded-full font-mono text-[0.7rem] uppercase tracking-[0.14em]",
  {
    variants: {
      variant: {
        default: "border border-ink/10 bg-paper/70 px-3.5 py-1.5 text-ink-2 backdrop-blur-md",
        steel: "bg-steel/10 px-3 py-1 text-steel",
        dark: "border border-paper/15 bg-paper/5 px-3.5 py-1.5 text-mist",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
