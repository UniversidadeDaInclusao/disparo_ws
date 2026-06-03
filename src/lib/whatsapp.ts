// Montagem da mensagem e do link do WhatsApp.

import type { Contact } from "@/types";

/** Normaliza um texto para comparar tokens/cabeçalhos (sem acento, minúsculo). */
function norm(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Atalhos sempre disponíveis, além das colunas reais da planilha. */
const ALIASES: Record<string, (c: Contact) => string> = {
  nome: (c) => c.name,
  primeiro_nome: (c) => c.name.split(/\s+/)[0] || c.name,
  email: (c) => c.email,
};

/** Resolve o valor de um token (conteúdo entre {{ }}) para um contato. */
function resolveToken(rawKey: string, contact: Contact): string | null {
  const key = norm(rawKey);
  const alias = ALIASES[key];
  if (alias) return alias(contact);

  const hit = Object.entries(contact.fields).find(([header]) => norm(header) === key);
  if (hit) return hit[1] ?? "";

  return null;
}

/** Substitui {{coluna}} pelos dados do contato. Tokens desconhecidos ficam como estão. */
export function buildMessage(template: string, contact: Contact): string {
  return template.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (full, rawKey: string) => {
    const value = resolveToken(rawKey, contact);
    return value ?? full;
  });
}

/** Gera o link wa.me já com número e texto. Abre o WhatsApp local/web. */
export function buildWhatsAppUrl(contact: Contact, message: string): string {
  if (!contact.phone.ok || !contact.phone.e164) {
    throw new Error("Contato sem telefone válido.");
  }
  return `https://wa.me/${contact.phone.e164}?text=${encodeURIComponent(message)}`;
}
