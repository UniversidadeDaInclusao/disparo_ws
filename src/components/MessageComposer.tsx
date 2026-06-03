import { useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import { GripVertical, Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface MessageFormValues {
  message: string;
}

interface MessageComposerProps {
  form: UseFormReturn<MessageFormValues>;
  /** Cabeçalhos reais da planilha, oferecidos como variáveis. */
  headers: string[];
}

/** Atalhos úteis que não são colunas da planilha. */
const SPECIALS = [
  { token: "{{primeiro_nome}}", label: "Primeiro nome" },
  { token: "{{nome}}", label: "Nome completo" },
];

export function MessageComposer({ form, headers }: MessageComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { ref: rhfRef, ...rhfRest } = form.register("message");
  const message = form.watch("message");

  /** Insere um token na posição atual do cursor (ou do ponto de soltar). */
  function insertToken(token: string) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const next = el.value.slice(0, start) + token + el.value.slice(end);

    form.setValue("message", next, { shouldDirty: true, shouldValidate: true });

    // Reposiciona o cursor logo após o token inserido.
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });
  }

  function handleDrop(e: React.DragEvent<HTMLTextAreaElement>) {
    const token = e.dataTransfer.getData("text/plain");
    if (!token) return;
    e.preventDefault();
    // Em navegadores baseados em Chromium o cursor acompanha o arraste,
    // então selectionStart já aponta para o local de soltar.
    insertToken(token);
  }

  const chips: { token: string; label: string }[] = [
    ...SPECIALS,
    ...headers.map((h) => ({ token: `{{${h}}}`, label: h })),
  ];

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_220px]">
      {/* Campo de texto */}
      <div className="space-y-2">
        <Label htmlFor="message">Texto que será enviado</Label>
        <Textarea
          id="message"
          rows={12}
          placeholder={"Olá {{primeiro_nome}}, tudo bem?\n\nArraste os campos ao lado para dentro do texto..."}
          ref={(el) => {
            rhfRef(el);
            textareaRef.current = el;
          }}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          {...rhfRest}
        />
        <div className="flex items-center justify-between text-xs">
          <span className="text-destructive">{form.formState.errors.message?.message ?? ""}</span>
          <span className="text-muted-foreground">{message.length} caracteres</span>
        </div>
      </div>

      {/* Paleta de variáveis */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1">
          <Info className="size-3" /> Campos da planilha
        </Label>
        <p className="text-xs text-muted-foreground">
          Arraste para dentro da mensagem (ou clique para inserir no cursor).
        </p>
        <div className="flex flex-wrap gap-2 rounded-md border bg-muted/40 p-2">
          {chips.map((chip) => (
            <button
              key={chip.token}
              type="button"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", chip.token);
                e.dataTransfer.effectAllowed = "copy";
              }}
              onClick={() => insertToken(chip.token)}
              title={`Inserir ${chip.token}`}
              className={cn(
                "inline-flex max-w-full items-center gap-1 rounded-md border bg-background px-2 py-1",
                "cursor-grab text-xs font-medium shadow-sm transition-colors",
                "hover:border-primary hover:bg-primary/10 active:cursor-grabbing"
              )}
            >
              <GripVertical className="size-3 shrink-0 text-muted-foreground" />
              <span className="truncate">{chip.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
