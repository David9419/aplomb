import { faq } from "@/content/site";
import { SectionHead } from "@/components/sections/SectionHead";
import { Reveal } from "@/components/site/Motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function Faq() {
  return (
    <section id="faq" className="relative bg-paper py-28 sm:py-36">
      <div className="mx-auto grid max-w-[1240px] gap-14 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHead index="07" eyebrow={faq.eyebrow} title={faq.title} accent={["souvent."]} className="lg:block lg:self-start lg:sticky lg:top-32" />
        <Reveal>
          <Accordion type="single" collapsible defaultValue="item-0" className="border-t border-ink/10">
            {faq.items.map((item, i) => (
              <AccordionItem key={item.q} value={`item-${i}`}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
