// Configuração lida das variáveis de ambiente do Vite (.env).
// Sem autenticação de usuário: usamos apenas a API Key para ler a pasta
// pública do Google Drive.

export const config = {
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY ?? "",
  folderId: import.meta.env.VITE_DRIVE_FOLDER_ID ?? "",
} as const;

export function isConfigured(): boolean {
  return Boolean(config.apiKey && config.folderId);
}
