import { Tour } from "@/components/sections/Tour";
import { Marquee } from "@/components/sections/Marquee";
import { Options } from "@/components/sections/Options";
import { Services } from "@/components/sections/Services";
import { Field } from "@/components/sections/Field";
import { Audiences } from "@/components/sections/Audiences";
import { Since } from "@/components/sections/Since";
import { Area } from "@/components/sections/Area";
import { Faq } from "@/components/sections/Faq";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Tour />
      <Marquee />
      <Options />
      <Services />
      <Field />
      <Audiences />
      <Since />
      <Area />
      <Faq />
      <Contact />
    </>
  );
}
