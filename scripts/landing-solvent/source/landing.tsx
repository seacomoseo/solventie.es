import { createFileRoute } from "@tanstack/react-router";
import { Sun, Gauge, BadgeEuro } from "lucide-react";
import { LeadForm } from "@/components/LeadForm";
import { SiteFooter } from "@/components/SiteFooter";
import { LangProvider, LangSwitch, useLang } from "@/lib/i18n";
import logoBlanco from "@/assets/solvent-blanco.png.asset.json";

const HERO = "https://solventie.es/u/servicios/instalaciones-solares-flotantes/portada.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Solvent · Jornada Técnica ACATCOR — Energía para comunidades de regantes" },
      { name: "description", content: "Soluciones energéticas para comunidades de regantes: energía solar, eficiencia en bombeo y Certificados de Ahorro Energético (CAE)." },
      { property: "og:title", content: "Haz que tu energía trabaje a tu favor · Solvent" },
      { property: "og:description", content: "Soluciones energéticas para comunidades de regantes. Jornada Técnica ACATCOR." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: HERO },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: HERO },
    ],
    links: [{ rel: "preload", as: "image", href: HERO }],
  }),
  component: Index,
});

const SOLUCIONES = [
  { icon: Sun, img: "https://solventie.es/u/servicios/autoconsumo-fotovoltaico/portada.webp" },
  { icon: Gauge, img: "https://solventie.es/u/servicios/bombeo-solar/portada.jpg" },
  { icon: BadgeEuro, img: "https://solventie.es/u/servicios/gestion-cae/que-es.jpg" },
];

function Index() {
  return (
    <LangProvider>
      <Landing />
    </LangProvider>
  );
}

function Landing() {
  const { t } = useLang();
  return (
    <div className="min-h-screen bg-background">
      {/* PORTADA */}
      <header className="relative isolate overflow-hidden text-primary-foreground">
        <img src={HERO} alt={t.heroAlt} className="absolute inset-0 -z-10 h-full w-full object-cover" fetchPriority="high" />
        <div className="absolute inset-0 -z-10" style={{ background: "var(--hero-overlay)" }} />
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 pt-5">
          <a href="https://solventie.es/" target="_blank" rel="noopener" className="shrink-0">
            <img src={logoBlanco.url} alt="Solvent" className="h-8 w-auto sm:h-10" />
          </a>
          <LangSwitch />
        </div>
        <div className="mx-auto max-w-5xl px-5 pb-14 pt-16 sm:pb-24 sm:pt-28">
          <span className="mb-5 inline-block rounded-full border border-primary-foreground/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wider sm:text-xs">
            {t.pill}
          </span>
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.05] sm:text-6xl">
            {t.h1}
          </h1>
          <p className="mt-4 text-lg font-bold text-primary sm:text-2xl">
            {t.sub}
          </p>
          <p className="mt-3 max-w-xl text-base opacity-90 sm:text-lg">
            {t.intro}
          </p>
          <a
            href="#contacto"
            className="mt-7 inline-flex w-full items-center justify-center rounded-md bg-accent px-7 py-4 text-base font-bold text-accent-foreground shadow-lg transition hover:brightness-105 sm:w-auto"
          >
            {t.cta}
          </a>
        </div>
      </header>

      {/* SOLUCIONES */}
      <section className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
        <h2 className="text-center text-3xl font-bold text-secondary sm:text-4xl">
          {t.solTitleA} <span className="text-primary">{t.solTitleB}</span>
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {SOLUCIONES.map(({ icon: Icon, img }, idx) => {
            const [title, text] = t.sol[idx] ?? ["", ""];
            return (
            <article key={title} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="relative h-36 sm:h-44">
                <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
                <span className="absolute -bottom-6 left-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                  <Icon className="h-6 w-6" />
                </span>
              </div>
              <div className="p-5 pt-9">
                <h3 className="text-lg font-bold text-secondary">{title}</h3>
                <p className="mt-2 text-muted-foreground">{text}</p>
              </div>
            </article>
          );
          })}
        </div>
        <p className="mx-auto mt-10 max-w-2xl border-l-4 border-accent pl-4 text-xl font-bold text-secondary sm:text-center sm:border-l-0 sm:pl-0 sm:text-2xl">
          {t.highlight}
        </p>
      </section>

      {/* FORMULARIO */}
      <section id="contacto" className="scroll-mt-4 bg-primary px-5 py-12 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-3xl font-bold text-primary-foreground sm:text-4xl">
            {t.formTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-primary-foreground/90">
            {t.formSub}
          </p>
          <div className="mt-8">
            <LeadForm />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
