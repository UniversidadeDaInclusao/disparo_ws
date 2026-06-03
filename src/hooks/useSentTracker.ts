import { useCallback, useEffect, useState } from "react";

/** Mapa de chave-do-contato -> timestamp (ms) do envio. */
export type SentRecord = Record<string, number>;

function storageKey(fileId: string): string {
  return `disparo-ws:sent:${fileId}`;
}

/**
 * Controla, por planilha (fileId), quais contatos já tiveram a mensagem
 * enviada. Persiste em localStorage — não há login nem escrita no Drive,
 * então o registro fica no navegador.
 */
export function useSentTracker(fileId: string | undefined) {
  const [sent, setSent] = useState<SentRecord>({});

  useEffect(() => {
    if (!fileId) {
      setSent({});
      return;
    }
    try {
      const raw = localStorage.getItem(storageKey(fileId));
      setSent(raw ? (JSON.parse(raw) as SentRecord) : {});
    } catch {
      setSent({});
    }
  }, [fileId]);

  const update = useCallback(
    (fn: (prev: SentRecord) => SentRecord) => {
      setSent((prev) => {
        const next = fn(prev);
        if (fileId) {
          try {
            localStorage.setItem(storageKey(fileId), JSON.stringify(next));
          } catch {
            /* armazenamento indisponível — segue só em memória */
          }
        }
        return next;
      });
    },
    [fileId]
  );

  const markSent = useCallback(
    (key: string) => update((p) => ({ ...p, [key]: Date.now() })),
    [update]
  );

  const unmark = useCallback(
    (key: string) =>
      update((p) => {
        const next = { ...p };
        delete next[key];
        return next;
      }),
    [update]
  );

  const toggle = useCallback(
    (key: string) =>
      update((p) => {
        if (key in p) {
          const next = { ...p };
          delete next[key];
          return next;
        }
        return { ...p, [key]: Date.now() };
      }),
    [update]
  );

  const reset = useCallback(() => update(() => ({})), [update]);

  const isSent = useCallback((key: string) => key in sent, [sent]);
  const sentAt = useCallback((key: string): number | undefined => sent[key], [sent]);

  return { sent, isSent, sentAt, markSent, unmark, toggle, reset };
}
