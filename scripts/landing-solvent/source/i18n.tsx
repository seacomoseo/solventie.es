import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { INTERESES } from "@/lib/lead-schema";

export type Lang = "es" | "ca";

const es = {
  pill: "Jornada Técnica ACATCOR",
  heroAlt: "Balsa de riego con instalación fotovoltaica flotante",
  h1: "Haz que tu energía trabaje a tu favor",
  sub: "Soluciones energéticas para comunidades de regantes.",
  intro: "En Solvent te ayudamos a reducir costes energéticos, optimizar tus instalaciones y convertir el ahorro energético en nuevas oportunidades.",
  cta: "Quiero más información",
  solTitleA: "Más eficiencia.",
  solTitleB: "Más ahorro.",
  sol: [
    ["Energía solar", "Aprovecha tus instalaciones y balsas de riego para producir energía renovable y reducir costes eléctricos."],
    ["Eficiencia en bombeo", "Optimiza bombas, motores y sistemas de control para consumir menos energía."],
    ["Certificados de Ahorro Energético (CAE)", "Las mejoras de eficiencia energética pueden convertirse en ingresos económicos para tu comunidad."],
  ],
  highlight: "En Solvent estudiamos cada instalación para encontrar la solución más adecuada.",
  formTitle: "¿Hablamos de tu comunidad?",
  formSub: "Déjanos tus datos y te contactaremos para estudiar cómo podemos ayudarte.",
  nombre: "Nombre y apellidos *",
  empresa: "Comunidad de regantes / Empresa *",
  telefono: "Teléfono *",
  email: "Correo electrónico *",
  interes: "¿Qué te interesa?",
  intereses: [...INTERESES] as string[],
  privA: "He leído y acepto la",
  privLink: "política de privacidad",
  submit: "Enviar",
  legal: "Responsable: Solvent Iniciativas Empresariales. Finalidad: atender tu solicitud de información. Puedes ejercer tus derechos de acceso, rectificación y supresión según indica la política de privacidad.",
  thanks: "¡Gracias por tu interés!",
  thanksSub: "Hemos recibido tus datos y pronto nos pondremos en contacto contigo.",
  sendError: "No se pudo enviar. Inténtalo de nuevo.",
  errors: {
    nombre: "Indica tu nombre y apellidos",
    empresa: "Indica tu comunidad o empresa",
    telefono: "Introduce un teléfono válido",
    email: "Introduce un email válido",
    consentimiento: "Debes aceptar la política de privacidad",
  } as Record<string, string>,
  footPriv: "Política de privacidad",
  footLegal: "Aviso legal",
};

const ca: typeof es = {
  pill: "Jornada Tècnica ACATCOR",
  heroAlt: "Bassa de reg amb instal·lació fotovoltaica flotant",
  h1: "Fes que la teva energia treballi al teu favor",
  sub: "Solucions energètiques per a comunitats de regants.",
  intro: "A Solvent t'ajudem a reduir costos energètics, optimitzar les teves instal·lacions i convertir l'estalvi energètic en noves oportunitats.",
  cta: "Vull més informació",
  solTitleA: "Més eficiència.",
  solTitleB: "Més estalvi.",
  sol: [
    ["Energia solar", "Aprofita les teves instal·lacions i basses de reg per produir energia renovable i reduir costos elèctrics."],
    ["Eficiència en bombament", "Optimitza bombes, motors i sistemes de control per consumir menys energia."],
    ["Certificats d'Estalvi Energètic (CAE)", "Les millores d'eficiència energètica es poden convertir en ingressos econòmics per a la teva comunitat."],
  ],
  highlight: "A Solvent estudiem cada instal·lació per trobar la solució més adequada.",
  formTitle: "Parlem de la teva comunitat?",
  formSub: "Deixa'ns les teves dades i et contactarem per estudiar com et podem ajudar.",
  nombre: "Nom i cognoms *",
  empresa: "Comunitat de regants / Empresa *",
  telefono: "Telèfon *",
  email: "Correu electrònic *",
  interes: "Què t'interessa?",
  intereses: [
    "Energia solar / Fotovoltaica flotant",
    "Eficiència energètica i bombament",
    "Certificats d'Estalvi Energètic (CAE)",
    "Assessorament general",
  ],
  privA: "He llegit i accepto la",
  privLink: "política de privacitat",
  submit: "Enviar",
  legal: "Responsable: Solvent Iniciativas Empresariales. Finalitat: atendre la teva sol·licitud d'informació. Pots exercir els teus drets d'accés, rectificació i supressió segons indica la política de privacitat.",
  thanks: "Gràcies pel teu interès!",
  thanksSub: "Hem rebut les teves dades i aviat ens posarem en contacte amb tu.",
  sendError: "No s'ha pogut enviar. Torna-ho a provar.",
  errors: {
    nombre: "Indica el teu nom i cognoms",
    empresa: "Indica la teva comunitat o empresa",
    telefono: "Introdueix un telèfon vàlid",
    email: "Introdueix un correu vàlid",
    consentimiento: "Has d'acceptar la política de privacitat",
  },
  footPriv: "Política de privacitat",
  footLegal: "Avís legal",
};

const DICT = { es, ca };

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: typeof es }>({
  lang: "es",
  setLang: () => {},
  t: es,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("lang");
    const saved = p ?? localStorage.getItem("lang");
    if (saved === "ca" || saved === "es") setLangState(saved);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };
  return <Ctx.Provider value={{ lang, setLang, t: DICT[lang] }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);

function FlagES() {
  return (
    <svg viewBox="0 0 30 20" className="h-4 w-6 rounded-sm" aria-hidden>
      <rect width="30" height="20" fill="#AA151B" />
      <rect y="5" width="30" height="10" fill="#F1BF00" />
    </svg>
  );
}
function FlagCA() {
  return (
    <svg viewBox="0 0 30 20" className="h-4 w-6 rounded-sm" aria-hidden>
      <rect width="30" height="20" fill="#FCDD09" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} y={2.22 + i * 4.44} width="30" height="2.22" fill="#DA121A" />
      ))}
    </svg>
  );
}

export function LangSwitch() {
  const { lang, setLang } = useLang();
  const opts: [Lang, string, ReactNode][] = [["es", "Español", <FlagES key="es" />], ["ca", "Català", <FlagCA key="ca" />]];
  return (
    <div className="flex gap-1 rounded-full bg-secondary/40 p-1 backdrop-blur-sm" role="group" aria-label="Idioma / Idioma">
      {opts.map(([code, label, flag]) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          aria-label={label}
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-bold transition ${lang === code ? "bg-primary-foreground text-secondary" : "text-primary-foreground opacity-80 hover:opacity-100"}`}
        >
          {flag}
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
