import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Nav } from "@/components/game/Nav";
import { addFriend, avatars, getFriends, removeFriend, type Friend } from "@/lib/profile";

export const Route = createFileRoute("/amici")({
  head: () => ({
    meta: [
      { title: "Amici e sfide — The Gun Game" },
      {
        name: "description",
        content:
          "Aggiungi i tuoi amici, invitali a una sfida a due o gioca subito contro il bot di The Gun Game.",
      },
      { property: "og:title", content: "Amici e sfide — The Gun Game" },
      { property: "og:description", content: "Sfida i tuoi amici a The Gun Game." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Amici,
});

function Amici() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(avatars[1]!);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => setFriends(getFriends()), []);

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-md space-y-6 px-4 py-10">
        <h1 className="text-3xl font-black tracking-tight">Gioca con un amico online</h1>
        <p className="text-sm text-muted-foreground">
          Si gioca solo in due. Cerca un giocatore reale per nickname: se non c'è nessuno
          disponibile, puoi sempre sfidare il bot (che non è un amico, è il computer).
        </p>

        <form
          className="space-y-3 rounded-lg border border-primary/30 bg-card p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!search.trim()) return;
            setSearching(true);
            setSearched(false);
            window.setTimeout(() => {
              setSearching(false);
              setSearched(true);
            }, 900);
          }}
        >
          <input
            value={search}
            maxLength={16}
            onChange={(e) => {
              setSearch(e.target.value);
              setSearched(false);
            }}
            placeholder="Cerca un nickname online"
            className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-primary py-2.5 font-bold uppercase tracking-widest text-primary-foreground"
          >
            {searching ? "Ricerca in corso…" : "Cerca online"}
          </button>
          {searched && (
            <div className="space-y-2 rounded-md border border-foreground/15 bg-background/60 p-3">
              <p className="text-sm text-muted-foreground">Nessun amico trovato al momento.</p>
              <Link
                to="/gioca"
                className="block rounded-md bg-primary/90 py-2 text-center text-xs font-bold uppercase tracking-widest text-primary-foreground"
              >
                Gioca con un bot
              </Link>
            </div>
          )}
        </form>


        <form
          className="space-y-3 rounded-lg border border-foreground/10 bg-card p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            addFriend(name.trim(), avatar);
            setFriends(getFriends());
            setName("");
          }}
        >
          <input
            value={name}
            maxLength={16}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome dell'amico"
            className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 outline-none focus:border-primary"
          />
          <div className="flex flex-wrap gap-2">
            {avatars.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAvatar(a)}
                className={`flex h-10 w-10 items-center justify-center rounded-md border-2 text-xl ${
                  avatar === a ? "border-primary bg-primary/15" : "border-foreground/15"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-primary py-2.5 font-bold uppercase tracking-widest text-primary-foreground"
          >
            Aggiungi amico
          </button>
        </form>

        <div className="space-y-2">
          {friends.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nessun amico in lista. Intanto puoi giocare contro il bot.
            </p>
          )}
          {friends.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 rounded-lg border border-foreground/10 bg-card p-3"
            >
              <span className="text-2xl">{f.avatar}</span>
              <span className="flex-1 font-bold">{f.name}</span>
              <Link
                to="/gioca"
                search={{ avversario: f.name }}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-bold uppercase text-primary-foreground"
              >
                Sfida
              </Link>
              <button
                onClick={() => {
                  removeFriend(f.id);
                  setFriends(getFriends());
                }}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                Rimuovi
              </button>
            </div>
          ))}
        </div>

        <Link
          to="/gioca"
          className="block rounded-md border border-foreground/20 py-3 text-center font-bold uppercase tracking-widest"
        >
          Gioca contro il bot
        </Link>
      </main>
    </div>
  );
}
