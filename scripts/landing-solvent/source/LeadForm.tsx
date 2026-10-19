import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitLead } from "@/lib/leads.functions";
import { INTERESES, leadSchema } from "@/lib/lead-schema";
import { useLang } from "@/lib/i18n";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

const inputCls =
  "w-full rounded-md border border-input bg-background px-4 py-3 text-base text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

export function LeadForm() {
  const { t } = useLang();
  const submit = useServerFn(submitLead);
  const startRef = useRef(Date.now());
  const [utms, setUtms] = useState<Record<string, string>>({});
  const [intereses, setIntereses] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    startRef.current = Date.now();
    const p = new URLSearchParams(window.location.search);
    const u: Record<string, string> = {};
    UTM_KEYS.forEach((k) => {
      const v = p.get(k);
      if (v) u[k] = v.slice(0, 200);
    });
    setUtms(u);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      nombre: String(fd.get("nombre") ?? ""),
      empresa: String(fd.get("empresa") ?? ""),
      telefono: String(fd.get("telefono") ?? ""),
      email: String(fd.get("email") ?? ""),
      intereses,
      consentimiento: fd.get("consentimiento") === "on",
      website: String(fd.get("website") ?? ""),
      elapsedMs: Math.max(Date.now() - startRef.current, 2000),
      ...utms,
    };
    const parsed = leadSchema.safeParse(payload);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        const k = String(i.path[0]);
        if (!errs[k]) errs[k] = t.errors[k] ?? i.message;
      });
      setErrors(errs);
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      await submit({ data: payload });
      setStatus("done");
    } catch (err) {
      setStatus("idle");
      setServerError(t.sendError);
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-xl bg-card p-8 text-center text-card-foreground shadow-xl" role="status">
        <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
        <p className="mt-4 text-xl font-bold">{t.thanks}</p>
        <p className="mt-2 text-muted-foreground">
          {t.thanksSub}
        </p>
      </div>
    );
  }

  const err = (k: string) =>
    errors[k] ? <p className="mt-1 text-sm text-destructive">{errors[k]}</p> : null;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4 rounded-xl bg-card p-5 text-card-foreground shadow-xl sm:p-8">
      <div>
        <label htmlFor="nombre" className="mb-1 block text-sm font-bold">{t.nombre}</label>
        <input id="nombre" name="nombre" autoComplete="name" required maxLength={120} className={inputCls} />
        {err("nombre")}
      </div>
      <div>
        <label htmlFor="empresa" className="mb-1 block text-sm font-bold">{t.empresa}</label>
        <input id="empresa" name="empresa" autoComplete="organization" required maxLength={160} className={inputCls} />
        {err("empresa")}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="telefono" className="mb-1 block text-sm font-bold">{t.telefono}</label>
          <input id="telefono" name="telefono" type="tel" inputMode="tel" autoComplete="tel" required maxLength={20} className={inputCls} />
          {err("telefono")}
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-bold">{t.email}</label>
          <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required maxLength={255} className={inputCls} />
          {err("email")}
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-bold">{t.interes}</legend>
        <div className="grid gap-2">
          {INTERESES.map((i, idx) => {
            const checked = intereses.includes(i);
            return (
              <label
                key={i}
                className={`flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm transition ${checked ? "border-primary bg-primary/10" : "border-input"}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => setIntereses((p) => (checked ? p.filter((x) => x !== i) : [...p, i]))}
                  className="h-5 w-5 accent-[var(--primary)]"
                />
                {t.intereses[idx]}
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Honeypot */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Web<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="consentimiento" className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]" />
          <span>
            {t.privA}{" "}
            <Link to="/privacidad" target="_blank" className="font-bold text-primary underline">{t.privLink}</Link>. *
          </span>
        </label>
        {err("consentimiento")}
      </div>

      {serverError && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{serverError}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-6 py-4 text-base font-bold text-accent-foreground shadow-lg transition hover:brightness-105 disabled:opacity-70"
      >
        {status === "sending" && <Loader2 className="h-5 w-5 animate-spin" />}
        {t.submit}
      </button>
      <p className="text-xs text-muted-foreground">
        {t.legal}
      </p>
    </form>
  );
}
