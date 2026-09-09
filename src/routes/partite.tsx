import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Nav } from "@/components/game/Nav";
import { getHistory, type MatchRecord } from "@/lib/profile";
import { tesseraImg } from "@/lib/cards";

export const Route = createFileRoute("/partite")({
  head: () => ({
    meta: [
      { title: "Le tue partite — The Gun Game" },
      {
        name: "description",
        content:
          "Rivedi le partite giocate a The Gun Game: caricatori completati, vittorie e K.O. con la carta The Gun.",
      },
      { property: "og:title", content: "Le tue partite — The Gun Game" },
      { property: "og:description", content: "Lo storico delle tue sfide a The Gun Game." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Partite,
});

function Partite() {
  const [list, setList] = useState<MatchRecord[]>([]);
  useEffect(() => setList(getHistory()), []);

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-xl space-y-4 px-4 py-10">
        <h1 className="text-3xl font-black tracking-tight">Partite giocate</h1>
        {list.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Non hai ancora giocato nessuna partita.{" "}
            <Link to="/gioca" className="text-primary underline">
              Inizia adesso
            </Link>
            .
          </p>
        )}
        {list.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-3 rounded-lg border border-foreground/10 bg-card p-4"
          >
            <span
              className={`w-24 text-sm font-black uppercase ${
                m.result === "win"
                  ? "text-primary"
                  : m.result === "lose"
                    ? "text-muted-foreground"
                    : "text-accent"
              }`}
            >
              {m.result === "win" ? "Vittoria" : m.result === "lose" ? "Sconfitta" : "Pareggio"}
            </span>
            <div className="flex-1">
              <p className="font-bold">vs {m.opponent}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(m.date).toLocaleString("it-IT")}
                {m.byGun ? " · K.O. con The Gun" : ""}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <img src={tesseraImg} alt="Caricatori completati" className="h-6 w-6 object-contain" />
              <span className="text-sm font-black">
                {m.magazines}–{m.oppMagazines}
              </span>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
