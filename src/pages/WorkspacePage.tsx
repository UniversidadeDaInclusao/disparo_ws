import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Download, FileSpreadsheet, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TopBar } from "@/components/TopBar";
import { ContactList } from "@/components/ContactList";
import { MessageComposer, type MessageFormValues } from "@/components/MessageComposer";
import { useDriveFiles, useSheet } from "@/hooks/useDrive";
import { useSentTracker } from "@/hooks/useSentTracker";
import { buildMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { contactKey } from "@/lib/contacts";
import { contactsToCsv, downloadText } from "@/lib/export";
import type { Contact } from "@/types";

const messageSchema = z.object({
  message: z.string().trim().min(1, "Escreva a mensagem antes de enviar."),
});


export function WorkspacePage() {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();

  const { data: files } = useDriveFiles();
  const file = useMemo(() => files?.find((f) => f.id === fileId) ?? null, [files, fileId]);
  const { data: sheet, isLoading, isError, error } = useSheet(file);

  const tracker = useSentTracker(fileId);
  const isContactSent = (c: Contact) => tracker.isSent(contactKey(c));
  const contactSentAt = (c: Contact) => tracker.sentAt(contactKey(c));

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { message: "" },
    mode: "onChange",
  });

  async function handleSend(contact: Contact) {
    const valid = await form.trigger("message");
    if (!valid) {
      toast.error("Escreva a mensagem antes de enviar.");
      return;
    }
    try {
      const finalText = buildMessage(form.getValues("message"), contact);
      const url = buildWhatsAppUrl(contact, finalText);
      window.open(url, "_blank", "noopener");
      tracker.markSent(contactKey(contact));
      toast.success(`WhatsApp aberto para ${contact.name} — marcado como enviado.`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  function handleExport() {
    if (!sheet) return;
    const csv = contactsToCsv(sheet.contacts, { isSent: isContactSent, sentAt: contactSentAt });
    const base = (file?.name ?? "contatos").replace(/\.[^.]+$/, "");
    downloadText(`${base} - envios.csv`, csv);
  }

  function handleReset() {
    if (confirm("Limpar todas as marcações de 'enviado' desta planilha?")) {
      tracker.reset();
      toast.success("Marcações de envio limpas.");
    }
  }

  const validCount = sheet?.contacts.filter((c) => c.phone.ok).length ?? 0;
  const invalidCount = (sheet?.total ?? 0) - validCount;
  const sentCount = sheet?.contacts.filter((c) => isContactSent(c)).length ?? 0;
  const pendingCount = (sheet?.total ?? 0) - sentCount;

  return (
    <>
      <TopBar />
      <main className="container py-6">
        <div className="mb-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/files")}>
            <ArrowLeft className="size-4" /> Voltar
          </Button>
          <div className="flex min-w-0 items-center gap-2">
            <FileSpreadsheet className="size-5 shrink-0 text-green-600" />
            <span className="truncate font-medium">{file?.name ?? "Planilha"}</span>
          </div>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Lendo planilha...</p>}
        {isError && (
          <p className="text-sm text-destructive">
            Erro ao abrir a planilha: {(error as Error).message}
          </p>
        )}

        {sheet && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Composer da mensagem */}
            <Card>
              <CardHeader>
                <CardTitle>Mensagem</CardTitle>
              </CardHeader>
              <CardContent>
                <MessageComposer form={form} headers={sheet.headers} />
              </CardContent>
            </Card>

            {/* Lista de contatos */}
            <Card className="flex flex-col">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Contatos</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleExport}>
                      <Download className="size-4" /> Exportar CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      disabled={sentCount === 0}
                    >
                      <RotateCcw className="size-4" /> Limpar
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">{sentCount} enviados</Badge>
                  <Badge variant="secondary">{pendingCount} pendentes</Badge>
                  <Badge variant="success">{validCount} com telefone válido</Badge>
                  {invalidCount > 0 && <Badge variant="warning">{invalidCount} com problema</Badge>}
                </div>
              </CardHeader>
              <CardContent className="flex h-[60vh] flex-col">
                <ContactList
                  contacts={sheet.contacts}
                  onSend={handleSend}
                  isSent={isContactSent}
                  sentAt={contactSentAt}
                  onToggleSent={(c) => tracker.toggle(contactKey(c))}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </>
  );
}
