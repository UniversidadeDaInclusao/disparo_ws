// ============================================================================
// Integração ao vivo com o Google Drive (somente leitura, sem login)
// ============================================================================
// A pasta é compartilhada por link ("qualquer pessoa com o link pode ver"),
// então acessamos a Drive API v3 apenas com uma API Key — sem autenticação
// de usuário (sem OAuth). Tudo via fetch REST.

import { config } from "@/lib/config";
import type { DriveFile } from "@/types";

const BASE = "https://www.googleapis.com/drive/v3";
const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/** Extrai uma mensagem de erro legível da resposta da API. */
async function readError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    const msg = data?.error?.message;
    if (msg) return `${msg} (HTTP ${res.status})`;
  } catch {
    /* ignora corpo não-JSON */
  }
  if (res.status === 403)
    return "Acesso negado. Verifique se a pasta está compartilhada como 'qualquer pessoa com o link' e se a API Key é válida.";
  if (res.status === 404) return "Pasta ou arquivo não encontrado. Confira o ID da pasta.";
  return `Falha na requisição (HTTP ${res.status}).`;
}

/** Lista os arquivos dentro da pasta configurada. */
export async function listFiles(): Promise<DriveFile[]> {
  const q = `'${config.folderId}' in parents and trashed = false`;
  const params = new URLSearchParams({
    q,
    key: config.apiKey,
    fields: "files(id,name,mimeType,modifiedTime,size)",
    orderBy: "name",
    pageSize: "200",
    supportsAllDrives: "true",
    includeItemsFromAllDrives: "true",
  });
  const res = await fetch(`${BASE}/files?${params.toString()}`);
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as { files?: DriveFile[] };
  return data.files ?? [];
}

/** Baixa um arquivo como ArrayBuffer (exporta XLSX se for Google Sheets). */
export async function downloadAsArrayBuffer(file: DriveFile): Promise<ArrayBuffer> {
  const isNativeSheet = file.mimeType === "application/vnd.google-apps.spreadsheet";
  const params = new URLSearchParams({ key: config.apiKey });
  let url: string;
  if (isNativeSheet) {
    params.set("mimeType", XLSX_MIME);
    url = `${BASE}/files/${file.id}/export?${params.toString()}`;
  } else {
    params.set("alt", "media");
    params.set("supportsAllDrives", "true");
    url = `${BASE}/files/${file.id}?${params.toString()}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(await readError(res));
  return res.arrayBuffer();
}

/** Heurística: o arquivo é uma planilha legível? */
export function isSpreadsheet(file: DriveFile): boolean {
  return (
    file.mimeType === "application/vnd.google-apps.spreadsheet" ||
    file.mimeType === XLSX_MIME ||
    /\.(xlsx|xls|csv)$/i.test(file.name)
  );
}
