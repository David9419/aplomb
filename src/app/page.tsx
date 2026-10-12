import {
  area,
  contact,
  contactSection,
  finder,
  footer,
  hero,
  independence,
  method,
  pathologies,
  services,
} from "@/content/site";
import { Header } from "@/components/Header";
import { Finder } from "@/components/Finder";
import { Reveal } from "@/components/Reveal";
import { Logo } from "@/components/Logo";
import { MessageIcon, PhoneIcon } from "@/components/icons";

function Cote({ children }: { children: React.ReactNode }) {
  return <div className="cote mono">{children}</div>;
}

export default function Home() {
  return (
    <>
      <Header />
      <main id="accueil">
        {/* Hero */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <Reveal>
                <p className="mono">{hero.eyebrow}</p>
                <h1>
                  {hero.titleStart} <em>{hero.titleAccent}</em>
                </h1>
              </Reveal>
              <Reveal delay={0.12}>
                <p className="lead">{hero.lead}</p>
                <div className="ctas">
                  <a className="btn solid" href={contact.phoneHref}>
                    <PhoneIcon /> {hero.ctaPrimary} · {contact.phoneDisplay}
                  </a>
                  <a className="btn" href="#prestations">
                    {hero.ctaSecondary}
                  </a>
                </div>
              </Reveal>
            </div>
            <Reveal delay={0.24}>
              <aside className="pledge" aria-label="Engagement d'indépendance">
                <p className="mono">Engagement</p>
                <h2>{hero.pledgeTitle}</h2>
                <ul>
                  {hero.does.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                  {hero.doesNot.map((t) => (
                    <li key={t} className="no">
                      {t}
                    </li>
                  ))}
                </ul>
              </aside>
            </Reveal>
          </div>
        </section>

        {/* Prestations */}
        <section className="block" id="prestations">
          <div className="wrap">
            <Cote>{services.eyebrow}</Cote>
            <Reveal className="head">
              <h2>{services.title}</h2>
              <p>{services.lead}</p>
            </Reveal>
            <div className="services">
              {services.items.map((s, i) => (
                <Reveal key={s.ref} delay={(i % 2) * 0.1} className="svc">
                  <div className="ref">
                    <span className="mono">{s.ref}</span>
                    <span className="mono">{s.tag}</span>
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <ul>
                    {s.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Pathologies */}
        <section className="block dark" id="pathologies">
          <div className="wrap">
            <Cote>{pathologies.eyebrow}</Cote>
            <Reveal className="head">
              <h2>{pathologies.title}</h2>
              <p>{pathologies.lead}</p>
            </Reveal>
            <div className="symptoms">
              {pathologies.items.map((p, i) => (
                <Reveal key={p.title} delay={(i % 3) * 0.08} className="sym">
                  <span className="code">{p.code}</span>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Orienteur */}
        <section className="block" id="orienteur">
          <div className="wrap">
            <Cote>{finder.eyebrow}</Cote>
            <Reveal>
              <Finder />
            </Reveal>
          </div>
        </section>

        {/* Méthode */}
        <section className="block" id="methode">
          <div className="wrap">
            <Cote>{method.eyebrow}</Cote>
            <Reveal className="head">
              <h2>{method.title}</h2>
              <p>{method.lead}</p>
            </Reveal>
            <Reveal>
              <ol className="steps">
                {method.steps.map((s) => (
                  <li key={s.title}>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </section>

        {/* Indépendance */}
        <section className="block" id="independance">
          <div className="wrap indep">
            <Reveal>
              <Cote>{independence.eyebrow}</Cote>
              <p className="quote">« {independence.quote} »</p>
            </Reveal>
            <Reveal delay={0.1} className="tbl">
              <table className="compare">
                <thead>
                  <tr>
                    {independence.columns.map((c) => (
                      <th key={c} scope="col">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {independence.rows.map((r) => (
                    <tr key={r.q}>
                      <td>{r.q}</td>
                      <td data-label={independence.columns[1]}>{r.them}</td>
                      <td data-label={independence.columns[2]}>
                        <b>{r.us}</b>
                        {r.usRest}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Reveal>
          </div>
        </section>

        {/* Secteur */}
        <section className="block" id="secteur">
          <div className="wrap">
            <Cote>{area.eyebrow}</Cote>
            <Reveal className="head">
              <h2>{area.title}</h2>
              <p>{area.lead}</p>
            </Reveal>
            <Reveal className="zones">
              {area.zones.map((z) => (
                <div key={z.code} className="zone">
                  <span className="num">{z.code}</span>
                  <span className="mono">{z.name}</span>
                </div>
              ))}
              <span className="more">{area.more}</span>
            </Reveal>
          </div>
        </section>

        {/* Contact */}
        <section className="block contact" id="contact">
          <div className="wrap c-grid">
            <Reveal>
              <p className="mono">{contactSection.eyebrow}</p>
              <h2>{contactSection.title}</h2>
              <p className="lead">{contactSection.lead}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="phone-card">
                <p className="mono">Téléphone · {contactSection.areaLabel}</p>
                <a className="phone-num" href={contact.phoneHref}>
                  {contact.phoneDisplay}
                </a>
                <div className="row">
                  <a className="btn solid" href={contact.phoneHref}>
                    <PhoneIcon /> {contactSection.call}
                  </a>
                  <a className="btn" href={contact.smsHref}>
                    <MessageIcon /> {contactSection.sms}
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="wrap">
          <Logo compact />
          <span>{footer.copyright}</span>
        </div>
      </footer>
    </>
  );
}
