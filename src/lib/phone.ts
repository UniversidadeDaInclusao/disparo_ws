// ============================================================================
// Normalização de números de telefone (foco: Brasil)
// ============================================================================
// A planilha guarda os telefones de forma inconsistente: alguns como número
// (que o Excel mostra em notação científica, ex.: 5.582E+12), outros só com
// DDD + número, outros já com o 55 na frente, e alguns vazios "(none)".
//
// Recebe o valor cru de uma célula e devolve um número E.164 sem o "+"
// (ex.: "5581994384185"), pronto para o link do wa.me.

import type { NormalizedPhone } from "@/types";

const BR_COUNTRY_CODE = "55";

/** Extrai apenas os dígitos relevantes de qualquer valor de célula. */
export function onlyDigits(value: unknown): string {
  if (value === null || value === undefined) return "";
  let s = String(value).trim();
  if (!s || s.toLowerCase() === "(none)") return "";
  s = s.replace(/\D/g, "");
  s = s.replace(/^0+/, ""); // remove zeros à esquerda (ex.: "081...")
  return s;
}

/** Deixa o número mais legível: +55 (81) 99438-4185 */
export function formatBR(e164: string | null): string {
  if (!e164 || !e164.startsWith(BR_COUNTRY_CODE)) return e164 ?? "";
  const rest = e164.slice(2);
  const ddd = rest.slice(0, 2);
  const num = rest.slice(2);
  if (num.length === 9) return `+55 (${ddd}) ${num.slice(0, 5)}-${num.slice(5)}`;
  if (num.length === 8) return `+55 (${ddd}) ${num.slice(0, 4)}-${num.slice(4)}`;
  return `+55 (${ddd}) ${num}`;
}

function ok(e164: string, original: unknown): NormalizedPhone {
  return { ok: true, e164, display: formatBR(e164), reason: null, original };
}

/** Normaliza um telefone brasileiro para E.164 (sem "+"). */
export function normalizeBR(rawValue: unknown): NormalizedPhone {
  const original = rawValue;
  const digits = onlyDigits(rawValue);

  if (!digits) {
    return { ok: false, e164: null, display: "—", reason: "Sem telefone", original };
  }

  // Já tem código do país (55) + DDD + número (12 ou 13 dígitos).
  if (digits.startsWith(BR_COUNTRY_CODE) && (digits.length === 12 || digits.length === 13)) {
    return ok(digits, original);
  }

  // Local: DDD (2) + número (8 fixo ou 9 celular) => 10 ou 11 dígitos.
  if (digits.length === 10 || digits.length === 11) {
    return ok(BR_COUNTRY_CODE + digits, original);
  }

  // Número curto demais (provável perda por notação científica na planilha).
  if (digits.length < 10) {
    return {
      ok: false,
      e164: null,
      display: digits,
      reason: "Telefone incompleto (provável erro de formatação na planilha)",
      original,
    };
  }

  // Comprimento atípico (14+): aceitamos com aviso se começar com 55.
  if (digits.startsWith(BR_COUNTRY_CODE)) {
    return { ...ok(digits, original), reason: "Comprimento atípico — confira o número" };
  }

  return {
    ok: false,
    e164: null,
    display: digits,
    reason: "Formato de telefone não reconhecido",
    original,
  };
}
