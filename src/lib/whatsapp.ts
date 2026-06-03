// Montagem da mensagem e do link do WhatsApp.

import type { Contact } from "@/types";

/** Substitui variáveis do template pelos dados do contato. */
export function buildMessage(template: string, contact: Contact): string {
  const firstName = contact.name.split(/\s+/)[0] || contact.name;
  return template
    .replace(/\{\{\s*nome\s*\}\}/gi, contact.name)
    .replace(/\{\{\s*primeiro_nome\s*\}\}/gi, firstName)
    .replace(/\{\{\s*email\s*\}\}/gi, contact.email || "");
}

/** Gera o link wa.me já com número e texto. Abre o WhatsApp local/web. */
export function buildWhatsAppUrl(contact: Contact, message: string): string {
  if (!contact.phone.ok || !contact.phone.e164) {
    throw new Error("Contato sem telefone válido.");
  }
  return `https://wa.me/${contact.phone.e164}?text=${encodeURIComponent(message)}`;
}
