import { z } from "zod";

export const INTERESES = [
  "Energía solar / Fotovoltaica flotante",
  "Eficiencia energética y bombeo",
  "Certificados de Ahorro Energético (CAE)",
  "Asesoramiento general",
] as const;

export const CAMPANA = "ACATCOR";

const utm = z.string().trim().max(200).optional().nullable();

export const leadSchema = z.object({
  nombre: z.string().trim().min(2, "Indica tu nombre y apellidos").max(120),
  empresa: z.string().trim().min(2, "Indica tu comunidad o empresa").max(160),
  telefono: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s().-]{9,20}$/, "Introduce un teléfono válido"),
  email: z.string().trim().email("Introduce un email válido").max(255),
  intereses: z.array(z.enum(INTERESES)).max(INTERESES.length).default([]),
  consentimiento: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar la política de privacidad" }),
  }),
  utm_source: utm,
  utm_medium: utm,
  utm_campaign: utm,
  utm_term: utm,
  utm_content: utm,
  // Antispam: honeypot must be empty, form must take at least 2s to fill
  website: z.string().max(0).optional().default(""),
  elapsedMs: z.number().min(2000),
});

export type LeadInput = z.input<typeof leadSchema>;
