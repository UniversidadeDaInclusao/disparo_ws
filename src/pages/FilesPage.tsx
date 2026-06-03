import { useNavigate } from "react-router-dom";
import { FileSpreadsheet, FileX2, FolderOpen, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TopBar } from "@/components/TopBar";
import { useDriveFiles } from "@/hooks/useDrive";
import { isSpreadsheet } from "@/lib/drive";

export function FilesPage() {
  const navigate = useNavigate();
  const { data: files, isLoading, isError, error, refetch, isFetching } = useDriveFiles();

  return (
    <>
      <TopBar />
      <main className="container max-w-2xl py-8">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="size-5 text-primary" />
              Arquivos da pasta
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={isFetching ? "size-4 animate-spin" : "size-4"} />
              Atualizar
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading && <p className="text-sm text-muted-foreground">Carregando arquivos...</p>}
            {isError && (
              <p className="text-sm text-destructive">
                Erro ao listar arquivos: {(error as Error).message}
              </p>
            )}
            {files && files.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum arquivo nesta pasta.</p>
            )}
            {files && files.length > 0 && (
              <ScrollArea className="max-h-[60vh]">
                <ul className="divide-y">
                  {files.map((file) => {
                    const sheet = isSpreadsheet(file);
                    return (
                      <li key={file.id} className="flex items-center gap-3 py-3">
                        {sheet ? (
                          <FileSpreadsheet className="size-5 shrink-0 text-green-600" />
                        ) : (
                          <FileX2 className="size-5 shrink-0 text-muted-foreground" />
                        )}
                        <span className="flex-1 truncate text-sm" title={file.name}>
                          {file.name}
                        </span>
                        <Button
                          size="sm"
                          disabled={!sheet}
                          onClick={() => navigate(`/files/${file.id}`)}
                          title={sheet ? "Abrir planilha" : "Não é uma planilha"}
                        >
                          Abrir
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
