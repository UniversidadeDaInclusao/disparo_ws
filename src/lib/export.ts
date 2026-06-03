import type { Contact } from "@/types";

function csvCell(value: string): string {
  if (/[",\n;]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export interface ExportRowMeta {
  isSent: (c: Contact) => boolean;
  sentAt: (c: Contact) => number | undefined;
}

/** Gera o conteúdo CSV dos contatos com a coluna de controle "Enviado". */
export function contactsToCsv(contacts: Contact[], meta: ExportRowMeta): string {
  const header = ["Nome", "Email", "Telefone", "Enviado", "Data do envio"];
  const lines = contacts.map((c) => {
    const ts = meta.sentAt(c);
    return [
      c.name,
      c.email,
      c.phone.e164 ?? String(c.rawPhone ?? ""),
      meta.isSent(c) ? "sim" : "não",
      ts ? new Date(ts).toLocaleString("pt-BR") : "",
    ]
      .map((v) => csvCell(String(v)))
      .join(",");
  });
  return [header.join(","), ...lines].join("\n");
}

/** Dispara o download de um texto como arquivo. */
export function downloadText(filename: string, text: string, mime = "text/csv;charset=utf-8") {
  // BOM para o Excel reconhecer acentos em UTF-8.
  const blob = new Blob(["﻿", text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
