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
}

export interface ParsedSheet {
  contacts: Contact[];
  columns: {
    name?: string;
    email?: string;
    phone?: string;
  };
  total: number;
  sheetName: string;
}
