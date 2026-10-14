"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, Phone } from "lucide-react";

import { contact, contactSection } from "@/content/site";
import { Button } from "@/components/ui/button";
import { Magnetic, Reveal, SplitHeading } from "@/components/site/Motion";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";

export function Contact({
  title = contactSection.title,
  lead = contactSection.lead,
  accent = ["projet."],
}: {
  title?: string;
  lead?: string;
  accent?: string[];
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(contact.phoneDisplay);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* presse-papiers indisponible : le numéro reste affiché */
    }
  };

  return (
    <section id="contact" className="relative px-3 py-6 sm:px-5">
      <div className="relative overflow-hidden rounded-[36px] bg-ink px-6 py-20 text-paper sm:px-12 sm:py-28">
        <div className="blueprint-dark absolute inset-0" />
        <div className="absolute -top-32 left-1/2 size-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(62,91,116,0.55),transparent_62%)]" />
        <div className="relative mx-auto max-w-[1000px] text-center">
          <Reveal>
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-mist/70">{contactSection.eyebrow}</p>
          </Reveal>
          <SplitHeading
            text={title}
            accent={accent}
            className="mt-6 text-[clamp(2.6rem,7vw,6rem)] font-medium leading-[0.98] tracking-[-0.04em] [&_.text-steel]:text-mist"
          />
          <Reveal delay={0.1}>
            <p className="mx-auto mt-7 max-w-[36rem] text-[1.08rem] leading-[1.7] text-mist/75">{lead}</p>
          </Reveal>

          <Reveal delay={0.2}>
            <a
              href={contact.phoneHref}
              className="group mt-12 inline-block text-[clamp(2.6rem,8.5vw,7rem)] font-medium leading-none tracking-[-0.04em] tabular-nums"
            >
              <span className="bg-[linear-gradient(90deg,#fbfaf7,#c9d3dc,#fbfaf7)] bg-[length:200%_100%] bg-clip-text text-transparent transition-[background-position] duration-1000 ease-out-expo group-hover:bg-[position:100%_0]">
                {contact.phoneDisplay}
              </span>
            </a>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
              <Magnetic>
                <Button asChild variant="light" size="lg">
                  <a href={contact.phoneHref}>
                    <Phone /> {contactSection.call}
                  </a>
                </Button>
              </Magnetic>
              <Magnetic>
                <Button asChild variant="ghostLight" size="lg">
                  <a href={contact.whatsappHref} target="_blank" rel="noopener noreferrer">
                    <WhatsAppIcon /> {contactSection.whatsapp}
                  </a>
                </Button>
              </Magnetic>
              <Magnetic>
                <Button variant="ghostLight" size="lg" onClick={copy} aria-live="polite">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={copied ? "ok" : "copy"}
                      className="flex items-center gap-2.5"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                    >
                      {copied ? <Check /> : <Copy />}
                      {copied ? "Numéro copié" : "Copier le numéro"}
                    </motion.span>
                  </AnimatePresence>
                </Button>
              </Magnetic>
            </div>
          </Reveal>
          <Reveal delay={0.4}>
            <a
              href={contact.emailHref}
              className="mt-10 inline-block text-[0.95rem] text-mist/80 underline decoration-mist/30 underline-offset-4 transition-colors hover:text-paper hover:decoration-paper"
            >
              {contact.email}
            </a>
            <p className="mt-4 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-mist/50">{contactSection.areaLabel}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
