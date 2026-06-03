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
  let message = "";
  let reason = "";
  try {
    const data = await res.json();
    message = data?.error?.message ?? "";
    reason = data?.error?.errors?.[0]?.reason ?? data?.error?.status ?? "";
  } catch {
    /* corpo não-JSON */
  }

  // Dicas acionáveis para os motivos mais comuns de 403/400.
  const hints: Record<string, string> = {
    accessNotConfigured:
      "A Google Drive API não está ativada neste projeto do Google Cloud. Ative em 'APIs e serviços > Biblioteca'.",
    ipRefererBlocked:
      "A API Key está restrita por 'Referenciadores HTTP' e este endereço não está liberado. Adicione, por ex., http://localhost:5173/* nas restrições da chave.",
    forbidden:
      "Acesso negado. Confirme se a pasta está compartilhada como 'Qualquer pessoa com o link pode ver'.",
    keyInvalid: "A API Key é inválida. Verifique o valor de VITE_GOOGLE_API_KEY.",
    dailyLimitExceededUnreg: "Sem identidade válida. Verifique a API Key.",
    notFound: "Pasta/arquivo não encontrado. Confira o VITE_DRIVE_FOLDER_ID.",
  };

  const hint = hints[reason];
  const base = message || `Falha na requisição (HTTP ${res.status}).`;
  return [base, reason ? `[${reason}]` : "", hint ? `— ${hint}` : ""].filter(Boolean).join(" ");
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
