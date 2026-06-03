import { useMemo, useState } from "react";
import { AlertTriangle, Check, Mail, Search, Send, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Contact } from "@/types";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function formatSentAt(ts: number): string {
  return new Date(ts).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type FilterKey = "all" | "pending" | "sent";

interface ContactListProps {
  contacts: Contact[];
  onSend: (contact: Contact) => void;
  isSent: (contact: Contact) => boolean;
  sentAt: (contact: Contact) => number | undefined;
  onToggleSent: (contact: Contact) => void;
}

export function ContactList({ contacts, onSend, isSent, sentAt, onToggleSent }: ContactListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    const term = normalize(search.trim());
    return contacts.filter((c) => {
      if (filter === "sent" && !isSent(c)) return false;
      if (filter === "pending" && isSent(c)) return false;
      if (!term) return true;
      return normalize(`${c.name} ${c.email} ${c.phone.e164 ?? ""}`).includes(term);
    });
  }, [contacts, search, filter, isSent]);

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "pending", label: "Pendentes" },
    { key: "sent", label: "Enviados" },
  ];

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar por nome, email ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-1">
        {filters.map((f) => (
          <Button
            key={f.key}
            size="sm"
            variant={filter === f.key ? "default" : "outline"}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <ScrollArea className="flex-1 rounded-md border">
        {filtered.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Nenhum contato encontrado.</p>
        ) : (
          <ul className="divide-y">
            {filtered.map((c) => {
              const sent = isSent(c);
              const ts = sentAt(c);
              return (
                <li
                  key={c.index}
                  className={cn("flex items-center gap-3 p-3", sent && "bg-green-50/60")}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-medium">{c.name}</span>
                      {c.phone.ok ? (
                        <Badge variant="success">{c.phone.display}</Badge>
                      ) : (
                        <Badge variant="warning" className="gap-1">
                          <AlertTriangle className="size-3" /> {c.phone.reason}
                        </Badge>
                      )}
                      {sent && (
                        <Badge variant="default" className="gap-1">
                          <Check className="size-3" />
                          Enviado{ts ? ` · ${formatSentAt(ts)}` : ""}
                        </Badge>
                      )}
                    </div>
                    {c.email && (
                      <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <Mail className="size-3" /> {c.email}
                      </span>
                    )}
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onToggleSent(c)}
                    title={sent ? "Desmarcar como enviado" : "Marcar como enviado"}
                  >
                    {sent ? <Undo2 className="size-4" /> : <Check className="size-4" />}
                  </Button>

                  <Button
                    size="sm"
                    variant={sent ? "outline" : "default"}
                    disabled={!c.phone.ok}
                    onClick={() => onSend(c)}
                    title={c.phone.ok ? "Abrir WhatsApp com a mensagem" : "Telefone inválido"}
                  >
                    <Send className="size-4" /> WhatsApp
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}
