"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/btn relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-2.5 overflow-hidden whitespace-nowrap rounded-full font-medium transition-[transform,box-shadow,background-color,border-color,color] duration-300 ease-out-expo active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-[18px] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-ink text-paper shadow-[0_10px_30px_-12px_rgba(15,18,21,0.55)] hover:-translate-y-0.5 hover:bg-steel hover:shadow-[0_18px_40px_-14px_rgba(62,91,116,0.7)]",
        steel:
          "bg-steel text-paper shadow-[0_10px_30px_-12px_rgba(62,91,116,0.7)] hover:-translate-y-0.5 hover:bg-ink",
        outline:
          "border border-ink/15 bg-paper/60 text-ink backdrop-blur-md hover:-translate-y-0.5 hover:border-ink/40 hover:bg-paper",
        light:
          "bg-paper text-ink hover:-translate-y-0.5 hover:bg-sand",
        ghostLight:
          "border border-paper/25 text-paper hover:-translate-y-0.5 hover:border-paper/60 hover:bg-paper/10",
      },
      size: {
        default: "h-12 px-6 text-[0.95rem]",
        lg: "h-14 px-8 text-base",
        sm: "h-10 px-4 text-sm",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

/** Petite onde qui part du point de clic. */
function useRipple() {
  return React.useCallback((e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2.2;
    const span = document.createElement("span");
    span.className = "ripple";
    span.style.width = span.style.height = `${size}px`;
    span.style.left = `${e.clientX - rect.left - size / 2}px`;
    span.style.top = `${e.clientY - rect.top - size / 2}px`;
    el.appendChild(span);
    span.addEventListener("animationend", () => span.remove());
  }, []);
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  onPointerDown,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";
  const ripple = useRipple();
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      onPointerDown={(e: React.PointerEvent<HTMLButtonElement>) => {
        ripple(e);
        onPointerDown?.(e);
      }}
      {...props}
    />
  );
}

export { Button, buttonVariants };
