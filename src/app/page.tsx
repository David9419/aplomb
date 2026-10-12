import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { Services } from "@/components/sections/Services";
import { Pathologies } from "@/components/sections/Pathologies";
import { Finder } from "@/components/sections/Finder";
import { Method } from "@/components/sections/Method";
import { Independence } from "@/components/sections/Independence";
import { Area } from "@/components/sections/Area";
import { Faq } from "@/components/sections/Faq";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/site/Header";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Marquee />
        <Services />
        <Pathologies />
        <Finder />
        <Method />
        <Independence />
        <Area />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
