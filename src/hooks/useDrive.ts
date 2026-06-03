import { useQuery } from "@tanstack/react-query";
import * as drive from "@/lib/drive";
import { parseSheet } from "@/lib/sheet";
import type { DriveFile, ParsedSheet } from "@/types";

/** Lista os arquivos da pasta configurada. */
export function useDriveFiles() {
  return useQuery<DriveFile[]>({
    queryKey: ["drive-files"],
    queryFn: drive.listFiles,
    staleTime: 60_000,
  });
}

/** Baixa e interpreta uma planilha específica. */
export function useSheet(file: DriveFile | null) {
  return useQuery<ParsedSheet>({
    queryKey: ["sheet", file?.id],
    queryFn: async () => {
      if (!file) throw new Error("Nenhum arquivo selecionado.");
      const buffer = await drive.downloadAsArrayBuffer(file);
      return parseSheet(buffer);
    },
    enabled: Boolean(file),
    staleTime: 5 * 60_000,
  });
}
