import type { Contact } from "@/types";

/**
 * Chave estável para identificar um contato no controle de "enviados".
 * Preferimos o telefone normalizado; senão e-mail; senão o índice na planilha.
 */
export function contactKey(c: Contact): string {
  return c.phone.e164 || c.email || `idx:${c.index}`;
}
