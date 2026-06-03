// ============================================================================
// Leitura e interpretação da planilha (via SheetJS)
// ============================================================================
// Recebe um ArrayBuffer (xlsx/csv), extrai a primeira aba, detecta as colunas
// de Nome / Email / Telefone e devolve os contatos com o telefone normalizado.

import * as XLSX from "xlsx";
import { normalizeBR } from "@/lib/phone";
import type { Contact, ParsedSheet } from "@/types";

/** Remove acentos e baixa caixa, para comparar cabeçalhos. */
function norm(s: unknown): string {
  return String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Acha o índice de uma coluna pelo cabeçalho. */
function findColumn(headers: unknown[], candidates: string[]): number {
  for (let i = 0; i < headers.length; i++) {
    const h = norm(headers[i]);
    if (candidates.some((c) => h.includes(c))) return i;
  }
  return -1;
}

export function parseSheet(arrayBuffer: ArrayBuffer): ParsedSheet {
  const wb = XLSX.read(arrayBuffer, { type: "array" });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];

  // raw:true preserva os números crus do telefone (sem virar científico).
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    raw: true,
    defval: "",
  });

  if (!rows.length) {
    return { contacts: [], columns: {}, total: 0, sheetName };
  }

  const headers = rows[0];
  const colName = findColumn(headers, ["comprad", "nome", "name"]);
  const colEmail = findColumn(headers, ["email", "e-mail"]);
  const colPhone = findColumn(headers, ["telefone", "fone", "phone", "celular", "whats"]);

  const contacts: Contact[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.every((c) => c === "" || c === null || c === undefined)) continue;

    const name = colName >= 0 ? String(row[colName] ?? "").trim() : "";
    const email = colEmail >= 0 ? String(row[colEmail] ?? "").trim() : "";
    const rawPhone = colPhone >= 0 ? row[colPhone] : "";
    const phone = normalizeBR(rawPhone);

    if (!name && !email && !phone.ok) continue;

    contacts.push({
      index: contacts.length,
      name: name || "(sem nome)",
      email,
      rawPhone,
      phone,
    });
  }

  return {
    contacts,
    columns: {
      name: colName >= 0 ? String(headers[colName]) : undefined,
      email: colEmail >= 0 ? String(headers[colEmail]) : undefined,
      phone: colPhone >= 0 ? String(headers[colPhone]) : undefined,
    },
    total: contacts.length,
    sheetName,
  };
}
