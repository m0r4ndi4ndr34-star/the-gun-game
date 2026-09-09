import { useState } from "react";

export type ChatMessage = { id: string; from: "me" | "them" | "system"; text: string };

export function ChatPanel({
  messages,
  onSend,
  opponent,
}: {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  opponent: string;
}) {
  const [text, setText] = useState("");
  return (
    <div className="flex h-full flex-col rounded-lg border border-foreground/15 bg-black/50">
      <div className="border-b border-foreground/15 px-3 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Chat con {opponent}
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground">Scrivi qualcosa al tuo avversario…</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={
              m.from === "system"
                ? "text-center text-xs italic text-muted-foreground"
                : m.from === "me"
                  ? "ml-auto w-fit max-w-[85%] rounded-lg bg-primary px-3 py-1.5 text-primary-foreground"
                  : "w-fit max-w-[85%] rounded-lg bg-foreground/10 px-3 py-1.5 text-foreground"
            }
          >
            {m.text}
          </div>
        ))}
      </div>
      <form
        className="flex gap-2 border-t border-foreground/15 p-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          onSend(text.trim());
          setText("");
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Messaggio…"
          className="min-w-0 flex-1 rounded-md border border-foreground/20 bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground"
        >
          Invia
        </button>
      </form>
    </div>
  );
}
