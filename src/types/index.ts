export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
}

export interface NormalizedPhone {
  ok: boolean;
  e164: string | null;
  display: string;
  reason: string | null;
  original: unknown;
}

export interface Contact {
  index: number;
  name: string;
  email: string;
  rawPhone: unknown;
  phone: NormalizedPhone;
  /** Todos os valores da linha, indexados pelo cabeçalho da coluna. */
  fields: Record<string, string>;
}

export interface ParsedSheet {
  contacts: Contact[];
  columns: {
    name?: string;
    email?: string;
    phone?: string;
  };
  /** Cabeçalhos das colunas da planilha (na ordem original). */
  headers: string[];
  total: number;
  sheetName: string;
}
