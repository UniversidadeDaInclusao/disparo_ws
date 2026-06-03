import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { config } from "@/lib/config";

/** Mostrada quando faltam credenciais nas variáveis de ambiente. */
export function ConfigWarning() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl items-center p-6">
      <Card className="w-full border-amber-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="size-5" /> Configuração necessária
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>
            Defina as variáveis de ambiente em um arquivo{" "}
            <code className="rounded bg-muted px-1">.env</code> na raiz do projeto:
          </p>
          <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
{`VITE_GOOGLE_API_KEY=...
VITE_DRIVE_FOLDER_ID=${config.folderId || "<id-da-pasta>"}`}
          </pre>
          <p className="text-muted-foreground">
            Não há login de usuário: o acesso é feito apenas com a API Key, então a
            pasta do Drive precisa estar compartilhada como{" "}
            <strong>"Qualquer pessoa com o link pode ver"</strong>. Consulte o{" "}
            <strong>README.md</strong> para criar a API Key. Depois reinicie o
            servidor de desenvolvimento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
