"use client";

import * as React from "react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

function Accordion(props: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b border-ink/10 last:border-b-0", className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group flex flex-1 cursor-pointer items-center justify-between gap-6 py-7 text-left font-serif text-[1.5rem] leading-tight text-ink transition-colors duration-300 hover:text-steel sm:text-[1.75rem]",
          className,
        )}
        {...props}
      >
        {children}
        <span className="grid size-11 shrink-0 place-items-center rounded-full border border-ink/10 bg-paper transition-[transform,background-color,color,border-color] duration-500 ease-out-expo group-hover:border-steel/40 group-data-[state=open]:rotate-[135deg] group-data-[state=open]:border-ink group-data-[state=open]:bg-ink group-data-[state=open]:text-paper">
          <Plus aria-hidden strokeWidth={1.6} className="size-[18px]" />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn("max-w-[680px] pb-8 pr-14 text-[1.05rem] leading-[1.75] text-ink-2", className)}>
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
