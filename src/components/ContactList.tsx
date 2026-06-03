import { useMemo, useState } from "react";
import { AlertTriangle, Mail, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Contact } from "@/types";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

interface ContactListProps {
  contacts: Contact[];
  onSend: (contact: Contact) => void;
}

export function ContactList({ contacts, onSend }: ContactListProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = normalize(search.trim());
    if (!term) return contacts;
    return contacts.filter((c) =>
      normalize(`${c.name} ${c.email} ${c.phone.e164 ?? ""}`).includes(term)
    );
  }, [contacts, search]);

  return (
    <div className="flex h-full flex-col">
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar por nome, email ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ScrollArea className="flex-1 rounded-md border">
        {filtered.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Nenhum contato encontrado.</p>
        ) : (
          <ul className="divide-y">
            {filtered.map((c) => (
              <li key={c.index} className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{c.name}</span>
                    {c.phone.ok ? (
                      <Badge variant="success">{c.phone.display}</Badge>
                    ) : (
                      <Badge variant="warning" className="gap-1">
                        <AlertTriangle className="size-3" /> {c.phone.reason}
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
                  size="sm"
                  disabled={!c.phone.ok}
                  onClick={() => onSend(c)}
                  title={c.phone.ok ? "Abrir WhatsApp com a mensagem" : "Telefone inválido"}
                >
                  <Send className="size-4" /> WhatsApp
                </Button>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}
